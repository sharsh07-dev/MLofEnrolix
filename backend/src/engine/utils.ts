import { Lead, StudentProfile, Language, LeadStage } from '../db/types';
import { SEED_LEADS, SEED_CONVERSATIONS } from '../db/seedData';

// Duplicate detection
export interface DuplicateCheck {
  isDuplicate: boolean;
  confidence: number;
  matchReasons: string[];
  existingLeadId?: string;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\+]/g, '').replace(/^91/, '').replace(/^0/, '');
}

export function checkDuplicate(
  phone: string | undefined,
  email: string | undefined,
  name: string | undefined,
  existingLeads: Lead[],
  currentLeadId?: string
): DuplicateCheck {
  for (const lead of existingLeads) {
    if (lead.id === currentLeadId || lead.status === 'merged') continue;

    const reasons: string[] = [];
    let confidence = 0;

    // Exact phone match (high confidence)
    if (phone && lead.profile.phone) {
      const n1 = normalizePhone(phone);
      const n2 = normalizePhone(lead.profile.phone);
      if (n1 === n2 && n1.length >= 9) {
        reasons.push(`Matching phone number (${phone})`);
        confidence += 70;
      }
    }

    // Email match (high confidence)
    if (email && lead.profile.email) {
      if (email.toLowerCase() === lead.profile.email.toLowerCase()) {
        reasons.push(`Matching email address (${email})`);
        confidence += 70;
      }
    }

    // Similar name (supporting evidence only)
    if (name && lead.profile.name) {
      const n1 = name.toLowerCase().split(' ');
      const n2 = lead.profile.name.toLowerCase().split(' ');
      const commonWords = n1.filter(w => n2.includes(w) && w.length > 2);
      if (commonWords.length >= 2) {
        reasons.push(`Similar name ("${name}" vs "${lead.profile.name}")`);
        confidence += 20;
      } else if (commonWords.length === 1) {
        reasons.push(`Partial name match ("${name}" vs "${lead.profile.name}")`);
        confidence += 10;
      }
    }

    if (confidence >= 50) {
      return {
        isDuplicate: true,
        confidence: Math.min(confidence, 99),
        matchReasons: reasons,
        existingLeadId: lead.id
      };
    }
  }

  return { isDuplicate: false, confidence: 0, matchReasons: [] };
}

// Follow-up scheduler
export function createFollowUpTask(
  leadId: string,
  instituteId: string,
  triggerCondition: string,
  messageTemplate: string,
  delayHours: number,
  maxRetries = 2
) {
  const now = new Date();
  const dueAt = new Date(now.getTime() + delayHours * 3600000);

  return {
    id: `fup-${leadId}-${Date.now()}`,
    leadId,
    instituteId,
    triggerCondition,
    scheduledAt: now.toISOString(),
    dueAt: dueAt.toISOString(),
    status: 'pending' as const,
    messageTemplate,
    retryCount: 0,
    maxRetries,
    auditLog: [
      {
        timestamp: now.toISOString(),
        action: 'created',
        note: `Follow-up created for trigger: ${triggerCondition}`
      }
    ]
  };
}

// Lead creation with dedup
export function createNewLead(
  instituteId: string,
  channel: string,
  language: Language = 'en'
): Lead {
  const leadId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const convId = `conv-${leadId}`;

  const initialProfile: StudentProfile = {
    preferredLanguage: language,
    leadStage: 'New',
    leadScore: 0,
    scoreReasons: [],
    confirmedFacts: {},
    unverifiedFacts: {},
    humanHandoff: false
  };

  return {
    id: leadId,
    instituteId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    channel,
    conversationId: convId,
    status: 'active',
    profile: initialProfile
  };
}

// Analytics computation from DB state
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

export function computeAnalytics(
  leads: Lead[],
  conversations: any[],
  followUps: any[],
  duplicates: any[]
): AnalyticsSummary {
  const stageCounts: Record<LeadStage, number> = {
    'New': 0, 'Contacted': 0, 'Engaged': 0, 'Information Incomplete': 0,
    'Qualified': 0, 'Counselling Requested': 0, 'Visit Pending Confirmation': 0,
    'Visit Confirmed': 0, 'Application In Progress': 0, 'Enrolled': 0,
    'Not Interested': 0, 'Human Review Required': 0
  };

  let totalScore = 0;
  for (const lead of leads) {
    stageCounts[lead.profile.leadStage] = (stageCounts[lead.profile.leadStage] || 0) + 1;
    totalScore += lead.profile.leadScore;
  }

  return {
    totalLeads: leads.length,
    newLeads: stageCounts['New'] + stageCounts['Contacted'],
    engagedLeads: stageCounts['Engaged'],
    qualifiedLeads: stageCounts['Qualified'],
    counsellingRequests: stageCounts['Counselling Requested'],
    visitsPendingConfirmation: stageCounts['Visit Pending Confirmation'] + stageCounts['Visit Confirmed'],
    humanReviewRequired: stageCounts['Human Review Required'],
    notInterested: stageCounts['Not Interested'],
    enrolled: stageCounts['Enrolled'],
    totalConversations: conversations.length,
    openConversations: conversations.filter((c: any) => c.status === 'active').length,
    handedOffConversations: conversations.filter((c: any) => c.status === 'handed_off').length,
    avgLeadScore: leads.length > 0 ? Math.round(totalScore / leads.length) : 0,
    followUpsDue: followUps.filter((f: any) => f.status === 'pending' || f.status === 'triggered').length,
    duplicatesDetected: duplicates.filter((d: any) => d.status === 'detected').length
  };
}
