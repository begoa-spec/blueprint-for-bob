import React, { useState } from 'react';
import { X, FileCode2 } from 'lucide-react';
import { StandardRule, Severity } from '../../types';

interface AddRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRule: (rule: StandardRule) => void;
}

export const AddRuleModal: React.FC<AddRuleModalProps> = ({
  isOpen,
  onClose,
  onAddRule
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<StandardRule['category']>('Bob Constraints');
  const [severity, setSeverity] = useState<Severity>('High');
  const [description, setDescription] = useState('');
  const [bobDirective, setBobDirective] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !bobDirective.trim()) return;

    const prefix =
      category === 'Security'
        ? 'SEC'
        : category === 'Bob Constraints'
        ? 'BOB'
        : category === 'TypeScript'
        ? 'TS'
        : category === 'Testing'
        ? 'TEST'
        : 'ARCH';

    const newRule: StandardRule = {
      id: `${prefix}-RULE-${Math.floor(10 + Math.random() * 90)}`,
      title: title.trim(),
      category,
      severity,
      description: description.trim() || title.trim(),
      bobDirective: bobDirective.trim(),
      enabled: true,
      timesPrevented: 0,
      addedDate: new Date().toISOString().substring(0, 10)
    };

    onAddRule(newRule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-[#16223b] border border-[#283a62] rounded-lg max-w-xl w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between pb-3 border-b border-[#283a62]">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-[#5bc8af]" />
            <h2 className="text-base font-semibold text-white">
              Create New Bob Standard Rule
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
              Rule Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Prevent direct process.exit in server request handlers"
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
                onChange={(e) => setCategory(e.target.value as StandardRule['category'])}
                className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 focus:outline-none focus:border-[#5bc8af]"
              >
                <option value="Bob Constraints">Bob Constraints</option>
                <option value="Security">Security</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Code Quality">Code Quality</option>
                <option value="Architecture">Architecture</option>
                <option value="Testing">Testing</option>
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
              Context & Explanation (for Developers)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why this invariant is necessary for the codebase..."
              className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 focus:outline-none focus:border-[#5bc8af]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5bc8af] mb-1">
              IBM Bob Injected Prompt Directive *
            </label>
            <textarea
              required
              rows={3}
              value={bobDirective}
              onChange={(e) => setBobDirective(e.target.value)}
              placeholder="e.g. NEVER call process.exit() inside an HTTP route handler. Always throw a typed HttpError or delegate to error middleware."
              className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 font-mono focus:outline-none focus:border-[#5bc8af]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              This exact text is prepended to IBM Bob prompt sessions to constrain agent output.
            </p>
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
              className="px-4 py-2 text-xs font-semibold text-[#1c2b4a] bg-[#5bc8af] hover:bg-[#4eb39c] rounded"
            >
              Add Standard Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
