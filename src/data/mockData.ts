import { AuditIssue, StandardRule, MistakeLogEntry, BobSession, ActivityItem, RepoConfig } from '../types';

export const initialRepoConfig: RepoConfig = {
  repoUrl: 'https://github.com/ibm/watsonx-code-assistant-kit',
  repoName: 'ibm/watsonx-code-assistant-kit',
  branch: 'main',
  lastScanned: '2026-09-24 07:15',
  bobVersion: 'IBM Bob v3.2-enterprise (Granite 34B Code)',
  injectionMode: 'Strict Invariant'
};

export const sampleRepos = [
  { name: 'ibm/watsonx-code-assistant-kit', url: 'https://github.com/ibm/watsonx-code-assistant-kit', branch: 'main' },
  { name: 'carbon-design-system/carbon', url: 'https://github.com/carbon-design-system/carbon', branch: 'main' },
  { name: 'ibm-cloud/cloud-operators', url: 'https://github.com/ibm-cloud/cloud-operators', branch: 'release-v2' },
  { name: 'expressjs/express', url: 'https://github.com/expressjs/express', branch: 'master' }
];

export const initialRules: StandardRule[] = [
  {
    id: 'BOB-DIR-01',
    title: 'Atomic File Edits with Dry-Run Verification',
    category: 'Bob Constraints',
    severity: 'Critical',
    description: 'Ensure IBM Bob emits full replacement blocks or targeted diffs rather than truncated comment placeholders like /* ...rest of code... */.',
    bobDirective: 'NEVER truncate existing files with placeholders like /* ...keep existing code... */ or TODO stubs. Always write complete, syntax-validated AST-compliant code blocks.',
    enabled: true,
    timesPrevented: 42,
    addedDate: '2026-08-10'
  },
  {
    id: 'SEC-ENV-02',
    title: 'No Hardcoded Secrets or Cloud Credentials',
    category: 'Security',
    severity: 'Critical',
    description: 'Prevent agent from introducing raw API tokens, IBM Cloud IAM keys, or bearer tokens into test fixtures or code files.',
    bobDirective: 'All API keys, secrets, and auth tokens MUST be loaded strictly via environment variables (process.env) or secrets manager. Never embed plaintext credentials.',
    enabled: true,
    timesPrevented: 19,
    addedDate: '2026-08-12'
  },
  {
    id: 'TS-STRICT-04',
    title: 'Explicit TypeScript Return Types on Public APIs',
    category: 'TypeScript',
    severity: 'Medium',
    description: 'Require explicit return type annotations on exported functions and service methods to prevent unintended `any` inference.',
    bobDirective: 'All exported functions, service handlers, and API router methods must declare explicit return types. Avoid implicit `any` or loose generic inference.',
    enabled: true,
    timesPrevented: 35,
    addedDate: '2026-08-15'
  },
  {
    id: 'ERR-ASYNC-03',
    title: 'Safe Async Streaming & Error Boundaries',
    category: 'Code Quality',
    severity: 'High',
    description: 'Prevent unhandled promise rejections and zombie stream listeners when Bob generates WebSocket or SSE streaming consumers.',
    bobDirective: 'Always attach error listeners and abort signal handlers (AbortController.signal) to streaming HTTP clients or LLM inference loops.',
    enabled: true,
    timesPrevented: 27,
    addedDate: '2026-08-22'
  },
  {
    id: 'BOB-LIC-05',
    title: 'Preserve License Headers and Notice Blocks',
    category: 'Bob Constraints',
    severity: 'High',
    description: 'Bob frequently forgets Apache-2.0 or IBM copyright header comments when modifying or recreating source files.',
    bobDirective: 'Preserve any existing Apache-2.0, SPDX-License-Identifier, or copyright comment headers at the top of modified files verbatim.',
    enabled: true,
    timesPrevented: 53,
    addedDate: '2026-09-01'
  },
  {
    id: 'TEST-COV-06',
    title: 'Mandatory Unit Test Assertion for New Endpoints',
    category: 'Testing',
    severity: 'Medium',
    description: 'Whenever Bob adds or modifies an API route, a corresponding test file in `tests/` must be generated or updated.',
    bobDirective: 'When introducing or updating any route controller or public utility, pair it with unit test coverage using Vitest/Jest covering both happy-path and error cases.',
    enabled: true,
    timesPrevented: 14,
    addedDate: '2026-09-08'
  },
  {
    id: 'ARCH-MOD-07',
    title: 'Circular Dependency Prohibition in Service Layers',
    category: 'Architecture',
    severity: 'High',
    description: 'Ensure service layer modules do not import controllers or UI presentation layer components.',
    bobDirective: 'Strict layered architecture: models < services < controllers < presentation. Never allow backward imports from services into presentation layer.',
    enabled: true,
    timesPrevented: 8,
    addedDate: '2026-09-14'
  }
];

export const initialAuditIssues: AuditIssue[] = [
  {
    id: 'AUD-001',
    fileName: 'src/services/watsonxClient.ts',
    line: 142,
    issue: 'Unbounded retry loop without exponential backoff in streaming inference handler',
    severity: 'High',
    category: 'Code Quality',
    ruleId: 'ERR-ASYNC-03',
    suggestion: 'Wrap stream listener in AbortController signal and cap retry attempts at 3 with jitter backoff.',
    snippet: `for (let attempt = 0; ; attempt++) {\n  try {\n    return await streamInference(prompt);\n  } catch (e) { /* unbounded */ }\n}`
  },
  {
    id: 'AUD-002',
    fileName: 'src/config/iamAuth.ts',
    line: 45,
    issue: 'Potential fallback to hardcoded mock IAM API key in production path',
    severity: 'Critical',
    category: 'Security',
    ruleId: 'SEC-ENV-02',
    suggestion: 'Throw a configuration error if process.env.IBM_IAM_API_KEY is undefined instead of defaulting to a static fallback string.',
    snippet: `const apiKey = process.env.IBM_IAM_API_KEY || "fallback_mock_ibm_key_2026";`
  },
  {
    id: 'AUD-003',
    fileName: 'src/routes/assistantRouter.ts',
    line: 88,
    issue: 'Exported route handler missing explicit TypeScript return type annotation',
    severity: 'Medium',
    category: 'TypeScript',
    ruleId: 'TS-STRICT-04',
    suggestion: 'Annotate handler with Promise<Response<AssistantResult>> to enforce contract.',
    snippet: `export async function handleAgentDispatch(req: Request) {\n  return executeBobTask(req.body);\n}`
  },
  {
    id: 'AUD-004',
    fileName: 'src/utils/textTransform.ts',
    line: 1,
    issue: 'Missing SPDX license header block after agent rewrite',
    severity: 'High',
    category: 'Bob Constraints',
    ruleId: 'BOB-LIC-05',
    suggestion: 'Add Apache-2.0 SPDX header at line 1 as required by repository standards.',
    snippet: `// Notice: File rewritten without original license block`
  },
  {
    id: 'AUD-005',
    fileName: 'src/db/connectionPool.ts',
    line: 67,
    issue: 'Database connection pool timeout set to 0 (infinite wait on leak)',
    severity: 'Medium',
    category: 'Code Quality',
    ruleId: 'ERR-ASYNC-03',
    suggestion: 'Configure explicit acquireTimeoutMillis: 10000 and idleTimeoutMillis: 30000.',
    snippet: `const pool = new Pool({ max: 20, acquireTimeout: 0 });`
  },
  {
    id: 'AUD-006',
    fileName: 'src/components/PromptEditor.tsx',
    line: 112,
    issue: 'Direct import of backend auth service inside UI component (violates layer boundary)',
    severity: 'Low',
    category: 'Architecture',
    ruleId: 'ARCH-MOD-07',
    suggestion: 'Use client API proxy /api/auth/token rather than importing server-side credential service.',
    snippet: `import { authenticateIamService } from '@/services/iamAuth';`
  },
  {
    id: 'AUD-007',
    fileName: 'src/controllers/metricsController.ts',
    line: 34,
    issue: 'Missing test suite for newly generated Prometheus metrics exporter endpoint',
    severity: 'Medium',
    category: 'Testing',
    ruleId: 'TEST-COV-06',
    suggestion: 'Generate tests/controllers/metricsController.test.ts verifying status 200 response format.',
    snippet: `export const getMetrics = (req: Request, res: Response) => { ... }`
  }
];

export const initialMistakes: MistakeLogEntry[] = [
  {
    id: 'MST-2026-089',
    title: 'Inserted placeholder comments instead of full component implementation',
    category: 'Code Hallucination',
    severity: 'High',
    sessionRef: 'SES-941 (Feature: Token Metering)',
    detectedAt: '2026-09-23 16:40',
    bobPrompt: 'Refactor TokenMeteringPanel to show quota thresholds and usage telemetry.',
    errantBehavior: 'Bob replaced 120 lines of table logic with `// ... existing methods ...` and left the component non-functional.',
    expectedBehavior: 'Bob must perform atomic, intact file modifications without omitting existing production methods.',
    mitigationRuleId: 'BOB-DIR-01',
    mitigationRuleTitle: 'Atomic File Edits with Dry-Run Verification',
    timesAvoidedSince: 14,
    status: 'Injected in Rules'
  },
  {
    id: 'MST-2026-088',
    title: 'Generated hardcoded test credentials in integration fixture',
    category: 'Breaking Change',
    severity: 'Critical',
    sessionRef: 'SES-938 (Setup: Granite Test Fixtures)',
    detectedAt: '2026-09-22 11:15',
    bobPrompt: 'Write an automated integration test for IBM Watsonx chat completions.',
    errantBehavior: 'Bob committed a sample live API key `ibm-live-key-4a92c...` directly inside `test/fixtures/client.ts`.',
    expectedBehavior: 'Fixtures must mock network calls or rely on `process.env.TEST_API_KEY` with dummy values.',
    mitigationRuleId: 'SEC-ENV-02',
    mitigationRuleTitle: 'No Hardcoded Secrets or Cloud Credentials',
    timesAvoidedSince: 19,
    status: 'Injected in Rules'
  },
  {
    id: 'MST-2026-087',
    title: 'Wiped Apache 2.0 license notice from 3 updated files',
    category: 'Dropped Context',
    severity: 'Medium',
    sessionRef: 'SES-932 (Cleanup: Linting pass)',
    detectedAt: '2026-09-20 14:02',
    bobPrompt: 'Run linter fixes on all helper utilities in src/utils.',
    errantBehavior: 'Stripped the copyright preamble block when reformatting files.',
    expectedBehavior: 'License headers must be preserved untouched across AST transforms.',
    mitigationRuleId: 'BOB-LIC-05',
    mitigationRuleTitle: 'Preserve License Headers and Notice Blocks',
    timesAvoidedSince: 22,
    status: 'Injected in Rules'
  },
  {
    id: 'MST-2026-086',
    title: 'Omitted catch block on WebSocket message stream',
    category: 'Missing Validation',
    severity: 'High',
    sessionRef: 'SES-929 (Realtime: Stream Consumer)',
    detectedAt: '2026-09-18 09:20',
    bobPrompt: 'Implement WebSocket listener for incoming Bob session output.',
    errantBehavior: 'Created event listener without onError handler, resulting in uncaught socket drop.',
    expectedBehavior: 'Every streaming socket connection requires onError, onClose, and exponential reconnect.',
    mitigationRuleId: 'ERR-ASYNC-03',
    mitigationRuleTitle: 'Safe Async Streaming & Error Boundaries',
    timesAvoidedSince: 9,
    status: 'Injected in Rules'
  },
  {
    id: 'MST-2026-085',
    title: 'Imported server-only crypto module into client-side Vite bundle',
    category: 'Architecture Drift',
    severity: 'Medium',
    sessionRef: 'SES-924 (Frontend: Hash Generator)',
    detectedAt: '2026-09-16 18:30',
    bobPrompt: 'Generate client-side hash verification for uploaded blueprint schemas.',
    errantBehavior: "Imported Node.js native `crypto` module into React component, breaking browser compilation.",
    expectedBehavior: 'Use browser Web Crypto API `window.crypto.subtle` for frontend cryptographic operations.',
    mitigationRuleId: 'ARCH-MOD-07',
    mitigationRuleTitle: 'Circular Dependency & Boundary Prohibition',
    timesAvoidedSince: 7,
    status: 'Injected in Rules'
  }
];

export const initialSessions: BobSession[] = [
  {
    id: 'SES-942',
    taskTitle: 'Refactor Granular Streaming Client & Add Abort Signal',
    developer: 'Alex Chen (Staff Platform Engineer)',
    branch: 'feat/streaming-abort-guard',
    startedAt: '2026-09-24 06:45',
    durationMinutes: 32,
    status: 'Active',
    rulesEnforcedCount: 7,
    mistakesPreventedCount: 3,
    targetFiles: ['src/services/watsonxClient.ts', 'src/types/stream.ts'],
    summary: 'Bob is executing step 2 of 4: restructuring chunk parser. Blueprint rule BOB-DIR-01 injected into active prompt context.',
    logs: [
      { time: '06:45:12', type: 'prompt', text: 'Task started: Implement AbortSignal propagation across streaming client.' },
      { time: '06:46:04', type: 'info', text: 'Blueprint rules file injected (7 active rules, 3 critical constraints).' },
      { time: '06:51:20', type: 'bob_action', text: 'Bob generated initial patch for src/services/watsonxClient.ts.' },
      { time: '06:51:22', type: 'blueprint_check', text: 'Blueprint intercepted potential placeholder comment on line 84.' },
      { time: '06:51:25', type: 'correction', text: 'Bob auto-corrected: regenerated full atomic method body adhering to BOB-DIR-01.' }
    ]
  },
  {
    id: 'SES-941',
    taskTitle: 'Feature: Token Metering & Quota Enforcement',
    developer: 'Sarah Jenkins (Senior Backend Dev)',
    branch: 'feat/metering-quota',
    startedAt: '2026-09-23 15:30',
    durationMinutes: 78,
    status: 'Completed',
    rulesEnforcedCount: 7,
    mistakesPreventedCount: 4,
    targetFiles: ['src/services/metering.ts', 'src/routes/quota.ts', 'tests/metering.test.ts'],
    summary: 'Successfully finished. Bob generated unit tests adhering to TEST-COV-06 after initial nudge from Blueprint.',
    logs: [
      { time: '15:30:00', type: 'prompt', text: 'Task started: Add quota enforcement middleware.' },
      { time: '15:45:10', type: 'blueprint_check', text: 'Missing return type on handleQuotaExceeded route handler.' },
      { time: '15:46:00', type: 'correction', text: 'Bob added Promise<Response<QuotaStatus>> as per TS-STRICT-04.' },
      { time: '16:48:00', type: 'info', text: 'All 7 Blueprint standards passed. PR #319 ready.' }
    ]
  },
  {
    id: 'SES-940',
    taskTitle: 'Database Connection Pool Optimization',
    developer: 'Marcus Vance (Infra Lead)',
    branch: 'fix/pool-timeouts',
    startedAt: '2026-09-23 10:12',
    durationMinutes: 45,
    status: 'Completed',
    rulesEnforcedCount: 6,
    mistakesPreventedCount: 2,
    targetFiles: ['src/db/connectionPool.ts'],
    summary: 'Configured connection pool thresholds and added graceful shutdown handlers.',
    logs: [
      { time: '10:12:00', type: 'prompt', text: 'Update Postgres connection pool with explicit acquire timeouts.' },
      { time: '10:35:14', type: 'blueprint_check', text: 'Checked pool options against ERR-ASYNC-03.' },
      { time: '10:57:00', type: 'info', text: 'Session verified and merged.' }
    ]
  },
  {
    id: 'SES-939',
    taskTitle: 'Auto-Generate Prometheus Metrics Exporter',
    developer: 'Elena Rostova (DevOps)',
    branch: 'feat/prometheus-metrics',
    startedAt: '2026-09-22 17:05',
    durationMinutes: 52,
    status: 'Flagged',
    rulesEnforcedCount: 7,
    mistakesPreventedCount: 1,
    targetFiles: ['src/controllers/metricsController.ts'],
    summary: 'Flagged by audit: Bob created controller without corresponding test suite (TEST-COV-06 violation).',
    logs: [
      { time: '17:05:00', type: 'prompt', text: 'Add /metrics endpoint for Prometheus scrapers.' },
      { time: '17:34:00', type: 'blueprint_check', text: 'Warning: New endpoint created with 0 test assertions.' },
      { time: '17:57:00', type: 'info', text: 'PR flagged for manual developer review.' }
    ]
  }
];

export const initialActivities: ActivityItem[] = [
  {
    id: 'ACT-001',
    type: 'session_finished',
    title: 'Bob Session Completed: Quota Metering',
    detail: '4 potential mistakes intercepted before commit in branch feat/metering-quota.',
    timestamp: '1 hour ago'
  },
  {
    id: 'ACT-002',
    type: 'rule_updated',
    title: 'Blueprint Rule Updated: BOB-DIR-01',
    detail: 'Enforced stricter AST replacement invariant across all active Bob prompts.',
    timestamp: '3 hours ago'
  },
  {
    id: 'ACT-003',
    type: 'mistake_logged',
    title: 'New Mistake Logged: MST-2026-089',
    detail: 'Placeholder comments detected in TokenMeteringPanel refactor.',
    timestamp: 'Yesterday at 16:40'
  },
  {
    id: 'ACT-004',
    type: 'audit',
    title: 'Repository Audit Completed',
    detail: 'Scanned 148 files in ibm/watsonx-code-assistant-kit: 7 issues found.',
    timestamp: 'Yesterday at 07:15'
  }
];
