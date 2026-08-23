import React from 'react';
import { useRealtime } from '../context/RealtimeContext';
import { useLTrack } from '../context/LTrackContext';
import {
  Bell,
  X,
  CheckCircle2,
  Award,
  HeartHandshake,
  Sparkles,
  ExternalLink,
  Trash2
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead, clearNotification } = useRealtime();
  const { setActiveTab } = useLTrack();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'pr_graded':
        return <Award size={18} color="#849c86" />;
      case 'help_requested':
        return <HeartHandshake size={18} color="#c47662" />;
      case 'guidance_received':
        return <Sparkles size={18} color="#d4a373" />;
      case 'help_offered':
        return <CheckCircle2 size={18} color="#a4bfa6" />;
      default:
        return <Bell size={18} color="#d4a373" />;
    }
  };

  const handleNotificationClick = (linkTab?: string, id?: string) => {
    if (id) markNotificationAsRead(id);
    if (linkTab) {
      setActiveTab(linkTab);
      onClose();
    }
  };

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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
          width: '420px',
          maxWidth: '92vw',
          height: '100vh',
          background: '#161616',
          borderLeft: '1px solid var(--border-color)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          overflowY: 'auto',
          boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="#d4a373" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1' }}>
              Real-Time Notifications
            </h3>
            {unreadCount > 0 && (
              <span style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: '10px', background: '#c47662', color: '#fff', fontWeight: 700 }}>
                {unreadCount} new
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                style={{ background: 'none', border: 'none', color: '#d4a373', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Mark all read
              </button>
            )}
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
                justifyContent: 'center'
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Bell size={36} color="var(--text-dim)" style={{ margin: '0 auto 12px auto' }} />
            No new notifications right now.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n.linkTab, n.id)}
                style={{
                  background: n.read ? '#1e1e1e' : 'rgba(212, 163, 115, 0.12)',
                  border: '1px solid',
                  borderColor: n.read ? 'var(--border-color)' : 'rgba(212, 163, 115, 0.3)',
                  padding: '14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                  position: 'relative',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#242424', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getIcon(n.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: n.read ? '#eae6e1' : '#d4a373' }}>
                      {n.title}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {n.timestamp}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '6px' }}>
                    {n.message}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {n.linkTab && (
                      <span style={{ fontSize: '0.72rem', color: '#d4a373', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Open in {n.linkTab.replace('_', ' ')} <ExternalLink size={11} />
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(n.id);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                      title="Dismiss"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
