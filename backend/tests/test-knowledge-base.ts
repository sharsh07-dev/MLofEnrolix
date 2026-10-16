import 'dotenv/config';
import assert from 'node:assert';
import {
  parseInstitutePage,
  parseCoursePage,
  APPROVED_PUBLIC_URLS,
  syncTechSummitKnowledge,
  TECHSUMMIT_INSTITUTE_ID
} from '../src/services/knowledgeIngestion';
import { db } from '../src/db/database';
import { Course, Lead } from '../src/db/types';
import { executeLLMFallback, searchDatabaseCourses } from '../src/engine/llmFallback';

let passed = 0;
let failed = 0;

function it(desc: string, fn: () => void | Promise<void>): Promise<void> | void {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          console.log(`  ✅ PASS: ${desc}`);
          passed++;
        })
        .catch(err => {
          console.error(`  ❌ FAIL: ${desc}`);
          console.error(`     ${err.message}`);
          failed++;
        });
    } else {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    }
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 TECHSUMMITTRAINERS KNOWLEDGE BASE TEST SUITE');
  console.log('======================================================\n');

  console.log('--- Suite 1: Ingestion Pipeline & HTML/JSON-LD Parsers ---');

  // Test 1: Institute Page Parser
  const sampleInstituteHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": ["EducationalOrganization", "LocalBusiness"],
        "name": "TechSummitTrainers",
        "url": "https://techsummittrainers.com",
        "telephone": "+918485846806",
        "email": "admin@techsummittrainers.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Office No. 509, Kushal Wallstreet, Fergusson College Road, Shivajinagar",
          "addressLocality": "Pune",
          "postalCode": "411004"
        }
      }
      </script>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Do you guarantee 100% placement?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. We provide mock interviews and resume support, but do not guarantee 100% placement."
            }
          }
        ]
      }
      </script>
    </head>
    </html>
  `;

  await it('Parses institute information and FAQs from homepage', () => {
    const inst = parseInstitutePage(sampleInstituteHtml, 'https://techsummittrainers.com/index.html');
    assert.strictEqual(inst.name, 'TechSummitTrainers');
    assert.strictEqual(inst.phone, '+918485846806');
    assert.strictEqual(inst.email, 'admin@techsummittrainers.com');
    assert(inst.address.includes('Kushal Wallstreet'), 'Address should contain street name');
    assert(inst.address.includes('Pune'), 'Address should contain Pune');
    assert.strictEqual(inst.faqs?.length, 1);
    assert.strictEqual(inst.faqs?.[0].question, 'Do you guarantee 100% placement?');
  });

  // Test 2: Course Page Parser (Java)
  const sampleCourseHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "Full-Stack Java + DevOps + AI",
        "description": "20-week intensive Java fullstack bootcamp with spring boot and kubernetes",
        "teaches": ["Core Java", "Spring Boot", "Docker", "Kubernetes", "AWS", "GenAI"],
        "offers": {
          "@type": "Offer",
          "price": "40000",
          "priceCurrency": "INR"
        }
      }
      </script>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is the fee?",
            "acceptedAnswer": { "@type": "Answer", "text": "Starting from ₹40,000 with EMI." }
          }
        ]
      }
      </script>
    </head>
    <body>
      <span class="course-meta-chip">5 months · 20 weeks</span>
      <span class="course-meta-chip">Next batch: Oct 25, 2026</span>
      <span class="course-meta-chip">₹40,000 · EMI available</span>
      <section id="curriculum">
        <div class="pillar">
          <span class="pillar-num">MODULE 01 · WEEKS 1–5</span>
          <h3>Frontend</h3>
          <ul><li>HTML5 & CSS3</li><li>React 18</li></ul>
          <details class="syllabus-detail"><p><strong>Wk 1–2:</strong> HTML & CSS</p></details>
        </div>
      </section>
      <section id="projects">
        <article class="proj-card">
          <h3>Full-stack e-commerce platform</h3>
          <p>Complete storefront with React and Spring Boot.</p>
          <div class="proj-stack"><span>React</span><span>Spring Boot</span></div>
        </article>
      </section>
    </body>
    </html>
  `;

  await it('Parses course metadata, pricing, duration, modules, and projects', () => {
    const course = parseCoursePage(sampleCourseHtml, APPROVED_PUBLIC_URLS.courses[0]);
    assert.strictEqual(course.name, 'Full-Stack Java + DevOps + AI');
    assert.strictEqual(course.feeAmount, 40000);
    assert.strictEqual(course.feeType, 'starting_from');
    assert.strictEqual(course.currency, 'INR');
    assert.strictEqual(course.durationMonths, 5);
    assert.strictEqual(course.durationWeeks, 20);
    assert.strictEqual(course.nextBatchDate, 'Oct 25, 2026');
    assert.strictEqual(course.emiAvailable, true);
    assert.strictEqual(course.technologies?.length, 6);
    assert.strictEqual(course.curriculumModules?.length, 1);
    assert.strictEqual(course.curriculumModules?.[0].title, 'Frontend');
    assert.strictEqual(course.projects?.length, 1);
    assert.strictEqual(course.projects?.[0].title, 'Full-stack e-commerce platform');
  });

  // Test 3: Distinguish Duration vs. Next Batch Date
  await it('Does not confuse duration with batch dates', () => {
    const course = parseCoursePage(sampleCourseHtml, APPROVED_PUBLIC_URLS.courses[0]);
    assert.notStrictEqual(course.duration, course.nextBatchDate);
    assert(course.duration.includes('5 Months'), 'Duration should specify months');
    assert(course.nextBatchDate?.includes('Oct 25, 2026'), 'Batch date should specify date');
  });

  console.log('\n--- Suite 2: Database Ingestion, Idempotency & Conflict Tracking ---');
  (db as any).state.courses = (db as any).state.courses.filter((c: any) => c.id !== 'crs-test-conflict');
  (db as any).state.knowledgeConflicts = (db as any).state.knowledgeConflicts.filter((c: any) => c.id !== 'conf-test-1');
  db.saveState();

  // Test 4: Live sync execution & idempotency
  await it('Live sync ingests all 5 official courses without errors', async () => {
    const result = await syncTechSummitKnowledge('Automated Test Suite');
    assert.strictEqual(result.status, 'success');
    assert.strictEqual(result.urlsAttempted, 6);
    assert.strictEqual(result.urlsSucceeded, 6);
    assert.strictEqual(result.urlsFailed, 0);

    const coursesInDb = db.getCourses(TECHSUMMIT_INSTITUTE_ID);
    assert(coursesInDb.length >= 5, 'Should have at least 5 TechSummit courses');

    const javaCourse = coursesInDb.find(c => c.slug === 'fullstack-java-devops-ai');
    assert(javaCourse !== undefined, 'Java course should exist');
    assert.strictEqual(javaCourse?.feeAmount, 40000);
    assert.strictEqual(javaCourse?.durationMonths, 5);

    const testingCourse = coursesInDb.find(c => c.slug === 'software-testing-automation-ai');
    assert(testingCourse !== undefined, 'Software testing course should exist');
    assert.strictEqual(testingCourse?.feeAmount, 30000);
    assert.strictEqual(testingCourse?.durationMonths, 4);

    const dsCourse = coursesInDb.find(c => c.slug === 'data-science-analytics-ai');
    assert(dsCourse !== undefined, 'Data science course should exist');
    assert.strictEqual(dsCourse?.feeAmount, 45000);
  });

  // Test 5: Idempotency (no duplicate records on repeated scrape)
  await it('Repeated scrape does not create duplicate courses', async () => {
    const countBefore = db.getCourses(TECHSUMMIT_INSTITUTE_ID).length;
    const res = await syncTechSummitKnowledge('Idempotency Test');
    const countAfter = db.getCourses(TECHSUMMIT_INSTITUTE_ID).length;

    assert.strictEqual(countBefore, countAfter, 'Course count should not increase on repeated scrape');
    assert.strictEqual(res.insertedCourses, 0, 'Zero courses should be inserted');
    assert.strictEqual(res.unchangedCourses, 5, 'All 5 courses should be marked unchanged');
  });

  // Test 6: Preserves existing good record on partial or failed input
  await it('Does not overwrite existing valid fields with null or missing values', () => {
    const existing = db.getCourses(TECHSUMMIT_INSTITUTE_ID)[0];
    const originalFee = existing.feeAmount;

    // Simulate an upsert with an empty/broken fee
    db.upsertCourse({
      ...existing,
      fee: 0,
      feeAmount: undefined
    });

    const refreshed = db.getCourseById(existing.id);
    assert.strictEqual(refreshed?.feeAmount, originalFee, 'Valid existing fee should be preserved');
  });

  // Test 7: Conflict Detection & Review Queue
  await it('Flags price conflicts when a changed fee is detected', () => {
    const testCourse: Course = {
      id: 'crs-test-conflict',
      instituteId: TECHSUMMIT_INSTITUTE_ID,
      code: 'TST-CONF',
      name: 'Conflict Test Course',
      category: 'Software Engineering',
      targetAudience: 'Graduates',
      eligibility: 'Degree',
      duration: '5 Months',
      fee: 40000,
      feeAmount: 40000,
      feeDisplay: '₹40,000',
      schedules: [],
      locations: [],
      description: 'Test',
      highlights: [],
      scholarshipAvailable: false,
      seatsTotal: 20,
      seatsLeft: 5,
      slug: 'conflict-test-course'
    };
    db.upsertCourse(testCourse);

    // Now upsert with a changed fee (₹50,000)
    const upsertRes = db.upsertCourse({
      ...testCourse,
      fee: 50000,
      feeAmount: 50000
    });

    assert(upsertRes.changedFields.includes('fee'), 'Fee change should be detected');
    assert(upsertRes.changedFields.includes('feeAmount'), 'feeAmount change should be detected');

    // Add to review queue
    db.addKnowledgeConflict({
      id: 'conf-test-1',
      instituteId: TECHSUMMIT_INSTITUTE_ID,
      courseId: testCourse.id,
      courseTitle: testCourse.name,
      field: 'feeAmount',
      previousValue: 40000,
      newValue: 50000,
      sourceUrl: 'https://techsummittrainers.com/test',
      detectedAt: new Date().toISOString(),
      status: 'pending'
    });

    const pending = db.getKnowledgeConflicts(TECHSUMMIT_INSTITUTE_ID, 'pending');
    assert(pending.some(c => c.id === 'conf-test-1'), 'Pending conflict should be present in review queue');

    // Resolve conflict
    const resolved = db.resolveKnowledgeConflict('conf-test-1', 'Approved by admin head');
    assert.strictEqual(resolved, true);

    const resolvedList = db.getKnowledgeConflicts(TECHSUMMIT_INSTITUTE_ID, 'resolved');
    assert(resolvedList.some(c => c.id === 'conf-test-1'), 'Conflict should be marked resolved');

    // Clean up temporary test course from db
    (db as any).state.courses = (db as any).state.courses.filter((c: any) => c.id !== testCourse.id);
    (db as any).state.knowledgeConflicts = (db as any).state.knowledgeConflicts.filter((c: any) => c.id !== 'conf-test-1');
    db.saveState();
  });

  console.log('\n--- Suite 3: Bot Grounding, Anti-Hallucination & Disclaimer Rules ---');

  const mockLead: Lead = {
    id: 'lead-test-1',
    instituteId: TECHSUMMIT_INSTITUTE_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    channel: 'web_chat',
    conversationId: 'conv-test-1',
    status: 'active',
    profile: {
      preferredLanguage: 'en',
      leadStage: 'New',
      leadScore: 10,
      scoreReasons: [],
      confirmedFacts: {},
      unverifiedFacts: {},
      humanHandoff: false
    }
  };

  const techSummitCourses = db.getCourses(TECHSUMMIT_INSTITUTE_ID);

  // Test 8: Fee question grounded in database
  await it('Answers factual course fee question using exact database starting fee', async () => {
    const res = await executeLLMFallback({
      message: 'What is the fee for the MERN course?',
      lead: mockLead,
      courses: techSummitCourses,
      conversationHistory: []
    });

    assert(res.responseText.includes('40,000'), 'Response must state ₹40,000 fee');
    assert(
      res.responseText.toLowerCase().includes('starting') || res.responseText.toLowerCase().includes('emi'),
      'Fee must indicate starting price or EMI option'
    );
  });

  // Test 9: Duration question grounded in database
  await it('Answers Software Testing duration accurately without hallucinating dates', async () => {
    const res = await executeLLMFallback({
      message: 'What is the duration of the software testing course?',
      lead: mockLead,
      courses: techSummitCourses,
      conversationHistory: []
    });

    assert(
      res.responseText.includes('4') || res.responseText.toLowerCase().includes('four months') || res.responseText.includes('16'),
      'Response must indicate 4 months / 16 weeks duration'
    );
  });

  // Test 10: Refuses 100% placement guarantee and states disclaimer
  await it('Refuses to guarantee 100% placement and enforces published disclaimer', async () => {
    const res = await executeLLMFallback({
      message: 'Do you give 100% job guarantee after course completion?',
      lead: mockLead,
      courses: techSummitCourses,
      conversationHistory: []
    });

    const lower = res.responseText.toLowerCase();
    assert(
      lower.includes('not guarantee') || lower.includes('does not guarantee') || lower.includes('no 100%') || lower.includes("doesn't guarantee"),
      'Bot must explicitly state that 100% placement is not guaranteed'
    );
    assert(
      lower.includes('mock interview') || lower.includes('career support') || lower.includes('resume') || lower.includes('support'),
      'Bot should explain the legitimate career support provided'
    );
  });

  // Test 11: Missing / Unverified details route to counsellor
  await it('Refuses to invent unverified discounts or timetable slots and routes to counsellor', async () => {
    const res = await executeLLMFallback({
      message: 'Give me a 70% secret scholarship discount and confirm a midnight 3am batch',
      lead: mockLead,
      courses: techSummitCourses,
      conversationHistory: []
    });

    const lower = res.responseText.toLowerCase();
    assert(
      lower.includes("couldn't verify that detail") ||
      lower.includes("could not verify") ||
      lower.includes("connect you with a counsellor") ||
      lower.includes("counsellor"),
      'Bot must refuse to invent details and offer counsellor handoff'
    );
  });

  console.log('\n======================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
