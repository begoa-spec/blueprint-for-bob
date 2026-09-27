import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  FileCode2,
  AlertTriangle,
  Bot,
  Settings,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  issuesCount: number;
  mistakesCount: number;
  rulesCount: number;
  activeSessionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  issuesCount,
  mistakesCount,
  rulesCount,
  activeSessionsCount
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'repo-audit',
      label: 'Repo audit',
      icon: ShieldAlert,
      badge: issuesCount > 0 ? issuesCount : null,
      badgeColor: 'text-[#f2a63a]'
    },
    {
      id: 'standards',
      label: 'Standards',
      icon: FileCode2,
      badge: rulesCount,
      badgeColor: 'text-[#5bc8af]'
    },
    {
      id: 'mistake-log',
      label: 'Mistake log',
      icon: AlertTriangle,
      badge: mistakesCount > 0 ? mistakesCount : null,
      badgeColor: 'text-[#f2a63a]'
    },
    {
      id: 'bob-sessions',
      label: 'Bob sessions',
      icon: Bot,
      badge: activeSessionsCount > 0 ? `${activeSessionsCount} active` : null,
      badgeColor: 'text-[#5bc8af]'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-[#16223b] border-r border-[#283a62] flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation links */}
      <nav className="p-4 space-y-1.5 flex-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1c2b4a] text-[#5bc8af] border-l-2 border-[#5bc8af]'
                  : 'text-slate-300 hover:text-white hover:bg-[#1c2b4a]/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#5bc8af]' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== null && (
                <span className={`text-xs font-mono font-medium ${item.badgeColor || 'text-slate-400'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* IBM Bob Agent info footer */}
      <div className="p-4 border-t border-[#283a62] bg-[#141e33]">
        <div className="p-3 rounded-md bg-[#1c2b4a] border border-[#283a62]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-200">IBM Bob Agent</span>
            <span className="w-2 h-2 rounded-full bg-[#5bc8af] animate-pulse"></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Granite 34B Code runtime connected. Blueprint actively intercepting mistakes.
          </p>
          <div className="mt-2.5 pt-2 border-t border-[#283a62]/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Enforcement: Strict</span>
            <button
              onClick={() => onSelectTab('settings')}
              className="text-[#5bc8af] hover:underline"
            >
              Configure
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
