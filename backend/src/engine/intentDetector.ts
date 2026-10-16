import { NormalizedTextResult } from './normalizer';
import { Language, StudentProfile, IntentType } from '../db/types';

export interface IntentMatch {
  intent: IntentType;
  confidence: number;
  matchedKeywords: string[];
  matchedPatterns: string[];
}

interface IntentRule {
  intent: IntentType;
  keywords: string[];
  phrases: string[];
  devanagariKeywords?: string[];
  weight: number;
  contextBoost?: Record<string, number>; // boosts confidence when certain previous intents seen
}

const INTENT_RULES: IntentRule[] = [
  // Priority 1: Safety, complaints, human escalation
  {
    intent: 'human_counsellor_request',
    keywords: ['human', 'person', 'staff', 'counsellor', 'counselor', 'senior', 'manager', 'representative', 'agent', 'speak to'],
    phrases: ['speak to someone', 'talk to a human', 'connect me to', 'get me a counsellor', 'I want to speak', 'connect with staff', 'real person', 'actual person'],
    devanagariKeywords: ['काउंसलर', 'कर्मचारी', 'मदत करा', 'बात करें'],
    weight: 10
  },
  {
    intent: 'complaint',
    keywords: ['unacceptable', 'terrible', 'horrible', 'cheat', 'cheated', 'fraud', 'lied', 'promise', 'promised', 'wrong', 'misled', 'mislead', 'disappointed', 'angry', 'upset', 'dispute', 'refund', 'complain', 'complaint'],
    phrases: ['this is wrong', 'you misled me', 'you lied', 'not fair', 'I want a refund', 'I was told', 'not what you said'],
    devanagariKeywords: ['धोखा', 'शिकायत', 'गलत', 'झूठ'],
    weight: 10
  },

  // Priority 2: Corrections
  {
    intent: 'student_profile_info',
    keywords: ['actually', 'correction', 'correct', 'wrong', 'mistake', 'update', 'change', 'i mean', 'no wait', 'not class', 'not jee', 'not neet'],
    phrases: ['actually i am', 'let me correct', 'i meant to say', 'my name is', 'i am in class', 'my budget is', 'i am from', 'i live in', 'my phone', 'my email', 'call me', 'my name'],
    devanagariKeywords: ['मेरा नाम', 'मैं', 'हमारा', 'माझे नाव', 'मी', 'माझे'],
    weight: 8
  },

  // Greetings
  {
    intent: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste', 'namaskar', 'hii', 'helo', 'howdy', 'greetings'],
    phrases: ['good morning', 'good afternoon', 'good evening', 'how are you', 'how do you do'],
    devanagariKeywords: ['नमस्ते', 'नमस्कार', 'हेलो', 'हाय'],
    weight: 3
  },

  // Course intents
  {
    intent: 'course_enquiry',
    keywords: ['course', 'program', 'programme', 'class', 'batch', 'coaching', 'training', 'classes', 'subject', 'learn', 'study', 'enroll', 'enrol', 'join', 'admission'],
    phrases: ['tell me about', 'information about', 'details about', 'what courses', 'which programs', 'available courses', 'do you have', 'I want to know about'],
    devanagariKeywords: ['कोर्स', 'क्लास', 'बैच', 'कोचिंग', 'अभ्यासक्रम', 'शिकायचे'],
    weight: 6
  },
  {
    intent: 'course_recommendation',
    keywords: ['recommend', 'suggestion', 'suggest', 'best course', 'which course', 'right course', 'suitable', 'appropriate', 'advise', 'what should'],
    phrases: ['what would you suggest', 'which is better', 'help me choose', 'what do you recommend', 'best for me', 'right program for me'],
    devanagariKeywords: ['सुझाव', 'कौन सा बेहतर', 'सुचवा', 'कोणता'],
    weight: 7
  },
  {
    intent: 'course_comparison',
    keywords: ['compare', 'comparison', 'difference between', 'vs', 'versus', 'better', 'between', 'or'],
    phrases: ['what is the difference', 'which is better', 'compare these', 'jee vs neet', 'compare courses'],
    devanagariKeywords: ['फरक', 'कौन सा बेहतर है'],
    weight: 6
  },

  // Fee and Budget intents
  {
    intent: 'fee_enquiry',
    keywords: ['fees', 'fee', 'cost', 'price', 'pricing', 'charges', 'tuition', 'payment', 'installment', 'emi', 'affordable', 'expensive', 'cheap', 'how much'],
    phrases: ['how much does', 'what is the fee', 'total cost', 'fee structure', 'any discount', 'fee details', 'payment plan', 'monthly fee', 'annual fee'],
    devanagariKeywords: ['फीस', 'कितनी फीस', 'शुल्क', 'फी किती', 'किती पैसे'],
    weight: 7
  },
  {
    intent: 'budget_disclosure',
    keywords: ['budget', 'afford', 'spend', 'maximum', 'around', 'approximately', 'rupees', 'lakh'],
    phrases: ['my budget is', 'can afford', 'budget of', 'maximum budget', 'I have around', 'within budget', 'limited budget'],
    devanagariKeywords: ['बजट', 'पैसे कम हैं', 'बजट कम आहे'],
    weight: 7
  },
  {
    intent: 'scholarship_enquiry',
    keywords: ['scholarship', 'concession', 'discount', 'waiver', 'financial aid', 'bursary', 'merit', 'concession', 'reduction', 'exemption'],
    phrases: ['do you offer scholarship', 'any scholarship', 'fee waiver', 'merit discount', 'how to get scholarship', 'scholarship available'],
    devanagariKeywords: ['छात्रवृत्ति', 'स्कॉलरशिप', 'शिष्यवृत्ती'],
    weight: 7
  },

  // Eligibility and Admission
  {
    intent: 'eligibility_enquiry',
    keywords: ['eligible', 'eligibility', 'qualify', 'requirement', 'criteria', 'prerequisite', 'qualification', 'minimum marks', 'marks required'],
    phrases: ['am I eligible', 'what are the requirements', 'can I join', 'minimum qualification', 'eligible for'],
    devanagariKeywords: ['योग्यता', 'पात्रता', 'पात्र'],
    weight: 6
  },
  {
    intent: 'admission_process',
    keywords: ['admission', 'process', 'procedure', 'how to apply', 'apply', 'application', 'register', 'registration', 'enrollment', 'enrolment', 'documents', 'form'],
    phrases: ['how to get admission', 'admission process', 'how to apply', 'what documents', 'admission procedure', 'how to register'],
    devanagariKeywords: ['प्रवेश', 'एडमिशन', 'कैसे आवेदन करें', 'प्रवेश प्रक्रिया'],
    weight: 6
  },

  // Schedule and Location
  {
    intent: 'batch_timing_enquiry',
    keywords: ['timing', 'time', 'schedule', 'batch', 'morning', 'evening', 'weekend', 'weekday', 'when', 'hours', 'duration', 'monday', 'saturday', 'sunday', 'daily'],
    phrases: ['what time', 'batch timings', 'morning batch', 'evening batch', 'weekend batch', 'what are the timings', 'class schedule', 'when does it start'],
    devanagariKeywords: ['टाइमिंग', 'वेळ', 'सकाळ', 'संध्याकाळ', 'बैच'],
    weight: 6
  },
  {
    intent: 'location_enquiry',
    keywords: ['location', 'address', 'branch', 'center', 'centre', 'where', 'office', 'campus', 'near', 'city', 'distance', 'offline', 'online'],
    phrases: ['where is', 'which city', 'nearest branch', 'location of', 'address of', 'do you have a center near', 'which location'],
    devanagariKeywords: ['स्थान', 'पता', 'शाखा', 'कहाँ है', 'ठिकाण'],
    weight: 5
  },

  // Visit, Appointment, Follow-up
  {
    intent: 'campus_visit_request',
    keywords: ['visit', 'come', 'tour', 'campus', 'office', 'drop by', 'walk in', 'see the facility'],
    phrases: ['I want to visit', 'can I come', 'campus visit', 'visit your center', 'come to your office', 'when can I visit', 'tour the campus'],
    devanagariKeywords: ['भेट द्यायची', 'विजिट करना', 'देखने आना'],
    weight: 7
  },
  {
    intent: 'counselling_appointment',
    keywords: ['appointment', 'counselling', 'counseling', 'session', 'meet', 'meeting', 'talk', 'call', 'consultation', 'demo', 'demo class', 'free class'],
    phrases: ['book an appointment', 'schedule a session', 'can I meet', '1 on 1', 'book a counselling', 'free demo class', 'attend a demo', 'schedule a call'],
    devanagariKeywords: ['अपॉइंटमेंट', 'मुलाखत', 'डेमो क्लास'],
    weight: 7
  },
  {
    intent: 'follow_up_request',
    keywords: ['callback', 'call back', 'follow up', 'later', 'tomorrow', 'remind', 'contact me', 'reach me', 'get back'],
    phrases: ['can you call me later', 'please follow up', 'get back to me', 'callback request', 'call me tomorrow', 'message me later'],
    devanagariKeywords: ['वापस कॉल करो', 'नंतर कॉल करा'],
    weight: 6
  },

  // Exam preference
  {
    intent: 'exam_preference',
    keywords: ['jee', 'neet', 'mhtcet', 'mht cet', 'ielts', 'gre', 'gmat', 'cat', 'upsc', 'gate', 'sat', 'toefl', 'competitive', 'entrance exam', 'preparation'],
    phrases: ['preparing for', 'appearing for', 'targeting', 'want to crack', 'jee preparation', 'neet coaching', 'study abroad'],
    devanagariKeywords: ['परीक्षा', 'जेईई', 'नीट', 'प्रवेश परीक्षा'],
    weight: 7
  },

  // Application status
  {
    intent: 'application_status',
    keywords: ['status', 'applied', 'application', 'pending', 'approved', 'confirmed', 'when will', 'result', 'response'],
    phrases: ['what is the status', 'has my application', 'when will I hear', 'application status', 'confirm my enrollment'],
    weight: 5
  },

  // Objection
  {
    intent: 'objection_hesitation',
    keywords: ['expensive', 'costly', 'too much', 'cannot afford', 'not sure', 'thinking', 'maybe', 'later', 'parents', 'family', 'discuss', 'no job guarantee', 'worried', 'doubt', 'trust'],
    phrases: ['let me think', 'I need to discuss', 'talk to my parents', 'not sure about', 'too expensive for me', 'worried about', 'what if'],
    devanagariKeywords: ['सोचना है', 'बहुत महंगा', 'घरवालों से', 'माहेरच्यांशी बोलायचे आहे'],
    weight: 6
  },

  // Confirmation / Rejection / Goodbye
  {
    intent: 'confirmation',
    keywords: ['yes', 'yep', 'yeah', 'sure', 'ok', 'okay', 'confirmed', 'proceed', 'confirm', 'go ahead', 'agreed', 'correct', 'right', 'sounds good'],
    phrases: ['yes please', 'that works', 'sounds good', 'I agree', 'please proceed', 'you are correct'],
    devanagariKeywords: ['हाँ', 'ठीक है', 'हो', 'ठीक आहे'],
    weight: 4
  },
  {
    intent: 'rejection',
    keywords: ['no', 'nope', 'not interested', 'stop', 'don\'t contact', 'unsubscribe', 'opt out', 'remove', 'not now', 'cancel', 'never mind'],
    phrases: ['not interested', 'please stop', 'do not contact', 'remove my data', 'I don\'t want', 'not at this time'],
    devanagariKeywords: ['नहीं', 'रुको', 'नको'],
    weight: 5
  },
  {
    intent: 'goodbye',
    keywords: ['bye', 'goodbye', 'see you', 'later', 'thanks', 'thank you', 'that\'s all', 'done', 'exit', 'close'],
    phrases: ['thank you bye', 'see you later', 'goodbye for now', 'that\'s all I needed', 'thanks for the info'],
    devanagariKeywords: ['धन्यवाद', 'अलविदा', 'धन्यवाद bye'],
    weight: 3
  }
];

export function detectIntents(
  normalized: NormalizedTextResult,
  profile: StudentProfile,
  conversationHistory: string[]
): IntentMatch[] {
  const text = normalized.normalized;
  const raw = normalized.raw.toLowerCase();
  const tokens = new Set(normalized.tokens);

  const results: IntentMatch[] = [];

  for (const rule of INTENT_RULES) {
    const matchedKeywords: string[] = [];
    const matchedPatterns: string[] = [];
    let score = 0;

    // Keyword matching
    for (const kw of rule.keywords) {
      if (text.includes(kw) || raw.includes(kw)) {
        matchedKeywords.push(kw);
        score += rule.weight * 0.6;
        break; // One keyword match is enough for initial detection; continue phrase matching
      }
    }

    // Count ALL keyword hits for higher confidence
    for (const kw of rule.keywords) {
      if (tokens.has(kw)) {
        if (!matchedKeywords.includes(kw)) {
          matchedKeywords.push(kw);
          score += rule.weight * 0.3;
        }
      }
    }

    // Phrase matching (higher weight)
    for (const phrase of rule.phrases) {
      const pLower = phrase.toLowerCase();
      if (text.includes(pLower) || raw.includes(pLower)) {
        matchedPatterns.push(phrase);
        score += rule.weight * 1.2;
      }
    }

    // Devanagari keyword matching
    if (rule.devanagariKeywords) {
      for (const kw of rule.devanagariKeywords) {
        if (raw.includes(kw)) {
          matchedKeywords.push(kw);
          score += rule.weight * 0.8;
        }
      }
    }

    // Context boost: if profile.lastIntent matches contextBoost keys
    if (rule.contextBoost && profile.lastIntent) {
      const boost = rule.contextBoost[profile.lastIntent];
      if (boost) score += boost;
    }

    if (score > 0) {
      const confidence = Math.min(score / (rule.weight * 2.5), 1.0);
      if (confidence >= 0.1) {
        results.push({
          intent: rule.intent,
          confidence,
          matchedKeywords,
          matchedPatterns
        });
      }
    }
  }

  // Sort by confidence descending, tie-break using INTENT_RULES weight
  const weightMap = new Map(INTENT_RULES.map(r => [r.intent, r.weight]));
  return results.sort((a, b) => {
    if (Math.abs(b.confidence - a.confidence) > 0.05) {
      return b.confidence - a.confidence;
    }
    return (weightMap.get(b.intent) || 0) - (weightMap.get(a.intent) || 0);
  });
}

export function getPrimaryIntent(matches: IntentMatch[]): IntentType {
  if (matches.length === 0) return 'unknown';
  return matches[0].intent;
}
