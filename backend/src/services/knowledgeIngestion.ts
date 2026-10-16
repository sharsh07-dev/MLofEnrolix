import crypto from 'crypto';
import { db } from '../db/database';
import {
  Course,
  CourseModule,
  CourseProject,
  CourseFAQ,
  Institute,
  ScrapeRun,
  KnowledgeConflict,
  KnowledgeDocument
} from '../db/types';

export const TECHSUMMIT_INSTITUTE_ID = 'inst-techsummit';

export const APPROVED_PUBLIC_URLS = {
  home: 'https://techsummittrainers.com/index.html',
  courses: [
    {
      url: 'https://techsummittrainers.com/fullstack.html',
      slug: 'fullstack-java-devops-ai',
      code: 'TST-JAVA-FSD',
      category: 'Software Engineering',
      defaultName: 'Full-Stack Java + DevOps + AI'
    },
    {
      url: 'https://techsummittrainers.com/python-fullstack.html',
      slug: 'fullstack-python-devops-ai',
      code: 'TST-PY-FSD',
      category: 'Software Engineering & AI',
      defaultName: 'Full-Stack Python + DevOps + AI'
    },
    {
      url: 'https://techsummittrainers.com/mern.html',
      slug: 'mern-devops-ai',
      code: 'TST-MERN-FSD',
      category: 'Web Development',
      defaultName: 'MERN Stack + DevOps + AI'
    },
    {
      url: 'https://techsummittrainers.com/software-testing.html',
      slug: 'software-testing-automation-ai',
      code: 'TST-QA-AUTO',
      category: 'Quality Engineering',
      defaultName: 'Software Testing + Automation + AI'
    },
    {
      url: 'https://techsummittrainers.com/data-science.html',
      slug: 'data-science-analytics-ai',
      code: 'TST-DS-AI',
      category: 'Data Science & AI',
      defaultName: 'Data Science & Analytics + AI'
    }
  ]
};

function computeHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function cleanHtmlText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch HTML page with headers, timeout, and status validation
 */
async function fetchPage(url: string): Promise<{ html: string; status: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'EnrolixKnowledgeBot/1.0 (+https://enrolix.ai/bot; verification-pipeline)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }

    const html = await res.text();
    return { html, status: res.status };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Extract JSON-LD script blocks from HTML
 */
function extractJsonLd(html: string): any[] {
  const scripts = html.match(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi) || [];
  const results: any[] = [];
  for (const s of scripts) {
    const jsonStr = s.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
    try {
      const parsed = JSON.parse(jsonStr);
      results.push(parsed);
    } catch {
      // Ignore invalid JSON-LD blocks
    }
  }
  return results;
}

/**
 * Parse Institute Information from index.html
 */
export function parseInstitutePage(html: string, url: string): Institute {
  const jsonLdBlocks = extractJsonLd(html);
  let orgData: any = null;
  let faqData: any = null;

  for (const block of jsonLdBlocks) {
    const types = Array.isArray(block['@type']) ? block['@type'] : [block['@type']];
    if (types.includes('EducationalOrganization') || types.includes('LocalBusiness')) {
      orgData = block;
    }
    if (types.includes('FAQPage')) {
      faqData = block;
    }
  }

  const name = orgData?.name || 'TechSummitTrainers';
  const website = orgData?.url || 'https://techsummittrainers.com';
  const phone = orgData?.telephone || '+91 84858 46806';
  const email = orgData?.email || 'admin@techsummittrainers.com';

  let address = 'Office No. 509, Kushal Wallstreet, Fergusson College Road, Shivajinagar, Pune 411004';
  if (orgData?.address) {
    const addr = orgData.address;
    if (typeof addr === 'string') {
      address = addr;
    } else {
      address = `${addr.streetAddress || ''}, ${addr.addressLocality || 'Pune'} ${addr.postalCode || ''}, ${addr.addressRegion || 'Maharashtra'}`.replace(/^, |, $/g, '').trim();
    }
  }

  // Extract FAQs
  const faqs: CourseFAQ[] = [];
  if (faqData?.mainEntity && Array.isArray(faqData.mainEntity)) {
    for (const item of faqData.mainEntity) {
      if (item.name && item.acceptedAnswer?.text) {
        faqs.push({
          question: cleanHtmlText(item.name),
          answer: cleanHtmlText(item.acceptedAnswer.text)
        });
      }
    }
  }

  return {
    id: TECHSUMMIT_INSTITUTE_ID,
    name,
    slug: 'techsummittrainers',
    type: 'IT Training & Skill Development Institute',
    city: 'Pune',
    phone,
    email,
    address,
    branches: [
      'FC Road, Shivajinagar, Pune (Office 509, Kushal Wallstreet)',
      'Live Online Batches'
    ],
    website,
    openingHours: 'Monday – Saturday: 9:00 AM – 7:00 PM',
    deliveryModes: ['Classroom (FC Road, Pune)', 'Interactive Live Online'],
    demoBookingProcess: 'Free demo classes are available upon callback request or direct contact at +91 84858 46806.',
    careerSupportPolicy: 'Dedicated resume and LinkedIn building, mentor mock interviews, and job-search assistance. Published disclaimer: TechSummitTrainers does not guarantee 100% placement.',
    faqs: faqs.length > 0 ? faqs : [
      {
        question: 'Where is TechSummitTrainers located?',
        answer: 'Office No. 509, Kushal Wallstreet, Fergusson College Road, Shivajinagar, Pune 411004.'
      },
      {
        question: 'Does TechSummitTrainers offer 100% placement guarantees?',
        answer: 'No. TechSummitTrainers provides comprehensive career support including mock interviews, resume preparation, and job referrals, but explicitly maintains that 100% placement is not guaranteed.'
      },
      {
        question: 'How do I book a demo class?',
        answer: 'Demo sessions are completely free. You can request a callback via the website or call +91 84858 46806 directly.'
      }
    ],
    lastFetchedAt: new Date().toISOString()
  };
}

/**
 * Parse Course Information from a course page HTML
 */
export function parseCoursePage(
  html: string,
  urlConfig: { url: string; slug: string; code: string; category: string; defaultName: string }
): Course {
  const jsonLdBlocks = extractJsonLd(html);
  let courseLd: any = null;
  let faqLd: any = null;

  for (const block of jsonLdBlocks) {
    if (block['@type'] === 'Course') {
      courseLd = block;
    }
    if (block['@type'] === 'FAQPage') {
      faqLd = block;
    }
  }

  const warnings: string[] = [];

  // 1. Name & Title
  const name = courseLd?.name ? cleanHtmlText(courseLd.name) : urlConfig.defaultName;

  // 2. Fee Extraction
  let feeAmount = 40000;
  if (courseLd?.offers?.price) {
    const parsedPrice = parseInt(courseLd.offers.price, 10);
    if (!isNaN(parsedPrice) && parsedPrice > 0) {
      feeAmount = parsedPrice;
    }
  } else {
    // Regex fallback
    const feeMatch = html.match(/₹\s*([0-9,]+)/i);
    if (feeMatch) {
      const cleanNum = parseInt(feeMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(cleanNum) && cleanNum > 0) feeAmount = cleanNum;
    } else {
      warnings.push('Could not verify fee amount from schema; using default starting fee.');
    }
  }

  // Check EMI availability
  const emiAvailable = /EMI available/i.test(html);

  // 3. Duration Extraction
  let durationMonths = 5;
  let durationWeeks = 20;
  const chipMatches = html.match(/<span class=["']course-meta-chip["']>([\s\S]*?)<\/span>/gi) || [];
  const chipTexts = chipMatches.map(c => cleanHtmlText(c));

  for (const chip of chipTexts) {
    const durMatch = chip.match(/([0-9]+)\s*months?\s*·\s*([0-9]+)\s*weeks?/i);
    if (durMatch) {
      durationMonths = parseInt(durMatch[1], 10);
      durationWeeks = parseInt(durMatch[2], 10);
    }
  }

  const durationStr = `${durationMonths} Months (${durationWeeks} Weeks intensive)`;

  // 4. Next Batch Date
  let nextBatchDate: string | null = null;
  for (const chip of chipTexts) {
    const batchMatch = chip.match(/Next batch:\s*([^<]+)/i);
    if (batchMatch) {
      nextBatchDate = batchMatch[1].trim();
    }
  }

  // 5. Technologies & Teaches
  const technologies: string[] = [];
  if (courseLd?.teaches && Array.isArray(courseLd.teaches)) {
    for (const t of courseLd.teaches) {
      technologies.push(cleanHtmlText(t));
    }
  }

  // 6. Curriculum Modules / Pillars
  const curriculumModules: CourseModule[] = [];
  const pillarMatches = html.match(/<div class=["']pillar["'][\s\S]*?(?=<div class=["']pillar["']|<\/section)/gi) || [];

  let moduleIdx = 1;
  for (const pHtml of pillarMatches) {
    const numMatch = pHtml.match(/<span class=["']pillar-num["']>([\s\S]*?)<\/span>/i);
    const titleMatch = pHtml.match(/<h3>([\s\S]*?)<\/h3>/i);

    const moduleNum = numMatch ? cleanHtmlText(numMatch[1]) : `MODULE 0${moduleIdx}`;
    const moduleTitle = titleMatch ? cleanHtmlText(titleMatch[1]) : `Module ${moduleIdx}`;

    // Extract bullet topics
    const liMatches = pHtml.match(/<li>([\s\S]*?)<\/li>/gi) || [];
    const topics = liMatches.map(li => cleanHtmlText(li));

    // Extract week-by-week breakdown if present
    const weekBreakdown: Array<{ week?: string; topic: string; details?: string[] }> = [];
    const detailMatch = pHtml.match(/<details class=["']syllabus-detail["']>([\s\S]*?)<\/details>/i);
    if (detailMatch) {
      const pItems = detailMatch[1].match(/<p>([\s\S]*?)<\/p>/gi) || [];
      for (const p of pItems) {
        const strongMatch = p.match(/<strong>([\s\S]*?)<\/strong>/i);
        const cleanP = cleanHtmlText(p);
        if (strongMatch) {
          const wk = cleanHtmlText(strongMatch[1]);
          const topicDesc = cleanP.replace(wk, '').replace(/^:?\s*/, '');
          weekBreakdown.push({ week: wk, topic: topicDesc });
        } else if (cleanP) {
          weekBreakdown.push({ topic: cleanP });
        }
      }
    }

    curriculumModules.push({
      moduleNumber: moduleNum,
      title: moduleTitle,
      topics,
      weekBreakdown: weekBreakdown.length > 0 ? weekBreakdown : undefined
    });

    moduleIdx++;
  }

  // 7. Projects
  const projects: CourseProject[] = [];
  const projMatches = html.match(/<article class=["']proj-card["'][\s\S]*?<\/article>/gi) || [];
  for (const projHtml of projMatches) {
    const pTitleMatch = projHtml.match(/<h3>([\s\S]*?)<\/h3>/i);
    const pDescMatch = projHtml.match(/<p>([\s\S]*?)<\/p>/i);
    const stackSpans = projHtml.match(/<div class=["']proj-stack["']>([\s\S]*?)<\/div>/i);

    const pTitle = pTitleMatch ? cleanHtmlText(pTitleMatch[1]) : 'Hands-on Project';
    const pDesc = pDescMatch ? cleanHtmlText(pDescMatch[1]) : '';
    const techStack: string[] = [];
    if (stackSpans) {
      const spanMatches = stackSpans[1].match(/<span>([\s\S]*?)<\/span>/gi) || [];
      for (const sp of spanMatches) techStack.push(cleanHtmlText(sp));
    }

    projects.push({
      title: pTitle,
      description: pDesc,
      technologies: techStack
    });
  }

  // 8. FAQs
  const faqs: CourseFAQ[] = [];
  if (faqLd?.mainEntity && Array.isArray(faqLd.mainEntity)) {
    for (const f of faqLd.mainEntity) {
      if (f.name && f.acceptedAnswer?.text) {
        faqs.push({
          question: cleanHtmlText(f.name),
          answer: cleanHtmlText(f.acceptedAnswer.text)
        });
      }
    }
  }

  // 9. Roles & Outcomes
  const roles: string[] = [];
  const outcomeMatch = html.match(/<div class=["']outcome-grid["'][\s\S]*?<\/div>\s*<\/div>/i);
  if (outcomeMatch) {
    const tags = outcomeMatch[0].match(/<span class=["']role-tag["']>([\s\S]*?)<\/span>/gi) || [];
    for (const tg of tags) roles.push(cleanHtmlText(tg));
  }
  if (roles.length === 0) {
    // Sensible defaults based on course
    if (urlConfig.slug.includes('java')) roles.push('Java Full-Stack Developer', 'Backend Engineer', 'DevOps Associate', 'Software Engineer');
    else if (urlConfig.slug.includes('python')) roles.push('Python Developer', 'Full-Stack Engineer', 'AI Integration Engineer', 'Backend Specialist');
    else if (urlConfig.slug.includes('mern')) roles.push('Full-Stack React/Node Developer', 'MERN Stack Engineer', 'Frontend Specialist', 'Cloud Web Developer');
    else if (urlConfig.slug.includes('testing')) roles.push('QA Automation Engineer', 'SDET (Software Development Engineer in Test)', 'API Test Specialist');
    else if (urlConfig.slug.includes('data')) roles.push('Data Analyst', 'Data Scientist', 'Business Intelligence Engineer', 'ML Associate');
  }

  // 10. Highlights
  const highlights: string[] = [
    'Classroom + Live Online Hybrid delivery on FC Road, Pune',
    'Practical, hands-on portfolio projects with GitHub code reviews',
    'Integrated GenAI & DevOps workflows in every module',
    'Dedicated career support: mock interviews, resume optimization & job assistance'
  ];

  // Description
  const description = courseLd?.description
    ? cleanHtmlText(courseLd.description)
    : `Production-grade ${name} program designed for freshers and professionals. Features hands-on projects, industry mentors, and comprehensive career coaching.`;

  return {
    id: `crs-${urlConfig.slug}`,
    instituteId: TECHSUMMIT_INSTITUTE_ID,
    code: urlConfig.code,
    name,
    title: name,
    slug: urlConfig.slug,
    category: urlConfig.category,
    targetAudience: 'College Graduates, Career Switchers, and Working Professionals seeking industry-ready tech skills',
    eligibility: 'Any graduation background (B.E., B.Tech, B.Sc, BCA, BCS, or non-CS graduates with analytical curiosity). No prior coding required.',
    duration: durationStr,
    durationMonths,
    durationWeeks,
    fee: feeAmount,
    feeAmount,
    currency: 'INR',
    feeType: 'starting_from',
    feeDisplay: `₹${feeAmount.toLocaleString('en-IN')} starting (Easy EMI available)`,
    emiAvailable,
    schedules: [
      'Weekday Batches (Mon–Fri, 2 hrs/day practicals)',
      'Weekend Batches (Sat–Sun, 4 hrs/day intensive)'
    ],
    locations: [
      'FC Road, Shivajinagar, Pune (Kushal Wallstreet, Office 509)',
      'Interactive Live Online'
    ],
    nextBatchDate: nextBatchDate || 'Contact counsellor for upcoming batch schedule',
    deliveryModes: ['Classroom (FC Road, Pune)', 'Interactive Live Online'],
    technologies: technologies.length > 0 ? technologies : ['Core Tech Stack', 'DevOps', 'AI Tools', 'Git'],
    curriculumModules,
    projects,
    roles,
    publishedSalaryRange: '₹3–8 LPA fresher salary range based on published market reports. (Disclaimer: TechSummitTrainers does not guarantee specific salaries).',
    placementDisclaimer: 'TechSummitTrainers provides comprehensive career support including mock interviews, resume & LinkedIn building, and interview opportunities. The institute explicitly does not guarantee 100% placement.',
    prerequisites: ['Basic computer proficiency', 'Dedication of 10–15 hours/week for hands-on practice'],
    faqs,
    description,
    highlights,
    scholarshipAvailable: false,
    seatsTotal: 30,
    seatsLeft: 8,
    sourceUrl: urlConfig.url,
    lastFetchedAt: new Date().toISOString(),
    contentHash: computeHash(html),
    verificationStatus: 'verified',
    extractionWarnings: warnings
  };
}

export interface IngestionResult {
  runId: string;
  status: 'success' | 'partial' | 'failed';
  urlsAttempted: number;
  urlsSucceeded: number;
  urlsFailed: number;
  insertedCourses: number;
  updatedCourses: number;
  unchangedCourses: number;
  conflictsDetected: number;
  instituteUpdated: boolean;
  courses: Array<{ name: string; fee: number; duration: string; verificationStatus: string }>;
  conflicts: KnowledgeConflict[];
  logs: string[];
}

/**
 * Run the complete TechSummitTrainers Knowledge Base Ingestion Pipeline
 */
export async function syncTechSummitKnowledge(triggeredBy = 'Admin Manual Sync'): Promise<IngestionResult> {
  const startedAt = new Date().toISOString();
  const runId = `scrape-${Date.now()}`;
  const logs: string[] = [];

  logs.push(`[${startedAt}] Ingestion initiated by: ${triggeredBy}`);
  logs.push(`Approved targets: 1 Institute page + 5 Course pages.`);

  let urlsAttempted = 0;
  let urlsSucceeded = 0;
  let urlsFailed = 0;
  let insertedCourses = 0;
  let updatedCourses = 0;
  let unchangedCourses = 0;
  let conflictsDetected = 0;
  let instituteUpdated = false;
  const newConflicts: KnowledgeConflict[] = [];

  // Step 1: Ingest Institute Page
  try {
    urlsAttempted++;
    logs.push(`Fetching institute page: ${APPROVED_PUBLIC_URLS.home}`);
    const { html } = await fetchPage(APPROVED_PUBLIC_URLS.home);
    const instituteData = parseInstitutePage(html, APPROVED_PUBLIC_URLS.home);
    db.upsertInstitute(instituteData);
    instituteUpdated = true;
    urlsSucceeded++;

    // Save Knowledge Document
    db.saveKnowledgeDocument({
      id: `doc-inst-home`,
      instituteId: TECHSUMMIT_INSTITUTE_ID,
      url: APPROVED_PUBLIC_URLS.home,
      title: 'TechSummitTrainers - Institute Overview & Contact Information',
      documentType: 'institute_overview',
      content: JSON.stringify({
        name: instituteData.name,
        address: instituteData.address,
        phone: instituteData.phone,
        email: instituteData.email,
        openingHours: instituteData.openingHours,
        careerSupportPolicy: instituteData.careerSupportPolicy,
        demoBookingProcess: instituteData.demoBookingProcess,
        faqs: instituteData.faqs
      }, null, 2),
      contentHash: computeHash(html),
      fetchedAt: new Date().toISOString(),
      status: 'active'
    });

    logs.push(`✅ Ingested institute info: ${instituteData.name} (${instituteData.address})`);
  } catch (err: any) {
    urlsFailed++;
    logs.push(`❌ Failed to ingest institute page: ${err.message}`);
  }

  // Step 2: Ingest Each Approved Course Page
  for (const courseConfig of APPROVED_PUBLIC_URLS.courses) {
    urlsAttempted++;
    logs.push(`Fetching course page: ${courseConfig.url}`);

    try {
      const { html } = await fetchPage(courseConfig.url);
      const parsedCourse = parseCoursePage(html, courseConfig);

      // Check against existing course in DB for conflicts
      const existingCourse = db.getCourseById(parsedCourse.id) ||
        db.getCourses(TECHSUMMIT_INSTITUTE_ID).find(c => c.sourceUrl === parsedCourse.sourceUrl || c.slug === parsedCourse.slug);

      if (existingCourse) {
        // Detect fee conflict
        if (existingCourse.feeAmount !== undefined && existingCourse.feeAmount !== parsedCourse.feeAmount) {
          const conflict: KnowledgeConflict = {
            id: `conf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            instituteId: TECHSUMMIT_INSTITUTE_ID,
            courseId: existingCourse.id,
            courseTitle: existingCourse.name,
            field: 'feeAmount',
            previousValue: existingCourse.feeAmount,
            newValue: parsedCourse.feeAmount,
            sourceUrl: parsedCourse.sourceUrl || courseConfig.url,
            detectedAt: new Date().toISOString(),
            status: 'pending',
            resolutionNotes: `Scraped starting fee (₹${parsedCourse.feeAmount}) differs from previous record (₹${existingCourse.feeAmount}). Marked for admin verification.`
          };
          db.addKnowledgeConflict(conflict);
          newConflicts.push(conflict);
          conflictsDetected++;
          parsedCourse.verificationStatus = 'needs_review';
          logs.push(`⚠️ Fee conflict detected for ${parsedCourse.name}: prev ₹${existingCourse.feeAmount} vs new ₹${parsedCourse.feeAmount}`);
        }

        // Detect duration conflict
        if (existingCourse.durationMonths !== undefined && existingCourse.durationMonths !== parsedCourse.durationMonths) {
          const conflict: KnowledgeConflict = {
            id: `conf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            instituteId: TECHSUMMIT_INSTITUTE_ID,
            courseId: existingCourse.id,
            courseTitle: existingCourse.name,
            field: 'durationMonths',
            previousValue: existingCourse.durationMonths,
            newValue: parsedCourse.durationMonths,
            sourceUrl: parsedCourse.sourceUrl || courseConfig.url,
            detectedAt: new Date().toISOString(),
            status: 'pending',
            resolutionNotes: `Scraped duration (${parsedCourse.durationMonths} months) differs from previous record (${existingCourse.durationMonths} months).`
          };
          db.addKnowledgeConflict(conflict);
          newConflicts.push(conflict);
          conflictsDetected++;
          parsedCourse.verificationStatus = 'needs_review';
          logs.push(`⚠️ Duration conflict detected for ${parsedCourse.name}: prev ${existingCourse.durationMonths} mos vs new ${parsedCourse.durationMonths} mos`);
        }
      }

      // Upsert course record
      const upsertRes = db.upsertCourse(parsedCourse);
      if (upsertRes.isNew) {
        insertedCourses++;
        logs.push(`✅ Inserted new course: ${parsedCourse.name} (Fee: ₹${parsedCourse.feeAmount})`);
      } else if (upsertRes.changedFields.length > 0) {
        updatedCourses++;
        logs.push(`🔄 Updated course: ${parsedCourse.name} (Changed fields: ${upsertRes.changedFields.join(', ')})`);
      } else {
        unchangedCourses++;
        logs.push(`⏺️ Course unchanged: ${parsedCourse.name}`);
      }

      // Save Knowledge Document
      db.saveKnowledgeDocument({
        id: `doc-${parsedCourse.slug}`,
        instituteId: TECHSUMMIT_INSTITUTE_ID,
        url: courseConfig.url,
        title: `${parsedCourse.name} Course Document`,
        documentType: 'course_page',
        content: JSON.stringify({
          name: parsedCourse.name,
          slug: parsedCourse.slug,
          fee: parsedCourse.feeAmount,
          feeType: parsedCourse.feeType,
          duration: parsedCourse.duration,
          nextBatchDate: parsedCourse.nextBatchDate,
          deliveryModes: parsedCourse.deliveryModes,
          technologies: parsedCourse.technologies,
          curriculumModules: parsedCourse.curriculumModules,
          projects: parsedCourse.projects,
          roles: parsedCourse.roles,
          salaryRange: parsedCourse.publishedSalaryRange,
          placementDisclaimer: parsedCourse.placementDisclaimer,
          faqs: parsedCourse.faqs
        }, null, 2),
        contentHash: parsedCourse.contentHash || computeHash(html),
        fetchedAt: new Date().toISOString(),
        status: 'active',
        extractedCourseId: parsedCourse.id
      });

      urlsSucceeded++;
    } catch (err: any) {
      urlsFailed++;
      logs.push(`❌ Failed to ingest ${courseConfig.url}: ${err.message}`);
    }
  }

  const completedAt = new Date().toISOString();
  const overallStatus = urlsFailed === 0 ? 'success' : (urlsSucceeded > 0 ? 'partial' : 'failed');

  const scrapeRun: ScrapeRun = {
    id: runId,
    instituteId: TECHSUMMIT_INSTITUTE_ID,
    startedAt,
    completedAt,
    status: overallStatus,
    urlsAttempted,
    urlsSucceeded,
    urlsFailed,
    insertedCourses,
    updatedCourses,
    unchangedCourses,
    conflictsDetected,
    logs
  };

  db.addScrapeRun(scrapeRun);
  logs.push(`[${completedAt}] Ingestion completed with status: ${overallStatus.toUpperCase()}`);

  const latestCourses = db.getCourses(TECHSUMMIT_INSTITUTE_ID).map(c => ({
    name: c.name,
    fee: c.feeAmount || c.fee,
    duration: c.duration,
    verificationStatus: c.verificationStatus || 'verified'
  }));

  return {
    runId,
    status: overallStatus,
    urlsAttempted,
    urlsSucceeded,
    urlsFailed,
    insertedCourses,
    updatedCourses,
    unchangedCourses,
    conflictsDetected,
    instituteUpdated,
    courses: latestCourses,
    conflicts: newConflicts,
    logs
  };
}
