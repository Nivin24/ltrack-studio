import React, { useState } from 'react';
import { useLTrack } from '../context/LTrackContext';
import { Shield, User, ArrowRight, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { members, login } = useLTrack();

  const [selectedRole, setSelectedRole] = useState<'admin' | 'member'>('member');
  const [selectedUserId, setSelectedUserId] = useState<string>(members[1]?.id || 'usr_2');
  const [password, setPassword] = useState('demo123');

  const adminUsers = members.filter((m) => m.role === 'admin');
  const memberUsers = members.filter((m) => m.role === 'member');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'admin') {
      const adminId = adminUsers[0]?.id || 'usr_1';
      login(adminId, 'admin');
    } else {
      login(selectedUserId, 'member');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 50% 30%, #1e1e1e 0%, #121212 70%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '920px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        {/* Left Branding Card */}
        <div className="glass-panel" style={{
          padding: '40px',
          background: 'linear-gradient(135deg, #181818 0%, #1c1c1c 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderColor: 'rgba(212, 163, 115, 0.25)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <img
                src="/logo.png"
                alt="LTrack Logo"
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  objectFit: 'cover',
                  boxShadow: '0 8px 24px rgba(212, 163, 115, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              />
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                  LTrack
                </h1>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Engineering Learning & Assessment Platform
                </p>
              </div>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#eae6e1', marginBottom: '12px', lineHeight: 1.3 }}>
              Collaborative Engineering Learning & Assessment Platform
            </h2>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              Track verified learning progress across Python, FastAPI, PostgreSQL, ML, AI, RAG, MCP, Agentic AI, Docker, and CI/CD with evidence-based assessments.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Separate Admin Coordinator & Member Learner portals',
                'Verified progress engine based on evaluated GitHub PRs',
                'Daily learning check-ins & streak monitoring',
                'Group skill matrix & risk alert detection'
              ].map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.83rem', color: '#eae6e1' }}>
                  <CheckCircle2 size={16} color="#849c86" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            <Sparkles size={14} color="#d4a373" />
            <span>Matte finish theme optimized for eye protection & low luminance</span>
          </div>
        </div>

        {/* Right Portal Login Form */}
        <div className="glass-panel" style={{ padding: '36px', background: '#161616', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#eae6e1', marginBottom: '6px' }}>
            Portal Sign In
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Choose your portal role to access your dedicated workspace:
          </p>

          {/* Role Switcher Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('member');
                setSelectedUserId(memberUsers[0]?.id || 'usr_2');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: selectedRole === 'member' ? '#d4a373' : 'var(--border-color)',
                background: selectedRole === 'member' ? 'rgba(212, 163, 115, 0.15)' : '#222222',
                color: selectedRole === 'member' ? '#d4a373' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <User size={16} /> Member Portal
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setSelectedUserId(adminUsers[0]?.id || 'usr_1');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: selectedRole === 'admin' ? '#849c86' : 'var(--border-color)',
                background: selectedRole === 'admin' ? 'rgba(132, 156, 134, 0.15)' : '#222222',
                color: selectedRole === 'admin' ? '#a4bfa6' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Shield size={16} /> Admin Portal
            </button>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {selectedRole === 'member' ? (
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Select Member Account
                </label>
                <select
                  className="form-control"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  {memberUsers.map((m) => (
                    <option key={m.id} value={m.id} style={{ background: '#1c1c1c' }}>
                      {m.name} — {m.github} ({m.currentPhase.split(':')[0]})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Admin Coordinator Account
                </label>
                <div style={{ background: '#222222', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: '#eae6e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={18} color="#d4a373" />
                  <span>{adminUsers[0]?.name || 'Nivin (Admin Coordinator)'}</span>
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                <Lock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Access Password
              </label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '6px' }}>
              Sign In to {selectedRole === 'admin' ? 'Admin Coordinator Portal' : 'Member Learner Portal'} <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
