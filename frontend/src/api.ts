const BASE = '/api';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getLeads: (instituteId = 'inst-techsummit') => apiFetch<any[]>(`/leads?instituteId=${instituteId}`),
  getLead: (id: string) => apiFetch<any>(`/leads/${id}`),
  updateLeadStage: (id: string, stage: string) =>
    apiFetch<any>(`/leads/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) }),
  updateLeadProfile: (id: string, updates: any) =>
    apiFetch<any>(`/leads/${id}/profile`, { method: 'PATCH', body: JSON.stringify(updates) }),

  getConversations: (instituteId = 'inst-techsummit') => apiFetch<any[]>(`/conversations?instituteId=${instituteId}`),
  getConversation: (id: string) => apiFetch<any>(`/conversations/${id}`),
  getConversationByLead: (leadId: string) => apiFetch<any>(`/leads/${leadId}/conversation`),
  startConversation: (opts: { instituteId?: string; channel?: string; language?: string }) =>
    apiFetch<any>('/conversations/start', { method: 'POST', body: JSON.stringify(opts) }),
  sendMessage: (convId: string, text: string, language?: string) =>
    apiFetch<any>(`/conversations/${convId}/message`, {
      method: 'POST',
      body: JSON.stringify({ text, language })
    }),
  handoff: (convId: string, counsellorId?: string, reason?: string) =>
    apiFetch<any>(`/conversations/${convId}/handoff`, {
      method: 'POST',
      body: JSON.stringify({ counsellorId, reason })
    }),
  resume: (convId: string) =>
    apiFetch<any>(`/conversations/${convId}/resume`, { method: 'POST', body: '{}' }),
  staffMessage: (convId: string, text: string, counsellorId?: string) =>
    apiFetch<any>(`/conversations/${convId}/staff-message`, {
      method: 'POST',
      body: JSON.stringify({ text, counsellorId })
    }),

  getCourses: (instituteId?: string) =>
    apiFetch<any[]>(`/courses${instituteId ? `?instituteId=${instituteId}` : ''}`),

  getFollowUps: (instituteId = 'inst-techsummit') => apiFetch<any[]>(`/followups?instituteId=${instituteId}`),
  updateFollowUpStatus: (id: string, status: string, note?: string) =>
    apiFetch<any>(`/followups/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),

  getDuplicates: (instituteId = 'inst-techsummit') => apiFetch<any[]>(`/duplicates?instituteId=${instituteId}`),
  resolveDuplicate: (id: string, action: string, reviewedBy: string, notes?: string) =>
    apiFetch<any>(`/duplicates/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action, reviewedBy, notes })
    }),

  getCounsellors: (instituteId = 'inst-techsummit') => apiFetch<any[]>(`/counsellors?instituteId=${instituteId}`),

  getAnalytics: (instituteId = 'inst-techsummit') => apiFetch<any>(`/analytics?instituteId=${instituteId}`),

  resetSimulation: () => apiFetch<any>('/simulation/reset', { method: 'POST', body: '{}' }),

  getAISettings: () => apiFetch<{ geminiConfigured: boolean; grokConfigured: boolean; preferredProvider: string; fallbackMode: string }>('/settings/ai'),
  updateAISettings: (settings: { geminiApiKey?: string; grokApiKey?: string; preferredProvider?: string; fallbackMode?: string }) =>
    apiFetch<any>('/settings/ai', { method: 'POST', body: JSON.stringify(settings) }),
  testAIConnection: (provider: string, apiKey?: string) =>
    apiFetch<{ success: boolean; reply?: string; error?: string }>('/settings/ai/test', {
      method: 'POST',
      body: JSON.stringify({ provider, apiKey })
    }),

  // Knowledge Base
  getKnowledgeStatus: () =>
    apiFetch<any>('/admin/knowledge/status', {
      headers: { 'x-admin-token': 'enrolix-admin-secure-token', 'x-user-role': 'admin' }
    }),
  getKnowledgeCourses: () =>
    apiFetch<any[]>('/admin/knowledge/courses', {
      headers: { 'x-admin-token': 'enrolix-admin-secure-token', 'x-user-role': 'admin' }
    }),
  getKnowledgeReviewQueue: () =>
    apiFetch<any[]>('/admin/knowledge/review-queue', {
      headers: { 'x-admin-token': 'enrolix-admin-secure-token', 'x-user-role': 'admin' }
    }),
  syncKnowledge: (triggeredBy = 'Admin UI Sync') =>
    apiFetch<any>('/admin/knowledge/sync', {
      method: 'POST',
      headers: { 'x-admin-token': 'enrolix-admin-secure-token', 'x-user-role': 'admin' },
      body: JSON.stringify({ triggeredBy })
    }),
  resolveKnowledgeConflict: (conflictId: string, notes?: string, resolvedBy?: string) =>
    apiFetch<any>('/admin/knowledge/resolve-conflict', {
      method: 'POST',
      headers: { 'x-admin-token': 'enrolix-admin-secure-token', 'x-user-role': 'admin' },
      body: JSON.stringify({ conflictId, notes, resolvedBy })
    }),
  verifyKnowledgeCourse: (courseId: string, verifiedBy?: string) =>
    apiFetch<any>('/admin/knowledge/verify-course', {
      method: 'POST',
      headers: { 'x-admin-token': 'enrolix-admin-secure-token', 'x-user-role': 'admin' },
      body: JSON.stringify({ courseId, verifiedBy })
    }),
  updateKnowledgeCourse: (id: string, field: string, value: any, notes?: string) =>
    apiFetch<any>(`/admin/knowledge/course/${id}`, {
      method: 'PATCH',
      headers: { 'x-admin-token': 'enrolix-admin-secure-token', 'x-user-role': 'admin' },
      body: JSON.stringify({ field, value, notes })
    })
};
