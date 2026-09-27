import React, { useState } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';
import { BobSession, MistakeLogEntry } from '../../types';
import { parseTranscript } from '../../audit/transcriptParser';

interface ImportSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (session: BobSession, mistakes: MistakeLogEntry[]) => void;
}

export const ImportSessionModal: React.FC<ImportSessionModalProps> = ({ isOpen, onClose, onImport }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [raw, setRaw] = useState('');
  const [preview, setPreview] = useState<ReturnType<typeof parseTranscript> | null>(null);

  if (!isOpen) return null;

  const handleParse = () => {
    if (!raw.trim()) return;
    setPreview(parseTranscript(raw));
  };

  const handleConfirmImport = () => {
    if (!preview || !taskTitle.trim()) return;

    const sessionId = `SESS-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const session: BobSession = {
      id: sessionId,
      taskTitle,
      developer: 'You',
      branch: 'current',
      startedAt: now,
      durationMinutes: 0,
      status: 'Completed',
      rulesEnforcedCount: 0,
      mistakesPreventedCount: preview.candidateMistakes.length,
      targetFiles: [],
      summary: `Imported transcript · ${preview.logs.length} lines · ${preview.candidateMistakes.length} candidate mistakes flagged for review.`,
      logs: preview.logs
    };

    const mistakes: MistakeLogEntry[] = preview.candidateMistakes.map((m, idx) => ({
      ...m,
      id: `MIS-${Date.now()}-${idx}`,
      sessionRef: sessionId,
      detectedAt: now,
      timesAvoidedSince: 0,
      status: 'Under Review'
    }));

    onImport(session, mistakes);
    setRaw('');
    setTaskTitle('');
    setPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-[#16223b] border border-[#283a62] rounded-lg max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between pb-3 border-b border-[#283a62]">
          <div>
            <h2 className="text-base font-semibold text-white">Import Bob session transcript</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste a session export from Bob. We flag likely mistakes automatically — review before saving.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Task title</label>
            <input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Refactor auth middleware"
              className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5bc8af]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Transcript</label>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={8}
              placeholder="Paste the raw session export here..."
              className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded-md text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#5bc8af]"
            />
          </div>

          <button
            onClick={handleParse}
            disabled={!raw.trim()}
            className="px-3 py-1.5 text-xs font-medium bg-[#1c2b4a] hover:bg-[#213357] border border-[#283a62] rounded disabled:opacity-50 text-slate-200"
          >
            Preview parsed result
          </button>

          {preview && (
            <div className="border border-[#283a62] rounded-md p-3 bg-[#0f172a] space-y-2">
              <div className="text-xs text-slate-300">
                Parsed {preview.logs.length} lines · flagged {preview.candidateMistakes.length} candidate mistake(s)
              </div>
              {preview.candidateMistakes.length > 0 && (
                <ul className="space-y-1.5">
                  {preview.candidateMistakes.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#f2a63a] shrink-0 mt-0.5" />
                      <span>{m.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-[#283a62]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#1c2b4a] rounded-md border border-[#283a62]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={!preview || !taskTitle.trim()}
            className="px-4 py-2 text-xs font-semibold text-[#1c2b4a] bg-[#5bc8af] hover:bg-[#4eb39c] disabled:opacity-50 rounded-md flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
