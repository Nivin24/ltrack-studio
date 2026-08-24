import React, { useState, useMemo } from 'react';
import { useLTrack } from '../context/LTrackContext';
import {
  GitBranch,
  GitPullRequest,
  GitCommit as GitCommitIcon,
  ExternalLink,
  Plus,
  ShieldCheck,
  Award,
  Code2,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  GitFork,
  ThumbsUp,
  BookOpen,
  Bug,
  FileText,
  Zap,
  FlaskConical,
  Wrench,
  CircleDot,
  Clock,
  GitMerge,
  CheckCircle2
} from 'lucide-react';

export const GitHubActivityView: React.FC = () => {
  const { gitCommits, pullRequests, gitQuality, addGitCommit } = useLTrack();

  const [activeTab, setActiveTab] = useState<'commits' | 'prs' | 'guide' | 'quality'>('commits');

  // Commit Filters
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [commitSearch, setCommitSearch] = useState('');

  // PR Filters
  const [prStatusFilter, setPrStatusFilter] = useState<'all' | 'open' | 'in_review' | 'merged'>('all');

  // Expanded Commit Diff ID
  const [expandedCommitId, setExpandedCommitId] = useState<string | null>(gitCommits[0]?.id || null);

  // Copy Hash State
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Author Commit Modal State
  const [showAddCommitModal, setShowAddCommitModal] = useState(false);
  const [commitType, setCommitType] = useState<'feat' | 'fix' | 'docs' | 'refactor' | 'test' | 'chore'>('feat');
  const [commitScope, setCommitScope] = useState('auth');
  const [commitSubject, setCommitSubject] = useState('');
  const [commitBranch, setCommitBranch] = useState('feature/oauth2-jwt');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Approved PRs locally tracked for friendly interaction
  const [approvedPRs, setApprovedPRs] = useState<Record<string, boolean>>({});

  // Friendly Commit Type Presets with Lucide Icons (Zero Unicode Emojis)
  const commitPresets = [
    { type: 'feat', icon: Sparkles, title: 'New Feature', desc: 'Added something new', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.35)' },
    { type: 'fix', icon: Bug, title: 'Bug Fix', desc: 'Resolved a bug or issue', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.35)' },
    { type: 'docs', icon: FileText, title: 'Documentation', desc: 'Updated README or notes', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.35)' },
    { type: 'refactor', icon: Zap, title: 'Refactor', desc: 'Improved code structure', color: '#d4a373', bg: 'rgba(212, 163, 115, 0.15)', border: 'rgba(212, 163, 115, 0.35)' },
    { type: 'test', icon: FlaskConical, title: 'Tests', desc: 'Added automated test cases', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.35)' },
    { type: 'chore', icon: Wrench, title: 'Chore', desc: 'Package or config tweak', color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.08)', border: 'rgba(255, 255, 255, 0.15)' }
  ];

  const getPreset = (type: string) => {
    return commitPresets.find((p) => p.type === type) || commitPresets[0];
  };

  // Filtered Commits List
  const filteredCommits = useMemo(() => {
    return gitCommits.filter((c) => {
      if (selectedBranch !== 'all' && c.branch !== selectedBranch) return false;
      if (selectedType !== 'all' && c.type !== selectedType) return false;
      if (commitSearch.trim()) {
        const q = commitSearch.toLowerCase();
        const matchMsg = c.message.toLowerCase().includes(q);
        const matchAuthor = c.authorName.toLowerCase().includes(q);
        const matchHash = c.hash.toLowerCase().includes(q);
        if (!matchMsg && !matchAuthor && !matchHash) return false;
      }
      return true;
    });
  }, [gitCommits, selectedBranch, selectedType, commitSearch]);

  // Filtered Pull Requests
  const filteredPRs = useMemo(() => {
    return pullRequests.filter((pr) => {
      if (prStatusFilter !== 'all' && pr.status !== prStatusFilter) return false;
      return true;
    });
  }, [pullRequests, prStatusFilter]);

  // Unique Branches list
  const branches = useMemo(() => {
    const set = new Set<string>();
    gitCommits.forEach((c) => set.add(c.branch));
    pullRequests.forEach((pr) => set.add(pr.branch));
    set.add('main');
    return Array.from(set);
  }, [gitCommits, pullRequests]);

  const handleCopyHash = (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Formatted preview commit message
  const fullCommitMessage = commitScope.trim()
    ? `${commitType}(${commitScope.trim()}): ${commitSubject.trim()}`
    : `${commitType}: ${commitSubject.trim()}`;

  // Friendly Live Linter Validation
  const linterValidation = useMemo(() => {
    if (!commitSubject.trim()) {
      return { score: 0, isValid: false, feedback: 'Type a brief note of what you created or fixed.' };
    }
    const isImperative = !commitSubject.toLowerCase().startsWith('added') && !commitSubject.toLowerCase().startsWith('fixed');

    let score = 60;
    if (commitScope.trim()) score += 20;
    if (isImperative) score += 10;
    if (commitSubject.length <= 72) score += 10;

    return {
      score,
      isValid: score >= 80,
      feedback: score >= 85
        ? 'Excellent message! Clear, concise, and easy for teammates to understand.'
        : !isImperative
        ? 'Friendly tip: Try using present action words like "add", "fix", or "update" (e.g. "add login validation").'
        : 'Looking good! Keeping it short makes git logs easy to read for everyone.'
    };
  }, [commitScope, commitSubject]);

  const handleCreateCommit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitSubject.trim()) return;

    addGitCommit(fullCommitMessage, commitBranch);
    setCommitSubject('');
    setShowAddCommitModal(false);
    setToastMessage(`Successfully committed and pushed to ${commitBranch}!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleApprovePR = (prId: string) => {
    setApprovedPRs((prev) => {
      const next = !prev[prId];
      if (next) {
        setToastMessage(`You approved this Pull Request! Great peer review teamwork.`);
        setTimeout(() => setToastMessage(null), 2500);
      }
      return { ...prev, [prId]: next };
    });
  };

  const teamAverageScore = Math.round(
    gitQuality.reduce((acc, q) => acc + q.overallScore, 0) / Math.max(gitQuality.length, 1)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: 'rgba(20, 20, 26, 0.95)', border: '1px solid #34d399', color: '#34d399', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)', fontWeight: 700, fontSize: '0.84rem', animation: 'appleFadeIn 0.2s ease', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Friendly Header Banner */}
      <div className="glass-panel" style={{ padding: '24px 28px', background: 'linear-gradient(135deg, rgba(20, 20, 26, 0.95) 0%, rgba(30, 30, 42, 0.85) 100%)', border: '1px solid rgba(212, 163, 115, 0.22)', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-learning" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GitBranch size={12} /> Team Git Activity & Code Stories
              </span>
              <span style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} /> {teamAverageScore}% Clean Code Rating
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#eae6e1', letterSpacing: '-0.02em', margin: 0 }}>
              Team Code Stories & GitHub Studio
            </h1>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              See what your teammates built today, celebrate pull requests, and share clean code with simple presets.
            </p>
          </div>

          {/* Friendly Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddCommitModal(true)}
              className="btn btn-primary"
              style={{ padding: '9px 18px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '12px' }}
            >
              <Plus size={15} /> Push a Code Story
            </button>

            <a
              href="https://github.com/Nivin24/ltrack-studio"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ padding: '9px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', borderRadius: '12px' }}
            >
              <Code2 size={15} /> View Repository <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Friendly Studio Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', flexWrap: 'wrap' }}>
          {[
            { id: 'commits', label: `Code Stories (${gitCommits.length})`, icon: GitCommitIcon },
            { id: 'prs', label: `Pull Requests (${pullRequests.length})`, icon: GitPullRequest },
            { id: 'guide', label: 'Git Made Simple', icon: BookOpen },
            { id: 'quality', label: 'Team Git Champions', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid rgba(212, 163, 115, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isActive ? 'rgba(212, 163, 115, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#d4a373' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} color={isActive ? '#d4a373' : 'currentColor'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: CODE STORIES (COMMITS FEED) */}
      {activeTab === 'commits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Friendly Filters Toolbar */}
          <div className="glass-panel" style={{ padding: '14px 18px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Branch Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 600 }}>Branch:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="form-control"
                  style={{ padding: '5px 10px', fontSize: '0.76rem', width: 'auto', background: 'rgba(255, 255, 255, 0.05)', color: '#eae6e1', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                >
                  <option value="all">All Branches ({gitCommits.length})</option>
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Commit Type Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedType('all')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: selectedType === 'all' ? 700 : 500,
                    cursor: 'pointer',
                    background: selectedType === 'all' ? 'rgba(212, 163, 115, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: selectedType === 'all' ? '#d4a373' : 'var(--text-dim)',
                    border: selectedType === 'all' ? '1px solid rgba(212, 163, 115, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  All Types
                </button>
                {commitPresets.slice(0, 5).map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.type}
                      onClick={() => setSelectedType(p.type)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: selectedType === p.type ? 700 : 500,
                        cursor: 'pointer',
                        background: selectedType === p.type ? p.bg : 'rgba(255, 255, 255, 0.04)',
                        color: selectedType === p.type ? p.color : 'var(--text-dim)',
                        border: selectedType === p.type ? `1px solid ${p.border}` : '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Icon size={13} color={p.color} />
                      <span>{p.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Keyword Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '5px 10px' }}>
              <Search size={13} color="#d4a373" />
              <input
                type="text"
                value={commitSearch}
                onChange={(e) => setCommitSearch(e.target.value)}
                placeholder="Search commit or friend..."
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#eae6e1', fontSize: '0.75rem', width: '180px' }}
              />
            </div>
          </div>

          {/* Friendly Commits Story Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredCommits.length === 0 ? (
              <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No code stories match your filter. Try selecting "All Branches".
              </div>
            ) : (
              filteredCommits.map((commit) => {
                const preset = getPreset(commit.type);
                const Icon = preset.icon;
                const isExpanded = expandedCommitId === commit.id;

                return (
                  <div
                    key={commit.id}
                    className="glass-panel"
                    style={{
                      background: 'rgba(20, 20, 26, 0.85)',
                      border: isExpanded ? '1px solid rgba(212, 163, 115, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Story Header */}
                    <div
                      onClick={() => setExpandedCommitId(isExpanded ? null : commit.id)}
                      style={{
                        padding: '16px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                        <img
                          src={commit.authorAvatar}
                          alt={commit.authorName}
                          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-copper)', flexShrink: 0 }}
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: preset.bg, color: preset.color, border: `1px solid ${preset.border}`, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                              <Icon size={12} color={preset.color} />
                              <span>{preset.title}</span>
                            </span>

                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#eae6e1' }}>
                              {commit.authorName}
                            </span>

                            <span style={{ fontSize: '0.72rem', color: '#d4a373', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <GitBranch size={11} /> {commit.branch}
                            </span>

                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                              • {commit.timestamp}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#eae6e1', margin: 0, lineHeight: 1.4 }}>
                            {commit.message}
                          </h4>
                        </div>
                      </div>

                      {/* Right Hash & Expand */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                        <button
                          onClick={(e) => handleCopyHash(commit.hash, e)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            color: copiedHash === commit.hash ? '#34d399' : 'var(--text-muted)',
                            fontSize: '0.72rem',
                            fontFamily: 'monospace',
                            cursor: 'pointer'
                          }}
                          title="Copy commit hash"
                        >
                          {copiedHash === commit.hash ? <Check size={11} /> : <Copy size={11} />}
                          <span>#{commit.hash}</span>
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399', fontSize: '0.78rem', fontWeight: 700 }}>
                          <ShieldCheck size={14} /> {commit.conventionalScore}%
                        </div>

                        {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                      </div>
                    </div>

                    {/* Expandable Story Details */}
                    {isExpanded && (
                      <div style={{ padding: '14px 20px', background: 'rgba(0, 0, 0, 0.25)', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(212, 163, 115, 0.08)', border: '1px solid rgba(212, 163, 115, 0.2)', padding: '8px 12px', borderRadius: '10px', fontSize: '0.78rem', color: '#eae6e1' }}>
                          <Sparkles size={14} color="#d4a373" style={{ flexShrink: 0 }} />
                          <span><strong>Feedback:</strong> {commit.qualityFeedback}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: '#34d399', fontWeight: 700 }}>+64 additions</span>
                            <span style={{ color: '#ef4444', fontWeight: 700 }}>-12 deletions</span>
                            <span>in 3 modified files</span>
                          </div>

                          <a
                            href={`https://github.com/Nivin24/ltrack-studio/commit/${commit.hash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', borderRadius: '8px' }}
                          >
                            Open on GitHub <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PULL REQUESTS LOUNGE */}
      {activeTab === 'prs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* PR Filter Pills */}
          <div className="glass-panel" style={{ padding: '12px 18px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'all', label: `All PRs (${pullRequests.length})`, icon: GitPullRequest },
                { id: 'open', label: 'Open for Review', icon: CircleDot },
                { id: 'in_review', label: 'In Progress', icon: Clock },
                { id: 'merged', label: 'Merged', icon: GitMerge }
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setPrStatusFilter(f.id as typeof prStatusFilter)}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '10px',
                      fontSize: '0.74rem',
                      fontWeight: prStatusFilter === f.id ? 700 : 500,
                      cursor: 'pointer',
                      background: prStatusFilter === f.id ? '#d4a373' : 'rgba(255, 255, 255, 0.04)',
                      color: prStatusFilter === f.id ? '#0e0e12' : 'var(--text-muted)',
                      border: prStatusFilter === f.id ? '1px solid #d4a373' : '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Icon size={12} />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Friendly PR Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
            {filteredPRs.map((pr) => {
              const isApprovedByMe = approvedPRs[pr.id];

              return (
                <div
                  key={pr.id}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    background: 'rgba(20, 20, 26, 0.85)',
                    border: '1px solid rgba(212, 163, 115, 0.16)',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className={`badge badge-${pr.status === 'merged' ? 'completed' : pr.status === 'open' ? 'learning' : 'not_started'}`} style={{ fontSize: '0.72rem' }}>
                        <GitPullRequest size={12} style={{ marginRight: '4px' }} />
                        PR #{pr.prNumber} • {pr.status.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{pr.createdAt}</span>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#eae6e1', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                      {pr.title}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      <img src={pr.userAvatar} alt={pr.userName} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--accent-copper)' }} />
                      <span>by <strong style={{ color: '#eae6e1' }}>{pr.userName}</strong></span>
                      <span>• branch: <code style={{ color: '#d4a373' }}>{pr.branch}</code></span>
                    </div>

                    {/* Reviewers Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 0, 0, 0.25)', padding: '8px 12px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>Reviewers:</span>
                      {pr.reviewers.map((r, idx) => (
                        <span key={idx} style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                          @{r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => handleToggleApprovePR(pr.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: isApprovedByMe ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: isApprovedByMe ? '#34d399' : 'var(--text-muted)',
                        border: isApprovedByMe ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <ThumbsUp size={13} /> {isApprovedByMe ? 'Approved' : 'Give Thumbs Up'}
                    </button>

                    <a
                      href={pr.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', borderRadius: '8px' }}
                    >
                      Review on GitHub <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: GIT MADE SIMPLE (CHEATSHEET FOR EVERYONE) */}
      {activeTab === 'guide' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          
          {/* Card 1: 3 Rules of Clean Commits */}
          <div className="glass-panel" style={{ padding: '22px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#d4a373" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                The 3 Friendly Rules of Clean Commits
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Writing clean commit messages helps your teammates immediately understand what changed without reading all the raw code.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '10px 12px' }}>
                <strong style={{ color: '#34d399', fontSize: '0.8rem', display: 'block' }}>1. Pick the Right Type:</strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}><code>feat</code> for features, <code>fix</code> for bugs, <code>docs</code> for documentation.</span>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '10px 12px' }}>
                <strong style={{ color: '#38bdf8', fontSize: '0.8rem', display: 'block' }}>2. Use Action Words:</strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Write <code>add login route</code> instead of <code>added login route</code>.</span>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '10px 12px' }}>
                <strong style={{ color: '#d4a373', fontSize: '0.8rem', display: 'block' }}>3. Keep it Short & Sweet:</strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Aim for under 50 characters in your commit subject.</span>
              </div>
            </div>
          </div>

          {/* Card 2: Preset Icon Cheat Sheet */}
          <div className="glass-panel" style={{ padding: '22px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={18} color="#34d399" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                Quick Preset Cheat Sheet
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {commitPresets.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon size={14} color={p.color} />
                      <code style={{ color: p.color, fontWeight: 700, fontSize: '0.78rem' }}>{p.type}</code>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{p.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Branch Hygiene */}
          <div className="glass-panel" style={{ padding: '22px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitFork size={18} color="#38bdf8" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                Branching Made Friendly
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Create small, focused branches so your pull requests are easy to review in 5 minutes!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.3)', fontFamily: 'monospace', fontSize: '0.76rem', color: '#34d399' }}>
                git checkout -b feature/my-feature
              </div>
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.3)', fontFamily: 'monospace', fontSize: '0.76rem', color: '#38bdf8' }}>
                git commit -m "feat(api): add user endpoint"
              </div>
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.3)', fontFamily: 'monospace', fontSize: '0.76rem', color: '#d4a373' }}>
                git push origin feature/my-feature
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: TEAM GIT CHAMPIONS */}
      {activeTab === 'quality' && (
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#d4a373" /> Team Git Champions Leaderboard
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Celebrating teammates who keep code clean, write helpful PR reviews, and push clean commits.
              </p>
            </div>
            <span className="badge badge-completed" style={{ fontSize: '0.72rem' }}>
              Team Clean Code Rating: {teamAverageScore}%
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {gitQuality.map((mem, idx) => (
              <div
                key={mem.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: idx === 0 ? '#d4a373' : 'var(--text-dim)', width: '24px' }}>
                    #{idx + 1}
                  </span>

                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#eae6e1', margin: 0 }}>
                      {mem.userName}
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {mem.conventionalCommitsCount}/{mem.totalCommitsCount} Clean Commits • {mem.prsReviewed} Reviews Shared
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
                      +{mem.linesAdded} / -{mem.linesDeleted}
                    </div>
                    <span style={{ fontSize: '0.64rem', color: 'var(--text-dim)' }}>Lines Built</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d4a373' }}>
                      {mem.overallScore}%
                    </span>
                    <span style={{ fontSize: '0.64rem', color: 'var(--text-dim)', display: 'block' }}>Clean Rating</span>
                  </div>

                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: mem.grade === 'A+' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(212, 163, 115, 0.2)',
                    border: mem.grade === 'A+' ? '1px solid #34d399' : '1px solid #d4a373',
                    color: mem.grade === 'A+' ? '#34d399' : '#d4a373',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem'
                  }}>
                    {mem.grade}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. FRIENDLY "COMMIT BUILDER" MODAL WITH 1-CLICK PRESETS */}
      {showAddCommitModal && (
        <div className="modal-overlay" onClick={() => setShowAddCommitModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', background: 'rgba(20, 20, 26, 0.96)', border: '1px solid rgba(212, 163, 115, 0.35)', borderRadius: '20px', padding: '26px' }}>
            
            {/* Modal Header */}
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#d4a373" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                  Share a Code Story & Push Commit
                </h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Select what kind of change you made and type a brief description. We'll format it cleanly!
              </p>
            </div>

            <form onSubmit={handleCreateCommit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* 1-Click Type Presets Grid */}
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  What kind of change is this?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {commitPresets.map((p) => {
                    const isSelected = commitType === p.type;
                    const Icon = p.icon;
                    return (
                      <button
                        type="button"
                        key={p.type}
                        onClick={() => setCommitType(p.type as any)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          background: isSelected ? p.bg : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? `1.5px solid ${p.color}` : '1px solid rgba(255, 255, 255, 0.06)',
                          color: isSelected ? p.color : 'var(--text-muted)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon size={14} color={p.color} />
                          <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{p.title}</span>
                        </div>
                        <span style={{ fontSize: '0.64rem', color: 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
                          {p.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scope Quick Select & Custom Scope */}
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  What area of the app? (Scope)
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {['auth', 'api', 'database', 'ui', 'docker', 'sandbox', 'models'].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setCommitScope(s)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: commitScope === s ? 700 : 500,
                        cursor: 'pointer',
                        background: commitScope === s ? '#d4a373' : 'rgba(255, 255, 255, 0.04)',
                        color: commitScope === s ? '#0e0e12' : 'var(--text-muted)',
                        border: commitScope === s ? '1px solid #d4a373' : '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="form-control"
                  value={commitScope}
                  onChange={(e) => setCommitScope(e.target.value)}
                  placeholder="Or type custom scope (e.g. settings, router)"
                  style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#eae6e1', fontSize: '0.8rem' }}
                />
              </div>

              {/* What did you do? (Subject) */}
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  What change did you make? (Description)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={commitSubject}
                  onChange={(e) => setCommitSubject(e.target.value)}
                  placeholder="e.g. add user profile picture upload"
                  style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#eae6e1', fontSize: '0.84rem' }}
                  required
                />
              </div>

              {/* Target Branch */}
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Target Branch
                </label>
                <select
                  value={commitBranch}
                  onChange={(e) => setCommitBranch(e.target.value)}
                  className="form-control"
                  style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#eae6e1', fontSize: '0.8rem' }}
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Friendly Live Preview & Score */}
              <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  HOW YOUR COMMIT WILL LOOK:
                </span>
                <code style={{ fontSize: '0.88rem', color: '#34d399', fontWeight: 700, fontFamily: 'monospace' }}>
                  {fullCommitMessage}
                </code>

                <div style={{ marginTop: '8px', fontSize: '0.74rem', color: linterValidation.isValid ? '#34d399' : '#d4a373' }}>
                  {linterValidation.feedback}
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCommitModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '9px 18px', fontSize: '0.8rem', borderRadius: '10px' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '9px 20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
                >
                  <Sparkles size={14} /> Share & Push Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
