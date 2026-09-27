import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileText,
  Clock,
  ExternalLink,
  Flame
} from 'lucide-react';
import { MistakeLogEntry, Severity } from '../types';

interface MistakeLogViewProps {
  mistakes: MistakeLogEntry[];
  onOpenAddMistake: () => void;
  onNavigateToStandards: () => void;
}

export const MistakeLogView: React.FC<MistakeLogViewProps> = ({
  mistakes,
  onOpenAddMistake,
  onNavigateToStandards
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const categories = [
    'All',
    'Code Hallucination',
    'Breaking Change',
    'Missing Validation',
    'Type Error',
    'Architecture Drift',
    'Dropped Context'
  ];

  const filteredMistakes = mistakes.filter((item) => {
    const matchesCat =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'All' || item.status === selectedStatus;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.errantBehavior.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sessionRef.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  const totalAvoided = mistakes.reduce((acc, curr) => acc + curr.timesAvoidedSince, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#283a62]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Bob Mistake Log & Memory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tracking every mistake made by IBM Bob to inject mitigation rules into future prompts.
          </p>
        </div>

        <button
          onClick={onOpenAddMistake}
          className="px-3.5 py-2 text-xs font-semibold text-[#1c2b4a] bg-[#f2a63a] hover:bg-[#e09328] rounded-md transition-colors flex items-center gap-1.5 self-start md:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log New Mistake</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#16223b] border border-[#283a62] rounded-lg">
          <div className="text-xs text-slate-400">Total Mistakes Logged</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums mt-1">
            {mistakes.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across 18 Bob coding sessions
          </div>
        </div>

        <div className="p-4 bg-[#16223b] border border-[#283a62] rounded-lg">
          <div className="text-xs text-slate-400">Total Recurrences Avoided</div>
          <div className="text-2xl font-bold font-mono text-[#5bc8af] tabular-nums mt-1">
            {totalAvoided}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Blocked before write by Blueprint
          </div>
        </div>

        <div className="p-4 bg-[#16223b] border border-[#283a62] rounded-lg">
          <div className="text-xs text-slate-400">Active Mitigation Rules</div>
          <div className="text-2xl font-bold font-mono text-[#f2a63a] tabular-nums mt-1">
            {mistakes.filter((m) => m.status === 'Injected in Rules').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Actively injected into prompt prefix
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
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

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mistakes or prompts..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#16223b] border border-[#283a62] rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5bc8af]"
          />
        </div>
      </div>

      {/* Mistakes List */}
      <div className="space-y-4">
        {filteredMistakes.length === 0 ? (
          <div className="p-12 text-center bg-[#16223b] border border-[#283a62] rounded-lg text-slate-400 text-sm">
            No mistakes found in log matching current filter.
          </div>
        ) : (
          filteredMistakes.map((entry) => {
            return (
              <div
                key={entry.id}
                className="p-5 bg-[#16223b] border border-[#283a62] rounded-lg space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#f2a63a]">
                      {entry.id}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-xs text-slate-400 font-medium">
                      {entry.category}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span
                      className={`text-xs font-semibold ${
                        entry.severity === 'Critical'
                          ? 'text-[#f2a63a]'
                          : entry.severity === 'High'
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {entry.severity}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      {entry.detectedAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">{entry.sessionRef}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-[#5bc8af] font-mono font-medium">
                      Avoided {entry.timesAvoidedSince}×
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white">
                  {entry.title}
                </h3>

                {/* Grid of Prompt Context vs Errant vs Expected */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* What Bob Did */}
                  <div className="p-3.5 bg-[#1c2b4a] border border-[#283a62] rounded-md space-y-1">
                    <div className="text-[11px] font-semibold text-[#f2a63a] uppercase tracking-wider">
                      What Bob Did (Errant Behavior)
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {entry.errantBehavior}
                    </p>
                    {entry.bobPrompt && (
                      <div className="mt-2 pt-2 border-t border-[#283a62]/60 text-[11px] text-slate-400 font-mono">
                        Prompt: "{entry.bobPrompt}"
                      </div>
                    )}
                  </div>

                  {/* Expected Behavior */}
                  <div className="p-3.5 bg-[#1c2b4a] border border-[#283a62] rounded-md space-y-1">
                    <div className="text-[11px] font-semibold text-[#5bc8af] uppercase tracking-wider">
                      Expected Standard Behavior
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {entry.expectedBehavior}
                    </p>
                  </div>
                </div>

                {/* Mitigation Rule attached */}
                {entry.mitigationRuleId && (
                  <div className="p-3 bg-[#141e33] border border-[#283a62] rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#5bc8af] shrink-0" />
                      <div className="text-xs text-slate-300">
                        <span className="text-slate-400">Mitigated by Rule: </span>
                        <span className="font-mono text-[#5bc8af] font-semibold">
                          {entry.mitigationRuleId}
                        </span>
                        {entry.mitigationRuleTitle && (
                          <span className="text-slate-300 ml-1">
                            ({entry.mitigationRuleTitle})
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={onNavigateToStandards}
                      className="text-xs text-[#5bc8af] hover:underline font-medium flex items-center gap-1 shrink-0"
                    >
                      <span>Inspect rule</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
