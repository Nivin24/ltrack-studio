import React, { useState } from 'react';
import { useLTrack } from '../context/LTrackContext';
import { DailyCheckInModal } from '../components/DailyCheckInModal';
import { Calendar, Clock, CheckSquare, Square, Target, BookOpen, ExternalLink } from 'lucide-react';

export const DailyLearningView: React.FC = () => {
  const { topics, toggleSubtopic } = useLTrack();
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const activeTopic = topics.find((t) => t.status === 'learning') || topics[3];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-learning" style={{ marginBottom: '8px' }}>
              Day 18 Dedicated Session
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
              {activeTopic.name}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {activeTopic.description}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(30, 41, 59, 0.6)', padding: '8px 14px', borderRadius: '10px', fontSize: '0.85rem', color: '#38bdf8' }}>
              <Clock size={16} /> Target: 45–60 mins
            </div>
            <button className="btn btn-primary" onClick={() => setShowCheckInModal(true)}>
              <Calendar size={16} /> Submit Daily Check-In
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Subtopic Checklist & Learning Resources */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Left Column: Subtopic Checklist */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Today's Concept Subtopics
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeTopic.subtopics.map((sub) => {
              const isDone = sub.status === 'completed';
              return (
                <div
                  key={sub.id}
                  onClick={() => toggleSubtopic(activeTopic.id, sub.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid',
                    borderColor: isDone ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-color)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isDone ? (
                      <CheckSquare size={18} color="#34d399" />
                    ) : (
                      <Square size={18} color="var(--text-muted)" />
                    )}
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: isDone ? '#e2e8f0' : 'var(--text-muted)', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {sub.name}
                    </span>
                  </div>
                  <span className={`badge badge-${sub.status}`} style={{ fontSize: '0.65rem' }}>
                    {sub.status.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recommended Resources & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="#a78bfa" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Study Resources & References
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeTopic.resources.map((res, i) => (
                <a
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(30, 41, 59, 0.4)',
                    color: '#38bdf8',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <span>{res.title}</span>
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DailyCheckInModal isOpen={showCheckInModal} onClose={() => setShowCheckInModal(false)} />
    </div>
  );
};
