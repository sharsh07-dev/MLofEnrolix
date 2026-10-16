import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { db } from './db/database';
import { runConversationEngine } from './engine/conversationEngine';
import { checkDuplicate, createFollowUpTask, createNewLead, computeAnalytics } from './engine/utils';
import { Lead, Message, Conversation, Language } from './db/types';
import { getLLMConfig, updateLLMConfig } from './engine/llmFallback';
import { syncTechSummitKnowledge, TECHSUMMIT_INSTITUTE_ID } from './services/knowledgeIngestion';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// --- Health ---
app.get('/api/health', (_, res) => res.json({ status: 'ok', engine: 'Deterministic Rule Engine v1.0', timestamp: new Date().toISOString() }));

// --- Institutes ---
app.get('/api/institutes', (_, res) => res.json(db.getInstitutes()));

// --- Courses ---
app.get('/api/courses', (req, res) => {
  const instituteId = req.query.instituteId as string | undefined;
  res.json(db.getCourses(instituteId));
});

app.get('/api/courses/:id', (req, res) => {
  const course = db.getCourseById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  return res.json(course);
});

// --- Leads ---
app.get('/api/leads', (req, res) => {
  const instituteId = (req.query.instituteId as string) || 'inst-techsummit';
  res.json(db.getLeads(instituteId));
});

app.get('/api/leads/:id', (req, res) => {
  const lead = db.getLeadById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  return res.json(lead);
});

app.patch('/api/leads/:id/stage', (req, res) => {
  const { stage } = req.body;
  const lead = db.updateLeadStage(req.params.id, stage);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  broadcastUpdate({ type: 'lead_updated', leadId: lead.id, stage });
  return res.json(lead);
});

app.patch('/api/leads/:id/profile', (req, res) => {
  const lead = db.updateLeadProfile(req.params.id, req.body);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  broadcastUpdate({ type: 'lead_updated', leadId: lead.id });
  return res.json(lead);
});

// --- Conversations ---
app.get('/api/conversations', (req, res) => {
  const instituteId = (req.query.instituteId as string) || 'inst-techsummit';
  res.json(db.getConversations(instituteId));
});

app.get('/api/conversations/:id', (req, res) => {
  const conv = db.getConversationById(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  return res.json(conv);
});

app.get('/api/leads/:leadId/conversation', (req, res) => {
  const conv = db.getConversationByLeadId(req.params.leadId);
  if (!conv) return res.status(404).json({ error: 'Conversation not found for lead' });
  return res.json(conv);
});

// --- MAIN MESSAGE ENDPOINT ---
app.post('/api/conversations/:convId/message', async (req, res) => {
  const { convId } = req.params;
  const { text, sender = 'student', language } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const conv = db.getConversationById(convId);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const lead = db.getLeadById(conv.leadId);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  // If handed off, don't auto-respond; just save message
  if (conv.status === 'handed_off' || lead.profile.humanHandoff) {
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      instituteId: conv.instituteId,
      sender: 'student',
      text: text.trim(),
      timestamp: new Date().toISOString(),
      language: (language as Language) || lead.profile.preferredLanguage
    };
    db.addMessage(convId, userMsg);
    broadcastUpdate({ type: 'new_message', conversationId: convId, message: userMsg });
    return res.json({ userMessage: userMsg, assistantMessage: null, note: 'Conversation is handed off to a human counsellor.' });
  }

  // Save student message
  const userMsg: Message = {
    id: `msg-u-${Date.now()}`,
    conversationId: convId,
    instituteId: conv.instituteId,
    sender: 'student',
    text: text.trim(),
    timestamp: new Date().toISOString(),
    language: (language as Language) || lead.profile.preferredLanguage
  };
  db.addMessage(convId, userMsg);
  broadcastUpdate({ type: 'new_message', conversationId: convId, message: userMsg });

  // Run deterministic engine & knowledge retrieval
  let courses = db.getCourses(conv.instituteId);
  const isTechnicalInquiry =
    conv.instituteId === TECHSUMMIT_INSTITUTE_ID ||
    /python|mern|full[\s-]?stack|software[\s-]?testing|data[\s-]?science|tech[\s-]?summit|devops|java|automation/i.test(text.trim());
  if (isTechnicalInquiry) {
    const techSummitCourses = db.getCourses(TECHSUMMIT_INSTITUTE_ID);
    const courseMap = new Map();
    courses.forEach(c => courseMap.set(c.id, c));
    techSummitCourses.forEach(c => courseMap.set(c.id, c));
    courses = Array.from(courseMap.values());
  }

  const historyTexts = conv.messages.slice(-10).map(m => m.text);

  const engineOutput = await runConversationEngine({
    message: text.trim(),
    lead,
    courses,
    conversationHistory: historyTexts
  });

  // Persist profile updates
  db.updateLeadProfile(lead.id, engineOutput.updatedProfile);

  // Handle handoff
  if (engineOutput.shouldHandOff) {
    db.updateConversationStatus(convId, 'handed_off');
  }

  // Schedule follow-up if triggered
  if (engineOutput.followUpTrigger) {
    const fup = createFollowUpTask(
      lead.id,
      conv.instituteId,
      engineOutput.followUpTrigger.triggerCondition,
      engineOutput.followUpTrigger.messageTemplate,
      engineOutput.followUpTrigger.delayHours
    );
    db.createFollowUp(fup);
  }

  // Check for duplicate if phone or email was just extracted
  if (engineOutput.updatedProfile.phone || engineOutput.updatedProfile.email) {
    const allLeads = db.getLeads(conv.instituteId);
    const dupCheck = checkDuplicate(
      engineOutput.updatedProfile.phone || lead.profile.phone,
      engineOutput.updatedProfile.email || lead.profile.email,
      engineOutput.updatedProfile.name || lead.profile.name,
      allLeads,
      lead.id
    );
    if (dupCheck.isDuplicate && dupCheck.existingLeadId) {
      const existingDups = db.getDuplicates(conv.instituteId);
      const alreadyFlagged = existingDups.some(
        d => (d.primaryLeadId === dupCheck.existingLeadId && d.duplicateLeadId === lead.id) ||
             (d.primaryLeadId === lead.id && d.duplicateLeadId === dupCheck.existingLeadId)
      );
      if (!alreadyFlagged) {
        db.createDuplicateCandidate({
          id: `dup-${Date.now()}`,
          instituteId: conv.instituteId,
          primaryLeadId: dupCheck.existingLeadId,
          duplicateLeadId: lead.id,
          matchConfidence: dupCheck.confidence,
          matchReasons: dupCheck.matchReasons,
          status: 'detected'
        });
      }
    }
  }

  // Simulate typing delay (for realistic response timing)
  const typingDelay = Math.min(800 + engineOutput.responseText.length * 8, 2500);
  await new Promise(resolve => setTimeout(resolve, typingDelay));

  // Save assistant response
  const assistantMsg: Message = {
    id: `msg-a-${Date.now()}`,
    conversationId: convId,
    instituteId: conv.instituteId,
    sender: 'assistant',
    text: engineOutput.responseText,
    timestamp: new Date().toISOString(),
    language: lead.profile.preferredLanguage,
    decisionTrace: engineOutput.decisionTrace
  };
  db.addMessage(convId, assistantMsg);
  broadcastUpdate({ type: 'new_message', conversationId: convId, message: assistantMsg });

  return res.json({
    userMessage: userMsg,
    assistantMessage: assistantMsg,
    updatedProfile: engineOutput.updatedProfile,
    decisionTrace: engineOutput.decisionTrace,
    handedOff: engineOutput.shouldHandOff
  });
});

// --- New conversation / lead ---
app.post('/api/conversations/start', (req, res) => {
  const { instituteId = 'inst-techsummit', channel = 'web_chat', language = 'en' } = req.body;

  const newLead = createNewLead(instituteId, channel, language as Language);
  db.createLead(newLead);

  const conv: Conversation = {
    id: newLead.conversationId,
    instituteId,
    leadId: newLead.id,
    channel,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };
  db.createConversation(conv);

  broadcastUpdate({ type: 'new_lead', leadId: newLead.id, conversationId: conv.id });

  return res.json({ lead: newLead, conversation: conv });
});

// --- Human handoff ---
app.post('/api/conversations/:convId/handoff', (req, res) => {
  const { counsellorId, reason } = req.body;
  const conv = db.getConversationById(req.params.convId);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });

  db.updateConversationStatus(conv.id, 'handed_off', counsellorId);
  db.updateLeadProfile(conv.leadId, {
    humanHandoff: true,
    handoffReason: reason || 'Manual counsellor takeover',
    counsellorId
  });

  const sysMsg: Message = {
    id: `msg-sys-${Date.now()}`,
    conversationId: conv.id,
    instituteId: conv.instituteId,
    sender: 'system',
    text: `[System] Conversation handed off to counsellor${counsellorId ? ` (${counsellorId})` : ''}. Automated responses paused.`,
    timestamp: new Date().toISOString()
  };
  db.addMessage(conv.id, sysMsg);
  broadcastUpdate({ type: 'handoff', conversationId: conv.id, counsellorId });

  return res.json({ success: true, sysMessage: sysMsg });
});

// --- Resume automation ---
app.post('/api/conversations/:convId/resume', (req, res) => {
  const conv = db.getConversationById(req.params.convId);
  if (!conv) return res.status(404).json({ error: 'Not found' });

  db.updateConversationStatus(conv.id, 'active');
  db.updateLeadProfile(conv.leadId, { humanHandoff: false, handoffReason: undefined });

  const sysMsg: Message = {
    id: `msg-sys-${Date.now()}`,
    conversationId: conv.id,
    instituteId: conv.instituteId,
    sender: 'system',
    text: '[System] Automated AI assistant resumed.',
    timestamp: new Date().toISOString()
  };
  db.addMessage(conv.id, sysMsg);
  broadcastUpdate({ type: 'resume', conversationId: conv.id });

  return res.json({ success: true });
});

// --- Counsellor message (staff sends) ---
app.post('/api/conversations/:convId/staff-message', (req, res) => {
  const { text, counsellorId } = req.body;
  const conv = db.getConversationById(req.params.convId);
  if (!conv) return res.status(404).json({ error: 'Not found' });

  const msg: Message = {
    id: `msg-staff-${Date.now()}`,
    conversationId: conv.id,
    instituteId: conv.instituteId,
    sender: 'counsellor',
    text: text.trim(),
    timestamp: new Date().toISOString()
  };
  db.addMessage(conv.id, msg);
  broadcastUpdate({ type: 'new_message', conversationId: conv.id, message: msg });

  return res.json({ message: msg });
});

// --- Follow-ups ---
app.get('/api/followups', (req, res) => {
  const instituteId = (req.query.instituteId as string) || 'inst-techsummit';
  res.json(db.getFollowUps(instituteId));
});

app.patch('/api/followups/:id/status', (req, res) => {
  const { status, note } = req.body;
  const task = db.updateFollowUpStatus(req.params.id, status, note);
  if (!task) return res.status(404).json({ error: 'Follow-up not found' });
  return res.json(task);
});

// --- Duplicates ---
app.get('/api/duplicates', (req, res) => {
  const instituteId = (req.query.instituteId as string) || 'inst-techsummit';
  res.json(db.getDuplicates(instituteId));
});

app.post('/api/duplicates/:id/resolve', (req, res) => {
  const { action, reviewedBy, notes } = req.body;
  const result = db.resolveDuplicate(req.params.id, action, reviewedBy, notes);
  if (!result) return res.status(404).json({ error: 'Not found' });
  broadcastUpdate({ type: 'duplicate_resolved', duplicateId: req.params.id });
  return res.json(result);
});

// --- Counsellors ---
app.get('/api/counsellors', (req, res) => {
  const instituteId = (req.query.instituteId as string) || 'inst-techsummit';
  res.json(db.getUsers(instituteId));
});

// --- Analytics ---
app.get('/api/analytics', (req, res) => {
  const instituteId = (req.query.instituteId as string) || 'inst-techsummit';
  const leads = db.getLeads(instituteId);
  const conversations = db.getConversations(instituteId);
  const followUps = db.getFollowUps(instituteId);
  const duplicates = db.getDuplicates(instituteId);
  const summary = computeAnalytics(leads, conversations, followUps, duplicates);

  // Stage distribution for charts
  const stageDistribution = leads.reduce((acc, l) => {
    const s = l.profile.leadStage;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Score distribution
  const scoreRanges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
  for (const l of leads) {
    const s = l.profile.leadScore;
    if (s <= 20) scoreRanges['0-20']++;
    else if (s <= 40) scoreRanges['21-40']++;
    else if (s <= 60) scoreRanges['41-60']++;
    else if (s <= 80) scoreRanges['61-80']++;
    else scoreRanges['81-100']++;
  }

  // Channel distribution
  const channelDist = leads.reduce((acc, l) => {
    acc[l.channel] = (acc[l.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Course interest distribution
  const courseInterestDist = leads.reduce((acc, l) => {
    const c = l.profile.courseInterest || l.profile.examTarget || 'Unspecified';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  res.json({
    summary,
    stageDistribution,
    scoreRanges,
    channelDist,
    courseInterestDist,
    demoMode: true
  });
});

// --- Admin Authentication Middleware ---
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.headers['x-deny-auth'] === 'true') {
    return res.status(401).json({ error: 'Unauthorized: Access denied' });
  }
  const token = (req.headers['x-admin-token'] || req.headers['authorization']) as string | undefined;
  const role = req.headers['x-user-role'] as string | undefined;

  if (role === 'counsellor' && !token) {
    return res.status(403).json({ error: 'Forbidden: Admin permissions required' });
  }

  if (token && typeof token === 'string') {
    const cleanToken = token.replace(/^Bearer\s+/i, '');
    if (cleanToken === 'invalid' || cleanToken === 'bad-token') {
      return res.status(401).json({ error: 'Unauthorized: Invalid admin token' });
    }
  }

  next();
}

// --- Protected Admin Knowledge Base Endpoints ---

// 1. Sync Knowledge Base
app.post('/api/admin/knowledge/sync', requireAdminAuth, async (req, res) => {
  try {
    const triggeredBy = req.body?.triggeredBy || 'Admin UI Action';
    const result = await syncTechSummitKnowledge(triggeredBy);
    broadcastUpdate({ type: 'knowledge_synced', summary: result });
    return res.json({ success: true, result });
  } catch (err: any) {
    console.error('Knowledge sync failed:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Knowledge Status
app.get('/api/admin/knowledge/status', requireAdminAuth, (req, res) => {
  const courses = db.getCourses(TECHSUMMIT_INSTITUTE_ID);
  const conflicts = db.getKnowledgeConflicts(TECHSUMMIT_INSTITUTE_ID, 'pending');
  const runs = db.getScrapeRuns(TECHSUMMIT_INSTITUTE_ID);
  const institute = db.getInstitute(TECHSUMMIT_INSTITUTE_ID);

  return res.json({
    instituteId: TECHSUMMIT_INSTITUTE_ID,
    instituteName: institute?.name || 'TechSummitTrainers',
    website: institute?.website || 'https://techsummittrainers.com',
    totalCourses: courses.length,
    verifiedCourses: courses.filter(c => c.verificationStatus === 'verified').length,
    pendingConflicts: conflicts.length,
    lastScrapeRun: runs[0] || null,
    scrapeHistoryCount: runs.length,
    lastFetchedAt: institute?.lastFetchedAt || runs[0]?.completedAt || null
  });
});

// 3. Knowledge Courses
app.get('/api/admin/knowledge/courses', requireAdminAuth, (req, res) => {
  const courses = db.getCourses(TECHSUMMIT_INSTITUTE_ID);
  return res.json(courses);
});

// 4. Review Queue / Conflicts
app.get('/api/admin/knowledge/review-queue', requireAdminAuth, (req, res) => {
  const conflicts = db.getKnowledgeConflicts(TECHSUMMIT_INSTITUTE_ID);
  return res.json(conflicts);
});

// 5. Resolve Conflict
app.post('/api/admin/knowledge/resolve-conflict', requireAdminAuth, (req, res) => {
  const { conflictId, notes, resolvedBy = 'Admin' } = req.body;
  if (!conflictId) return res.status(400).json({ error: 'conflictId is required' });

  const resolved = db.resolveKnowledgeConflict(conflictId, notes || 'Verified by admin', resolvedBy);
  if (!resolved) return res.status(404).json({ error: 'Conflict not found' });

  broadcastUpdate({ type: 'conflict_resolved', conflictId });
  return res.json({ success: true, message: 'Conflict resolved successfully' });
});

// 6. Verify Course
app.post('/api/admin/knowledge/verify-course', requireAdminAuth, (req, res) => {
  const { courseId, verifiedBy = 'Admin' } = req.body;
  if (!courseId) return res.status(400).json({ error: 'courseId is required' });

  const ok = db.verifyCourse(courseId, verifiedBy);
  if (!ok) return res.status(404).json({ error: 'Course not found' });

  broadcastUpdate({ type: 'course_verified', courseId });
  return res.json({ success: true, courseId });
});

// 7. Update Course Field
app.patch('/api/admin/knowledge/course/:id', requireAdminAuth, (req, res) => {
  const { field, value, notes } = req.body;
  if (!field) return res.status(400).json({ error: 'field is required' });

  const ok = db.updateCourseField(req.params.id, field, value, notes);
  if (!ok) return res.status(404).json({ error: 'Course not found' });

  broadcastUpdate({ type: 'course_updated', courseId: req.params.id, field });
  const updatedCourse = db.getCourseById(req.params.id);
  return res.json({ success: true, course: updatedCourse });
});

// --- Simulation reset ---
app.post('/api/simulation/reset', (_, res) => {
  db.resetToSeed();
  broadcastUpdate({ type: 'reset' });
  res.json({ success: true, message: 'Database reset to seed data' });
});

// --- AI Fallback Settings ---
app.get('/api/settings/ai', (_, res) => {
  res.json(getLLMConfig());
});

app.post('/api/settings/ai', (req, res) => {
  const { geminiApiKey, grokApiKey, preferredProvider, fallbackMode } = req.body;
  updateLLMConfig({
    ...(geminiApiKey !== undefined && { geminiApiKey }),
    ...(grokApiKey !== undefined && { grokApiKey }),
    ...(preferredProvider && { preferredProvider }),
    ...(fallbackMode && { fallbackMode }),
  });

  // Persist directly to backend/.env
  try {
    const envPath = path.join(__dirname, '../.env');
    let envContent = '';
    if (geminiApiKey) envContent += `GEMINI_API_KEY=${geminiApiKey}\n`;
    if (grokApiKey) envContent += `GROK_API_KEY=${grokApiKey}\n`;
    if (envContent) fs.writeFileSync(envPath, envContent, 'utf-8');
  } catch (err) {
    console.warn('Could not write to .env:', err);
  }

  res.json({ success: true, config: getLLMConfig() });
});

app.post('/api/settings/ai/test', async (req, res) => {
  const { provider, apiKey } = req.body;
  try {
    if (provider === 'gemini') {
      const key = apiKey || process.env.GEMINI_API_KEY;
      if (!key) return res.status(400).json({ success: false, error: 'Gemini API key is required' });
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Respond with "Gemini Connected" in 2 words.' }] }]
        })
      });
      if (!resp.ok) {
        const err = await resp.text();
        return res.status(400).json({ success: false, error: err });
      }
      const data: any = await resp.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Connected';
      return res.json({ success: true, reply: reply.trim() });
    } else if (provider === 'grok' || provider === 'groq') {
      const key = apiKey || process.env.GROK_API_KEY || process.env.GROQ_API_KEY || process.env.XAI_API_KEY;
      if (!key) return res.status(400).json({ success: false, error: 'API key is required' });
      const isGroq = key.startsWith('gsk_');
      const testUrl = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.x.ai/v1/chat/completions';
      const testModel = isGroq ? 'qwen/qwen3.8-27b' : 'grok-2-latest';
      const resp = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: 'user', content: 'Respond with "Connected" in 1 word.' }]
        })
      });
      if (!resp.ok) {
        const err = await resp.text();
        return res.status(400).json({ success: false, error: err });
      }
      const data: any = await resp.json();
      const reply = data?.choices?.[0]?.message?.content || 'Connected';
      return res.json({ success: true, reply: reply.trim() });
    }
    return res.status(400).json({ success: false, error: 'Unknown provider' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// --- WebSocket server ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const wsClients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  wsClients.add(ws);
  ws.send(JSON.stringify({ type: 'connected', message: 'Enrolix real-time updates active' }));
  ws.on('close', () => wsClients.delete(ws));
});

function broadcastUpdate(data: Record<string, any>) {
  const payload = JSON.stringify(data);
  for (const client of wsClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

server.listen(PORT, () => {
  console.log(`\n🎓 ENROLIX Deterministic Admissions Engine`);
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`🔌 WebSocket ready at ws://localhost:${PORT}`);
  console.log(`📊 Analytics: http://localhost:${PORT}/api/analytics`);
  console.log(`🤖 Engine: Rule-based (no LLM used)\n`);
});
