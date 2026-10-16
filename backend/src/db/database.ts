import fs from 'fs';
import path from 'path';
import {
  Institute,
  User,
  Course,
  Lead,
  Conversation,
  Message,
  FollowUpTask,
  DuplicateCandidate,
  StudentProfile,
  LeadStage,
  ScrapeRun,
  KnowledgeConflict,
  KnowledgeDocument
} from './types';
import {
  SEED_INSTITUTES,
  SEED_USERS,
  SEED_COURSES,
  SEED_LEADS,
  SEED_CONVERSATIONS,
  SEED_FOLLOWUPS,
  SEED_DUPLICATES
} from './seedData';

interface DatabaseState {
  institutes: Institute[];
  users: User[];
  courses: Course[];
  leads: Lead[];
  conversations: Record<string, Conversation>;
  followUps: FollowUpTask[];
  duplicates: DuplicateCandidate[];
  scrapeRuns: ScrapeRun[];
  knowledgeConflicts: KnowledgeConflict[];
  knowledgeDocuments: KnowledgeDocument[];
}

export class EnrolixDatabase {
  private state: DatabaseState;
  private filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, 'mock_db_state.json');
    this.state = this.loadState();
  }

  private loadState(): DatabaseState {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const loaded: DatabaseState = JSON.parse(raw);
        let updated = false;

        // Enforce TechSummitTrainers-only data: strip any non-inst-techsummit records
        if (loaded.institutes) {
          const prev = loaded.institutes.length;
          loaded.institutes = loaded.institutes.filter(i => i.id === 'inst-techsummit');
          if (loaded.institutes.length !== prev) updated = true;
        }
        if (loaded.courses) {
          const prev = loaded.courses.length;
          loaded.courses = loaded.courses.filter(c => c.instituteId === 'inst-techsummit');
          if (loaded.courses.length !== prev) updated = true;
        }
        if (loaded.users) {
          const prev = loaded.users.length;
          loaded.users = loaded.users.filter(u => u.instituteId === 'inst-techsummit');
          if (loaded.users.length !== prev) updated = true;
        }
        if (loaded.leads) {
          const prev = loaded.leads.length;
          loaded.leads = loaded.leads.filter(l => l.instituteId === 'inst-techsummit');
          if (loaded.leads.length !== prev) updated = true;
        }
        if (loaded.conversations) {
          for (const cid of Object.keys(loaded.conversations)) {
            if (loaded.conversations[cid].instituteId !== 'inst-techsummit') {
              delete loaded.conversations[cid];
              updated = true;
            }
          }
        }
        if (loaded.followUps) {
          const prev = loaded.followUps.length;
          loaded.followUps = loaded.followUps.filter(f => f.instituteId === 'inst-techsummit');
          if (loaded.followUps.length !== prev) updated = true;
        }
        if (loaded.duplicates) {
          const prev = loaded.duplicates.length;
          loaded.duplicates = loaded.duplicates.filter(d => d.instituteId === 'inst-techsummit');
          if (loaded.duplicates.length !== prev) updated = true;
        }

        // Ensure newly introduced seed institutes exist in active state
        if (!loaded.institutes || loaded.institutes.length === 0) {
          loaded.institutes = JSON.parse(JSON.stringify(SEED_INSTITUTES));
          updated = true;
        } else {
          for (const si of SEED_INSTITUTES) {
            const idx = loaded.institutes.findIndex(i => i.id === si.id);
            if (idx === -1) {
              loaded.institutes.push(si);
              updated = true;
            } else {
              loaded.institutes[idx] = { ...si, ...loaded.institutes[idx] };
            }
          }
        }

        // Ensure newly introduced seed courses exist in active state
        if (!loaded.courses) loaded.courses = [];
        for (const sc of SEED_COURSES) {
          if (!loaded.courses.some(c => c.id === sc.id)) {
            loaded.courses.push(sc);
            updated = true;
          }
        }

        // Ensure Knowledge Base collections exist
        if (!loaded.scrapeRuns) {
          loaded.scrapeRuns = [];
          updated = true;
        }
        if (!loaded.knowledgeConflicts) {
          loaded.knowledgeConflicts = [];
          updated = true;
        }
        if (!loaded.knowledgeDocuments) {
          loaded.knowledgeDocuments = [];
          updated = true;
        }

        if (updated) {
          fs.writeFileSync(this.filePath, JSON.stringify(loaded, null, 2), 'utf-8');
        }
        return loaded;
      }
    } catch (err) {
      console.warn('Could not read existing state file, using seed data:', err);
    }
    return this.getInitialSeedState();
  }

  public saveState(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database state:', err);
    }
  }

  public resetToSeed(): void {
    this.state = this.getInitialSeedState();
    this.saveState();
  }

  private getInitialSeedState(): DatabaseState {
    return {
      institutes: JSON.parse(JSON.stringify(SEED_INSTITUTES)),
      users: JSON.parse(JSON.stringify(SEED_USERS)),
      courses: JSON.parse(JSON.stringify(SEED_COURSES)),
      leads: JSON.parse(JSON.stringify(SEED_LEADS)),
      conversations: JSON.parse(JSON.stringify(SEED_CONVERSATIONS)),
      followUps: JSON.parse(JSON.stringify(SEED_FOLLOWUPS)),
      duplicates: JSON.parse(JSON.stringify(SEED_DUPLICATES)),
      scrapeRuns: [],
      knowledgeConflicts: [],
      knowledgeDocuments: []
    };
  }

  // Institutes
  public getInstitutes(): Institute[] {
    return this.state.institutes;
  }

  public getInstitute(id: string): Institute | undefined {
    return this.state.institutes.find(i => i.id === id);
  }

  // Courses
  public getCourses(instituteId?: string): Course[] {
    if (!instituteId) return this.state.courses;
    return this.state.courses.filter(c => c.instituteId === instituteId);
  }

  public getCourseById(id: string): Course | undefined {
    return this.state.courses.find(c => c.id === id);
  }

  public createCourse(course: Course): Course {
    this.state.courses.push(course);
    this.saveState();
    return course;
  }

  public updateCourse(id: string, updates: Partial<Course>): Course | undefined {
    const course = this.getCourseById(id);
    if (!course) return undefined;
    Object.assign(course, updates);
    this.saveState();
    return course;
  }

  // Leads
  public getLeads(instituteId?: string): Lead[] {
    if (!instituteId) return this.state.leads;
    return this.state.leads.filter(l => l.instituteId === instituteId && l.status !== 'archived');
  }

  public getLeadById(id: string): Lead | undefined {
    return this.state.leads.find(l => l.id === id);
  }

  public createLead(lead: Lead): Lead {
    this.state.leads.push(lead);
    this.saveState();
    return lead;
  }

  public updateLeadProfile(leadId: string, profileUpdates: Partial<StudentProfile>): Lead | undefined {
    const lead = this.getLeadById(leadId);
    if (!lead) return undefined;
    lead.profile = { ...lead.profile, ...profileUpdates };
    lead.updatedAt = new Date().toISOString();
    this.saveState();
    return lead;
  }

  public updateLeadStage(leadId: string, newStage: LeadStage): Lead | undefined {
    const lead = this.getLeadById(leadId);
    if (!lead) return undefined;
    lead.profile.leadStage = newStage;
    lead.updatedAt = new Date().toISOString();
    this.saveState();
    return lead;
  }

  // Conversations & Messages
  public getConversationById(id: string): Conversation | undefined {
    return this.state.conversations[id];
  }

  public getConversationByLeadId(leadId: string): Conversation | undefined {
    return Object.values(this.state.conversations).find(c => c.leadId === leadId);
  }

  public getConversations(instituteId?: string): Conversation[] {
    const all = Object.values(this.state.conversations);
    if (!instituteId) return all;
    return all.filter(c => c.instituteId === instituteId);
  }

  public createConversation(conv: Conversation): Conversation {
    this.state.conversations[conv.id] = conv;
    this.saveState();
    return conv;
  }

  public addMessage(conversationId: string, message: Message): Conversation | undefined {
    const conv = this.state.conversations[conversationId];
    if (!conv) return undefined;
    conv.messages.push(message);
    conv.updatedAt = new Date().toISOString();
    this.saveState();
    return conv;
  }

  public updateConversationStatus(
    conversationId: string,
    status: Conversation['status'],
    assignedCounsellorId?: string
  ): Conversation | undefined {
    const conv = this.state.conversations[conversationId];
    if (!conv) return undefined;
    conv.status = status;
    if (assignedCounsellorId !== undefined) {
      conv.assignedCounsellorId = assignedCounsellorId;
    }
    conv.updatedAt = new Date().toISOString();
    this.saveState();
    return conv;
  }

  // Follow-Up Tasks
  public getFollowUps(instituteId?: string): FollowUpTask[] {
    if (!instituteId) return this.state.followUps;
    return this.state.followUps.filter(f => f.instituteId === instituteId);
  }

  public createFollowUp(task: FollowUpTask): FollowUpTask {
    this.state.followUps.push(task);
    this.saveState();
    return task;
  }

  public updateFollowUpStatus(
    taskId: string,
    status: FollowUpTask['status'],
    auditNote?: string
  ): FollowUpTask | undefined {
    const task = this.state.followUps.find(t => t.id === taskId);
    if (!task) return undefined;
    task.status = status;
    if (auditNote) {
      task.auditLog.push({
        timestamp: new Date().toISOString(),
        action: `status_changed_to_${status}`,
        note: auditNote
      });
    }
    this.saveState();
    return task;
  }

  // Duplicate Candidates
  public getDuplicates(instituteId?: string): DuplicateCandidate[] {
    if (!instituteId) return this.state.duplicates;
    return this.state.duplicates.filter(d => d.instituteId === instituteId);
  }

  public createDuplicateCandidate(cand: DuplicateCandidate): DuplicateCandidate {
    this.state.duplicates.push(cand);
    this.saveState();
    return cand;
  }

  public resolveDuplicate(
    id: string,
    action: 'merged' | 'kept_separate',
    reviewedBy: string,
    notes?: string
  ): DuplicateCandidate | undefined {
    const cand = this.state.duplicates.find(d => d.id === id);
    if (!cand) return undefined;
    cand.status = action;
    cand.reviewedBy = reviewedBy;
    cand.reviewedAt = new Date().toISOString();
    cand.notes = notes;

    if (action === 'merged') {
      // Merge duplicate lead into primary lead
      const primaryLead = this.getLeadById(cand.primaryLeadId);
      const duplicateLead = this.getLeadById(cand.duplicateLeadId);
      if (primaryLead && duplicateLead) {
        // Merge notes and facts
        duplicateLead.status = 'merged';
        // Append messages from duplicate conversation to primary conversation
        const dupConv = this.getConversationByLeadId(duplicateLead.id);
        const primConv = this.getConversationByLeadId(primaryLead.id);
        if (dupConv && primConv) {
          primConv.messages.push({
            id: `msg-merge-${Date.now()}`,
            conversationId: primConv.id,
            instituteId: primConv.instituteId,
            sender: 'system',
            text: `[System Notice]: Merged duplicate lead "${duplicateLead.profile.name || 'Anonymous'}" (${duplicateLead.id}) into this record.`,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    this.saveState();
    return cand;
  }

  // Counsellors
  public getUsers(instituteId?: string): User[] {
    if (!instituteId) return this.state.users;
    return this.state.users.filter(u => u.instituteId === instituteId);
  }

  // --- Knowledge Base Methods ---

  public upsertInstitute(inst: Institute): Institute {
    const existingIdx = this.state.institutes.findIndex(
      i => i.id === inst.id || (i.slug && inst.slug && i.slug === inst.slug)
    );
    if (existingIdx !== -1) {
      this.state.institutes[existingIdx] = {
        ...this.state.institutes[existingIdx],
        ...inst,
        // Preserve branches and ID
        id: this.state.institutes[existingIdx].id,
        branches: inst.branches?.length ? inst.branches : this.state.institutes[existingIdx].branches
      };
      this.saveState();
      return this.state.institutes[existingIdx];
    } else {
      this.state.institutes.push(inst);
      this.saveState();
      return inst;
    }
  }

  public upsertCourse(course: Course): { course: Course; isNew: boolean; changedFields: string[] } {
    const existing = this.state.courses.find(
      c => c.id === course.id ||
           (c.sourceUrl && course.sourceUrl && c.sourceUrl === course.sourceUrl) ||
           (c.slug && course.slug && c.slug === course.slug && c.instituteId === course.instituteId) ||
           (c.code && course.code && c.code === course.code && c.instituteId === course.instituteId)
    );

    if (!existing) {
      this.state.courses.push(course);
      this.saveState();
      return { course, isNew: true, changedFields: [] };
    }

    const changedFields: string[] = [];

    // Compare fields and detect changes
    if (course.fee !== undefined && course.fee !== existing.fee) {
      changedFields.push('fee');
    }
    if (course.feeAmount !== undefined && course.feeAmount !== existing.feeAmount) {
      changedFields.push('feeAmount');
    }
    if (course.durationMonths !== undefined && course.durationMonths !== existing.durationMonths) {
      changedFields.push('durationMonths');
    }
    if (course.duration && course.duration !== existing.duration) {
      changedFields.push('duration');
    }
    if (course.nextBatchDate !== undefined && course.nextBatchDate !== existing.nextBatchDate) {
      changedFields.push('nextBatchDate');
    }
    if (course.contentHash && course.contentHash !== existing.contentHash) {
      changedFields.push('contentHash');
    }

    // Merge non-destructively: only overwrite fields if course has valid non-empty values
    if (course.name) existing.name = course.name;
    if (course.title) existing.title = course.title;
    if (course.slug) existing.slug = course.slug;
    if (course.description) existing.description = course.description;
    if (course.category) existing.category = course.category;
    if (course.fee !== undefined && course.fee > 0) existing.fee = course.fee;
    if (course.feeAmount !== undefined && course.feeAmount > 0) existing.feeAmount = course.feeAmount;
    if (course.feeDisplay) existing.feeDisplay = course.feeDisplay;
    if (course.feeType) existing.feeType = course.feeType;
    if (course.currency) existing.currency = course.currency;
    if (course.emiAvailable !== undefined) existing.emiAvailable = course.emiAvailable;
    if (course.duration) existing.duration = course.duration;
    if (course.durationMonths !== undefined) existing.durationMonths = course.durationMonths;
    if (course.durationWeeks !== undefined) existing.durationWeeks = course.durationWeeks;
    if (course.nextBatchDate !== undefined) existing.nextBatchDate = course.nextBatchDate;
    if (course.eligibility) existing.eligibility = course.eligibility;
    if (course.deliveryModes?.length) existing.deliveryModes = course.deliveryModes;
    if (course.technologies?.length) existing.technologies = course.technologies;
    if (course.curriculumModules?.length) existing.curriculumModules = course.curriculumModules;
    if (course.projects?.length) existing.projects = course.projects;
    if (course.roles?.length) existing.roles = course.roles;
    if (course.highlights?.length) existing.highlights = course.highlights;
    if (course.publishedSalaryRange !== undefined) existing.publishedSalaryRange = course.publishedSalaryRange;
    if (course.placementDisclaimer) existing.placementDisclaimer = course.placementDisclaimer;
    if (course.prerequisites?.length) existing.prerequisites = course.prerequisites;
    if (course.faqs?.length) existing.faqs = course.faqs;
    if (course.sourceUrl) existing.sourceUrl = course.sourceUrl;
    if (course.contentHash) existing.contentHash = course.contentHash;
    if (course.extractionWarnings) existing.extractionWarnings = course.extractionWarnings;

    existing.lastFetchedAt = course.lastFetchedAt || new Date().toISOString();
    if (course.verificationStatus) existing.verificationStatus = course.verificationStatus;

    this.saveState();
    return { course: existing, isNew: false, changedFields };
  }

  public getScrapeRuns(instituteId?: string): ScrapeRun[] {
    const runs = this.state.scrapeRuns || [];
    const filtered = instituteId ? runs.filter(r => r.instituteId === instituteId) : runs;
    return [...filtered].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  public addScrapeRun(run: ScrapeRun): void {
    if (!this.state.scrapeRuns) this.state.scrapeRuns = [];
    this.state.scrapeRuns.push(run);
    this.saveState();
  }

  public getKnowledgeConflicts(instituteId?: string, status?: 'pending' | 'resolved'): KnowledgeConflict[] {
    let conflicts = this.state.knowledgeConflicts || [];
    if (instituteId) conflicts = conflicts.filter(c => c.instituteId === instituteId);
    if (status) conflicts = conflicts.filter(c => c.status === status);
    return [...conflicts].sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }

  public addKnowledgeConflict(conflict: KnowledgeConflict): void {
    if (!this.state.knowledgeConflicts) this.state.knowledgeConflicts = [];
    this.state.knowledgeConflicts.push(conflict);
    this.saveState();
  }

  public resolveKnowledgeConflict(id: string, notes: string, resolvedBy = 'Admin'): boolean {
    const conflict = (this.state.knowledgeConflicts || []).find(c => c.id === id);
    if (!conflict) return false;
    conflict.status = 'resolved';
    conflict.resolutionNotes = notes;
    conflict.resolvedAt = new Date().toISOString();
    conflict.resolvedBy = resolvedBy;
    this.saveState();
    return true;
  }

  public getKnowledgeDocuments(instituteId?: string): KnowledgeDocument[] {
    const docs = this.state.knowledgeDocuments || [];
    if (!instituteId) return docs;
    return docs.filter(d => d.instituteId === instituteId);
  }

  public saveKnowledgeDocument(doc: KnowledgeDocument): void {
    if (!this.state.knowledgeDocuments) this.state.knowledgeDocuments = [];
    const idx = this.state.knowledgeDocuments.findIndex(d => d.url === doc.url && d.instituteId === doc.instituteId);
    if (idx !== -1) {
      this.state.knowledgeDocuments[idx] = doc;
    } else {
      this.state.knowledgeDocuments.push(doc);
    }
    this.saveState();
  }

  public verifyCourse(courseId: string, verifiedBy = 'Admin'): boolean {
    const course = this.getCourseById(courseId);
    if (!course) return false;
    course.verificationStatus = 'verified';
    course.lastVerifiedAt = new Date().toISOString();
    this.saveState();
    return true;
  }

  public updateCourseField(courseId: string, field: string, value: any, auditNotes?: string): boolean {
    const course = this.getCourseById(courseId);
    if (!course) return false;
    (course as any)[field] = value;
    course.lastVerifiedAt = new Date().toISOString();
    course.verificationStatus = 'verified';
    this.saveState();
    return true;
  }
}

export const db = new EnrolixDatabase();
