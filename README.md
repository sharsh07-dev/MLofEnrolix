# Enrolix — AI Admissions Intelligence Platform

**Deterministic Conversational Intelligence Engine with Grok & Gemini API Database Grounding**

> Hybrid Intelligence: Combines high-speed deterministic rules and fact lineage with **Google Gemini API** & **xAI Grok API** fallback, strictly grounded in the institute's live course database.

---

## 🚀 Quick Start (localhost)

### Prerequisites
- Node.js 18+ 
- npm 9+

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev
# ✅ Runs on http://localhost:3001
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
# ✅ Runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🤖 AI Fallback & Course Database Grounding (Grok & Gemini)

When a student inquiry shifts context (e.g. asking about "full stack" after discussing MHT-CET) or asks open-ended questions:
1. **Google Gemini API** (`gemini-2.0-flash` / `gemini-1.5-flash`)
2. **xAI Grok API** (`grok-2-latest` / `grok-beta`)
3. **Semantic Database Search Fallback** (zero API key dependency, parses catalogue JSON directly)

### Setting Keys:
You can configure keys either in `backend/.env`:
```env
GEMINI_API_KEY=AIzaSy...
GROK_API_KEY=xai-...
```
Or directly from the web UI on the **Settings & Intelligence Engine** page (`http://localhost:5173`) with live connection testing.

---

## 🏗️ Architecture

```
enrolix/
├── backend/
│   └── src/
│       ├── db/
│       │   ├── types.ts          # Domain types (Lead, StudentProfile, Course, DecisionTrace, etc.)
│       │   ├── seedData.ts       # 3 institutes, 9 courses (JEE, NEET, CET, Full Stack, Python AI), leads
│       │   └── database.ts       # Mock JSON database with file persistence
│       ├── engine/
│       │   ├── normalizer.ts     # Text normalization, typo fix, language detection
│       │   ├── intentDetector.ts # 24-intent weighted matching (EN/HI/MR)
│       │   ├── entityExtractor.ts # 14 entity types: name, phone, budget, location...
│       │   ├── courseRecommender.ts # Deterministic course matching engine
│       │   ├── leadScorer.ts     # Configurable 0-100 lead scoring
│       │   ├── responseTemplates.ts # 30+ trilingual response templates
│       │   ├── llmFallback.ts    # Grok & Gemini API fallback grounded in course database
│       │   ├── conversationEngine.ts # Main hybrid pipeline orchestrator
│       │   └── utils.ts          # Duplicate detection, follow-up factory, analytics
│       └── server.ts             # Express REST API + WebSocket server
└── frontend/
    └── src/
        ├── types.ts              # Frontend types
        ├── api.ts                # API client
        └── App.tsx               # Full 10-page dashboard with AI Settings
```

## 🤖 How the Deterministic Engine Works

The engine uses **zero LLM calls**. Every response is generated via:

1. **Text Normalization** — Lowercase, typo correction, abbreviation expansion (JEE, NEET, IELTS), language script detection
2. **Intent Detection** — 23 intent categories with weighted keyword + phrase matching, Devanagari support, context boost from previous intents
3. **Entity Extraction** — 14 extractable entity types using regex patterns: name, phone, email, academic level, exam target, budget range (handles "45k" → 45,000), schedule, location, country, language, timeline
4. **Rule Evaluation** — 27 priority-ordered rules evaluated in sequence; first match wins; rules have conditions, actions, state transitions
5. **Course Recommendation** — Weighted matching against course catalogue (exam target 40pts, academic level 20pts, budget 15pts, schedule 10pts, location 10pts)
6. **Lead Scoring** — Idempotent 0-100 scoring across 8 factors; same factor cannot score twice
7. **Template Rendering** — Selects EN/HI/MR template, interpolates student profile data
8. **Persistence** — Updates lead profile, schedules follow-ups, detects duplicates, emits WebSocket events

### Rule Priority Order
1. Complaints + Human Escalation (P1)
2. Opt-Out / Rejection (P2)
3. Course Recommendation with context (P3)
4. Campus Visit Booking (P4)
5. Counselling Appointment (P5)
6. Callback Request (P6)
7. Greeting with Profile (P7-8)
8. Exam-Specific Enquiries (P9)
9. Budget + Schedule Matching (P10)
10. Fee / Scholarship / Eligibility / Schedule / Location (P11-16)
11. Comparison, Objections, Confirmation, Goodbye (P17-25)
12. Fallback (P99)

## 📊 Seeded Demo Data

| Entity | Count |
|---|---|
| Institutes | 3 (Apex Academy, Horizon Overseas, TinyRoots Preschool) |
| Courses | 7 (JEE 1-yr, JEE 2-yr, NEET, MHT-CET, Junior Foundation, IELTS Abroad, Preschool) |
| Leads | 5 (various stages: Qualified, Counselling Requested, Engaged, Incomplete, Human Review) |
| Conversations | 5 (includes English, Marathi, complaint escalation scenarios) |
| Follow-Ups | 3 (visit reminder, counselling reminder, Marathi nudge) |
| Duplicates | 1 (matching phone number detection demo) |

## 🌐 API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /api/health | Engine status |
| GET | /api/leads | All leads for institute |
| GET | /api/leads/:id | Single lead |
| PATCH | /api/leads/:id/stage | Update lead stage |
| GET | /api/conversations | All conversations |
| GET | /api/conversations/:id | Single conversation |
| **POST** | **/api/conversations/:id/message** | **Send message → Engine processes → Returns AI response** |
| POST | /api/conversations/start | Start new conversation |
| POST | /api/conversations/:id/handoff | Hand off to counsellor |
| POST | /api/conversations/:id/resume | Resume AI automation |
| POST | /api/conversations/:id/staff-message | Counsellor sends message |
| GET | /api/courses | Course catalogue |
| GET | /api/followups | Follow-up tasks |
| PATCH | /api/followups/:id/status | Update follow-up status |
| GET | /api/duplicates | Duplicate candidates |
| POST | /api/duplicates/:id/resolve | Merge or keep separate |
| GET | /api/analytics | Dashboard analytics |
| POST | /api/simulation/reset | Reset to seed data |

## 🌍 Multilingual Support

Supported: **English**, **Hindi** (Devanagari + Roman), **Marathi** (Devanagari + Roman)

Language is auto-detected from:
- Devanagari markers (आहे, है, सांगा, बताइए)
- Common Roman transliterations (ahe, aahe, kiti, kitni)
- Explicit language preference in message ("in Hindi please")

All 30+ response templates have EN/HI/MR variants.

## 📱 Dashboard Pages

1. **Overview Dashboard** — KPI cards, stage funnel chart, score distribution, recent leads
2. **Conversation Inbox** — All conversations with search, start new conversation
3. **Conversation Workspace** — Live chat, student profile sidebar, decision trace debug view, staff mode, quick scenario buttons
4. **Lead Management** — Searchable table with filters by stage, score rings
5. **Course Catalogue** — All 7 courses with fees, seats, schedules, highlights
6. **Follow-Up Automation** — Pending/triggered tasks with complete/cancel controls
7. **Duplicate Review** — Match evidence, confidence scores, merge/keep actions
8. **Human Handoff Queue** — Conversations awaiting counsellor
9. **Analytics** — Stage distribution, score histogram, channel breakdown, course interest chart
10. **Settings** — System info, architecture explanation, demo reset

## 🔒 Limitations (by design)

- **No LLM**: Responses come from deterministic rules and templates, not generative AI. Free-form conversation outside supported intents returns a clarification request.
- **Mock Database**: Data is persisted to a local JSON file (`backend/src/db/mock_db_state.json`). No PostgreSQL in local demo mode.
- **No real SMS/WhatsApp**: Follow-up messages are scheduled in the database but not delivered externally.
- **No real calendar**: Campus visit slots are recorded in student memory, not booked on a real calendar.
- **Android app**: Phase 8 (clearly documented as a subsequent phase).

## 🏁 Production Phase Plan

- **Phase 1** ✅ Database, seed data, course catalogue
- **Phase 2** ✅ Deterministic engine (normalizer, intent, entity, rules)
- **Phase 3** ✅ Chat UI, multilingual templates
- **Phase 4** ✅ Course recommendation + lead qualification
- **Phase 5** ✅ Follow-up scheduler + duplicate detection
- **Phase 6** ✅ Human handoff workflow + counsellor dashboard
- **Phase 7** ✅ Analytics + REST API + WebSocket
- **Phase 8** 🔜 Android app (React Native + Expo), PostgreSQL + Prisma migration, SMS/WhatsApp integration, Google Calendar integration, automated tests
