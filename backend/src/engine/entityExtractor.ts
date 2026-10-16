import { NormalizedTextResult } from './normalizer';
import { StudentProfile, FactRecord, Language } from '../db/types';

export interface ExtractedEntities {
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
  preferredLanguage?: Language;
  admissionTimeline?: string;
  visitPreference?: string;
  corrections?: Record<string, any>;
}

// Academic level patterns
const ACADEMIC_LEVEL_PATTERNS: Array<[RegExp, string]> = [
  [/\bclass\s*(\d+)\b/i, 'Class $1'],
  [/\b(std|standard)\s*(\d+)\b/i, 'Class $2'],
  [/\b(\d+)th\s*(standard|class|grade)?\b/i, 'Class $1'],
  [/\bgrade\s*(\d+)\b/i, 'Class $1'],
  [/\b(class\s*)?(xi{1,2}|x{1})\b/i, 'Class 12'],  // XII = class 12, XI = class 11, X = class 10
  [/\bxi\b/i, 'Class 11'],
  [/\bx\b(?!ii)/i, 'Class 10'],
  [/\bdropper\b/i, 'Dropper / Repeater'],
  [/\brepeater\b/i, 'Dropper / Repeater'],
  [/\bgraduat(e|ing|ed)\b/i, 'Graduate'],
  [/\bunder.?graduate\b/i, 'Undergraduate'],
  [/\bpost.?graduate\b/i, 'Postgraduate'],
  [/\bclass 8\b/i, 'Class 8'],
  [/\bclass 9\b/i, 'Class 9'],
  [/\bclass 10\b/i, 'Class 10'],
  [/\bclass 11\b/i, 'Class 11'],
  [/\bclass 12\b/i, 'Class 12'],
  [/\bkindergarten\b|\bkg\b|\bnursery\b|\bpre.?school\b/i, 'Preschool / Kindergarten'],
  [/\bage\s*(\d+)\s*(years?|yrs?)?\b/i, 'Age $1'],
];

const EXAM_PATTERNS: Array<[RegExp, string]> = [
  [/\bjee\s*(main|advanced|mains)?\b/i, 'JEE Main'],
  [/\biit(-?jee)?\b/i, 'JEE Main'],
  [/\bneet\b/i, 'NEET'],
  [/\bmht.?cet\b|\bcet\b/i, 'MHT-CET'],
  [/\bielts\b/i, 'IELTS'],
  [/\bgre\b/i, 'GRE'],
  [/\bgmat\b/i, 'GMAT'],
  [/\btoefl\b/i, 'TOEFL'],
  [/\bsat\b/i, 'SAT'],
  [/\bcat\b/i, 'CAT (MBA)'],
  [/\bgate\b/i, 'GATE'],
  [/\bupsc\b/i, 'UPSC'],
];

const COUNTRY_PATTERNS: Array<[RegExp, string]> = [
  [/\busa\b|\bamerica\b|\bunited states\b/i, 'USA'],
  [/\buk\b|\bbritain\b|\bengland\b|\bunited kingdom\b/i, 'UK'],
  [/\bcanada\b|\bcanadian\b/i, 'Canada'],
  [/\baustralia\b|\baustralian\b/i, 'Australia'],
  [/\bgermany\b|\bgerman\b/i, 'Germany'],
  [/\beurope\b|\beuropean\b/i, 'Europe'],
  [/\bnew zealand\b/i, 'New Zealand'],
  [/\bsingapore\b/i, 'Singapore'],
  [/\bdubai\b|\buae\b/i, 'UAE/Dubai'],
];

const SCHEDULE_PATTERNS: Array<[RegExp, string]> = [
  [/\bmorning\b.*?batch\b|\bmorning\b.*?class/i, 'Morning batch'],
  [/\bevening\b.*?batch\b|\bevening\b.*?class/i, 'Evening batches'],
  [/\bweekend\b/i, 'Weekend batches'],
  [/\bweekday\b/i, 'Weekday batches'],
  [/\bsunday\b/i, 'Sunday batch'],
  [/\bsaturday\b.*?batch\b|\bsaturday\b.*?class/i, 'Saturday batch'],
  [/\bmorning\b/i, 'Morning batch'],
  [/\bevening\b/i, 'Evening batches'],
  [/\bonline\b/i, 'Online live'],
  [/\boffline\b/i, 'Offline classroom'],
];

const LOCATION_PATTERNS: Array<[RegExp, string]> = [
  [/\bwakad\b/i, 'Wakad, Pune'],
  [/\bkothrud\b/i, 'Kothrud, Pune'],
  [/\bshivajinagar\b|\bshivaji nagar\b/i, 'Shivajinagar, Pune'],
  [/\bhadapsar\b/i, 'Hadapsar, Pune'],
  [/\baundh\b/i, 'Aundh, Pune'],
  [/\bbaner\b/i, 'Baner, Pune'],
  [/\bdeccan\b|\bfc road\b/i, 'FC Road, Pune'],
  [/\bviman nagar\b|\bvimannagar\b/i, 'Viman Nagar, Pune'],
  [/\bpune\b/i, 'Pune'],
  [/\bmumbai\b/i, 'Mumbai'],
  [/\bde?c?c?an\b/i, 'Deccan, Pune'],
];

const TIMELINE_PATTERNS: Array<[RegExp, string]> = [
  [/\bimmediately?\b|\bimmediately?\b|\bnow\b|\btoday\b|\bthis week\b/i, 'Immediate'],
  [/\bnext\s+week\b/i, 'Next week'],
  [/\bnext\s+month\b/i, 'Next month'],
  [/\bthis\s+month\b/i, 'This month'],
  [/\b2025\b/i, '2025'],
  [/\b2026\b/i, '2026'],
  [/\bjune\b/i, 'June batch'],
  [/\bjuly\b/i, 'July batch'],
  [/\bjanuary\b/i, 'January batch'],
  [/\bfew days\b/i, 'Within a few days'],
];

const VISIT_PATTERNS: Array<[RegExp, string]> = [
  [/\bsaturday\b/i, 'Saturday'],
  [/\bsunday\b/i, 'Sunday'],
  [/\bmonday\b/i, 'Monday'],
  [/\btuesday\b/i, 'Tuesday'],
  [/\bwednesday\b/i, 'Wednesday'],
  [/\bthursday\b/i, 'Thursday'],
  [/\bfriday\b/i, 'Friday'],
  [/\bmorning\b/i, 'morning'],
  [/\bafternoon\b/i, 'afternoon'],
  [/\bevening\b/i, 'evening'],
  [/\btomorrow\b/i, 'Tomorrow'],
  [/\bthis weekend\b/i, 'This weekend'],
];

const LANGUAGE_PATTERNS: Array<[RegExp, Language]> = [
  [/\bin\s+english\b|\bplease\s+speak\s+english\b|\benglish\s+please\b/i, 'en'],
  [/\bhin?di\b|\bhin?di mein\b|\bhin?di me\b/i, 'hi'],
  [/\bmarathi\b|\bmaraathi\b|\bmarathit\b/i, 'mr'],
];

// Budget extraction
function extractBudget(text: string): { min?: number; max?: number } {
  // Patterns: "40000 to 50000", "between 40k and 50k", "around 45000", "upto 60000", "max 80000"
  const rangeMatch = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|000)?\s*(?:to|-|and)\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|000)?/);
  if (rangeMatch) {
    let min = parseFloat(rangeMatch[1].replace(/,/g, ''));
    let max = parseFloat(rangeMatch[2].replace(/,/g, ''));
    if (min < 1000) min *= 1000;
    if (max < 1000) max *= 1000;
    return { min, max };
  }

  // Single values: "around 45000", "budget is 50k", "50,000"
  const singleMatch = text.match(/(?:around|approximately|about|upto|max(?:imum)?|budget\s*(?:is|of)?|up to|below)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k)?/);
  if (singleMatch) {
    let val = parseFloat(singleMatch[1].replace(/,/g, ''));
    if (text.includes('k') && val < 1000) val *= 1000;
    // Treat as approx range ±10%
    if (val >= 1000 && val <= 500000) {
      return { min: Math.round(val * 0.9), max: Math.round(val * 1.1) };
    }
  }

  return {};
}

// Name extraction: Try "I am X", "my name is X", "I'm X"
function extractName(text: string): string | undefined {
  const namePatterns = [
    /(?:i am|i'm|my name is|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
    /(?:माझे नाव|मेरा नाम|naam hai|naam)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i,
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].length > 2) {
      // Exclude common false positives
      const commonWords = new Set(['class', 'grade', 'preparing', 'interested', 'looking', 'student', 'parent']);
      if (!commonWords.has(match[1].toLowerCase())) {
        return match[1].trim();
      }
    }
  }
  return undefined;
}

// Phone number extraction
function extractPhone(text: string): string | undefined {
  const phoneMatch = text.match(/(?:\+?91[\s-]?)?[6-9](?:[\s-]?\d){9}/);
  if (phoneMatch) {
    const rawDigits = phoneMatch[0].replace(/[\s-]/g, '');
    const cleanDigits = rawDigits.startsWith('+91')
      ? rawDigits.slice(3)
      : rawDigits.startsWith('91') && rawDigits.length === 12
      ? rawDigits.slice(2)
      : rawDigits;
    return `+91 ${cleanDigits}`;
  }
  return undefined;
}

// Email extraction
function extractEmail(text: string): string | undefined {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch ? emailMatch[0] : undefined;
}

function matchFirst<T>(text: string, patterns: Array<[RegExp, T]>): T | undefined {
  for (const [pattern, value] of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Support $1 substitutions for string values
      if (typeof value === 'string' && value.includes('$')) {
        return (value as string).replace(/\$(\d+)/g, (_, i) => match[parseInt(i)] || '') as unknown as T;
      }
      return value;
    }
  }
  return undefined;
}

function extractVisitPreference(text: string): string | undefined {
  const day = matchFirst(text, VISIT_PATTERNS.filter(p => /day|tomorrow|weekend/.test(p[1] as string)));
  const time = matchFirst(text, VISIT_PATTERNS.filter(p => /morning|afternoon|evening/.test(p[1] as string)));
  if (day && time) return `${day} ${time}`;
  if (day) return day as string;
  if (time) return time as string;
  return undefined;
}

export function extractEntities(
  normalized: NormalizedTextResult,
  currentProfile: StudentProfile
): ExtractedEntities {
  const text = normalized.normalized;
  const raw = normalized.raw;
  const combined = text + ' ' + raw.toLowerCase();

  const entities: ExtractedEntities = {};

  // Name
  const name = extractName(raw);
  if (name) entities.name = name;

  // Phone
  const phone = extractPhone(raw);
  if (phone) entities.phone = phone;

  // Email
  const email = extractEmail(raw);
  if (email) entities.email = email;

  // Academic level
  const academicLevel = matchFirst(combined, ACADEMIC_LEVEL_PATTERNS);
  if (academicLevel) entities.academicLevel = academicLevel;

  // Exam target
  const examTarget = matchFirst(combined, EXAM_PATTERNS);
  if (examTarget) entities.examTarget = examTarget;

  // Country
  const country = matchFirst(combined, COUNTRY_PATTERNS);
  if (country) entities.countryPreference = country;

  // Schedule
  const schedule = matchFirst(combined, SCHEDULE_PATTERNS);
  if (schedule) entities.preferredSchedule = schedule;

  // Location
  const location = matchFirst(combined, LOCATION_PATTERNS);
  if (location) entities.location = location;

  // Budget
  const budget = extractBudget(combined);
  if (budget.min !== undefined) entities.budgetMin = budget.min;
  if (budget.max !== undefined) entities.budgetMax = budget.max;

  // Timeline
  const timeline = matchFirst(combined, TIMELINE_PATTERNS);
  if (timeline) entities.admissionTimeline = timeline;

  // Visit preference
  const visitPref = extractVisitPreference(combined);
  if (visitPref) entities.visitPreference = visitPref;

  // Preferred language
  const lang = matchFirst(raw, LANGUAGE_PATTERNS);
  if (lang) entities.preferredLanguage = lang;
  else if (normalized.detectedLanguageHint) entities.preferredLanguage = normalized.detectedLanguageHint;

  // Course interest: check normalized text for course names from catalogue
  const courseKeywords: Array<[RegExp, string]> = [
    [/\bjava\b.*?(full\s*stack|backend|spring|devops)?|\bspring\s*boot\b/i, 'Full-Stack Java + DevOps + AI'],
    [/\bpython\b.*?(full\s*stack|django|fastapi|ai)?/i, 'Full-Stack Python + DevOps + AI'],
    [/\bmern\b|\breact\b|\bnode(\.js)?\b|\bexpress\b|\bmongo(db)?\b/i, 'MERN Stack + DevOps + AI'],
    [/\btest(ing)?\b|\bqa\b|\bselenium\b|\bautomation\s*test(ing)?\b|\bplaywright\b|\bmanual\s*test(ing)?\b/i, 'Software Testing + Automation + AI'],
    [/\bdata\s*science\b|\bdata\s*analytics\b|\bpower\s*bi\b|\bmachine\s*learning\b|\bstatistics\b/i, 'Data Science & Analytics + AI'],
    [/\bfull\s*stack\b|\bweb\s*dev(elopment)?\b|\bsoftware\s*engineering\b/i, 'Full-Stack Java + DevOps + AI'],
  ];
  const courseInterest = matchFirst(combined, courseKeywords);
  if (courseInterest) entities.courseInterest = courseInterest;

  // Detect corrections - if user says "actually" or "correction", flag fields being corrected
  if (/\bactually\b|\bcorrect(ion)?\b|\bno wait\b|\bi meant\b/i.test(raw)) {
    entities.corrections = {};
    if (entities.academicLevel && currentProfile.academicLevel !== entities.academicLevel) {
      entities.corrections.academicLevel = entities.academicLevel;
    }
    if (entities.budgetMin !== undefined) {
      entities.corrections.budget = `₹${entities.budgetMin}–${entities.budgetMax}`;
    }
    if (entities.examTarget && currentProfile.examTarget !== entities.examTarget) {
      entities.corrections.examTarget = entities.examTarget;
    }
  }

  return entities;
}

export function mergeEntitiesIntoProfile(
  currentProfile: StudentProfile,
  entities: ExtractedEntities
): Partial<StudentProfile> {
  const updates: Partial<StudentProfile> = {};
  const now = new Date().toISOString();

  const makeFactRecord = (value: any): FactRecord => ({
    value,
    timestamp: now,
    source: 'user_explicit'
  });

  if (entities.name && !currentProfile.name) {
    updates.name = entities.name;
    if (!updates.confirmedFacts) updates.confirmedFacts = { ...currentProfile.confirmedFacts };
    updates.confirmedFacts!['name'] = makeFactRecord(entities.name);
  }

  if (entities.phone && !currentProfile.phone) {
    updates.phone = entities.phone;
    if (!updates.confirmedFacts) updates.confirmedFacts = { ...currentProfile.confirmedFacts };
    updates.confirmedFacts!['phone'] = makeFactRecord(entities.phone);
  }

  if (entities.email && !currentProfile.email) {
    updates.email = entities.email;
    if (!updates.confirmedFacts) updates.confirmedFacts = { ...currentProfile.confirmedFacts };
    updates.confirmedFacts!['email'] = makeFactRecord(entities.email);
  }

  if (entities.academicLevel) {
    updates.academicLevel = entities.academicLevel;
    if (!updates.confirmedFacts) updates.confirmedFacts = { ...currentProfile.confirmedFacts };
    updates.confirmedFacts!['academicLevel'] = makeFactRecord(entities.academicLevel);
  }

  if (entities.examTarget) {
    updates.examTarget = entities.examTarget;
    if (!updates.confirmedFacts) updates.confirmedFacts = { ...currentProfile.confirmedFacts };
    updates.confirmedFacts!['examTarget'] = makeFactRecord(entities.examTarget);
  }

  if (entities.courseInterest) {
    updates.courseInterest = entities.courseInterest;
    if (!updates.confirmedFacts) updates.confirmedFacts = { ...currentProfile.confirmedFacts };
    updates.confirmedFacts!['courseInterest'] = makeFactRecord(entities.courseInterest);
    // When student explicitly asks for technical / software / full-stack, clear conflicting exam targets
    if (entities.courseInterest === 'Full Stack Web Development' || entities.courseInterest === 'Python, Data Science & AI') {
      updates.examTarget = undefined;
    }
  }

  if (entities.countryPreference) {
    updates.countryPreference = entities.countryPreference;
  }

  if (entities.budgetMin !== undefined) {
    updates.budgetMin = entities.budgetMin;
    updates.budgetMax = entities.budgetMax;
    if (!updates.confirmedFacts) updates.confirmedFacts = { ...currentProfile.confirmedFacts };
    updates.confirmedFacts!['budget'] = makeFactRecord(`₹${entities.budgetMin}–${entities.budgetMax}`);
  }

  if (entities.preferredSchedule) {
    updates.preferredSchedule = entities.preferredSchedule;
  }

  if (entities.location) {
    updates.location = entities.location;
  }

  if (entities.preferredLanguage) {
    updates.preferredLanguage = entities.preferredLanguage;
  }

  if (entities.admissionTimeline) {
    updates.admissionTimeline = entities.admissionTimeline;
  }

  if (entities.visitPreference) {
    updates.visitPreference = entities.visitPreference;
    if (!updates.confirmedFacts) updates.confirmedFacts = { ...currentProfile.confirmedFacts };
    updates.confirmedFacts!['visitPreference'] = makeFactRecord(entities.visitPreference);
  }

  return updates;
}
