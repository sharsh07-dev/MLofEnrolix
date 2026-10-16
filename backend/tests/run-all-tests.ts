import assert from 'node:assert';
import { normalizeText } from '../src/engine/normalizer';
import { extractEntities, mergeEntitiesIntoProfile } from '../src/engine/entityExtractor';
import { detectIntents, getPrimaryIntent } from '../src/engine/intentDetector';
import { recommendCourses } from '../src/engine/courseRecommender';
import { calculateLeadScore } from '../src/engine/leadScorer';
import { checkDuplicate } from '../src/engine/utils';
import { runConversationEngine } from '../src/engine/conversationEngine';
import { StudentProfile, Course, Lead } from '../src/db/types';
import { SEED_COURSES, SEED_LEADS } from '../src/db/seedData';

let passedCount = 0;
let failedCount = 0;

function test(name: string, fn: () => void | Promise<void>) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedCount++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    failedCount++;
  }
}

async function runAsyncTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedCount++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    failedCount++;
  }
}

console.log('\n==================================================');
console.log('🧪 ENROLIX TEST SUITE: Deterministic AI Engine');
console.log('==================================================\n');

// 1. NORMALIZER TESTS
console.log('--- 1. Text Normalizer & Script Detection ---');
test('Normalizes common typos in admissions inquiries', () => {
  const result = normalizeText('What is the cource feees for admisson?');
  assert(result.normalized.includes('course'), 'Typos "cource" should become "course"');
  assert(result.normalized.includes('fees'), 'Typos "feees" should become "fees"');
  assert(result.normalized.includes('admission'), 'Typos "admisson" should become "admission"');
  assert.strictEqual(result.detectedScript, 'latin');
});

test('Detects Devanagari script and language hints for Hindi / Marathi', () => {
  const hiResult = normalizeText('नमस्ते! मुझे जेईई की फीस जाननी है');
  assert.strictEqual(hiResult.detectedScript, 'devanagari');
  assert.strictEqual(hiResult.detectedLanguageHint, 'hi');

  const mrResult = normalizeText('नमस्कार! मला नीट प्रवेशाबद्दल माहिती हवी आहे');
  assert.strictEqual(mrResult.detectedScript, 'devanagari');
  assert.strictEqual(mrResult.detectedLanguageHint, 'mr');
});

test('Normalizes Hinglish transliterations into standardized tokens', () => {
  const result = normalizeText('kitna fees lagega batch timing kab hai');
  assert(result.normalized.includes('fees'));
  assert(result.tokens.length > 0);
});

// 2. ENTITY EXTRACTOR TESTS
console.log('\n--- 2. Entity & Fact Extraction ---');
const dummyProfile: StudentProfile = {
  id: 'prof-test',
  leadId: 'lead-test',
  preferredLanguage: 'en',
  facts: [],
};

test('Extracts phone numbers in multiple standard Indian formats', () => {
  const t1 = extractEntities(normalizeText('My phone is +91 98765 43210 please call'), dummyProfile);
  assert.strictEqual(t1.phone, '+91 9876543210');

  const t2 = extractEntities(normalizeText('Contact me at 9823012345 or via email'), dummyProfile);
  assert.strictEqual(t2.phone, '+91 9823012345');
});

test('Extracts emails reliably', () => {
  const res = extractEntities(normalizeText('Send brochure to rahul.deshmukh@gmail.com please'), dummyProfile);
  assert.strictEqual(res.email, 'rahul.deshmukh@gmail.com');
});

test('Extracts academic class and exam target', () => {
  const res = extractEntities(normalizeText('I am currently studying in Class 12 preparing for JEE Main 2026'), dummyProfile);
  assert.strictEqual(res.academicLevel, 'Class 12');
  assert.strictEqual(res.examTarget, 'JEE Main');
});

test('Extracts budget ranges with min and max approximation', () => {
  const res = extractEntities(normalizeText('My budget is around 50k for this academic year'), dummyProfile);
  assert(res.budgetMin && res.budgetMin <= 50000, 'Min should be approx <= 50000');
  assert(res.budgetMax && res.budgetMax >= 50000, 'Max should be approx >= 50000');
});

test('Extracts schedule and branch location preferences', () => {
  const res = extractEntities(normalizeText('I want evening batch near Wakad branch'), dummyProfile);
  assert.strictEqual(res.preferredSchedule, 'Evening batches');
  assert.strictEqual(res.location, 'Wakad, Pune');
});

test('Merges entities into student profile with fact tracking and change detection', () => {
  const profile: StudentProfile = {
    id: 'prof-test',
    leadId: 'lead-test',
    preferredLanguage: 'en',
    facts: [],
  };

  const entities = {
    name: 'Aarav Mehta',
    academicLevel: 'Class 12',
    examTarget: 'JEE Main',
    budgetMin: 45000,
    budgetMax: 55000,
  };

  const updates = mergeEntitiesIntoProfile(profile, entities);
  assert.strictEqual(updates.name, 'Aarav Mehta');
  assert.strictEqual(updates.academicLevel, 'Class 12');
  assert.strictEqual(updates.examTarget, 'JEE Main');
  assert.strictEqual(updates.budgetMax, 55000);
  assert(updates.confirmedFacts && Object.keys(updates.confirmedFacts).length >= 3, 'Should record fact lineage');
});

// 3. INTENT DETECTION TESTS
console.log('\n--- 3. Intent Classification Rules & Confidence ---');
test('Identifies fee inquiry intent with high confidence', () => {
  const text = normalizeText('Can you tell me the total fee structure and payment installments?');
  const intents = detectIntents(text, dummyProfile, []);
  const primary = getPrimaryIntent(intents);
  assert.strictEqual(primary, 'fee_enquiry');
  assert(intents[0].confidence >= 0.5);
});

test('Identifies human counsellor escalation intent immediately', () => {
  const text = normalizeText('I want to speak with a human counsellor or manager right now');
  const intents = detectIntents(text, dummyProfile, []);
  const primary = getPrimaryIntent(intents);
  assert.strictEqual(primary, 'human_counsellor_request');
  assert(intents[0].confidence >= 0.7);
});

test('Detects negative sentiment / complaints for priority escalation', () => {
  const text = normalizeText('This is terrible service and fake promises, completely unacceptable');
  const intents = detectIntents(text, dummyProfile, []);
  const primary = getPrimaryIntent(intents);
  assert.strictEqual(primary, 'complaint');
});

test('Identifies multilingual Marathi fee inquiry', () => {
  const text = normalizeText('या कोर्सची फी किती आहे आणि स्कॉलरशिप मिळेल का?');
  const intents = detectIntents(text, dummyProfile, []);
  const primary = getPrimaryIntent(intents);
  assert(primary === 'fee_enquiry' || primary === 'scholarship_enquiry');
});

// 4. COURSE RECOMMENDER TESTS
console.log('\n--- 4. Course Recommender Engine ---');
test('Ranks courses by exam target, grade level, and budget matching', () => {
  const profile: StudentProfile = {
    id: 'prof-test',
    leadId: 'lead-test',
    examTarget: 'JEE Main',
    academicLevel: 'Class 12',
    budgetMax: 60000,
    preferredLanguage: 'en',
    facts: [],
  };

  const recommendations = recommendCourses(profile, SEED_COURSES);
  assert(recommendations.length > 0, 'Should find matching courses');
  assert(recommendations[0].course.category.includes('Engineering'), 'Top recommendation should be Engineering');
  assert(recommendations[0].score > 30, 'Matching course should score high');
});

test('Flags budget gap when student budget is below course fee', () => {
  const profile: StudentProfile = {
    id: 'prof-test',
    leadId: 'lead-test',
    examTarget: 'JEE Main',
    academicLevel: 'Class 11',
    budgetMax: 20000, // Course fee is 95000
    preferredLanguage: 'en',
    facts: [],
  };

  const recommendations = recommendCourses(profile, SEED_COURSES);
  const jeeCourse = recommendations.find(r => r.course.category.includes('Engineering'));
  assert(jeeCourse, 'Should match JEE course');
  assert(jeeCourse.gaps.some(g => g.toLowerCase().includes('budget')), 'Should flag budget gap');
});

// 5. LEAD SCORER TESTS
console.log('\n--- 5. Lead Qualification & Scoring ---');
test('Awards points for rich profile indicators and transitions stage', () => {
  const profile: StudentProfile = {
    id: 'prof-test',
    leadId: 'lead-test',
    name: 'Neha Sharma',
    phone: '+919876543210',
    email: 'neha@example.com',
    examTarget: 'NEET',
    academicLevel: 'Class 12',
    budgetMax: 70000,
    preferredSchedule: 'evening',
    location: 'Kothrud',
    admissionTimeline: 'immediate',
    preferredLanguage: 'en',
    facts: [],
  };

  const result = calculateLeadScore(profile, []);
  assert(result.newScore >= 60, `Score should be >= 60, got ${result.newScore}`);
  assert.strictEqual(result.newStage, 'Qualified', `Stage should be Qualified, got ${result.newStage}`);
  assert(result.newReasons.length >= 4, 'Should record granular score reasons');
});

// 6. DUPLICATE DETECTION TESTS
console.log('\n--- 6. Duplicate Lead Detection ---');
test('Detects exact duplicate lead via normalized phone number', () => {
  const check = checkDuplicate('098231 10022', undefined, undefined, SEED_LEADS, 'lead-new');
  assert.strictEqual(check.isDuplicate, true);
  assert(check.existingLeadId !== undefined);
  assert(check.confidence >= 70);
});

async function runAll() {
  // 7. CONVERSATION ENGINE END-TO-END TESTS
  console.log('\n--- 7. Deterministic Conversation Engine End-to-End ---');
  await runAsyncTest('Handles initial multi-slot message with full decision trace', async () => {
    const lead = SEED_LEADS[0];
    const output = await runConversationEngine({
      message: 'Hello, I am in Class 12 and want to prepare for JEE Main. My budget is 50000 and prefer evening in Wakad',
      lead,
      courses: SEED_COURSES,
      conversationHistory: [],
    });

    assert(output.responseText.length > 20, 'Response should be detailed');
    assert(output.decisionTrace.intentsDetected.length > 0, 'Decision trace must capture intents');
    assert.strictEqual(output.updatedProfile.academicLevel, 'Class 12');
    assert.strictEqual(output.updatedProfile.examTarget, 'JEE Main');
    assert(output.decisionTrace.ruleMatched !== undefined, 'Rule matched must be recorded');
  });

  await runAsyncTest('Triggers human handoff when requested explicitly', async () => {
    const lead = SEED_LEADS[0];
    const output = await runConversationEngine({
      message: 'I want to speak directly with an admissions counsellor right now',
      lead,
      courses: SEED_COURSES,
      conversationHistory: ['Hello'],
    });

    assert(output.shouldHandOff, 'shouldHandOff flag should be true');
    assert(output.responseText.toLowerCase().includes('counsellor') || output.responseText.toLowerCase().includes('connect'), 'Response confirms human transfer');
  });

  await runAsyncTest('Correctly switches context to Full Stack course when student shifts interest', async () => {
    // Rohan Deshmukh had previous MHT-CET interest
    const rohanLead = SEED_LEADS.find(l => l.id === 'lead-rohan') || SEED_LEADS[2];
    const output = await runConversationEngine({
      message: 'i want an course of full stack',
      lead: rohanLead,
      courses: SEED_COURSES,
      conversationHistory: ['नमस्कार! MHT-CET साठी बॅच आहे का?'],
    });

    assert(output.responseText.toLowerCase().includes('full stack') || output.responseText.toLowerCase().includes('full-stack'), 'Response must explain the Full Stack course');
    assert(!output.responseText.includes('MHT-CET State Rankers'), 'Must NOT wrongly respond with MHT-CET when user asked for Full Stack');
    assert(output.updatedProfile.courseInterest?.toLowerCase().includes('full stack') || output.updatedProfile.courseInterest?.toLowerCase().includes('full-stack'), 'Profile must update to Full Stack');
  });

  // SUMMARY
  console.log('\n==================================================');
  console.log(`Test Results: ${passedCount} Passed, ${failedCount} Failed`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All deterministic engine tests PASSED successfully!\n');
  }
}

runAll().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
