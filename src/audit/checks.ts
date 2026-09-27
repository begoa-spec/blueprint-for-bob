import { AuditIssue } from '../types';

export interface CheckDefinition {
  ruleId: string;
  category: AuditIssue['category'];
  severity: AuditIssue['severity'];
  issue: string;
  suggestion: string;
  // Regex tested against each line. Use a capturing group if you want the
  // matched text surfaced in the snippet; otherwise the whole line is used.
  pattern: RegExp;
  // Optional: only run this check on files whose path matches this regex.
  fileFilter?: RegExp;
}

// Each check is intentionally line-based and dependency-free so it runs
// instantly in the browser with no build step or AST parser required.
// This trades some precision (false positives are possible) for speed and
// transparency during a live demo — every hit points at a real line.
export const CHECKS: CheckDefinition[] = [
  {
    ruleId: 'SEC-ENV-02',
    category: 'Security',
    severity: 'Critical',
    issue: 'Possible hardcoded secret or API key',
    suggestion:
      'Move the value into an environment variable (process.env) or a secrets manager. Never commit plaintext credentials.',
    pattern:
      /(api[_-]?key|secret|token|password|bearer)\s*[:=]\s*['"][a-zA-Z0-9_\-]{12,}['"]/i
  },
  {
    ruleId: 'BOB-DIR-01',
    category: 'Bob Constraints',
    severity: 'Critical',
    issue: 'Truncated code placeholder left in file',
    suggestion:
      'Replace the placeholder with the full, syntax-valid implementation. Bob must never leave `...rest of code...` or similar stubs behind.',
    pattern: /\/\*\s*\.\.\.\s*(rest of code|existing code)\s*\.\.\.\s*\*\//i
  },
  {
    ruleId: 'QA-TODO-05',
    category: 'Code Quality',
    severity: 'Low',
    issue: 'Unresolved TODO / FIXME left in shipped code',
    suggestion: 'Resolve the TODO before merging, or convert it into a tracked issue.',
    pattern: /\/\/\s*(TODO|FIXME)\b/
  },
  {
    ruleId: 'QA-CONSOLE-06',
    category: 'Code Quality',
    severity: 'Low',
    issue: 'console.log left in production code',
    suggestion: 'Remove debug logging or replace it with a proper logger that respects environment/log level.',
    pattern: /console\.log\(/,
    fileFilter: /\.(ts|tsx|js|jsx)$/
  },
  {
    ruleId: 'ERR-ASYNC-03',
    category: 'Code Quality',
    severity: 'High',
    issue: 'await used without any visible try/catch on this line',
    suggestion:
      'Wrap awaited calls in try/catch (or attach a .catch) so rejected promises are handled instead of crashing the process/unhandled rejection.',
    // Heuristic: flags a bare `await expr();` statement — i.e. the result
    // isn't assigned or returned, which is the classic fire-and-forget case
    // where a rejected promise has nowhere to be caught. Assignments like
    // `const x = await foo()` are the normal, usually-handled form and are
    // intentionally excluded to avoid flagging nearly every await in the codebase.
    pattern: /^\s*await\s+[\w.$]+\([^)]*\)\s*;?\s*$/,
    fileFilter: /\.(ts|tsx|js|jsx)$/
  },
  {
    ruleId: 'TS-STRICT-04',
    category: 'TypeScript',
    severity: 'Medium',
    issue: "Explicit 'any' type used",
    suggestion: 'Replace `any` with a concrete type or `unknown` plus a type guard.',
    pattern: /:\s*any\b/,
    fileFilter: /\.(ts|tsx)$/
  },
  {
    ruleId: 'SEC-INJECT-07',
    category: 'Security',
    severity: 'High',
    issue: 'Potential SQL built via string concatenation',
    suggestion: 'Use parameterized queries / a query builder instead of concatenating user input into SQL strings.',
    pattern: /(SELECT|INSERT|UPDATE|DELETE)\s.*['"]\s*\+/i
  },
  {
    ruleId: 'ARCH-DIRECT-08',
    category: 'Architecture',
    severity: 'Medium',
    issue: 'Direct fetch() call inside a UI component',
    suggestion: 'Move network calls into a dedicated data/service layer so components stay presentational and testable.',
    pattern: /\bfetch\(/,
    fileFilter: /components\/.*\.(tsx|jsx)$/
  }
];

// File-level (not line-level) heuristic: a source file with no sibling/nearby
// test file at all. Handled separately in auditEngine.ts since it needs the
// full file list, not a single file's lines.
export const TEST_MISSING_RULE = {
  ruleId: 'TEST-MISSING-09',
  category: 'Testing' as const,
  severity: 'Low' as const,
  issue: 'No matching test file found for this source file',
  suggestion: 'Add a test file (e.g. *.test.ts or __tests__/*) covering this module.'
};
