import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Bot,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  FileCode2,
  Clock,
  Zap,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { StandardRule, MistakeLogEntry, BobSession, ActivityItem, RepoConfig, AuditIssue, Severity } from '../types';

interface DashboardViewProps {
  rules: StandardRule[];
  mistakes: MistakeLogEntry[];
  sessions: BobSession[];
  activities: ActivityItem[];
  repoConfig: RepoConfig;
  auditIssues: AuditIssue[];
  onNavigate: (tab: string) => void;
  onOpenExport: () => void;
  onOpenHandover: () => void;
  onOpenAddMistake: () => void;
}

const SEVERITY_PENALTY: Record<Severity, number> = {
  Critical: 40,
  High: 20,
  Medium: 8,
  Low: 2
};

interface SeverityScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  counts: Record<Severity, number>;
}

function computeSeverityScore(issues: AuditIssue[]): SeverityScore {
  const counts: Record<Severity, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  let penalty = 0;
  issues.forEach((issue) => {
    counts[issue.severity] += 1;
    penalty += SEVERITY_PENALTY[issue.severity];
  });
  const score = Math.max(0, 100 - penalty);

  let grade: SeverityScore['grade'];
  let color: string;
  if (score >= 90) {
    grade = 'A';
    color = '#5bc8af';
  } else if (score >= 75) {
    grade = 'B';
    color = '#8fd6c4';
  } else if (score >= 60) {
    grade = 'C';
    color = '#f2a63a';
  } else if (score >= 45) {
    grade = 'D';
    color = '#e0762e';
  } else {
    grade = 'F';
    color = '#e05252';
  }

  return { score, grade, color, counts };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  rules,
  mistakes,
  sessions,
  activities,
  repoConfig,
  auditIssues,
  onNavigate,
  onOpenExport,
  onOpenHandover,
  onOpenAddMistake
}) => {
  // Compute metrics
  const activeRules = rules.filter((r) => r.enabled);
  const totalPrevented = rules.reduce((acc, curr) => acc + curr.timesPrevented, 0);
  const activeSessions = sessions.filter((s) => s.status === 'Active');
  const mistakesThisWeek = mistakes.length; // e.g. 5
  const complianceScore = 86; // calculated score out of 100
  const severity = computeSeverityScore(auditIssues);

  return (
    <div className="space-y-6">
      {/* Header section with repo context and quick actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#283a62]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Developer Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enforcing coding standards and tracking agent deviations across{' '}
            <span className="text-[#5bc8af] font-mono">{repoConfig.repoName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('repo-audit')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#213357] hover:bg-[#283d66] border border-[#2e4370] rounded-md transition-colors"
          >
            Run Repo Audit
          </button>
          <button
            onClick={onOpenAddMistake}
            className="px-3.5 py-2 text-xs font-semibold text-[#1c2b4a] bg-[#f2a63a] hover:bg-[#e09328] rounded-md transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Log Bob Mistake</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Standards compliance score */}
        <div className="bg-[#16223b] border border-[#283a62] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Standards compliance score
            </span>
            <span className="text-xs font-mono text-[#5bc8af] flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +6% this sprint
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-bold font-mono tracking-tight text-white tabular-nums">
              {complianceScore}%
            </span>
            <span className="text-xs text-slate-400">
              {activeRules.length} active rules enforced
            </span>
          </div>

          {/* Simple progress bar */}
          <div className="mt-4 w-full bg-[#1c2b4a] h-2 rounded-full overflow-hidden border border-[#283a62]">
            <div
              className="bg-[#5bc8af] h-full rounded-full transition-all duration-500"
              style={{ width: `${complianceScore}%` }}
            ></div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#283a62]/60 flex items-center justify-between text-xs text-slate-400">
            <span>Critical rules met: 100%</span>
            <button
              onClick={() => onNavigate('standards')}
              className="text-[#5bc8af] hover:underline font-medium"
            >
              View standards
            </button>
          </div>
        </div>

        {/* Card 2: Mistakes this week */}
        <div className="bg-[#16223b] border border-[#283a62] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Mistakes this week
            </span>
            <span className="text-xs font-mono text-[#5bc8af] flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" /> -28% vs last week
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-bold font-mono tracking-tight text-white tabular-nums">
              {mistakesThisWeek}
            </span>
            <span className="text-xs text-slate-400">
              {totalPrevented} avoided via Blueprint rules
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#f2a63a]"></span>
              <span>1 under review</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#5bc8af]"></span>
              <span>4 injected in rules</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#283a62]/60 flex items-center justify-between text-xs text-slate-400">
            <span>Recent: MST-2026-089</span>
            <button
              onClick={() => onNavigate('mistake-log')}
              className="text-[#f2a63a] hover:underline font-medium"
            >
              View mistake log
            </button>
          </div>
        </div>

        {/* Card 3: Active sessions */}
        <div className="bg-[#16223b] border border-[#283a62] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Active sessions
            </span>
            <span className="text-xs font-mono text-slate-300">
              Granite 34B Code
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-bold font-mono tracking-tight text-white tabular-nums">
              {activeSessions.length}
            </span>
            <span className="text-xs text-slate-400">
              currently coding in branch <span className="font-mono text-slate-300">feat/streaming-abort-guard</span>
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[#5bc8af] font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">3 potential hallucinations blocked today</span>
          </div>

          <div className="mt-3 pt-3 border-t border-[#283a62]/60 flex items-center justify-between text-xs text-slate-400">
            <span>Total sessions: {sessions.length}</span>
            <button
              onClick={() => onNavigate('bob-sessions')}
              className="text-[#5bc8af] hover:underline font-medium"
            >
              Inspect live session
            </button>
          </div>
        </div>

        {/* Card 4: Audit severity score */}
        <div className="bg-[#16223b] border border-[#283a62] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Audit severity score
            </span>
            <span className="text-xs font-mono tabular-nums" style={{ color: severity.color }}>
              Grade {severity.grade}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-bold font-mono tracking-tight tabular-nums" style={{ color: severity.color }}>
              {severity.score}
            </span>
            <span className="text-xs text-slate-400">
              from {auditIssues.length} open audit issue{auditIssues.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#e05252]"></span>
              <span>{severity.counts.Critical} critical</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#e0762e]"></span>
              <span>{severity.counts.High} high</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#f2a63a]"></span>
              <span>{severity.counts.Medium} medium</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#5bc8af]"></span>
              <span>{severity.counts.Low} low</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#283a62]/60 flex items-center justify-between text-xs text-slate-400">
            <span>100 − weighted penalty</span>
            <button
              onClick={() => onNavigate('repo-audit')}
              className="text-[#5bc8af] hover:underline font-medium"
            >
              View audit issues
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Activity Feed & Avoided Mistakes Blueprint */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Feed */}
        <div className="lg:col-span-2 bg-[#16223b] border border-[#283a62] rounded-lg p-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#283a62]">
            <div>
              <h2 className="text-base font-semibold text-white">Recent Activity Feed</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time rule evaluations, agent interceptions, and audit logs
              </p>
            </div>
            <button
              onClick={() => onNavigate('bob-sessions')}
              className="text-xs text-[#5bc8af] hover:underline flex items-center gap-1 font-medium"
            >
              <span>All sessions</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-[#283a62]/60 mt-2">
            {activities.map((item) => (
              <div key={item.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500 whitespace-nowrap tabular-nums">
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#283a62] flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing 4 most recent events for repository {repoConfig.repoName}
            </span>
            <button
              onClick={() => onNavigate('repo-audit')}
              className="text-xs text-slate-300 hover:text-white underline font-medium"
            >
              Run comprehensive re-audit
            </button>
          </div>
        </div>

        {/* Right Col: High-Impact Bob Guardrails & Quick Export */}
        <div className="space-y-5">
          {/* Top Prevented Hallucinations Box */}
          <div className="bg-[#16223b] border border-[#283a62] rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white mb-2">
              Top Prevented Mistakes
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Historical patterns Bob repeatedly attempted before Blueprint enforced constraints.
            </p>

            <div className="space-y-3">
              {rules.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-md bg-[#1c2b4a] border border-[#283a62]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-[#5bc8af] font-medium">
                      {r.id}
                    </span>
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      {r.timesPrevented} prevented
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-200 line-clamp-1">
                    {r.title}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {r.bobDirective}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('standards')}
              className="mt-4 w-full py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#1c2b4a] hover:bg-[#213357] border border-[#283a62] rounded-md transition-colors text-center"
            >
              Explore all {rules.length} standards
            </button>
          </div>

          {/* Quick Bob Rules Ingestion Card */}
          <div className="bg-[#16223b] border border-[#283a62] rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">Bob Blueprint File</span>
              <span className="text-xs font-mono text-[#5bc8af]">.bobrules</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Export generated rules to commit into your repository root so Bob never repeats historical mistakes.
            </p>

            <button
              onClick={onOpenExport}
              className="w-full py-2.5 px-4 text-xs font-semibold text-[#1c2b4a] bg-[#5bc8af] hover:bg-[#4eb39c] rounded-md transition-colors text-center"
            >
              Download .bobrules file
            </button>
          </div>

          {/* Handover Doc Card */}
          <div className="bg-[#16223b] border border-[#283a62] rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">Handover Report</span>
              <span className="text-xs font-mono text-[#5bc8af]">.md</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Generate a client- or onboarding-ready summary of standards, open issues, and known Bob mistake patterns.
            </p>

            <button
              onClick={onOpenHandover}
              className="w-full py-2.5 px-4 text-xs font-semibold text-[#1c2b4a] bg-[#5bc8af] hover:bg-[#4eb39c] rounded-md transition-colors text-center"
            >
              Generate handover report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
