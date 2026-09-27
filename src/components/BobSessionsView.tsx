import React, { useState } from 'react';
import {
  Bot,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  GitBranch,
  ShieldCheck,
  ChevronRight,
  Terminal,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { BobSession, MistakeLogEntry, StandardRule } from '../types';
import { ImportSessionModal } from './modals/ImportSessionModal';

interface BobSessionsViewProps {
  sessions: BobSession[];
  rules: StandardRule[];
  onNavigateToStandards: () => void;
  onImportSession: (session: BobSession, mistakes: MistakeLogEntry[]) => void;
}

export const BobSessionsView: React.FC<BobSessionsViewProps> = ({
  sessions,
  rules,
  onNavigateToStandards,
  onImportSession
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || '');
  const [promptInput, setPromptInput] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [simulatedOutput, setSimulatedOutput] = useState<{
    injectedRules: string[];
    riskScore: string;
    safeguards: string[];
  } | null>(null);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  const handleSimulatePrompt = () => {
    if (!promptInput.trim()) return;
    const lower = promptInput.toLowerCase();
    const matchedRules: string[] = [];
    const safeguards: string[] = [];

    if (lower.includes('stream') || lower.includes('async') || lower.includes('fetch') || lower.includes('api')) {
      matchedRules.push('ERR-ASYNC-03: Safe Async Streaming & Error Boundaries');
      safeguards.push('Blueprint will inject abort signal requirement and backoff cap.');
    }
    if (lower.includes('auth') || lower.includes('token') || lower.includes('key') || lower.includes('secret')) {
      matchedRules.push('SEC-ENV-02: No Hardcoded Secrets or Cloud Credentials');
      safeguards.push('Blueprint will block any plaintext strings matching credential regexes.');
    }
    if (lower.includes('refactor') || lower.includes('clean') || lower.includes('edit')) {
      matchedRules.push('BOB-DIR-01: Atomic File Edits with Dry-Run Verification');
      safeguards.push('Blueprint will prevent truncation markers like /* keep existing code */.');
    }
    if (lower.includes('license') || lower.includes('header') || lower.includes('copyright')) {
      matchedRules.push('BOB-LIC-05: Preserve License Headers and Notice Blocks');
      safeguards.push('Blueprint will assert presence of Apache-2.0 preamble before commit.');
    }

    // Default to at least rule 1 & 2
    if (matchedRules.length === 0) {
      matchedRules.push('BOB-DIR-01: Atomic File Edits');
      matchedRules.push('TS-STRICT-04: Explicit TypeScript Return Types');
      safeguards.push('Enforcing strict AST validation on all generated exports.');
    }

    setSimulatedOutput({
      injectedRules: matchedRules,
      riskScore: matchedRules.length > 2 ? 'Moderate' : 'Low',
      safeguards
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#283a62] pb-3">
        <h1 className="text-xl font-bold text-white tracking-tight">
          IBM Bob Agent Coding Sessions
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time telemetry and transcript logs of Bob agent sessions enforcing Blueprint standards.
        </p>
        <button
          onClick={() => setIsImportOpen(true)}
          className="mt-3 px-3 py-1.5 text-xs font-semibold text-[#1c2b4a] bg-[#5bc8af] hover:bg-[#4eb39c] rounded-md"
        >
          Import session transcript
        </button>
      </div>

      <ImportSessionModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={onImportSession}
      />

      {/* Main Grid: Sessions List & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Session List */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Recorded Sessions ({sessions.length})
          </div>

          {sessions.map((session) => {
            const isSelected = session.id === selectedSession?.id;
            return (
              <div
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#1c2b4a] border-[#5bc8af]'
                    : 'bg-[#16223b] border-[#283a62] hover:bg-[#1c2b4a]/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-[#5bc8af]">
                    {session.id}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      session.status === 'Active'
                        ? 'text-[#5bc8af] flex items-center gap-1'
                        : session.status === 'Flagged'
                        ? 'text-[#f2a63a]'
                        : 'text-slate-400'
                    }`}
                  >
                    {session.status === 'Active' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5bc8af] animate-pulse"></span>
                    )}
                    {session.status}
                  </span>
                </div>

                <div className="text-sm font-semibold text-white line-clamp-1">
                  {session.taskTitle}
                </div>

                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <GitBranch className="w-3 h-3 text-slate-500" />
                  <span className="font-mono truncate">{session.branch}</span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#283a62]/60 flex items-center justify-between text-xs text-slate-400">
                  <span>{session.rulesEnforcedCount} rules enforced</span>
                  <span className="text-[#5bc8af] font-mono">
                    {session.mistakesPreventedCount} prevented
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Cols: Session Details & Transcript */}
        <div className="lg:col-span-2 space-y-5">
          {selectedSession && (
            <div className="bg-[#16223b] border border-[#283a62] rounded-lg p-5 space-y-5">
              {/* Session Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#283a62]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#5bc8af] font-semibold">
                      {selectedSession.id}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedSession.startedAt}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-white mt-1">
                    {selectedSession.taskTitle}
                  </h2>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Operator: {selectedSession.developer}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 bg-[#1c2b4a] border border-[#283a62] rounded text-slate-300">
                    Duration: {selectedSession.durationMinutes}m
                  </span>
                </div>
              </div>

              {/* Summary and Target Files */}
              <div className="p-3.5 bg-[#1c2b4a] border border-[#283a62] rounded-md space-y-2">
                <div className="text-xs font-semibold text-slate-300">Session Summary:</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedSession.summary}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                  <span className="text-slate-500">Target files:</span>
                  {selectedSession.targetFiles.map((file) => (
                    <span
                      key={file}
                      className="font-mono text-[11px] text-[#5bc8af] bg-[#16223b] px-2 py-0.5 rounded border border-[#283a62]"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              </div>

              {/* Real-time Intervention Transcript */}
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#5bc8af]" />
                    <span>Agent Telemetry & Blueprint Interventions</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {selectedSession.logs.length} events logged
                  </span>
                </div>

                <div className="p-4 bg-[#0f172a] border border-[#283a62] rounded-md space-y-2.5 font-mono text-xs">
                  {selectedSession.logs.map((log, idx) => {
                    const isCorrection = log.type === 'correction';
                    const isCheck = log.type === 'blueprint_check';
                    const isBob = log.type === 'bob_action';
                    const isPrompt = log.type === 'prompt';

                    return (
                      <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="text-slate-500 select-none tabular-nums text-[11px] shrink-0">
                          [{log.time}]
                        </span>
                        <div className="flex-1">
                          {isCorrection && (
                            <span className="text-[#5bc8af] font-semibold">
                              [AUTO-CORRECT] {log.text}
                            </span>
                          )}
                          {isCheck && (
                            <span className="text-[#f2a63a] font-semibold">
                              [BLUEPRINT-INTERCEPT] {log.text}
                            </span>
                          )}
                          {isBob && (
                            <span className="text-slate-300">
                              [BOB-ACTION] {log.text}
                            </span>
                          )}
                          {isPrompt && (
                            <span className="text-indigo-300">
                              [USER-TASK] {log.text}
                            </span>
                          )}
                          {log.type === 'info' && (
                            <span className="text-slate-400">
                              [SYSTEM] {log.text}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bob Prompt Dry-Run Sandbox */}
          <div className="bg-[#16223b] border border-[#283a62] rounded-lg p-5 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Simulate Bob Prompt Against Blueprint
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Preview which standards Blueprint injects before submitting a task to IBM Bob.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Refactor streaming client to support abort signals and IAM auth"
                className="flex-1 px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5bc8af]"
              />
              <button
                onClick={handleSimulatePrompt}
                className="px-4 py-2 bg-[#5bc8af] hover:bg-[#4eb39c] text-[#1c2b4a] font-semibold text-xs rounded transition-colors whitespace-nowrap"
              >
                Analyze Prompt
              </button>
            </div>

            {/* Simulation output */}
            {simulatedOutput && (
              <div className="mt-3 p-3.5 bg-[#141e33] border border-[#283a62] rounded-md space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">
                    Blueprint Injection Preview:
                  </span>
                  <span className="font-mono text-slate-400">
                    Risk Level: <span className="text-[#5bc8af]">{simulatedOutput.riskScore}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Injected Directives:
                  </span>
                  {simulatedOutput.injectedRules.map((r, i) => (
                    <div key={i} className="text-[#5bc8af] font-mono text-[11px]">
                      • {r}
                    </div>
                  ))}
                </div>

                <div className="space-y-1 pt-1 border-t border-[#283a62]/60">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Active Pre-Flight Checks:
                  </span>
                  {simulatedOutput.safeguards.map((s, i) => (
                    <div key={i} className="text-slate-300 text-[11px]">
                      ✓ {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
