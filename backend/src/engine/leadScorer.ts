import { StudentProfile, LeadStage, ScoreReason } from '../db/types';

interface ScoringResult {
  newScore: number;
  newReasons: ScoreReason[];
  newStage: LeadStage;
}

const SCORE_CAP = 100;

export function calculateLeadScore(
  profile: StudentProfile,
  existingReasons: ScoreReason[]
): ScoringResult {
  // Build a set of factors already awarded to prevent double-counting
  const awardedFactors = new Set(existingReasons.map(r => r.factor));
  const newReasons: ScoreReason[] = [...existingReasons];
  let score = newReasons.reduce((acc, r) => acc + r.points, 0);

  const now = new Date().toISOString();

  function award(factor: string, points: number, description: string) {
    if (!awardedFactors.has(factor)) {
      awardedFactors.add(factor);
      newReasons.push({ factor, points, description, timestamp: now });
      score = Math.min(score + points, SCORE_CAP);
    }
  }

  // Course interest clearly identified
  if (profile.courseInterest || profile.examTarget) {
    award('course_interest', 20, `Course/exam interest identified (${profile.examTarget || profile.courseInterest})`);
  }

  // Academic level identified
  if (profile.academicLevel) {
    award('academic_level', 15, `Academic level captured: ${profile.academicLevel}`);
  }

  // Budget shared
  if (profile.budgetMin !== undefined || profile.budgetMax !== undefined) {
    award('budget_shared', 15, `Budget stated: ₹${profile.budgetMin || 0}–${profile.budgetMax || 0}`);
  }

  // Admission timeline identified
  if (profile.admissionTimeline) {
    award('admission_timeline', 15, `Admission timeline: ${profile.admissionTimeline}`);
  }

  // Responds to qualification questions (name + contact provided)
  if (profile.name && profile.phone) {
    award('contact_provided', 10, `Name and phone number provided`);
  }

  // Requests counselling/campus visit
  if (profile.counsellingSlot) {
    award('counselling_requested', 15, `Counselling appointment confirmed: ${profile.counsellingSlot}`);
  }

  if (profile.visitPreference) {
    award('campus_visit_interest', 10, `Campus visit requested: ${profile.visitPreference}`);
  }

  // Confirms concrete next step
  if (profile.pendingAction === 'awaiting_visit_confirmation' || profile.pendingAction === 'counsellor_reminder_due') {
    award('concrete_next_step', 10, `Concrete next action confirmed`);
  }

  // Deductions
  if (profile.humanHandoff) {
    // No deduction — human handoff is a status marker, not negative
  }

  // Determine stage
  let newStage: LeadStage = profile.leadStage;

  if (profile.humanHandoff) {
    newStage = 'Human Review Required';
  } else if (profile.leadStage === 'Not Interested') {
    newStage = 'Not Interested'; // sticky
  } else if (score >= 80) {
    if (profile.counsellingSlot) {
      newStage = 'Counselling Requested';
    } else if (profile.visitPreference) {
      newStage = 'Visit Pending Confirmation';
    } else {
      newStage = 'Qualified';
    }
  } else if (score >= 55) {
    newStage = 'Qualified';
  } else if (score >= 35) {
    newStage = 'Engaged';
  } else if (score >= 20) {
    newStage = 'Contacted';
  } else {
    newStage = 'New';
  }

  return {
    newScore: Math.min(score, SCORE_CAP),
    newReasons,
    newStage
  };
}
