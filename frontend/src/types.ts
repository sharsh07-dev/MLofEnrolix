export interface StudentProfile {
  name?: string;
  parentName?: string;
  phone?: string;
  email?: string;
  academicLevel?: string;
  courseInterest?: string;
  examTarget?: string;
  countryPreference?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredSchedule?: string;
  location?: string;
  preferredLanguage: 'en' | 'hi' | 'mr';
  admissionTimeline?: string;
  visitPreference?: string;
  counsellingSlot?: string;
  leadStage: string;
  leadScore: number;
  scoreReasons: Array<{ factor: string; points: number; description: string; timestamp: string }>;
  confirmedFacts: Record<string, { value: any; timestamp: string; source: string }>;
  unverifiedFacts: Record<string, any>;
  pendingAction?: string;
  lastIntent?: string;
  humanHandoff: boolean;
  handoffReason?: string;
  counsellorId?: string;
}

export interface Lead {
  id: string;
  instituteId: string;
  createdAt: string;
  updatedAt: string;
  channel: string;
  conversationId: string;
  status: string;
  profile: StudentProfile;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'student' | 'assistant' | 'counsellor' | 'system';
  text: string;
  timestamp: string;
  language?: string;
  decisionTrace?: {
    normalizedText: string;
    intentsDetected: Array<{ intent: string; confidence: number; matchedKeywords: string[] }>;
    primaryIntent: string;
    entitiesExtracted: Record<string, any>;
    ruleMatched: string;
    rulePriority: number;
    previousStage: string;
    newStage: string;
    scoreDiff: number;
    scoreTotal: number;
    responseTemplateId: string;
    explanation: string;
    recommendedCourseIds?: string[];
    fallbackUsed?: boolean;
    fallbackProvider?: string;
    fallbackModel?: string;
  };
}

export interface Conversation {
  id: string;
  leadId: string;
  channel: string;
  status: 'active' | 'handed_off' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignedCounsellorId?: string;
  messages: Message[];
}

export interface Course {
  id: string;
  instituteId: string;
  code: string;
  name: string;
  category: string;
  targetAudience: string;
  eligibility: string;
  duration: string;
  fee: number;
  feeDisplay: string;
  schedules: string[];
  locations: string[];
  description: string;
  highlights: string[];
  scholarshipAvailable: boolean;
  scholarshipDetails?: string;
  seatsTotal: number;
  seatsLeft: number;

  slug?: string;
  title?: string;
  feeAmount?: number;
  currency?: string;
  feeType?: 'starting_from' | 'fixed' | 'unconfirmed';
  emiAvailable?: boolean;
  durationMonths?: number;
  durationWeeks?: number;
  nextBatchDate?: string | null;
  deliveryModes?: string[];
  technologies?: string[];
  curriculumModules?: CourseModule[];
  projects?: CourseProject[];
  roles?: string[];
  publishedSalaryRange?: string | null;
  placementDisclaimer?: string;
  prerequisites?: string[];
  faqs?: CourseFAQ[];
  sourceUrl?: string;
  lastFetchedAt?: string;
  contentHash?: string;
  verificationStatus?: 'verified' | 'unverified' | 'needs_review';
}

export interface FollowUpTask {
  id: string;
  leadId: string;
  triggerCondition: string;
  scheduledAt: string;
  dueAt: string;
  status: 'pending' | 'triggered' | 'completed' | 'cancelled';
  messageTemplate: string;
  retryCount: number;
  maxRetries: number;
  auditLog: Array<{ timestamp: string; action: string; note: string }>;
}

export interface DuplicateCandidate {
  id: string;
  primaryLeadId: string;
  duplicateLeadId: string;
  matchConfidence: number;
  matchReasons: string[];
  status: 'detected' | 'merged' | 'kept_separate';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface AnalyticsSummary {
  totalLeads: number;
  newLeads: number;
  engagedLeads: number;
  qualifiedLeads: number;
  counsellingRequests: number;
  visitsPendingConfirmation: number;
  humanReviewRequired: number;
  notInterested: number;
  enrolled: number;
  totalConversations: number;
  openConversations: number;
  handedOffConversations: number;
  avgLeadScore: number;
  followUpsDue: number;
  duplicatesDetected: number;
}

export interface CourseModuleTopic {
  week?: string;
  topic: string;
  details?: string[];
}

export interface CourseModule {
  moduleNumber: string;
  title: string;
  weeks?: string;
  description?: string;
  topics: string[];
  weekBreakdown?: CourseModuleTopic[];
}

export interface CourseProject {
  title: string;
  description: string;
  technologies?: string[];
}

export interface CourseFAQ {
  question: string;
  answer: string;
}

export interface KnowledgeConflict {
  id: string;
  instituteId: string;
  courseId?: string;
  courseTitle?: string;
  field: string;
  previousValue: any;
  newValue: any;
  sourceUrl: string;
  detectedAt: string;
  status: 'pending' | 'resolved';
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ScrapeRun {
  id: string;
  instituteId: string;
  startedAt: string;
  completedAt: string;
  status: 'success' | 'partial' | 'failed';
  urlsAttempted: number;
  urlsSucceeded: number;
  urlsFailed: number;
  insertedCourses: number;
  updatedCourses: number;
  unchangedCourses: number;
  conflictsDetected: number;
  logs: string[];
}

export type Page =
  | 'dashboard'
  | 'inbox'
  | 'conversation'
  | 'leads'
  | 'courses'
  | 'knowledge'
  | 'followups'
  | 'duplicates'
  | 'analytics'
  | 'handoff'
  | 'settings';
