import React, { useState } from 'react';
import { useLTrack } from '../context/LTrackContext';
import {
  GitBranch,
  GitPullRequest,
  GitCommit as GitCommitIcon,
  ExternalLink,
  Plus,
  ShieldCheck,
  Award,
  Code2
} from 'lucide-react';

export const GitHubActivityView: React.FC = () => {
  const { gitCommits, pullRequests, gitQuality, addGitCommit } = useLTrack();
  const [activeTab, setActiveTab] = useState<'commits' | 'prs' | 'quality'>('commits');
  const [showAddCommitModal, setShowAddCommitModal] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [commitBranch, setCommitBranch] = useState('feature/oauth2-jwt');

  const handleCreateCommit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;
    addGitCommit(commitMessage, commitBranch);
    setCommitMessage('');
    setShowAddCommitModal(false);
  };

  const getConventionalTagColor = (type: string) => {
    switch (type) {
      case 'feat':
        return { bg: 'rgba(212, 163, 115, 0.15)', text: '#d4a373', border: 'rgba(212, 163, 115, 0.3)' };
      case 'fix':
        return { bg: 'rgba(196, 118, 98, 0.15)', text: '#c47662', border: 'rgba(196, 118, 98, 0.3)' };
      case 'docs':
      case 'test':
        return { bg: 'rgba(132, 156, 134, 0.15)', text: '#849c86', border: 'rgba(132, 156, 134, 0.3)' };
      case 'refactor':
        return { bg: 'rgba(229, 185, 130, 0.15)', text: '#e5b982', border: 'rgba(229, 185, 130, 0.3)' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.08)', text: 'var(--text-muted)', border: 'var(--border-color)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px 28px', background: '#1c1c1c', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <GitBranch size={22} color="#d4a373" />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#eae6e1' }}>
                GitHub Integration & Git Quality Studio
              </h1>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Real-time commit conventional linting, Pull Request reviews, and group Git engineering hygiene tracking.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowAddCommitModal(true)}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              <Plus size={16} /> Test / Push Commit
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.82rem', textDecoration: 'none' }}
            >
              <Code2 size={16} /> Repository <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Tab Navigation Filter */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          {[
            { id: 'commits', label: `Git Commits (${gitCommits.length})` },
            { id: 'prs', label: `Pull Requests (${pullRequests.length})` },
            { id: 'quality', label: 'Member Quality Leaderboard' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '7px 16px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: activeTab === tab.id ? '#d4a373' : 'var(--border-color)',
                background: activeTab === tab.id ? 'rgba(212, 163, 115, 0.15)' : '#222222',
                color: activeTab === tab.id ? '#d4a373' : 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Commits Feed with Conventional Linting */}
      {activeTab === 'commits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {gitCommits.map((commit) => {
            const style = getConventionalTagColor(commit.type);
            return (
              <div
                key={commit.id}
                className="glass-panel"
                style={{
                  padding: '16px 20px',
                  background: '#1c1c1c',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '300px' }}>
                  <img
                    src={commit.authorAvatar}
                    alt={commit.authorName}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: style.bg, color: style.text, border: `1px solid ${style.border}`, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {commit.type.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        #{commit.hash}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        on <strong style={{ color: '#eae6e1' }}>{commit.branch}</strong>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>• {commit.timestamp}</span>
                    </div>

                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#eae6e1', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                      {commit.message}
                    </h4>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      💡 {commit.qualityFeedback}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                    <ShieldCheck size={16} color="#849c86" />
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: commit.conventionalScore >= 90 ? '#a4bfa6' : '#d4a373' }}>
                      {commit.conventionalScore}%
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Convention Score</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Pull Requests Collaboration Board */}
      {activeTab === 'prs' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {pullRequests.map((pr) => (
            <div
              key={pr.id}
              className="glass-panel"
              style={{
                padding: '20px',
                background: '#1c1c1c',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className={`badge badge-${pr.status === 'merged' ? 'completed' : pr.status === 'open' ? 'learning' : 'not_started'}`}>
                    <GitPullRequest size={12} style={{ marginRight: '4px' }} />
                    PR #{pr.prNumber} • {pr.status.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pr.createdAt}</span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#eae6e1', marginBottom: '8px' }}>
                  {pr.title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <img src={pr.userAvatar} alt={pr.userName} style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
                  <span>by <strong style={{ color: '#eae6e1' }}>{pr.userName}</strong></span>
                  <span>• branch: <code style={{ color: '#d4a373' }}>{pr.branch}</code></span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: '#a4bfa6', fontWeight: 700 }}>+{pr.additions}</span>{' '}
                  <span style={{ color: '#c47662', fontWeight: 700 }}>-{pr.deletions}</span> lines
                </div>

                <a
                  href={pr.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', textDecoration: 'none' }}
                >
                  Review on GitHub <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Git Quality Leaderboard */}
      {activeTab === 'quality' && (
        <div className="glass-panel" style={{ padding: '24px', background: '#1c1c1c', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#eae6e1', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#d4a373" /> Member Conventional Commit & Hygiene Leaderboard
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {gitQuality.map((mem, idx) => (
              <div
                key={mem.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: '#222222',
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: idx === 0 ? '#d4a373' : 'var(--text-muted)', width: '24px' }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#eae6e1' }}>{mem.userName}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {mem.conventionalCommitsCount}/{mem.totalCommitsCount} Conventional Commits • {mem.prsReviewed} PRs Reviewed
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Code Volume</span>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: '#a4bfa6' }}>
                      +{mem.linesAdded} / -{mem.linesDeleted}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(212, 163, 115, 0.15)', border: '1px solid rgba(212, 163, 115, 0.3)', padding: '6px 14px', borderRadius: '10px', textAlign: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#d4a373' }}>{mem.grade}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>{mem.overallScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Push Commit Modal */}
      {showAddCommitModal && (
        <div className="modal-overlay" onClick={() => setShowAddCommitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <GitCommitIcon size={22} color="#d4a373" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1' }}>Simulate / Log Git Commit</h3>
            </div>

            <form onSubmit={handleCreateCommit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Git Branch
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={commitBranch}
                  onChange={(e) => setCommitBranch(e.target.value)}
                  placeholder="e.g. feature/oauth2-jwt"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Commit Message (Conventional format: <code>&lt;type&gt;(&lt;scope&gt;): &lt;subject&gt;</code>)
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="feat(auth): implement jwt token generation and validation middleware (#15)"
                  required
                />
              </div>

              <div style={{ background: '#222222', padding: '12px', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                💡 <strong>Tips:</strong> Use types like <code>feat</code>, <code>fix</code>, <code>docs</code>, <code>test</code>, <code>refactor</code>. Scope in parenthesis <code>(api)</code> gives bonus quality points!
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddCommitModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Lint & Push Commit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
