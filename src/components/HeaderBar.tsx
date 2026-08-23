import React, { useState, useEffect } from 'react';
import { useLTrack } from '../context/LTrackContext';
import { useRealtime } from '../context/RealtimeContext';
import { NotificationDrawer } from './NotificationDrawer';
import { SpotlightSearchModal } from './SpotlightSearchModal';
import {
  Search,
  Bell,
  Menu,
  Clock
} from 'lucide-react';
import { getISTTimeString } from '../utils/dateUtils';

interface HeaderBarProps {
  onToggleMobileSidebar?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onToggleMobileSidebar }) => {
  const { currentUser, activeTab, setActiveTab } = useLTrack();
  const { unreadCount } = useRealtime();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [istTime, setIstTime] = useState<string>(() => getISTTimeString(new Date(), true));

  // Ticking Indian Standard Time (IST / Mumbai) clock
  useEffect(() => {
    const interval = setInterval(() => {
      setIstTime(getISTTimeString(new Date(), true));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global Keyboard Shortcut: Cmd+K (macOS) or Ctrl+K (Windows/Linux) to open Spotlight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowSearchModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Primary Top Navigation Tabs
  const memberNavTabs = [
    { id: 'member_dashboard', label: 'Dashboard' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'code_sandbox', label: 'Code Sandbox' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'peer_help', label: 'Peer Hub' }
  ];

  const adminNavTabs = [
    { id: 'admin_dashboard', label: 'Overview' },
    { id: 'assignments', label: 'Assignments Hub' },
    { id: 'evidence_engine', label: 'Evidence Engine' },
    { id: 'skill_matrix', label: 'Skill Matrix' }
  ];

  const navTabs = currentUser.role === 'admin' ? adminNavTabs : memberNavTabs;

  return (
    <div style={{ padding: '16px 20px 0 20px', width: '100%' }}>
      {/* Floating Header Capsule */}
      <header style={{
        height: '68px',
        background: 'rgba(20, 20, 26, 0.85)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        border: '1px solid rgba(212, 163, 115, 0.16)',
        borderRadius: '24px',
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        gap: '12px'
      }}>
        {/* 1. Left: Mobile Hamburger (Only on Tab/Mobile) & Brand Mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="show-on-mobile"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '7px',
                color: '#eae6e1',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Toggle Tool Drawer"
            >
              <Menu size={18} />
            </button>
          )}

          <img
            src="/logo.png"
            alt="LTrack Logo"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '11px',
              objectFit: 'cover',
              boxShadow: '0 4px 14px rgba(212, 163, 115, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
              LTrack
            </span>
            <span style={{
              fontSize: '0.58rem',
              padding: '2px 6px',
              borderRadius: '6px',
              background: currentUser.role === 'admin' ? 'rgba(212, 163, 115, 0.16)' : 'rgba(52, 211, 153, 0.16)',
              color: currentUser.role === 'admin' ? '#d4a373' : '#34d399',
              border: '1px solid',
              borderColor: currentUser.role === 'admin' ? 'rgba(212, 163, 115, 0.3)' : 'rgba(52, 211, 153, 0.3)',
              fontWeight: 700
            }}>
              {currentUser.role === 'admin' ? 'ADMIN' : 'LEARNER'}
            </span>
          </div>
        </div>

        {/* 2. Center: Segmented Navigation Capsule with Horizontal Touch Scroll */}
        <nav
          className="header-tabs-scroll"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '3px 4px',
            borderRadius: '24px',
            gap: '3px',
            maxWidth: '60vw',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '18px',
                  border: 'none',
                  background: isActive ? '#f5f5f7' : 'transparent',
                  color: isActive ? '#0e0e12' : 'var(--text-muted)',
                  fontWeight: isActive ? 800 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.35)' : 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* 3. Right: Live IST Clock, Spotlight Capsule, Bell & Profile Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Live Indian Standard Time (IST / Mumbai) Capsule */}
          <div
            className="hide-on-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(212, 163, 115, 0.22)',
              borderRadius: '18px',
              padding: '5px 11px',
              color: '#eae6e1',
              fontSize: '0.74rem',
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
            title="Indian Standard Time (IST / Mumbai, UTC+5:30)"
          >
            <Clock size={13} color="#d4a373" />
            <span style={{ color: '#d4a373', letterSpacing: '0.02em' }}>{istTime}</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', fontWeight: 700 }}>IST</span>
          </div>

          {/* Spotlight Search Capsule */}
          <button
            onClick={() => setShowSearchModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '6px 10px',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Search curriculum, assignments, peers (Cmd+K)"
          >
            <Search size={14} color="#d4a373" />
            <span className="hide-on-mobile">Spotlight</span>
            <span className="hide-on-mobile" style={{
              fontSize: '0.64rem',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-main)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              ⌘K
            </span>
          </button>

          {/* Notification Bell Pill */}
          <button
            onClick={() => setShowNotifDrawer(true)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease'
            }}
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)'
              }} />
            )}
          </button>

          {/* Profile Avatar Pill */}
          <div
            onClick={() => setActiveTab('profile')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px',
              borderRadius: '50%',
              border: activeTab === 'profile' ? '2px solid #d4a373' : '2px solid transparent'
            }}
            title={`View Profile (${currentUser.name})`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </header>

      {/* Apple Spotlight Search Modal Dialog */}
      <SpotlightSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotifDrawer}
        onClose={() => setShowNotifDrawer(false)}
      />
    </div>
  );
};
