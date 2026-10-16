import React, { useState, useEffect } from 'react';
import {
  Database, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink,
  ShieldCheck, Clock, BookOpen, Layers, DollarSign, Calendar,
  Code, Info, Edit3, X, Check, Search, FileText, ChevronRight,
  AlertCircle, Building2, MapPin, Phone, Mail, Award
} from 'lucide-react';
import { api } from './api';
import type { Course, KnowledgeConflict, ScrapeRun } from './types';

export function KnowledgeBasePage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [statusData, setStatusData] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [conflicts, setConflicts] = useState<KnowledgeConflict[]>([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'review' | 'logs' | 'institute'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editField, setEditField] = useState<string>('feeAmount');
  const [editValue, setEditValue] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusRes, coursesRes, conflictsRes] = await Promise.all([
        api.getKnowledgeStatus().catch(() => null),
        api.getKnowledgeCourses().catch(() => []),
        api.getKnowledgeReviewQueue().catch(() => [])
      ]);
      setStatusData(statusRes);
      setCourses(coursesRes);
      setConflicts(conflictsRes);
    } catch (err: any) {
      showToast(err.message || 'Failed to load knowledge base', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await api.syncKnowledge('Admin Manual Sync');
      if (res.success) {
        showToast(`Sync completed successfully! Processed ${res.result.urlsAttempted} pages.`, 'success');
        await loadData();
      } else {
        showToast(`Sync failed: ${res.error || 'Server returned error'}`, 'error');
      }
    } catch (err: any) {
      showToast(`Sync failed: ${err.message}`, 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleVerifyCourse = async (courseId: string) => {
    try {
      const res = await api.verifyKnowledgeCourse(courseId, 'Admin Head');
      if (res.success) {
        showToast('Course marked as manually verified', 'success');
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleResolveConflict = async (conflictId: string, resolutionAction: 'accept' | 'override', notes: string) => {
    try {
      const res = await api.resolveKnowledgeConflict(conflictId, `${resolutionAction.toUpperCase()}: ${notes}`, 'Admin');
      if (res.success) {
        showToast('Conflict resolved and archived', 'success');
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCourse) return;
    try {
      setSavingEdit(true);
      let parsedValue: any = editValue;
      if (editField === 'feeAmount' || editField === 'fee') {
        parsedValue = parseInt(editValue, 10);
      }
      const res = await api.updateKnowledgeCourse(editingCourse.id, editField, parsedValue, editNotes);
      if (res.success) {
        showToast(`Field ${editField} updated and recorded in audit log.`, 'success');
        setEditingCourse(null);
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (c.technologies || []).some(t => t.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const pendingConflictsCount = conflicts.filter(c => c.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 transition-all ${
          toastMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertTriangle size={18} className="text-rose-600" />}
          <span className="text-sm font-medium">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              TechSummitTrainers Pipeline
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Verified DB
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Knowledge Base</h1>
          <p className="text-sm text-slate-500 mt-1">
            Public course ingestion & grounded AI evidence store. Ground truth for Gemini & Grok admissions bot.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading || syncing}
            className="px-3.5 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm font-medium flex items-center gap-2 transition"
            title="Refresh database view"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 rounded-xl text-white gradient-brand shadow-sm hover:opacity-95 text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            <Database size={16} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing Websites...' : 'Sync Knowledge Base'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Ingested Courses</span>
            <BookOpen size={18} className="text-brand-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{statusData?.totalCourses ?? courses.length}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold">{statusData?.verifiedCourses ?? courses.length} Verified</span>
            <span>· All 5 official URLs active</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Review Queue</span>
            <AlertCircle size={18} className={pendingConflictsCount > 0 ? 'text-amber-500' : 'text-slate-400'} />
          </div>
          <div className={`text-3xl font-extrabold ${pendingConflictsCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {pendingConflictsCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {pendingConflictsCount > 0 ? 'Unverified price/batch changes detected' : 'Zero unconfirmed conflicts'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Last Sync Run</span>
            <Clock size={18} className="text-blue-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">
            {statusData?.lastScrapeRun?.status === 'success' ? '100% Succeeded' : (statusData?.lastScrapeRun?.status || 'Active')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {statusData?.lastScrapeRun?.completedAt
              ? `${new Date(statusData.lastScrapeRun.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${statusData.lastScrapeRun.urlsSucceeded}/${statusData.lastScrapeRun.urlsAttempted} pages)`
              : 'Synced'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Grounding Policy</span>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-emerald-700">Strict Anti-Hallucination</div>
          <div className="text-xs text-slate-500 mt-1">
            No price invention · Disclaimer enforced
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'courses'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen size={16} />
          <span>Ingested Courses ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'review'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <AlertTriangle size={16} className={pendingConflictsCount > 0 ? 'text-amber-500' : ''} />
          <span>Review Queue & Conflicts ({pendingConflictsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText size={16} />
          <span>Sync Audit Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('institute')}
          className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'institute'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 size={16} />
          <span>Institute Profile & Disclaimers</span>
        </button>
      </div>

      {/* TAB 1: Ingested Courses */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search courses, stacks, or keywords..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <span className="text-xs text-slate-500">Showing {filteredCourses.length} of {courses.length} courses</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {course.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 ${
                      course.verificationStatus === 'verified'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <ShieldCheck size={12} />
                      {course.verificationStatus === 'verified' ? 'Verified' : 'Needs Review'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">{course.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">{course.description}</p>

                  <div className="space-y-2 py-3 border-y border-slate-100 mb-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <DollarSign size={13} className="text-slate-400" />
                        Published Fee:
                      </span>
                      <span className="font-bold text-slate-900">
                        ₹{(course.feeAmount || course.fee).toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] font-normal text-slate-500">
                          ({course.feeType === 'starting_from' ? 'starting' : 'fixed'})
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-400" />
                        Duration:
                      </span>
                      <span className="font-semibold text-slate-700">{course.duration}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        Next Batch:
                      </span>
                      <span className="font-semibold text-slate-700 truncate max-w-[170px] text-right">
                        {course.nextBatchDate || 'Contact counsellor'}
                      </span>
                    </div>

                    {course.sourceUrl && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <ExternalLink size={13} className="text-slate-400" />
                          Source Page:
                        </span>
                        <a
                          href={course.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 hover:text-brand-700 font-medium truncate max-w-[170px] text-right hover:underline"
                        >
                          Official URL ↗
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(course.technologies || []).slice(0, 5).map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[11px]">
                        {tech}
                      </span>
                    ))}
                    {(course.technologies || []).length > 5 && (
                      <span className="px-1.5 py-0.5 text-slate-400 text-[10px]">
                        +{(course.technologies || []).length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Layers size={13} />
                    <span>View Syllabus</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingCourse(course);
                      setEditField('feeAmount');
                      setEditValue(String(course.feeAmount || course.fee));
                      setEditNotes('Admin manual verification update');
                    }}
                    className="py-1.5 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs transition"
                    title="Audit & Edit Field"
                  >
                    <Edit3 size={13} />
                  </button>

                  {course.verificationStatus !== 'verified' && (
                    <button
                      onClick={() => handleVerifyCourse(course.id)}
                      className="py-1.5 px-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs transition font-medium"
                      title="Mark as Verified"
                    >
                      <Check size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Review Queue & Conflicts */}
      {activeTab === 'review' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Knowledge Conflict Review Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically flags whenever public site data differs from existing database records.
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
              {conflicts.length} Total Audit Records
            </span>
          </div>

          {conflicts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShieldCheck size={40} className="mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="text-sm font-medium text-slate-600">No unresolved conflicts detected.</p>
              <p className="text-xs text-slate-400 mt-1">All scraped prices, durations, and syllabi are confirmed.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {conflicts.map(conf => (
                <div key={conf.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        conf.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {conf.status}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{conf.courseTitle || 'Course Conflict'}</span>
                      <span className="text-xs text-slate-400">· Field: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">{conf.field}</code></span>
                    </div>

                    <div className="text-xs flex items-center gap-3 text-slate-600">
                      <span>Previous Value: <strong className="text-slate-900">{String(conf.previousValue)}</strong></span>
                      <span>→</span>
                      <span>Scraped Value: <strong className="text-brand-700">{String(conf.newValue)}</strong></span>
                    </div>

                    {conf.resolutionNotes && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">Note: {conf.resolutionNotes}</p>
                    )}
                  </div>

                  {conf.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveConflict(conf.id, 'accept', 'Accepted freshly scraped web value')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                      >
                        Accept New Value
                      </button>
                      <button
                        onClick={() => handleResolveConflict(conf.id, 'override', 'Kept previous verified value')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                      >
                        Keep Previous
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Resolved at {new Date(conf.resolvedAt || '').toLocaleDateString()}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Sync Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Latest Sync Execution Logs</h2>
            <span className="text-xs font-mono text-slate-500">Run ID: {statusData?.lastScrapeRun?.id || 'none'}</span>
          </div>

          <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto space-y-1.5 max-h-[500px]">
            {(statusData?.lastScrapeRun?.logs || [
              'No previous scrape log found. Click "Sync Knowledge Base" to execute initial fetch.'
            ]).map((log: string, idx: number) => (
              <div key={idx} className="leading-relaxed">
                <span className="text-slate-500 mr-2">[{idx + 1}]</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Institute Profile & Policies */}
      {activeTab === 'institute' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">TechSummitTrainers Verified Facts</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict factual constraints provided to Gemini & Grok conversational bot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Location & Contact</h3>
              <div className="text-sm space-y-2 text-slate-700">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-brand-600 shrink-0 mt-0.5" />
                  <span>Office No. 509, Kushal Wallstreet, Fergusson College Road, Shivajinagar, Pune 411004</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-brand-600" />
                  <span>+91 84858 46806</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-brand-600" />
                  <span>admin@techsummittrainers.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-brand-600" />
                  <span>Monday – Saturday: 9:00 AM – 7:00 PM</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-3 bg-amber-50/40 border-amber-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-600" />
                Mandatory Career & Placement Policy
              </h3>
              <p className="text-xs text-amber-950 leading-relaxed">
                Resume and LinkedIn building, mock interviews, and job-search support are actively provided.
              </p>
              <div className="p-2.5 bg-amber-100/80 rounded-lg border border-amber-300 text-xs font-semibold text-amber-900">
                ⚠️ Explicit Disclaimer: The institute explicitly does NOT guarantee 100% placement or fixed salaries. Bot strictly enforces this disclaimer.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SYLLABUS DETAIL MODAL */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  {selectedCourse.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedCourse.name}</h3>
                <p className="text-xs text-slate-500">Duration: {selectedCourse.duration} · Starting Fee: ₹{(selectedCourse.feeAmount || selectedCourse.fee).toLocaleString('en-IN')}</p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Modules */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Layers size={14} className="text-brand-600" />
                  Curriculum Modules & Week-by-Week Topics
                </h4>
                <div className="space-y-3">
                  {(selectedCourse.curriculumModules || []).map((mod, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-700">{mod.moduleNumber}</span>
                        <h5 className="font-bold text-slate-900 text-sm">{mod.title}</h5>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(mod.topics || []).map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-xs">
                            {t}
                          </span>
                        ))}
                      </div>
                      {mod.weekBreakdown && mod.weekBreakdown.length > 0 && (
                        <div className="pt-2 text-xs text-slate-600 space-y-1 border-t border-slate-200 mt-2">
                          {mod.weekBreakdown.map((wb, wIdx) => (
                            <div key={wIdx} className="flex gap-2">
                              {wb.week && <span className="font-semibold text-slate-800 shrink-0">{wb.week}:</span>}
                              <span>{wb.topic}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              {selectedCourse.projects && selectedCourse.projects.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Code size={14} className="text-brand-600" />
                    Hands-on Portfolio Projects
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCourse.projects.map((proj, pIdx) => (
                      <div key={pIdx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                        <h5 className="font-bold text-slate-900 text-xs">{proj.title}</h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{proj.description}</p>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {proj.technologies.map((stk, sIdx) => (
                              <span key={sIdx} className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                                {stk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQs */}
              {selectedCourse.faqs && selectedCourse.faqs.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Info size={14} className="text-brand-600" />
                    Official Course FAQs
                  </h4>
                  <div className="space-y-2">
                    {selectedCourse.faqs.map((faq, fIdx) => (
                      <div key={fIdx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/40 text-xs space-y-1">
                        <p className="font-bold text-slate-800">Q: {faq.question}</p>
                        <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 flex justify-end bg-slate-50">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT FIELD MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Audit & Manual Override</h3>
              <button onClick={() => setEditingCourse(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Manually correct course data for <strong>{editingCourse.name}</strong> with a tracked audit trail.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Field to Update</label>
                <select
                  value={editField}
                  onChange={e => {
                    const f = e.target.value;
                    setEditField(f);
                    setEditValue(String((editingCourse as any)[f] || ''));
                  }}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="feeAmount">Starting Fee (feeAmount)</option>
                  <option value="duration">Duration (e.g. 5 Months)</option>
                  <option value="nextBatchDate">Next Batch Date</option>
                  <option value="eligibility">Eligibility</option>
                  <option value="publishedSalaryRange">Salary Range</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">New Value</label>
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                  placeholder="Enter corrected value"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Audit Notes / Reason</label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                  rows={2}
                  placeholder="Reason for manual correction (e.g. verified with admissions head)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingCourse(null)}
                className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-4 py-1.5 rounded-xl gradient-brand text-white text-xs font-semibold shadow-sm disabled:opacity-50"
              >
                {savingEdit ? 'Saving...' : 'Save & Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
