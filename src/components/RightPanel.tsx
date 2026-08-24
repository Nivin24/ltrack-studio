import React from 'react';
import { useLTrack } from '../context/LTrackContext';
import { Flame, Target, Trophy, BookOpen, Award, Sparkles, Smile } from 'lucide-react';

export const RightPanel: React.FC = () => {
  const { currentUser, topics } = useLTrack();

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
    <aside style={{
      width: '320px',
      background: '#161616',
      borderLeft: '1px solid var(--border-color)',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      flexShrink: 0,
      overflowY: 'auto'
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Smile size={16} color="#d4a373" /> Learner Stats
        </span>
        <span style={{ fontSize: '0.75rem', color: '#d4a373', fontWeight: 600 }}>
          Active Learner
        </span>
      </div>

      {/* User Profile Card */}
      <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', background: '#1e1e1e' }}>
        <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto 12px auto' }}>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            style={{ width: '72px', height: '72px', borderRadius: '50%', border: '2px solid #d4a373', objectFit: 'cover' }}
          />
        </div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#eae6e1', marginBottom: '2px' }}>
          {currentUser.name}
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Software & AI Engineer
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '12px', background: 'rgba(212, 163, 115, 0.15)', color: '#d4a373', fontSize: '0.75rem', fontWeight: 700 }}>
          <Award size={14} /> {currentUser.overallProgress * 10} Mastery Points
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#e5b982', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Flame size={14} fill="#e5b982" /> {currentUser.streak}
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Days Streak</span>
          </div>

          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#a4bfa6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Target size={14} /> 06
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Goals Month</span>
          </div>

          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#d4a373', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Trophy size={14} /> 2nd
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Group Rank</span>
          </div>
        </div>
      </div>

      {/* Friendly Motivation Box */}
      <div style={{ background: 'rgba(132, 156, 134, 0.12)', border: '1px solid rgba(132, 156, 134, 0.25)', padding: '14px', borderRadius: '12px', fontSize: '0.8rem', color: '#a4bfa6', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <Sparkles size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>Great momentum! You're on track to master FastAPI dependency injection this week. Keep going!</span>
      </div>

      {/* Weekly Streak Calendar Widget */}
      <div className="glass-panel" style={{ padding: '16px', background: '#1e1e1e' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#eae6e1' }}>
            Weekly Consistency
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: '#262626', padding: '2px 8px', borderRadius: '6px' }}>
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

      {/* Topics Counter Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="glass-panel" style={{ padding: '14px', background: '#1e1e1e', textAlign: 'center' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(212, 163, 115, 0.15)', color: '#d4a373', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto' }}>
            <BookOpen size={16} />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#eae6e1' }}>{inProgressTopicsCount || 3} Topics</div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>In Progress</span>
        </div>

        <div className="glass-panel" style={{ padding: '14px', background: '#1e1e1e', textAlign: 'center' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(132, 156, 134, 0.15)', color: '#a4bfa6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto' }}>
            <Award size={16} />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#eae6e1' }}>{completedTopicsCount || 10} Topics</div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Completed</span>
        </div>
      </div>

      {/* Weekly Watch / Study Time Bar Chart */}
      <div className="glass-panel" style={{ padding: '16px', background: '#1e1e1e' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#eae6e1' }}>
            Weekly Study Hours
          </span>
          <span style={{ fontSize: '0.72rem', color: '#d4a373', fontWeight: 700 }}>
            Peak: 4h 24m
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '90px', padding: '10px 0 0 0' }}>
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
    </aside>
  );
};
