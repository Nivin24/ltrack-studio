import React from 'react';
import { useLTrack } from '../context/LTrackContext';
import {
  Flame,
  Target,
  Trophy,
  Calendar,
  Mail,
  Clock,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Code2,
  BookOpen,
  Award,
  BarChart2,
  Star
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, topics, checkIns, submissions } = useLTrack();

  const userCheckIns = checkIns.filter((c) => c.userId === currentUser.id);
  const completedTopicsCount = topics.filter((t) => t.status === 'completed').length;
  const inProgressTopicsCount = topics.filter((t) => t.status === 'learning').length;
  const userSubmissionsCount = submissions.filter((s) => s.userId === currentUser.id).length;

  const weekDays = [
    { day: 'Monday', date: 'Jul 29', active: true, hours: '3.5h' },
    { day: 'Tuesday', date: 'Jul 30', active: true, hours: '4.0h' },
    { day: 'Wednesday', date: 'Jul 31', active: true, hours: '4.4h (Peak)' },
    { day: 'Thursday', date: 'Aug 01', active: true, hours: '2.5h' },
    { day: 'Friday', date: 'Aug 02', active: true, hours: '3.8h' },
    { day: 'Saturday', date: 'Aug 03', active: true, hours: '1.5h' },
    { day: 'Sunday', date: 'Aug 04', active: false, hours: 'Rest' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* 1. Full-Page Profile Hero Banner */}
      <div className="glass-panel" style={{ padding: '32px', background: '#1c1c1c', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{ width: '104px', height: '104px', borderRadius: '50%', border: '3px solid #d4a373', objectFit: 'cover' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#eae6e1' }}>
                  {currentUser.name} {currentUser.role === 'member' ? '(You)' : ''}
                </h1>
                <span className={`badge badge-${currentUser.role === 'admin' ? 'completed' : 'learning'}`} style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  {currentUser.role === 'admin' ? 'Coordinator' : 'Active Learner'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={15} color="#d4a373" /> {currentUser.email}
                </span>
                <a
                  href={`https://github.com/${currentUser.github}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d4a373', textDecoration: 'none', fontWeight: 600 }}
                >
                  <Code2 size={15} /> github.com/{currentUser.github} <ExternalLink size={12} />
                </a>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} color="#849c86" /> Member since {currentUser.joinedDate}
                </span>
              </div>

              <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#eae6e1', background: '#222222', padding: '6px 14px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={14} color="#d4a373" />
                <span>Current Focus: <strong>{currentUser.currentPhase}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#d4a373' }}>
              {currentUser.overallProgress * 10} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>pts</span>
            </div>
            <span style={{ fontSize: '0.82rem', color: '#849c86', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <Award size={15} /> Verified Mastery Points
            </span>
          </div>
        </div>
      </div>

      {/* 2. Motivational Momentum Box */}
      <div style={{ background: 'rgba(132, 156, 134, 0.12)', border: '1px solid rgba(132, 156, 134, 0.25)', padding: '16px 20px', borderRadius: '12px', fontSize: '0.9rem', color: '#a4bfa6', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Sparkles size={22} style={{ flexShrink: 0, color: '#d4a373' }} />
        <span>Great momentum! You're on track to master FastAPI dependency injection this week. Keep going!</span>
      </div>

      {/* 3. Key Performance Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {/* Streak */}
        <div className="glass-panel" style={{ padding: '24px', background: '#1c1c1c', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(229, 185, 130, 0.15)', color: '#e5b982', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <Flame size={26} fill="#e5b982" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#eae6e1' }}>{currentUser.streak} Days</div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Active Learning Streak</span>
        </div>

        {/* Goals */}
        <div className="glass-panel" style={{ padding: '24px', background: '#1c1c1c', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(132, 156, 134, 0.15)', color: '#a4bfa6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <Target size={26} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#eae6e1' }}>06 Goals</div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Monthly Targets Completed</span>
        </div>

        {/* Group Rank */}
        <div className="glass-panel" style={{ padding: '24px', background: '#1c1c1c', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(212, 163, 115, 0.15)', color: '#d4a373', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <Trophy size={26} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#eae6e1' }}>2nd Rank</div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>In Group Leaderboard</span>
        </div>

        {/* Target Hours */}
        <div className="glass-panel" style={{ padding: '24px', background: '#1c1c1c', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(196, 118, 98, 0.15)', color: '#c47662', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <Clock size={26} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#eae6e1' }}>{currentUser.targetHoursPerWeek}h / wk</div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Target Weekly Commitment</span>
        </div>
      </div>

      {/* 4. Weekly Consistency Calendar & Study Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Calendar Grid */}
        <div className="glass-panel" style={{ padding: '28px', background: '#1c1c1c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="#d4a373" /> Weekly Consistency Calendar
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#849c86', fontWeight: 700, background: 'rgba(132, 156, 134, 0.15)', padding: '3px 10px', borderRadius: '10px' }}>
              6/7 Days Active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {weekDays.map((w, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: w.active ? 'rgba(212, 163, 115, 0.12)' : '#222222',
                  border: '1px solid',
                  borderColor: w.active ? 'rgba(212, 163, 115, 0.3)' : 'var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={18} color={w.active ? '#d4a373' : 'var(--text-dim)'} />
                  <div>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: w.active ? '#eae6e1' : 'var(--text-muted)' }}>
                      {w.day}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      ({w.date})
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: w.active ? '#d4a373' : 'var(--text-dim)' }}>
                  {w.hours}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Study Hours Bar Chart */}
        <div className="glass-panel" style={{ padding: '28px', background: '#1c1c1c', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="#849c86" /> Weekly Study Time Breakdown
              </h3>
              <span style={{ fontSize: '0.82rem', color: '#d4a373', fontWeight: 800 }}>
                Peak: 4h 24m
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Peak learning output achieved on Wednesday with 4.4 hours dedicated to FastAPI dependency injection.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingBottom: '10px' }}>
            {[
              { day: 'Mon', height: '50%', label: '3.5h' },
              { day: 'Tue', height: '70%', label: '4.0h' },
              { day: 'Wed', height: '95%', label: '4.4h', peak: true },
              { day: 'Thu', height: '40%', label: '2.5h' },
              { day: 'Fri', height: '65%', label: '3.8h' },
              { day: 'Sat', height: '30%', label: '1.5h' },
              { day: 'Sun', height: '10%', label: '0h' }
            ].map((bar, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: bar.peak ? '#d4a373' : 'var(--text-muted)' }}>
                  {bar.label}
                </span>
                <div
                  style={{
                    width: '28px',
                    height: bar.height,
                    borderRadius: '6px',
                    background: bar.peak
                      ? 'linear-gradient(180deg, #d4a373 0%, #c89666 100%)'
                      : 'rgba(212, 163, 115, 0.25)',
                    transition: 'height 0.3s ease'
                  }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{bar.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Syllabus Topic Mastery Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', background: '#1c1c1c', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(212, 163, 115, 0.15)', color: '#d4a373', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#eae6e1' }}>{inProgressTopicsCount || 3} Topics</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Currently In Progress</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: '#1c1c1c', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(132, 156, 134, 0.15)', color: '#849c86', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#eae6e1' }}>{completedTopicsCount || 10} Topics</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mastered & Completed</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: '#1c1c1c', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(229, 185, 130, 0.15)', color: '#e5b982', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BarChart2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#eae6e1' }}>{userSubmissionsCount} PRs</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Evaluated Submissions</span>
          </div>
        </div>
      </div>

      {/* 6. Recent Daily Check-In Logs */}
      <div className="glass-panel" style={{ padding: '28px', background: '#1c1c1c', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={20} color="#849c86" /> Recent Learning Check-Ins & Reflection History
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {userCheckIns.slice(0, 4).map((chk) => (
            <div key={chk.id} style={{ background: '#222222', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-completed" style={{ fontSize: '0.72rem' }}>
                    {chk.date} Check-In
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#d4a373', fontWeight: 600 }}>
                    {chk.timeSpentMinutes} mins studied
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#eae6e1' }}>
                  "{chk.whatLearned}"
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.82rem', color: '#a4bfa6', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Confidence: {chk.confidenceScore} / 5 <Star size={13} fill="#fbbf24" color="#fbbf24" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
