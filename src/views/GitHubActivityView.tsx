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
  FileCode,
  Sparkles,
  GitFork
} from 'lucide-react';

export const GitHubActivityView: React.FC = () => {
  const { gitCommits, pullRequests, gitQuality, addGitCommit } = useLTrack();

  const [activeTab, setActiveTab] = useState<'commits' | 'prs' | 'quality' | 'branches'>('commits');

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
  const [commitType, setCommitType] = useState('feat');
  const [commitScope, setCommitScope] = useState('auth');
  const [commitSubject, setCommitSubject] = useState('');
  const [commitBranch, setCommitBranch] = useState('feature/oauth2-jwt');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Conventional Tag Colors & Badges
  const getConventionalTagColor = (type: string) => {
    switch (type) {
      case 'feat':
        return { bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399', border: 'rgba(52, 211, 153, 0.3)', label: 'Feature' };
      case 'fix':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)', label: 'Bug Fix' };
      case 'docs':
        return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)', label: 'Docs' };
      case 'refactor':
        return { bg: 'rgba(212, 163, 115, 0.15)', text: '#d4a373', border: 'rgba(212, 163, 115, 0.3)', label: 'Refactor' };
      case 'test':
        return { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)', label: 'Tests' };
      case 'chore':
      default:
        return { bg: 'rgba(255, 255, 255, 0.08)', text: 'var(--text-muted)', border: 'rgba(255, 255, 255, 0.12)', label: 'Chore' };
    }
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

  // Handle Commit Copy
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

  // Live Conventional Commit Validator Score
  const linterValidation = useMemo(() => {
    if (!commitSubject.trim()) {
      return { score: 0, isValid: false, feedback: 'Enter a concise subject describing the change.' };
    }
    const hasValidType = ['feat', 'fix', 'docs', 'refactor', 'test', 'chore'].includes(commitType);
    const isImperative = !commitSubject.toLowerCase().startsWith('added') && !commitSubject.toLowerCase().startsWith('fixed');
    const isShort = commitSubject.length <= 72;

    let score = 50;
    if (hasValidType) score += 20;
    if (commitScope.trim()) score += 15;
    if (isImperative) score += 10;
    if (isShort) score += 5;

    return {
      score,
      isValid: score >= 80,
      feedback: score >= 85
        ? '✓ Perfect conventional commit format!'
        : !isImperative
        ? 'Tip: Use imperative verbs like "add", "fix", "update" instead of past tense "added".'
        : 'Ensure message is under 72 characters and specifies a clear scope.'
    };
  }, [commitType, commitScope, commitSubject]);

  const handleCreateCommit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitSubject.trim()) return;

    addGitCommit(fullCommitMessage, commitBranch);
    setCommitSubject('');
    setShowAddCommitModal(false);
    setToastMessage(`✓ Committed and pushed to ${commitBranch}!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Average Team Conventional Score
  const teamAverageScore = Math.round(
    gitQuality.reduce((acc, q) => acc + q.overallScore, 0) / Math.max(gitQuality.length, 1)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: 'rgba(20, 20, 26, 0.95)', border: '1px solid #34d399', color: '#34d399', padding: '10px 18px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)', fontWeight: 700, fontSize: '0.84rem', animation: 'appleFadeIn 0.2s ease' }}>
          {toastMessage}
        </div>
      )}

      {/* 1. Header Banner & Studio Telemetry */}
      <div className="glass-panel" style={{ padding: '22px 28px', background: 'linear-gradient(135deg, rgba(20, 20, 26, 0.95) 0%, rgba(30, 30, 42, 0.85) 100%)', border: '1px solid rgba(212, 163, 115, 0.22)', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-learning" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GitBranch size={12} /> Git Studio & Quality Engine
              </span>
              <span style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} /> {teamAverageScore}% Team Hygiene Rating (Grade A)
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#eae6e1', letterSpacing: '-0.02em', margin: 0 }}>
              Git Quality Studio & Branch Activity
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              Automated conventional commit linting, visual diff inspector, Pull Request reviews, and group hygiene leaderboard.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddCommitModal(true)}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} /> Author & Push Commit
            </button>

            <a
              href="https://github.com/Nivin24/ltrack-studio"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <Code2 size={15} /> GitHub Repo <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Studio Tabs Navigation */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', flexWrap: 'wrap' }}>
          {[
            { id: 'commits', label: `Commits Timeline (${gitCommits.length})`, icon: GitCommitIcon },
            { id: 'prs', label: `Pull Requests (${pullRequests.length})`, icon: GitPullRequest },
            { id: 'quality', label: 'Hygiene & Quality Radar', icon: Award },
            { id: 'branches', label: `Active Branches (${branches.length})`, icon: GitFork }
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

      {/* TAB 1: COMMITS TIMELINE & EXPANDABLE DIFF INSPECTOR */}
      {activeTab === 'commits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Toolbar: Branch Selector + Type Filter + Search */}
          <div className="glass-panel" style={{ padding: '14px 18px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Branch Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>BRANCH:</span>
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

              {/* Commit Type Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {['all', 'feat', 'fix', 'docs', 'refactor', 'test'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: selectedType === t ? 700 : 500,
                      cursor: 'pointer',
                      background: selectedType === t ? 'rgba(212, 163, 115, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: selectedType === t ? '#d4a373' : 'var(--text-dim)',
                      border: selectedType === t ? '1px solid rgba(212, 163, 115, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '5px 10px' }}>
              <Search size={13} color="#d4a373" />
              <input
                type="text"
                value={commitSearch}
                onChange={(e) => setCommitSearch(e.target.value)}
                placeholder="Search commit hash or message..."
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#eae6e1', fontSize: '0.75rem', width: '200px' }}
              />
            </div>
          </div>

          {/* Commits List Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredCommits.length === 0 ? (
              <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No commits match the selected branch or type filters.
              </div>
            ) : (
              filteredCommits.map((commit) => {
                const tagStyle = getConventionalTagColor(commit.type);
                const isExpanded = expandedCommitId === commit.id;

                return (
                  <div
                    key={commit.id}
                    className="glass-panel"
                    style={{
                      background: 'rgba(20, 20, 26, 0.85)',
                      border: isExpanded ? '1px solid rgba(212, 163, 115, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Commit Row Header */}
                    <div
                      onClick={() => setExpandedCommitId(isExpanded ? null : commit.id)}
                      style={{
                        padding: '14px 18px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                        <img
                          src={commit.authorAvatar}
                          alt={commit.authorName}
                          style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-copper)', flexShrink: 0 }}
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                            <span style={{ fontSize: '0.68rem', padding: '1px 7px', borderRadius: '5px', background: tagStyle.bg, color: tagStyle.text, border: `1px solid ${tagStyle.border}`, fontWeight: 700, fontFamily: 'monospace' }}>
                              {commit.type.toUpperCase()}
                            </span>

                            <button
                              onClick={(e) => handleCopyHash(commit.hash, e)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                color: copiedHash === commit.hash ? '#34d399' : 'var(--text-muted)',
                                fontSize: '0.7rem',
                                fontFamily: 'monospace',
                                cursor: 'pointer'
                              }}
                              title="Click to copy hash"
                            >
                              {copiedHash === commit.hash ? <Check size={10} /> : <Copy size={10} />}
                              <span>{commit.hash}</span>
                            </button>

                            <span style={{ fontSize: '0.72rem', color: '#d4a373', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <GitBranch size={11} /> {commit.branch}
                            </span>

                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                              • {commit.authorName} • {commit.timestamp}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '0.86rem', fontWeight: 600, color: '#eae6e1', fontFamily: 'monospace', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {commit.message}
                          </h4>
                        </div>
                      </div>

                      {/* Right Score & Expand Indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                            <ShieldCheck size={14} color="#34d399" />
                            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: commit.conventionalScore >= 90 ? '#34d399' : '#d4a373' }}>
                              {commit.conventionalScore}%
                            </span>
                          </div>
                          <span style={{ fontSize: '0.64rem', color: 'var(--text-dim)' }}>Hygiene Score</span>
                        </div>

                        {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                      </div>
                    </div>

                    {/* Expandable Inline Diff & Feedback Panel */}
                    {isExpanded && (
                      <div style={{ padding: '14px 18px', background: 'rgba(0, 0, 0, 0.3)', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Quality Feedback Callout */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(212, 163, 115, 0.08)', border: '1px solid rgba(212, 163, 115, 0.2)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', color: '#eae6e1' }}>
                          <Sparkles size={14} color="#d4a373" style={{ flexShrink: 0 }} />
                          <span><strong>AI Quality Linter:</strong> {commit.qualityFeedback}</span>
                        </div>

                        {/* Simulated Diff File Breakdown */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--text-muted)', paddingTop: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FileCode size={13} color="#38bdf8" /> 3 files modified
                            </span>
                            <span style={{ color: '#34d399', fontWeight: 700 }}>+64 lines</span>
                            <span style={{ color: '#ef4444', fontWeight: 700 }}>-12 lines</span>
                          </div>

                          <a
                            href={`https://github.com/Nivin24/ltrack-studio/commit/${commit.hash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                          >
                            View Raw Diff on GitHub <ExternalLink size={11} />
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

      {/* TAB 2: PULL REQUESTS COLLABORATION BOARD */}
      {activeTab === 'prs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* PR Filter Pills */}
          <div className="glass-panel" style={{ padding: '12px 18px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'all', label: `All PRs (${pullRequests.length})` },
                { id: 'open', label: '🟢 Open' },
                { id: 'in_review', label: '🟡 In Review' },
                { id: 'merged', label: '🟣 Merged' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPrStatusFilter(f.id as typeof prStatusFilter)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: prStatusFilter === f.id ? 700 : 500,
                    cursor: 'pointer',
                    background: prStatusFilter === f.id ? '#d4a373' : 'rgba(255, 255, 255, 0.04)',
                    color: prStatusFilter === f.id ? '#0e0e12' : 'var(--text-muted)',
                    border: prStatusFilter === f.id ? '1px solid #d4a373' : '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* PR Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {filteredPRs.map((pr) => (
              <div
                key={pr.id}
                className="glass-panel"
                style={{
                  padding: '18px',
                  background: 'rgba(20, 20, 26, 0.85)',
                  border: '1px solid rgba(212, 163, 115, 0.16)',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className={`badge badge-${pr.status === 'merged' ? 'completed' : pr.status === 'open' ? 'learning' : 'not_started'}`} style={{ fontSize: '0.7rem' }}>
                      <GitPullRequest size={11} style={{ marginRight: '4px' }} />
                      PR #{pr.prNumber} • {pr.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{pr.createdAt}</span>
                  </div>

                  <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#eae6e1', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                    {pr.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    <img src={pr.userAvatar} alt={pr.userName} style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span>by <strong style={{ color: '#eae6e1' }}>{pr.userName}</strong></span>
                    <span>• branch: <code style={{ color: '#d4a373' }}>{pr.branch}</code></span>
                  </div>

                  {/* Reviewers Avatar Stack */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 0, 0, 0.25)', padding: '6px 10px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 600 }}>Reviewers:</span>
                    {pr.reviewers.map((r, idx) => (
                      <span key={idx} style={{ fontSize: '0.7rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '1px 6px', borderRadius: '4px' }}>
                        @{r}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.76rem', fontFamily: 'monospace' }}>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>+{pr.additions}</span>{' '}
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>-{pr.deletions}</span> lines
                  </div>

                  <a
                    href={pr.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '5px 12px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    Review PR <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MEMBER HYGIENE & QUALITY LEADERBOARD */}
      {activeTab === 'quality' && (
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#d4a373" /> Member Conventional Commit & Hygiene Radar
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Ranked by adherence to Conventional Commits standard, PR review velocity, and branch cleanliness.
              </p>
            </div>
            <span className="badge badge-completed" style={{ fontSize: '0.72rem' }}>
              Standard: Conventional Commits v1.0
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
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#eae6e1', margin: 0 }}>
                      {mem.userName}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {mem.conventionalCommitsCount}/{mem.totalCommitsCount} Conventional Commits • {mem.prsReviewed} PRs Reviewed
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.76rem', color: '#34d399', fontWeight: 700 }}>
                      +{mem.linesAdded} / -{mem.linesDeleted}
                    </div>
                    <span style={{ fontSize: '0.64rem', color: 'var(--text-dim)' }}>Lines Changed</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d4a373' }}>
                      {mem.overallScore}%
                    </span>
                    <span style={{ fontSize: '0.64rem', color: 'var(--text-dim)', display: 'block' }}>Hygiene Score</span>
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

      {/* TAB 4: ACTIVE BRANCHES & REPO WORKFLOW */}
      {activeTab === 'branches' && (
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#eae6e1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitFork size={18} color="#d4a373" /> Active Git Branches & Head References
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Default: <code>main</code> (Protected)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {branches.map((b) => {
              const branchCommits = gitCommits.filter((c) => c.branch === b);
              const branchPR = pullRequests.find((pr) => pr.branch === b);

              return (
                <div
                  key={b}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: b === 'main' ? '#34d399' : '#d4a373', fontFamily: 'monospace' }}>
                        {b}
                      </span>
                      {b === 'main' && (
                        <span className="badge badge-completed" style={{ fontSize: '0.62rem' }}>
                          Production
                        </span>
                      )}
                    </div>

                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {branchCommits.length} commits logged
                    </span>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {branchPR ? (
                      <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>
                        PR #{branchPR.prNumber} ({branchPR.status})
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        No open PR
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setSelectedBranch(b);
                        setActiveTab('commits');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                    >
                      View Commits
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. AUTHOR COMMIT MODAL WITH REAL-TIME CONVENTIONAL LINTER */}
      {showAddCommitModal && (
        <div className="modal-overlay" onClick={() => setShowAddCommitModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', background: 'rgba(20, 20, 26, 0.96)', border: '1px solid rgba(212, 163, 115, 0.35)', borderRadius: '18px', padding: '24px' }}>
            
            {/* Modal Header */}
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#eae6e1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitCommitIcon size={20} color="#d4a373" /> Author & Push Conventional Commit
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Lint your commit message according to the Conventional Commits specification.
              </p>
            </div>

            <form onSubmit={handleCreateCommit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Type and Scope Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Type
                  </label>
                  <select
                    value={commitType}
                    onChange={(e) => setCommitType(e.target.value)}
                    className="form-control"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#eae6e1' }}
                  >
                    <option value="feat">feat (New Feature)</option>
                    <option value="fix">fix (Bug Fix)</option>
                    <option value="docs">docs (Documentation)</option>
                    <option value="refactor">refactor (Code Refactoring)</option>
                    <option value="test">test (Adding Tests)</option>
                    <option value="chore">chore (Maintenance)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Scope (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={commitScope}
                    onChange={(e) => setCommitScope(e.target.value)}
                    placeholder="e.g. auth, api, db, ui"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#eae6e1' }}
                  />
                </div>
              </div>

              {/* Subject Description */}
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Commit Subject Message
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={commitSubject}
                  onChange={(e) => setCommitSubject(e.target.value)}
                  placeholder="e.g. implement JWT token verification with Redis store"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#eae6e1' }}
                  required
                />
              </div>

              {/* Target Branch */}
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Target Branch
                </label>
                <select
                  value={commitBranch}
                  onChange={(e) => setCommitBranch(e.target.value)}
                  className="form-control"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#eae6e1' }}
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Preview Box */}
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  LIVE COMMIT PREVIEW:
                </span>
                <code style={{ fontSize: '0.84rem', color: '#34d399', fontWeight: 700, fontFamily: 'monospace' }}>
                  {fullCommitMessage}
                </code>

                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                  <span style={{ color: linterValidation.isValid ? '#34d399' : '#d4a373' }}>
                    {linterValidation.feedback}
                  </span>
                  <span style={{ fontWeight: 800, color: linterValidation.isValid ? '#34d399' : '#d4a373' }}>
                    {linterValidation.score}% Lint Score
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCommitModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.78rem' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <GitCommitIcon size={14} /> Commit & Push
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
