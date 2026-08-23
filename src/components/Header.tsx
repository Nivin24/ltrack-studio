import React from 'react';
import { useLTrack } from '../context/LTrackContext';
import { Flame, Shield, User, Download, RefreshCw, Layers, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    members,
    switchUser,
    toggleRole,
    logout,
    exportDataJSON,
    resetToDefault
  } = useLTrack();

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: '#161616',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #c89666 0%, #d4a373 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(200, 150, 102, 0.25)'
          }}>
            <Layers size={20} color="#121212" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#eae6e1' }}>
                LTrack
              </span>
              <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: currentUser.role === 'admin' ? 'rgba(132, 156, 134, 0.2)' : 'rgba(212, 163, 115, 0.2)', color: currentUser.role === 'admin' ? '#a4bfa6' : '#d4a373', border: '1px solid var(--border-color)', fontWeight: 700 }}>
                {currentUser.role === 'admin' ? 'ADMIN PORTAL' : 'MEMBER PORTAL'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Collaborative Engineering Learning Platform
            </p>
          </div>
        </div>

        {/* Controls & Persona Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Flame Streak */}
          <div className="streak-flame">
            <Flame size={16} fill="#e5b982" color="#e5b982" />
            <span>{currentUser.streak} Day Streak</span>
          </div>

          {/* Member Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#222222', padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <User size={15} color="var(--text-muted)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Account:</span>
            <select
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#eae6e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {members.map((m) => (
                <option key={m.id} value={m.id} style={{ background: '#1c1c1c', color: '#eae6e1' }}>
                  {m.name} ({m.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Role Toggle Button */}
          <button
            onClick={toggleRole}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            title="Switch portal workspace role"
          >
            <Shield size={14} color={currentUser.role === 'admin' ? '#d4a373' : '#849c86'} />
            <span>Role: <strong style={{ color: currentUser.role === 'admin' ? '#d4a373' : '#849c86' }}>{currentUser.role.toUpperCase()}</strong></span>
          </button>

          {/* Data Backup */}
          <button
            onClick={exportDataJSON}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            title="Export full learning state JSON backup"
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo state back to default?')) {
                resetToDefault();
              }
            }}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 10px', color: '#a69f95' }}
            title="Reset data"
          >
            <RefreshCw size={14} />
          </button>

          {/* Sign Out */}
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px', color: '#c47662', borderColor: 'rgba(196, 118, 98, 0.3)' }}
            title="Log out to Portal Selection Screen"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
