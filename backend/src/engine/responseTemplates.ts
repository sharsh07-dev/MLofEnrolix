import { Language, StudentProfile, IntentType } from '../db/types';
import { CourseMatch } from './courseRecommender';

type TemplateId =
  | 'TPL_GREETING'
  | 'TPL_GREETING_HI'
  | 'TPL_GREETING_MR'
  | 'TPL_ASK_BACKGROUND'
  | 'TPL_JEE_CLASS12_WELCOME'
  | 'TPL_JEE_CLASS11_WELCOME'
  | 'TPL_NEET_WELCOME'
  | 'TPL_CET_WELCOME'
  | 'TPL_ABROAD_WELCOME'
  | 'TPL_PRESCHOOL_WELCOME'
  | 'TPL_COURSE_MATCH_BUDGET'
  | 'TPL_COURSE_NO_MATCH'
  | 'TPL_FEE_ENQUIRY'
  | 'TPL_SCHOLARSHIP_INFO'
  | 'TPL_NO_SCHOLARSHIP'
  | 'TPL_ELIGIBILITY'
  | 'TPL_SCHEDULE_INFO'
  | 'TPL_LOCATION_INFO'
  | 'TPL_ADMISSION_PROCESS'
  | 'TPL_CAMPUS_VISIT_BOOKED'
  | 'TPL_COUNSELLING_BOOKED'
  | 'TPL_CALLBACK_NOTED'
  | 'TPL_COMPARISON'
  | 'TPL_OBJECTION_FEE'
  | 'TPL_OBJECTION_JOB'
  | 'TPL_OBJECTION_FAMILY'
  | 'TPL_OBJECTION_SCHEDULE'
  | 'TPL_OBJECTION_TRUST'
  | 'TPL_HUMAN_HANDOFF_REQUEST'
  | 'TPL_HUMAN_HANDOFF_COMPLAINT'
  | 'TPL_CONFIRMATION_THANKS'
  | 'TPL_REJECTION_OPT_OUT'
  | 'TPL_GOODBYE'
  | 'TPL_FALLBACK'
  | 'TPL_CLARIFY'
  | 'TPL_STATUS_UPDATE'
  | 'TPL_VISIT_RECORDED'
  | 'TPL_FULLSTACK_WELCOME'
  | 'TPL_COURSE_RECOMMENDATION';

interface TemplateData {
  profile: StudentProfile;
  courseMatches?: CourseMatch[];
  courseNames?: string;
  instituteName?: string;
  branches?: string;
  counsellorName?: string;
  [key: string]: any;
}

type TemplateSet = Record<Language, string>;
type TemplateRegistry = Record<string, TemplateSet>;

const TEMPLATES: TemplateRegistry = {
  TPL_GREETING: {
    en: "Hello{{name}}! Welcome to TechSummitTrainers. I'm your AI admissions counsellor. Which professional program are you interested in — Full-Stack Java, Full-Stack Python, MERN Stack, Software Testing, or Data Science & Analytics with AI?",
    hi: "नमस्ते{{name}}! TechSummitTrainers में आपका स्वागत है। मैं आपकी प्रवेश सहायक हूँ। आप किस प्रोग्राम में रुचि रखते हैं — Full-Stack Java, Full-Stack Python, MERN Stack, Software Testing, या Data Science & AI?",
    mr: "नमस्कार{{name}}! TechSummitTrainers मध्ये आपले स्वागत आहे. मी तुमचा प्रवेश सहाय्यक आहे. तुम्हाला कोणत्या कोर्समध्ये स्वारस्य आहे — Full-Stack Java, Full-Stack Python, MERN Stack, Software Testing, किंवा Data Science & AI?"
  },
  TPL_ASK_BACKGROUND: {
    en: "To recommend the ideal curriculum module, could you share your academic background or current role, and the tech stack you're targeting?",
    hi: "बेहतर मार्गदर्शन के लिए, क्या आप अपनी शैक्षणिक पृष्ठभूमि और लक्षित टेक स्टैक बता सकते हैं?",
    mr: "अधिक चांगल्या मार्गदर्शनासाठी, तुमची शैक्षणिक पार्श्वभूमी आणि तुम्हाला शिकायचे असलेले तंत्रज्ञान सांगाल का?"
  },
  TPL_JEE_CLASS12_WELCOME: {
    en: "Welcome, {{name}}! At TechSummitTrainers, our flagship programs are built for students and graduates stepping into software engineering. We offer **Full-Stack Java + DevOps + AI** (₹40,000 starting) and **MERN Stack + DevOps + AI** (₹40,000 starting) with hands-on live projects and dedicated career mentoring on FC Road, Pune or Online. Which track interests you most?",
    hi: "{{name}}, TechSummitTrainers में आपका स्वागत है! हमारे प्रमुख प्रोग्राम्स: **Full-Stack Java** और **MERN Stack** (शुरुआती फीस ₹40,000, आसान EMI उपलब्ध)। कौन सा ट्रैक आपको पसंद है?",
    mr: "{{name}}, TechSummitTrainers मध्ये आपले स्वागत आहे! आमचे प्रमुख प्रोग्राम्स: **Full-Stack Java** आणि **MERN Stack** (सुरुवातीची फी ₹40,000, सुलभ EMI सह). तुम्हाला कोणता ट्रॅक आवडेल?"
  },
  TPL_JEE_CLASS11_WELCOME: {
    en: "Great to connect, {{name}}! TechSummitTrainers specializes in industry-ready tech training. We offer complete practical programs in **Python & AI**, **Full-Stack Java**, and **Data Science & Analytics**. All courses include live mentorship, portfolio projects, and free demo classes. Would you like details on upcoming demo schedules?",
    hi: "{{name}}, TechSummitTrainers में आपका स्वागत है! हम **Python & AI**, **Full-Stack Java**, और **Data Science** में विशेषज्ञता रखते हैं। क्या आप फ्री डेमो क्लास की जानकारी चाहेंगे?",
    mr: "{{name}}, TechSummitTrainers मध्ये आपले स्वागत आहे! आम्ही **Python & AI**, **Full-Stack Java**, आणि **Data Science** चे प्रशिक्षण देतो. फ्री डेमो क्लासबद्दल अधिक जाणून घेणार का?"
  },
  TPL_NEET_WELCOME: {
    en: "Hello, {{name}}! For careers in technology and data, TechSummitTrainers offers intensive practitioner-led programs in **Data Science & Analytics + AI** (5 Months, ₹45,000 starting) and **Software Testing & QA Automation** (4 Months, ₹30,000 starting). Both are beginner-friendly and include real-world capstones. Would you like to view the syllabus module breakdown?",
    hi: "{{name}}, TechSummitTrainers में डेटा और टेक प्रोग्राम्स: **Data Science & AI** (5 महीने, ₹45,000) और **Software Testing** (4 महीने, ₹30,000)। क्या आप सिलेबस देखना चाहेंगे?",
    mr: "{{name}}, TechSummitTrainers मध्ये: **Data Science & AI** (5 महिने, ₹45,000) आणि **Software Testing** (4 महिने, ₹30,000). सिलॅबस पाहायचा आहे का?"
  },
  TPL_CET_WELCOME: {
    en: "Hello {{name}}! If you're looking for fast-track skill development with hands-on coding, our **Software Testing + Automation + AI** course (₹30,000 starting, 4 Months) and **MERN Stack + DevOps + AI** (₹40,000 starting, 5 Months) provide the fastest route to industry readiness. Would you like to attend a free live demo session?",
    hi: "{{name}}, टेक करियर के लिए हमारे प्रोग्राम्स: **Software Testing** (₹30,000) और **MERN Stack** (₹40,000)। फ्री डेमो क्लास अटेंड करना चाहेंगे?",
    mr: "{{name}}, टेक करिअरसाठी: **Software Testing** (₹30,000) आणि **MERN Stack** (₹40,000). फ्री डेमो क्लासमध्ये सहभागी व्हायचे का?"
  },
  TPL_ABROAD_WELCOME: {
    en: "Hello {{name}}! Our **Full-Stack Python + DevOps + AI** and **Data Science & Analytics + AI** courses are designed with global production standards (Docker, Kubernetes, AWS, FastAPI, GenAI) to prepare you for enterprise tech opportunities. Which domain are you targeting?",
    hi: "{{name}}, हमारे ग्लोबल स्टैंडर्ड प्रोग्राम्स: **Python + DevOps + AI** और **Data Science & Analytics**। आप किस डोमेन में जाना चाहते हैं?",
    mr: "{{name}}, आमचे प्रोग्रॅम्स: **Python + DevOps + AI** आणि **Data Science & Analytics**. तुम्हाला कोणत्या क्षेत्रात जायचे आहे?"
  },
  TPL_PRESCHOOL_WELCOME: {
    en: "Welcome to TechSummitTrainers! We are a technical IT training institute offering industry-aligned engineering bootcamps in Full-Stack Java, Python, MERN, Software Testing, and Data Science. Are you looking for technical training for yourself or a student?",
    hi: "TechSummitTrainers में आपका स्वागत है! हम Full-Stack, Python, MERN, Software Testing, और Data Science का प्रशिक्षण देते हैं। क्या आप अपने लिए टेक कोर्स ढूंढ रहे हैं?",
    mr: "TechSummitTrainers मध्ये आपले स्वागत आहे! आम्ही Full-Stack, Python, MERN, Software Testing, आणि Data Science चे प्रशिक्षण देतो."
  },
  TPL_FULLSTACK_WELCOME: {
    en: "Here are the verified details for our **Full-Stack Development Programs** at TechSummitTrainers:\n\n• **Java Track:** Full-Stack Java + DevOps + AI (5 Months, ₹40,000 starting · EMI available)\n• **Python Track:** Full-Stack Python + DevOps + AI (5 Months, ₹40,000 starting · EMI available)\n• **MERN Track:** MERN Stack + DevOps + AI (5 Months, ₹40,000 starting · EMI available)\n• **Delivery:** Classroom training at FC Road, Pune + Interactive Live Online\n• **Batch Timings:** Weekday (Mon–Fri practicals) & Weekend intensive\n• **Career Support:** Resume/LinkedIn building, mock interviews, and job-search assistance (100% placement is not guaranteed)\n\nWould you like to attend a free live demo class or speak with a senior counsellor?",
    hi: "TechSummitTrainers के **Full-Stack Development Programs** का विवरण:\n\n• **Java Track:** Full-Stack Java + DevOps + AI (5 महीने, ₹40,000 शुरुआती)\n• **Python Track:** Full-Stack Python + DevOps + AI (5 महीने, ₹40,000 शुरुआती)\n• **MERN Track:** MERN Stack + DevOps + AI (5 महीने, ₹40,000 शुरुआती)\n• **स्थान:** एफसी रोड, पुणे और ऑनलाइन लाइव\n\nक्या आप फ्री डेमो क्लास या बैच विवरण चाहते हैं?",
    mr: "TechSummitTrainers च्या **Full-Stack Programs** ची माहिती:\n\n• **Java Track:** Full-Stack Java + DevOps + AI (5 महिने, ₹40,000 सुरुवातीची फी)\n• **Python Track:** Full-Stack Python + DevOps + AI (5 महिने, ₹40,000 सुरुवातीची फी)\n• **MERN Track:** MERN Stack + DevOps + AI (5 महिने, ₹40,000 सुरुवातीची फी)\n• **केंद्रे:** एफसी रोड, पुणे आणि ऑनलाइन लाइव्ह\n\nआपल्याला फ्री डेमो क्लास किंवा बॅच नोंदणीबद्दल अधिक माहिती हवी आहे का?"
  },
  TPL_COURSE_MATCH_BUDGET: {
    en: "Based on what you've shared, here are the best-matching TechSummitTrainers courses for you:\n\n{{courseList}}\n\nWould you like to attend a free live demo session or connect with an admissions counsellor?",
    hi: "आपकी जानकारी के आधार पर सबसे उपयुक्त टेक कोर्स:\n\n{{courseList}}\n\nक्या आप फ्री डेमो क्लास या काउंसलिंग सत्र बुक करना चाहेंगे?",
    mr: "तुमच्या गरजेनुसार सर्वोत्तम टेक कोर्सेस:\n\n{{courseList}}\n\nफ्री डेमो क्लास किंवा समुपदेशन सत्र बुक करायचे का?"
  },
  TPL_COURSE_NO_MATCH: {
    en: "I couldn't verify that detail from the currently available course information. Our verified catalogue focuses on Full-Stack Java, Python, MERN, Software Testing, and Data Science. I can connect you with a counsellor for confirmation.",
    hi: "वर्तमान कोर्स जानकारी में इसका विवरण नहीं मिला। हम Full-Stack, Python, MERN, Software Testing, और Data Science सिखाते हैं। पुष्टि के लिए काउंसलर से कनेक्ट करूँ?",
    mr: "सध्याच्या कोर्स माहितीमध्ये हा तपशील सापडला नाही. आमचे अधिकृत कोर्सेस Full-Stack Java, Python, MERN, Software Testing, आणि Data Science आहेत. समुपदेशकाशी कनेक्ट करू का?"
  },
  TPL_FEE_ENQUIRY: {
    en: "Here is the published fee overview for all official programs at TechSummitTrainers:\n\n| Program | Duration | Published Starting Fee |\n|---|---|---|\n| Full-Stack Java + DevOps + AI | 5 Months | ₹40,000 starting (EMI available) |\n| Full-Stack Python + DevOps + AI | 5 Months | ₹40,000 starting (EMI available) |\n| MERN Stack + DevOps + AI | 5 Months | ₹40,000 starting (EMI available) |\n| Software Testing + Automation + AI | 4 Months | ₹30,000 starting (EMI available) |\n| Data Science & Analytics + AI | 5 Months | ₹45,000 starting (EMI available) |\n\nAll programs offer easy monthly EMI options and include free demo classes. Which program would you like to enroll in?",
    hi: "TechSummitTrainers के आधिकारिक कार्यक्रमों की फीस:\n\n• Full-Stack Java + DevOps + AI: ₹40,000 शुरुआती (5 महीने)\n• Full-Stack Python + DevOps + AI: ₹40,000 शुरुआती (5 महीने)\n• MERN Stack + DevOps + AI: ₹40,000 शुरुआती (5 महीने)\n• Software Testing + Automation + AI: ₹30,000 शुरुआती (4 महीने)\n• Data Science & Analytics + AI: ₹45,000 शुरुआती (5 महीने)\n\nआसान किश्तों (EMI) की सुविधा उपलब्ध है। आप किस कोर्स के बारे में जानना चाहते हैं?",
    mr: "TechSummitTrainers च्या अधिकृत कोर्सेसची फी रचना:\n\n• Full-Stack Java + DevOps + AI: ₹40,000 सुरुवातीची फी (5 महिने)\n• Full-Stack Python + DevOps + AI: ₹40,000 सुरुवातीची फी (5 महिने)\n• MERN Stack + DevOps + AI: ₹40,000 सुरुवातीची फी (5 महिने)\n• Software Testing + Automation + AI: ₹30,000 सुरुवातीची फी (4 महिने)\n• Data Science & Analytics + AI: ₹45,000 सुरुवातीची फी (5 महिने)\n\nसर्व कोर्सेससाठी सुलभ हप्ते (EMI) उपलब्ध आहेत. कोणत्या कोर्समध्ये प्रवेश घ्यायचा आहे?"
  },
  TPL_SCHOLARSHIP_INFO: {
    en: "TechSummitTrainers publishes starting fees (e.g. ₹40,000 for Full-Stack, ₹30,000 for Testing) with flexible EMI payment plans. For merit-based concessions or early-enrollment discounts, please speak with an admissions counsellor for exact eligibility details.",
    hi: "TechSummitTrainers प्रकाशित फीस और आसान EMI विकल्प प्रदान करता है। किसी भी छूट या रियायत की पुष्टि के लिए काउंसलर से बात करें।",
    mr: "TechSummitTrainers प्रकाशित फी आणि सोपे हप्ते (EMI) पर्याय देते. कोणत्याही सवलतीची पुष्टी समुपदेशकाद्वारे केली जाते."
  },
  TPL_NO_SCHOLARSHIP: {
    en: "I couldn't verify that detail from the currently available course information. I can connect you with a counsellor for confirmation.",
    hi: "वर्तमान कोर्स जानकारी में इसका विवरण नहीं मिला। पुष्टि के लिए काउंसलर से कनेक्ट करूँ?",
    mr: "सध्याच्या कोर्स माहितीमध्ये हा तपशील सापडला नाही. समुपदेशकाशी कनेक्ट करू का?"
  },
  TPL_ELIGIBILITY: {
    en: "Eligibility for TechSummitTrainers courses:\n\n- **Full-Stack & Data Science Programs:** Open to all graduates (B.E., B.Tech, B.Sc, BCA, BCS, and non-CS graduates with analytical curiosity). No prior coding required.\n- **Software Testing:** Open to freshers and degree holders from any stream aiming for QA automation roles.\n\nAll courses start with programming fundamentals and advance to industry projects. Does this align with your background?",
    hi: "पात्रता आवश्यकताएं:\n- ग्रेजुएट्स (B.E., B.Tech, B.Sc, BCA, BCS आदि)\n- कोडिंग का पूर्व अनुभव आवश्यक नहीं है, बेसिक से शुरुआत होती है।\n\nक्या यह आपके बैकग्राउंड से मेल खाता है?",
    mr: "पात्रता:\n- कोणत्याही शाखेचे पदवीधर (B.E., B.Tech, B.Sc, BCA, BCS किंवा इतर)\n- आधी कोडिंगचा अनुभव नसला तरी चालेल, मूलभूत गोष्टींपासून शिकवले जाते."
  },
  TPL_SCHEDULE_INFO: {
    en: "Batch schedules at TechSummitTrainers (FC Road, Pune & Live Online):\n\n☀️ **Weekday Batches:** Mon–Fri (2 hrs/day practical hands-on)\n📅 **Weekend Batches:** Sat–Sun (4 hrs/day intensive sessions)\n💻 **Live Interactive Online:** Real-time live classes with mentor Q&A\n\nWhich batch timing suits you better?",
    hi: "बैच शेड्यूल:\n☀️ वीकेंड व वीकेंड बैच उपलब्ध (एफसी रोड, पुणे और ऑनलाइन लाइव)। कौन सा समय आपके लिए सही रहेगा?",
    mr: "बॅच वेळापत्रक:\n☀️ वीकेंड व वीकेंड बॅचेस (एफसी रोड, पुणे आणि ऑनलाइन लाइव्ह). कोणती वेळ सोयीची आहे?"
  },
  TPL_LOCATION_INFO: {
    en: "TechSummitTrainers is located in Pune:\n\n📍 **Center:** Office No. 509, Kushal Wallstreet, Fergusson College Road, Shivajinagar, Pune 411004\n📞 **Phone:** +91 84858 46806\n✉️ **Email:** admin@techsummittrainers.com\n\nWe offer both classroom training at our FC Road center and interactive live online sessions. Which mode works best for you?",
    hi: "TechSummitTrainers का पता:\n📍 ऑफिस नं. 509, कुशल वॉलस्ट्रीट, फर्ग्यूसन कॉलेज रोड, शिवाजीनगर, पुणे 411004\n📞 फोन: +91 84858 46806\nक्लासरूम और ऑनलाइन दोनों विकल्प उपलब्ध हैं।",
    mr: "TechSummitTrainers चा पत्ता:\n📍 ऑफिस नं. 509, कुशल वॉलस्ट्रीट, फर्ग्युसन कॉलेज रोड, शिवाजीनगर, पुणे 411004\n📞 फोन: +91 84858 46806\nक्लासरूम आणि ऑनलाइन दोन्ही पद्धती उपलब्ध आहेत."
  },
  TPL_ADMISSION_PROCESS: {
    en: "The admission process at TechSummitTrainers:\n\n1️⃣ **Free Live Demo** — Attend a free live demo session with practitioner trainers\n2️⃣ **Profile & Goal Review** — Meet a counsellor to choose the right tech stack\n3️⃣ **Batch Selection & Enrollment** — Reserve your seat with flexible EMI\n4️⃣ **Hands-on Learning** — Build real production portfolio projects on GitHub\n\nWould you like to book a free live demo session?",
    hi: "प्रवेश प्रक्रिया:\n1️⃣ फ्री लाइव डेमो सेशन\n2️⃣ प्रोफाइल काउंसलिंग\n3️⃣ सीट रजिस्ट्रेशन व बैच चयन\n4️⃣ प्रोजेक्ट-आधारित क्लास\n\nक्या आप फ्री डेमो बुक करना चाहते हैं?",
    mr: "प्रवेश प्रक्रिया:\n1️⃣ मोफत लाइव्ह डेमो सत्र\n2️⃣ प्रोफाइल समुपदेशन\n3️⃣ बॅच निवड व नोंदणी\n4️⃣ प्रत्यक्ष प्रोजेक्ट्सवर आधारित शिक्षण\n\nमोफत डेमो सत्र बुक करायचे का?"
  },
  TPL_CAMPUS_VISIT_BOOKED: {
    en: "Your center visit request has been recorded! ✅\n\n📍 **Center:** Office No. 509, Kushal Wallstreet, FC Road, Shivajinagar, Pune 411004\n📅 **Preferred Time:** {{visitPref}}\n\nA counsellor will confirm the exact timing and arrange your free demo session. You'll receive a confirmation at {{phone}}. See you soon!",
    hi: "आपकी विजिट दर्ज हो गई! ✅\n📍 कुशल वॉलस्ट्रीट, एफसी रोड, पुणे\nकाउंसलर जल्द पुष्टि करेंगे।",
    mr: "तुमची भेट नोंदवली गेली! ✅\n📍 कुशल वॉलस्ट्रीट, एफसी रोड, पुणे\nसमुपदेशक लवकरच संपर्क करतील."
  },
  TPL_COUNSELLING_BOOKED: {
    en: "Your counselling session has been scheduled! 🎓\n\n👤 **Counsellor:** {{counsellor}}\n📅 **Slot:** {{slot}}\n📍 **Venue:** Office No. 509, Kushal Wallstreet, FC Road, Pune (or Online Google Meet)\n\nWe look forward to helping you launch your tech career!",
    hi: "आपकी काउंसलिंग अपॉइंटमेंट शेड्यूल हो गई! 🎓 कुशल वॉलस्ट्रीट, एफसी रोड, पुणे या ऑनलाइन।",
    mr: "तुमची समुपदेशन अपॉइंटमेंट शेड्यूल झाली! 🎓 कुशल वॉलस्ट्रीट, एफसी रोड किंवा ऑनलाइन."
  },
  TPL_CALLBACK_NOTED: {
    en: "Callback request noted! 📞 An admissions counsellor from TechSummitTrainers will reach out to {{phone}} shortly. You can also call us directly at +91 84858 46806.",
    hi: "कॉलबैक अनुरोध दर्ज हुआ! 📞 TechSummitTrainers से जल्द {{phone}} पर कॉल आएगा।",
    mr: "कॉलबॅक नोंदवला! 📞 TechSummitTrainers कडून लवकरच {{phone}} वर संपर्क केला जाईल."
  },
  TPL_COMPARISON: {
    en: "Here is a quick comparison between our core software tracks:\n\n| | Full-Stack Java | MERN Stack | Full-Stack Python |\n|---|---|---|---|\n| **Primary Tech** | Spring Boot, Microservices | React, Node.js, Express | Django, FastAPI, AI Agents |\n| **Duration** | 5 Months | 5 Months | 5 Months |\n| **Starting Fee** | ₹40,000 (EMI avail.) | ₹40,000 (EMI avail.) | ₹40,000 (EMI avail.) |\n| **Key Roles** | Java Backend / Enterprise Dev | Full-Stack Web Dev / SaaS | Python Dev / AI Engineer |\n\nWhich track aligns closer with your goals?",
    hi: "Full-Stack Java vs MERN vs Python तुलना:\nसभी 5 महीने के हैं और शुरुआती फीस ₹40,000 है। आपका लक्ष्य क्या है?",
    mr: "Java vs MERN vs Python तुलना:\nसर्व कोर्सेस 5 महिन्यांचे असून सुरुवातीची फी ₹40,000 आहे. तुमचे ध्येय काय आहे?"
  },
  TPL_OBJECTION_FEE: {
    en: "We understand that investing in education is an important decision. TechSummitTrainers offers:\n\n💰 **Flexible EMI Plans:** Break fees into manageable monthly installments\n🎓 **Inclusive Practical Training:** All tools, cloud labs, and code reviews included\n💼 **Dedicated Career Services:** Resume building and mock interviews included at no extra cost\n\nWould you like to speak with a counsellor to explore installment options?",
    hi: "हम समझते हैं। TechSummitTrainers में आसान EMI विकल्प उपलब्ध हैं। काउंसलर से EMI विकल्प पर चर्चा करना चाहेंगे?",
    mr: "फीससाठी TechSummitTrainers कडे सोपे हप्ते (EMI) पर्याय उपलब्ध आहेत. समुपदेशकाशी चर्चा करू का?"
  },
  TPL_OBJECTION_JOB: {
    en: "That's an important question. TechSummitTrainers provides comprehensive career support including resume optimization, LinkedIn review, mentor mock interviews, and job-search assistance. However, the institute explicitly states that it does NOT guarantee 100% placement or specific salaries.\n\nWould you like to connect with a counsellor to learn more about our career support?",
    hi: "उचित सवाल है। TechSummitTrainers रेज्युमे बिल्डिंग और मॉक इंटरव्यू में पूरी सहायता करता है, लेकिन 100% प्लेसमेंट की गारंटी नहीं देता। क्या आप काउंसलर से बात करना चाहेंगे?",
    mr: "TechSummitTrainers मॉक इंटरव्यू आणि रेझ्युमे बिल्डिंगमध्ये संपूर्ण मदत करते, परंतु 100% प्लेसमेंटची हमी देत नाही. समुपदेशकाशी चर्चा करू का?"
  },
  TPL_OBJECTION_FAMILY: {
    en: "Absolutely — discussing with your family is a great idea. We can provide a detailed course syllabus, schedule, and fee breakdown for you to share with them. You are also welcome to attend a free demo class together at our FC Road center or online. Would that help?",
    hi: "बिल्कुल, परिवार से चर्चा करें। हम विस्तृत ब्रोशर भेज सकते हैं या आप फ्री डेमो क्लास में साथ शामिल हो सकते हैं।",
    mr: "नक्कीच, कुटुंबाशी चर्चा करा. आम्ही संपूर्ण सिलॅबस पाठवू शकतो किंवा तुम्ही एकत्र मोफत डेमो क्लास अटेंड करू शकता."
  },
  TPL_OBJECTION_SCHEDULE: {
    en: "We offer flexible batch schedules to accommodate your routine:\n\n🌆 **Weekday Evenings:** Practical sessions designed for college students and working professionals\n📅 **Weekend Batches:** Intensive Saturday and Sunday sessions\n💻 **Live Online:** Attend from anywhere with live interactive mentor support\n\nWhich format fits your availability?",
    hi: "हमारे पास शाम के बैच, वीकेंड बैच और ऑनलाइन लाइव बैच उपलब्ध हैं। कौन सा समय उपयुक्त है?",
    mr: "आमच्याकडे संध्याकाळच्या बॅचेस, वीकएंड बॅचेस आणि ऑनलाइन लाइव्ह पर्याय उपलब्ध आहेत."
  },
  TPL_OBJECTION_TRUST: {
    en: "That's a very fair question! Here's how you can verify our credentials:\n\n✅ Visit our FC Road center in person (Kushal Wallstreet, Office 509)\n✅ Attend a free live demo session before paying any fees\n✅ Inspect our curriculum on GitHub and review student project repositories\n✅ All fee receipts and terms are transparently provided in writing\n\nWould you like to attend an upcoming free demo session to see for yourself?",
    hi: "आप हमारे एफसी रोड केंद्र पर आ सकते हैं या कोई भी फीस देने से पहले फ्री डेमो क्लास अटेंड कर सकते हैं। क्या आप डेमो क्लास देखना चाहेंगे?",
    mr: "तुम्ही आमच्या एफसी रोड केंद्राला भेट देऊ शकता किंवा फी भरण्यापूर्वी मोफत डेमो क्लास अटेंड करू शकता."
  },
  TPL_HUMAN_HANDOFF_REQUEST: {
    en: "Of course! Transferring you to a senior counsellor right away. 🤝\n\nYour complete conversation and profile have been shared with our team. A counsellor will join this conversation shortly. Please hold on.",
    hi: "बिलकुल! आपको वरिष्ठ काउंसलर से जोड़ रहे हैं। 🤝 आपकी बातचीत और प्रोफ़ाइल साझा की जा रही है।",
    mr: "नक्कीच! तुम्हाला वरिष्ठ समुपदेशकाकडे जोडत आहोत. 🤝 तुमची संभाषण आणि प्रोफाईल शेअर केली जात आहे."
  },
  TPL_HUMAN_HANDOFF_COMPLAINT: {
    en: "I understand your concern, and I sincerely apologize for any confusion. I've flagged this conversation for **urgent human review** and transferred your file to our Senior Admissions Counsellor. They will review the details and contact you as soon as possible. Thank you for your patience.",
    hi: "आपकी चिंता समझता हूं। इस बातचीत को तत्काल समीक्षा के लिए फ्लैग कर दिया गया है। वरिष्ठ काउंसलर जल्द संपर्क करेंगे।",
    mr: "तुमची चिंता समजते. ही संभाषण तातडीच्या पुनरावलोकनासाठी फ्लॅग केली आहे. वरिष्ठ समुपदेशक लवकरच संपर्क करतील."
  },
  TPL_CONFIRMATION_THANKS: {
    en: "Thank you for confirming! ✅ I've updated your details. Is there anything else I can help you with?",
    hi: "पुष्टि के लिए धन्यवाद! ✅ आपकी जानकारी अपडेट कर दी गई है। क्या कुछ और मदद चाहिए?",
    mr: "पुष्टीसाठी धन्यवाद! ✅ तुमची माहिती अपडेट केली गेली आहे. आणखी काही मदत हवी आहे का?"
  },
  TPL_REJECTION_OPT_OUT: {
    en: "Understood. I've noted your preference and will not send further promotional messages. Your details will be retained in compliance with our privacy policy. If you ever change your mind, feel free to reach out. Take care!",
    hi: "समझ गया। आपकी प्राथमिकता नोट कर ली गई है। आगे कोई प्रचार संदेश नहीं भेजा जाएगा। भविष्य में रुचि हो तो संपर्क करें।",
    mr: "समजले. तुमची प्राधान्य नोंदवली गेली आहे. पुढे कोणताही जाहिराती संदेश पाठवला जाणार नाही. भविष्यात इच्छा असल्यास संपर्क करा."
  },
  TPL_GOODBYE: {
    en: "Thank you for reaching out to TechSummitTrainers! 🙏 It was a pleasure assisting you. Best of luck with your tech journey and career preparations! If you have more questions, we're always here. Take care!",
    hi: "TechSummitTrainers से संपर्क करने के लिए धन्यवाद! 🙏 आपके करियर और तकनीकी कौशल के लिए शुभकामनाएं! भविष्य में कोई सवाल हो तो जरूर पूछें।",
    mr: "TechSummitTrainers शी संपर्क केल्याबद्दल धन्यवाद! 🙏 तुमच्या आयटी करिअरसाठी खूप खूप शुभेच्छा! भविष्यात काही अडचण असल्यास नक्की विचारा."
  },
  TPL_VISIT_RECORDED: {
    en: "Your campus visit has been recorded! 📋\n\nOur team at the {{location}} center will prepare for your arrival on {{visitPref}}. A counsellor will confirm the exact timings via SMS. Is there anything specific you'd like covered during the visit — demo class, fee discussion, or scholarship assessment?",
    hi: "कैंपस विजिट नोट कर ली गई! 📋 {{visitPref}} को {{location}} में आपका स्वागत रहेगा। SMS से समय की पुष्टि होगी।",
    mr: "कॅम्पस भेट नोंदवली! 📋 {{visitPref}} रोजी {{location}} मध्ये आमचे स्वागत असेल. SMS द्वारे वेळेची पुष्टी होईल."
  },
  TPL_COURSE_RECOMMENDATION: {
    en: "Based on your profile, here are the courses I'd recommend:\n\n{{courseList}}\n\nThese recommendations are based on your stated {{matchCriteria}}. Would you like to explore any of these further or book a counselling session?",
    hi: "आपकी प्रोफ़ाइल के आधार पर अनुशंसित कोर्स:\n\n{{courseList}}\n\nक्या आप इनमें से किसी के बारे में और जानना चाहते हैं?",
    mr: "तुमच्या प्रोफाईलनुसार शिफारस केलेले कोर्स:\n\n{{courseList}}\n\nयापैकी कोणाबद्दल अधिक जाणून घ्यायचे का?"
  },
  TPL_FALLBACK: {
    en: "I'm not sure I fully understood that. Could you rephrase it? If you're asking about course fees, schedules, eligibility, scholarship, admissions, or campus visits — just let me know and I'll assist right away! Or would you prefer to speak with a counsellor?",
    hi: "मैं पूरी तरह नहीं समझ पाया। क्या आप दोबारा बता सकते हैं? फीस, शेड्यूल, योग्यता, स्कॉलरशिप, या प्रवेश के बारे में सवाल हो तो पूछें!",
    mr: "मला पूर्णपणे समजले नाही. कृपया पुन्हा सांगाल का? फी, वेळापत्रक, पात्रता, शिष्यवृत्ती, किंवा प्रवेशाबद्दल प्रश्न असल्यास विचारा!"
  },
  TPL_CLARIFY: {
    en: "Could you clarify a bit? Specifically, could you share: {{clarifyWhat}}? That will help me give you the most accurate and relevant information.",
    hi: "क्या आप थोड़ा स्पष्ट कर सकते हैं? विशेष रूप से: {{clarifyWhat}}? इससे मैं सटीक जानकारी दे सकूंगा।",
    mr: "थोडे स्पष्ट करता का? विशेषतः: {{clarifyWhat}}? यामुळे मी अचूक माहिती देऊ शकेन."
  },
  TPL_STATUS_UPDATE: {
    en: "Here's a summary of your current profile and application status:\n\n👤 **Name:** {{name}}\n📚 **Course Interest:** {{courseInterest}}\n🎯 **Target Exam:** {{examTarget}}\n📍 **Location:** {{location}}\n💰 **Budget:** {{budget}}\n🕐 **Schedule:** {{schedule}}\n📊 **Lead Stage:** {{stage}}\n⏭️ **Next Action:** {{nextAction}}",
    hi: "आपकी प्रोफ़ाइल स्थिति:\n👤 {{name}} | 📚 {{courseInterest}} | 🎯 {{examTarget}} | 📊 {{stage}}",
    mr: "तुमची प्रोफाईल स्थिती:\n👤 {{name}} | 📚 {{courseInterest}} | 🎯 {{examTarget}} | 📊 {{stage}}"
  }
};

export function renderTemplate(
  templateId: string,
  lang: Language,
  data: TemplateData
): string {
  const templateSet = TEMPLATES[templateId];
  if (!templateSet) {
    return TEMPLATES['TPL_FALLBACK'][lang] || TEMPLATES['TPL_FALLBACK']['en'];
  }

  let text = templateSet[lang] || templateSet['en'];

  // Replace placeholders
  const profile = data.profile;

  text = text.replace('{{name}}', profile.name ? `, ${profile.name}` : '');
  text = text.replace('{{location}}', profile.location || 'your preferred center');
  text = text.replace('{{visitPref}}', profile.visitPreference || 'your preferred time');
  text = text.replace('{{phone}}', profile.phone || 'your registered number');
  text = text.replace('{{counsellor}}', data.counsellorName || 'Dr. Sameer Kulkarni');
  text = text.replace('{{slot}}', profile.counsellingSlot || 'the confirmed slot');
  text = text.replace('{{stage}}', profile.leadStage);
  text = text.replace('{{name}}', profile.name || 'the student');
  text = text.replace('{{courseInterest}}', profile.courseInterest || 'Not specified');
  text = text.replace('{{examTarget}}', profile.examTarget || 'Not specified');
  text = text.replace('{{budget}}', profile.budgetMax ? `₹${profile.budgetMin || 0}–${profile.budgetMax}` : 'Not specified');
  text = text.replace('{{schedule}}', profile.preferredSchedule || 'Not specified');

  // Course list replacement
  if (data.courseMatches && data.courseMatches.length > 0) {
    const courseListText = data.courseMatches.map((m, i) => {
      const reasons = m.matchReasons.slice(0, 2).join('; ');
      return `**${i + 1}. ${m.course.name}** — ${m.course.feeDisplay}\n   ✅ ${reasons}${m.gaps.length > 0 ? '\n   ⚠️ Note: ' + m.gaps[0] : ''}`;
    }).join('\n\n');
    text = text.replace('{{courseList}}', courseListText);
  }

  const matchCriteria = [
    profile.examTarget ? `exam target (${profile.examTarget})` : null,
    profile.academicLevel ? `academic level (${profile.academicLevel})` : null,
    profile.budgetMax ? `budget (₹${profile.budgetMax})` : null,
    profile.preferredSchedule ? `schedule preference (${profile.preferredSchedule})` : null,
  ].filter(Boolean).join(', ');
  text = text.replace('{{matchCriteria}}', matchCriteria || 'your profile');
  text = text.replace('{{clarifyWhat}}', data.clarifyWhat || 'your current class and course interest');
  text = text.replace('{{nextAction}}', profile.pendingAction?.replace(/_/g, ' ') || 'Awaiting response');

  return text;
}

export { TemplateId };
