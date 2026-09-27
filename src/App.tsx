import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { RepoAuditView } from './components/RepoAuditView';
import { StandardsView } from './components/StandardsView';
import { MistakeLogView } from './components/MistakeLogView';
import { BobSessionsView } from './components/BobSessionsView';
import { SettingsView } from './components/SettingsView';
import { ExportRulesModal } from './components/modals/ExportRulesModal';
import { ExportHandoverModal } from './components/modals/ExportHandoverModal';
import { AddMistakeModal } from './components/modals/AddMistakeModal';
import { AddRuleModal } from './components/modals/AddRuleModal';
import {
  initialRepoConfig,
  initialRules,
  initialAuditIssues,
  initialMistakes,
  initialSessions,
  initialActivities
} from './data/mockData';
import {
  RepoConfig,
  StandardRule,
  AuditIssue,
  MistakeLogEntry,
  BobSession,
  ActivityItem
} from './types';
import avatarImg from './assets/images/avatar_developer_user_1790234289576.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Persistent or stateful items
  const [repoConfig, setRepoConfig] = useState<RepoConfig>(() => {
    const saved = localStorage.getItem('bob_repo_config');
    return saved ? JSON.parse(saved) : initialRepoConfig;
  });

  const [rules, setRules] = useState<StandardRule[]>(() => {
    const saved = localStorage.getItem('bob_rules');
    return saved ? JSON.parse(saved) : initialRules;
  });

  const [auditIssues, setAuditIssues] = useState<AuditIssue[]>(() => {
    const saved = localStorage.getItem('bob_audit_issues');
    return saved ? JSON.parse(saved) : initialAuditIssues;
  });

  const [mistakes, setMistakes] = useState<MistakeLogEntry[]>(() => {
    const saved = localStorage.getItem('bob_mistakes');
    return saved ? JSON.parse(saved) : initialMistakes;
  });

  const [sessions, setSessions] = useState<BobSession[]>(() => {
    const saved = localStorage.getItem('bob_sessions');
    return saved ? JSON.parse(saved) : initialSessions;
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem('bob_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  // Modal visibility states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [isAddMistakeOpen, setIsAddMistakeOpen] = useState(false);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('bob_repo_config', JSON.stringify(repoConfig));
  }, [repoConfig]);

  useEffect(() => {
    localStorage.setItem('bob_rules', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('bob_audit_issues', JSON.stringify(auditIssues));
  }, [auditIssues]);

  useEffect(() => {
    localStorage.setItem('bob_mistakes', JSON.stringify(mistakes));
  }, [mistakes]);

  useEffect(() => {
    localStorage.setItem('bob_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('bob_activities', JSON.stringify(activities));
  }, [activities]);

  // Handlers
  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const handleAddRule = (newRule: StandardRule) => {
    setRules((prev) => [newRule, ...prev]);
    // Add activity
    const newAct: ActivityItem = {
      id: `ACT-${Date.now()}`,
      type: 'rule_updated',
      title: `New Standard Added: ${newRule.id}`,
      detail: newRule.title,
      timestamp: 'Just now'
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleAddMistake = (newMistake: MistakeLogEntry) => {
    setMistakes((prev) => [newMistake, ...prev]);
    // Add activity
    const newAct: ActivityItem = {
      id: `ACT-${Date.now()}`,
      type: 'mistake_logged',
      title: `Mistake Logged: ${newMistake.id}`,
      detail: newMistake.title,
      timestamp: 'Just now'
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleAddRuleFromIssue = (issue: AuditIssue) => {
    // Generate a Bob directive from an audit issue
    const newRule: StandardRule = {
      id: `BOB-FIX-${Math.floor(10 + Math.random() * 90)}`,
      title: `Enforce Safe Pattern for ${issue.fileName}`,
      category: 'Bob Constraints',
      severity: issue.severity,
      description: `Prevent ${issue.issue} found during repository audit.`,
      bobDirective: `MANDATORY: ${issue.suggestion}`,
      enabled: true,
      timesPrevented: 1,
      addedDate: new Date().toISOString().substring(0, 10)
    };

    setRules((prev) => [newRule, ...prev]);
    const newAct: ActivityItem = {
      id: `ACT-${Date.now()}`,
      type: 'rule_updated',
      title: `Rule Injected from Audit: ${newRule.id}`,
      detail: `Targeting ${issue.fileName} issue.`,
      timestamp: 'Just now'
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleImportSession = (session: BobSession, importedMistakes: MistakeLogEntry[]) => {
    setSessions((prev) => [session, ...prev]);
    setMistakes((prev) => [...importedMistakes, ...prev]);
    const newAct: ActivityItem = {
      id: `ACT-${Date.now()}`,
      type: 'session_finished',
      title: `Session imported: ${session.taskTitle}`,
      detail: `${importedMistakes.length} candidate mistake(s) flagged for review.`,
      timestamp: 'Just now'
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleAuditComplete = (foundIssues: AuditIssue[], filesScanned: number) => {
    setAuditIssues(foundIssues);
    const newAct: ActivityItem = {
      id: `ACT-${Date.now()}`,
      type: 'audit',
      title: 'Repository audit completed',
      detail: `Scanned ${filesScanned} files. ${foundIssues.length} issues found against active standards.`,
      timestamp: 'Just now'
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleUpdateRepoUrl = (newUrl: string) => {
    // Extract repo name if possible
    let name = repoConfig.repoName;
    try {
      const parts = newUrl.replace('https://github.com/', '').split('/');
      if (parts.length >= 2) {
        name = `${parts[0]}/${parts[1]}`;
      }
    } catch {
      // keep existing name
    }

    setRepoConfig((prev) => ({
      ...prev,
      repoUrl: newUrl,
      repoName: name,
      lastScanned: new Date().toISOString().replace('T', ' ').substring(0, 16)
    }));
    // Note: the "audit completed" activity entry is now added by
    // handleAuditComplete, once real results come back from the scan.
  };

  const handleResetDefaults = () => {
    setRepoConfig(initialRepoConfig);
    setRules(initialRules);
    setAuditIssues(initialAuditIssues);
    setMistakes(initialMistakes);
    setSessions(initialSessions);
    setActivities(initialActivities);
    localStorage.clear();
  };

  return (
    <div className="min-h-screen bg-[#1c2b4a] text-slate-100 flex flex-col font-sans">
      {/* 1. Top Bar */}
      <TopBar
        repoConfig={repoConfig}
        onOpenExport={() => setIsExportModalOpen(true)}
        onSelectTab={setActiveTab}
        avatarSrc={avatarImg}
      />

      {/* Main Workspace: Left Sidebar + Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Nav */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          issuesCount={auditIssues.length}
          mistakesCount={mistakes.length}
          rulesCount={rules.length}
          activeSessionsCount={sessions.filter((s) => s.status === 'Active').length}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                rules={rules}
                mistakes={mistakes}
                sessions={sessions}
                activities={activities}
                repoConfig={repoConfig}
                auditIssues={auditIssues}
                onNavigate={setActiveTab}
                onOpenExport={() => setIsExportModalOpen(true)}
                onOpenHandover={() => setIsHandoverModalOpen(true)}
                onOpenAddMistake={() => setIsAddMistakeOpen(true)}
              />
            )}

            {activeTab === 'repo-audit' && (
              <RepoAuditView
                issues={auditIssues}
                currentRepoUrl={repoConfig.repoUrl}
                onUpdateRepoUrl={handleUpdateRepoUrl}
                onAuditComplete={handleAuditComplete}
                onAddRuleFromIssue={handleAddRuleFromIssue}
                onNavigateToStandards={() => setActiveTab('standards')}
              />
            )}

            {activeTab === 'standards' && (
              <StandardsView
                rules={rules}
                onToggleRule={handleToggleRule}
                onDeleteRule={handleDeleteRule}
                onOpenAddRule={() => setIsAddRuleOpen(true)}
                onOpenExport={() => setIsExportModalOpen(true)}
              />
            )}

            {activeTab === 'mistake-log' && (
              <MistakeLogView
                mistakes={mistakes}
                onOpenAddMistake={() => setIsAddMistakeOpen(true)}
                onNavigateToStandards={() => setActiveTab('standards')}
              />
            )}

            {activeTab === 'bob-sessions' && (
              <BobSessionsView
                sessions={sessions}
                rules={rules}
                onNavigateToStandards={() => setActiveTab('standards')}
                onImportSession={handleImportSession}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                repoConfig={repoConfig}
                onSaveRepoConfig={setRepoConfig}
                onResetDefaults={handleResetDefaults}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ExportRulesModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        rules={rules}
        repoConfig={repoConfig}
      />

      <ExportHandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        repoConfig={repoConfig}
        rules={rules}
        auditIssues={auditIssues}
        mistakes={mistakes}
      />

      <AddMistakeModal
        isOpen={isAddMistakeOpen}
        onClose={() => setIsAddMistakeOpen(false)}
        onAddMistake={handleAddMistake}
        existingRules={rules}
      />

      <AddRuleModal
        isOpen={isAddRuleOpen}
        onClose={() => setIsAddRuleOpen(false)}
        onAddRule={handleAddRule}
      />
    </div>
  );
}
