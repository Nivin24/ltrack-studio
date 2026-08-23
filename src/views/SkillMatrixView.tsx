import React from 'react';
import { useLTrack } from '../context/LTrackContext';


export const SkillMatrixView: React.FC = () => {
  const { members, topics, calculateEvidence } = useLTrack();

  const domainCategories = ['Python', 'HTTP', 'FastAPI', 'PostgreSQL', 'ML', 'AI', 'RAG', 'MCP', 'Agentic AI', 'Docker', 'CI/CD'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>
          Group Skill & Domain Matrix
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          High-density coordinator overview comparing member-by-member verified mastery across all syllabus technology domains.
        </p>
      </div>

      {/* Matrix Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                Group Member
              </th>
              {domainCategories.map((cat) => (
                <th key={cat} style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center' }}>
                  {cat}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={m.avatar}
                    alt={m.name}
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>{m.name}</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.role.toUpperCase()}</span>
                  </div>
                </td>

                {domainCategories.map((cat) => {
                  const catTopic = topics.find((t) => t.category === cat);
                  const score = catTopic ? calculateEvidence(catTopic.id, m.id).verifiedMasteryPct : 0;

                  const getBgColor = (val: number) => {
                    if (val >= 80) return 'rgba(16, 185, 129, 0.2)';
                    if (val >= 50) return 'rgba(56, 189, 248, 0.2)';
                    if (val > 0) return 'rgba(245, 158, 11, 0.15)';
                    return 'rgba(30, 41, 59, 0.3)';
                  };

                  const getTextColor = (val: number) => {
                    if (val >= 80) return '#34d399';
                    if (val >= 50) return '#38bdf8';
                    if (val > 0) return '#fbbf24';
                    return '#64748b';
                  };

                  return (
                    <td key={cat} style={{ padding: '12px', textAlign: 'center' }}>
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: getBgColor(score),
                          color: getTextColor(score),
                          fontWeight: 700,
                          fontSize: '0.82rem'
                        }}
                      >
                        {score}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
