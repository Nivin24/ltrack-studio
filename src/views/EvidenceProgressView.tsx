import React from 'react';
import { useLTrack } from '../context/LTrackContext';
import { ShieldCheck } from 'lucide-react';

export const EvidenceProgressView: React.FC = () => {
  const { topics, calculateEvidence, currentUser } = useLTrack();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <ShieldCheck size={28} color="#38bdf8" />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>
            Evidence-Based Verified Progress Engine
          </h1>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '850px' }}>
          Unlike simple self-reported trackers, <strong>LTrack</strong> computes true verified topic mastery using a multi-factor mathematical formula incorporating concrete evidence: evaluated GitHub PR scores, subtopic task completions, daily check-in confidence ratings, and streak metrics.
        </p>

        {/* Formula Display */}
        <div style={{ marginTop: '16px', background: 'rgba(3, 7, 18, 0.7)', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#38bdf8' }}>
          Verified Mastery = (35% × Subtopic Checklists) + (35% × Graded GitHub PRs) + (15% × Check-In Confidence) + (15% × Topic Status)
        </div>
      </div>

      {/* Breakdown per Topic for Current User */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
          Verified Evidence Breakdown for {currentUser.name}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {topics.slice(0, 6).map((t) => {
            const ev = calculateEvidence(t.id, currentUser.id);

            return (
              <div key={t.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                    {t.name}
                  </h3>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
                    {ev.verifiedMasteryPct}%
                  </span>
                </div>

                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${ev.verifiedMasteryPct}%` }} />
                </div>

                {/* Evidence items log */}
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Concrete Evidence Log:
                  </span>
                  {ev.evidenceItems.map((item, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', color: item.startsWith('✓') ? '#34d399' : item.startsWith('●') ? '#38bdf8' : 'var(--text-muted)' }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
