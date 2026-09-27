import React, { useState } from 'react';
import { Download, Copy, Check, FileText, X } from 'lucide-react';
import { StandardRule, AuditIssue, MistakeLogEntry, RepoConfig } from '../../types';
import { generateHandoverDoc } from '../../audit/handoverDoc';

interface ExportHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoConfig: RepoConfig;
  rules: StandardRule[];
  auditIssues: AuditIssue[];
  mistakes: MistakeLogEntry[];
}

export const ExportHandoverModal: React.FC<ExportHandoverModalProps> = ({
  isOpen,
  onClose,
  repoConfig,
  rules,
  auditIssues,
  mistakes
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const content = generateHandoverDoc(repoConfig, rules, auditIssues, mistakes);
  const fileName = `${repoConfig.repoName.replace(/[^a-z0-9-]/gi, '_')}-handover.md`;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-[#16223b] border border-[#283a62] rounded-lg max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between pb-3 border-b border-[#283a62]">
          <div>
            <h2 className="text-base font-semibold text-white">Export Handover Report</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              A client/onboarding-ready summary of standards, open issues, and known Bob mistake patterns.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-3 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-3 py-1.5 bg-[#141e33] border border-b-0 border-[#283a62] rounded-t">
            <span>{fileName}</span>
            <span>{rules.filter((r) => r.enabled).length} standards · {auditIssues.length} issues · {mistakes.length} mistakes</span>
          </div>
          <pre className="flex-1 p-4 bg-[#0f172a] border border-[#283a62] rounded-b font-mono text-xs text-slate-200 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
            {content}
          </pre>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-[#283a62]">
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-xs font-medium text-slate-200 bg-[#1c2b4a] hover:bg-[#213357] border border-[#283a62] rounded transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#5bc8af]" />
                <span className="text-[#5bc8af]">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Content</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 text-xs font-semibold text-[#1c2b4a] bg-[#5bc8af] hover:bg-[#4eb39c] rounded transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download {fileName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
