import React, { useState } from 'react';
import { useLTrack } from '../context/LTrackContext';
import { useDebounce } from '../hooks/useDebounce';
import type { User, Topic, Assignment } from '../types/ltrack';
import { MemberCrudModal } from '../components/admin/MemberCrudModal';
import { TopicCrudModal } from '../components/admin/TopicCrudModal';
import { AssignmentCrudModal } from '../components/admin/AssignmentCrudModal';
import { MemberDetailDrawer } from '../components/admin/MemberDetailDrawer';
import {
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronRight,
  ShieldCheck,
  Clock,
  X,
  Users,
  BookOpen,
  FileCode
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { members, topics, assignments, submissions, riskAlerts, deleteMember, deleteTopic, deleteAssignment } = useLTrack();

  const [activeAdminTab, setActiveAdminTab] = useState<'members' | 'topics' | 'assignments' | 'risks'>('members');
  
  // Search & Filter state
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');

  // Debounced search query for instant responsiveness
  const debouncedSearch = useDebounce(searchFilter, 220);

  // Modals state
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<User | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [selectedTopicForEdit, setSelectedTopicForEdit] = useState<Topic | null>(null);
  const [showTopicModal, setShowTopicModal] = useState(false);

  const [selectedAsgnForEdit, setSelectedAsgnForEdit] = useState<Assignment | null>(null);
  const [showAsgnModal, setShowAsgnModal] = useState(false);

  const [selectedMemberForDiagnostic, setSelectedMemberForDiagnostic] = useState<User | null>(null);
  const [showDiagnosticDrawer, setShowDiagnosticDrawer] = useState(false);

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.streak > 0).length;
  const totalSubmissions = submissions.length;
  const evaluatedCount = submissions.filter((s) => s.status === 'evaluated').length;

  // Filtered lists with Debounced search
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      m.github.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      m.currentPhase.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesRole =
      selectedRoleFilter === 'All' ||
      (selectedRoleFilter === 'member' && m.role === 'member') ||
      (selectedRoleFilter === 'admin' && m.role === 'admin') ||
      (selectedRoleFilter === 'at_risk' && riskAlerts.some((r) => r.userId === m.id));

    return matchesSearch && matchesRole;
  });

  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.subtopics.some((s) => s.name.toLowerCase().includes(debouncedSearch.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      a.description.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesDifficulty = selectedDifficulty === 'All' || a.difficulty === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* 1. Executive Coordinator Header */}
      <div className="glass-panel" style={{ padding: '24px 28px', background: '#1c1c1c', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ShieldCheck size={22} color="#d4a373" />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#eae6e1' }}>
                Coordinator Command Center & Management Hub
              </h1>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Full CRUD management for syllabus topics, assignments, member permissions, and individual progress diagnosis.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSelectedTopicForEdit(null);
                setShowTopicModal(true);
              }}
              style={{ fontSize: '0.82rem', padding: '8px 14px' }}
            >
              <Plus size={15} /> Add Topic
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => {
                setSelectedAsgnForEdit(null);
                setShowAsgnModal(true);
              }}
              style={{ fontSize: '0.82rem', padding: '8px 14px' }}
            >
              <Plus size={15} /> Add Assignment
            </button>

            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedMemberForEdit(null);
                setShowMemberModal(true);
              }}
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              <Plus size={15} /> Add Learner
            </button>
          </div>
        </div>

        {/* Coordinator KPI Metric Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Learners</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#eae6e1' }}>{totalMembers} Total</div>
            <span style={{ fontSize: '0.72rem', color: '#a4bfa6' }}>{activeMembers} Active on Streak</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Syllabus Depth</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#eae6e1' }}>{topics.length} Modules</div>
            <span style={{ fontSize: '0.72rem', color: '#d4a373' }}>{topics.reduce((acc, t) => acc + t.subtopics.length, 0)} Subtopics</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PR Submissions</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#eae6e1' }}>{totalSubmissions} Solutions</div>
            <span style={{ fontSize: '0.72rem', color: '#849c86' }}>{evaluatedCount} Graded & Verified</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Group Risk Alerts</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c47662' }}>{riskAlerts.length} Flagged</div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Intervention recommended</span>
          </div>
        </div>

        {/* Tab Filter Switcher */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', flexWrap: 'wrap' }}>
          {[
            { id: 'members', label: `Members & Diagnostic (${members.length})`, icon: Users },
            { id: 'topics', label: `Syllabus Curriculum (${topics.length})`, icon: BookOpen },
            { id: 'assignments', label: `Assignments Hub (${assignments.length})`, icon: FileCode },
            { id: 'risks', label: `Risk Interventions (${riskAlerts.length})`, icon: AlertTriangle }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveAdminTab(tab.id as any);
                  setSearchFilter('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 16px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: isActive ? '#d4a373' : 'var(--border-color)',
                  background: isActive ? 'rgba(212, 163, 115, 0.15)' : '#222222',
                  color: isActive ? '#d4a373' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <TabIcon size={14} color={isActive ? '#d4a373' : 'var(--text-muted)'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: MEMBERS DIRECTORY & INDIVIDUAL DIAGNOSTIC (CRUD) */}
      {activeAdminTab === 'members' && (
        <div className="glass-panel" style={{ padding: '24px', background: '#1c1c1c', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1' }}>
              Group Learners Directory & Progress Diagnosis ({filteredMembers.length})
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Role filter */}
              <select
                className="form-control"
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                style={{ width: '130px', height: '34px', fontSize: '0.78rem' }}
              >
                <option value="All" style={{ background: '#1c1c1c' }}>All Roles</option>
                <option value="member" style={{ background: '#1c1c1c' }}>Learners Only</option>
                <option value="admin" style={{ background: '#1c1c1c' }}>Admins Only</option>
                <option value="at_risk" style={{ background: '#1c1c1c' }}>At-Risk Only</option>
              </select>

              {/* Debounced Search */}
              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Debounced search..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{ paddingLeft: '32px', height: '34px', fontSize: '0.8rem' }}
                />
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter('')}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: '#222222',
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={m.avatar}
                    alt={m.name}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #d4a373', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#eae6e1' }}>{m.name}</h4>
                      <span className={`badge badge-${m.role === 'admin' ? 'completed' : 'learning'}`} style={{ fontSize: '0.65rem' }}>
                        {m.role.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {m.email} • {m.github} • {m.currentPhase.split(':')[0]}
                    </span>
                  </div>
                </div>

                {/* Progress & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#d4a373' }}>{m.streak}d Streak</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>{m.overallProgress}% Complete</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedMemberForDiagnostic(m);
                      setShowDiagnosticDrawer(true);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    title="Deep-dive learner inspection and guidance"
                  >
                    Diagnose & Guide <ChevronRight size={13} />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMemberForEdit(m);
                      setShowMemberModal(true);
                    }}
                    style={{ background: '#2a2a2a', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 10px', color: 'var(--text-muted)', cursor: 'pointer' }}
                    title="Edit Member"
                  >
                    <Edit2 size={13} />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Remove ${m.name} from group?`)) deleteMember(m.id);
                    }}
                    style={{ background: 'rgba(196, 118, 98, 0.15)', border: '1px solid rgba(196, 118, 98, 0.3)', borderRadius: '6px', padding: '6px 10px', color: '#c47662', cursor: 'pointer' }}
                    title="Delete Member"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SYLLABUS CURRICULUM MANAGER (CRUD) */}
      {activeAdminTab === 'topics' && (
        <div className="glass-panel" style={{ padding: '24px', background: '#1c1c1c', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1' }}>
              Syllabus Topics & Subtopics Curriculum ({filteredTopics.length})
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <select
                className="form-control"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: '130px', height: '34px', fontSize: '0.78rem' }}
              >
                {['All', 'Python', 'HTTP', 'REST', 'FastAPI', 'PostgreSQL', 'Auth', 'ML', 'AI', 'RAG', 'MCP', 'Agentic AI', 'Docker', 'CI/CD'].map((cat) => (
                  <option key={cat} value={cat} style={{ background: '#1c1c1c' }}>{cat}</option>
                ))}
              </select>

              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Debounced search..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{ paddingLeft: '32px', height: '34px', fontSize: '0.8rem' }}
                />
              </div>

              <button
                onClick={() => {
                  setSelectedTopicForEdit(null);
                  setShowTopicModal(true);
                }}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                <Plus size={14} /> Add Topic
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredTopics.map((t) => (
              <div key={t.id} style={{ background: '#222222', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge badge-learning" style={{ fontSize: '0.68rem' }}>
                      Phase {t.phaseNumber} • {t.category}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.estimatedMinutes} mins</span>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#eae6e1', marginBottom: '4px' }}>
                    {t.name}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {t.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#d4a373', fontWeight: 600 }}>
                    {t.subtopics.length} Subtopic Checklists
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setSelectedTopicForEdit(t);
                        setShowTopicModal(true);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      <Edit2 size={12} /> Edit
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete topic "${t.name}"?`)) deleteTopic(t.id);
                      }}
                      style={{ background: 'rgba(196, 118, 98, 0.15)', border: '1px solid rgba(196, 118, 98, 0.3)', borderRadius: '6px', padding: '4px 8px', color: '#c47662', cursor: 'pointer' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ASSIGNMENTS MANAGER (CRUD) */}
      {activeAdminTab === 'assignments' && (
        <div className="glass-panel" style={{ padding: '24px', background: '#1c1c1c', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1' }}>
              Assignments Hub & Coding Challenges ({filteredAssignments.length})
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <select
                className="form-control"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                style={{ width: '130px', height: '34px', fontSize: '0.78rem' }}
              >
                <option value="All" style={{ background: '#1c1c1c' }}>All Difficulties</option>
                <option value="Easy" style={{ background: '#1c1c1c' }}>Easy</option>
                <option value="Medium" style={{ background: '#1c1c1c' }}>Medium</option>
                <option value="Hard" style={{ background: '#1c1c1c' }}>Hard</option>
              </select>

              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Debounced search..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{ paddingLeft: '32px', height: '34px', fontSize: '0.8rem' }}
                />
              </div>

              <button
                onClick={() => {
                  setSelectedAsgnForEdit(null);
                  setShowAsgnModal(true);
                }}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                <Plus size={14} /> Create Assignment
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredAssignments.map((asgn) => {
              const subsForThis = submissions.filter((s) => s.assignmentId === asgn.id);
              return (
                <div key={asgn.id} style={{ background: '#222222', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge badge-learning" style={{ fontSize: '0.68rem' }}>
                        {asgn.difficulty} Difficulty
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} /> Deadline: {asgn.deadline}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#eae6e1', marginBottom: '4px' }}>
                      {asgn.title}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {asgn.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#a4bfa6', fontWeight: 700 }}>
                      {subsForThis.length} Submissions
                    </span>

                    <button
                      onClick={() => {
                        setSelectedAsgnForEdit(asgn);
                        setShowAsgnModal(true);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete assignment "${asgn.title}"?`)) deleteAssignment(asgn.id);
                      }}
                      style={{ background: 'rgba(196, 118, 98, 0.15)', border: '1px solid rgba(196, 118, 98, 0.3)', borderRadius: '6px', padding: '6px 10px', color: '#c47662', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: RISK INTERVENTIONS */}
      {activeAdminTab === 'risks' && (
        <div className="glass-panel" style={{ padding: '24px', background: '#1c1c1c', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#c47662" /> At-Risk Learner Detection & Rapid Intervention
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {riskAlerts.map((alert) => {
              const student = members.find((m) => m.id === alert.userId);
              return (
                <div key={alert.id} style={{ background: '#222222', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img src={alert.userAvatar} alt={alert.userName} style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #c47662' }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#eae6e1' }}>{alert.userName}</h4>
                        <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(196, 118, 98, 0.15)', color: '#c47662', fontWeight: 700 }}>
                          HIGH RISK
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Reasons: {alert.reasons.join(', ')}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#d4a373', fontWeight: 600 }}>
                        Action: {alert.recommendedAction}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (student) {
                        setSelectedMemberForDiagnostic(student);
                        setShowDiagnosticDrawer(true);
                      }
                    }}
                    className="btn btn-primary"
                    style={{ padding: '8px 14px', fontSize: '0.78rem' }}
                  >
                    Open Diagnostic & Dispatch Plan →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CRUD Modals & Inspection Drawer */}
      <MemberCrudModal
        member={selectedMemberForEdit}
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
      />

      <TopicCrudModal
        topic={selectedTopicForEdit}
        isOpen={showTopicModal}
        onClose={() => setShowTopicModal(false)}
      />

      <AssignmentCrudModal
        assignment={selectedAsgnForEdit}
        isOpen={showAsgnModal}
        onClose={() => setShowAsgnModal(false)}
      />

      <MemberDetailDrawer
        member={selectedMemberForDiagnostic}
        isOpen={showDiagnosticDrawer}
        onClose={() => setShowDiagnosticDrawer(false)}
      />
    </div>
  );
};
