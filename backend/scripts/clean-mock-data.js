const fs = require('fs');
const path = require('path');

const dbStatePath = path.join(__dirname, '../src/db/mock_db_state.json');
const raw = fs.readFileSync(dbStatePath, 'utf8');
const data = JSON.parse(raw);

// 1. Keep only inst-techsummit institute
const techInstitute = data.institutes.find(i => i.id === 'inst-techsummit') || {
  id: 'inst-techsummit',
  name: 'TechSummitTrainers',
  slug: 'techsummittrainers',
  type: 'IT Training & Skill Development Institute',
  city: 'Pune',
  phone: '+91 84858 46806',
  email: 'admin@techsummittrainers.com',
  address: 'Office No. 509, Kushal Wallstreet, Fergusson College Road, Shivajinagar, Pune 411004, Maharashtra',
  branches: [
    'FC Road, Shivajinagar, Pune (Office 509, Kushal Wallstreet)',
    'Live Online Batches'
  ],
  website: 'https://techsummittrainers.com/',
  openingHours: 'Monday – Saturday: 9:00 AM – 7:00 PM',
  deliveryModes: [
    'Classroom (FC Road, Pune)',
    'Interactive Live Online'
  ],
  demoBookingProcess: 'Free demo classes are available upon callback request or direct contact at +91 84858 46806.',
  careerSupportPolicy: 'Dedicated resume and LinkedIn building, mentor mock interviews, and job-search assistance. Published disclaimer: TechSummitTrainers does not guarantee 100% placement.',
  faqs: [
    {
      question: 'Do I need any prior coding experience?',
      answer: 'No. Every program starts from the fundamentals and progresses to advanced topics like microservices, DevOps and AI integration. Our batches are designed for freshers and career switchers from any degree background.'
    },
    {
      question: 'Do you guarantee a job after the course?',
      answer: 'No, and we would be cautious of anyone claiming a 100% guarantee. What we provide is hands-on project experience, resume and LinkedIn building, mock interviews, and active support during your job search, so you are in the strongest possible position.'
    },
    {
      question: 'What are the fees, and are EMIs available?',
      answer: 'Our full-stack programs (Java, Python and MERN) run 5 months from ₹40,000. Software Testing is 4 months from ₹30,000, and Data Science & Analytics is 5 months from ₹45,000. EMI options are available, and the exact fee is confirmed at your free demo.'
    },
    {
      question: 'Is the training online, offline, or both?',
      answer: 'Both. Classroom sessions run from our FC Road, Pune centre, and the same live sessions are streamed online. You choose each day.'
    },
    {
      question: 'Where exactly is the institute located?',
      answer: 'Office No. 509, Kushal Wallstreet, Fergusson College Road, Shivajinagar, Pune 411004. We are open Monday to Sunday, 7:30 AM to 9 PM.'
    },
    {
      question: 'How do I book a free demo class?',
      answer: 'Fill the callback form on this page, call us on +91 84858 46806, or message us on WhatsApp. Demos are free and require no payment or commitment.'
    }
  ]
};

// 2. Verified 5 courses only
const approvedSlugs = [
  'fullstack-java-devops-ai',
  'fullstack-python-devops-ai',
  'mern-devops-ai',
  'software-testing-automation-ai',
  'data-science-analytics-ai'
];

const approvedCourseIds = [
  'crs-fullstack-java-devops-ai',
  'crs-fullstack-python-devops-ai',
  'crs-mern-devops-ai',
  'crs-software-testing-automation-ai',
  'crs-data-science-analytics-ai'
];

const techCourses = data.courses.filter(c =>
  c.instituteId === 'inst-techsummit' &&
  approvedCourseIds.includes(c.id)
);

// 3. Staff Users
const techUsers = [
  {
    id: 'user-1',
    instituteId: 'inst-techsummit',
    name: 'Pooja Patil',
    email: 'admissions@techsummittrainers.com',
    role: 'admissions_head',
    phone: '+91 84858 46806'
  },
  {
    id: 'user-2',
    instituteId: 'inst-techsummit',
    name: 'Rohit Deshmukh',
    email: 'counsellor@techsummittrainers.com',
    role: 'counsellor',
    phone: '+91 84858 46806'
  },
  {
    id: 'user-3',
    instituteId: 'inst-techsummit',
    name: 'Amit Shinde',
    email: 'support@techsummittrainers.com',
    role: 'counsellor',
    phone: '+91 84858 46806'
  }
];

// 4. TechSummit Leads
const techLeads = [
  {
    id: 'lead-aarav',
    instituteId: 'inst-techsummit',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    channel: 'web_chat',
    conversationId: 'conv-aarav',
    status: 'active',
    profile: {
      name: 'Aarav Sharma',
      phone: '+91 98231 10022',
      email: 'aarav.sharma@gmail.com',
      academicLevel: 'B.E. Graduate (2025)',
      courseInterest: 'Full-Stack Java + DevOps + AI',
      budgetMin: 40000,
      budgetMax: 50000,
      preferredSchedule: 'Weekday evening batches',
      location: 'FC Road, Pune',
      preferredLanguage: 'en',
      admissionTimeline: 'Immediate (Next week)',
      visitPreference: 'Saturday 11:00 AM (FC Road Center)',
      leadStage: 'Visit Pending Confirmation',
      leadScore: 85,
      scoreReasons: [
        {
          factor: 'course_interest',
          points: 20,
          description: 'Interested in Full-Stack Java + DevOps + AI',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          factor: 'academic_level',
          points: 15,
          description: 'Eligible engineering graduate',
          timestamp: new Date(Date.now() - 3600000 * 20).toISOString()
        },
        {
          factor: 'budget_stated',
          points: 15,
          description: 'Stated budget ₹40k-50k matches starting fee',
          timestamp: new Date(Date.now() - 3600000 * 15).toISOString()
        },
        {
          factor: 'timeline_defined',
          points: 15,
          description: 'Immediate admission timeline',
          timestamp: new Date(Date.now() - 3600000 * 10).toISOString()
        },
        {
          factor: 'visit_requested',
          points: 10,
          description: 'Requested free demo visit on Saturday',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          factor: 'contact_provided',
          points: 10,
          description: 'Verified mobile number provided',
          timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
        }
      ],
      confirmedFacts: {
        courseInterest: {
          value: 'Full-Stack Java + DevOps + AI',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          source: 'user_explicit'
        },
        location: {
          value: 'FC Road, Pune',
          timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
          source: 'user_explicit'
        },
        phone: {
          value: '+91 98231 10022',
          timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
          source: 'user_explicit'
        }
      },
      unverifiedFacts: {},
      humanHandoff: false,
      lastIntent: 'campus_visit_request'
    }
  },
  {
    id: 'lead-priya',
    instituteId: 'inst-techsummit',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    channel: 'web_chat',
    conversationId: 'conv-priya',
    status: 'active',
    profile: {
      name: 'Priya Patil',
      phone: '+91 98232 20033',
      email: 'priya.patil@outlook.com',
      academicLevel: 'BCA Final Year',
      courseInterest: 'Software Testing + Automation + AI',
      budgetMin: 30000,
      budgetMax: 35000,
      preferredSchedule: 'Morning Batch (Live Online)',
      location: 'Pune (Online)',
      preferredLanguage: 'en',
      admissionTimeline: 'Within 2 weeks',
      leadStage: 'Engaged',
      leadScore: 70,
      scoreReasons: [
        {
          factor: 'course_interest',
          points: 20,
          description: 'Interested in Software Testing + Automation + AI',
          timestamp: new Date(Date.now() - 3600000 * 18).toISOString()
        },
        {
          factor: 'budget_stated',
          points: 15,
          description: 'Budget ₹30,000 matches course fee',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
        },
        {
          factor: 'contact_provided',
          points: 15,
          description: 'Name and phone provided',
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
        },
        {
          factor: 'timeline_defined',
          points: 20,
          description: 'Ready to join next batch',
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
        }
      ],
      confirmedFacts: {
        courseInterest: {
          value: 'Software Testing + Automation + AI',
          timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
          source: 'user_explicit'
        }
      },
      unverifiedFacts: {},
      humanHandoff: false,
      lastIntent: 'course_enquiry'
    }
  },
  {
    id: 'lead-rohan',
    instituteId: 'inst-techsummit',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    channel: 'web_chat',
    conversationId: 'conv-rohan',
    status: 'active',
    profile: {
      name: 'Rohan Deshmukh',
      phone: '+91 98233 30044',
      academicLevel: 'Working Professional (Tech Support)',
      courseInterest: 'Data Science & Analytics + AI',
      budgetMin: 45000,
      budgetMax: 50000,
      preferredSchedule: 'Weekend Intensive Batches',
      location: 'Shivajinagar, Pune',
      preferredLanguage: 'mr',
      admissionTimeline: 'Next Month',
      leadStage: 'Qualified',
      leadScore: 80,
      scoreReasons: [
        {
          factor: 'course_interest',
          points: 20,
          description: 'Interested in Data Science & Analytics + AI',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
        },
        {
          factor: 'working_professional',
          points: 20,
          description: 'Seeking career transition to Data Science',
          timestamp: new Date(Date.now() - 3600000 * 8).toISOString()
        },
        {
          factor: 'budget_matched',
          points: 20,
          description: 'Budget ₹45k matches fee',
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          factor: 'contact_provided',
          points: 20,
          description: 'Verified contact number',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
        }
      ],
      confirmedFacts: {},
      unverifiedFacts: {},
      humanHandoff: false,
      lastIntent: 'course_enquiry'
    }
  },
  {
    id: 'lead-sneha',
    instituteId: 'inst-techsummit',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    channel: 'web_chat',
    conversationId: 'conv-sneha',
    status: 'active',
    profile: {
      name: 'Sneha Kulkarni',
      phone: '+91 98234 40055',
      academicLevel: 'B.Tech IT (2025)',
      courseInterest: 'MERN Stack + DevOps + AI',
      budgetMin: 40000,
      budgetMax: 45000,
      preferredSchedule: 'Weekday Batches',
      location: 'Pune Center (FC Road)',
      preferredLanguage: 'en',
      admissionTimeline: 'Immediate',
      leadStage: 'Counselling Requested',
      leadScore: 75,
      scoreReasons: [
        {
          factor: 'course_interest',
          points: 20,
          description: 'Targeting MERN Stack + DevOps + AI',
          timestamp: new Date(Date.now() - 3600000 * 8).toISOString()
        },
        {
          factor: 'counselling_booked',
          points: 25,
          description: 'Requested counselling with tech trainer',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          factor: 'contact_provided',
          points: 30,
          description: 'Valid contact details',
          timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
        }
      ],
      confirmedFacts: {},
      unverifiedFacts: {},
      humanHandoff: false,
      lastIntent: 'counselling_appointment'
    }
  },
  {
    id: 'lead-vikram',
    instituteId: 'inst-techsummit',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    channel: 'web_chat',
    conversationId: 'conv-vikram',
    status: 'active',
    profile: {
      name: 'Vikram Joshi',
      phone: '+91 98235 50066',
      academicLevel: 'B.Sc Computer Science',
      courseInterest: 'Full-Stack Python + DevOps + AI',
      budgetMin: 40000,
      budgetMax: 45000,
      preferredSchedule: 'Evening Batches',
      location: 'FC Road, Pune',
      preferredLanguage: 'en',
      admissionTimeline: 'Next week',
      leadStage: 'Engaged',
      leadScore: 65,
      scoreReasons: [
        {
          factor: 'course_interest',
          points: 20,
          description: 'Inquired about Python Full Stack & AI',
          timestamp: new Date(Date.now() - 3600000 * 6).toISOString()
        },
        {
          factor: 'budget_matched',
          points: 25,
          description: 'Comfortable with ₹40k starting fee',
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
        },
        {
          factor: 'contact_shared',
          points: 20,
          description: 'Phone number shared for demo schedule',
          timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
        }
      ],
      confirmedFacts: {},
      unverifiedFacts: {},
      humanHandoff: false,
      lastIntent: 'course_enquiry'
    }
  }
];

// 5. TechSummit Conversations
const techConversations = {
  'conv-aarav': {
    id: 'conv-aarav',
    instituteId: 'inst-techsummit',
    leadId: 'lead-aarav',
    channel: 'web_chat',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    messages: [
      {
        id: 'msg-a1',
        conversationId: 'conv-aarav',
        instituteId: 'inst-techsummit',
        sender: 'student',
        text: 'Hi, I want to do java full stack course. Can you give me the details?',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        language: 'en'
      },
      {
        id: 'msg-a2',
        conversationId: 'conv-aarav',
        instituteId: 'inst-techsummit',
        sender: 'assistant',
        text: "That's a great choice, Aarav! We offer a comprehensive **Full-Stack Java + DevOps + AI** program designed for freshers and career switchers.\n\n### Course Highlights:\n- **Duration:** 5 Months (20 Weeks intensive)\n- **Frontend:** HTML5, CSS3, JavaScript, TypeScript, ReactJS\n- **Backend:** Core Java, Spring Boot, Microservices, REST APIs, JPA/Hibernate\n- **DevOps & Cloud:** Docker, Kubernetes, AWS, CI/CD with GitHub Actions\n- **AI Integration:** LLM APIs, Vector Databases, RAG architectures & AI-assisted development\n- **Fee:** Starting from ₹40,000 (Flexible EMI available)\n- **Delivery:** Classroom training at our FC Road center in Pune, or interactive live online sessions.\n\nAre you looking for weekday evening batches or weekend intensive batches?",
        timestamp: new Date(Date.now() - 3600000 * 24 + 2000).toISOString(),
        language: 'en'
      },
      {
        id: 'msg-a3',
        conversationId: 'conv-aarav',
        instituteId: 'inst-techsummit',
        sender: 'student',
        text: 'I prefer evening batches on FC Road. Can I attend a free demo class?',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        language: 'en'
      },
      {
        id: 'msg-a4',
        conversationId: 'conv-aarav',
        instituteId: 'inst-techsummit',
        sender: 'assistant',
        text: "Yes, absolutely! Free demo classes are available at our FC Road center:\n\n📍 **Location:** Office No. 509, Kushal Wallstreet, Fergusson College Road, Shivajinagar, Pune 411004.\n📅 **Upcoming Demo:** Saturday at 11:00 AM.\n\nOur demo session is completely free with no payment or commitment required. Would you like me to book your seat for this Saturday?",
        timestamp: new Date(Date.now() - 3600000 * 1 + 2500).toISOString(),
        language: 'en'
      }
    ]
  },
  'conv-priya': {
    id: 'conv-priya',
    instituteId: 'inst-techsummit',
    leadId: 'lead-priya',
    channel: 'web_chat',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    messages: [
      {
        id: 'msg-p1',
        conversationId: 'conv-priya',
        instituteId: 'inst-techsummit',
        sender: 'student',
        text: 'Hello, what is covered in your Software Testing program?',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        language: 'en'
      },
      {
        id: 'msg-p2',
        conversationId: 'conv-priya',
        instituteId: 'inst-techsummit',
        sender: 'assistant',
        text: 'Hello Priya! Our **Software Testing + Automation + AI** program is a 4-month practical course starting from ₹30,000 (EMI available).\n\n### What You Will Learn:\n1. **Manual Testing:** SDLC, STLC, test plan creation, bug lifecycle on Jira\n2. **Automation Testing:** Java, Selenium WebDriver, TestNG, Cucumber BDD framework\n3. **Modern Tools:** Playwright with TypeScript and Postman API automation\n4. **AI for QA:** AI test generation, automated test maintenance, and self-healing tests\n\nWould you prefer attending live online classes or classroom sessions at our FC Road center?',
        timestamp: new Date(Date.now() - 3600000 * 18 + 2000).toISOString(),
        language: 'en'
      }
    ]
  },
  'conv-rohan': {
    id: 'conv-rohan',
    instituteId: 'inst-techsummit',
    leadId: 'lead-rohan',
    channel: 'web_chat',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      {
        id: 'msg-r1',
        conversationId: 'conv-rohan',
        instituteId: 'inst-techsummit',
        sender: 'student',
        text: 'मला Data Science आणि AI कोर्स बद्दल माहिती हवी आहे. वीकेंड बॅच उपलब्ध आहे का?',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        language: 'mr'
      },
      {
        id: 'msg-r2',
        conversationId: 'conv-rohan',
        instituteId: 'inst-techsummit',
        sender: 'assistant',
        text: 'नमस्कार रोहन! TechSummitTrainers मध्ये तुमचे स्वागत आहे. हो, आमच्याकडे वर्किंग प्रोफेशनल्ससाठी **Data Science & Analytics + AI** चा वीकेंड बॅच उपलब्ध आहे.\n\n- **कालावधी:** ५ महिने (प्रॅक्टिकल प्रोजेक्ट्ससह)\n- **अभ्यासक्रम:** Python, Advanced SQL, Power BI, Statistics, Machine Learning, आणि RAG सह Generative AI मॉडेलिंग\n- **फी:** ₹४५,००० पासून (सोपे EMI उपलब्ध)\n- **ठिकाण:** FC Road, शिवजीनगर, पुणे किंवा लाईव्ह ऑनलाईन.\n\nतुम्हाला या शनिवारच्या फ्री डेमो क्लासला उपस्थित राहायला आवडेल का?',
        timestamp: new Date(Date.now() - 3600000 * 12 + 2000).toISOString(),
        language: 'mr'
      }
    ]
  },
  'conv-sneha': {
    id: 'conv-sneha',
    instituteId: 'inst-techsummit',
    leadId: 'lead-sneha',
    channel: 'web_chat',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    messages: [
      {
        id: 'msg-s1',
        conversationId: 'conv-sneha',
        instituteId: 'inst-techsummit',
        sender: 'student',
        text: 'Hi! What are the prerequisites for the MERN Stack + DevOps + AI course?',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        language: 'en'
      },
      {
        id: 'msg-s2',
        conversationId: 'conv-sneha',
        instituteId: 'inst-techsummit',
        sender: 'assistant',
        text: 'Hello Sneha! There are no strict coding prerequisites. We begin from foundational HTML5, CSS3, and modern TypeScript before transitioning into ReactJS, Node.js, Express, MongoDB, Next.js, Docker, and AI APIs.\n\nAll you need is a laptop and a commitment of 10-15 hours per week for hands-on assignments. Would you like to speak directly with our course mentor?',
        timestamp: new Date(Date.now() - 3600000 * 8 + 2000).toISOString(),
        language: 'en'
      }
    ]
  },
  'conv-vikram': {
    id: 'conv-vikram',
    instituteId: 'inst-techsummit',
    leadId: 'lead-vikram',
    channel: 'web_chat',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    messages: [
      {
        id: 'msg-v1',
        conversationId: 'conv-vikram',
        instituteId: 'inst-techsummit',
        sender: 'student',
        text: 'Does TechSummitTrainers provide 100% placement guarantee for Python Full Stack?',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        language: 'en'
      },
      {
        id: 'msg-v2',
        conversationId: 'conv-vikram',
        instituteId: 'inst-techsummit',
        sender: 'assistant',
        text: 'To be transparent: **No, TechSummitTrainers does not offer a 100% placement guarantee**, and we advise caution regarding any institute that does.\n\nWhat we do provide is dedicated, intensive career support:\n- Production-level project building for your GitHub portfolio\n- Tailored resume and LinkedIn optimization\n- 1-on-1 technical and HR mock interviews\n- Active job referral opportunities through our hiring network\n\nOur 5-month Full-Stack Python + DevOps + AI program fee starts from ₹40,000. Would you like to attend a free demo session to see our teaching approach firsthand?',
        timestamp: new Date(Date.now() - 3600000 * 6 + 2000).toISOString(),
        language: 'en'
      }
    ]
  }
};

// 6. Follow-ups
const techFollowups = [
  {
    id: 'fup-aarav-demo',
    leadId: 'lead-aarav',
    instituteId: 'inst-techsummit',
    triggerCondition: 'Visit confirmation reminder 24h prior to Saturday',
    scheduledAt: new Date(Date.now() + 3600000 * 24).toISOString(),
    dueAt: new Date(Date.now() + 3600000 * 24).toISOString(),
    status: 'pending',
    messageTemplate: 'Hi Aarav, this is TechSummitTrainers reminding you about your free Java Full Stack demo class scheduled for Saturday 11:00 AM at Office No. 509, Kushal Wallstreet, FC Road, Pune. Let us know if you need directions!',
    retryCount: 0,
    maxRetries: 2,
    auditLog: [
      {
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        action: 'created',
        note: 'Created upon demo booking request'
      }
    ]
  },
  {
    id: 'fup-priya-syllabus',
    leadId: 'lead-priya',
    instituteId: 'inst-techsummit',
    triggerCondition: 'Share Testing syllabus and demo link',
    scheduledAt: new Date(Date.now() + 3600000 * 12).toISOString(),
    dueAt: new Date(Date.now() + 3600000 * 12).toISOString(),
    status: 'pending',
    messageTemplate: 'Hi Priya, here is the detailed curriculum breakdown for Software Testing + Automation + AI. Our next batch starts soon — would you like to join the free introductory session?',
    retryCount: 0,
    maxRetries: 1,
    auditLog: [
      {
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        action: 'created',
        note: 'Automated follow-up created'
      }
    ]
  }
];

// 7. Duplicates
const techDuplicates = [
  {
    id: 'dup-aarav-demo',
    instituteId: 'inst-techsummit',
    primaryLeadId: 'lead-aarav',
    duplicateLeadId: 'lead-aarav',
    matchConfidence: 95,
    matchReasons: [
      'Exact matching phone number (+91 98231 10022)',
      'Same interest: Full-Stack Java + DevOps + AI'
    ],
    status: 'detected',
    notes: 'Phone inquiry matches web chat inquiry for Aarav Sharma.'
  }
];

// Clean Knowledge conflicts and filter scrape runs
const cleanScrapeRuns = (data.scrapeRuns || []).filter(r => r.instituteId === 'inst-techsummit');
const cleanKnowledgeDocs = (data.knowledgeDocuments || []).filter(d => d.instituteId === 'inst-techsummit');

const newState = {
  institutes: [techInstitute],
  users: techUsers,
  courses: techCourses,
  leads: techLeads,
  conversations: techConversations,
  followUps: techFollowups,
  duplicates: techDuplicates,
  scrapeRuns: cleanScrapeRuns,
  knowledgeConflicts: [],
  knowledgeDocuments: cleanKnowledgeDocs
};

fs.writeFileSync(dbStatePath, JSON.stringify(newState, null, 2), 'utf8');
console.log('Successfully wrote clean TechSummit-only state to mock_db_state.json!');
console.log('Institutes:', newState.institutes.map(i => i.name));
console.log('Courses:', newState.courses.map(c => c.name));
console.log('Leads:', newState.leads.map(l => l.profile.name));
console.log('Conversations:', Object.keys(newState.conversations));
