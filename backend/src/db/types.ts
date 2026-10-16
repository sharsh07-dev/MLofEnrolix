export type Language = 'en' | 'hi' | 'mr';

export type LeadStage =
  | 'New'
  | 'Contacted'
  | 'Engaged'
  | 'Information Incomplete'
  | 'Qualified'
  | 'Counselling Requested'
  | 'Visit Pending Confirmation'
  | 'Visit Confirmed'
  | 'Application In Progress'
  | 'Enrolled'
  | 'Not Interested'
  | 'Human Review Required';

export type IntentType =
  | 'greeting'
  | 'course_enquiry'
  | 'course_recommendation'
  | 'fee_enquiry'
  | 'eligibility_enquiry'
  | 'batch_timing_enquiry'
  | 'location_enquiry'
  | 'admission_process'
  | 'student_profile_info'
  | 'budget_disclosure'
  | 'exam_preference'
  | 'campus_visit_request'
  | 'counselling_appointment'
  | 'follow_up_request'
  | 'course_comparison'
  | 'scholarship_enquiry'
  | 'application_status'
  | 'objection_hesitation'
  | 'human_counsellor_request'
  | 'complaint'
  | 'confirmation'
  | 'rejection'
  | 'goodbye'
  | 'unknown';

export interface ScoreReason {
  factor: string;
  points: number;
  description: string;
  timestamp: string;
}

export interface FactRecord {
  value: any;
  timestamp: string;
  source: 'user_explicit' | 'staff_verified' | 'rule_inferred';
}

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
  preferredLanguage: Language;
  admissionTimeline?: string;
  visitPreference?: string;
  counsellingSlot?: string;
  leadStage: LeadStage;
  leadScore: number;
  scoreReasons: ScoreReason[];
  confirmedFacts: Record<string, FactRecord>;
  unverifiedFacts: Record<string, FactRecord>;
  pendingAction?: string;
  lastIntent?: IntentType;
  humanHandoff: boolean;
  handoffReason?: string;
  counsellorId?: string;
  counsellorNotes?: string;
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

  // TechSummit / Knowledge Base specific fields
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
  sourceUpdatedAt?: string;
  lastFetchedAt?: string;
  lastVerifiedAt?: string;
  contentHash?: string;
  verificationStatus?: 'verified' | 'unverified' | 'needs_review';
  extractionWarnings?: string[];
}

export interface KnowledgeDocument {
  id: string;
  instituteId: string;
  url: string;
  title: string;
  documentType: 'institute_overview' | 'course_page';
  content: string;
  contentHash: string;
  fetchedAt: string;
  status: 'active' | 'archived' | 'failed';
  extractedCourseId?: string;
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

export interface FollowUpTask {
  id: string;
  leadId: string;
  instituteId: string;
  triggerCondition: string;
  scheduledAt: string;
  dueAt: string;
  status: 'pending' | 'triggered' | 'completed' | 'cancelled';
  messageTemplate: string;
  retryCount: number;
  maxRetries: number;
  cancelReason?: string;
  auditLog: Array<{ timestamp: string; action: string; note: string }>;
}

export interface DuplicateCandidate {
  id: string;
  instituteId: string;
  primaryLeadId: string;
  duplicateLeadId: string;
  matchConfidence: number;
  matchReasons: string[];
  status: 'detected' | 'merged' | 'kept_separate';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface Institute {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  phone: string;
  email: string;
  address: string;
  branches: string[];
  website?: string;
  openingHours?: string;
  deliveryModes?: string[];
  demoBookingProcess?: string;
  careerSupportPolicy?: string;
  faqs?: CourseFAQ[];
  lastFetchedAt?: string;
}

export interface User {
  id: string;
  instituteId: string;
  name: string;
  email: string;
  role: 'admin' | 'counsellor' | 'admissions_head';
  phone?: string;
  avatarUrl?: string;
}

export interface DecisionTrace {
  normalizedText: string;
  intentsDetected: Array<{ intent: IntentType; confidence: number; matchedKeywords: string[] }>;
  primaryIntent: IntentType;
  entitiesExtracted: Record<string, any>;
  ruleMatched: string;
  rulePriority: number;
  previousStage: LeadStage;
  newStage: LeadStage;
  scoreDiff: number;
  scoreTotal: number;
  responseTemplateId: string;
  explanation: string;
  recommendedCourseIds?: string[];
  fallbackUsed?: boolean;
  fallbackProvider?: 'gemini' | 'grok' | 'database_search' | 'none';
  fallbackModel?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  instituteId: string;
  sender: 'student' | 'assistant' | 'counsellor' | 'system';
  text: string;
  timestamp: string;
  language?: Language;
  decisionTrace?: DecisionTrace;
  readByStaff?: boolean;
}

export interface Conversation {
  id: string;
  instituteId: string;
  leadId: string;
  channel: 'web_chat' | 'whatsapp' | 'phone_inquiry' | 'direct_portal';
  status: 'active' | 'handed_off' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignedCounsellorId?: string;
  messages: Message[];
}

export interface Lead {
  id: string;
  instituteId: string;
  createdAt: string;
  updatedAt: string;
  channel: string;
  profile: StudentProfile;
  conversationId: string;
  status: 'active' | 'archived' | 'merged';
}
