import React, { useState } from 'react';
import {
  Search,
  Filter,
  Play,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileCode,
  ArrowUpRight,
  Plus,
  RefreshCw,
  ExternalLink,
  Code
} from 'lucide-react';
import { AuditIssue, Severity, StandardRule } from '../types';
import { fetchRepoFiles, GitHubFetchError } from '../lib/github';
import { runAudit } from '../audit/auditEngine';

interface RepoAuditViewProps {
  issues: AuditIssue[];
  currentRepoUrl: string;
  onUpdateRepoUrl: (url: string) => void;
  onAuditComplete: (issues: AuditIssue[], filesScanned: number) => void;
  onAddRuleFromIssue: (issue: AuditIssue) => void;
  onNavigateToStandards: () => void;
}

export const RepoAuditView: React.FC<RepoAuditViewProps> = ({
  issues,
  currentRepoUrl,
  onUpdateRepoUrl,
  onAuditComplete,
  onAddRuleFromIssue,
  onNavigateToStandards
}) => {
  const [repoInput, setRepoInput] = useState(currentRepoUrl);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<AuditIssue | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'All' | Severity>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedRuleIds, setAddedRuleIds] = useState<Record<string, boolean>>({});

  const handleRunAudit = async () => {
    if (!repoInput.trim() || isScanning) return;
    setScanError(null);
    setIsScanning(true);
    setScanProgress(10);

    try {
      const files = await fetchRepoFiles(repoInput, '', (text) => {
        setScanStatusText(text);
        setScanProgress((p) => Math.min(p + 20, 70));
      });

      setScanProgress(85);
      setScanStatusText(`Running standards checks across ${files.length} files...`);

      const foundIssues = runAudit(files);

      setScanProgress(100);
      setScanStatusText(`Audit finished. ${foundIssues.length} issues found across ${files.length} files.`);
      onUpdateRepoUrl(repoInput);
      onAuditComplete(foundIssues, files.length);
    } catch (err) {
      const message = err instanceof GitHubFetchError ? err.message : 'Audit failed. Check the repo URL and try again.';
      setScanError(message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleQuickRepo = (url: string) => {
    setRepoInput(url);
    onUpdateRepoUrl(url);
  };

  const handleCreateRule = (issue: AuditIssue) => {
    onAddRuleFromIssue(issue);
    setAddedRuleIds((prev) => ({ ...prev, [issue.id]: true }));
  };

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSeverity =
      severityFilter === 'All' || issue.severity === severityFilter;
    const matchesSearch =
      issue.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const criticalCount = issues.filter((i) => i.severity === 'Critical').length;
  const highCount = issues.filter((i) => i.severity === 'High').length;
  const mediumCount = issues.filter((i) => i.severity === 'Medium').length;
  const lowCount = issues.filter((i) => i.severity === 'Low').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#283a62] pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Repository Standards Audit
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Scan codebases against blueprint rules to identify anti-patterns before IBM Bob makes modifications.
        </p>
      </div>

      {/* Input area: Repo URL & Run Audit Button */}
      <div className="bg-[#16223b] border border-[#283a62] rounded-lg p-5">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          GitHub Repository URL
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="https://github.com/organization/repository"
              className="w-full px-3.5 py-2.5 bg-[#1c2b4a] border border-[#283a62] rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5bc8af]"
            />
          </div>

          <button
            onClick={handleRunAudit}
            disabled={isScanning || !repoInput.trim()}
            className="px-5 py-2.5 bg-[#5bc8af] hover:bg-[#4eb39c] disabled:opacity-50 text-[#1c2b4a] font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning Repository...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run audit</span>
              </>
            )}
          </button>
        </div>

        {/* Preset quick test repositories */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>Quick presets:</span>
          <button
            onClick={() => handleQuickRepo('https://github.com/ibm/watsonx-code-assistant-kit')}
            className="text-slate-300 hover:text-[#5bc8af] hover:underline"
          >
            ibm/watsonx-code-assistant-kit
          </button>
          <span>·</span>
          <button
            onClick={() => handleQuickRepo('https://github.com/carbon-design-system/carbon')}
            className="text-slate-300 hover:text-[#5bc8af] hover:underline"
          >
            carbon-design-system/carbon
          </button>
          <span>·</span>
          <button
            onClick={() => handleQuickRepo('https://github.com/ibm-cloud/cloud-operators')}
            className="text-slate-300 hover:text-[#5bc8af] hover:underline"
          >
            ibm-cloud/cloud-operators
          </button>
        </div>

        {/* Scanning progress bar */}
        {isScanning && (
          <div className="mt-4 pt-4 border-t border-[#283a62]">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
              <span>{scanStatusText}</span>
              <span className="font-mono tabular-nums text-[#5bc8af]">{scanProgress}%</span>
            </div>
            <div className="w-full bg-[#1c2b4a] h-1.5 rounded-full overflow-hidden border border-[#283a62]">
              <div
                className="bg-[#5bc8af] h-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {scanError && (
          <div className="mt-4 pt-4 border-t border-[#283a62] text-xs text-[#f2a63a]">
            {scanError}
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3.5 bg-[#16223b] border border-[#283a62] rounded-lg">
          <div className="text-xs text-slate-400">Total Issues</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums mt-1">
            {issues.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">148 files scanned</div>
        </div>

        <div className="p-3.5 bg-[#16223b] border border-[#283a62] rounded-lg">
          <div className="text-xs text-slate-400">Critical Severity</div>
          <div className="text-2xl font-bold font-mono text-[#f2a63a] tabular-nums mt-1">
            {criticalCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Immediate risk</div>
        </div>

        <div className="p-3.5 bg-[#16223b] border border-[#283a62] rounded-lg">
          <div className="text-xs text-slate-400">High Severity</div>
          <div className="text-2xl font-bold font-mono text-slate-200 tabular-nums mt-1">
            {highCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Architectural violation</div>
        </div>

        <div className="p-3.5 bg-[#16223b] border border-[#283a62] rounded-lg">
          <div className="text-xs text-slate-400">Medium / Low</div>
          <div className="text-2xl font-bold font-mono text-[#5bc8af] tabular-nums mt-1">
            {mediumCount + lowCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Quality & style flags</div>
        </div>
      </div>

      {/* Results Table Section */}
      <div className="bg-[#16223b] border border-[#283a62] rounded-lg overflow-hidden">
        {/* Table Controls: Search & Severity Segmented Filter */}
        <div className="p-4 border-b border-[#283a62] flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search file name, issue, or category..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#1c2b4a] border border-[#283a62] rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5bc8af]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#1c2b4a] p-1 rounded-md border border-[#283a62]">
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  severityFilter === sev
                    ? 'bg-[#213357] text-[#5bc8af] border border-[#2e4370]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Results Table: file name, issue found, severity */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141e33] border-b border-[#283a62] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">File Name</th>
                <th className="px-5 py-3">Issue Found</th>
                <th className="px-5 py-3">Severity</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#283a62]/60">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                    No issues matching current filters.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => {
                  const isAdded = addedRuleIds[issue.id];
                  return (
                    <tr
                      key={issue.id}
                      className="hover:bg-[#1c2b4a]/70 transition-colors"
                    >
                      {/* File Name */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-slate-200 font-medium">
                            {issue.fileName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 pl-5">
                          Line {issue.line} · {issue.category}
                        </div>
                      </td>

                      {/* Issue Found */}
                      <td className="px-5 py-3.5 max-w-md">
                        <div className="text-slate-200 font-medium leading-relaxed">
                          {issue.issue}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5 truncate">
                          Guidance: {issue.suggestion}
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`font-semibold text-xs ${
                            issue.severity === 'Critical'
                              ? 'text-[#f2a63a]'
                              : issue.severity === 'High'
                              ? 'text-amber-400'
                              : issue.severity === 'Medium'
                              ? 'text-slate-300'
                              : 'text-slate-400'
                          }`}
                        >
                          {issue.severity}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => setSelectedIssue(issue)}
                          className="px-2.5 py-1 text-slate-300 hover:text-white bg-[#1c2b4a] hover:bg-[#213357] border border-[#283a62] rounded text-xs transition-colors"
                        >
                          Inspect snippet
                        </button>

                        <button
                          onClick={() => handleCreateRule(issue)}
                          disabled={isAdded}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            isAdded
                              ? 'bg-[#5bc8af]/20 text-[#5bc8af] border border-[#5bc8af]/40 cursor-default'
                              : 'bg-[#5bc8af] hover:bg-[#4eb39c] text-[#1c2b4a]'
                          }`}
                          title="Generate a Bob prompt constraint rule from this audit issue"
                        >
                          {isAdded ? 'Rule Injected' : '+ Bob Rule'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snippet / Issue Inspector Drawer or Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#16223b] border border-[#283a62] rounded-lg max-w-2xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-[#5bc8af]">{selectedIssue.id}</span>
                <h3 className="text-base font-semibold text-white mt-1">
                  {selectedIssue.fileName} (Line {selectedIssue.line})
                </h3>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-slate-400 hover:text-white text-lg font-mono p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#1c2b4a] border border-[#283a62] rounded-md space-y-1">
              <div className="text-xs font-semibold text-slate-300">Violation:</div>
              <div className="text-xs text-slate-200">{selectedIssue.issue}</div>
            </div>

            {selectedIssue.snippet && (
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-[#5bc8af]" />
                  <span>AST Code Snippet</span>
                </div>
                <pre className="p-3.5 bg-[#0f172a] border border-[#283a62] rounded-md text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre">
                  {selectedIssue.snippet}
                </pre>
              </div>
            )}

            <div className="p-3.5 bg-[#141e33] border border-[#283a62] rounded-md space-y-1.5">
              <div className="text-xs font-semibold text-[#5bc8af]">
                Suggested Bob Prevention Directive:
              </div>
              <div className="text-xs text-slate-300">
                {selectedIssue.suggestion}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedIssue(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#1c2b4a] rounded-md border border-[#283a62]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleCreateRule(selectedIssue);
                  setSelectedIssue(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-[#1c2b4a] bg-[#5bc8af] hover:bg-[#4eb39c] rounded-md"
              >
                Inject into Active Bob Rules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
