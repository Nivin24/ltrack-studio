import React from 'react';
import { useLTrack } from '../context/LTrackContext';
import {
  X,
  Flame,
  Target,
  Trophy,
  BookOpen,
  Award,
  Sparkles,
  Smile,
  ChevronRight,
  Clock
} from 'lucide-react';

interface StatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsDrawer: React.FC<StatsDrawerProps> = ({ isOpen, onClose }) => {
  const { currentUser, topics, setActiveTab } = useLTrack();

  if (!isOpen) return null;

  const completedTopicsCount = topics.filter((t) => t.status === 'completed').length;
  const inProgressTopicsCount = topics.filter((t) => t.status === 'learning').length;

  const weekDays = [
    { day: 'Mon', date: 29, active: true },
    { day: 'Tue', date: 30, active: true },
    { day: 'Wed', date: 31, active: true },
    { day: 'Thu', date: 1, active: true },
    { day: 'Fri', date: 2, active: true },
    { day: 'Sat', date: 3, active: true },
    { day: 'Sun', date: 4, active: false }
  ];

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
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
          width: '360px',
          maxWidth: '90vw',
          height: '100vh',
          background: '#161616',
          borderLeft: '1px solid var(--border-color)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          overflowY: 'auto',
          boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.7)',
          animation: 'slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smile size={18} color="#d4a373" />
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#eae6e1' }}>
              Learner Stats
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.72rem', color: '#d4a373', fontWeight: 700, background: 'rgba(212, 163, 115, 0.12)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(212, 163, 115, 0.25)' }}>
              Active Learner
            </span>
            <button
              onClick={onClose}
              style={{
                background: '#222222',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title="Close Panel"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* 1. Main Profile Card */}
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', background: '#1e1e1e', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
          <div style={{ position: 'relative', width: '76px', height: '76px', margin: '0 auto 12px auto' }}>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{ width: '76px', height: '76px', borderRadius: '50%', border: '2px solid #d4a373', objectFit: 'cover' }}
            />
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#eae6e1', marginBottom: '2px' }}>
            {currentUser.name} (You)
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Software & AI Engineer
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '14px', background: 'rgba(212, 163, 115, 0.15)', color: '#d4a373', fontSize: '0.78rem', fontWeight: 700, border: '1px solid rgba(212, 163, 115, 0.3)' }}>
            <Award size={14} /> {currentUser.overallProgress * 10} Mastery Points
          </div>

          {/* 3 Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#e5b982', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Flame size={15} fill="#e5b982" /> {currentUser.streak}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Days Streak</span>
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#a4bfa6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Target size={15} /> 06
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Goals Month</span>
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#d4a373', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Trophy size={15} /> 2nd
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Group Rank</span>
            </div>
          </div>
        </div>

        {/* 2. Motivational Banner */}
        <div style={{ background: 'rgba(132, 156, 134, 0.12)', border: '1px solid rgba(132, 156, 134, 0.25)', padding: '14px', borderRadius: '12px', fontSize: '0.8rem', color: '#a4bfa6', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <Sparkles size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#d4a373' }} />
          <span style={{ lineHeight: 1.4 }}>Great momentum! You're on track to master FastAPI dependency injection this week. Keep going!</span>
        </div>

        {/* 3. Weekly Consistency Calendar Widget */}
        <div className="glass-panel" style={{ padding: '16px', background: '#1e1e1e', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#eae6e1' }}>
              Weekly Consistency
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: '#262626', padding: '2px 8px', borderRadius: '6px' }}>
              6/7 Days Active
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
            {weekDays.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.day}</span>
                <div style={{
                  height: '32px',
                  borderRadius: '8px',
                  background: item.active ? 'linear-gradient(135deg, #c89666 0%, #d4a373 100%)' : '#262626',
                  color: item.active ? '#121212' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Topics Counter Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="glass-panel" style={{ padding: '14px', background: '#1e1e1e', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(212, 163, 115, 0.15)', color: '#d4a373', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto' }}>
              <BookOpen size={15} />
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#eae6e1' }}>{inProgressTopicsCount || 3} Topics</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>In Progress</span>
          </div>

          <div className="glass-panel" style={{ padding: '14px', background: '#1e1e1e', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(132, 156, 134, 0.15)', color: '#a4bfa6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto' }}>
              <Award size={15} />
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#eae6e1' }}>{completedTopicsCount || 4} Topics</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Completed</span>
          </div>
        </div>

        {/* 5. Weekly Study Time Breakdown */}
        <div className="glass-panel" style={{ padding: '16px', background: '#1e1e1e', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#eae6e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#d4a373" /> Weekly Study Hours
            </span>
            <span style={{ fontSize: '0.72rem', color: '#d4a373', fontWeight: 700 }}>
              Peak: 4h 24m
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '80px', padding: '10px 0 0 0' }}>
            {[
              { day: 'M', h: '40%' },
              { day: 'T', h: '65%' },
              { day: 'W', h: '90%', peak: true },
              { day: 'T', h: '55%' },
              { day: 'F', h: '75%' },
              { day: 'S', h: '30%' },
              { day: 'S', h: '15%' }
            ].map((bar, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                <div
                  style={{
                    width: '16px',
                    height: bar.h,
                    borderRadius: '4px',
                    background: bar.peak
                      ? 'linear-gradient(180deg, #d4a373 0%, #c89666 100%)'
                      : 'rgba(212, 163, 115, 0.25)',
                    transition: 'height 0.3s ease'
                  }}
                />
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* View Full Profile CTA */}
        <button
          onClick={() => {
            setActiveTab('profile');
            onClose();
          }}
          className="btn btn-primary"
          style={{ width: '100%', padding: '10px', fontSize: '0.82rem', justifyContent: 'center', marginTop: 'auto' }}
        >
          View Full Profile Page <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};
