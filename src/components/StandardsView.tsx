import React, { useState } from 'react';
import {
  FileCode2,
  Plus,
  Download,
  Check,
  Search,
  Filter,
  Trash2,
  Edit2,
  Shield,
  Copy,
  ExternalLink
} from 'lucide-react';
import { StandardRule, Severity } from '../types';

interface StandardsViewProps {
  rules: StandardRule[];
  onToggleRule: (ruleId: string) => void;
  onDeleteRule: (ruleId: string) => void;
  onOpenAddRule: () => void;
  onOpenExport: () => void;
}

export const StandardsView: React.FC<StandardsViewProps> = ({
  rules,
  onToggleRule,
  onDeleteRule,
  onOpenAddRule,
  onOpenExport
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    'All',
    'Bob Constraints',
    'Security',
    'TypeScript',
    'Code Quality',
    'Architecture',
    'Testing'
  ];

  const filteredRules = rules.filter((rule) => {
    const matchesCat =
      selectedCategory === 'All' || rule.category === selectedCategory;
    const matchesSearch =
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.bobDirective.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopyDirective = (ruleId: string, directive: string) => {
    navigator.clipboard.writeText(directive);
    setCopiedId(ruleId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const activeCount = rules.filter((r) => r.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#283a62]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Bob Standards & Guardrails
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Rules injected into IBM Bob agent sessions to prevent recurrent mistakes and enforce repo invariants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenExport}
            className="px-3.5 py-2 text-xs font-semibold text-[#1c2b4a] bg-[#5bc8af] hover:bg-[#4eb39c] rounded-md transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate Bob Rules File</span>
          </button>
          <button
            onClick={onOpenAddRule}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#213357] hover:bg-[#283d66] border border-[#2e4370] rounded-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Rule</span>
          </button>
        </div>
      </div>

      {/* Overview Banner */}
      <div className="bg-[#16223b] border border-[#283a62] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Enforcement Blueprint Active</span>
            <span className="text-xs font-mono text-[#5bc8af]">
              ({activeCount} of {rules.length} enabled)
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            When Bob receives a task, Blueprint prefixes the session context with these atomic rules. Any violation during dry-run is flagged before files are written.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <div className="text-slate-400">Total Hallucinations Prevented</div>
            <div className="text-lg font-bold text-[#5bc8af] tabular-nums">
              {rules.reduce((a, b) => a + b.timesPrevented, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Category tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-[#16223b] p-1 rounded-md border border-[#283a62]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#213357] text-[#5bc8af] border border-[#2e4370]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rules or directives..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#16223b] border border-[#283a62] rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5bc8af]"
          />
        </div>
      </div>

      {/* Rules Grid */}
      <div className="space-y-3.5">
        {filteredRules.length === 0 ? (
          <div className="p-12 text-center bg-[#16223b] border border-[#283a62] rounded-lg text-slate-400 text-sm">
            No standards found matching your criteria.
          </div>
        ) : (
          filteredRules.map((rule) => {
            return (
              <div
                key={rule.id}
                className={`p-5 bg-[#16223b] border rounded-lg transition-colors ${
                  rule.enabled
                    ? 'border-[#283a62]'
                    : 'border-[#283a62]/40 opacity-60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#5bc8af]">
                        {rule.id}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-xs text-slate-400">{rule.category}</span>
                      <span className="text-slate-500">·</span>
                      <span
                        className={`text-xs font-semibold ${
                          rule.severity === 'Critical'
                            ? 'text-[#f2a63a]'
                            : rule.severity === 'High'
                            ? 'text-amber-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {rule.severity}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-xs text-slate-400 font-mono tabular-nums">
                        {rule.timesPrevented} prevented
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white">
                      {rule.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {rule.description}
                    </p>
                  </div>

                  {/* Toggle and delete */}
                  <div className="flex items-center gap-3 shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <span>{rule.enabled ? 'Active' : 'Disabled'}</span>
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => onToggleRule(rule.id)}
                        className="sr-only"
                      />
                      <div
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          rule.enabled ? 'bg-[#5bc8af]' : 'bg-[#283a62]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            rule.enabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        ></div>
                      </div>
                    </label>

                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bob Prompt Directive Display */}
                <div className="mt-4 pt-3 border-t border-[#283a62]/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      IBM Bob Injected Directive:
                    </span>
                    <button
                      onClick={() => handleCopyDirective(rule.id, rule.bobDirective)}
                      className="text-[11px] text-[#5bc8af] hover:underline flex items-center gap-1 font-mono"
                    >
                      {copiedId === rule.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy prompt snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3 bg-[#141e33] border border-[#283a62] rounded font-mono text-xs text-slate-200 leading-relaxed">
                    {rule.bobDirective}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
