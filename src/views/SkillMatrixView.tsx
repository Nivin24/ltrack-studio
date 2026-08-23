import React, { useState, useMemo } from 'react';
import { useLTrack } from '../context/LTrackContext';
import { useRealtime } from '../context/RealtimeContext';
import {
  Grid,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Handshake,
  Check,
  BarChart3,
  Clock,
  Layers
} from 'lucide-react';
import type { User } from '../types/ltrack';

type ProficiencyLevel = 'mastered' | 'proficient' | 'learning' | 'needs_help' | 'not_started';

interface SubtopicMastery {
  subtopicId: string;
  subtopicName: string;
  topicId: string;
  topicName: string;
  phaseNumber: number;
  category: string;
  memberProficiencies: Record<string, ProficiencyLevel>;
  teamMasteryPct: number;
}

interface PairingRecommendation {
  id: string;
  subtopicName: string;
  topicName: string;
  category: string;
  strugglingUser: User;
  mentorUser: User;
  reason: string;
}

export const SkillMatrixView: React.FC = () => {
  const {
    members,
    topics,
    currentUser,
    checkIns,
    calculateEvidence,
    setActiveTab,
    requestPeerHelp
  } = useLTrack();

  const { startPairingSession } = useRealtime();

  // Active View Mode: 'subtopics' (Granular) vs 'domains' (High Level)
  const [viewMode, setViewMode] = useState<'subtopics' | 'domains'>('subtopics');

  // Filters
  const [selectedPhase, setSelectedPhase] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_help' | 'mastered'>('all');

  // Selected subtopic for detailed mentor inspection modal
  const [inspectedSubtopic, setInspectedSubtopic] = useState<{
    subtopic: SubtopicMastery;
    targetUser?: User;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom User-Declared Overrides (stored in localStorage so peers can mark "I can teach" or "I need help")
  const [customProficiencies, setCustomProficiencies] = useState<Record<string, ProficiencyLevel>>(() => {
    try {
      const saved = localStorage.getItem('ltrack_custom_subtopic_mastery');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const updateSubtopicStatus = (userId: string, subtopicId: string, level: ProficiencyLevel) => {
    const key = `${userId}_${subtopicId}`;
    const updated = { ...customProficiencies, [key]: level };
    setCustomProficiencies(updated);
    try {
      localStorage.setItem('ltrack_custom_subtopic_mastery', JSON.stringify(updated));
    } catch {}

    setToastMessage(`✓ Updated status to "${level.replace('_', ' ').toUpperCase()}"`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Compute Subtopic Mastery for all members across all curriculum topics
  const subtopicMasteries: SubtopicMastery[] = useMemo(() => {
    const list: SubtopicMastery[] = [];

    topics.forEach((topic) => {
      topic.subtopics.forEach((sub) => {
        const memberProf: Record<string, ProficiencyLevel> = {};
        let masteredCount = 0;

        members.forEach((m) => {
          const overrideKey = `${m.id}_${sub.id}`;
          if (customProficiencies[overrideKey]) {
            memberProf[m.id] = customProficiencies[overrideKey];
            if (customProficiencies[overrideKey] === 'mastered') masteredCount++;
            return;
          }

          // Check if user flagged confusion in daily check-ins for this topic
          const hasReportedConfusion = checkIns.some(
            (c) =>
              c.userId === m.id &&
              (c.confusedAbout?.toLowerCase().includes(sub.name.toLowerCase()) ||
                c.whatLearned?.toLowerCase().includes(sub.name.toLowerCase()) && c.confidenceScore <= 2)
          );

          if (hasReportedConfusion) {
            memberProf[m.id] = 'needs_help';
            return;
          }

          // Deterministic mastery calculation based on topic status & member progress
          const evidence = calculateEvidence(topic.id, m.id);
          if (evidence.verifiedMasteryPct >= 80) {
            memberProf[m.id] = 'mastered';
            masteredCount++;
          } else if (evidence.verifiedMasteryPct >= 50 || sub.status === 'completed') {
            memberProf[m.id] = 'proficient';
            masteredCount += 0.7;
          } else if (sub.status === 'learning' || evidence.verifiedMasteryPct > 0) {
            memberProf[m.id] = 'learning';
          } else {
            memberProf[m.id] = 'not_started';
          }
        });

        const teamMasteryPct = Math.round((masteredCount / members.length) * 100);

        list.push({
          subtopicId: sub.id,
          subtopicName: sub.name,
          topicId: topic.id,
          topicName: topic.name,
          phaseNumber: topic.phaseNumber,
          category: topic.category,
          memberProficiencies: memberProf,
          teamMasteryPct
        });
      });
    });

    return list;
  }, [topics, members, customProficiencies, checkIns, calculateEvidence]);

  // Automated Peer Pairing Recommendations Engine
  const pairingRecommendations: PairingRecommendation[] = useMemo(() => {
    const recs: PairingRecommendation[] = [];

    subtopicMasteries.forEach((sub) => {
      // Find members who need help or are learning this subtopic
      const strugglingMembers = members.filter(
        (m) =>
          sub.memberProficiencies[m.id] === 'needs_help' ||
          (sub.memberProficiencies[m.id] === 'learning' && m.id === currentUser.id)
      );

      // Find members who have Mastered this subtopic
      const masterMembers = members.filter(
        (m) => sub.memberProficiencies[m.id] === 'mastered'
      );

      if (strugglingMembers.length > 0 && masterMembers.length > 0) {
        strugglingMembers.forEach((learner) => {
          // Pair with the highest streak or different user
          const mentor = masterMembers.find((m) => m.id !== learner.id) || masterMembers[0];
          if (mentor && mentor.id !== learner.id) {
            recs.push({
              id: `pair_${sub.subtopicId}_${learner.id}_${mentor.id}`,
              subtopicName: sub.subtopicName,
              topicName: sub.topicName,
              category: sub.category,
              strugglingUser: learner,
              mentorUser: mentor,
              reason: `${learner.name.split(' ')[0]} needs help with ${sub.subtopicName}, while ${mentor.name.split(' ')[0]} has 100% verified mastery.`
            });
          }
        });
      }
    });

    // Return unique top 4 recommendations
    const seen = new Set<string>();
    return recs.filter((r) => {
      const key = `${r.strugglingUser.id}_${r.subtopicName}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 4);
  }, [subtopicMasteries, members, currentUser.id]);

  // Filtered Subtopics List
  const filteredSubtopics = useMemo(() => {
    return subtopicMasteries.filter((sub) => {
      // Phase Filter
      if (selectedPhase !== 'all' && sub.phaseNumber !== selectedPhase) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = sub.subtopicName.toLowerCase().includes(q);
        const matchTopic = sub.topicName.toLowerCase().includes(q);
        const matchCat = sub.category.toLowerCase().includes(q);
        if (!matchName && !matchTopic && !matchCat) return false;
      }

      // Status Filter
      if (statusFilter === 'needs_help') {
        const hasHelpNeed = Object.values(sub.memberProficiencies).some((p) => p === 'needs_help');
        if (!hasHelpNeed) return false;
      } else if (statusFilter === 'mastered') {
        const hasMastered = Object.values(sub.memberProficiencies).some((p) => p === 'mastered');
        if (!hasMastered) return false;
      }

      return true;
    });
  }, [subtopicMasteries, selectedPhase, searchQuery, statusFilter]);

  // Team Knowledge Gaps (Subtopics where < 50% of the team is proficient)
  const teamKnowledgeGaps = useMemo(() => {
    return subtopicMasteries
      .filter((s) => s.teamMasteryPct < 40)
      .slice(0, 3);
  }, [subtopicMasteries]);

  // Handle 1-Click Launch of Pairing Room
  const handleLaunchPairing = (rec: PairingRecommendation) => {
    startPairingSession(rec.mentorUser.id, `${rec.category}: ${rec.subtopicName}`);
    setActiveTab('pairing_studio');
  };

  // Helper Badge Color
  const getProficiencyBadge = (level: ProficiencyLevel) => {
    switch (level) {
      case 'mastered':
        return {
          bg: 'rgba(52, 211, 153, 0.15)',
          border: 'rgba(52, 211, 153, 0.35)',
          color: '#34d399',
          label: 'Mastered',
          icon: CheckCircle2
        };
      case 'proficient':
        return {
          bg: 'rgba(56, 189, 248, 0.15)',
          border: 'rgba(56, 189, 248, 0.35)',
          color: '#38bdf8',
          label: 'Proficient',
          icon: Check
        };
      case 'learning':
        return {
          bg: 'rgba(212, 163, 115, 0.15)',
          border: 'rgba(212, 163, 115, 0.35)',
          color: '#d4a373',
          label: 'Learning',
          icon: Clock
        };
      case 'needs_help':
        return {
          bg: 'rgba(239, 68, 68, 0.18)',
          border: 'rgba(239, 68, 68, 0.45)',
          color: '#ef4444',
          label: 'Needs Help',
          icon: AlertCircle
        };
      case 'not_started':
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.08)',
          color: 'var(--text-dim)',
          label: 'Not Started',
          icon: HelpCircle
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: 'rgba(20, 20, 26, 0.95)', border: '1px solid #34d399', color: '#34d399', padding: '10px 18px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)', fontWeight: 700, fontSize: '0.84rem', animation: 'appleFadeIn 0.2s ease' }}>
          {toastMessage}
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="glass-panel" style={{ padding: '22px 28px', background: 'linear-gradient(135deg, rgba(20, 20, 26, 0.95) 0%, rgba(30, 30, 42, 0.85) 100%)', border: '1px solid rgba(212, 163, 115, 0.22)', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-learning" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Grid size={12} /> Team Knowledge & Peer Matrix
              </span>
              <span style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={13} /> {members.length} Active Engineers
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#eae6e1', letterSpacing: '-0.02em', margin: 0 }}>
              Group Skill & Subtopic Competency Hub
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              Inspect member-by-member mastery on specific subtasks (e.g. Python Dictionaries, FastAPI Depends, Docker Compose) and connect peers to help each other.
            </p>
          </div>

          {/* View Mode Toggle Pill */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '3px', gap: '4px' }}>
            <button
              onClick={() => setViewMode('subtopics')}
              style={{
                padding: '6px 14px',
                borderRadius: '9px',
                border: 'none',
                background: viewMode === 'subtopics' ? '#d4a373' : 'transparent',
                color: viewMode === 'subtopics' ? '#0e0e12' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={14} /> Subtopic Heatmap
            </button>
            <button
              onClick={() => setViewMode('domains')}
              style={{
                padding: '6px 14px',
                borderRadius: '9px',
                border: 'none',
                background: viewMode === 'domains' ? '#d4a373' : 'transparent',
                color: viewMode === 'domains' ? '#0e0e12' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <BarChart3 size={14} /> 15-Phase Overview
            </button>
          </div>
        </div>
      </div>

      {/* 🤝 SMART PEER PAIRING & MENTOR MATCHMAKER BANNER */}
      {pairingRecommendations.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px 24px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#38bdf8" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                Smart Peer Matchmaking & Pairing Bridge
              </h2>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>
              {pairingRecommendations.length} Complementary Pairs Detected
            </span>
          </div>

          {/* Pairing Recommendation Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {pairingRecommendations.map((rec) => (
              <div
                key={rec.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {rec.category}
                    </span>
                    <span style={{ fontSize: '0.64rem', color: 'var(--text-dim)', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                      1-on-1 Session
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#eae6e1', margin: '0 0 8px 0' }}>
                    {rec.subtopicName}
                  </h4>

                  {/* Mentee vs Mentor Match Capsule */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 0, 0, 0.25)', padding: '8px 10px', borderRadius: '10px' }}>
                    {/* Learner (Needs Help) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                      <img src={rec.strugglingUser.avatar} alt={rec.strugglingUser.name} style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #ef4444', objectFit: 'cover' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#eae6e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rec.strugglingUser.name.split(' ')[0]}
                        </span>
                        <span style={{ fontSize: '0.62rem', color: '#ef4444' }}>Needs Help</span>
                      </div>
                    </div>

                    <ArrowRight size={14} color="var(--text-dim)" />

                    {/* Mentor (Mastered) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                      <img src={rec.mentorUser.avatar} alt={rec.mentorUser.name} style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #34d399', objectFit: 'cover' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#eae6e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rec.mentorUser.name.split(' ')[0]}
                        </span>
                        <span style={{ fontSize: '0.62rem', color: '#34d399' }}>Can Teach</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1-Click Action: Start Live Pairing */}
                <button
                  onClick={() => handleLaunchPairing(rec)}
                  className="btn btn-primary"
                  style={{ padding: '8px 12px', fontSize: '0.76rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Handshake size={14} /> Start Live Pairing Room
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 1: GRANULAR SUBTOPIC HEATMAP */}
      {viewMode === 'subtopics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Filter Toolbar: Phase Dropdown + Keyword Search + Needs Help Toggle */}
          <div className="glass-panel" style={{ padding: '14px 18px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              
              {/* Phase Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Curriculum Module:
                </span>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="form-control"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', width: 'auto', background: 'rgba(255, 255, 255, 0.05)', color: '#eae6e1', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px' }}
                >
                  <option value="all">All 15 Phases ({subtopicMasteries.length} subtopics)</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.phaseNumber}>
                      Phase {t.phaseNumber}: {t.name} ({t.subtopics.length} subtopics)
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {[
                  { id: 'all', label: 'All Subtopics' },
                  { id: 'needs_help', label: '🆘 Needs Help Only' },
                  { id: 'mastered', label: '🟢 Mastered Only' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id as typeof statusFilter)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: statusFilter === f.id ? 'rgba(212, 163, 115, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: statusFilter === f.id ? '#d4a373' : 'var(--text-dim)',
                      border: statusFilter === f.id ? '1px solid rgba(212, 163, 115, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '6px 12px', minWidth: '240px' }}>
              <Search size={14} color="#d4a373" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search e.g. dictionaries, yield, dockerfile..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#eae6e1',
                  fontSize: '0.78rem',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Subtopic Heatmap Matrix Table */}
          <div className="glass-panel" style={{ overflowX: 'auto', padding: '16px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, minWidth: '220px' }}>
                    Subtopic & Concept
                  </th>
                  <th style={{ padding: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center', width: '110px' }}>
                    Team Mastery
                  </th>
                  {members.map((m) => (
                    <th key={m.id} style={{ padding: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center', minWidth: '130px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <img src={m.avatar} alt={m.name} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid var(--accent-copper)', objectFit: 'cover' }} />
                        <span style={{ fontSize: '0.76rem', color: '#eae6e1', fontWeight: 700 }}>{m.name.split(' ')[0]}</span>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>{m.role.toUpperCase()}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubtopics.length === 0 ? (
                  <tr>
                    <td colSpan={2 + members.length} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      No subtopics match the current search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSubtopics.map((sub) => (
                    <tr
                      key={sub.subtopicId}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background 0.12s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Subtopic Title & Phase Info */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#eae6e1' }}>
                              {sub.subtopicName}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                            Phase {sub.phaseNumber}: {sub.topicName} • {sub.category}
                          </span>
                        </div>
                      </td>

                      {/* Team Aggregate Mastery */}
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: sub.teamMasteryPct >= 75 ? '#34d399' : sub.teamMasteryPct >= 40 ? '#d4a373' : '#ef4444' }}>
                            {sub.teamMasteryPct}%
                          </span>
                          <div style={{ width: '60px', height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${sub.teamMasteryPct}%`, height: '100%', background: sub.teamMasteryPct >= 75 ? '#34d399' : sub.teamMasteryPct >= 40 ? '#d4a373' : '#ef4444', borderRadius: '2px' }} />
                          </div>
                        </div>
                      </td>

                      {/* Individual Member Cells */}
                      {members.map((m) => {
                        const level = sub.memberProficiencies[m.id] || 'not_started';
                        const badge = getProficiencyBadge(level);
                        const Icon = badge.icon;

                        return (
                          <td key={m.id} style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <button
                              onClick={() => setInspectedSubtopic({ subtopic: sub, targetUser: m })}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '5px 10px',
                                borderRadius: '8px',
                                background: badge.bg,
                                border: `1px solid ${badge.border}`,
                                color: badge.color,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.12s ease',
                                width: '100%',
                                justifyContent: 'center'
                              }}
                              title={`Click to inspect or change ${m.name}'s status on ${sub.subtopicName}`}
                            >
                              <Icon size={12} />
                              <span>{badge.label}</span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Legend Strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#34d399' }} />
              <span><strong>Mastered</strong> (Can Mentor Peers)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#38bdf8' }} />
              <span><strong>Proficient</strong> (Completed)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#d4a373' }} />
              <span><strong>Learning</strong> (In Progress)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ef4444' }} />
              <span><strong>Needs Help</strong> (Struggling/Confused)</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: HIGH LEVEL 15-PHASE OVERVIEW */}
      {viewMode === 'domains' && (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '20px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, minWidth: '180px' }}>
                  Group Member
                </th>
                {topics.map((t) => (
                  <th key={t.id} style={{ padding: '12px 8px', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ color: '#d4a373', fontSize: '0.64rem' }}>P{t.phaseNumber}</span>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>{t.name.split(' ')[0]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={m.avatar} alt={m.name} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--accent-copper)', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1' }}>{m.name}</div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{m.role.toUpperCase()} • {m.streak}🔥 Streak</span>
                    </div>
                  </td>

                  {topics.map((t) => {
                    const score = calculateEvidence(t.id, m.id).verifiedMasteryPct;
                    const getBgColor = (val: number) => {
                      if (val >= 80) return 'rgba(52, 211, 153, 0.2)';
                      if (val >= 50) return 'rgba(56, 189, 248, 0.2)';
                      if (val > 0) return 'rgba(212, 163, 115, 0.2)';
                      return 'rgba(255, 255, 255, 0.02)';
                    };
                    const getTextColor = (val: number) => {
                      if (val >= 80) return '#34d399';
                      if (val >= 50) return '#38bdf8';
                      if (val > 0) return '#d4a373';
                      return 'var(--text-dim)';
                    };

                    return (
                      <td key={t.id} style={{ padding: '10px 6px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-block', padding: '6px 8px', borderRadius: '8px', background: getBgColor(score), color: getTextColor(score), fontWeight: 700, fontSize: '0.78rem', minWidth: '42px' }}>
                          {score}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ⚠️ TEAM KNOWLEDGE GAPS & WORKSHOP RECOMMENDATIONS */}
      {teamKnowledgeGaps.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px 24px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertCircle size={18} color="#ef4444" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
              Identified Team Knowledge Gaps (Below 40% Team Mastery)
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
            These concepts have the lowest group confidence. Consider scheduling a group pair programming workshop or mentor session.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {teamKnowledgeGaps.map((gap) => (
              <div key={gap.subtopicId} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1', margin: 0 }}>{gap.subtopicName}</h4>
                  <span style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: 600 }}>{gap.teamMasteryPct}% Group Proficiency</span>
                </div>
                <button
                  onClick={() => {
                    requestPeerHelp(gap.subtopicName, gap.category, `Group workshop requested for ${gap.subtopicName}`, 1);
                    setToastMessage(`✓ Created group peer help request for "${gap.subtopicName}"`);
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '5px 10px', fontSize: '0.72rem' }}
                >
                  Request Workshop
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔍 SUBTOPIC INSPECTOR & MENTOR CONNECT MODAL */}
      {inspectedSubtopic && (
        <div className="modal-overlay" onClick={() => setInspectedSubtopic(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', background: 'rgba(20, 20, 26, 0.96)', border: '1px solid rgba(212, 163, 115, 0.35)', borderRadius: '18px', padding: '24px' }}>
            
            {/* Modal Header */}
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.7rem', color: '#d4a373', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Phase {inspectedSubtopic.subtopic.phaseNumber} • {inspectedSubtopic.subtopic.category}
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#eae6e1', margin: '4px 0 0 0' }}>
                {inspectedSubtopic.subtopic.subtopicName}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Module: {inspectedSubtopic.subtopic.topicName}
              </p>
            </div>

            {/* Set My Proficiency Status */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px', marginBottom: '18px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#eae6e1', display: 'block', marginBottom: '8px' }}>
                Update Your Mastery on this Subtopic:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => updateSubtopicStatus(currentUser.id, inspectedSubtopic.subtopic.subtopicId, 'mastered')}
                  style={{ padding: '8px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.35)', color: '#34d399', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <CheckCircle2 size={13} /> I Can Teach This 🙋‍♂️
                </button>
                <button
                  onClick={() => {
                    updateSubtopicStatus(currentUser.id, inspectedSubtopic.subtopic.subtopicId, 'needs_help');
                    requestPeerHelp(inspectedSubtopic.subtopic.subtopicName, inspectedSubtopic.subtopic.category, `Need help understanding ${inspectedSubtopic.subtopic.subtopicName}`, 2);
                  }}
                  style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#ef4444', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <AlertCircle size={13} /> I Need Help 🆘
                </button>
              </div>
            </div>

            {/* Teammates who have Mastered this topic */}
            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Available Peer Mentors for this Subtopic:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {members
                  .filter((m) => inspectedSubtopic.subtopic.memberProficiencies[m.id] === 'mastered')
                  .map((mentor) => (
                    <div
                      key={mentor.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={mentor.avatar} alt={mentor.name} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #34d399', objectFit: 'cover' }} />
                        <div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#eae6e1', display: 'block' }}>{mentor.name}</span>
                          <span style={{ fontSize: '0.64rem', color: '#34d399' }}>Verified Mastery • {mentor.streak}🔥 Streak</span>
                        </div>
                      </div>

                      {mentor.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            startPairingSession(mentor.id, `${inspectedSubtopic.subtopic.category}: ${inspectedSubtopic.subtopic.subtopicName}`);
                            setActiveTab('pairing_studio');
                            setInspectedSubtopic(null);
                          }}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.72rem', borderRadius: '8px' }}
                        >
                          Pair with {mentor.name.split(' ')[0]}
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Modal Close Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setInspectedSubtopic(null)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.78rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
