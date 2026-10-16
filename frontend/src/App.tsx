import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard, MessageSquare, Users, BookOpen, Bell, Copy,
  UserCheck, BarChart3, Settings, ChevronRight, GraduationCap,
  Plus, Search, Filter, Clock, Star, AlertCircle, CheckCircle,
  XCircle, ArrowRight, Phone, Mail, MapPin, Calendar, Zap,
  TrendingUp, Eye, Shield, RefreshCw, Send, Mic, User,
  ChevronDown, Info, MoreVertical, Layers, Target, DollarSign,
  Save, Sparkles, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { api } from './api';
import type { Lead, Conversation, Message, Course, FollowUpTask, DuplicateCandidate, Page } from './types';
import { KnowledgeBasePage } from './KnowledgeBasePage';

// ===================== HELPERS =====================
function getStageBadgeClass(stage: string): string {
  const map: Record<string, string> = {
    'New': 'stage-new',
    'Contacted': 'stage-contacted',
    'Engaged': 'stage-engaged',
    'Information Incomplete': 'stage-information-incomplete',
    'Qualified': 'stage-qualified',
    'Counselling Requested': 'stage-counselling-requested',
    'Visit Pending Confirmation': 'stage-visit-pending',
    'Visit Confirmed': 'stage-visit-confirmed',
    'Application In Progress': 'stage-application',
    'Enrolled': 'stage-enrolled',
    'Not Interested': 'stage-not-interested',
    'Human Review Required': 'stage-human-review',
  };
  return map[stage] || 'badge-slate';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

function cleanDisplayMessage(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  
  // Try strict JSON parse if wrapped in braces
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed.reply) return cleanDisplayMessage(String(parsed.reply));
      if (parsed.text) return cleanDisplayMessage(String(parsed.text));
      if (parsed.message) return cleanDisplayMessage(String(parsed.message));
    } catch {
      // ignore
    }
  }

  // Regex extraction if wrapped in {"reply": "..."}
  const replyMatch = cleaned.match(/"reply"\s*:\s*"([\s\S]*?)"(?:\s*,|\s*})/i);
  if (replyMatch && replyMatch[1]) {
    cleaned = replyMatch[1];
  } else {
    // If it starts with {"reply": " or {"reply":
    cleaned = cleaned.replace(/^\{\s*["']?reply["']?\s*:\s*["']?/i, '');
    // If it ends with "} or }
    cleaned = cleaned.replace(/["']?\s*\}?\s*$/i, '');
  }

  // Unescape backslashes, newlines, quotes
  cleaned = cleaned
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
    .trim();

  return cleaned;
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.min(score, 100);
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#3b82f6' : pct >= 25 ? '#f59e0b' : '#ef4444';
  const r = 24, c = 2 * Math.PI * r, offset = c - (pct / 100) * c;
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={r} stroke="#e2e8f0" strokeWidth="4" fill="none" />
        <circle cx="30" cy="30" r={r} stroke={color} strokeWidth="4" fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-500" />
      </svg>
      <span className="text-xs font-bold text-slate-700 z-10">{score}</span>
    </div>
  );
}

// ===================== SIDEBAR =====================
function Sidebar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const navItems: { id: Page; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'inbox', label: 'Inbox', icon: <MessageSquare size={18} /> },
    { id: 'leads', label: 'Lead Management', icon: <Users size={18} /> },
    { id: 'courses', label: 'Course Catalogue', icon: <BookOpen size={18} /> },
    { id: 'knowledge', label: 'Knowledge Base', icon: <Database size={18} /> },
    { id: 'followups', label: 'Follow-Ups', icon: <Bell size={18} /> },
    { id: 'duplicates', label: 'Duplicate Review', icon: <Copy size={18} /> },
    { id: 'handoff', label: 'Handoff Queue', icon: <UserCheck size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-sm">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none">Enrolix</h1>
            <p className="text-[10px] text-slate-500 font-medium">Admissions Intelligence</p>
          </div>
        </div>
      </div>

      {/* Institute selector */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-6 h-6 bg-brand-100 rounded-lg flex items-center justify-center">
            <GraduationCap size={12} className="text-brand-600" />
          </div>
          <span className="text-xs font-medium text-slate-700 truncate flex-1">TechSummitTrainers</span>
          <ChevronDown size={12} className="text-slate-400" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Main Menu</p>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`w-full text-left ${page === item.id ? 'sidebar-item-active' : 'sidebar-item-inactive'} mb-0.5`}
          >
            <span className={page === item.id ? 'text-brand-600' : 'text-slate-500'}>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-brand-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-semibold">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer">
          <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">Dr. Sameer Kulkarni</p>
            <p className="text-[10px] text-slate-500">Admissions Head</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ===================== DASHBOARD =====================
function Dashboard({ setPage, setConvId }: { setPage: (p: Page) => void; setConvId: (id: string) => void }) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAnalytics(), api.getLeads()]).then(([a, l]) => {
      setAnalytics(a);
      setLeads(l);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const stats = analytics?.summary;

  const statCards = [
    { label: 'Total Leads', value: stats?.totalLeads ?? 0, icon: <Users size={18} />, color: 'bg-brand-50 text-brand-600', trend: '+12%' },
    { label: 'Qualified', value: stats?.qualifiedLeads ?? 0, icon: <CheckCircle size={18} />, color: 'bg-emerald-50 text-emerald-600', trend: '+8%' },
    { label: 'Follow-Ups Due', value: stats?.followUpsDue ?? 0, icon: <Bell size={18} />, color: 'bg-amber-50 text-amber-600', trend: '' },
    { label: 'Human Review', value: stats?.humanReviewRequired ?? 0, icon: <AlertCircle size={18} />, color: 'bg-red-50 text-red-600', trend: '' },
    { label: 'Counselling Req.', value: stats?.counsellingRequests ?? 0, icon: <Calendar size={18} />, color: 'bg-violet-50 text-violet-600', trend: '' },
    { label: 'Duplicates', value: stats?.duplicatesDetected ?? 0, icon: <Copy size={18} />, color: 'bg-orange-50 text-orange-600', trend: '' },
    { label: 'Avg Lead Score', value: stats?.avgLeadScore ?? 0, icon: <Star size={18} />, color: 'bg-cyan-50 text-cyan-600', trend: '' },
    { label: 'Visits Pending', value: stats?.visitsPendingConfirmation ?? 0, icon: <MapPin size={18} />, color: 'bg-pink-50 text-pink-600', trend: '' },
  ];

  const stageData = analytics?.stageDistribution
    ? Object.entries(analytics.stageDistribution).map(([stage, count]) => ({ name: stage.replace(' Confirmation', ''), value: count as number }))
    : [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Overview Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time admissions intelligence — TechSummitTrainers</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-green flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
            Live • Demo Mode
          </span>
          <button onClick={() => api.resetSimulation().then(() => window.location.reload())}
            className="btn-secondary text-xs gap-1.5">
            <RefreshCw size={12} /> Reset Demo
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                {s.icon}
              </div>
              {s.trend && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                  <TrendingUp size={10} /> {s.trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Stage distribution */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Lead Stage Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stageData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                {stageData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val, name) => [val, name]} />
              <Legend iconSize={10} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Score ranges */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Lead Score Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={
              analytics?.scoreRanges
                ? Object.entries(analytics.scoreRanges).map(([range, count]) => ({ range, count }))
                : []
            }>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent leads */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Recent Leads</h3>
          <button onClick={() => setPage('leads')} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            View all <ChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-3">
          {leads.slice(0, 5).map(lead => (
            <div key={lead.id}
              onClick={() => { setConvId(lead.conversationId); setPage('conversation'); }}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
              <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {lead.profile.name || 'Anonymous Enquiry'}
                  </p>
                  {lead.profile.humanHandoff && (
                    <span className="badge-red badge text-[10px]">⚠ Handoff</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {lead.profile.examTarget || lead.profile.courseInterest || 'No course specified'} • {lead.channel}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <ScoreRing score={lead.profile.leadScore} />
                <span className={getStageBadgeClass(lead.profile.leadStage)}>{lead.profile.leadStage}</span>
                <span className="text-xs text-slate-400">{timeAgo(lead.updatedAt)}</span>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===================== CONVERSATION WORKSPACE =====================
function ConversationWorkspace({ convId, setConvId }: { convId: string; setConvId: (id: string) => void }) {
  const [conv, setConv] = useState<Conversation | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [selectedTrace, setSelectedTrace] = useState<any>(null);
  const [staffMode, setStaffMode] = useState(false);
  const [staffInput, setStaffInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!convId) return;
    const [c, ] = await Promise.all([api.getConversation(convId)]);
    setConv(c);
    if (c?.leadId) {
      const l = await api.getLead(c.leadId);
      setLead(l);
    }
  }, [convId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conv?.messages]);

  const sendMessage = async () => {
    if (!input.trim() || !convId || sending) return;
    setSending(true);
    setTyping(true);
    try {
      const res = await api.sendMessage(convId, input.trim());
      setInput('');
      setConv(prev => prev ? {
        ...prev,
        messages: [...prev.messages, res.userMessage, ...(res.assistantMessage ? [res.assistantMessage] : [])]
      } : null);
      if (res.updatedProfile && lead) {
        setLead(prev => prev ? { ...prev, profile: { ...prev.profile, ...res.updatedProfile } } : null);
      }
    } finally {
      setSending(false);
      setTyping(false);
    }
  };

  const sendStaffMessage = async () => {
    if (!staffInput.trim() || !convId) return;
    const res = await api.staffMessage(convId, staffInput.trim(), 'user-2');
    setStaffInput('');
    setConv(prev => prev ? { ...prev, messages: [...prev.messages, res.message] } : null);
  };

  const handleHandoff = async () => {
    if (!convId) return;
    await api.handoff(convId, 'user-2', 'Manual counsellor takeover');
    load();
  };

  const handleResume = async () => {
    if (!convId) return;
    await api.resume(convId);
    load();
  };

  if (!convId) return (
    <div className="flex-1 flex items-center justify-center text-slate-400">
      <div className="text-center">
        <MessageSquare size={48} className="mx-auto mb-3 text-slate-300" />
        <p className="font-medium">Select a conversation to view</p>
      </div>
    </div>
  );

  if (!conv) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
    </div>
  );

  const isHandedOff = conv.status === 'handed_off';

  return (
    <div className="flex h-full gap-0">
      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center gap-3">
          <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800 text-sm">
              {lead?.profile.name || 'Anonymous Student'}
            </p>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isHandedOff ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className="text-xs text-slate-500">
                {isHandedOff ? 'Handed off to counsellor' : 'AI Assistant Active'} • {conv.channel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lead && <span className={getStageBadgeClass(lead.profile.leadStage)}>{lead.profile.leadStage}</span>}
            {!isHandedOff ? (
              <button onClick={handleHandoff} className="btn-secondary text-xs">
                <UserCheck size={12} /> Take Over
              </button>
            ) : (
              <button onClick={handleResume} className="btn-secondary text-xs text-emerald-600">
                <Zap size={12} /> Resume AI
              </button>
            )}
            <button onClick={() => setShowTrace(!showTrace)} className={`btn-ghost text-xs ${showTrace ? 'bg-brand-50 text-brand-600' : ''}`}>
              <Eye size={12} /> Debug
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
          <AnimatePresence initial={false}>
            {conv.messages.map((msg, i) => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : msg.sender === 'system' ? 'items-center' : 'items-start'}`}>
                {msg.sender === 'assistant' && i > 0 && (
                  <div className="flex items-center gap-1.5 mb-1 ml-1 flex-wrap">
                    <div className="w-5 h-5 gradient-brand rounded-full flex items-center justify-center">
                      <Zap size={10} className="text-white" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Enrolix AI</span>
                    {msg.decisionTrace?.fallbackProvider && msg.decisionTrace.fallbackProvider !== 'none' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Sparkles size={9} />
                        {msg.decisionTrace.fallbackProvider === 'gemini' ? 'Gemini 2.0 Grounded' :
                         msg.decisionTrace.fallbackProvider === 'grok' ? 'Grok Grounded' :
                         'Database Search'}
                      </span>
                    )}
                  </div>
                )}
                <div className={
                  msg.sender === 'student' ? 'chat-bubble-student' :
                  msg.sender === 'system' ? 'chat-bubble-system' :
                  msg.sender === 'counsellor' ? 'chat-bubble-counsellor' :
                  'chat-bubble-assistant'
                }>
                  <p className="whitespace-pre-wrap">{cleanDisplayMessage(msg.text)}</p>
                </div>
                <div className={`flex items-center gap-2 mt-1 ${msg.sender === 'student' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] text-slate-400">{timeAgo(msg.timestamp)}</span>
                  {msg.decisionTrace && showTrace && (
                    <button
                      onClick={() => setSelectedTrace(msg.decisionTrace)}
                      className="text-[10px] text-brand-500 hover:text-brand-700 font-medium"
                    >
                      Rule: {msg.decisionTrace.ruleMatched}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-start gap-2">
              <div className="w-5 h-5 gradient-brand rounded-full flex items-center justify-center">
                <Zap size={10} className="text-white" />
              </div>
              <div className="chat-bubble-assistant">
                <div className="typing-indicator">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <div key={i} className="typing-dot"
                      style={{ animation: `typing 1.4s ease-in-out ${delay}s infinite` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white border-t border-slate-200">
          {isHandedOff ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                <UserCheck size={14} className="text-amber-600" />
                <span className="text-xs text-amber-700">Staff mode active — typing as counsellor</span>
              </div>
              <div className="flex gap-2">
                <input value={staffInput} onChange={e => setStaffInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendStaffMessage()}
                  placeholder="Type as counsellor..."
                  className="input-field flex-1 text-sm" />
                <button onClick={sendStaffMessage} className="btn-primary px-3 py-2">
                  <Send size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={sending}
                placeholder="Type a message as the student (or inject test scenario)..."
                className="input-field flex-1 text-sm" />
              <button onClick={sendMessage} disabled={sending || !input.trim()}
                className="btn-primary px-3 py-2">
                <Send size={16} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-slate-400">Quick scenarios:</span>
            {[
              { label: 'Java Full Stack', msg: "Hi! I am interested in the Full-Stack Java + DevOps + AI course." },
              { label: 'Python & AI', msg: "Tell me about the Python Full-Stack & Data Science curriculum." },
              { label: 'Testing Demo', msg: "Can I attend a free demo class for Software Testing on FC Road?" },
              { label: 'Fees & EMI', msg: "What are the course fees and do you have EMI options?" },
              { label: 'Speak to Human', msg: "I want to speak with an admissions counsellor." }
            ].map(s => (
              <button key={s.label}
                onClick={() => { setInput(s.msg); }}
                className="text-[10px] px-2 py-1 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors">
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — Student profile */}
      <div className="w-72 border-l border-slate-200 bg-white overflow-y-auto flex-shrink-0">
        {lead && (
          <div className="p-4 space-y-4">
            {/* Profile header */}
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="w-14 h-14 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-3">
                <User size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-800">{lead.profile.name || 'Anonymous'}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{lead.profile.phone || 'No phone'}</p>
              <div className="flex justify-center mt-2">
                <span className={getStageBadgeClass(lead.profile.leadStage)}>{lead.profile.leadStage}</span>
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <ScoreRing score={lead.profile.leadScore} />
              <div>
                <p className="text-xs font-medium text-slate-700">Lead Score</p>
                <p className="text-[10px] text-slate-500">{lead.profile.scoreReasons.length} factors scored</p>
              </div>
            </div>

            {/* Profile details */}
            <div className="space-y-2">
              <p className="label">Student Profile</p>
              {[
                { icon: <BookOpen size={12} />, label: 'Course', value: lead.profile.courseInterest || lead.profile.examTarget },
                { icon: <Target size={12} />, label: 'Exam Target', value: lead.profile.examTarget },
                { icon: <GraduationCap size={12} />, label: 'Class', value: lead.profile.academicLevel },
                { icon: <DollarSign size={12} />, label: 'Budget', value: lead.profile.budgetMax ? `₹${lead.profile.budgetMin}–${lead.profile.budgetMax}` : undefined },
                { icon: <Clock size={12} />, label: 'Schedule', value: lead.profile.preferredSchedule },
                { icon: <MapPin size={12} />, label: 'Location', value: lead.profile.location },
                { icon: <Calendar size={12} />, label: 'Timeline', value: lead.profile.admissionTimeline },
                { icon: <Calendar size={12} />, label: 'Visit Pref.', value: lead.profile.visitPreference },
              ].map(item => item.value && (
                <div key={item.label} className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5 flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-[10px] text-slate-500">{item.label}</p>
                    <p className="text-xs font-medium text-slate-700">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Score reasons */}
            {lead.profile.scoreReasons.length > 0 && (
              <div>
                <p className="label mb-2">Score Breakdown</p>
                <div className="space-y-1.5">
                  {lead.profile.scoreReasons.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 truncate flex-1 pr-2">{r.description}</span>
                      <span className="text-emerald-600 font-semibold flex-shrink-0">+{r.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending action */}
            {lead.profile.pendingAction && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wide mb-1">Next Action</p>
                <p className="text-xs text-amber-800">{lead.profile.pendingAction.replace(/_/g, ' ')}</p>
              </div>
            )}

            {/* Handoff warning */}
            {lead.profile.humanHandoff && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-[10px] text-red-600 font-semibold uppercase tracking-wide mb-1">⚠ Human Handoff Active</p>
                <p className="text-xs text-red-800">{lead.profile.handoffReason}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decision trace modal */}
      <AnimatePresence>
        {selectedTrace && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTrace(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Eye size={16} className="text-brand-600" /> Decision Trace
                </h3>
                <button onClick={() => setSelectedTrace(null)} className="btn-ghost p-1.5">
                  <XCircle size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="label mb-1">Normalized Input</p>
                  <code className="text-xs bg-slate-100 px-3 py-2 rounded-lg block">{selectedTrace.normalizedText}</code>
                </div>
                <div>
                  <p className="label mb-2">Detected Intents</p>
                  <div className="space-y-1.5">
                    {selectedTrace.intentsDetected?.map((d: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <span className={`badge ${i === 0 ? 'badge-blue' : 'badge-slate'}`}>{d.intent}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${d.confidence * 100}%` }} />
                        </div>
                        <span className="text-slate-500">{(d.confidence * 100).toFixed(0)}%</span>
                        <span className="text-slate-400">[{d.matchedKeywords?.slice(0, 3).join(', ')}]</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="label mb-1">Rule Matched</p>
                    <code className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded">{selectedTrace.ruleMatched}</code>
                  </div>
                  <div>
                    <p className="label mb-1">Template Used</p>
                    <code className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded">{selectedTrace.responseTemplateId}</code>
                  </div>
                  <div>
                    <p className="label mb-1">Stage Transition</p>
                    <p className="text-xs text-slate-700">{selectedTrace.previousStage} → {selectedTrace.newStage}</p>
                  </div>
                  <div>
                    <p className="label mb-1">Score Change</p>
                    <p className="text-xs text-emerald-600 font-semibold">+{selectedTrace.scoreDiff} → {selectedTrace.scoreTotal}/100</p>
                  </div>
                </div>
                {selectedTrace.entitiesExtracted && Object.keys(selectedTrace.entitiesExtracted).length > 0 && (
                  <div>
                    <p className="label mb-2">Extracted Entities</p>
                    <pre className="text-xs bg-slate-100 p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedTrace.entitiesExtracted, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedTrace.fallbackUsed && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-purple-600" />
                      <span className="text-xs font-bold text-purple-900">
                        Database Grounding via {selectedTrace.fallbackProvider?.toUpperCase()}
                      </span>
                      {selectedTrace.fallbackModel && (
                        <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-mono">
                          {selectedTrace.fallbackModel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-purple-700">{selectedTrace.explanation}</p>
                  </div>
                )}
                <div className="p-3 bg-brand-50 rounded-xl">
                  <p className="text-xs text-brand-700"><strong>Rule Engine Summary:</strong> {selectedTrace.explanation}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===================== INBOX =====================
function Inbox({ setConvId, setPage }: { setConvId: (id: string) => void; setPage: (p: Page) => void }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [leads, setLeads] = useState<Record<string, Lead>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([api.getConversations(), api.getLeads()]).then(([convs, ls]) => {
      setConversations(convs.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      const leadMap: Record<string, Lead> = {};
      ls.forEach((l: Lead) => { leadMap[l.id] = l; });
      setLeads(leadMap);
      setLoading(false);
    });
  }, []);

  const filtered = conversations.filter(c => {
    const lead = leads[c.leadId];
    const name = lead?.profile.name?.toLowerCase() || '';
    return !search || name.includes(search.toLowerCase());
  });

  const startNew = async () => {
    setCreating(true);
    try {
      const res = await api.startConversation({ instituteId: 'inst-apex', channel: 'web_chat' });
      setConvId(res.conversation.id);
      setPage('conversation');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Conversation Inbox</h2>
          <p className="text-sm text-slate-500 mt-1">{conversations.length} conversations</p>
        </div>
        <button onClick={startNew} disabled={creating} className="btn-primary">
          <Plus size={16} /> New Conversation
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by student name..." className="input-field pl-9" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(conv => {
            const lead = leads[conv.leadId];
            const lastMsg = conv.messages[conv.messages.length - 1];
            return (
              <motion.div key={conv.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => { setConvId(conv.id); setPage('conversation'); }}
                className="card-hover p-4 flex items-center gap-4">
                <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800 truncate">
                      {lead?.profile.name || 'Anonymous Enquiry'}
                    </p>
                    {lead?.profile.humanHandoff && <span className="badge-red badge text-[10px]">⚠ Handoff</span>}
                    {conv.status === 'handed_off' && <span className="badge-amber badge text-[10px]">Counsellor</span>}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {lastMsg ? lastMsg.text.slice(0, 80) + (lastMsg.text.length > 80 ? '…' : '') : 'No messages yet'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-400">{timeAgo(conv.updatedAt)}</span>
                  {lead && <span className={getStageBadgeClass(lead.profile.leadStage)}>{lead.profile.leadStage}</span>}
                  <span className="text-xs text-slate-500">{conv.messages.length} msgs</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===================== LEAD MANAGEMENT =====================
function LeadManagement({ setConvId, setPage }: { setConvId: (id: string) => void; setPage: (p: Page) => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeads().then(l => { setLeads(l); setLoading(false); });
  }, []);

  const filtered = leads.filter(l => {
    const name = (l.profile.name || '').toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) ||
      l.profile.examTarget?.toLowerCase().includes(search.toLowerCase()) ||
      l.profile.phone?.includes(search);
    const matchStage = !stageFilter || l.profile.leadStage === stageFilter;
    return matchSearch && matchStage;
  });

  const stages = [...new Set(leads.map(l => l.profile.leadStage))];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Lead Management</h2>
          <p className="text-sm text-slate-500 mt-1">{leads.length} total leads • {filtered.length} shown</p>
        </div>
        <button className="btn-secondary text-xs"><Filter size={12} /> Export CSV</button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, exam, phone..." className="input-field pl-9" />
        </div>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
          className="input-field w-48">
          <option value="">All Stages</option>
          {stages.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Course / Exam</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Updated</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <tr key={lead.id}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => { setConvId(lead.conversationId); setPage('conversation'); }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{lead.profile.name || 'Anonymous'}</p>
                        <p className="text-[10px] text-slate-500">{lead.channel} • {lead.profile.preferredLanguage?.toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700 font-medium">{lead.profile.examTarget || '—'}</p>
                    <p className="text-xs text-slate-500">{lead.profile.academicLevel || ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700 text-xs">{lead.profile.phone || '—'}</p>
                    <p className="text-xs text-slate-500">{lead.profile.location || ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <ScoreRing score={lead.profile.leadScore} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={getStageBadgeClass(lead.profile.leadStage)}>{lead.profile.leadStage}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500">{timeAgo(lead.updatedAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg hover:bg-brand-50 text-slate-400 hover:text-brand-600">
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===================== COURSES =====================
function CourseCatalogue() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCourses().then(c => { setCourses(c); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Course Catalogue</h2>
        <p className="text-sm text-slate-500 mt-1">{courses.length} courses across all institutes</p>
      </div>
      <div className="grid grid-cols-2 gap-5">
        {courses.map(course => (
          <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-brand-600">{course.category}</p>
                <h3 className="font-bold text-slate-800 mt-0.5">{course.name}</h3>
              </div>
              <span className={`badge ${course.seatsLeft <= 10 ? 'badge-red' : 'badge-green'}`}>
                {course.seatsLeft} seats left
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-slate-500">Fee</p>
                <p className="font-semibold text-slate-800">{course.feeDisplay}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-slate-500">Duration</p>
                <p className="font-semibold text-slate-800">{course.duration}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 col-span-2">
                <p className="text-slate-500">Schedules</p>
                <p className="font-semibold text-slate-800">{course.schedules.join(' • ')}</p>
              </div>
            </div>
            {course.scholarshipAvailable && (
              <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                <Star size={12} className="text-emerald-600" />
                <span className="text-xs text-emerald-700">{course.scholarshipDetails}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-1">
              {course.highlights.map((h, i) => (
                <span key={i} className="badge-blue badge text-[10px]">{h}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ===================== FOLLOW-UPS =====================
function FollowUps() {
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFollowUps().then(t => { setTasks(t); setLoading(false); });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.updateFollowUpStatus(id, status, 'Updated by counsellor');
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: status as any } : t));
  };

  const statusColor: Record<string, string> = {
    pending: 'badge-amber',
    triggered: 'badge-blue',
    completed: 'badge-green',
    cancelled: 'badge-slate'
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Follow-Up Automation</h2>
        <p className="text-sm text-slate-500 mt-1">{tasks.filter(t => t.status === 'pending').length} pending • {tasks.filter(t => t.status === 'triggered').length} triggered</p>
      </div>
      {loading ? <div className="flex items-center justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div> : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${statusColor[task.status]}`}>{task.status}</span>
                    <span className="text-xs text-slate-500">{task.triggerCondition}</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{task.messageTemplate}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={10} /> Due: {new Date(task.dueAt).toLocaleString('en-IN')}</span>
                    <span>Retries: {task.retryCount}/{task.maxRetries}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {task.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(task.id, 'completed')} className="btn-secondary text-xs text-emerald-600">
                        <CheckCircle size={12} /> Done
                      </button>
                      <button onClick={() => updateStatus(task.id, 'cancelled')} className="btn-secondary text-xs text-red-600">
                        <XCircle size={12} /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===================== DUPLICATES =====================
function DuplicateReview() {
  const [dupes, setDupes] = useState<DuplicateCandidate[]>([]);
  const [leads, setLeads] = useState<Record<string, Lead>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDuplicates(), api.getLeads()]).then(([d, ls]) => {
      setDupes(d);
      const m: Record<string, Lead> = {};
      ls.forEach((l: Lead) => { m[l.id] = l; });
      setLeads(m);
      setLoading(false);
    });
  }, []);

  const resolve = async (id: string, action: 'merged' | 'kept_separate') => {
    await api.resolveDuplicate(id, action, 'user-1', 'Reviewed by admissions head');
    setDupes(prev => prev.map(d => d.id === id ? { ...d, status: action } : d));
  };

  if (loading) return <div className="flex items-center justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Duplicate Lead Review</h2>
        <p className="text-sm text-slate-500 mt-1">{dupes.filter(d => d.status === 'detected').length} pending review</p>
      </div>
      <div className="space-y-4">
        {dupes.map(dupe => {
          const primary = leads[dupe.primaryLeadId];
          const duplicate = leads[dupe.duplicateLeadId];
          return (
            <div key={dupe.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Copy size={16} className="text-orange-500" />
                  <span className="font-semibold text-slate-800">Potential Duplicate Detected</span>
                  <span className={`badge ${dupe.matchConfidence >= 80 ? 'badge-red' : 'badge-amber'}`}>
                    {dupe.matchConfidence}% match
                  </span>
                  <span className={`badge ${dupe.status === 'detected' ? 'badge-amber' : 'badge-green'}`}>
                    {dupe.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {[{ label: 'Primary Lead', lead: primary }, { label: 'Duplicate Lead', lead: duplicate }].map(({ label, lead }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-500 mb-2">{label}</p>
                    {lead ? (
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-slate-800">{lead.profile.name || 'Anonymous'}</p>
                        <p className="text-xs text-slate-500">{lead.profile.phone || 'No phone'}</p>
                        <p className="text-xs text-slate-500">{lead.profile.email || 'No email'}</p>
                        <span className={getStageBadgeClass(lead.profile.leadStage)}>{lead.profile.leadStage}</span>
                      </div>
                    ) : <p className="text-xs text-slate-400">Lead not found</p>}
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-600 mb-2">Match Evidence:</p>
                <div className="space-y-1">
                  {dupe.matchReasons.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <CheckCircle size={10} className="text-orange-500" />
                      <span className="text-slate-600">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {dupe.notes && <p className="text-xs text-slate-500 mb-4 italic">{dupe.notes}</p>}

              {dupe.status === 'detected' && (
                <div className="flex gap-3">
                  <button onClick={() => resolve(dupe.id, 'merged')}
                    className="btn-primary text-xs">
                    <CheckCircle size={12} /> Merge Records
                  </button>
                  <button onClick={() => resolve(dupe.id, 'kept_separate')}
                    className="btn-secondary text-xs">
                    <XCircle size={12} /> Keep Separate
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===================== HANDOFF QUEUE =====================
function HandoffQueue({ setConvId, setPage }: { setConvId: (id: string) => void; setPage: (p: Page) => void }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [leads, setLeads] = useState<Record<string, Lead>>({});
  const [counsellors, setCounsellors] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([api.getConversations(), api.getLeads(), api.getCounsellors()]).then(([convs, ls, cs]) => {
      setConversations(convs.filter((c: any) => c.status === 'handed_off'));
      const m: Record<string, Lead> = {};
      ls.forEach((l: Lead) => { m[l.id] = l; });
      setLeads(m);
      setCounsellors(cs);
    });
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Human Handoff Queue</h2>
        <p className="text-sm text-slate-500 mt-1">{conversations.length} conversations awaiting counsellor</p>
      </div>
      {conversations.length === 0 ? (
        <div className="card p-12 text-center">
          <UserCheck size={36} className="text-emerald-400 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No conversations currently in handoff queue</p>
          <p className="text-sm text-slate-400 mt-1">All conversations are being handled by the AI assistant</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map(conv => {
            const lead = leads[conv.leadId];
            return (
              <div key={conv.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{lead?.profile.name || 'Anonymous'}</p>
                      <p className="text-xs text-slate-500">{lead?.profile.handoffReason}</p>
                      <p className="text-xs text-slate-400 mt-1">Handed off {timeAgo(conv.updatedAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setConvId(conv.id); setPage('conversation'); }}
                      className="btn-primary text-xs">
                      <MessageSquare size={12} /> Open Conversation
                    </button>
                  </div>
                </div>
                {lead && (
                  <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-3 gap-3 text-xs">
                    <div><p className="text-slate-500">Exam Target</p><p className="font-medium">{lead.profile.examTarget || '—'}</p></div>
                    <div><p className="text-slate-500">Lead Score</p><p className="font-medium">{lead.profile.leadScore}/100</p></div>
                    <div><p className="text-slate-500">Last Intent</p><p className="font-medium">{lead.profile.lastIntent || '—'}</p></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===================== ANALYTICS =====================
function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>;

  const stageData = data?.stageDistribution
    ? Object.entries(data.stageDistribution).map(([stage, count]) => ({ stage: stage.replace(' Confirmation', '').replace(' Requested', ''), count }))
    : [];

  const channelData = data?.channelDist
    ? Object.entries(data.channelDist).map(([channel, count]) => ({ channel, count }))
    : [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics & Reports</h2>
          <p className="text-sm text-slate-500 mt-1">Enrolix TechSummitTrainers — Live Admissions Analytics</p>
        </div>
        <span className="badge badge-amber">📊 Demo Mode — Seeded Data</span>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Enquiries', value: data?.summary.totalLeads, color: 'text-brand-600' },
          { label: 'Qualified Rate', value: `${Math.round((data?.summary.qualifiedLeads / data?.summary.totalLeads) * 100)}%`, color: 'text-emerald-600' },
          { label: 'Avg Lead Score', value: data?.summary.avgLeadScore + '/100', color: 'text-violet-600' },
          { label: 'Open Conversations', value: data?.summary.openConversations, color: 'text-amber-600' },
        ].map((kpi, i) => (
          <div key={i} className="stat-card text-center">
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Lead stage funnel */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Lead Stage Funnel</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stageData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 10 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel distribution */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Channel Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={channelData} cx="50%" cy="50%" outerRadius={90}
                dataKey="count" nameKey="channel" label={({ channel, count }) => `${channel}: ${count}`}>
                {channelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course interest */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Course Interest Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={
            data?.courseInterestDist
              ? Object.entries(data.courseInterestDist).map(([course, count]) => ({ course: course.slice(0, 20), count }))
              : []
          }>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="course" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ===================== SETTINGS =====================
function SettingsPage() {
  const [resetting, setResetting] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [grokKey, setGrokKey] = useState('');
  const [fallbackMode, setFallbackMode] = useState('hybrid');
  const [preferredProvider, setPreferredProvider] = useState('auto');
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [savingAi, setSavingAi] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [testingGrok, setTestingGrok] = useState(false);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; msg: string } | null>(null);

  useEffect(() => {
    api.getAISettings().then(res => {
      setAiStatus(res);
      setFallbackMode(res.fallbackMode || 'hybrid');
      setPreferredProvider(res.preferredProvider || 'auto');
    }).catch(err => console.error('Failed to load AI settings:', err));
  }, []);

  const handleSaveAI = async () => {
    setSavingAi(true);
    setTestResult(null);
    try {
      const res = await api.updateAISettings({
        geminiApiKey: geminiKey || undefined,
        grokApiKey: grokKey || undefined,
        fallbackMode,
        preferredProvider
      });
      setAiStatus(res.config);
      setTestResult({ provider: 'Config', success: true, msg: 'AI Fallback configuration saved successfully!' });
    } catch (err: any) {
      setTestResult({ provider: 'Config', success: false, msg: err.message });
    } finally {
      setSavingAi(false);
    }
  };

  const handleTestGemini = async () => {
    setTestingGemini(true);
    setTestResult(null);
    try {
      const res = await api.testAIConnection('gemini', geminiKey || undefined);
      setTestResult({ provider: 'Gemini', success: res.success, msg: res.reply || 'Gemini Connected successfully!' });
    } catch (err: any) {
      setTestResult({ provider: 'Gemini', success: false, msg: err.message });
    } finally {
      setTestingGemini(false);
    }
  };

  const handleTestGrok = async () => {
    setTestingGrok(true);
    setTestResult(null);
    try {
      const res = await api.testAIConnection('grok', grokKey || undefined);
      setTestResult({ provider: 'Grok', success: res.success, msg: res.reply || 'Grok Connected successfully!' });
    } catch (err: any) {
      setTestResult({ provider: 'Grok', success: false, msg: err.message });
    } finally {
      setTestingGrok(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all data to seed demo data? This cannot be undone.')) return;
    setResetting(true);
    await api.resetSimulation();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings & Intelligence Engine</h2>
        <p className="text-sm text-slate-500 mt-1">Configuration for Enrolix engine & LLM database grounding</p>
      </div>

      {/* AI Fallback Configuration Card */}
      <div className="card p-5 border-l-4 border-l-brand-600">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="section-title flex items-center gap-2">
              <Zap size={18} className="text-brand-600" />
              AI Intelligence & Database Grounding (Grok & Gemini API)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              When student queries shift context or ask open questions, Grok and Gemini search the course database to give accurate admissions responses.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${aiStatus?.geminiConfigured ? 'badge-blue' : 'badge-slate'}`}>
              Gemini: {aiStatus?.geminiConfigured ? 'Active' : 'Unset'}
            </span>
            <span className={`badge ${aiStatus?.grokConfigured ? 'badge-blue' : 'badge-slate'}`}>
              Grok: {aiStatus?.grokConfigured ? 'Active' : 'Unset'}
            </span>
          </div>
        </div>

        {testResult && (
          <div className={`p-3 rounded-xl mb-4 text-xs font-medium border ${testResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
            <strong>[{testResult.provider}]</strong> {testResult.msg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label mb-1">Google Gemini API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder={aiStatus?.geminiConfigured ? '•••••••••••••••• (configured)' : 'Enter Gemini API key (AIzaSy...)'}
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                className="input text-xs font-mono flex-1"
              />
              <button
                type="button"
                onClick={handleTestGemini}
                disabled={testingGemini}
                className="btn-secondary text-xs flex-shrink-0"
              >
                {testingGemini ? <RefreshCw size={12} className="animate-spin" /> : 'Test'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Uses Gemini 2.0 Flash / 1.5 Flash grounded in course catalogue</p>
          </div>

          <div>
            <label className="label mb-1">xAI Grok API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder={aiStatus?.grokConfigured ? '•••••••••••••••• (configured)' : 'Enter Grok API key (xai-...)'}
                value={grokKey}
                onChange={e => setGrokKey(e.target.value)}
                className="input text-xs font-mono flex-1"
              />
              <button
                type="button"
                onClick={handleTestGrok}
                disabled={testingGrok}
                className="btn-secondary text-xs flex-shrink-0"
              >
                {testingGrok ? <RefreshCw size={12} className="animate-spin" /> : 'Test'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Uses Grok-2 / Grok-beta with full database grounding</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-2 border-t border-slate-100">
          <div>
            <label className="label mb-1">Engine Operating Mode</label>
            <select
              value={fallbackMode}
              onChange={e => setFallbackMode(e.target.value)}
              className="input text-xs"
            >
              <option value="hybrid">Hybrid (Deterministic Rules + Grok/Gemini DB Fallback)</option>
              <option value="always_llm">Always LLM Grounded (Gemini/Grok for all turns)</option>
              <option value="deterministic_only">Deterministic Only (Strict Rule Engine)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">Hybrid mode keeps fast rule-based slot filling and calls LLM when context shifts or open queries occur.</p>
          </div>

          <div>
            <label className="label mb-1">Preferred AI Provider</label>
            <select
              value={preferredProvider}
              onChange={e => setPreferredProvider(e.target.value)}
              className="input text-xs"
            >
              <option value="auto">Auto (Gemini first with Grok fallback)</option>
              <option value="gemini">Google Gemini Preferred</option>
              <option value="grok">xAI Grok Preferred</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">If the preferred provider fails or hits rate limits, the alternate provider is automatically called.</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            * Note: If neither key is entered, Enrolix uses its built-in Semantic Database Search engine.
          </p>
          <button
            onClick={handleSaveAI}
            disabled={savingAi}
            className="btn-primary text-xs"
          >
            {savingAi ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
            Save AI Settings
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="section-title mb-3">System Information</h3>
        <div className="space-y-3 text-sm">
          {[
            ['Engine Type', 'Deterministic Intelligence + Grok & Gemini RAG Database Grounding'],
            ['Backend', 'Express.js + WebSocket (Node.js)'],
            ['Database', 'In-memory JSON with file persistence (TechSummitTrainers catalogue)'],
            ['Intents Supported', '24 intent types across English, Hindi, Marathi'],
            ['Rules Registered', '28 prioritized conversation rules with semantic fallback'],
            ['Technical Courses', 'Full Stack Java, Python, MERN, Testing, Data Science'],
            ['Live Data', 'Active — verified TechSummitTrainers curriculum'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start gap-4">
              <span className="text-slate-500 min-w-[200px] font-medium">{label}</span>
              <span className="text-slate-800">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="section-title mb-3">Simulation Controls</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="font-medium text-slate-800 text-sm">Reset to Demo Data</p>
              <p className="text-xs text-slate-500">Restores all seed leads, conversations, and follow-ups</p>
            </div>
            <button onClick={handleReset} disabled={resetting} className="btn-secondary text-xs text-red-600">
              <RefreshCw size={12} className={resetting ? 'animate-spin' : ''} /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== MAIN APP =====================
export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [convId, setConvId] = useState<string>('conv-aarav');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar page={page} setPage={setPage} />
      <main className="flex-1 ml-64 overflow-hidden flex flex-col">
        <div className={`flex-1 overflow-y-auto p-6 ${page === 'conversation' ? 'flex flex-col p-0' : ''}`}>
          {page === 'dashboard' && <Dashboard setPage={setPage} setConvId={setConvId} />}
          {page === 'inbox' && <Inbox setConvId={setConvId} setPage={setPage} />}
          {page === 'conversation' && (
            <div className="flex-1 flex flex-col overflow-hidden h-full">
              <ConversationWorkspace convId={convId} setConvId={setConvId} />
            </div>
          )}
          {page === 'leads' && <LeadManagement setConvId={setConvId} setPage={setPage} />}
          {page === 'courses' && <CourseCatalogue />}
          {page === 'knowledge' && <KnowledgeBasePage />}
          {page === 'followups' && <FollowUps />}
          {page === 'duplicates' && <DuplicateReview />}
          {page === 'handoff' && <HandoffQueue setConvId={setConvId} setPage={setPage} />}
          {page === 'analytics' && <Analytics />}
          {page === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}
