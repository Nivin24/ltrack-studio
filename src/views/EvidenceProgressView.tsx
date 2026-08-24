import React, { useState, useMemo } from 'react';
import { useLTrack } from '../context/LTrackContext';
import {
  ShieldCheck,
  CheckCircle2,
  GitPullRequest,
  Clock,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  Check,
  BookOpen,
  BarChart3
} from 'lucide-react';
import type { User as LTrackUser } from '../types/ltrack';

export const EvidenceProgressView: React.FC = () => {
  const { topics, calculateEvidence, currentUser, members, setActiveTab } = useLTrack();

  const [activeSubTab, setActiveSubTab] = useState<'my_evidence' | 'team_audit' | 'standards_guide'>('my_evidence');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(currentUser.id);
  const [copiedCredentialId, setCopiedCredentialId] = useState<string | null>(null);

  // Selected Member Object
  const targetMember: LTrackUser = useMemo(() => {
    return members.find((m) => m.id === selectedMemberId) || currentUser;
  }, [members, selectedMemberId, currentUser]);

  // Categories / Domains
  const domains = useMemo(() => {
    const set = new Set<string>();
    topics.forEach((t) => set.add(t.category));
    return ['all', ...Array.from(set)];
  }, [topics]);

  // Filtered Topics
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      if (selectedDomain !== 'all' && t.category !== selectedDomain) return false;
      return true;
    });
  }, [topics, selectedDomain]);

  // Total Verified Credentials Earned by Target Member
  const verifiedCount = useMemo(() => {
    return topics.filter((t) => calculateEvidence(t.id, targetMember.id).verifiedMasteryPct >= 80).length;
  }, [topics, calculateEvidence, targetMember.id]);

  const handleCopyCredential = (topicId: string) => {
    const credUrl = `https://ltrack.app/verify/${targetMember.id}/${topicId}`;
    navigator.clipboard.writeText(credUrl);
    setCopiedCredentialId(topicId);
    setTimeout(() => setCopiedCredentialId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      
      {/* 1. Header Banner: Proof of Work Verification Engine */}
      <div className="glass-panel" style={{ padding: '24px 28px', background: 'linear-gradient(135deg, rgba(20, 20, 26, 0.95) 0%, rgba(30, 30, 42, 0.85) 100%)', border: '1px solid rgba(212, 163, 115, 0.22)', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-learning" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} color="#34d399" /> Proof-of-Work Verification Engine
              </span>
              <span style={{ fontSize: '0.74rem', color: '#d4a373', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Award size={13} /> {verifiedCount} Verified Mastery Credentials
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#eae6e1', letterSpacing: '-0.02em', margin: 0 }}>
              Evidence-Based Verified Progress Studio
            </h1>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              Unlike simple self-reported checkmarks, LTrack computes verifiable competency using concrete proof across 4 foundational engineering pillars.
            </p>
          </div>

          {/* Quick Pillar Summary Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '8px 14px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.64rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Pillar 1 & 2</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399' }}>70% Proof</span>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', display: 'block' }}>Code & Graded PRs</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '8px 14px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.64rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Pillar 3 & 4</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8' }}>30% Proof</span>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', display: 'block' }}>Daily Logs & Milestones</span>
            </div>
          </div>
        </div>

        {/* 4-Pillar Visual Intuition Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
          <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '10px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Syllabus Subtopics
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#34d399' }}>35 pts</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Verified concept checklists & quizzes</span>
          </div>

          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GitPullRequest size={13} /> Graded GitHub PRs
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38bdf8' }}>35 pts</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Peer-evaluated PR score out of 10</span>
          </div>

          <div style={{ background: 'rgba(212, 163, 115, 0.08)', border: '1px solid rgba(212, 163, 115, 0.2)', borderRadius: '10px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#d4a373', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} /> Daily Check-In Logs
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#d4a373' }}>15 pts</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Consistent reflection & self-rating</span>
          </div>

          <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '10px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Layers size={13} /> Phase Completion
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#a855f7' }}>15 pts</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Curriculum track progression</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', flexWrap: 'wrap' }}>
          {[
            { id: 'my_evidence', label: 'My Verified Evidence & Next Steps', icon: ShieldCheck },
            { id: 'team_audit', label: 'Team Proof & Evidence Matrix', icon: BarChart3 },
            { id: 'standards_guide', label: 'How Verification Works', icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
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

      {/* TAB 1: MY VERIFIED EVIDENCE & ACTIONABLE NEXT STEPS */}
      {activeSubTab === 'my_evidence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Domain & Member Toolbar */}
          <div className="glass-panel" style={{ padding: '14px 18px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {/* Domain Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, marginRight: '4px' }}>
                DOMAIN:
              </span>
              {domains.map((dom) => (
                <button
                  key={dom}
                  onClick={() => setSelectedDomain(dom)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: selectedDomain === dom ? 700 : 500,
                    cursor: 'pointer',
                    background: selectedDomain === dom ? '#d4a373' : 'rgba(255, 255, 255, 0.04)',
                    color: selectedDomain === dom ? '#0e0e12' : 'var(--text-muted)',
                    border: selectedDomain === dom ? '1px solid #d4a373' : '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {dom.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Member Selector Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>
                AUDITING EVIDENCE FOR:
              </span>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="form-control"
                style={{ padding: '5px 10px', fontSize: '0.76rem', width: 'auto', background: 'rgba(255, 255, 255, 0.05)', color: '#eae6e1', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Evidence Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
            {filteredTopics.map((topic) => {
              const ev = calculateEvidence(topic.id, targetMember.id);
              const isMastered = ev.verifiedMasteryPct >= 80;

              return (
                <div
                  key={topic.id}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    background: 'rgba(20, 20, 26, 0.85)',
                    border: isMastered ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(212, 163, 115, 0.16)',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  {/* Topic Title & Overall Mastery Ring/Pill */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d4a373', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Phase {topic.phaseNumber} • {topic.category}
                        </span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#eae6e1', margin: '2px 0 0 0' }}>
                          {topic.name}
                        </h3>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: isMastered ? '#34d399' : '#38bdf8' }}>
                          {ev.verifiedMasteryPct}%
                        </span>
                        <span style={{ fontSize: '0.66rem', color: isMastered ? '#34d399' : 'var(--text-dim)', display: 'block', fontWeight: 700 }}>
                          {isMastered ? 'Mastery Verified' : 'In Progress'}
                        </span>
                      </div>
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="progress-track" style={{ height: '8px', marginBottom: '16px' }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${ev.verifiedMasteryPct}%`,
                          background: isMastered ? 'linear-gradient(90deg, #34d399, #10b981)' : 'linear-gradient(90deg, #38bdf8, #818cf8)'
                        }}
                      />
                    </div>

                    {/* 4 Mini-Pillars Point Breakdown Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                      <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                          <span>Subtopics (35%)</span>
                          <span style={{ color: '#34d399', fontWeight: 700 }}>{ev.subtopicsPoints} pts</span>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${(ev.subtopicsPoints / 35) * 100}%`, height: '100%', background: '#34d399' }} />
                        </div>
                      </div>

                      <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                          <span>GitHub PR (35%)</span>
                          <span style={{ color: '#38bdf8', fontWeight: 700 }}>{ev.prPoints} pts</span>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${(ev.prPoints / 35) * 100}%`, height: '100%', background: '#38bdf8' }} />
                        </div>
                      </div>

                      <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                          <span>Check-Ins (15%)</span>
                          <span style={{ color: '#d4a373', fontWeight: 700 }}>{ev.confidencePoints} pts</span>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${(ev.confidencePoints / 15) * 100}%`, height: '100%', background: '#d4a373' }} />
                        </div>
                      </div>

                      <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                          <span>Status (15%)</span>
                          <span style={{ color: '#a855f7', fontWeight: 700 }}>{ev.statusPoints} pts</span>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${(ev.statusPoints / 15) * 100}%`, height: '100%', background: '#a855f7' }} />
                        </div>
                      </div>
                    </div>

                    {/* Concrete Evidence Log Items */}
                    <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                        Verified Proof Artifacts:
                      </span>
                      {ev.evidenceItems.map((item, idx) => (
                        <div key={idx} style={{ fontSize: '0.75rem', color: '#eae6e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={12} color="#34d399" style={{ flexShrink: 0 }} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actionable Next Step to 100% */}
                    <div style={{ background: 'rgba(212, 163, 115, 0.08)', border: '1px solid rgba(212, 163, 115, 0.2)', padding: '10px 12px', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Sparkles size={14} color="#d4a373" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d4a373', display: 'block', textTransform: 'uppercase' }}>
                          Next Step to Level Up:
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#eae6e1', lineHeight: 1.4 }}>
                          {ev.nextActionRecommendation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Credential / Action Buttons */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {isMastered ? (
                      <button
                        onClick={() => handleCopyCredential(topic.id)}
                        style={{
                          background: 'rgba(52, 211, 153, 0.12)',
                          border: '1px solid rgba(52, 211, 153, 0.3)',
                          color: '#34d399',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {copiedCredentialId === topic.id ? <Check size={12} /> : <Award size={12} />}
                        <span>{copiedCredentialId === topic.id ? 'Proof Link Copied' : 'Share Credential'}</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        Needs 80% for Credential
                      </span>
                    )}

                    <button
                      onClick={() => setActiveTab('assignments')}
                      className="btn btn-secondary"
                      style={{ padding: '5px 12px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>View Assignment PR</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TEAM PROOF & EVIDENCE MATRIX */}
      {activeSubTab === 'team_audit' && (
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={20} color="#d4a373" /> Team Verified Evidence Audit Matrix
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Inspect and compare verified competency scores computed from actual GitHub pull requests and checklists.
              </p>
            </div>

            <span className="badge badge-completed" style={{ fontSize: '0.72rem' }}>
              Multi-Factor Proof Engine
            </span>
          </div>

          {/* Matrix Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Team Member
                  </th>
                  {topics.slice(0, 5).map((t) => (
                    <th key={t.id} style={{ padding: '12px 16px', fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      {t.name}
                    </th>
                  ))}
                  <th style={{ padding: '12px 16px', fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase', textAlign: 'right' }}>
                    Mastery Credentials
                  </th>
                </tr>
              </thead>

              <tbody>
                {members.map((mem) => {
                  const memberVerified = topics.filter((t) => calculateEvidence(t.id, mem.id).verifiedMasteryPct >= 80).length;

                  return (
                    <tr key={mem.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={mem.avatar} alt={mem.name} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--accent-copper)', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1' }}>{mem.name}</div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{mem.role}</span>
                        </div>
                      </td>

                      {topics.slice(0, 5).map((t) => {
                        const ev = calculateEvidence(t.id, mem.id);
                        const isHigh = ev.verifiedMasteryPct >= 80;
                        const isMed = ev.verifiedMasteryPct >= 50;

                        return (
                          <td key={t.id} style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: isHigh ? '#34d399' : isMed ? '#38bdf8' : 'var(--text-dim)' }}>
                                {ev.verifiedMasteryPct}%
                              </span>
                              {isHigh && <ShieldCheck size={13} color="#34d399" />}
                            </div>
                            <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', display: 'block' }}>
                              {ev.prPoints} PR / {ev.subtopicsPoints} Sub
                            </span>
                          </td>
                        );
                      })}

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span style={{ background: 'rgba(212, 163, 115, 0.15)', border: '1px solid rgba(212, 163, 115, 0.3)', color: '#d4a373', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>
                          {memberVerified} / {topics.length} Certified
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HOW VERIFICATION WORKS (STANDARDS GUIDE) */}
      {activeSubTab === 'standards_guide' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          
          <div className="glass-panel" style={{ padding: '22px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#34d399" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                Why Proof of Work Matters
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Anyone can click "done" on a tutorial. LTrack calculates true competency using verified artifacts that can be audited by team coordinators and hiring managers.
            </p>
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '10px', padding: '12px', fontSize: '0.74rem', color: '#eae6e1', lineHeight: 1.5 }}>
              <strong>The Verification Standard:</strong> When a developer reaches 80% verified mastery, they are officially recognized as a peer mentor capable of guiding teammates on that topic.
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '22px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitPullRequest size={18} color="#38bdf8" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                How GitHub PRs are Evaluated
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Each assignment PR is evaluated across 4 technical dimensions:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.74rem', color: '#eae6e1' }}>
              <div>• Correctness & passing test suite (3.0 pts)</div>
              <div>• Code architecture & clean typing (2.5 pts)</div>
              <div>• Error handling & security resilience (2.5 pts)</div>
              <div>• Git conventional commit message hygiene (2.0 pts)</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '22px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#d4a373" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                Fastest Path to 100% Mastery
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Follow this simple 3-step workflow for each curriculum topic:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.74rem', color: '#eae6e1' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: '6px' }}>
                1. Check off subtopics in your Daily Task list (+35%)
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: '6px' }}>
                2. Open an Assignment Pull Request on GitHub (+35%)
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: '6px' }}>
                3. Log your Daily Reflection & Confidence (+15%)
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
