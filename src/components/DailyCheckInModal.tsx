import React, { useState } from 'react';
import { useLTrack } from '../context/LTrackContext';
import { X, CheckCircle, Clock, Star, AlertCircle, BookOpen } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
}

export const DailyCheckInModal: React.FC<Props> = ({ isOpen, onClose, selectedDate }) => {
  const { addDailyCheckIn } = useLTrack();

  const [completedLearning, setCompletedLearning] = useState<'yes' | 'partially' | 'no'>('yes');
  const [timeSpentMinutes, setTimeSpentMinutes] = useState<number>(60);
  const [confidenceScore, setConfidenceScore] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [whatLearned, setWhatLearned] = useState<string>('');
  const [confusedAbout, setConfusedAbout] = useState<string>('');
  const [toRevise, setToRevise] = useState<string>('');

  if (!isOpen) return null;

  const targetDate = selectedDate || new Date().toISOString().slice(0, 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDailyCheckIn({
      date: targetDate,
      completedLearning,
      timeSpentMinutes,
      confidenceScore,
      difficulty,
      whatLearned: whatLearned || 'Learned core concepts.',
      confusedAbout: confusedAbout || 'None',
      toRevise: toRevise || 'Practice code implementation.'
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#eae6e1' }}>Daily Learning Check-In</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Log today's study session, confidence, and reflection to earn your 🔥 streak!
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Completion Status */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Did you complete today's planned learning?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {(['yes', 'partially', 'no'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCompletedLearning(opt)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: completedLearning === opt ? '#d4a373' : 'var(--border-color)',
                    background: completedLearning === opt ? 'rgba(212, 163, 115, 0.15)' : '#222222',
                    color: completedLearning === opt ? '#d4a373' : 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {opt === 'yes' ? '✓ Yes' : opt === 'partially' ? '◐ Partially' : '✗ No'}
                </button>
              ))}
            </div>
          </div>

          {/* Time Spent */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Time Spent Today
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                { label: '30 mins', val: 30 },
                { label: '45 mins', val: 45 },
                { label: '1 hour', val: 60 },
                { label: '1.5h+', val: 90 }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setTimeSpentMinutes(item.val)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: timeSpentMinutes === item.val ? '#849c86' : 'var(--border-color)',
                    background: timeSpentMinutes === item.val ? 'rgba(132, 156, 134, 0.15)' : '#222222',
                    color: timeSpentMinutes === item.val ? '#a4bfa6' : 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Confidence Score */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              <Star size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Confidence Score (1 to 5 Stars)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setConfidenceScore(star)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: confidenceScore >= star ? '#e5b982' : 'var(--border-color)',
                    background: confidenceScore >= star ? 'rgba(229, 185, 130, 0.15)' : '#222222',
                    color: confidenceScore >= star ? '#e5b982' : 'var(--text-muted)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ★ {star}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Rating */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Difficulty Level
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: difficulty === d ? '#d4a373' : 'var(--border-color)',
                    background: difficulty === d ? 'rgba(212, 163, 115, 0.15)' : '#222222',
                    color: difficulty === d ? '#d4a373' : 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Reflection fields */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              <BookOpen size={14} style={{ display: 'inline', marginRight: '6px' }} />
              What did you learn today?
            </label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="e.g. Understood Depends() and yield dependencies in FastAPI."
              value={whatLearned}
              onChange={(e) => setWhatLearned(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              <AlertCircle size={14} style={{ display: 'inline', marginRight: '6px' }} />
              What confused you? (Optional)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Overriding class dependencies in pytest."
              value={confusedAbout}
              onChange={(e) => setConfusedAbout(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              What should you revise tomorrow?
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Re-read FastAPI dependency injection docs."
              value={toRevise}
              onChange={(e) => setToRevise(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle size={16} />
              Submit Daily Check-In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
