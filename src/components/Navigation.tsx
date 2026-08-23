import React from 'react';
import { useLTrack } from '../context/LTrackContext';
import { LayoutDashboard, Map, Calendar, FileCode, Grid, ShieldCheck, UserCheck } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useLTrack();

  const tabs = [
    {
      id: 'admin_dashboard',
      label: 'Admin Overview',
      icon: LayoutDashboard,
      roleRestriction: 'admin'
    },
    {
      id: 'member_dashboard',
      label: 'Learner Dashboard',
      icon: UserCheck,
      roleRestriction: null
    },
    {
      id: 'roadmap',
      label: 'Visual Roadmap',
      icon: Map,
      roleRestriction: null
    },
    {
      id: 'daily_learning',
      label: 'Daily Tasks',
      icon: Calendar,
      roleRestriction: null
    },
    {
      id: 'assignments',
      label: 'Assignment Hub',
      icon: FileCode,
      roleRestriction: null
    },
    {
      id: 'skill_matrix',
      label: 'Skill Matrix',
      icon: Grid,
      roleRestriction: null
    },
    {
      id: 'evidence_engine',
      label: 'Verified Progress',
      icon: ShieldCheck,
      roleRestriction: null
    }
  ];

  return (
    <nav style={{
      borderBottom: '1px solid var(--border-color)',
      background: '#141414',
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        padding: '6px 0'
      }}>
        {tabs
          .filter((t) => !t.roleRestriction || currentUser.role === t.roleRestriction)
          .map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isActive ? 'rgba(212, 163, 115, 0.12)' : 'transparent',
                  color: isActive ? '#d4a373' : 'var(--text-muted)',
                  borderBottom: isActive ? '2px solid #d4a373' : '2px solid transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} color={isActive ? '#d4a373' : 'var(--text-muted)'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
      </div>
    </nav>
  );
};
