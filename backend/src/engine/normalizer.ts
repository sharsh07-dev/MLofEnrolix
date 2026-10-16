export interface NormalizedTextResult {
  raw: string;
  normalized: string;
  detectedScript: 'latin' | 'devanagari' | 'mixed';
  detectedLanguageHint?: 'en' | 'hi' | 'mr';
  tokens: string[];
}

const COMMON_TYPOS: Record<string, string> = {
  'feees': 'fees',
  'fee': 'fees',
  'cource': 'course',
  'coursee': 'course',
  'corse': 'course',
  'coures': 'course',
  'admisson': 'admission',
  'admision': 'admission',
  'admisn': 'admission',
  'admissions': 'admission',
  'prepration': 'preparation',
  'prep': 'preparation',
  'scheduel': 'schedule',
  'shedule': 'schedule',
  'shedul': 'schedule',
  'timings': 'timing',
  'tomorow': 'tomorrow',
  'tommorrow': 'tomorrow',
  'saturdy': 'saturday',
  'satuday': 'saturday',
  'counselor': 'counsellor',
  'counseller': 'counsellor',
  'councellor': 'counsellor',
  'scholarshp': 'scholarship',
  'scolarship': 'scholarship',
  'locaton': 'location',
  'loction': 'location',
  'tution': 'tuition',
  'tuton': 'tuition',
  'inquery': 'enquiry',
  'inquiry': 'enquiry',
  'enquire': 'enquiry',
  'plz': 'please',
  'pls': 'please',
  'btech': 'btech',
  'mtech': 'mtech',
  'buddget': 'budget',
  'budgt': 'budget',
  'colg': 'college',
  'scholl': 'school',
  'preschol': 'preschool',
  'brochure': 'brochure',
  'brochur': 'brochure',
  'sylabous': 'syllabus',
  'syllbus': 'syllabus',
  'intrested': 'interested',
  'intreste': 'interested',
  'appoinment': 'appointment',
  'appointmnt': 'appointment',
  'apointment': 'appointment',
  'dissapointed': 'disappointed',
  'dissapoint': 'disappointed',
  'experiance': 'experience',
  'recomnd': 'recommend',
  'recomended': 'recommended'
};

const ABBREVIATIONS: Record<string, string> = {
  'jee': 'jee',
  'iit': 'jee',
  'iitjee': 'jee',
  'neet': 'neet',
  'medical': 'neet',
  'cet': 'mhtcet',
  'mht-cet': 'mhtcet',
  'mhtcet': 'mhtcet',
  'ielts': 'ielts',
  'toefl': 'ielts',
  'gre': 'gre',
  'gmat': 'gre',
  'sat': 'sat',
  'cat': 'cat',
  'mba': 'mba',
  'upsc': 'upsc',
  'dpp': 'daily practice problems',
  'ante': 'apex scholarship test'
};

export function normalizeText(text: string): NormalizedTextResult {
  const raw = text || '';
  
  // Detect scripts
  const hasDevanagari = /[\u0900-\u097F]/.test(raw);
  const hasLatin = /[a-zA-Z]/.test(raw);
  let detectedScript: 'latin' | 'devanagari' | 'mixed' = 'latin';
  if (hasDevanagari && hasLatin) detectedScript = 'mixed';
  else if (hasDevanagari) detectedScript = 'devanagari';

  // Language hints based on common grammatical markers
  let detectedLanguageHint: 'en' | 'hi' | 'mr' | undefined = undefined;
  const lowerRaw = raw.toLowerCase();

  // Marathi specific markers
  if (
    lowerRaw.includes('नमस्कार') ||
    lowerRaw.includes('आहे') ||
    lowerRaw.includes('हवी') ||
    lowerRaw.includes('कधी') ||
    lowerRaw.includes('शाखा') ||
    lowerRaw.includes('सांगा') ||
    lowerRaw.includes('माहिती') ||
    lowerRaw.includes('फी किती') ||
    /\b(ahe|aahe|havi|havay|kuthe|mahiti|kiti|namaskar)\b/i.test(lowerRaw)
  ) {
    detectedLanguageHint = 'mr';
  }
  // Hindi specific markers
  else if (
    lowerRaw.includes('नमस्ते') ||
    lowerRaw.includes('है') ||
    lowerRaw.includes('चाहिए') ||
    lowerRaw.includes('कब') ||
    lowerRaw.includes('बताइए') ||
    lowerRaw.includes('फीस कितनी') ||
    lowerRaw.includes('जानना') ||
    /\b(hai|chahiye|batao|kripya|namaste|fees kitni|kitna)\b/i.test(lowerRaw)
  ) {
    detectedLanguageHint = 'hi';
  } else if (hasLatin) {
    detectedLanguageHint = 'en';
  }

  // Text normalization:
  // 1. Lowercase
  let cleaned = lowerRaw;

  // 2. Normalize currency symbols and numbers
  cleaned = cleaned.replace(/₹|rs\.?|inr/gi, ' ');
  cleaned = cleaned.replace(/k\b/g, '000'); // convert 45k to 45000

  // 3. Remove punctuation except dashes in course codes
  cleaned = cleaned.replace(/[.,\/#!$%\^&\*;:{}=\_`~()?@]/g, ' ');

  // 4. Collapse spaces
  const words = cleaned.trim().split(/\s+/).filter(Boolean);

  // 5. Apply typos and abbreviation mapping
  const normalizedWords = words.map(w => {
    if (COMMON_TYPOS[w]) return COMMON_TYPOS[w];
    if (ABBREVIATIONS[w]) return ABBREVIATIONS[w];
    return w;
  });

  const normalized = normalizedWords.join(' ');

  return {
    raw,
    normalized,
    detectedScript,
    detectedLanguageHint,
    tokens: normalizedWords
  };
}
