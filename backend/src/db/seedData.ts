import { Institute, Course, Lead, User, FollowUpTask, DuplicateCandidate, Conversation } from './types';

export const SEED_INSTITUTES: Institute[] = [
  {
    "id": "inst-techsummit",
    "name": "TechSummitTrainers",
    "slug": "techsummittrainers",
    "type": "IT Training & Skill Development Institute",
    "city": "Pune",
    "phone": "+918485846806",
    "email": "admin@techsummittrainers.com",
    "address": "Office No. 509, Kushal Wallstreet, Fergusson College Road, Shivajinagar, Pune 411004, Maharashtra",
    "branches": [
      "FC Road, Shivajinagar, Pune (Office 509, Kushal Wallstreet)",
      "Live Online Batches"
    ],
    "website": "https://techsummittrainers.com/",
    "openingHours": "Monday – Saturday: 9:00 AM – 7:00 PM",
    "deliveryModes": [
      "Classroom (FC Road, Pune)",
      "Interactive Live Online"
    ],
    "demoBookingProcess": "Free demo classes are available upon callback request or direct contact at +91 84858 46806.",
    "careerSupportPolicy": "Dedicated resume and LinkedIn building, mentor mock interviews, and job-search assistance. Published disclaimer: TechSummitTrainers does not guarantee 100% placement.",
    "faqs": [
      {
        "question": "Do I need any prior coding experience?",
        "answer": "No. Every program starts from the fundamentals and progresses to advanced topics like microservices, DevOps and AI integration. Our batches are designed for freshers and career switchers from any degree background."
      },
      {
        "question": "Do you guarantee a job after the course?",
        "answer": "No, and we would be cautious of anyone claiming a 100% guarantee. What we provide is hands-on project experience, resume and LinkedIn building, mock interviews, and active support during your job search, so you are in the strongest possible position."
      },
      {
        "question": "What are the fees, and are EMIs available?",
        "answer": "Our full-stack programs (Java, Python and MERN) run 5 months from ₹40,000. Software Testing is 4 months from ₹30,000, and Data Science & Analytics is 5 months from ₹45,000. EMI options are available, and the exact fee is confirmed at your free demo."
      },
      {
        "question": "Is the training online, offline, or both?",
        "answer": "Both. Classroom sessions run from our FC Road, Pune centre, and the same live sessions are streamed online. You choose each day."
      },
      {
        "question": "Where exactly is the institute located?",
        "answer": "Office No. 509, Kushal Wallstreet, Fergusson College Road, Shivajinagar, Pune 411004. We are open Monday to Sunday, 7:30 AM to 9 PM."
      },
      {
        "question": "How do I book a free demo class?",
        "answer": "Fill the callback form on this page, call us on +91 84858 46806, or message us on WhatsApp. Demos are free and require no payment or commitment."
      }
    ],
    "lastFetchedAt": "2026-10-16T17:57:06.894Z"
  }
];

export const SEED_USERS: User[] = [
  {
    "id": "user-1",
    "instituteId": "inst-techsummit",
    "name": "Pooja Patil",
    "email": "admissions@techsummittrainers.com",
    "role": "admissions_head",
    "phone": "+91 84858 46806"
  },
  {
    "id": "user-2",
    "instituteId": "inst-techsummit",
    "name": "Rohit Deshmukh",
    "email": "counsellor@techsummittrainers.com",
    "role": "counsellor",
    "phone": "+91 84858 46806"
  },
  {
    "id": "user-3",
    "instituteId": "inst-techsummit",
    "name": "Amit Shinde",
    "email": "support@techsummittrainers.com",
    "role": "counsellor",
    "phone": "+91 84858 46806"
  }
];

export const SEED_COURSES: Course[] = [
  {
    "id": "crs-fullstack-java-devops-ai",
    "instituteId": "inst-techsummit",
    "code": "TST-JAVA-FSD",
    "name": "Full-Stack Java + DevOps + AI",
    "title": "Full-Stack Java + DevOps + AI",
    "slug": "fullstack-java-devops-ai",
    "category": "Software Engineering",
    "targetAudience": "College Graduates, Career Switchers, and Working Professionals seeking industry-ready tech skills",
    "eligibility": "Any graduation background (B.E., B.Tech, B.Sc, BCA, BCS, or non-CS graduates with analytical curiosity). No prior coding required.",
    "duration": "5 Months (20 Weeks intensive)",
    "durationMonths": 5,
    "durationWeeks": 20,
    "fee": 40000,
    "feeAmount": 40000,
    "currency": "INR",
    "feeType": "starting_from",
    "feeDisplay": "₹40,000 starting (Easy EMI available)",
    "emiAvailable": true,
    "schedules": [
      "Weekday Batches (Mon–Fri, 2 hrs/day practicals)",
      "Weekend Batches (Sat–Sun, 4 hrs/day intensive)"
    ],
    "locations": [
      "FC Road, Shivajinagar, Pune (Kushal Wallstreet, Office 509)",
      "Interactive Live Online"
    ],
    "nextBatchDate": "Oct 25, 2026",
    "deliveryModes": [
      "Classroom (FC Road, Pune)",
      "Interactive Live Online"
    ],
    "technologies": [
      "React",
      "Java",
      "Spring Boot",
      "Docker",
      "AWS",
      "AI"
    ],
    "curriculumModules": [
      {
        "moduleNumber": "MODULE 01 · WEEKS 1–5",
        "title": "Frontend",
        "topics": [
          "HTML5 & CSS3",
          "JavaScript & TypeScript",
          "ReactJS",
          "Responsive UI"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 1–2:",
            "topic": "HTML5, CSS3, Flexbox & Grid, responsive layouts, accessibility basics Wk 3: JavaScript fundamentals, DOM, ES6+, async/await, fetch Wk 4: TypeScript — types, interfaces, generics, tooling Wk 5: ReactJS — components, hooks, state, routing, forms, API integration"
          }
        ]
      },
      {
        "moduleNumber": "MODULE 02 · WEEKS 6–10",
        "title": "Backend",
        "topics": [
          "Core Java & OOP",
          "Spring Boot",
          "SQL & Hibernate",
          "Microservices"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 6–7:",
            "topic": "Core Java, OOP, collections, streams, exception handling, multithreading Wk 8: Spring Boot, REST APIs, dependency injection, validation Wk 9: SQL, JPA/Hibernate, relationships, transactions Wk 10: Microservices, Spring Cloud, API gateway, JWT auth, testing with JUnit"
          }
        ]
      },
      {
        "moduleNumber": "MODULE 03 · WEEKS 11–15",
        "title": "DevOps & Cloud",
        "topics": [
          "Git & GitHub",
          "Docker",
          "Kubernetes",
          "AWS & CI/CD"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 11:",
            "topic": "Linux basics, Git, GitHub, branching workflows, pull requests Wk 12–13: Docker — images, containers, Compose, multi-stage builds Wk 14: Kubernetes — pods, deployments, services, config Wk 15: AWS (EC2, S3, RDS), CI/CD pipelines with GitHub Actions, monitoring"
          }
        ]
      },
      {
        "moduleNumber": "MODULE 04 · WEEKS 16–18",
        "title": "AI Integration",
        "topics": [
          "Python for AI",
          "LLM APIs",
          "RAG & Vector DBs",
          "AI-assisted coding"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 16:",
            "topic": "Python fundamentals for developers, working with APIs Wk 17: LLM APIs, prompt engineering, function calling, structured output Wk 18: RAG pipelines, embeddings, vector databases, plugging AI into your Java app"
          }
        ]
      }
    ],
    "projects": [
      {
        "title": "Full-stack e-commerce platform",
        "description": "A working storefront with product listings, cart, checkout flow and admin panel, built end to end by you.",
        "technologies": [
          "React",
          "Spring Boot",
          "MySQL"
        ]
      },
      {
        "title": "Containerised microservices deployment",
        "description": "Break a monolith into services, containerise them, and deploy with a working CI/CD pipeline.",
        "technologies": [
          "Docker",
          "Kubernetes",
          "AWS"
        ]
      },
      {
        "title": "AI-powered support chatbot",
        "description": "Build a chatbot backed by an LLM API and a vector database that answers from your own documents.",
        "technologies": [
          "Python",
          "LLM APIs",
          "Vector DB"
        ]
      },
      {
        "title": "Your own production-grade app",
        "description": "A final project of your choice, built with mentor guidance and deployed live — the centrepiece of your portfolio.",
        "technologies": [
          "Full Stack",
          "Cloud Deploy"
        ]
      }
    ],
    "roles": [
      "Java Full-Stack Developer",
      "Backend Engineer",
      "DevOps Associate",
      "Software Engineer"
    ],
    "publishedSalaryRange": "₹3–8 LPA fresher salary range based on published market reports. (Disclaimer: TechSummitTrainers does not guarantee specific salaries).",
    "placementDisclaimer": "TechSummitTrainers provides comprehensive career support including mock interviews, resume & LinkedIn building, and interview opportunities. The institute explicitly does not guarantee 100% placement.",
    "prerequisites": [
      "Basic computer proficiency",
      "Dedication of 10–15 hours/week for hands-on practice"
    ],
    "faqs": [
      {
        "question": "Do I need to know Java before joining?",
        "answer": "No. Module 2 starts from Core Java fundamentals — variables, OOP, collections — and builds up to Spring Boot microservices. Freshers from any degree background join this batch."
      },
      {
        "question": "Why Java and not something newer?",
        "answer": "Java still accounts for a large share of enterprise hiring in Pune, especially in service companies and banking/fintech products. It remains one of the most reliable first jobs for a fresher, and Spring Boot skills transfer well if you later move to another stack."
      },
      {
        "question": "What if I miss a session?",
        "answer": "Recordings of every live session are shared within 24 hours, so you can catch up. Regular attendance is still encouraged, since our hands-on mentorship format works best when everyone shows up."
      },
      {
        "question": "Can working professionals join?",
        "answer": "Yes. Sessions are scheduled to work around typical work and college hours, with exact timings confirmed at your demo based on the batch."
      },
      {
        "question": "Do I need my own laptop?",
        "answer": "Yes, bring your own laptop. We'll help you set up the development environment in the first session."
      },
      {
        "question": "What happens after I submit my details?",
        "answer": "Our team reaches out by call or WhatsApp within 24 hours to understand your background and schedule a free demo class. No payment required."
      }
    ],
    "description": "5-month full-stack Java course with Spring Boot, React, DevOps, cloud and AI integration. Live practitioner-led classes on FC Road, Pune. ₹40,000, EMI available.",
    "highlights": [
      "Classroom + Live Online Hybrid delivery on FC Road, Pune",
      "Practical, hands-on portfolio projects with GitHub code reviews",
      "Integrated GenAI & DevOps workflows in every module",
      "Dedicated career support: mock interviews, resume optimization & job assistance"
    ],
    "scholarshipAvailable": false,
    "seatsTotal": 30,
    "seatsLeft": 8,
    "sourceUrl": "https://techsummittrainers.com/fullstack.html",
    "lastFetchedAt": "2026-10-16T17:57:06.942Z",
    "contentHash": "f9020b5e0535fd1275f0718553f1b2238484d4bb2bb3ae593ba230b392f18ba1",
    "verificationStatus": "verified",
    "extractionWarnings": []
  },
  {
    "id": "crs-fullstack-python-devops-ai",
    "instituteId": "inst-techsummit",
    "code": "TST-PY-FSD",
    "name": "Full-Stack Python + DevOps + AI",
    "title": "Full-Stack Python + DevOps + AI",
    "slug": "fullstack-python-devops-ai",
    "category": "Software Engineering & AI",
    "targetAudience": "College Graduates, Career Switchers, and Working Professionals seeking industry-ready tech skills",
    "eligibility": "Any graduation background (B.E., B.Tech, B.Sc, BCA, BCS, or non-CS graduates with analytical curiosity). No prior coding required.",
    "duration": "5 Months (20 Weeks intensive)",
    "durationMonths": 5,
    "durationWeeks": 20,
    "fee": 40000,
    "feeAmount": 40000,
    "currency": "INR",
    "feeType": "starting_from",
    "feeDisplay": "₹40,000 starting (Easy EMI available)",
    "emiAvailable": true,
    "schedules": [
      "Weekday Batches (Mon–Fri, 2 hrs/day practicals)",
      "Weekend Batches (Sat–Sun, 4 hrs/day intensive)"
    ],
    "locations": [
      "FC Road, Shivajinagar, Pune (Kushal Wallstreet, Office 509)",
      "Interactive Live Online"
    ],
    "nextBatchDate": "Oct 25, 2026",
    "deliveryModes": [
      "Classroom (FC Road, Pune)",
      "Interactive Live Online"
    ],
    "technologies": [
      "Python",
      "Django",
      "FastAPI",
      "React",
      "Docker",
      "AI"
    ],
    "curriculumModules": [
      {
        "moduleNumber": "MODULE 01 · WEEKS 1–5",
        "title": "Frontend",
        "topics": [
          "HTML5 & CSS3",
          "JavaScript ES6+",
          "ReactJS",
          "API integration"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 1–2:",
            "topic": "HTML5, CSS3, Flexbox & Grid, responsive layouts Wk 3: JavaScript fundamentals, DOM, ES6+, async/await Wk 4: ReactJS — components, hooks, state, routing Wk 5: Consuming REST APIs, forms, auth flows, deployment"
          }
        ]
      },
      {
        "moduleNumber": "MODULE 02 · WEEKS 6–10",
        "title": "Python Backend",
        "topics": [
          "Core Python & OOP",
          "Django & DRF",
          "FastAPI",
          "PostgreSQL"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 6–7:",
            "topic": "Core Python, OOP, modules, virtual envs, error handling, testing with pytest Wk 8: Django — models, views, templates, ORM, admin, auth Wk 9: Django REST Framework — serializers, viewsets, permissions, JWT Wk 10: FastAPI, async Python, PostgreSQL, Celery background jobs"
          }
        ]
      },
      {
        "moduleNumber": "MODULE 03 · WEEKS 11–15",
        "title": "DevOps & Cloud",
        "topics": [
          "Git & GitHub",
          "Docker",
          "Kubernetes",
          "AWS & CI/CD"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 11:",
            "topic": "Linux, Git, GitHub, branching workflows Wk 12–13: Docker — containerising Django/FastAPI apps, Compose, Nginx, Gunicorn Wk 14: Kubernetes basics — pods, deployments, services Wk 15: AWS (EC2, S3, RDS), CI/CD with GitHub Actions, logging and monitoring"
          }
        ]
      },
      {
        "moduleNumber": "MODULE 04 · WEEKS 16–18",
        "title": "AI Integration",
        "topics": [
          "LLM APIs",
          "LangChain basics",
          "RAG & Vector DBs",
          "AI-powered features"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 16:",
            "topic": "LLM APIs, prompt engineering, function calling, streaming responses Wk 17: Embeddings, vector databases, RAG pipelines end to end Wk 18: Shipping AI features inside a Django/FastAPI product — cost, latency, guardrails"
          }
        ]
      }
    ],
    "projects": [
      {
        "title": "Full-stack booking platform",
        "description": "A complete booking product with user auth, admin dashboard, payments flow and REST API, built end to end.",
        "technologies": [
          "React",
          "Django REST",
          "PostgreSQL"
        ]
      },
      {
        "title": "Dockerised deployment pipeline",
        "description": "Containerise your Python app, wire up a CI/CD pipeline, and deploy it to AWS with zero-downtime releases.",
        "technologies": [
          "Docker",
          "GitHub Actions",
          "AWS"
        ]
      },
      {
        "title": "Document Q&A assistant",
        "description": "A RAG application that ingests PDFs and answers questions with citations, served through a FastAPI backend.",
        "technologies": [
          "FastAPI",
          "Embeddings",
          "Vector DB"
        ]
      },
      {
        "title": "Your own production-grade app",
        "description": "A final project of your choice, built with mentor guidance and deployed live — the centrepiece of your portfolio.",
        "technologies": [
          "Full Stack",
          "Cloud Deploy"
        ]
      }
    ],
    "roles": [
      "Python Developer",
      "Full-Stack Engineer",
      "AI Integration Engineer",
      "Backend Specialist"
    ],
    "publishedSalaryRange": "₹3–8 LPA fresher salary range based on published market reports. (Disclaimer: TechSummitTrainers does not guarantee specific salaries).",
    "placementDisclaimer": "TechSummitTrainers provides comprehensive career support including mock interviews, resume & LinkedIn building, and interview opportunities. The institute explicitly does not guarantee 100% placement.",
    "prerequisites": [
      "Basic computer proficiency",
      "Dedication of 10–15 hours/week for hands-on practice"
    ],
    "faqs": [
      {
        "question": "Is Python full-stack really employable, or is it only for AI?",
        "answer": "Both. Django and FastAPI back a large number of Indian product startups and SaaS companies, and Python is also the default language for AI work. That combination is exactly why we teach the web stack and the AI stack together in one program."
      },
      {
        "question": "How is this different from the Data Science course?",
        "answer": "This course makes you a developer who can build and ship web products, with AI features layered in. The Data Science course makes you an analyst who works with data, statistics and models. Same language, very different job roles — we'll help you pick at your demo."
      },
      {
        "question": "What if I miss a session?",
        "answer": "Recordings of every live session are shared within 24 hours, so you can catch up. Regular attendance is still encouraged, since our hands-on mentorship format works best when everyone shows up."
      },
      {
        "question": "Can working professionals join?",
        "answer": "Yes. Sessions are scheduled to work around typical work and college hours, with exact timings confirmed at your demo based on the batch."
      },
      {
        "question": "Do I need my own laptop?",
        "answer": "Yes, bring your own laptop. We'll help you set up the development environment in the first session."
      },
      {
        "question": "What happens after I submit my details?",
        "answer": "Our team reaches out by call or WhatsApp within 24 hours to understand your background and schedule a free demo class. No payment required."
      }
    ],
    "description": "5-month full-stack Python course covering Django, FastAPI, React, DevOps, cloud and AI integration. Live classes on FC Road, Pune. ₹40,000, EMI available.",
    "highlights": [
      "Classroom + Live Online Hybrid delivery on FC Road, Pune",
      "Practical, hands-on portfolio projects with GitHub code reviews",
      "Integrated GenAI & DevOps workflows in every module",
      "Dedicated career support: mock interviews, resume optimization & job assistance"
    ],
    "scholarshipAvailable": false,
    "seatsTotal": 30,
    "seatsLeft": 8,
    "sourceUrl": "https://techsummittrainers.com/python-fullstack.html",
    "lastFetchedAt": "2026-10-16T17:57:07.035Z",
    "contentHash": "d18214beea785f189b1674273a68ffd58153f966b41f7e6f69d5af0b7f1dc03e",
    "verificationStatus": "verified",
    "extractionWarnings": []
  },
  {
    "id": "crs-mern-devops-ai",
    "instituteId": "inst-techsummit",
    "code": "TST-MERN-FSD",
    "name": "MERN Stack + DevOps + AI",
    "title": "MERN Stack + DevOps + AI",
    "slug": "mern-devops-ai",
    "category": "Web Development",
    "targetAudience": "College Graduates, Career Switchers, and Working Professionals seeking industry-ready tech skills",
    "eligibility": "Any graduation background (B.E., B.Tech, B.Sc, BCA, BCS, or non-CS graduates with analytical curiosity). No prior coding required.",
    "duration": "5 Months (20 Weeks intensive)",
    "durationMonths": 5,
    "durationWeeks": 20,
    "fee": 40000,
    "feeAmount": 40000,
    "currency": "INR",
    "feeType": "starting_from",
    "feeDisplay": "₹40,000 starting (Easy EMI available)",
    "emiAvailable": true,
    "schedules": [
      "Weekday Batches (Mon–Fri, 2 hrs/day practicals)",
      "Weekend Batches (Sat–Sun, 4 hrs/day intensive)"
    ],
    "locations": [
      "FC Road, Shivajinagar, Pune (Kushal Wallstreet, Office 509)",
      "Interactive Live Online"
    ],
    "nextBatchDate": "Oct 25, 2026",
    "deliveryModes": [
      "Classroom (FC Road, Pune)",
      "Interactive Live Online"
    ],
    "technologies": [
      "MongoDB",
      "Express",
      "React",
      "Node.js",
      "Docker",
      "AI"
    ],
    "curriculumModules": [
      {
        "moduleNumber": "MODULE 01 · WEEKS 1–5",
        "title": "Frontend (React)",
        "topics": [
          "HTML5 & CSS3",
          "JavaScript & TypeScript",
          "ReactJS",
          "State management"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 1–2:",
            "topic": "HTML5, CSS3, Flexbox & Grid, Tailwind, responsive layouts Wk 3: JavaScript deep dive — closures, promises, async/await, ES6+ Wk 4: TypeScript for React, props and types Wk 5: React — hooks, context, routing, forms, state management, performance"
          }
        ]
      },
      {
        "moduleNumber": "MODULE 02 · WEEKS 6–10",
        "title": "Backend (Node)",
        "topics": [
          "Node.js",
          "Express",
          "MongoDB & Mongoose",
          "Auth & REST APIs"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 6–7:",
            "topic": "Node.js runtime, modules, npm, event loop, file and stream handling Wk 8: Express — routing, middleware, error handling, REST API design Wk 9: MongoDB, Mongoose schemas, relationships, aggregation, indexing Wk 10: JWT auth, role-based access, file uploads, payments integration, testing"
          }
        ]
      },
      {
        "moduleNumber": "MODULE 03 · WEEKS 11–15",
        "title": "DevOps & Cloud",
        "topics": [
          "Git & GitHub",
          "Docker",
          "Kubernetes",
          "AWS & CI/CD"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 11:",
            "topic": "Linux, Git, GitHub, branching workflows, code review Wk 12–13: Docker — containerising Node and React apps, Compose, Nginx Wk 14: Kubernetes basics — pods, deployments, services Wk 15: AWS (EC2, S3, Atlas), CI/CD with GitHub Actions, environment management"
          }
        ]
      },
      {
        "moduleNumber": "MODULE 04 · WEEKS 16–18",
        "title": "AI Integration",
        "topics": [
          "Python for AI",
          "LLM APIs in Node",
          "RAG & Vector DBs",
          "Streaming AI UIs"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 16:",
            "topic": "Python basics for AI work, calling model APIs Wk 17: LLM APIs from Node, prompt engineering, function calling, streaming to React Wk 18: Embeddings, vector search with MongoDB Atlas, full RAG feature in your MERN app"
          }
        ]
      }
    ],
    "projects": [
      {
        "title": "Social marketplace app",
        "description": "A complete MERN product with auth, real-time feed, image uploads, search and an admin dashboard.",
        "technologies": [
          "React",
          "Express",
          "MongoDB"
        ]
      },
      {
        "title": "Dockerised MERN deployment",
        "description": "Containerise the client and server, wire a CI/CD pipeline, and deploy to AWS with a managed database.",
        "technologies": [
          "Docker",
          "GitHub Actions",
          "AWS"
        ]
      },
      {
        "title": "AI-assisted content platform",
        "description": "Add streaming LLM responses and vector search over your own data, straight inside a MERN application.",
        "technologies": [
          "Node",
          "LLM APIs",
          "Vector Search"
        ]
      },
      {
        "title": "Your own production-grade app",
        "description": "A final project of your choice, built with mentor guidance and deployed live — the centrepiece of your portfolio.",
        "technologies": [
          "Full Stack",
          "Cloud Deploy"
        ]
      }
    ],
    "roles": [
      "Full-Stack React/Node Developer",
      "MERN Stack Engineer",
      "Frontend Specialist",
      "Cloud Web Developer"
    ],
    "publishedSalaryRange": "₹3–8 LPA fresher salary range based on published market reports. (Disclaimer: TechSummitTrainers does not guarantee specific salaries).",
    "placementDisclaimer": "TechSummitTrainers provides comprehensive career support including mock interviews, resume & LinkedIn building, and interview opportunities. The institute explicitly does not guarantee 100% placement.",
    "prerequisites": [
      "Basic computer proficiency",
      "Dedication of 10–15 hours/week for hands-on practice"
    ],
    "faqs": [
      {
        "question": "MERN or Full-Stack Java — which should I pick?",
        "answer": "MERN tends to suit product startups and moves faster to a first shipped app, since it's one language throughout. Java tends to suit larger service companies and enterprise/banking products, and has more fresher openings in Pune overall. Bring your background to the free demo and we'll give you an honest recommendation rather than pushing whichever batch is filling."
      },
      {
        "question": "Do I need JavaScript experience first?",
        "answer": "No. Week 1 starts from HTML and CSS, and Week 3 is a proper JavaScript deep dive before any framework appears. Freshers from non-IT degrees are a normal part of this batch."
      },
      {
        "question": "What if I miss a session?",
        "answer": "Recordings of every live session are shared within 24 hours, so you can catch up. Regular attendance is still encouraged, since our hands-on mentorship format works best when everyone shows up."
      },
      {
        "question": "Can working professionals join?",
        "answer": "Yes. Sessions are scheduled to work around typical work and college hours, with exact timings confirmed at your demo based on the batch."
      },
      {
        "question": "Do I need my own laptop?",
        "answer": "Yes, bring your own laptop. We'll help you set up the development environment in the first session."
      },
      {
        "question": "What happens after I submit my details?",
        "answer": "Our team reaches out by call or WhatsApp within 24 hours to understand your background and schedule a free demo class. No payment required."
      }
    ],
    "description": "5-month MERN stack course covering MongoDB, Express, React and Node.js with DevOps, cloud and AI integration. Live classes on FC Road, Pune. ₹40,000, EMI available.",
    "highlights": [
      "Classroom + Live Online Hybrid delivery on FC Road, Pune",
      "Practical, hands-on portfolio projects with GitHub code reviews",
      "Integrated GenAI & DevOps workflows in every module",
      "Dedicated career support: mock interviews, resume optimization & job assistance"
    ],
    "scholarshipAvailable": false,
    "seatsTotal": 30,
    "seatsLeft": 8,
    "sourceUrl": "https://techsummittrainers.com/mern.html",
    "lastFetchedAt": "2026-10-16T17:57:07.086Z",
    "contentHash": "46ff52d5f4cf1f6c4a63888f4e3a491d52a33dd49382fd0e369f7192c1623b13",
    "verificationStatus": "verified",
    "extractionWarnings": []
  },
  {
    "id": "crs-software-testing-automation-ai",
    "instituteId": "inst-techsummit",
    "code": "TST-QA-AUTO",
    "name": "Software Testing + Automation + AI",
    "title": "Software Testing + Automation + AI",
    "slug": "software-testing-automation-ai",
    "category": "Quality Engineering",
    "targetAudience": "College Graduates, Career Switchers, and Working Professionals seeking industry-ready tech skills",
    "eligibility": "Any graduation background (B.E., B.Tech, B.Sc, BCA, BCS, or non-CS graduates with analytical curiosity). No prior coding required.",
    "duration": "4 Months (16 Weeks intensive)",
    "durationMonths": 4,
    "durationWeeks": 16,
    "fee": 30000,
    "feeAmount": 30000,
    "currency": "INR",
    "feeType": "starting_from",
    "feeDisplay": "₹30,000 starting (Easy EMI available)",
    "emiAvailable": true,
    "schedules": [
      "Weekday Batches (Mon–Fri, 2 hrs/day practicals)",
      "Weekend Batches (Sat–Sun, 4 hrs/day intensive)"
    ],
    "locations": [
      "FC Road, Shivajinagar, Pune (Kushal Wallstreet, Office 509)",
      "Interactive Live Online"
    ],
    "nextBatchDate": "Oct 25, 2026",
    "deliveryModes": [
      "Classroom (FC Road, Pune)",
      "Interactive Live Online"
    ],
    "technologies": [
      "Manual QA",
      "Selenium",
      "Java",
      "API Testing",
      "CI/CD",
      "AI QA"
    ],
    "curriculumModules": [
      {
        "moduleNumber": "MODULE 01 · WEEKS 1–4",
        "title": "Manual Testing",
        "topics": [
          "SDLC & STLC",
          "Test case design",
          "Bug lifecycle",
          "Agile & JIRA"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 1:",
            "topic": "SDLC, STLC, testing types, QA vs QC, the tester's role on a team Wk 2: Test case design — equivalence partitioning, boundary values, decision tables Wk 3: Defect lifecycle, severity vs priority, bug reporting that developers act on Wk 4: Agile, Scrum ceremonies, JIRA, test plans, traceability matrix"
          }
        ]
      },
      {
        "moduleNumber": "MODULE 02 · WEEKS 5–9",
        "title": "Automation",
        "topics": [
          "Java for testers",
          "Selenium WebDriver",
          "TestNG",
          "Page Object Model"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 5–6:",
            "topic": "Java essentials for testers — OOP, collections, exception handling Wk 7: Selenium WebDriver — locators, waits, dropdowns, frames, alerts Wk 8: TestNG — annotations, assertions, data providers, parallel runs, reporting Wk 9: Page Object Model, framework design, Maven, reusable utilities"
          }
        ]
      },
      {
        "moduleNumber": "MODULE 03 · WEEKS 10–13",
        "title": "API, DB & CI/CD",
        "topics": [
          "SQL for testers",
          "Postman",
          "REST Assured",
          "Git & Jenkins"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 10:",
            "topic": "SQL for testers — joins, subqueries, backend data validation Wk 11: API testing concepts, Postman, collections, environments, assertions Wk 12: REST Assured — automating API tests inside your Java framework Wk 13: Git, GitHub, Jenkins/GitHub Actions, running suites in a CI pipeline"
          }
        ]
      },
      {
        "moduleNumber": "MODULE 04 · WEEKS 14–15",
        "title": "AI-Assisted QA",
        "topics": [
          "AI test generation",
          "LLMs for test data",
          "Self-healing locators",
          "Testing AI features"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 14:",
            "topic": "Using LLMs to generate test cases, test data and boundary scenarios; reviewing what they get wrong Wk 15: Self-healing locators, AI-assisted debugging, and how to test an AI-powered feature — non-determinism, evals, guardrails"
          }
        ]
      }
    ],
    "projects": [
      {
        "title": "End-to-end test documentation pack",
        "description": "A complete test plan, test case suite, RTM and defect report for a live web application — the artefact interviewers ask to see.",
        "technologies": [
          "JIRA",
          "Test Plans",
          "RTM"
        ]
      },
      {
        "title": "Hybrid Selenium framework",
        "description": "Build a reusable Page Object Model framework from scratch with TestNG, data-driven tests and HTML reporting.",
        "technologies": [
          "Selenium",
          "TestNG",
          "Maven"
        ]
      },
      {
        "title": "Automated API regression suite",
        "description": "Automate a REST API end to end with REST Assured and trigger the suite on every commit through a CI pipeline.",
        "technologies": [
          "REST Assured",
          "Postman",
          "Jenkins"
        ]
      },
      {
        "title": "AI-assisted QA project",
        "description": "Take a real application, generate a test suite with AI assistance, verify and correct it, then automate and run it in CI.",
        "technologies": [
          "AI Tooling",
          "Selenium",
          "CI/CD"
        ]
      }
    ],
    "roles": [
      "QA Automation Engineer",
      "SDET (Software Development Engineer in Test)",
      "API Test Specialist"
    ],
    "publishedSalaryRange": "₹3–8 LPA fresher salary range based on published market reports. (Disclaimer: TechSummitTrainers does not guarantee specific salaries).",
    "placementDisclaimer": "TechSummitTrainers provides comprehensive career support including mock interviews, resume & LinkedIn building, and interview opportunities. The institute explicitly does not guarantee 100% placement.",
    "prerequisites": [
      "Basic computer proficiency",
      "Dedication of 10–15 hours/week for hands-on practice"
    ],
    "faqs": [
      {
        "question": "Is testing still a good career with AI around?",
        "answer": "The honest answer: manual-only testing is getting squeezed, and we won't pretend otherwise. That's exactly why this course spends its last month on automation frameworks and AI-assisted QA. A tester who can build a Selenium framework, automate APIs, and use AI tooling critically is in a far stronger position than one who only writes test cases by hand."
      },
      {
        "question": "Do I need programming experience?",
        "answer": "No. Weeks 1–4 are non-programming manual testing. Java is introduced from scratch in Week 5, taught specifically for testers rather than as a full developer course."
      },
      {
        "question": "Can I switch to development later?",
        "answer": "Yes, and several people do. The Java, Git, API and CI/CD skills in this course overlap directly with the Full-Stack Java program, so moving across later is a shorter jump than starting over."
      },
      {
        "question": "What if I miss a session?",
        "answer": "Recordings of every live session are shared within 24 hours, so you can catch up. Regular attendance is still encouraged, since our hands-on mentorship format works best when everyone shows up."
      },
      {
        "question": "Can working professionals join?",
        "answer": "Yes. Sessions are scheduled to work around typical work and college hours, with exact timings confirmed at your demo based on the batch."
      },
      {
        "question": "Do I need my own laptop?",
        "answer": "Yes, bring your own laptop. We'll help you set up the development environment in the first session."
      },
      {
        "question": "What happens after I submit my details?",
        "answer": "Our team reaches out by call or WhatsApp within 24 hours to understand your background and schedule a free demo class. No payment required."
      }
    ],
    "description": "4-month software testing course covering manual testing, Selenium, API testing, CI/CD and AI-assisted QA. Live classes on FC Road, Pune. ₹30,000, EMI available.",
    "highlights": [
      "Classroom + Live Online Hybrid delivery on FC Road, Pune",
      "Practical, hands-on portfolio projects with GitHub code reviews",
      "Integrated GenAI & DevOps workflows in every module",
      "Dedicated career support: mock interviews, resume optimization & job assistance"
    ],
    "scholarshipAvailable": false,
    "seatsTotal": 30,
    "seatsLeft": 8,
    "sourceUrl": "https://techsummittrainers.com/software-testing.html",
    "lastFetchedAt": "2026-10-16T17:57:07.136Z",
    "contentHash": "0d0bbd49ed1e65dafecd56c9051ffab2d34c2e2c404beb86395002d32cf73a1d",
    "verificationStatus": "verified",
    "extractionWarnings": []
  },
  {
    "id": "crs-data-science-analytics-ai",
    "instituteId": "inst-techsummit",
    "code": "TST-DS-AI",
    "name": "Data Science & Analytics + AI",
    "title": "Data Science & Analytics + AI",
    "slug": "data-science-analytics-ai",
    "category": "Data Science & AI",
    "targetAudience": "College Graduates, Career Switchers, and Working Professionals seeking industry-ready tech skills",
    "eligibility": "Any graduation background (B.E., B.Tech, B.Sc, BCA, BCS, or non-CS graduates with analytical curiosity). No prior coding required.",
    "duration": "5 Months (20 Weeks intensive)",
    "durationMonths": 5,
    "durationWeeks": 20,
    "fee": 45000,
    "feeAmount": 45000,
    "currency": "INR",
    "feeType": "starting_from",
    "feeDisplay": "₹45,000 starting (Easy EMI available)",
    "emiAvailable": true,
    "schedules": [
      "Weekday Batches (Mon–Fri, 2 hrs/day practicals)",
      "Weekend Batches (Sat–Sun, 4 hrs/day intensive)"
    ],
    "locations": [
      "FC Road, Shivajinagar, Pune (Kushal Wallstreet, Office 509)",
      "Interactive Live Online"
    ],
    "nextBatchDate": "Oct 25, 2026",
    "deliveryModes": [
      "Classroom (FC Road, Pune)",
      "Interactive Live Online"
    ],
    "technologies": [
      "Python",
      "SQL",
      "Statistics",
      "Power BI",
      "ML",
      "AI"
    ],
    "curriculumModules": [
      {
        "moduleNumber": "MODULE 01 · WEEKS 1–5",
        "title": "Python & SQL",
        "topics": [
          "Core Python",
          "NumPy & Pandas",
          "SQL for analysis",
          "Data cleaning"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 1–2:",
            "topic": "Core Python — data structures, functions, OOP basics, Jupyter workflow Wk 3: NumPy and Pandas — indexing, groupby, merges, reshaping Wk 4: SQL — joins, aggregations, subqueries, window functions Wk 5: Real-world data cleaning — missing values, outliers, type issues, messy CSVs"
          }
        ]
      },
      {
        "moduleNumber": "MODULE 02 · WEEKS 6–10",
        "title": "Statistics & Visualisation",
        "topics": [
          "Descriptive statistics",
          "Probability & inference",
          "Matplotlib & Seaborn",
          "Power BI"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 6:",
            "topic": "Descriptive statistics, distributions, correlation Wk 7: Probability, sampling, confidence intervals, hypothesis testing, A/B tests Wk 8: Exploratory data analysis, Matplotlib, Seaborn, storytelling with charts Wk 9–10: Power BI — data modelling, DAX basics, interactive dashboards; Excel for analysts"
          }
        ]
      },
      {
        "moduleNumber": "MODULE 03 · WEEKS 11–15",
        "title": "Machine Learning",
        "topics": [
          "Regression & classification",
          "Clustering",
          "Model evaluation",
          "Feature engineering"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 11:",
            "topic": "ML workflow, train/test split, scikit-learn, linear & logistic regression Wk 12: Decision trees, random forests, gradient boosting Wk 13: Clustering, dimensionality reduction, recommendation basics Wk 14: Feature engineering, cross-validation, hyperparameter tuning, imbalanced data Wk 15: Model evaluation, interpretation, and knowing when not to use ML"
          }
        ]
      },
      {
        "moduleNumber": "MODULE 04 · WEEKS 16–18",
        "title": "Applied AI",
        "topics": [
          "LLM APIs",
          "Embeddings & RAG",
          "AI for analysis",
          "Deployment"
        ],
        "weekBreakdown": [
          {
            "week": "Wk 16:",
            "topic": "LLM APIs, prompt engineering, using AI to accelerate exploratory analysis Wk 17: Embeddings, vector databases, RAG over your own datasets and documents Wk 18: Deploying a model or dashboard — Streamlit/FastAPI, cloud hosting, sharing your work"
          }
        ]
      }
    ],
    "projects": [
      {
        "title": "End-to-end EDA report",
        "description": "Take a messy real-world dataset, clean it, explore it, and produce an analysis with clear findings and visuals.",
        "technologies": [
          "Pandas",
          "SQL",
          "Seaborn"
        ]
      },
      {
        "title": "Interactive business dashboard",
        "description": "Build a multi-page Power BI dashboard with a proper data model that answers real business questions.",
        "technologies": [
          "Power BI",
          "DAX",
          "Excel"
        ]
      },
      {
        "title": "Predictive model, end to end",
        "description": "Frame a business problem, engineer features, train and tune models, and defend your evaluation choices.",
        "technologies": [
          "scikit-learn",
          "Feature Eng.",
          "Evaluation"
        ]
      },
      {
        "title": "Deployed AI data product",
        "description": "A full project of your choice — data pipeline through to a deployed dashboard or model with an AI layer.",
        "technologies": [
          "Streamlit",
          "LLM APIs",
          "Cloud Deploy"
        ]
      }
    ],
    "roles": [
      "Data Analyst",
      "Data Scientist",
      "Business Intelligence Engineer",
      "ML Associate"
    ],
    "publishedSalaryRange": "₹3–8 LPA fresher salary range based on published market reports. (Disclaimer: TechSummitTrainers does not guarantee specific salaries).",
    "placementDisclaimer": "TechSummitTrainers provides comprehensive career support including mock interviews, resume & LinkedIn building, and interview opportunities. The institute explicitly does not guarantee 100% placement.",
    "prerequisites": [
      "Basic computer proficiency",
      "Dedication of 10–15 hours/week for hands-on practice"
    ],
    "faqs": [
      {
        "question": "Do I need a maths or statistics degree?",
        "answer": "No. Statistics is taught from the ground up in Module 2, focused on what you actually apply as an analyst rather than on proofs. Comfort with numbers helps; a specific degree does not."
      },
      {
        "question": "Will I become a Data Scientist in 5 months?",
        "answer": "Realistically, most freshers enter this field as a Data Analyst or Business Analyst first, then move into data science with a couple of years of experience. We aim you at the roles you can genuinely get now, and give you the ML foundation to grow into the rest. Anyone promising a fresher Data Scientist title in five months is selling you something."
      },
      {
        "question": "What if I miss a session?",
        "answer": "Recordings of every live session are shared within 24 hours, so you can catch up. Regular attendance is still encouraged, since our hands-on mentorship format works best when everyone shows up."
      },
      {
        "question": "Can working professionals join?",
        "answer": "Yes. Sessions are scheduled to work around typical work and college hours, with exact timings confirmed at your demo based on the batch."
      },
      {
        "question": "Do I need my own laptop?",
        "answer": "Yes, bring your own laptop. We'll help you set up the development environment in the first session."
      },
      {
        "question": "What happens after I submit my details?",
        "answer": "Our team reaches out by call or WhatsApp within 24 hours to understand your background and schedule a free demo class. No payment required."
      }
    ],
    "description": "5-month data science and analytics course covering Python, SQL, statistics, Power BI, machine learning and applied AI. Live classes on FC Road, Pune. ₹45,000, EMI available.",
    "highlights": [
      "Classroom + Live Online Hybrid delivery on FC Road, Pune",
      "Practical, hands-on portfolio projects with GitHub code reviews",
      "Integrated GenAI & DevOps workflows in every module",
      "Dedicated career support: mock interviews, resume optimization & job assistance"
    ],
    "scholarshipAvailable": false,
    "seatsTotal": 30,
    "seatsLeft": 8,
    "sourceUrl": "https://techsummittrainers.com/data-science.html",
    "lastFetchedAt": "2026-10-16T17:57:07.189Z",
    "contentHash": "f1211e26b43ec2c491ab4b72759ef8ef4b857094ab57e4a972ca945892ce8faf",
    "verificationStatus": "verified",
    "extractionWarnings": []
  }
];

export const SEED_LEADS: Lead[] = [
  {
    "id": "lead-aarav",
    "instituteId": "inst-techsummit",
    "createdAt": "2026-10-15T18:16:55.268Z",
    "updatedAt": "2026-10-16T17:16:55.278Z",
    "channel": "web_chat",
    "conversationId": "conv-aarav",
    "status": "active",
    "profile": {
      "name": "Aarav Sharma",
      "phone": "+91 98231 10022",
      "email": "aarav.sharma@gmail.com",
      "academicLevel": "B.E. Graduate (2025)",
      "courseInterest": "Full-Stack Java + DevOps + AI",
      "budgetMin": 40000,
      "budgetMax": 50000,
      "preferredSchedule": "Weekday evening batches",
      "location": "FC Road, Pune",
      "preferredLanguage": "en",
      "admissionTimeline": "Immediate (Next week)",
      "visitPreference": "Saturday 11:00 AM (FC Road Center)",
      "leadStage": "Visit Pending Confirmation",
      "leadScore": 85,
      "scoreReasons": [
        {
          "factor": "course_interest",
          "points": 20,
          "description": "Interested in Full-Stack Java + DevOps + AI",
          "timestamp": "2026-10-15T18:16:55.278Z"
        },
        {
          "factor": "academic_level",
          "points": 15,
          "description": "Eligible engineering graduate",
          "timestamp": "2026-10-15T22:16:55.278Z"
        },
        {
          "factor": "budget_stated",
          "points": 15,
          "description": "Stated budget ₹40k-50k matches starting fee",
          "timestamp": "2026-10-16T03:16:55.278Z"
        },
        {
          "factor": "timeline_defined",
          "points": 15,
          "description": "Immediate admission timeline",
          "timestamp": "2026-10-16T08:16:55.278Z"
        },
        {
          "factor": "visit_requested",
          "points": 10,
          "description": "Requested free demo visit on Saturday",
          "timestamp": "2026-10-16T16:16:55.278Z"
        },
        {
          "factor": "contact_provided",
          "points": 10,
          "description": "Verified mobile number provided",
          "timestamp": "2026-10-16T17:16:55.278Z"
        }
      ],
      "confirmedFacts": {
        "courseInterest": {
          "value": "Full-Stack Java + DevOps + AI",
          "timestamp": "2026-10-15T18:16:55.278Z",
          "source": "user_explicit"
        },
        "location": {
          "value": "FC Road, Pune",
          "timestamp": "2026-10-15T22:16:55.278Z",
          "source": "user_explicit"
        },
        "phone": {
          "value": "+91 98231 10022",
          "timestamp": "2026-10-16T17:16:55.278Z",
          "source": "user_explicit"
        }
      },
      "unverifiedFacts": {},
      "humanHandoff": false,
      "lastIntent": "campus_visit_request"
    }
  },
  {
    "id": "lead-priya",
    "instituteId": "inst-techsummit",
    "createdAt": "2026-10-16T00:16:55.278Z",
    "updatedAt": "2026-10-16T15:16:55.278Z",
    "channel": "web_chat",
    "conversationId": "conv-priya",
    "status": "active",
    "profile": {
      "name": "Priya Patil",
      "phone": "+91 98232 20033",
      "email": "priya.patil@outlook.com",
      "academicLevel": "BCA Final Year",
      "courseInterest": "Software Testing + Automation + AI",
      "budgetMin": 30000,
      "budgetMax": 35000,
      "preferredSchedule": "Morning Batch (Live Online)",
      "location": "Pune (Online)",
      "preferredLanguage": "en",
      "admissionTimeline": "Within 2 weeks",
      "leadStage": "Engaged",
      "leadScore": 70,
      "scoreReasons": [
        {
          "factor": "course_interest",
          "points": 20,
          "description": "Interested in Software Testing + Automation + AI",
          "timestamp": "2026-10-16T00:16:55.278Z"
        },
        {
          "factor": "budget_stated",
          "points": 15,
          "description": "Budget ₹30,000 matches course fee",
          "timestamp": "2026-10-16T06:16:55.278Z"
        },
        {
          "factor": "contact_provided",
          "points": 15,
          "description": "Name and phone provided",
          "timestamp": "2026-10-16T15:16:55.278Z"
        },
        {
          "factor": "timeline_defined",
          "points": 20,
          "description": "Ready to join next batch",
          "timestamp": "2026-10-16T15:16:55.278Z"
        }
      ],
      "confirmedFacts": {
        "courseInterest": {
          "value": "Software Testing + Automation + AI",
          "timestamp": "2026-10-16T00:16:55.278Z",
          "source": "user_explicit"
        }
      },
      "unverifiedFacts": {},
      "humanHandoff": false,
      "lastIntent": "course_enquiry"
    }
  },
  {
    "id": "lead-rohan",
    "instituteId": "inst-techsummit",
    "createdAt": "2026-10-16T06:16:55.278Z",
    "updatedAt": "2026-10-16T16:16:55.278Z",
    "channel": "web_chat",
    "conversationId": "conv-rohan",
    "status": "active",
    "profile": {
      "name": "Rohan Deshmukh",
      "phone": "+91 98233 30044",
      "academicLevel": "Working Professional (Tech Support)",
      "courseInterest": "Data Science & Analytics + AI",
      "budgetMin": 45000,
      "budgetMax": 50000,
      "preferredSchedule": "Weekend Intensive Batches",
      "location": "Shivajinagar, Pune",
      "preferredLanguage": "mr",
      "admissionTimeline": "Next Month",
      "leadStage": "Qualified",
      "leadScore": 80,
      "scoreReasons": [
        {
          "factor": "course_interest",
          "points": 20,
          "description": "Interested in Data Science & Analytics + AI",
          "timestamp": "2026-10-16T06:16:55.278Z"
        },
        {
          "factor": "working_professional",
          "points": 20,
          "description": "Seeking career transition to Data Science",
          "timestamp": "2026-10-16T10:16:55.278Z"
        },
        {
          "factor": "budget_matched",
          "points": 20,
          "description": "Budget ₹45k matches fee",
          "timestamp": "2026-10-16T14:16:55.278Z"
        },
        {
          "factor": "contact_provided",
          "points": 20,
          "description": "Verified contact number",
          "timestamp": "2026-10-16T16:16:55.278Z"
        }
      ],
      "confirmedFacts": {},
      "unverifiedFacts": {},
      "humanHandoff": false,
      "lastIntent": "course_enquiry"
    }
  },
  {
    "id": "lead-sneha",
    "instituteId": "inst-techsummit",
    "createdAt": "2026-10-16T10:16:55.278Z",
    "updatedAt": "2026-10-16T17:16:55.278Z",
    "channel": "web_chat",
    "conversationId": "conv-sneha",
    "status": "active",
    "profile": {
      "name": "Sneha Kulkarni",
      "phone": "+91 98234 40055",
      "academicLevel": "B.Tech IT (2025)",
      "courseInterest": "MERN Stack + DevOps + AI",
      "budgetMin": 40000,
      "budgetMax": 45000,
      "preferredSchedule": "Weekday Batches",
      "location": "Pune Center (FC Road)",
      "preferredLanguage": "en",
      "admissionTimeline": "Immediate",
      "leadStage": "Counselling Requested",
      "leadScore": 75,
      "scoreReasons": [
        {
          "factor": "course_interest",
          "points": 20,
          "description": "Targeting MERN Stack + DevOps + AI",
          "timestamp": "2026-10-16T10:16:55.278Z"
        },
        {
          "factor": "counselling_booked",
          "points": 25,
          "description": "Requested counselling with tech trainer",
          "timestamp": "2026-10-16T16:16:55.278Z"
        },
        {
          "factor": "contact_provided",
          "points": 30,
          "description": "Valid contact details",
          "timestamp": "2026-10-16T17:16:55.278Z"
        }
      ],
      "confirmedFacts": {},
      "unverifiedFacts": {},
      "humanHandoff": false,
      "lastIntent": "counselling_appointment"
    }
  },
  {
    "id": "lead-vikram",
    "instituteId": "inst-techsummit",
    "createdAt": "2026-10-16T12:16:55.278Z",
    "updatedAt": "2026-10-16T17:16:55.278Z",
    "channel": "web_chat",
    "conversationId": "conv-vikram",
    "status": "active",
    "profile": {
      "name": "Vikram Joshi",
      "phone": "+91 98235 50066",
      "academicLevel": "B.Sc Computer Science",
      "courseInterest": "Full-Stack Python + DevOps + AI",
      "budgetMin": 40000,
      "budgetMax": 45000,
      "preferredSchedule": "Evening Batches",
      "location": "FC Road, Pune",
      "preferredLanguage": "en",
      "admissionTimeline": "Next week",
      "leadStage": "Engaged",
      "leadScore": 65,
      "scoreReasons": [
        {
          "factor": "course_interest",
          "points": 20,
          "description": "Inquired about Python Full Stack & AI",
          "timestamp": "2026-10-16T12:16:55.278Z"
        },
        {
          "factor": "budget_matched",
          "points": 25,
          "description": "Comfortable with ₹40k starting fee",
          "timestamp": "2026-10-16T15:16:55.278Z"
        },
        {
          "factor": "contact_shared",
          "points": 20,
          "description": "Phone number shared for demo schedule",
          "timestamp": "2026-10-16T17:16:55.278Z"
        }
      ],
      "confirmedFacts": {},
      "unverifiedFacts": {},
      "humanHandoff": false,
      "lastIntent": "course_enquiry"
    }
  }
];

export const SEED_CONVERSATIONS: Record<string, Conversation> = {
  "conv-aarav": {
    "id": "conv-aarav",
    "instituteId": "inst-techsummit",
    "leadId": "lead-aarav",
    "channel": "web_chat",
    "status": "active",
    "createdAt": "2026-10-15T18:16:55.278Z",
    "updatedAt": "2026-10-16T17:16:55.278Z",
    "messages": [
      {
        "id": "msg-a1",
        "conversationId": "conv-aarav",
        "instituteId": "inst-techsummit",
        "sender": "student",
        "text": "Hi, I want to do java full stack course. Can you give me the details?",
        "timestamp": "2026-10-15T18:16:55.278Z",
        "language": "en"
      },
      {
        "id": "msg-a2",
        "conversationId": "conv-aarav",
        "instituteId": "inst-techsummit",
        "sender": "assistant",
        "text": "That's a great choice, Aarav! We offer a comprehensive **Full-Stack Java + DevOps + AI** program designed for freshers and career switchers.\n\n### Course Highlights:\n- **Duration:** 5 Months (20 Weeks intensive)\n- **Frontend:** HTML5, CSS3, JavaScript, TypeScript, ReactJS\n- **Backend:** Core Java, Spring Boot, Microservices, REST APIs, JPA/Hibernate\n- **DevOps & Cloud:** Docker, Kubernetes, AWS, CI/CD with GitHub Actions\n- **AI Integration:** LLM APIs, Vector Databases, RAG architectures & AI-assisted development\n- **Fee:** Starting from ₹40,000 (Flexible EMI available)\n- **Delivery:** Classroom training at our FC Road center in Pune, or interactive live online sessions.\n\nAre you looking for weekday evening batches or weekend intensive batches?",
        "timestamp": "2026-10-15T18:16:57.278Z",
        "language": "en"
      },
      {
        "id": "msg-a3",
        "conversationId": "conv-aarav",
        "instituteId": "inst-techsummit",
        "sender": "student",
        "text": "I prefer evening batches on FC Road. Can I attend a free demo class?",
        "timestamp": "2026-10-16T17:16:55.278Z",
        "language": "en"
      },
      {
        "id": "msg-a4",
        "conversationId": "conv-aarav",
        "instituteId": "inst-techsummit",
        "sender": "assistant",
        "text": "Yes, absolutely! Free demo classes are available at our FC Road center:\n\n📍 **Location:** Office No. 509, Kushal Wallstreet, Fergusson College Road, Shivajinagar, Pune 411004.\n📅 **Upcoming Demo:** Saturday at 11:00 AM.\n\nOur demo session is completely free with no payment or commitment required. Would you like me to book your seat for this Saturday?",
        "timestamp": "2026-10-16T17:16:57.778Z",
        "language": "en"
      }
    ]
  },
  "conv-priya": {
    "id": "conv-priya",
    "instituteId": "inst-techsummit",
    "leadId": "lead-priya",
    "channel": "web_chat",
    "status": "active",
    "createdAt": "2026-10-16T00:16:55.278Z",
    "updatedAt": "2026-10-16T15:16:55.278Z",
    "messages": [
      {
        "id": "msg-p1",
        "conversationId": "conv-priya",
        "instituteId": "inst-techsummit",
        "sender": "student",
        "text": "Hello, what is covered in your Software Testing program?",
        "timestamp": "2026-10-16T00:16:55.278Z",
        "language": "en"
      },
      {
        "id": "msg-p2",
        "conversationId": "conv-priya",
        "instituteId": "inst-techsummit",
        "sender": "assistant",
        "text": "Hello Priya! Our **Software Testing + Automation + AI** program is a 4-month practical course starting from ₹30,000 (EMI available).\n\n### What You Will Learn:\n1. **Manual Testing:** SDLC, STLC, test plan creation, bug lifecycle on Jira\n2. **Automation Testing:** Java, Selenium WebDriver, TestNG, Cucumber BDD framework\n3. **Modern Tools:** Playwright with TypeScript and Postman API automation\n4. **AI for QA:** AI test generation, automated test maintenance, and self-healing tests\n\nWould you prefer attending live online classes or classroom sessions at our FC Road center?",
        "timestamp": "2026-10-16T00:16:57.278Z",
        "language": "en"
      }
    ]
  },
  "conv-rohan": {
    "id": "conv-rohan",
    "instituteId": "inst-techsummit",
    "leadId": "lead-rohan",
    "channel": "web_chat",
    "status": "active",
    "createdAt": "2026-10-16T06:16:55.278Z",
    "updatedAt": "2026-10-16T16:16:55.278Z",
    "messages": [
      {
        "id": "msg-r1",
        "conversationId": "conv-rohan",
        "instituteId": "inst-techsummit",
        "sender": "student",
        "text": "मला Data Science आणि AI कोर्स बद्दल माहिती हवी आहे. वीकेंड बॅच उपलब्ध आहे का?",
        "timestamp": "2026-10-16T06:16:55.278Z",
        "language": "mr"
      },
      {
        "id": "msg-r2",
        "conversationId": "conv-rohan",
        "instituteId": "inst-techsummit",
        "sender": "assistant",
        "text": "नमस्कार रोहन! TechSummitTrainers मध्ये तुमचे स्वागत आहे. हो, आमच्याकडे वर्किंग प्रोफेशनल्ससाठी **Data Science & Analytics + AI** चा वीकेंड बॅच उपलब्ध आहे.\n\n- **कालावधी:** ५ महिने (प्रॅक्टिकल प्रोजेक्ट्ससह)\n- **अभ्यासक्रम:** Python, Advanced SQL, Power BI, Statistics, Machine Learning, आणि RAG सह Generative AI मॉडेलिंग\n- **फी:** ₹४५,००० पासून (सोपे EMI उपलब्ध)\n- **ठिकाण:** FC Road, शिवजीनगर, पुणे किंवा लाईव्ह ऑनलाईन.\n\nतुम्हाला या शनिवारच्या फ्री डेमो क्लासला उपस्थित राहायला आवडेल का?",
        "timestamp": "2026-10-16T06:16:57.278Z",
        "language": "mr"
      }
    ]
  },
  "conv-sneha": {
    "id": "conv-sneha",
    "instituteId": "inst-techsummit",
    "leadId": "lead-sneha",
    "channel": "web_chat",
    "status": "active",
    "createdAt": "2026-10-16T10:16:55.278Z",
    "updatedAt": "2026-10-16T17:16:55.278Z",
    "messages": [
      {
        "id": "msg-s1",
        "conversationId": "conv-sneha",
        "instituteId": "inst-techsummit",
        "sender": "student",
        "text": "Hi! What are the prerequisites for the MERN Stack + DevOps + AI course?",
        "timestamp": "2026-10-16T10:16:55.278Z",
        "language": "en"
      },
      {
        "id": "msg-s2",
        "conversationId": "conv-sneha",
        "instituteId": "inst-techsummit",
        "sender": "assistant",
        "text": "Hello Sneha! There are no strict coding prerequisites. We begin from foundational HTML5, CSS3, and modern TypeScript before transitioning into ReactJS, Node.js, Express, MongoDB, Next.js, Docker, and AI APIs.\n\nAll you need is a laptop and a commitment of 10-15 hours per week for hands-on assignments. Would you like to speak directly with our course mentor?",
        "timestamp": "2026-10-16T10:16:57.278Z",
        "language": "en"
      }
    ]
  },
  "conv-vikram": {
    "id": "conv-vikram",
    "instituteId": "inst-techsummit",
    "leadId": "lead-vikram",
    "channel": "web_chat",
    "status": "active",
    "createdAt": "2026-10-16T12:16:55.278Z",
    "updatedAt": "2026-10-16T17:16:55.278Z",
    "messages": [
      {
        "id": "msg-v1",
        "conversationId": "conv-vikram",
        "instituteId": "inst-techsummit",
        "sender": "student",
        "text": "Does TechSummitTrainers provide 100% placement guarantee for Python Full Stack?",
        "timestamp": "2026-10-16T12:16:55.278Z",
        "language": "en"
      },
      {
        "id": "msg-v2",
        "conversationId": "conv-vikram",
        "instituteId": "inst-techsummit",
        "sender": "assistant",
        "text": "To be transparent: **No, TechSummitTrainers does not offer a 100% placement guarantee**, and we advise caution regarding any institute that does.\n\nWhat we do provide is dedicated, intensive career support:\n- Production-level project building for your GitHub portfolio\n- Tailored resume and LinkedIn optimization\n- 1-on-1 technical and HR mock interviews\n- Active job referral opportunities through our hiring network\n\nOur 5-month Full-Stack Python + DevOps + AI program fee starts from ₹40,000. Would you like to attend a free demo session to see our teaching approach firsthand?",
        "timestamp": "2026-10-16T12:16:57.278Z",
        "language": "en"
      }
    ]
  }
};

export const SEED_FOLLOWUPS: FollowUpTask[] = [
  {
    "id": "fup-aarav-demo",
    "leadId": "lead-aarav",
    "instituteId": "inst-techsummit",
    "triggerCondition": "Visit confirmation reminder 24h prior to Saturday",
    "scheduledAt": "2026-10-17T18:16:55.278Z",
    "dueAt": "2026-10-17T18:16:55.278Z",
    "status": "pending",
    "messageTemplate": "Hi Aarav, this is TechSummitTrainers reminding you about your free Java Full Stack demo class scheduled for Saturday 11:00 AM at Office No. 509, Kushal Wallstreet, FC Road, Pune. Let us know if you need directions!",
    "retryCount": 0,
    "maxRetries": 2,
    "auditLog": [
      {
        "timestamp": "2026-10-16T16:16:55.278Z",
        "action": "created",
        "note": "Created upon demo booking request"
      }
    ]
  },
  {
    "id": "fup-priya-syllabus",
    "leadId": "lead-priya",
    "instituteId": "inst-techsummit",
    "triggerCondition": "Share Testing syllabus and demo link",
    "scheduledAt": "2026-10-17T06:16:55.278Z",
    "dueAt": "2026-10-17T06:16:55.278Z",
    "status": "pending",
    "messageTemplate": "Hi Priya, here is the detailed curriculum breakdown for Software Testing + Automation + AI. Our next batch starts soon — would you like to join the free introductory session?",
    "retryCount": 0,
    "maxRetries": 1,
    "auditLog": [
      {
        "timestamp": "2026-10-16T15:16:55.278Z",
        "action": "created",
        "note": "Automated follow-up created"
      }
    ]
  }
];

export const SEED_DUPLICATES: DuplicateCandidate[] = [
  {
    "id": "dup-aarav-demo",
    "instituteId": "inst-techsummit",
    "primaryLeadId": "lead-aarav",
    "duplicateLeadId": "lead-aarav",
    "matchConfidence": 95,
    "matchReasons": [
      "Exact matching phone number (+91 98231 10022)",
      "Same interest: Full-Stack Java + DevOps + AI"
    ],
    "status": "detected",
    "notes": "Phone inquiry matches web chat inquiry for Aarav Sharma."
  }
];
