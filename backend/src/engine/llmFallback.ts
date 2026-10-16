import 'dotenv/config';
import { Course, Lead, StudentProfile, Language, DecisionTrace } from '../db/types';

export interface LLMFallbackConfig {
  geminiApiKey?: string;
  grokApiKey?: string;
  preferredProvider?: 'gemini' | 'grok' | 'auto';
  fallbackMode?: 'hybrid' | 'always_llm' | 'deterministic_only';
}

export interface LLMFallbackInput {
  message: string;
  lead: Lead;
  courses: Course[];
  conversationHistory: string[];
  instituteName?: string;
  deterministicTrace?: DecisionTrace;
}

export interface LLMFallbackOutput {
  responseText: string;
  provider: 'gemini' | 'grok' | 'database_search';
  modelUsed: string;
  recommendedCourseIds: string[];
  profileUpdates: Partial<StudentProfile>;
  reasoning: string;
  success: boolean;
}

// In-memory or env config
let activeConfig: LLMFallbackConfig = {
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '',
  grokApiKey: process.env.GROK_API_KEY || process.env.XAI_API_KEY || '',
  preferredProvider: 'auto',
  fallbackMode: 'hybrid',
};

export function updateLLMConfig(newConfig: Partial<LLMFallbackConfig>) {
  activeConfig = { ...activeConfig, ...newConfig };
}

export function getLLMConfig(): {
  geminiConfigured: boolean;
  grokConfigured: boolean;
  preferredProvider: string;
  fallbackMode: string;
} {
  const geminiKey = activeConfig.geminiApiKey || process.env.GEMINI_API_KEY || '';
  const grokKey = activeConfig.grokApiKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY || '';
  return {
    geminiConfigured: !!(geminiKey && geminiKey.length > 5),
    grokConfigured: !!(grokKey && grokKey.length > 5),
    preferredProvider: activeConfig.preferredProvider || 'auto',
    fallbackMode: activeConfig.fallbackMode || 'hybrid',
  };
}

/**
 * Perform a database-grounded search across the institute's courses.
 * Used when no LLM key is present or when all API calls fail.
 */
export function searchDatabaseCourses(
  query: string,
  courses: Course[],
  profile: StudentProfile
): {
  matchedCourses: Course[];
  suggestedProfileUpdates: Partial<StudentProfile>;
  searchSummary: string;
} {
  const q = query.toLowerCase();
  const tokens = q.split(/[\s,?.!]+/).filter(t => t.length > 2);

  const scoredCourses = courses.map(c => {
    let score = 0;
    const nameLower = c.name.toLowerCase();
    const catLower = c.category.toLowerCase();
    const descLower = c.description.toLowerCase();
    const hlLower = (c.highlights || []).join(' ').toLowerCase();

    // Specific TechSummit courses
    if (q.includes('mern') && nameLower.includes('mern')) {
      score += 200;
    }
    if (q.includes('python') && nameLower.includes('python')) {
      score += 200;
    }
    if ((q.includes('java') || q.includes('spring')) && nameLower.includes('java')) {
      score += 200;
    }
    if ((q.includes('testing') || q.includes('qa') || q.includes('automation') || q.includes('selenium')) && nameLower.includes('testing')) {
      score += 200;
    }
    if ((q.includes('data science') || q.includes('analytics')) && nameLower.includes('data science')) {
      score += 200;
    }

    // Generic domain keywords
    if ((q.includes('full stack') || q.includes('fullstack') || q.includes('web dev') || q.includes('software')) &&
        (nameLower.includes('full stack') || catLower.includes('software'))) {
      score += 100;
    }

    if ((q.includes('ai') || q.includes('machine learning')) &&
        (nameLower.includes('ai') || nameLower.includes('data science'))) {
      score += 100;
    }

    if (q.includes('jee') && (nameLower.includes('jee') || catLower.includes('engineering entrance'))) {
      score += 80;
    }

    if (q.includes('neet') && (nameLower.includes('neet') || catLower.includes('medical entrance'))) {
      score += 80;
    }

    if ((q.includes('cet') || q.includes('mht')) && (nameLower.includes('cet') || nameLower.includes('mht'))) {
      score += 80;
    }

    if ((q.includes('abroad') || q.includes('ielts') || q.includes('gre')) && (nameLower.includes('ielts') || catLower.includes('study abroad'))) {
      score += 80;
    }

    // Token matching
    for (const token of tokens) {
      if (nameLower.includes(token)) score += 20;
      if (catLower.includes(token)) score += 10;
      if (descLower.includes(token)) score += 5;
      if (hlLower.includes(token)) score += 5;
    }

    return { course: c, score };
  });

  scoredCourses.sort((a, b) => b.score - a.score);
  const bestMatches = scoredCourses.filter(sc => sc.score >= 20).map(sc => sc.course);

  const updates: Partial<StudentProfile> = {};
  if (bestMatches.length > 0) {
    const top = bestMatches[0];
    updates.courseInterest = top.name;
    // Clear old conflicting exam target if searching technical or abroad courses
    if (top.category.includes('Technical') || top.category.includes('Software')) {
      updates.examTarget = undefined;
    }
  }

  return {
    matchedCourses: bestMatches,
    suggestedProfileUpdates: updates,
    searchSummary: bestMatches.length > 0
      ? `Found ${bestMatches.length} matching courses in database: ${bestMatches.map(c => c.name).join(', ')}`
      : 'No exact keyword match in current course catalogue',
  };
}

/**
 * Generate grounding prompt for LLM containing full courses database
 */
function buildGroundingPrompt(input: LLMFallbackInput): { systemPrompt: string; userPrompt: string } {
  const { message, lead, courses, conversationHistory, instituteName } = input;
  const p = lead.profile;

  const catalogueJson = JSON.stringify(
    courses.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      fee: c.feeAmount || c.fee,
      feeDisplay: c.feeDisplay,
      feeType: c.feeType || 'starting_from',
      duration: c.duration,
      durationMonths: c.durationMonths,
      durationWeeks: c.durationWeeks,
      emiAvailable: c.emiAvailable,
      schedules: c.schedules,
      locations: c.locations,
      deliveryModes: c.deliveryModes,
      technologies: c.technologies,
      highlights: c.highlights,
      modules: (c.curriculumModules || []).map(m => m.title),
      placementDisclaimer: c.placementDisclaimer
    })),
    null,
    2
  );

  const systemPrompt = `You are Enrolix, a verified AI admissions and course counselling assistant for ${instituteName || 'TechSummitTrainers / Enrolix Education'}.

YOUR VERIFIED COURSE DATABASE (GROUND TRUTH):
${catalogueJson}

OFFICIAL INSTITUTE FACTS (TechSummitTrainers):
- Official Website: https://techsummittrainers.com
- Location: Office No. 509, Kushal Wallstreet, Fergusson College Road, Shivajinagar, Pune 411004
- Contact Phone: +91 84858 46806
- Contact Email: admin@techsummittrainers.com
- Learning Modes: Classroom training at FC Road, Pune & Live Interactive Online
- Demo Class: Free demo class available. Students can request a callback or contact +91 84858 46806 directly.
- Career Support & Placement: Dedicated resume building, LinkedIn optimization, mock interviews, and job-search assistance.
- CRITICAL DISCLAIMER: The institute explicitly does NOT guarantee 100% placement or specific salaries.

STUDENT PROFILE:
- Name: ${p.name || 'Student'}
- Previous Stated Course: ${p.courseInterest || 'None'}
- Academic Class: ${p.academicLevel || 'Not specified'}
- Disclosed Budget: ₹${p.budgetMin || 0} - ₹${p.budgetMax || 0}
- Location: ${p.location || 'Pune'}
- Preferred Language: ${p.preferredLanguage || 'English'}

MANDATORY AI SYSTEM RULES (STRICT GROUNDING):
1. Factual Grounding: Answer institute-specific questions ONLY using retrieved TechSummitTrainers database records. Never invent a fee, discount, scholarship, batch date, timetable, available seat, placement guarantee, or syllabus topic.
2. Starting Fee Rule: If a course fee has feeType 'starting_from' or says "starting from ₹40,000", NEVER present it as a guaranteed fixed final fee. Always state that the fee is starting from ₹X with easy EMI options available.
3. Batch Date Rule: If next-batch date is missing, has passed, or is unconfirmed, do NOT invent or state upcoming dates.
4. No 100% Placement Guarantee: NEVER promise 100% placement or guaranteed job offers. Explicitly preserve the institute disclaimer: TechSummitTrainers provides comprehensive career coaching, resume preparation, and job support, but does not guarantee 100% placement.
5. Salary Ranges: Distinguish published market salary ranges (e.g. ₹3–8 LPA for freshers) from guaranteed salaries.
6. Missing Information / Unverified Details: If any requested detail is missing from the database or cannot be verified, you MUST state:
"I couldn't verify that detail from the currently available course information. I can connect you with a counsellor for confirmation."
7. Tone & Style: Friendly, professional, concise admissions counselor. Support English, Hindi, and Marathi naturally according to student preference.
8. Output Format:
Respond DIRECTLY with your conversational response for the student.
Use neat, polished markdown formatting with bullet points and bold headers.
Do NOT wrap your entire response in JSON or code fences. Write naturally and clearly.`;

  const historyFormatted = conversationHistory.slice(-6).join('\n');
  const userPrompt = `Recent conversation:\n${historyFormatted || '(Beginning of chat)'}\n\nStudent's latest message:\n"${message}"\n\nPlease answer accurately based on the course database:`;

  return { systemPrompt, userPrompt };
}

/**
 * Call Google Gemini API
 */
async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  const models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048
        }
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Gemini API error ${resp.status} (${model}): ${errText}`);
      }

      const data: any = await resp.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) return rawText;
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('Gemini API call returned empty response');
}

/**
 * Call Grok (xAI) or Groq API
 */
async function callGrok(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  const isGroq = apiKey.startsWith('gsk_');
  const url = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.x.ai/v1/chat/completions';
  const models = isGroq ? ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b'] : ['grok-2-latest', 'grok-beta'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const payload = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2048
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`API error ${resp.status} (${model}): ${errText}`);
      }

      const data: any = await resp.json();
      const rawText = data?.choices?.[0]?.message?.content;
      if (rawText) return rawText;
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('API call returned empty response');
}

/**
 * Robust cleaner to extract clean natural text and strip any raw JSON debris
 */
export function cleanResponseText(raw: string): string {
  if (!raw) return '';
  let text = raw.trim();

  // Strip markdown code fences
  text = text.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/i, '').trim();

  // 1. Try strict JSON parse
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.reply) {
        return String(parsed.reply).trim();
      }
    }
  } catch {
    // Proceed to regex recovery
  }

  // 2. Regex recovery for {"reply": "..."} or partial / truncated JSON
  const replyMatch = text.match(/["']reply["']\s*:\s*["']([\s\S]*)/i);
  if (replyMatch) {
    let extracted = replyMatch[1];
    // Strip next JSON field or closing brackets
    extracted = extracted.replace(/["']\s*,\s*["'][a-zA-Z_]+["'][\s\S]*$/, '');
    extracted = extracted.replace(/["']\s*\}?\s*$/, '');
    extracted = extracted.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'");
    if (extracted.trim().length > 0) {
      return extracted.trim();
    }
  }

  // 3. Fallback: strip leading JSON syntax like { "reply": "
  text = text.replace(/^\{\s*["']?reply["']?\s*:\s*["']?/i, '');
  text = text.replace(/["']?\s*\}?\s*$/i, '');
  return text.trim();
}

/**
 * Helper to parse LLM JSON output cleanly
 */
function parseLLMResponse(raw: string): {
  reply: string;
  recommendedCourseIds: string[];
  updatedProfile: Partial<StudentProfile>;
  reasoning: string;
} {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.reply) {
        return {
          reply: cleanResponseText(parsed.reply),
          recommendedCourseIds: Array.isArray(parsed.recommendedCourseIds) ? parsed.recommendedCourseIds : [],
          updatedProfile: parsed.updatedProfile || {},
          reasoning: parsed.reasoning || 'Extracted through LLM database reasoning',
        };
      }
    }
  } catch (err) {
    // Proceed to robust extraction
  }

  const cleanReply = cleanResponseText(raw);
  return {
    reply: cleanReply,
    recommendedCourseIds: [],
    updatedProfile: {},
    reasoning: 'Extracted response from LLM',
  };
}

/**
 * Main execution function with full fallback chain:
 * 1. Gemini API (if key available)
 * 2. Grok API (if key available)
 * 3. Intelligent Database Semantic Search Fallback
 */
export async function executeLLMFallback(input: LLMFallbackInput): Promise<LLMFallbackOutput> {
  const { systemPrompt, userPrompt } = buildGroundingPrompt(input);
  const geminiKey = activeConfig.geminiApiKey || process.env.GEMINI_API_KEY || '';
  const grokKey = activeConfig.grokApiKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY || '';

  // Order of preference
  const tryGeminiFirst = activeConfig.preferredProvider !== 'grok';

  // 1. Try first choice
  if (tryGeminiFirst && geminiKey) {
    try {
      const raw = await callGemini(systemPrompt, userPrompt, geminiKey);
      const parsed = parseLLMResponse(raw);
      return {
        responseText: parsed.reply,
        provider: 'gemini',
        modelUsed: 'gemini-2.0-flash',
        recommendedCourseIds: parsed.recommendedCourseIds,
        profileUpdates: parsed.updatedProfile,
        reasoning: parsed.reasoning,
        success: true,
      };
    } catch (err: any) {
      console.warn('Gemini fallback failed, trying next provider:', err.message);
    }
  } else if (!tryGeminiFirst && grokKey) {
    try {
      const raw = await callGrok(systemPrompt, userPrompt, grokKey);
      const parsed = parseLLMResponse(raw);
      return {
        responseText: parsed.reply,
        provider: 'grok',
        modelUsed: 'grok-2-latest',
        recommendedCourseIds: parsed.recommendedCourseIds,
        profileUpdates: parsed.updatedProfile,
        reasoning: parsed.reasoning,
        success: true,
      };
    } catch (err: any) {
      console.warn('Grok fallback failed, trying next provider:', err.message);
    }
  }

  // 2. Try second choice
  if (tryGeminiFirst && grokKey) {
    try {
      const raw = await callGrok(systemPrompt, userPrompt, grokKey);
      const parsed = parseLLMResponse(raw);
      return {
        responseText: parsed.reply,
        provider: 'grok',
        modelUsed: 'grok-2-latest',
        recommendedCourseIds: parsed.recommendedCourseIds,
        profileUpdates: parsed.updatedProfile,
        reasoning: parsed.reasoning,
        success: true,
      };
    } catch (err: any) {
      console.warn('Grok fallback failed:', err.message);
    }
  } else if (!tryGeminiFirst && geminiKey) {
    try {
      const raw = await callGemini(systemPrompt, userPrompt, geminiKey);
      const parsed = parseLLMResponse(raw);
      return {
        responseText: parsed.reply,
        provider: 'gemini',
        modelUsed: 'gemini-2.0-flash',
        recommendedCourseIds: parsed.recommendedCourseIds,
        profileUpdates: parsed.updatedProfile,
        reasoning: parsed.reasoning,
        success: true,
      };
    } catch (err: any) {
      console.warn('Gemini fallback failed:', err.message);
    }
  }

  // 3. Database-grounded Search Fallback (Zero external API dependencies)
  const qLower = input.message.toLowerCase();

  // Strict Policy Rule: Placement Guarantee & Disclaimers
  if (qLower.includes('placement') || qLower.includes('job guarantee') || qLower.includes('100%')) {
    return {
      responseText: "TechSummitTrainers provides comprehensive career support including resume and LinkedIn building, mentor mock interviews, and job-search assistance. However, the institute explicitly states that it does NOT guarantee 100% placement or specific salaries.",
      provider: 'database_search',
      modelUsed: 'Enrolix Grounded Policy Engine',
      recommendedCourseIds: [],
      profileUpdates: {},
      reasoning: 'Enforced official institute non-100% placement disclaimer',
      success: true
    };
  }

  // Strict Policy Rule: Demo class booking
  if (qLower.includes('demo') || qLower.includes('free trial') || qLower.includes('trial class')) {
    return {
      responseText: "Demo sessions at TechSummitTrainers are completely free. You can request a callback or contact the institute directly at +91 84858 46806 to attend an upcoming live demo session.",
      provider: 'database_search',
      modelUsed: 'Enrolix Grounded Policy Engine',
      recommendedCourseIds: [],
      profileUpdates: {},
      reasoning: 'Enforced official demo class policy',
      success: true
    };
  }

  // Strict Policy Rule: Location and contact
  if (qLower.includes('location') || qLower.includes('address') || qLower.includes('where is')) {
    return {
      responseText: "TechSummitTrainers is located at: Office No. 509, Kushal Wallstreet, Fergusson College Road, Shivajinagar, Pune 411004. Contact: +91 84858 46806; email: admin@techsummittrainers.com. Learning modes include both classroom and interactive online live.",
      provider: 'database_search',
      modelUsed: 'Enrolix Grounded Policy Engine',
      recommendedCourseIds: [],
      profileUpdates: {},
      reasoning: 'Enforced official institute location and contact record',
      success: true
    };
  }

  // Strict Grounding Rule: Unverified discount, scholarship, or timetable invention refusal
  if (qLower.includes('discount') || qLower.includes('scholarship') || qLower.includes('2am') || qLower.includes('3am') || qLower.includes('midnight')) {
    return {
      responseText: "I couldn't verify that detail from the currently available course information. I can connect you with a counsellor for confirmation.",
      provider: 'database_search',
      modelUsed: 'Enrolix Grounded Policy Engine',
      recommendedCourseIds: [],
      profileUpdates: {},
      reasoning: 'Refused to invent unverified discount or timetable slot; offered counsellor handoff',
      success: true
    };
  }

  const searchResult = searchDatabaseCourses(input.message, input.courses, input.lead.profile);
  if (searchResult.matchedCourses.length > 0) {
    const topCourse = searchResult.matchedCourses[0];
    const isLangMarathi = input.lead.profile.preferredLanguage === 'mr';
    const isLangHindi = input.lead.profile.preferredLanguage === 'hi';

    let reply = '';
    if (isLangMarathi) {
      reply = `आपण **${topCourse.name}** बद्दल विचारले आहे. आमच्या डेटाबेसमधील या कोर्सची संपूर्ण माहिती खालीलप्रमाणे आहे:\n\n` +
        `• **फी:** ${topCourse.feeDisplay}\n` +
        `• **कालावधी:** ${topCourse.duration}\n` +
        `• **बॅच वेळा:** ${(topCourse.schedules || []).join(', ')}\n` +
        `• **केंद्रे:** ${(topCourse.locations || []).join(', ')}\n\n` +
        `**कोर्स हायलाइट्स:**\n${(topCourse.highlights || []).slice(0, 3).map(h => `• ${h}`).join('\n')}\n\n` +
        `आपल्याला या बॅचच्या नोंदणी किंवा डेमो क्लासबद्दल अधिक माहिती हवी आहे का?`;
    } else if (isLangHindi) {
      reply = `आपने **${topCourse.name}** के बारे में पूछा है। हमारे डेटाबेस में उपलब्ध इस प्रोग्राम की जानकारी:\n\n` +
        `• **फीस:** ${topCourse.feeDisplay}\n` +
        `• **अवधि:** ${topCourse.duration}\n` +
        `• **बैच समय:** ${(topCourse.schedules || []).join(', ')}\n` +
        `• **सेंटर्स:** ${(topCourse.locations || []).join(', ')}\n\n` +
        `**मुख्य विशेषताएं:**\n${(topCourse.highlights || []).slice(0, 3).map(h => `• ${h}`).join('\n')}\n\n` +
        `क्या आप इस बैच के रजिस्ट्रेशन या सिलेबस विवरण के बारे में जानना चाहते हैं?`;
    } else {
      reply = `Here is the full information from our course catalogue for **${topCourse.name}**:\n\n` +
        `• **Fee Structure:** ${topCourse.feeDisplay}\n` +
        `• **Duration:** ${topCourse.duration}\n` +
        `• **Available Batches:** ${(topCourse.schedules || []).join(' | ')}\n` +
        `• **Centers:** ${(topCourse.locations || []).join(', ')}\n` +
        `• **Eligibility:** ${topCourse.eligibility}\n\n` +
        `**Key Highlights:**\n${(topCourse.highlights || []).slice(0, 4).map(h => `• ${h}`).join('\n')}\n\n` +
        `Would you like to reserve a seat, attend a free trial session, or speak with an admissions counsellor?`;
    }

    return {
      responseText: reply,
      provider: 'database_search',
      modelUsed: 'Enrolix Database Semantic Search Engine',
      recommendedCourseIds: searchResult.matchedCourses.map(c => c.id),
      profileUpdates: searchResult.suggestedProfileUpdates,
      reasoning: searchResult.searchSummary,
      success: true,
    };
  }

  // 4. Default helpful database overview
  const availablePrograms = input.courses.map(c => `• **${c.name}** (${c.feeDisplay})`).join('\n');
  return {
    responseText: `We currently offer the following programs at our centers and online:\n\n${availablePrograms}\n\nWould you like more details on any of these courses or a 1-on-1 consultation with our senior counsellor?`,
    provider: 'database_search',
    modelUsed: 'Enrolix Course Directory',
    recommendedCourseIds: input.courses.slice(0, 3).map(c => c.id),
    profileUpdates: {},
    reasoning: 'General database catalogue response',
    success: false,
  };
}
