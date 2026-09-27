import React, { useState } from 'react';
import { X, AlertTriangle, Plus } from 'lucide-react';
import { MistakeLogEntry, Severity, StandardRule } from '../../types';

interface AddMistakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMistake: (mistake: MistakeLogEntry) => void;
  existingRules: StandardRule[];
}

export const AddMistakeModal: React.FC<AddMistakeModalProps> = ({
  isOpen,
  onClose,
  onAddMistake,
  existingRules
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MistakeLogEntry['category']>('Code Hallucination');
  const [severity, setSeverity] = useState<Severity>('High');
  const [sessionRef, setSessionRef] = useState('Active Session (Developer Alex Chen)');
  const [bobPrompt, setBobPrompt] = useState('');
  const [errantBehavior, setErrantBehavior] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [selectedRuleId, setSelectedRuleId] = useState(existingRules[0]?.id || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !errantBehavior.trim() || !expectedBehavior.trim()) return;

    const matchedRule = existingRules.find((r) => r.id === selectedRuleId);

    const newMistake: MistakeLogEntry = {
      id: `MST-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      category,
      severity,
      sessionRef: sessionRef.trim(),
      detectedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      bobPrompt: bobPrompt.trim() || 'Prompt context recorded during developer session.',
      errantBehavior: errantBehavior.trim(),
      expectedBehavior: expectedBehavior.trim(),
      mitigationRuleId: matchedRule ? matchedRule.id : undefined,
      mitigationRuleTitle: matchedRule ? matchedRule.title : undefined,
      timesAvoidedSince: 1,
      status: 'Injected in Rules'
    };

    onAddMistake(newMistake);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-[#16223b] border border-[#283a62] rounded-lg max-w-xl w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between pb-3 border-b border-[#283a62]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#f2a63a]" />
            <h2 className="text-base font-semibold text-white">
              Log IBM Bob Agent Mistake
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mistake Summary / Headline *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Overwrote existing unit tests with empty placeholder suite"
              className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 focus:outline-none focus:border-[#5bc8af]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MistakeLogEntry['category'])}
                className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 focus:outline-none focus:border-[#5bc8af]"
              >
                <option value="Code Hallucination">Code Hallucination</option>
                <option value="Breaking Change">Breaking Change</option>
                <option value="Missing Validation">Missing Validation</option>
                <option value="Type Error">Type Error</option>
                <option value="Architecture Drift">Architecture Drift</option>
                <option value="Dropped Context">Dropped Context</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 focus:outline-none focus:border-[#5bc8af]"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Original Task / Bob Prompt (Optional)
            </label>
            <input
              type="text"
              value={bobPrompt}
              onChange={(e) => setBobPrompt(e.target.value)}
              placeholder="e.g. Refactor API router to handle OAuth callbacks"
              className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 focus:outline-none focus:border-[#5bc8af]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#f2a63a] mb-1">
              What Bob Did (Errant Behavior) *
            </label>
            <textarea
              required
              rows={2}
              value={errantBehavior}
              onChange={(e) => setErrantBehavior(e.target.value)}
              placeholder="Describe exactly what Bob generated incorrectly..."
              className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 focus:outline-none focus:border-[#5bc8af]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5bc8af] mb-1">
              Expected Correct Standard Behavior *
            </label>
            <textarea
              required
              rows={2}
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              placeholder="Describe what standard or invariant should have been upheld..."
              className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 focus:outline-none focus:border-[#5bc8af]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Link Mitigation Standard Rule (Injected into Bob Memory)
            </label>
            <select
              value={selectedRuleId}
              onChange={(e) => setSelectedRuleId(e.target.value)}
              className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 focus:outline-none focus:border-[#5bc8af]"
            >
              {existingRules.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.id} - {rule.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#283a62]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#1c2b4a] rounded border border-[#283a62]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-[#1c2b4a] bg-[#f2a63a] hover:bg-[#e09328] rounded"
            >
              Save and Inject Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
