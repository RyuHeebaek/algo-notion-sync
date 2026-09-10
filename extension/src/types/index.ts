export type SiteType = 'SWEA' | 'JUNGOL' | 'BOJ';

export interface ProblemMeta {
  site: SiteType;
  problemId: string;
  title: string;
  difficulty?: string; // e.g., 'D3', '중급', '골드 V'
  tags: string[];      // Algorithm tags, e.g., ['DFS', 'Graph']
  problemUrl: string;
}

export interface SubmissionMeta extends ProblemMeta {
  submissionId?: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Runtime Error' | 'Compilation Error' | 'Submitted';
  language?: string;   // e.g., 'Python3', 'Java', 'C++'
  submittedAt: string; // ISO 8601 string or formatted string
  code?: string;       // Source code if available
  memory?: string;     // e.g., '256KB'
  runtime?: string;    // e.g., '120ms'
}

export interface NotionDatabase {
  id: string;
  title: string;
}

export interface UserSettings {
  notionToken?: string;
  selectedDatabaseId?: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  lastSyncStatus?: 'success' | 'error' | 'idle';
  lastSyncMessage?: string;
}

export interface SiteLoginStatus {
  site: SiteType;
  isLoggedIn: boolean;
  username?: string;
}
