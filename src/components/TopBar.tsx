import React from 'react';
import { GitBranch, Shield, Bell, Download, RefreshCw } from 'lucide-react';
import { RepoConfig } from '../types';

interface TopBarProps {
  repoConfig: RepoConfig;
  onOpenExport: () => void;
  onSelectTab: (tab: string) => void;
  avatarSrc: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  repoConfig,
  onOpenExport,
  onSelectTab,
  avatarSrc
}) => {
  return (
    <header className="h-16 bg-[#16223b] border-b border-[#283a62] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1: Brand title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#5bc8af]/15 border border-[#5bc8af]/30 flex items-center justify-center text-[#5bc8af] font-bold text-sm tracking-wider">
          BB
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight text-white">
            Blueprint for Bob
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            IBM Bob Agent Standards
          </span>
        </div>
      </div>

      {/* Zone 2: Connected repo & status */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onSelectTab('repo-audit')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1c2b4a] border border-[#283a62] text-xs text-slate-200 hover:border-[#5bc8af]/50 hover:text-white transition-colors"
          title="Click to view connected repo audit"
        >
          <GitBranch className="w-3.5 h-3.5 text-[#5bc8af]" />
          <span className="font-mono text-slate-300 font-medium truncate max-w-[200px] sm:max-w-[280px]">
            {repoConfig.repoName}
          </span>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-[#5bc8af] text-[11px]">{repoConfig.branch}</span>
        </button>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#5bc8af]"></span>
          <span className="font-medium text-slate-300">Active Rules Sync</span>
        </div>
      </div>

      {/* Zone 3: Actions & User Avatar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1c2b4a] bg-[#5bc8af] hover:bg-[#4eb39c] rounded-md transition-colors whitespace-nowrap shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export .bobrules</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-[#1c2b4a] transition-colors"
          title="Settings"
          aria-label="Settings"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User avatar */}
        <div
          onClick={() => onSelectTab('settings')}
          className="flex items-center gap-2 cursor-pointer p-0.5 rounded-full hover:ring-2 hover:ring-[#5bc8af]/40 transition-all"
          title="Developer Profile: Alex Chen"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#213357] border border-[#2e4370] flex items-center justify-center">
            <img
              src={avatarSrc}
              alt="Developer User Avatar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to SVG initials if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-xs font-semibold text-[#5bc8af]">AC</span>
          </div>
        </div>
      </div>
    </header>
  );
};
