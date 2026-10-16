import { normalizeText } from './normalizer';
import { detectIntents, getPrimaryIntent, IntentMatch } from './intentDetector';
import { extractEntities, mergeEntitiesIntoProfile, ExtractedEntities } from './entityExtractor';
import { recommendCourses, CourseMatch } from './courseRecommender';
import { calculateLeadScore } from './leadScorer';
import { renderTemplate } from './responseTemplates';
import { StudentProfile, Course, Lead, DecisionTrace, LeadStage, Language, IntentType } from '../db/types';
import { executeLLMFallback, getLLMConfig, cleanResponseText } from './llmFallback';

export interface EngineInput {
  message: string;
  lead: Lead;
  courses: Course[];
  conversationHistory: string[];
}

export interface EngineOutput {
  responseText: string;
  templateId: string;
  updatedProfile: Partial<StudentProfile>;
  decisionTrace: DecisionTrace;
  followUpTrigger?: {
    triggerCondition: string;
    messageTemplate: string;
    delayHours: number;
  };
  shouldHandOff: boolean;
  handOffReason?: string;
  recommendedCourseIds?: string[];
}

// Priority-ordered rule registry
interface EngineRule {
  id: string;
  description: string;
  priority: number;
  condition: (
    primaryIntent: IntentType,
    allIntents: IntentMatch[],
    profile: StudentProfile,
    entities: ExtractedEntities,
    normalized: string
  ) => boolean;
  action: (
    primaryIntent: IntentType,
    profile: StudentProfile,
    entities: ExtractedEntities,
    courses: Course[],
    courseMatches: CourseMatch[]
  ) => {
    templateId: string;
    profileUpdates: Partial<StudentProfile>;
    followUpTrigger?: { triggerCondition: string; messageTemplate: string; delayHours: number };
    shouldHandOff?: boolean;
    handOffReason?: string;
  };
}

const RULES: EngineRule[] = [
  // P1: Complaints and human escalation
  {
    id: 'RULE_ESCALATE_COMPLAINT',
    description: 'Complaint with high urgency triggers human handoff',
    priority: 1,
    condition: (intent, all) => intent === 'complaint' || all.some(i => i.intent === 'complaint' && i.confidence > 0.5),
    action: (_, profile) => ({
      templateId: 'TPL_HUMAN_HANDOFF_COMPLAINT',
      profileUpdates: { humanHandoff: true, handoffReason: 'Student raised a complaint requiring human review.', leadStage: 'Human Review Required' },
      shouldHandOff: true,
      handOffReason: 'Complaint escalation',
      followUpTrigger: {
        triggerCondition: 'complaint_escalation',
        messageTemplate: 'Urgent: Student raised a complaint. Please follow up immediately.',
        delayHours: 0
      }
    })
  },
  {
    id: 'RULE_HUMAN_COUNSELLOR_REQUEST',
    description: 'Explicit request for human counsellor',
    priority: 1,
    condition: (intent) => intent === 'human_counsellor_request',
    action: (_, profile) => ({
      templateId: 'TPL_HUMAN_HANDOFF_REQUEST',
      profileUpdates: { humanHandoff: true, handoffReason: 'Student explicitly requested a human counsellor.', leadStage: 'Human Review Required' },
      shouldHandOff: true,
      handOffReason: 'User-requested human handoff',
      followUpTrigger: {
        triggerCondition: 'counsellor_requested',
        messageTemplate: 'Student requested to speak with a human counsellor. Please join the conversation.',
        delayHours: 0
      }
    })
  },

  // P2: Opt-out / rejection
  {
    id: 'RULE_OPT_OUT',
    description: 'Student signals they are no longer interested',
    priority: 2,
    condition: (intent, _, profile, entities, text) =>
      intent === 'rejection' && (text.includes('not interested') || text.includes('stop') || text.includes('remove') || text.includes('unsubscribe') || text.includes('opt out')),
    action: () => ({
      templateId: 'TPL_REJECTION_OPT_OUT',
      profileUpdates: { leadStage: 'Not Interested', pendingAction: undefined }
    })
  },

  // P3: Course recommendation (enough context present)
  {
    id: 'RULE_COURSE_RECOMMENDATION',
    description: 'Student has enough context for course recommendations',
    priority: 3,
    condition: (intent, all, profile) =>
      (intent === 'course_recommendation' || all.some(i => i.intent === 'course_recommendation')) &&
      !!(profile.examTarget || profile.academicLevel || profile.courseInterest),
    action: (_, profile, __, courses, courseMatches) => {
      if (courseMatches.length > 0) {
        return {
          templateId: 'TPL_COURSE_RECOMMENDATION',
          profileUpdates: {}
        };
      }
      return {
        templateId: 'TPL_COURSE_NO_MATCH',
        profileUpdates: {}
      };
    }
  },

  // P4: Campus visit
  {
    id: 'RULE_CAMPUS_VISIT_BOOKING',
    description: 'Student requests a campus visit',
    priority: 4,
    condition: (intent) => intent === 'campus_visit_request',
    action: (_, profile) => ({
      templateId: 'TPL_VISIT_RECORDED',
      profileUpdates: { leadStage: 'Visit Pending Confirmation', pendingAction: 'awaiting_visit_confirmation' },
      followUpTrigger: {
        triggerCondition: 'visit_request',
        messageTemplate: `Hi ${profile.name || 'there'}! Just a reminder about your demo visit at TechSummitTrainers (FC Road center). Let us know if you need directions or want to reschedule!`,
        delayHours: 24
      }
    })
  },

  // P5: Counselling appointment
  {
    id: 'RULE_COUNSELLING_APPOINTMENT',
    description: 'Student wants a counselling session',
    priority: 5,
    condition: (intent) => intent === 'counselling_appointment',
    action: (_, profile) => ({
      templateId: 'TPL_COUNSELLING_BOOKED',
      profileUpdates: {
        leadStage: 'Counselling Requested',
        counsellingSlot: profile.counsellingSlot || 'Next available slot (to be confirmed)',
        pendingAction: 'counsellor_reminder_due'
      },
      followUpTrigger: {
        triggerCondition: 'counselling_booked',
        messageTemplate: `Hi ${profile.name || 'there'}! This is a reminder about your upcoming counselling session with TechSummitTrainers.`,
        delayHours: 2
      }
    })
  },

  // P6: Callback request
  {
    id: 'RULE_CALLBACK_REQUEST',
    description: 'Student wants a callback',
    priority: 6,
    condition: (intent) => intent === 'follow_up_request',
    action: (_, profile) => ({
      templateId: 'TPL_CALLBACK_NOTED',
      profileUpdates: { pendingAction: 'callback_pending' },
      followUpTrigger: {
        triggerCondition: 'callback_requested',
        messageTemplate: `Callback reminder: ${profile.name || 'Student'} requested a callback. Please call ${profile.phone || 'their registered number'}.`,
        delayHours: 1
      }
    })
  },

  // P7: Greeting with profile capture
  {
    id: 'RULE_GREETING_WITH_PROFILE',
    description: 'Greeting with student info - personalized welcome',
    priority: 7,
    condition: (intent, all, profile, entities) =>
      (intent === 'greeting' || intent === 'student_profile_info') &&
      !!(entities.name || entities.examTarget || entities.academicLevel),
    action: (_, profile, entities) => {
      const examTarget = entities.examTarget || profile.examTarget;
      const level = entities.academicLevel || profile.academicLevel;

      if (examTarget?.toLowerCase().includes('jee') && level?.includes('12')) return { templateId: 'TPL_JEE_CLASS12_WELCOME', profileUpdates: {} };
      if (examTarget?.toLowerCase().includes('jee') && level?.includes('11')) return { templateId: 'TPL_JEE_CLASS11_WELCOME', profileUpdates: {} };
      if (examTarget?.toLowerCase().includes('neet')) return { templateId: 'TPL_NEET_WELCOME', profileUpdates: {} };
      if (examTarget?.toLowerCase().includes('cet') || examTarget?.toLowerCase().includes('mht')) return { templateId: 'TPL_CET_WELCOME', profileUpdates: {} };
      if (examTarget?.toLowerCase().includes('ielts') || examTarget?.toLowerCase().includes('abroad')) return { templateId: 'TPL_ABROAD_WELCOME', profileUpdates: {} };
      return { templateId: 'TPL_GREETING', profileUpdates: {} };
    }
  },

  // P8: Greeting without profile
  {
    id: 'RULE_GREETING_BARE',
    description: 'Simple greeting with no profile info',
    priority: 8,
    condition: (intent, _, profile, entities) =>
      intent === 'greeting' && !entities.examTarget && !entities.academicLevel && !profile.examTarget,
    action: () => ({ templateId: 'TPL_GREETING', profileUpdates: {} })
  },

  // P8.5: Technical / Software course enquiry (Full Stack, Python, Web Dev)
  {
    id: 'RULE_TECHNICAL_COURSE_ENQUIRY',
    description: 'Full Stack Web Development, Python or software engineering course enquiry',
    priority: 8.5,
    condition: (intent, all, profile, entities, text) => {
      const lower = text.toLowerCase();
      return (
        entities.courseInterest?.toLowerCase().includes('full stack') ||
        entities.courseInterest?.toLowerCase().includes('python') ||
        lower.includes('full stack') ||
        lower.includes('fullstack') ||
        lower.includes('web dev') ||
        lower.includes('coding') ||
        lower.includes('software') ||
        lower.includes('mern')
      );
    },
    action: (_, profile, entities, courses) => {
      const techCourse = courses.find(c =>
        c.category.toLowerCase().includes('technical') ||
        c.category.toLowerCase().includes('software') ||
        c.name.toLowerCase().includes('full stack')
      );
      return {
        templateId: 'TPL_FULLSTACK_WELCOME',
        profileUpdates: {
          courseInterest: techCourse?.name || 'Full Stack Web Development & Software Engineering Bootcamp',
          examTarget: undefined,
        }
      };
    }
  },

  // P9: Exam-specific course enquiry
  {
    id: 'RULE_EXAM_COURSE_ENQUIRY',
    description: 'Course enquiry with exam preference or academic level',
    priority: 9,
    condition: (intent, all, profile, entities, text) => {
      const lower = text.toLowerCase();
      if (lower.includes('full stack') || lower.includes('fullstack') || lower.includes('coding') || lower.includes('python') || lower.includes('web dev')) {
        return false;
      }
      return (intent === 'course_enquiry' || intent === 'exam_preference') &&
        !!(entities.examTarget || entities.academicLevel || profile.examTarget);
    },
    action: (_, profile, entities) => {
      const exam = entities.examTarget || profile.examTarget || '';
      const level = entities.academicLevel || profile.academicLevel || '';

      if (exam.toLowerCase().includes('jee') && (level.includes('12') || level.includes('dropper'))) return { templateId: 'TPL_JEE_CLASS12_WELCOME', profileUpdates: {} };
      if (exam.toLowerCase().includes('jee') && level.includes('11')) return { templateId: 'TPL_JEE_CLASS11_WELCOME', profileUpdates: {} };
      if (exam.toLowerCase().includes('neet')) return { templateId: 'TPL_NEET_WELCOME', profileUpdates: {} };
      if (exam.toLowerCase().includes('cet')) return { templateId: 'TPL_CET_WELCOME', profileUpdates: {} };
      if (exam.toLowerCase().includes('ielts') || exam.toLowerCase().includes('abroad')) return { templateId: 'TPL_ABROAD_WELCOME', profileUpdates: {} };
      if (profile.academicLevel?.includes('preschool') || entities.academicLevel?.toLowerCase().includes('preschool')) return { templateId: 'TPL_PRESCHOOL_WELCOME', profileUpdates: {} };
      return { templateId: 'TPL_GREETING', profileUpdates: {} };
    }
  },

  // P10: Budget disclosure with course matching
  {
    id: 'RULE_BUDGET_AND_SCHEDULE_RECOMMENDATION',
    description: 'Budget and/or schedule shared - find matching courses',
    priority: 10,
    condition: (intent, all, profile, entities) =>
      (intent === 'budget_disclosure' || all.some(i => i.intent === 'batch_timing_enquiry' || i.intent === 'location_enquiry')) &&
      !!(entities.budgetMax || entities.preferredSchedule || entities.location),
    action: (_, profile, __, courses, courseMatches) => {
      if (courseMatches.length > 0) {
        return { templateId: 'TPL_COURSE_MATCH_BUDGET', profileUpdates: {} };
      }
      return { templateId: 'TPL_COURSE_NO_MATCH', profileUpdates: {} };
    }
  },

  // P11: Fee enquiry
  {
    id: 'RULE_FEE_ENQUIRY',
    description: 'Student asks about fees',
    priority: 11,
    condition: (intent) => intent === 'fee_enquiry',
    action: () => ({ templateId: 'TPL_FEE_ENQUIRY', profileUpdates: {} })
  },

  // P12: Scholarship enquiry
  {
    id: 'RULE_SCHOLARSHIP',
    description: 'Scholarship question',
    priority: 12,
    condition: (intent) => intent === 'scholarship_enquiry',
    action: () => ({ templateId: 'TPL_SCHOLARSHIP_INFO', profileUpdates: {} })
  },

  // P13: Eligibility
  {
    id: 'RULE_ELIGIBILITY',
    description: 'Eligibility question',
    priority: 13,
    condition: (intent) => intent === 'eligibility_enquiry',
    action: () => ({ templateId: 'TPL_ELIGIBILITY', profileUpdates: {} })
  },

  // P14: Schedule
  {
    id: 'RULE_SCHEDULE',
    description: 'Batch timing question',
    priority: 14,
    condition: (intent) => intent === 'batch_timing_enquiry',
    action: () => ({ templateId: 'TPL_SCHEDULE_INFO', profileUpdates: {} })
  },

  // P15: Location
  {
    id: 'RULE_LOCATION',
    description: 'Location question',
    priority: 15,
    condition: (intent) => intent === 'location_enquiry',
    action: () => ({ templateId: 'TPL_LOCATION_INFO', profileUpdates: {} })
  },

  // P16: Admission process
  {
    id: 'RULE_ADMISSION_PROCESS',
    description: 'Admission procedure question',
    priority: 16,
    condition: (intent) => intent === 'admission_process',
    action: () => ({ templateId: 'TPL_ADMISSION_PROCESS', profileUpdates: {} })
  },

  // P17: Course comparison
  {
    id: 'RULE_COMPARISON',
    description: 'Course comparison request',
    priority: 17,
    condition: (intent) => intent === 'course_comparison',
    action: () => ({ templateId: 'TPL_COMPARISON', profileUpdates: {} })
  },

  // P18: Objections
  {
    id: 'RULE_OBJECTION_FEE',
    description: 'Fee too high objection',
    priority: 18,
    condition: (intent, _, __, ___, text) =>
      intent === 'objection_hesitation' && (text.includes('expensive') || text.includes('costly') || text.includes('too much') || text.includes('afford')),
    action: () => ({ templateId: 'TPL_OBJECTION_FEE', profileUpdates: {} })
  },
  {
    id: 'RULE_OBJECTION_JOB',
    description: 'Job guarantee objection',
    priority: 19,
    condition: (intent, _, __, ___, text) =>
      intent === 'objection_hesitation' && (text.includes('job') || text.includes('placement') || text.includes('salary') || text.includes('guarantee')),
    action: () => ({ templateId: 'TPL_OBJECTION_JOB', profileUpdates: {} })
  },
  {
    id: 'RULE_OBJECTION_FAMILY',
    description: 'Family discussion objection',
    priority: 20,
    condition: (intent, _, __, ___, text) =>
      intent === 'objection_hesitation' && (text.includes('parents') || text.includes('family') || text.includes('discuss') || text.includes('father') || text.includes('mother')),
    action: () => ({ templateId: 'TPL_OBJECTION_FAMILY', profileUpdates: {} })
  },
  {
    id: 'RULE_OBJECTION_SCHEDULE',
    description: 'Schedule conflict objection',
    priority: 21,
    condition: (intent, _, __, ___, text) =>
      intent === 'objection_hesitation' && (text.includes('weekday') || text.includes('timing') || text.includes('time') || text.includes('college')),
    action: () => ({ templateId: 'TPL_OBJECTION_SCHEDULE', profileUpdates: {} })
  },
  {
    id: 'RULE_OBJECTION_TRUST',
    description: 'Trust or credibility objection',
    priority: 22,
    condition: (intent, _, __, ___, text) =>
      intent === 'objection_hesitation' && (text.includes('trust') || text.includes('real') || text.includes('fake') || text.includes('verify') || text.includes('legit')),
    action: () => ({ templateId: 'TPL_OBJECTION_TRUST', profileUpdates: {} })
  },
  {
    id: 'RULE_OBJECTION_GENERIC',
    description: 'Generic hesitation/objection',
    priority: 23,
    condition: (intent) => intent === 'objection_hesitation',
    action: () => ({ templateId: 'TPL_OBJECTION_FEE', profileUpdates: {} })
  },

  // P24: Confirmation
  {
    id: 'RULE_CONFIRMATION',
    description: 'Student confirms a pending action',
    priority: 24,
    condition: (intent) => intent === 'confirmation',
    action: () => ({ templateId: 'TPL_CONFIRMATION_THANKS', profileUpdates: {} })
  },

  // P25: Goodbye
  {
    id: 'RULE_GOODBYE',
    description: 'Student says goodbye or thanks',
    priority: 25,
    condition: (intent) => intent === 'goodbye',
    action: () => ({ templateId: 'TPL_GOODBYE', profileUpdates: {} })
  },

  // P26: Status request
  {
    id: 'RULE_STATUS',
    description: 'Application or profile status check',
    priority: 26,
    condition: (intent) => intent === 'application_status',
    action: () => ({ templateId: 'TPL_STATUS_UPDATE', profileUpdates: {} })
  },

  // P27: Course enquiry without enough context -> ask for background
  {
    id: 'RULE_COURSE_ENQUIRY_NO_CONTEXT',
    description: 'General course enquiry without exam/class info',
    priority: 27,
    condition: (intent, _, profile) => intent === 'course_enquiry' && !profile.examTarget && !profile.academicLevel,
    action: () => ({ templateId: 'TPL_ASK_BACKGROUND', profileUpdates: {} })
  },

  // Fallback: unknown intent
  {
    id: 'RULE_FALLBACK',
    description: 'No confident intent match — request clarification',
    priority: 99,
    condition: () => true,
    action: () => ({ templateId: 'TPL_FALLBACK', profileUpdates: {} })
  }
];

export async function runConversationEngine(input: EngineInput): Promise<EngineOutput> {
  const { message, lead, courses, conversationHistory } = input;
  const profile = lead.profile;

  // Step 1: Normalize text
  const normalized = normalizeText(message);

  // Step 2: Detect intents
  const intentMatches = detectIntents(normalized, profile, conversationHistory);
  const primaryIntent = getPrimaryIntent(intentMatches);

  // Step 3: Extract entities
  const entities = extractEntities(normalized, profile);

  // Step 4: Merge entities into profile updates
  const entityUpdates = mergeEntitiesIntoProfile(profile, entities);

  // Step 5: Build updated profile snapshot (not yet persisted)
  const updatedProfileSnapshot: StudentProfile = { ...profile, ...entityUpdates };

  // Step 6: Get course recommendations
  const courseMatches = recommendCourses(updatedProfileSnapshot, courses);

  // Step 7: Evaluate rules in priority order
  let matchedRule: EngineRule | null = null;
  for (const rule of RULES.sort((a, b) => a.priority - b.priority)) {
    if (rule.condition(primaryIntent, intentMatches, updatedProfileSnapshot, entities, normalized.normalized)) {
      matchedRule = rule;
      break;
    }
  }

  if (!matchedRule) matchedRule = RULES[RULES.length - 1]; // fallback always matches

  // Step 8: Execute rule action
  const actionResult = matchedRule.action(
    primaryIntent,
    updatedProfileSnapshot,
    entities,
    courses,
    courseMatches
  );

  // Step 9: Merge rule-level profile updates
  const finalProfileUpdates: Partial<StudentProfile> = {
    ...entityUpdates,
    ...actionResult.profileUpdates,
    lastIntent: primaryIntent
  };

  // Step 10: Recalculate lead score
  const { newScore, newReasons, newStage } = calculateLeadScore(
    { ...updatedProfileSnapshot, ...finalProfileUpdates },
    profile.scoreReasons
  );

  finalProfileUpdates.leadScore = newScore;
  finalProfileUpdates.scoreReasons = newReasons;
  if (!actionResult.profileUpdates.leadStage) {
    finalProfileUpdates.leadStage = newStage;
  }

  // Step 11: Render response
  const lang: Language = updatedProfileSnapshot.preferredLanguage || 'en';
  const responseText = renderTemplate(actionResult.templateId, lang, {
    profile: { ...updatedProfileSnapshot, ...finalProfileUpdates },
    courseMatches,
    counsellorName: 'Dr. Sameer Kulkarni'
  });

  // Step 12: Build decision trace
  const decisionTrace: DecisionTrace = {
    normalizedText: normalized.normalized,
    intentsDetected: intentMatches.map(m => ({
      intent: m.intent,
      confidence: m.confidence,
      matchedKeywords: m.matchedKeywords
    })),
    primaryIntent,
    entitiesExtracted: entities as Record<string, any>,
    ruleMatched: matchedRule.id,
    rulePriority: matchedRule.priority,
    previousStage: profile.leadStage,
    newStage: finalProfileUpdates.leadStage || profile.leadStage,
    scoreDiff: newScore - profile.leadScore,
    scoreTotal: newScore,
    responseTemplateId: actionResult.templateId,
    explanation: matchedRule.description,
    recommendedCourseIds: courseMatches.map(m => m.course.id),
    fallbackUsed: false,
    fallbackProvider: 'none'
  };

  // Step 13: Grounded LLM & Database Semantic Search Fallback
  const llmConfig = getLLMConfig();
  let finalResponseText = responseText;
  let finalCourseIds = courseMatches.map(m => m.course.id);

  const isFallbackAppropriate =
    llmConfig.fallbackMode === 'always_llm' ||
    matchedRule.id === 'RULE_FALLBACK' ||
    matchedRule.id === 'RULE_COURSE_ENQUIRY_NO_CONTEXT' ||
    matchedRule.id === 'RULE_COURSE_NO_MATCH' ||
    (llmConfig.fallbackMode === 'hybrid' && (
      llmConfig.geminiConfigured ||
      llmConfig.grokConfigured ||
      message.toLowerCase().includes('full stack') ||
      message.toLowerCase().includes('fullstack') ||
      message.toLowerCase().includes('python') ||
      message.toLowerCase().includes('data science')
    ));

  if (isFallbackAppropriate && llmConfig.fallbackMode !== 'deterministic_only') {
    try {
      const fallbackResult = await executeLLMFallback({
        message,
        lead: { ...lead, profile: { ...profile, ...finalProfileUpdates } },
        courses,
        conversationHistory,
        deterministicTrace: decisionTrace
      });

      if (fallbackResult.responseText && fallbackResult.responseText.length > 5) {
        finalResponseText = cleanResponseText(fallbackResult.responseText);
        decisionTrace.fallbackUsed = true;
        decisionTrace.fallbackProvider = fallbackResult.provider;
        decisionTrace.fallbackModel = fallbackResult.modelUsed;
        decisionTrace.explanation = `Context Grounding [${fallbackResult.provider.toUpperCase()}]: ${fallbackResult.reasoning}`;
        if (fallbackResult.recommendedCourseIds.length > 0) {
          finalCourseIds = fallbackResult.recommendedCourseIds;
          decisionTrace.recommendedCourseIds = fallbackResult.recommendedCourseIds;
        }
        if (fallbackResult.profileUpdates && Object.keys(fallbackResult.profileUpdates).length > 0) {
          Object.assign(finalProfileUpdates, fallbackResult.profileUpdates);
        }
      }
    } catch (err: any) {
      console.warn('LLM / DB Fallback error:', err.message);
    }
  }

  return {
    responseText: finalResponseText,
    templateId: actionResult.templateId,
    updatedProfile: finalProfileUpdates,
    decisionTrace,
    followUpTrigger: actionResult.followUpTrigger,
    shouldHandOff: actionResult.shouldHandOff || false,
    handOffReason: actionResult.handOffReason,
    recommendedCourseIds: finalCourseIds
  };
}
