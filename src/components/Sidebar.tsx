import React, { useState } from 'react';
import { useLTrack } from '../context/LTrackContext';
import { useRealtime } from '../context/RealtimeContext';
import {
  Plus,
  Terminal,
  GitBranch,
  Grid,
  ShieldCheck,
  Calendar,
  LogOut,
  Code2,
  Settings,
  X,
  HelpCircle,
  BookOpen,
  Network
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const { activeTab, setActiveTab, logout } = useLTrack();
  const { onlinePresence, isConnected, activePairingRoom } = useRealtime();

  const [isHovered, setIsHovered] = useState(false);
  const [hoveredOptionId, setHoveredOptionId] = useState<string | null>(null);
  const onlineCount = onlinePresence.filter((p) => p.isOnline).length;

  // Quick Action Tool Rail Items
  const railItems = [
    {
      id: 'knowledge_graph',
      label: 'Knowledge Graph',
      icon: Network,
      badge: 'E2E',
      badgeColor: '#34d399'
    },
    {
      id: 'quizzes',
      label: 'Concept Quizzes',
      icon: HelpCircle,
      badge: 'New',
      badgeColor: '#38bdf8'
    },
    {
      id: 'flashcards',
      label: 'Revision Flashcards',
      icon: BookOpen,
      badge: null
    },
    {
      id: 'code_sandbox',
      label: 'Code Sandbox',
      icon: Terminal,
      badge: 'Live',
      badgeColor: '#34d399'
    },
    {
      id: 'pairing_studio',
      label: 'Live Pairing Studio',
      icon: Code2,
      badge: activePairingRoom ? 'Active' : null,
      badgeColor: '#38bdf8'
    },
    {
      id: 'daily_learning',
      label: 'Daily Task Log',
      icon: Calendar,
      badge: null
    },
    {
      id: 'github_activity',
      label: 'Git Quality Studio',
      icon: GitBranch,
      badge: null
    },
    {
      id: 'skill_matrix',
      label: 'Skill Matrix',
      icon: Grid,
      badge: null
    },
    {
      id: 'evidence_engine',
      label: 'Evidence Engine',
      icon: ShieldCheck,
      badge: null
    }
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const isExpanded = isHovered || mobileOpen;

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 998,
            animation: 'appleFadeIn 0.2s ease'
          }}
        />
      )}

      {/* Sidebar Pill Container */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoveredOptionId(null);
        }}
        style={{
          position: mobileOpen ? 'fixed' : 'relative',
          top: mobileOpen ? 0 : undefined,
          left: mobileOpen ? 0 : undefined,
          bottom: mobileOpen ? 0 : undefined,
          zIndex: mobileOpen ? 999 : 50,
          width: mobileOpen ? '260px' : isHovered ? '220px' : '68px',
          height: mobileOpen ? '100vh' : 'calc(100% - 32px)',
          margin: mobileOpen ? 0 : '16px 0 16px 20px',
          background: 'rgba(20, 20, 26, 0.94)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          border: '1px solid rgba(212, 163, 115, 0.16)',
          borderRadius: mobileOpen ? '0 24px 24px 0' : '28px',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px 12px',
          transition: 'width 0.26s cubic-bezier(0.16, 1, 0.3, 1), transform 0.26s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          flexShrink: 0,
          boxSizing: 'border-box'
        }}
      >
        {/* Top: Header & Quick New Session Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          {mobileOpen && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px 6px 4px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src="/logo.png" alt="LTrack Logo" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#eae6e1' }}>LTrack Tools</span>
              </div>
              <button
                onClick={onCloseMobile}
                style={{ background: 'none', border: 'none', color: '#a1a1a6', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* New Code Session Button */}
          <button
            onClick={() => handleSelectTab('code_sandbox')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #d4a373 0%, #c89666 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: isExpanded ? '14px' : '22px',
              width: isExpanded ? '100%' : '44px',
              height: '44px',
              padding: isExpanded ? '0 12px' : '0',
              color: '#0e0e12',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(212, 163, 115, 0.35)',
              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxSizing: 'border-box'
            }}
            title="Open Code Sandbox"
          >
            <Plus size={20} strokeWidth={3} color="#0e0e12" style={{ flexShrink: 0 }} />
            {isExpanded && <span style={{ letterSpacing: '-0.01em', color: '#0e0e12' }}>New Code Session</span>}
          </button>

          {/* Rail Navigation Pills List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
            {railItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isHoveredOption = hoveredOptionId === item.id && !isActive;

              let bg = 'transparent';
              let borderColor = 'transparent';
              let color = 'var(--text-muted)';
              let boxShadow = 'none';

              if (isActive) {
                bg = 'rgba(212, 163, 115, 0.18)';
                borderColor = 'rgba(212, 163, 115, 0.38)';
                color = '#d4a373';
                boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 4px 12px rgba(212, 163, 115, 0.12)';
              } else if (isHoveredOption) {
                bg = 'rgba(255, 255, 255, 0.08)';
                borderColor = 'rgba(255, 255, 255, 0.18)';
                color = '#f5f5f7';
                boxShadow = 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 4px 14px rgba(0, 0, 0, 0.35)';
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  onMouseEnter={() => setHoveredOptionId(item.id)}
                  onMouseLeave={() => setHoveredOptionId(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    gap: '10px',
                    padding: isExpanded ? '9px 10px' : '9px 0',
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor,
                    background: bg,
                    backdropFilter: isHoveredOption ? 'blur(16px)' : 'none',
                    WebkitBackdropFilter: isHoveredOption ? 'blur(16px)' : 'none',
                    color,
                    cursor: 'pointer',
                    width: '100%',
                    boxSizing: 'border-box',
                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    whiteSpace: 'nowrap',
                    boxShadow,
                    overflow: 'hidden'
                  }}
                  title={!isExpanded ? item.label : undefined}
                >
                  <Icon
                    size={18}
                    color={isActive ? '#d4a373' : isHoveredOption ? '#f5f5f7' : 'var(--text-muted)'}
                    strokeWidth={isActive ? 2.4 : 2}
                    style={{ flexShrink: 0, transition: 'color 0.15s ease' }}
                  />

                  {isExpanded && (
                    <>
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 800 : isHoveredOption ? 600 : 500,
                        flex: 1,
                        textAlign: 'left',
                        letterSpacing: '-0.01em',
                        color: isActive ? '#d4a373' : isHoveredOption ? '#ffffff' : 'var(--text-main)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.label}
                      </span>

                      {item.badge && (
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: `${item.badgeColor}25`,
                          color: item.badgeColor,
                          border: `1px solid ${item.badgeColor}40`,
                          lineHeight: 1.4
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Real-time Presence, Profile Pill & Logout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
          {/* Real-time System Presence Dot */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              gap: '8px',
              padding: isExpanded ? '4px 8px' : '4px 0',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)'
            }}
            title={`${onlineCount} users online | ${isConnected ? 'WebSocket Sync Connected' : 'BroadcastChannel IPC Sync'}`}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isConnected ? '#34d399' : '#d4a373',
                boxShadow: isConnected ? '0 0 8px #34d399' : '0 0 8px #d4a373',
                animation: 'pulse 2s infinite',
                flexShrink: 0
              }}
            />
            {isExpanded && (
              <span style={{ fontSize: '0.7rem', color: isConnected ? '#849c86' : '#d4a373', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {onlineCount} Online • {isConnected ? 'Live Sync' : 'Local Sync'}
              </span>
            )}
          </div>

          {/* Settings & Preferences Action */}
          <button
            onClick={() => handleSelectTab('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              gap: '10px',
              padding: isExpanded ? '8px 10px' : '8px 0',
              borderRadius: '12px',
              border: activeTab === 'settings' ? '1px solid rgba(212, 163, 115, 0.35)' : '1px solid transparent',
              background: activeTab === 'settings' ? 'rgba(212, 163, 115, 0.15)' : 'transparent',
              color: activeTab === 'settings' ? '#d4a373' : 'var(--text-dim)',
              cursor: 'pointer',
              width: '100%',
              fontSize: '0.78rem',
              fontWeight: activeTab === 'settings' ? 700 : 600,
              transition: 'all 0.15s ease'
            }}
            title="Settings & Preferences"
          >
            <Settings size={16} style={{ flexShrink: 0 }} />
            {isExpanded && <span>Settings</span>}
          </button>

          {/* Sign Out Action */}
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              gap: '10px',
              padding: isExpanded ? '8px 10px' : '8px 0',
              borderRadius: '12px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              width: '100%',
              fontSize: '0.78rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
            title="Sign Out"
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {isExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
