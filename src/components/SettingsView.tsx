import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  GitBranch,
  Shield,
  Bot,
  FileCode,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { RepoConfig } from '../types';

interface SettingsViewProps {
  repoConfig: RepoConfig;
  onSaveRepoConfig: (config: RepoConfig) => void;
  onResetDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  repoConfig,
  onSaveRepoConfig,
  onResetDefaults
}) => {
  const [formData, setFormData] = useState<RepoConfig>({ ...repoConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRepoConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#283a62] pb-3">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Repository & Bob Agent Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure connected GitHub repository credentials, IBM Bob agent runtime parameters, and rule enforcement modes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Repo Connection Card */}
        <div className="bg-[#16223b] border border-[#283a62] rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#283a62] pb-3">
            <GitBranch className="w-4 h-4 text-[#5bc8af]" />
            <h2 className="text-sm font-semibold text-white">
              Connected GitHub Repository
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Repository Name / Slug
              </label>
              <input
                type="text"
                value={formData.repoName}
                onChange={(e) => setFormData({ ...formData, repoName: e.target.value })}
                className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 focus:outline-none focus:border-[#5bc8af]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default Branch
              </label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 focus:outline-none focus:border-[#5bc8af]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Repository URL
              </label>
              <input
                type="text"
                value={formData.repoUrl}
                onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 focus:outline-none focus:border-[#5bc8af]"
              />
            </div>
          </div>
        </div>

        {/* IBM Bob Agent Configuration Card */}
        <div className="bg-[#16223b] border border-[#283a62] rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#283a62] pb-3">
            <Bot className="w-4 h-4 text-[#5bc8af]" />
            <h2 className="text-sm font-semibold text-white">
              IBM Bob Agent Runtime
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Coding Agent Model Engine
              </label>
              <select
                value={formData.bobVersion}
                onChange={(e) => setFormData({ ...formData, bobVersion: e.target.value })}
                className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 focus:outline-none focus:border-[#5bc8af]"
              >
                <option value="IBM Bob v3.2-enterprise (Granite 34B Code)">
                  IBM Bob v3.2-enterprise (Granite 34B Code)
                </option>
                <option value="IBM Bob v3.0 (Granite 8B Code)">
                  IBM Bob v3.0 (Granite 8B Code)
                </option>
                <option value="IBM Bob Experimental (Granite-20B-MoE)">
                  IBM Bob Experimental (Granite-20B-MoE)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Enforcement Strategy
              </label>
              <select
                value={formData.injectionMode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    injectionMode: e.target.value as RepoConfig['injectionMode']
                  })
                }
                className="w-full px-3 py-2 bg-[#1c2b4a] border border-[#283a62] rounded text-xs text-slate-100 focus:outline-none focus:border-[#5bc8af]"
              >
                <option value="Strict Invariant">
                  Strict Invariant (Halt session on rule deviation)
                </option>
                <option value="Advisory Guide">
                  Advisory Guide (Prompt injection with warnings)
                </option>
                <option value="Auto-Remediate">
                  Auto-Remediate (Blueprint automatically fixes AST)
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onResetDefaults}
            className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-[#16223b] border border-[#283a62] rounded hover:bg-[#1c2b4a] transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-[#5bc8af] flex items-center gap-1 font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Configuration Saved</span>
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-[#1c2b4a] bg-[#5bc8af] hover:bg-[#4eb39c] rounded transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
