export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface AuditIssue {
  id: string;
  fileName: string;
  line: number;
  issue: string;
  severity: Severity;
  category: 'Security' | 'Code Quality' | 'TypeScript' | 'Bob Constraints' | 'Performance' | 'Architecture' | 'Testing';
  ruleId: string;
  suggestion: string;
  snippet?: string;
}

export interface StandardRule {
  id: string;
  title: string;
  category: 'Security' | 'Code Quality' | 'TypeScript' | 'Bob Constraints' | 'Architecture' | 'Testing';
  severity: Severity;
  description: string;
  bobDirective: string;
  enabled: boolean;
  timesPrevented: number;
  addedDate: string;
}

export interface MistakeLogEntry {
  id: string;
  title: string;
  category: 'Code Hallucination' | 'Breaking Change' | 'Missing Validation' | 'Type Error' | 'Architecture Drift' | 'Dropped Context';
  severity: Severity;
  sessionRef: string;
  detectedAt: string;
  bobPrompt: string;
  errantBehavior: string;
  expectedBehavior: string;
  mitigationRuleId?: string;
  mitigationRuleTitle?: string;
  timesAvoidedSince: number;
  status: 'Injected in Rules' | 'Under Review' | 'Resolved';
}

export interface BobSession {
  id: string;
  taskTitle: string;
  developer: string;
  branch: string;
  startedAt: string;
  durationMinutes: number;
  status: 'Active' | 'Completed' | 'Flagged';
  rulesEnforcedCount: number;
  mistakesPreventedCount: number;
  targetFiles: string[];
  summary: string;
  logs: {
    time: string;
    type: 'prompt' | 'bob_action' | 'blueprint_check' | 'correction' | 'info';
    text: string;
  }[];
}

export interface ActivityItem {
  id: string;
  type: 'audit' | 'mistake_logged' | 'rule_updated' | 'session_finished';
  title: string;
  detail: string;
  timestamp: string;
  badge?: string;
}

export interface RepoConfig {
  repoUrl: string;
  repoName: string;
  branch: string;
  lastScanned: string;
  bobVersion: string;
  injectionMode: 'Strict Invariant' | 'Advisory Guide' | 'Auto-Remediate';
}
