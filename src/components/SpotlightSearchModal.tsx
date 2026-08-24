import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLTrack } from '../context/LTrackContext';
import { useRealtime } from '../context/RealtimeContext';
import { useDebounce } from '../hooks/useDebounce';
import {
  Search,
  LayoutDashboard,
  Map,
  Calendar,
  Terminal,
  Code2,
  Award,
  Users,
  GitBranch,
  Grid,
  ShieldCheck,
  User,
  Settings,
  BookOpen,
  ArrowRight,
  Sparkles,
  CornerDownLeft,
  X,
  FileCode,
  Download,
  PlusCircle,
  HelpCircle,
  Layers,
  Network
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export interface SpotlightItem {
  id: string;
  group: 'Applications & Pages' | 'Curriculum Topics' | 'Assignments & PRs' | 'Team Members' | 'Quick Actions' | 'Assignments';
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  onSelect: () => void;
}

export const SpotlightSearchModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    topics,
    assignments,
    members,
    setActiveTab,
    exportDataJSON,
    toggleRole
  } = useLTrack();

  const { activePairingRoom } = useRealtime();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 60);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus on mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // All Available Application Pages
  const allPages: SpotlightItem[] = useMemo(() => [
    {
      id: 'page_dash',
      group: 'Applications & Pages',
      title: currentUser.role === 'admin' ? 'Admin Overview Dashboard' : 'Member Focus Dashboard',
      subtitle: 'Daily streak, focus topics, and active progress telemetry',
      badge: 'Home',
      icon: LayoutDashboard,
      onSelect: () => {
        setActiveTab(currentUser.role === 'admin' ? 'admin_dashboard' : 'member_dashboard');
        onClose();
      }
    },
    {
      id: 'page_knowledge_graph',
      group: 'Applications & Pages',
      title: 'E2E Knowledge Graph & Skill Web',
      subtitle: 'Neural skill graph from Python to production with prerequisite cascades & personalized mastery',
      badge: 'Neural Graph',
      badgeColor: '#34d399',
      icon: Network,
      onSelect: () => {
        setActiveTab('knowledge_graph');
        onClose();
      }
    },
    {
      id: 'page_quizzes',
      group: 'Applications & Pages',
      title: 'Engineering Concept Quizzes',
      subtitle: 'Knowledge assessments, failed topic diagnostic reports & private logs',
      badge: 'Assessment',
      badgeColor: '#38bdf8',
      icon: HelpCircle,
      onSelect: () => {
        setActiveTab('quizzes');
        onClose();
      }
    },
    {
      id: 'page_flashcards',
      group: 'Applications & Pages',
      title: 'Revision Flashcards Hub',
      subtitle: 'Spaced repetition revision cards with 3D flip & quiz review decks',
      badge: 'Study',
      badgeColor: '#d4a373',
      icon: Layers,
      onSelect: () => {
        setActiveTab('flashcards');
        onClose();
      }
    },
    {
      id: 'page_sandbox',
      group: 'Applications & Pages',
      title: 'Python Code Sandbox',
      subtitle: 'In-browser Python 3.12 engine, coding challenges & async scratchpad',
      badge: 'IDE',
      badgeColor: '#34d399',
      icon: Terminal,
      onSelect: () => {
        setActiveTab('code_sandbox');
        onClose();
      }
    },
    {
      id: 'page_pairing',
      group: 'Applications & Pages',
      title: 'Live Pairing Studio',
      subtitle: 'Real-time co-op code editor, Discord voice calling, and WhatsApp audio notes',
      badge: activePairingRoom ? 'Live' : 'Studio',
      badgeColor: '#38bdf8',
      icon: Code2,
      onSelect: () => {
        setActiveTab('pairing_studio');
        onClose();
      }
    },
    {
      id: 'page_calendar',
      group: 'Applications & Pages',
      title: 'Daily Task Log & Calendar',
      subtitle: 'Interactive day-by-day task planner, curriculum schedule & reflection logs',
      badge: 'Tasks',
      icon: Calendar,
      onSelect: () => {
        setActiveTab('daily_learning');
        onClose();
      }
    },
    {
      id: 'page_roadmap',
      group: 'Applications & Pages',
      title: 'Visual Learning Roadmap',
      subtitle: '15-phase structured curriculum: Python, FastAPI, Docker, RAG, Agentic AI',
      badge: '15 Phases',
      icon: Map,
      onSelect: () => {
        setActiveTab('roadmap');
        onClose();
      }
    },
    {
      id: 'page_assignments',
      group: 'Applications & Pages',
      title: 'Assignments & PR Hub',
      subtitle: 'GitHub PR submission, multi-axis rubric grading, and feedback reviews',
      badge: `${assignments.length} Tasks`,
      icon: Award,
      onSelect: () => {
        setActiveTab('assignments');
        onClose();
      }
    },
    {
      id: 'page_peer_help',
      group: 'Applications & Pages',
      title: 'Peer Help Community & Hub',
      subtitle: 'Live doubt resolver, pair coding requests, and mentor guidance notes',
      badge: 'Community',
      icon: Users,
      onSelect: () => {
        setActiveTab('peer_help');
        onClose();
      }
    },
    {
      id: 'page_git',
      group: 'Applications & Pages',
      title: 'Git Quality & Activity Studio',
      subtitle: 'Branch hygiene, commit conventions, and code review radar charts',
      badge: 'Git',
      icon: GitBranch,
      onSelect: () => {
        setActiveTab('github_activity');
        onClose();
      }
    },
    {
      id: 'page_skill_matrix',
      group: 'Applications & Pages',
      title: 'Skill Matrix & Radar Heatmap',
      subtitle: 'Multi-dimensional engineering mastery index across all core domains',
      badge: 'Skills',
      icon: Grid,
      onSelect: () => {
        setActiveTab('skill_matrix');
        onClose();
      }
    },
    {
      id: 'page_evidence',
      group: 'Applications & Pages',
      title: 'Verified Evidence Engine',
      subtitle: 'Objective 4-pillar algorithmic progress scoring with zero self-report bias',
      badge: 'Verified',
      icon: ShieldCheck,
      onSelect: () => {
        setActiveTab('evidence_engine');
        onClose();
      }
    },
    {
      id: 'page_profile',
      group: 'Applications & Pages',
      title: 'My Engineer Profile',
      subtitle: `Viewing profile for ${currentUser.name} (${currentUser.role})`,
      badge: currentUser.role.toUpperCase(),
      icon: User,
      onSelect: () => {
        setActiveTab('profile');
        onClose();
      }
    },
    {
      id: 'page_settings',
      group: 'Applications & Pages',
      title: 'Settings & Preferences',
      subtitle: 'Python IDE settings, audio hardware test, weekly study targets, and data backups',
      badge: 'Settings',
      icon: Settings,
      onSelect: () => {
        setActiveTab('settings');
        onClose();
      }
    }
  ], [currentUser, activePairingRoom, assignments.length, setActiveTab, onClose]);

  // Quick System Actions
  const quickActions: SpotlightItem[] = useMemo(() => [
    {
      id: 'act_checkin',
      group: 'Quick Actions',
      title: 'Open Daily Check-In & Streak Log',
      subtitle: 'Log study hours, confidence rating, and concept reflections for today',
      badge: 'Action',
      icon: PlusCircle,
      onSelect: () => {
        setActiveTab('daily_learning');
        onClose();
      }
    },
    {
      id: 'act_export',
      group: 'Quick Actions',
      title: 'Export Full JSON Progress Backup',
      subtitle: 'Download offline JSON archive of all check-ins, tasks, and code metrics',
      badge: 'Backup',
      icon: Download,
      onSelect: () => {
        exportDataJSON();
        onClose();
      }
    },
    {
      id: 'act_role',
      group: 'Quick Actions',
      title: `Switch View Mode (Currently ${currentUser.role === 'admin' ? 'Admin' : 'Learner'})`,
      subtitle: 'Toggle between Admin Command Center and Learner Focus Studio',
      badge: 'Role',
      icon: Sparkles,
      onSelect: () => {
        toggleRole();
        onClose();
      }
    }
  ], [currentUser.role, setActiveTab, exportDataJSON, toggleRole, onClose]);

  // Topic Items
  const topicItems: SpotlightItem[] = useMemo(() => {
    return topics.map((t) => ({
      id: `topic_${t.id}`,
      group: 'Curriculum Topics' as const,
      title: `Phase ${t.phaseNumber}: ${t.name}`,
      subtitle: `${t.category} • ${t.subtopics.length} subtopics • ~${t.estimatedMinutes} mins • ${t.description.slice(0, 70)}...`,
      badge: t.status.replace('_', ' ').toUpperCase(),
      badgeColor: t.status === 'completed' ? '#34d399' : t.status === 'learning' ? '#38bdf8' : undefined,
      icon: BookOpen,
      onSelect: () => {
        setActiveTab('roadmap');
        onClose();
      }
    }));
  }, [topics, setActiveTab, onClose]);

  // Assignment Items
  const assignmentItems: SpotlightItem[] = useMemo(() => {
    return assignments.map((a) => ({
      id: `asgn_${a.id}`,
      group: 'Assignments & PRs' as const,
      title: a.title,
      subtitle: `Difficulty: ${a.difficulty} • ~${a.expectedMinutes} mins • Deadline: ${a.deadline}`,
      badge: a.difficulty,
      badgeColor: a.difficulty === 'Hard' ? '#ef4444' : a.difficulty === 'Medium' ? '#d4a373' : '#34d399',
      icon: FileCode,
      onSelect: () => {
        setActiveTab('assignments');
        onClose();
      }
    }));
  }, [assignments, setActiveTab, onClose]);

  // Member Items
  const memberItems: SpotlightItem[] = useMemo(() => {
    return members.map((m) => ({
      id: `member_${m.id}`,
      group: 'Team Members' as const,
      title: m.name,
      subtitle: `${m.role.toUpperCase()} • GitHub: @${m.github} • ${m.currentPhase}`,
      badge: `${m.streak} Day Streak`,
      badgeColor: '#d4a373',
      icon: User,
      onSelect: () => {
        setActiveTab('peer_help');
        onClose();
      }
    }));
  }, [members, setActiveTab, onClose]);

  // Filtered & Grouped Search Computation
  const filteredResults = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();

    if (!q) {
      // Default initial view: show top Pages & Quick Actions
      return [
        ...allPages.slice(0, 6),
        ...quickActions
      ];
    }

    const matchedPages = allPages.filter(
      (p) => p.title.toLowerCase().includes(q) || (p.subtitle && p.subtitle.toLowerCase().includes(q))
    );

    const matchedTopics = topicItems.filter(
      (t) => t.title.toLowerCase().includes(q) || (t.subtitle && t.subtitle.toLowerCase().includes(q))
    );

    const matchedAssignments = assignmentItems.filter(
      (a) => a.title.toLowerCase().includes(q) || (a.subtitle && a.subtitle.toLowerCase().includes(q))
    );

    const matchedMembers = memberItems.filter(
      (m) => m.title.toLowerCase().includes(q) || (m.subtitle && m.subtitle.toLowerCase().includes(q))
    );

    const matchedActions = quickActions.filter(
      (a) => a.title.toLowerCase().includes(q) || (a.subtitle && a.subtitle.toLowerCase().includes(q))
    );

    return [
      ...matchedPages,
      ...matchedTopics,
      ...matchedAssignments,
      ...matchedMembers,
      ...matchedActions
    ];
  }, [debouncedQuery, allPages, topicItems, assignmentItems, memberItems, quickActions]);

  // Group items by category
  const groupedResults = useMemo(() => {
    const groups: { name: SpotlightItem['group']; items: SpotlightItem[] }[] = [];
    const groupOrder: SpotlightItem['group'][] = [
      'Applications & Pages',
      'Curriculum Topics',
      'Assignments & PRs',
      'Team Members',
      'Quick Actions'
    ];

    groupOrder.forEach((groupName) => {
      const itemsInGroup = filteredResults.filter((item) => item.group === groupName);
      if (itemsInGroup.length > 0) {
        groups.push({ name: groupName, items: itemsInGroup });
      }
    });

    return groups;
  }, [filteredResults]);

  // Flat list for indexing
  const flatItems = useMemo(() => {
    return groupedResults.flatMap((g) => g.items);
  }, [groupedResults]);

  // Keep selected index in range
  useEffect(() => {
    setSelectedIndex((prev) => {
      if (flatItems.length === 0) return 0;
      return Math.min(prev, flatItems.length - 1);
    });
  }, [flatItems]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        flatItems[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        zIndex: 9999
      }}
    >
      {/* Apple Spotlight Capsule Dialog */}
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'rgba(20, 20, 26, 0.94)',
          backdropFilter: 'blur(40px) saturate(220%)',
          WebkitBackdropFilter: 'blur(40px) saturate(220%)',
          border: '1px solid rgba(212, 163, 115, 0.35)',
          borderRadius: '18px',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 30px rgba(212, 163, 115, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          animation: 'appleModalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Spotlight Input Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <Search size={22} color="#d4a373" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search pages, topics, code challenges, assignments, or peers..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#eae6e1',
              fontSize: '1.05rem',
              fontWeight: 500,
              fontFamily: 'inherit',
              lineHeight: 1.4
            }}
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={12} />
            </button>
          ) : (
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                color: 'var(--text-dim)',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '2px 6px',
                borderRadius: '5px'
              }}
            >
              ESC
            </span>
          )}
        </div>

        {/* Grouped Results Feed */}
        <div
          ref={listRef}
          style={{
            maxHeight: '440px',
            overflowY: 'auto',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {flatItems.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <p style={{ fontSize: '0.92rem', color: '#eae6e1', fontWeight: 600, margin: '0 0 6px 0' }}>
                No results found for "{query}"
              </p>
              <p style={{ fontSize: '0.78rem', margin: 0 }}>
                Try searching for <em>"Sandbox"</em>, <em>"FastAPI"</em>, <em>"Pairing"</em>, <em>"Assignments"</em>, or a teammate's name.
              </p>
            </div>
          ) : (
            groupedResults.map((group) => (
              <div key={group.name} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {/* Category Group Header Label */}
                <div
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#d4a373',
                    padding: '4px 8px 2px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{group.name}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                    {group.items.length} {group.items.length === 1 ? 'match' : 'matches'}
                  </span>
                </div>

                {/* Group Items */}
                {group.items.map((item) => {
                  const globalIdx = flatItems.findIndex((f) => f.id === item.id);
                  const isSelected = selectedIndex === globalIdx;
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      onClick={item.onSelect}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                        background: isSelected
                          ? 'linear-gradient(90deg, rgba(212, 163, 115, 0.22) 0%, rgba(212, 163, 115, 0.12) 100%)'
                          : 'transparent',
                        border: isSelected
                          ? '1px solid rgba(212, 163, 115, 0.45)'
                          : '1px solid transparent',
                        boxShadow: isSelected ? '0 2px 10px rgba(0, 0, 0, 0.3)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: isSelected ? 'rgba(212, 163, 115, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Icon size={16} color={isSelected ? '#d4a373' : '#849c86'} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: isSelected ? 700 : 600, color: '#eae6e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.title}
                            </span>
                            {item.badge && (
                              <span
                                style={{
                                  fontSize: '0.62rem',
                                  fontWeight: 700,
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  background: item.badgeColor ? `${item.badgeColor}22` : 'rgba(255, 255, 255, 0.08)',
                                  color: item.badgeColor || 'var(--text-dim)',
                                  border: item.badgeColor ? `1px solid ${item.badgeColor}45` : '1px solid rgba(255, 255, 255, 0.08)',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <span style={{ fontSize: '0.72rem', color: isSelected ? 'var(--text-muted)' : 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Action Hint */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {isSelected ? (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: '#d4a373',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'rgba(212, 163, 115, 0.15)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid rgba(212, 163, 115, 0.3)'
                            }}
                          >
                            Open <CornerDownLeft size={11} />
                          </span>
                        ) : (
                          <ArrowRight size={14} color="rgba(255, 255, 255, 0.2)" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Spotlight Footer Bar */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.7rem',
            color: 'var(--text-dim)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <kbd style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#eae6e1', fontSize: '0.66rem' }}>↑↓</kbd> Navigate
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <kbd style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#eae6e1', fontSize: '0.66rem' }}>↵</kbd> Select
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <kbd style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#eae6e1', fontSize: '0.66rem' }}>esc</kbd> Dismiss
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="#d4a373" />
            <span style={{ color: '#d4a373', fontWeight: 600 }}>Apple Spotlight</span>
          </div>
        </div>
      </div>
    </div>
  );
};
