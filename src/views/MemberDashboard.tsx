import React, { useState } from 'react';
import { useLTrack } from '../context/LTrackContext';
import { DailyCheckInModal } from '../components/DailyCheckInModal';
import { TopicDetailModal } from '../components/TopicDetailModal';
import { ToastNotification } from '../components/ToastNotification';
import type { Topic } from '../types/ltrack';
import {
  Play,
  CheckCircle2,
  Circle,
  Flame,
  Target,
  ArrowRight,
  Terminal,
  HeartHandshake,
  Clock,
  Send,
  Sparkles
} from 'lucide-react';
import { getISTFullDateString } from '../utils/dateUtils';

export const MemberDashboard: React.FC = () => {
  const { currentUser, topics, setActiveTab, calculateEvidence } = useLTrack();

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active topic the learner is currently working on
  const activeTopic = topics.find((t) => t.status === 'learning') || topics[3];
  const activeEvidence = calculateEvidence(activeTopic.id, currentUser.id);

  const [todayTasks, setTodayTasks] = useState([
    { id: 1, text: `Review FastAPI Depends() & yield lifecycle in ${activeTopic.name}`, done: true },
    { id: 2, text: 'Solve "FastAPI Dependency with Yield" challenge in Code Sandbox', done: true },
    { id: 3, text: 'Submit GitHub Pull Request for Assignment #4', done: false },
    { id: 4, text: 'Log daily check-in reflection & confidence rating', done: false }
  ]);

  const toggleTask = (id: number) => {
    setTodayTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = !t.done;
          if (next) {
            setToastMessage(`Marked "${t.text.slice(0, 32)}..." as completed!`);
          }
          return { ...t, done: next };
        }
        return t;
      })
    );
  };

  const completedTasksCount = todayTasks.filter((t) => t.done).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      {/* 1. Calm, Apple-Style Welcome & Focus Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(32, 32, 44, 0.7) 0%, rgba(20, 20, 28, 0.8) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div style={{
          position: 'absolute',
          top: '-40%',
          right: '-10%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 163, 115, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: 'rgba(212, 163, 115, 0.15)', color: '#d4a373', border: '1px solid rgba(212, 163, 115, 0.3)', letterSpacing: '0.04em' }}>
                PHASE {activeTopic.phaseNumber} FOCUS
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {activeTopic.category} Track
              </span>
              <span style={{ fontSize: '0.75rem', color: '#849c86', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(132, 156, 134, 0.12)', padding: '2px 8px', borderRadius: '12px' }}>
                <Clock size={12} /> {getISTFullDateString(new Date())} • IST (Mumbai)
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', marginBottom: '8px' }}>
              Welcome back, {currentUser.name.split(' ')[0]}
            </h1>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', maxWidth: '640px', lineHeight: 1.5 }}>
              You're making great progress in <strong>{activeTopic.name}</strong>. {completedTasksCount}/{todayTasks.length} daily goals completed today.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => setSelectedTopic(activeTopic)}
              style={{ padding: '12px 22px', fontSize: '0.9rem', borderRadius: '14px' }}
            >
              <Play size={16} fill="#0e0e12" /> Continue Lesson
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setShowCheckInModal(true)}
              style={{ padding: '12px 18px', fontSize: '0.9rem', borderRadius: '14px' }}
            >
              <Sparkles size={16} color="#d4a373" /> Daily Check-In
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Uncluttered Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Focused Checklist & Active Module */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Today's Learning Checklist */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.015em' }}>
                  Today's Focused Action Items
                </h2>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {completedTasksCount} of {todayTasks.length} completed
                </span>
              </div>

              {/* Progress Pill */}
              <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, color: completedTasksCount === todayTasks.length ? '#34d399' : '#d4a373' }}>
                {Math.round((completedTasksCount / todayTasks.length) * 100)}% Done
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '13px 16px',
                    borderRadius: '14px',
                    background: task.done ? 'rgba(52, 211, 153, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid',
                    borderColor: task.done ? 'rgba(52, 211, 153, 0.25)' : 'var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {task.done ? (
                      <CheckCircle2 size={18} color="#34d399" />
                    ) : (
                      <Circle size={18} color="var(--text-muted)" />
                    )}
                    <span style={{
                      fontSize: '0.88rem',
                      fontWeight: task.done ? 500 : 600,
                      color: task.done ? 'var(--text-muted)' : 'var(--text-main)',
                      textDecoration: task.done ? 'line-through' : 'none',
                      lineHeight: 1.4
                    }}>
                      {task.text}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.72rem', color: task.done ? '#34d399' : 'var(--text-dim)', fontWeight: 600 }}>
                    {task.done ? 'Done' : 'To Do'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Learning Module Card */}
          <div
            className="glass-panel"
            onClick={() => setSelectedTopic(activeTopic)}
            style={{
              padding: '24px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-learning" style={{ fontSize: '0.68rem' }}>
                    Phase {activeTopic.phaseNumber} In Progress
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} /> {activeTopic.estimatedMinutes} mins
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                  {activeTopic.name}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {activeTopic.description}
                </p>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d4a373' }}>
                  {activeEvidence.verifiedMasteryPct}%
                </div>
                <span style={{ fontSize: '0.72rem', color: '#849c86', fontWeight: 600 }}>
                  Mastery Score
                </span>
              </div>
            </div>

            {/* Subtopics Checklist Preview */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Key Concepts Checklist ({activeTopic.subtopics.filter((s) => s.status === 'completed').length}/{activeTopic.subtopics.length})
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeTopic.subtopics.slice(0, 3).map((sub) => (
                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: sub.status === 'completed' ? 'var(--text-muted)' : 'var(--text-main)' }}>
                    <CheckCircle2 size={14} color={sub.status === 'completed' ? '#34d399' : 'var(--text-dim)'} />
                    <span>{sub.name}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', color: '#d4a373', fontSize: '0.82rem', fontWeight: 700 }}>
                <span>Open Lesson & Exercises</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fast-Track Launchpad & Progress Capsule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Launch Shortcuts (Clutter-Free 1-Click Cards) */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.015em', marginBottom: '16px' }}>
              Learning Shortcuts
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* 1. Code Sandbox */}
              <div
                onClick={() => setActiveTab('code_sandbox')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                className="glass-card-interactive"
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212, 163, 115, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Terminal size={20} color="#d4a373" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Practice in Code Sandbox
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Run Python tests & concept quizzes
                  </span>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>

              {/* 2. Submit Assignment */}
              <div
                onClick={() => setActiveTab('assignments')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                className="glass-card-interactive"
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(132, 156, 134, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Send size={18} color="#849c86" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Submit Pull Request
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Turn in your code for peer grading
                  </span>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>

              {/* 3. Peer Pairing Hub */}
              <div
                onClick={() => setActiveTab('peer_help')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                className="glass-card-interactive"
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(196, 118, 98, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HeartHandshake size={18} color="#c47662" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Ask For Peer Help
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Pair-program on difficult concepts
                  </span>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>
            </div>
          </div>

          {/* Personal Momentum Summary (Clean 2-Card Metrics) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px', textAlign: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(229, 185, 130, 0.15)', color: '#e5b982', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                <Flame size={20} fill="#e5b982" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {currentUser.streak} Days
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Learning Streak</span>
            </div>

            <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px', textAlign: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                <Target size={20} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {currentUser.overallProgress * 10} pts
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mastery Points</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      {showCheckInModal && (
        <DailyCheckInModal isOpen={showCheckInModal} onClose={() => setShowCheckInModal(false)} />
      )}

      {selectedTopic && (
        <TopicDetailModal topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
      )}

      {toastMessage && (
        <ToastNotification message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};
