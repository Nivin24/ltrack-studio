import React, { useState } from 'react';
import { useLTrack } from '../../context/LTrackContext';
import type { User } from '../../types/ltrack';
import {
  X,
  Flame,
  Target,
  ShieldCheck,
  AlertTriangle,
  Award,
  Sparkles,
  Send,
  Mail,
  BookOpen,
  Code2
} from 'lucide-react';

interface MemberDetailDrawerProps {
  member: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MemberDetailDrawer: React.FC<MemberDetailDrawerProps> = ({ member, isOpen, onClose }) => {
  const { topics, submissions, checkIns, guidanceNotes, addGuidanceNote, calculateEvidence, members } = useLTrack();

  const [actionPlan, setActionPlan] = useState('');
  const [suggestedResource, setSuggestedResource] = useState('');
  const [assignedMentor, setAssignedMentor] = useState('');

  if (!isOpen || !member) return null;

  const memberCheckIns = checkIns.filter((c) => c.userId === member.id);
  const memberSubmissions = submissions.filter((s) => s.userId === member.id);
  const memberGuidance = guidanceNotes.filter((g) => g.userId === member.id);

  // Identify weak areas (confidence <= 2 or confusedAbout listed)
  const lowConfidenceCheckIns = memberCheckIns.filter((c) => c.confidenceScore <= 2 || Boolean(c.confusedAbout));

  const handleSendGuidance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionPlan.trim()) return;
    addGuidanceNote(member.id, actionPlan, suggestedResource, assignedMentor || undefined);
    setActionPlan('');
    setSuggestedResource('');
    setAssignedMentor('');
    alert(`Personalized guidance plan dispatched to ${member.name}! 🚀`);
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '540px',
          maxWidth: '95vw',
          height: '100vh',
          background: '#161616',
          borderLeft: '1px solid var(--border-color)',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          overflowY: 'auto',
          boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#d4a373" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#eae6e1' }}>
              Coordinator Learner Diagnostic
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#222222',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Member Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#1e1e1e', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <img
            src={member.avatar}
            alt={member.name}
            style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #d4a373', objectFit: 'cover' }}
          />
          <div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#eae6e1', marginBottom: '2px' }}>
              {member.name}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', flexWrap: 'wrap' }}>
              <span><Mail size={13} style={{ display: 'inline', marginRight: '3px' }} /> {member.email}</span>
              <span><Code2 size={13} style={{ display: 'inline', marginRight: '3px' }} /> {member.github}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#d4a373', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              {member.currentPhase}
            </span>
          </div>
        </div>

        {/* Quick Diagnostic Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div style={{ background: '#1e1e1e', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e5b982', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Flame size={16} fill="#e5b982" /> {member.streak}d
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Learning Streak</span>
          </div>

          <div style={{ background: '#1e1e1e', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a4bfa6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Target size={16} /> {member.overallProgress}%
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Overall Progress</span>
          </div>

          <div style={{ background: '#1e1e1e', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#d4a373', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Award size={16} /> {memberSubmissions.length} PRs
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Submissions</span>
          </div>
        </div>

        {/* 1. Weakness & Struggling Concepts Detection */}
        <div style={{ background: '#1e1e1e', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertTriangle size={18} color="#c47662" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#eae6e1' }}>
              Identified Knowledge Gaps & Doubts
            </h4>
          </div>

          {lowConfidenceCheckIns.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lowConfidenceCheckIns.map((chk) => (
                <div key={chk.id} style={{ background: 'rgba(196, 118, 98, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(196, 118, 98, 0.25)', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c47662', fontWeight: 700, marginBottom: '2px' }}>
                    <span>{chk.date} Reflection</span>
                    <span>Confidence: {chk.confidenceScore}/5 ★</span>
                  </div>
                  <p style={{ color: '#eae6e1', fontSize: '0.8rem' }}>
                    Stuck with: <em>"{chk.confusedAbout || 'Reported low confidence'}"</em>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: '#a4bfa6', background: 'rgba(132, 156, 134, 0.1)', padding: '10px', borderRadius: '8px' }}>
              ✓ No critical struggling alerts. Consistent high confidence scores recorded.
            </div>
          )}
        </div>

        {/* 2. Verified Topic Mastery Breakdown */}
        <div style={{ background: '#1e1e1e', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#eae6e1', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={16} color="#d4a373" /> Verified Syllabus Evidence
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topics.slice(0, 4).map((t) => {
              const evidence = calculateEvidence(t.id, member.id);
              return (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#222222', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <span style={{ color: '#eae6e1' }}>{t.name}</span>
                  <span style={{ color: evidence.verifiedMasteryPct >= 80 ? '#a4bfa6' : '#d4a373', fontWeight: 700 }}>
                    {evidence.verifiedMasteryPct}% Mastery
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Coordinator Guidance & Action Plan Composer */}
        <div style={{ background: '#1e1e1e', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sparkles size={18} color="#d4a373" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#eae6e1' }}>
              Dispatch Personalized Guidance & Mentorship
            </h4>
          </div>

          <form onSubmit={handleSendGuidance} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Action Plan / Coaching Recommendation
              </label>
              <textarea
                className="form-control"
                rows={3}
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                placeholder={`Recommend specific practice exercises or code walkthroughs for ${member.name}...`}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Suggested Documentation / Tutorial URL
              </label>
              <input
                type="url"
                className="form-control"
                value={suggestedResource}
                onChange={(e) => setSuggestedResource(e.target.value)}
                placeholder="https://fastapi.tiangolo.com/..."
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Assign Peer Mentor / Study Buddy
              </label>
              <select
                className="form-control"
                value={assignedMentor}
                onChange={(e) => setAssignedMentor(e.target.value)}
              >
                <option value="">None (Self-Study)</option>
                {members.filter((m) => m.id !== member.id).map((m) => (
                  <option key={m.id} value={m.name} style={{ background: '#1c1c1c' }}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '9px', fontSize: '0.85rem', justifyContent: 'center' }}>
              <Send size={15} /> Send Guidance to Learner
            </button>
          </form>

          {/* Past Guidance Notes History */}
          {memberGuidance.length > 0 && (
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Past Coordinator Action Plans ({memberGuidance.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {memberGuidance.map((g) => (
                  <div key={g.id} style={{ background: '#222222', padding: '10px 12px', borderRadius: '8px', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d4a373', fontWeight: 600, marginBottom: '2px' }}>
                      <span>By {g.coordinatorName}</span>
                      <span>{g.createdAt}</span>
                    </div>
                    <p style={{ color: '#eae6e1', marginBottom: '4px' }}>{g.actionPlan}</p>
                    {g.assignedMentor && (
                      <span style={{ color: '#849c86', fontSize: '0.72rem' }}>
                        👥 Mentor Assigned: {g.assignedMentor}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
