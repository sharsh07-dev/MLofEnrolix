const fs = require('fs');
const path = require('path');

const dbStatePath = path.join(__dirname, '../src/db/mock_db_state.json');
const data = JSON.parse(fs.readFileSync(dbStatePath, 'utf8'));

const tsContent = `import { Institute, Course, Lead, User, FollowUpTask, DuplicateCandidate, Conversation } from './types';

export const SEED_INSTITUTES: Institute[] = ${JSON.stringify(data.institutes, null, 2)};

export const SEED_USERS: User[] = ${JSON.stringify(data.users, null, 2)};

export const SEED_COURSES: Course[] = ${JSON.stringify(data.courses, null, 2)};

export const SEED_LEADS: Lead[] = ${JSON.stringify(data.leads, null, 2)};

export const SEED_CONVERSATIONS: Record<string, Conversation> = ${JSON.stringify(data.conversations, null, 2)};

export const SEED_FOLLOWUPS: FollowUpTask[] = ${JSON.stringify(data.followUps, null, 2)};

export const SEED_DUPLICATES: DuplicateCandidate[] = ${JSON.stringify(data.duplicates, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/db/seedData.ts'), tsContent, 'utf8');
console.log('Successfully generated clean seedData.ts with TechSummitTrainers data only!');
