import React from 'react';
import { useLTrack } from '../context/LTrackContext';
import type { Topic } from '../types/ltrack';
import { X, CheckSquare, Square, Clock, ExternalLink, ShieldCheck } from 'lucide-react';

interface Props {
  topic: Topic | null;
  onClose: () => void;
}

export const TopicDetailModal: React.FC<Props> = ({ topic, onClose }) => {
  const { toggleSubtopic, calculateEvidence, assignments, submissions, currentUser } = useLTrack();

  if (!topic) return null;

  const evidence = calculateEvidence(topic.id, currentUser.id);
  const topicAsgn = assignments.find((a) => a.id === topic.assignmentId);
  const userSub = topicAsgn
    ? submissions.find((s) => s.assignmentId === topicAsgn.id && s.userId === currentUser.id)
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '750px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className={`badge badge-${topic.status}`}>
                Phase {topic.phaseNumber} • {topic.category}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {topic.estimatedMinutes} mins
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#eae6e1' }}>{topic.name}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
          {topic.description}
        </p>

        {/* Verified Progress Card */}
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(212, 163, 115, 0.06)', borderColor: 'rgba(212, 163, 115, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#d4a373', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> Verified Topic Mastery
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d4a373' }}>
              {evidence.verifiedMasteryPct}%
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${evidence.verifiedMasteryPct}%` }} />
          </div>
        </div>

        {/* Subtopics Checklist */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#eae6e1', marginBottom: '10px' }}>
            Subtopic Checklist ({topic.subtopics.filter(s => s.status === 'completed').length}/{topic.subtopics.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topic.subtopics.map((sub) => {
              const isDone = sub.status === 'completed';
              return (
                <div
                  key={sub.id}
                  onClick={() => toggleSubtopic(topic.id, sub.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: isDone ? 'rgba(132, 156, 134, 0.12)' : '#222222',
                    border: '1px solid',
                    borderColor: isDone ? 'rgba(132, 156, 134, 0.3)' : 'var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isDone ? (
                      <CheckSquare size={18} color="#a4bfa6" />
                    ) : (
                      <Square size={18} color="var(--text-muted)" />
                    )}
                    <span style={{ fontSize: '0.88rem', fontWeight: 500, color: isDone ? '#eae6e1' : 'var(--text-muted)', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {sub.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: isDone ? 'rgba(132, 156, 134, 0.2)' : 'rgba(115, 109, 101, 0.2)', color: isDone ? '#a4bfa6' : '#a69f95' }}>
                    {sub.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assignment Status */}
        {topicAsgn && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#eae6e1', marginBottom: '8px' }}>
              Required Assignment
            </h3>
            <div className="glass-panel" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#eae6e1' }}>{topicAsgn.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Deadline: {topicAsgn.deadline}</p>
                </div>
                <span className={`badge badge-${userSub?.status === 'evaluated' ? 'completed' : userSub ? 'learning' : 'not_started'}`}>
                  {userSub?.status === 'evaluated' ? `Graded ${userSub.evaluation?.overallScore}/10` : userSub ? 'Submitted' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Resources */}
        {topic.resources.length > 0 && (
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#eae6e1', marginBottom: '8px' }}>
              Curated Learning Resources
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {topic.resources.map((res, i) => (
                <a
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#222222',
                    color: '#d4a373',
                    textDecoration: 'none',
                    fontSize: '0.85rem'
                  }}
                >
                  <span>{res.title}</span>
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
