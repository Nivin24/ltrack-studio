import React, { useState, useMemo } from 'react';
import { useLTrack } from '../context/LTrackContext';
import { useRealtime } from '../context/RealtimeContext';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Handshake,
  BarChart3,
  Layers,
  HeartHandshake,
  UserCheck,
  GraduationCap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { User, Topic } from '../types/ltrack';

type ProficiencyLevel = 'mastered' | 'proficient' | 'learning' | 'needs_help' | 'not_started';

interface MiniSubtopic {
  id: string;
  name: string;
  topicId: string;
  topicName: string;
  phaseNumber: number;
  category: string;
  mentors: User[];
  learners: User[];
  seekers: User[];
  teamMasteryPct: number;
}

interface MentorMatch {
  id: string;
  mentor: User;
  subtopicName: string;
  topicName: string;
  category: string;
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

  // Active View Tab: 'visual_directory' (Cards with pictures) | 'friend_exchange' (1-on-1 comparison) | '15_phase_matrix'
  const [activeTab, setActiveTabLocal] = useState<'visual_directory' | 'friend_exchange' | '15_phase_matrix'>('visual_directory');

  // Selected Category / Domain Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mentorFilter, setMentorFilter] = useState<'all' | 'can_teach' | 'need_help'>('all');

  // Accordion open/close state for domain cards
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({
    Python: true,
    FastAPI: true,
    Docker: true,
    RAG: true
  });

  // Selected Friend for 1-on-1 Knowledge Exchange
  const [selectedFriendId, setSelectedFriendId] = useState<string>(() => {
    const friend = members.find((m) => m.id !== currentUser.id);
    return friend ? friend.id : members[0]?.id || '';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom User-Declared Overrides (stored in localStorage)
  const [customProficiencies, setCustomProficiencies] = useState<Record<string, ProficiencyLevel>>(() => {
    try {
      const saved = localStorage.getItem('ltrack_custom_subtopic_mastery');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleDomainExpand = (cat: string) => {
    setExpandedDomains((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const updateSubtopicStatus = (userId: string, subtopicId: string, level: ProficiencyLevel) => {
    const key = `${userId}_${subtopicId}`;
    const updated = { ...customProficiencies, [key]: level };
    setCustomProficiencies(updated);
    try {
      localStorage.setItem('ltrack_custom_subtopic_mastery', JSON.stringify(updated));
    } catch {}

    const label = level === 'mastered' ? 'I can explain this 🙋‍♂️' : level === 'needs_help' ? 'Need an explanation 🆘' : level;
    setToastMessage(`✓ Marked as "${label}"`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Domain Course Images Mapping
  const domainCovers: Record<string, string> = {
    Python: '/python_cover.png',
    FastAPI: '/fastapi_cover.png',
    Docker: '/docker_cover.png',
    RAG: '/rag_cover.png',
    PostgreSQL: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80',
    'Agentic AI': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80',
    HTTP: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    'CI/CD': 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80',
    MCP: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80'
  };

  // Build Granular Mini-Subtopics Catalog with Members Grouped by Role
  const miniSubtopicsCatalog: MiniSubtopic[] = useMemo(() => {
    const list: MiniSubtopic[] = [];

    topics.forEach((topic) => {
      topic.subtopics.forEach((sub) => {
        const mentors: User[] = [];
        const learners: User[] = [];
        const seekers: User[] = [];

        members.forEach((m) => {
          const overrideKey = `${m.id}_${sub.id}`;
          const customLevel = customProficiencies[overrideKey];

          if (customLevel === 'mastered') {
            mentors.push(m);
            return;
          }
          if (customLevel === 'needs_help') {
            seekers.push(m);
            return;
          }
          if (customLevel === 'learning' || customLevel === 'proficient') {
            learners.push(m);
            return;
          }

          // Check if member reported confusion in daily check-ins
          const hasReportedConfusion = checkIns.some(
            (c) =>
              c.userId === m.id &&
              (c.confusedAbout?.toLowerCase().includes(sub.name.toLowerCase()) ||
                (c.whatLearned?.toLowerCase().includes(sub.name.toLowerCase()) && c.confidenceScore <= 2))
          );

          if (hasReportedConfusion) {
            seekers.push(m);
            return;
          }

          // Calculate verified evidence mastery
          const evidence = calculateEvidence(topic.id, m.id);
          if (evidence.verifiedMasteryPct >= 75) {
            mentors.push(m);
          } else if (evidence.verifiedMasteryPct >= 35 || sub.status === 'completed' || sub.status === 'learning') {
            learners.push(m);
          }
        });

        const teamMasteryPct = Math.round((mentors.length / Math.max(members.length, 1)) * 100);

        list.push({
          id: sub.id,
          name: sub.name,
          topicId: topic.id,
          topicName: topic.name,
          phaseNumber: topic.phaseNumber,
          category: topic.category,
          mentors,
          learners,
          seekers,
          teamMasteryPct
        });
      });
    });

    return list;
  }, [topics, members, customProficiencies, checkIns, calculateEvidence]);

  // Group Mini-Subtopics by Category / Domain
  const groupedByDomain = useMemo(() => {
    const groups: Record<string, { topic: Topic; subtopics: MiniSubtopic[] }[]> = {};

    topics.forEach((topic) => {
      const cat = topic.category;
      if (!groups[cat]) {
        groups[cat] = [];
      }
      const subs = miniSubtopicsCatalog.filter((s) => s.topicId === topic.id);
      groups[cat].push({ topic, subtopics: subs });
    });

    return groups;
  }, [topics, miniSubtopicsCatalog]);

  // Personalized "Recommended Mentors For You" Algorithm
  const myMentorRecommendations: MentorMatch[] = useMemo(() => {
    const recs: MentorMatch[] = [];

    // Find topics where current user is learning or seeking help
    miniSubtopicsCatalog.forEach((sub) => {
      const isSeeking = sub.seekers.some((s) => s.id === currentUser.id);
      const isLearning = sub.learners.some((l) => l.id === currentUser.id);

      if (isSeeking || isLearning) {
        // Find other friends who have mastered this subtopic
        const availableMentors = sub.mentors.filter((m) => m.id !== currentUser.id);
        if (availableMentors.length > 0) {
          const topMentor = availableMentors[0];
          recs.push({
            id: `rec_${sub.id}_${topMentor.id}`,
            mentor: topMentor,
            subtopicName: sub.name,
            topicName: sub.topicName,
            category: sub.category,
            reason: isSeeking
              ? `You flagged difficulty on ${sub.name}. ${topMentor.name.split(' ')[0]} has verified experience and can explain it clearly.`
              : `You are currently practicing ${sub.name}. ${topMentor.name.split(' ')[0]} has mastered this and is available to pair.`
          });
        }
      }
    });

    // Fallback: If user has completed everything or none in progress, suggest senior peer
    if (recs.length === 0 && members.length > 1) {
      const friend = members.find((m) => m.id !== currentUser.id) || members[1];
      const featuredSub = miniSubtopicsCatalog.find((s) => s.mentors.some((m) => m.id === friend.id)) || miniSubtopicsCatalog[0];
      if (featuredSub && friend) {
        recs.push({
          id: `rec_fallback_${featuredSub.id}`,
          mentor: friend,
          subtopicName: featuredSub.name,
          topicName: featuredSub.topicName,
          category: featuredSub.category,
          reason: `${friend.name.split(' ')[0]} is an experienced mentor in ${featuredSub.category} and open for co-op pairing.`
        });
      }
    }

    return recs.slice(0, 4);
  }, [miniSubtopicsCatalog, currentUser.id, members]);

  // Selected Friend for 1-on-1 Knowledge Exchange
  const selectedFriend = useMemo(() => {
    return members.find((m) => m.id === selectedFriendId) || members[0];
  }, [members, selectedFriendId]);

  // Friend Knowledge Exchange Matrix
  const friendExchange = useMemo(() => {
    if (!selectedFriend || selectedFriend.id === currentUser.id) {
      return { whatFriendCanTeachMe: [], whatICanTeachFriend: [], mutualTopics: [] };
    }

    const whatFriendCanTeachMe: MiniSubtopic[] = [];
    const whatICanTeachFriend: MiniSubtopic[] = [];
    const mutualTopics: MiniSubtopic[] = [];

    miniSubtopicsCatalog.forEach((sub) => {
      const friendIsMaster = sub.mentors.some((m) => m.id === selectedFriend.id);
      const iAmMaster = sub.mentors.some((m) => m.id === currentUser.id);
      const friendIsLearning = sub.learners.some((l) => l.id === selectedFriend.id) || sub.seekers.some((s) => s.id === selectedFriend.id);
      const iAmLearning = sub.learners.some((l) => l.id === currentUser.id) || sub.seekers.some((s) => s.id === currentUser.id);

      if (friendIsMaster && iAmLearning) {
        whatFriendCanTeachMe.push(sub);
      } else if (iAmMaster && friendIsLearning) {
        whatICanTeachFriend.push(sub);
      } else if (friendIsLearning && iAmLearning) {
        mutualTopics.push(sub);
      }
    });

    return { whatFriendCanTeachMe, whatICanTeachFriend, mutualTopics };
  }, [miniSubtopicsCatalog, selectedFriend, currentUser.id]);

  // Launch Live Pairing Session with a Mentor
  const handleLaunchPairing = (mentorId: string, subtopicName: string, category: string) => {
    startPairingSession(mentorId, `${category}: ${subtopicName}`);
    setActiveTab('pairing_studio');
  };

  const categories = ['all', 'Python', 'FastAPI', 'Docker', 'RAG', 'PostgreSQL', 'Agentic AI'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: 'rgba(20, 20, 26, 0.95)', border: '1px solid #34d399', color: '#34d399', padding: '10px 18px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)', fontWeight: 700, fontSize: '0.84rem', animation: 'appleFadeIn 0.2s ease' }}>
          {toastMessage}
        </div>
      )}

      {/* 1. Header Bar with Tabs */}
      <div className="glass-panel" style={{ padding: '22px 28px', background: 'linear-gradient(135deg, rgba(20, 20, 26, 0.95) 0%, rgba(30, 30, 42, 0.85) 100%)', border: '1px solid rgba(212, 163, 115, 0.22)', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-learning" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <HeartHandshake size={12} /> Community Skill & Peer Mentoring Hub
              </span>
              <span style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={13} /> {members.length} Engineers Connected
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#eae6e1', letterSpacing: '-0.02em', margin: 0 }}>
              Team Skill Hub & Mini-Subtopic Knowledge Directory
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              Visual directory of who has mastered specific mini-concepts (e.g. Python Dictionaries, FastAPI Depends, Docker Compose) and can explain them to friends.
            </p>
          </div>

          {/* Primary View Switcher */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '3px', gap: '4px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTabLocal('visual_directory')}
              style={{
                padding: '7px 14px',
                borderRadius: '9px',
                border: 'none',
                background: activeTab === 'visual_directory' ? '#d4a373' : 'transparent',
                color: activeTab === 'visual_directory' ? '#0e0e12' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={14} /> Visual Subtopic Cards
            </button>

            <button
              onClick={() => setActiveTabLocal('friend_exchange')}
              style={{
                padding: '7px 14px',
                borderRadius: '9px',
                border: 'none',
                background: activeTab === 'friend_exchange' ? '#d4a373' : 'transparent',
                color: activeTab === 'friend_exchange' ? '#0e0e12' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Handshake size={14} /> Friend-to-Friend Exchange
            </button>

            <button
              onClick={() => setActiveTabLocal('15_phase_matrix')}
              style={{
                padding: '7px 14px',
                borderRadius: '9px',
                border: 'none',
                background: activeTab === '15_phase_matrix' ? '#d4a373' : 'transparent',
                color: activeTab === '15_phase_matrix' ? '#0e0e12' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <BarChart3 size={14} /> 15-Phase Matrix Table
            </button>
          </div>
        </div>
      </div>

      {/* 2. 💡 "RECOMMENDED MENTORS FOR YOU" HERO CAROUSEL */}
      {myMentorRecommendations.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px 24px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#38bdf8" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                Recommended Friends to Explain Your Current Topics
              </h2>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>
              Matched for {currentUser.name.split(' ')[0]}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '14px' }}>
            {myMentorRecommendations.map((rec) => (
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {rec.category}
                    </span>
                    <span style={{ fontSize: '0.64rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.12)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      ✓ Verified Mentor
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#eae6e1', margin: '0 0 6px 0' }}>
                    {rec.subtopicName}
                  </h4>

                  {/* Mentor Info Capsule */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0, 0, 0, 0.25)', padding: '8px 10px', borderRadius: '10px' }}>
                    <img src={rec.mentor.avatar} alt={rec.mentor.name} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid #34d399', objectFit: 'cover' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#eae6e1' }}>
                        {rec.mentor.name}
                      </span>
                      <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                        {rec.mentor.streak}🔥 Streak • {rec.mentor.currentPhase.split(':')[0]}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                    {rec.reason}
                  </p>
                </div>

                {/* 1-Tap Action: Ask Friend to Explain */}
                <button
                  onClick={() => handleLaunchPairing(rec.mentor.id, rec.subtopicName, rec.category)}
                  className="btn btn-primary"
                  style={{ padding: '8px 12px', fontSize: '0.76rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Handshake size={14} /> Ask {rec.mentor.name.split(' ')[0]} to Explain (15 min)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TAB 1: VISUAL SUBTOPIC CARDS & DOMAIN COVERS */}
      {activeTab === 'visual_directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Filter Toolbar: Category Pills + Search + Tag Filter */}
          <div className="glass-panel" style={{ padding: '14px 18px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {/* Category Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, marginRight: '4px' }}>
                DOMAIN:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: selectedCategory === cat ? 700 : 500,
                    cursor: 'pointer',
                    background: selectedCategory === cat ? '#d4a373' : 'rgba(255, 255, 255, 0.04)',
                    color: selectedCategory === cat ? '#0e0e12' : 'var(--text-muted)',
                    border: selectedCategory === cat ? '1px solid #d4a373' : '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Keyword Search & Mentor Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '5px 10px' }}>
                <Search size={13} color="#d4a373" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subtopic (e.g. dictionary, yield)..."
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#eae6e1', fontSize: '0.75rem', width: '180px' }}
                />
              </div>

              {/* Tag Filter */}
              <select
                value={mentorFilter}
                onChange={(e) => setMentorFilter(e.target.value as typeof mentorFilter)}
                className="form-control"
                style={{ padding: '5px 8px', fontSize: '0.74rem', width: 'auto', background: 'rgba(255, 255, 255, 0.05)', color: '#eae6e1', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
              >
                <option value="all">All Subtopics</option>
                <option value="can_teach">🙋‍♂️ Topics I Can Explain</option>
                <option value="need_help">🆘 Topics I Need Help With</option>
              </select>
            </div>
          </div>

          {/* Grouped Visual Domain Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {Object.keys(groupedByDomain)
              .filter((cat) => selectedCategory === 'all' || cat === selectedCategory)
              .map((domainCat) => {
                const domainModules = groupedByDomain[domainCat];
                const allDomainSubs = domainModules.flatMap((m) => m.subtopics);
                const isExpanded = expandedDomains[domainCat] !== false;
                const coverImage = domainCovers[domainCat] || domainCovers.Python;

                return (
                  <div
                    key={domainCat}
                    className="glass-panel"
                    style={{
                      background: 'rgba(20, 20, 26, 0.85)',
                      border: '1px solid rgba(212, 163, 115, 0.18)',
                      borderRadius: '16px',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Domain Card Header with Visual Cover */}
                    <div
                      onClick={() => toggleDomainExpand(domainCat)}
                      style={{
                        padding: '16px 20px',
                        background: 'linear-gradient(90deg, rgba(20, 20, 26, 0.95) 0%, rgba(30, 30, 42, 0.8) 100%)',
                        borderBottom: isExpanded ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                          src={coverImage}
                          alt={domainCat}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            objectFit: 'cover',
                            border: '1px solid rgba(212, 163, 115, 0.3)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                          }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                              {domainCat} Track
                            </h3>
                            <span style={{ fontSize: '0.68rem', color: '#d4a373', background: 'rgba(212, 163, 115, 0.15)', border: '1px solid rgba(212, 163, 115, 0.3)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                              {allDomainSubs.length} Mini-Subtopics
                            </span>
                          </div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {domainModules.length} Modules ({domainModules.map((m) => `P${m.topic.phaseNumber}`).join(', ')})
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                          {isExpanded ? 'Hide Subtopics' : 'Expand Subtopics'}
                        </span>
                        {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                      </div>
                    </div>

                    {/* Expandable Mini-Subtopics Cards Grid */}
                    {isExpanded && (
                      <div style={{ padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                        {allDomainSubs
                          .filter((sub) => {
                            if (searchQuery.trim()) {
                              const q = searchQuery.toLowerCase();
                              return sub.name.toLowerCase().includes(q) || sub.topicName.toLowerCase().includes(q);
                            }
                            if (mentorFilter === 'can_teach') {
                              return sub.mentors.some((m) => m.id === currentUser.id);
                            }
                            if (mentorFilter === 'need_help') {
                              return sub.seekers.some((s) => s.id === currentUser.id);
                            }
                            return true;
                          })
                          .map((sub) => {
                            const iCanTeach = sub.mentors.some((m) => m.id === currentUser.id);
                            const iNeedHelp = sub.seekers.some((s) => s.id === currentUser.id);

                            return (
                              <div
                                key={sub.id}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  border: '1px solid rgba(255, 255, 255, 0.06)',
                                  borderRadius: '12px',
                                  padding: '14px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  gap: '12px',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <div>
                                  {/* Subtopic Header */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                    <div>
                                      <span style={{ fontSize: '0.64rem', color: '#d4a373', fontWeight: 700, textTransform: 'uppercase' }}>
                                        Phase {sub.phaseNumber} • {sub.topicName.split(':')[0]}
                                      </span>
                                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#eae6e1', margin: '2px 0 0 0' }}>
                                        {sub.name}
                                      </h4>
                                    </div>

                                    {/* Aggregate Team Mastery Bar */}
                                    <div style={{ textAlign: 'right' }}>
                                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: sub.teamMasteryPct >= 70 ? '#34d399' : '#d4a373' }}>
                                        {sub.teamMasteryPct}%
                                      </span>
                                    </div>
                                  </div>

                                  {/* Mentors Stack (🟢 Who Can Teach & Explain) */}
                                  <div style={{ marginTop: '10px' }}>
                                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                                      AVAILABLE PEER MENTORS ({sub.mentors.length}):
                                    </span>
                                    {sub.mentors.length === 0 ? (
                                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                                        No mentors yet — be the first to teach!
                                      </span>
                                    ) : (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                        {sub.mentors.map((mentor) => (
                                          <div
                                            key={mentor.id}
                                            onClick={() => handleLaunchPairing(mentor.id, sub.name, sub.category)}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '5px',
                                              background: 'rgba(52, 211, 153, 0.12)',
                                              border: '1px solid rgba(52, 211, 153, 0.3)',
                                              borderRadius: '16px',
                                              padding: '2px 8px 2px 3px',
                                              cursor: 'pointer'
                                            }}
                                            title={`Click to start pairing with ${mentor.name} on ${sub.name}`}
                                          >
                                            <img src={mentor.avatar} alt={mentor.name} style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#34d399' }}>
                                              {mentor.name.split(' ')[0]}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Seekers / Seeking Explanation (🔴 Who Asked For Help) */}
                                  {sub.seekers.length > 0 && (
                                    <div style={{ marginTop: '8px' }}>
                                      <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#ef4444', display: 'block', marginBottom: '4px' }}>
                                        SEEKING EXPLANATION ({sub.seekers.length}):
                                      </span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                        {sub.seekers.map((seeker) => (
                                          <div
                                            key={seeker.id}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                              background: 'rgba(239, 68, 68, 0.12)',
                                              border: '1px solid rgba(239, 68, 68, 0.25)',
                                              borderRadius: '14px',
                                              padding: '2px 6px'
                                            }}
                                          >
                                            <img src={seeker.avatar} alt={seeker.name} style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} />
                                            <span style={{ fontSize: '0.64rem', color: '#ef4444' }}>
                                              {seeker.name.split(' ')[0]}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Your Personal Quick Action Toggle */}
                                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px', display: 'flex', gap: '6px' }}>
                                  <button
                                    onClick={() => updateSubtopicStatus(currentUser.id, sub.id, iCanTeach ? 'not_started' : 'mastered')}
                                    style={{
                                      flex: 1,
                                      padding: '6px 8px',
                                      borderRadius: '8px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      background: iCanTeach ? '#34d399' : 'rgba(52, 211, 153, 0.12)',
                                      color: iCanTeach ? '#0e0e12' : '#34d399',
                                      border: '1px solid rgba(52, 211, 153, 0.3)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <CheckCircle2 size={12} /> {iCanTeach ? 'I Teach This ✓' : 'I Can Explain 🙋‍♂️'}
                                  </button>

                                  <button
                                    onClick={() => {
                                      updateSubtopicStatus(currentUser.id, sub.id, iNeedHelp ? 'not_started' : 'needs_help');
                                      if (!iNeedHelp) {
                                        requestPeerHelp(sub.name, sub.category, `Need explanation on ${sub.name}`, 2);
                                      }
                                    }}
                                    style={{
                                      padding: '6px 10px',
                                      borderRadius: '8px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      background: iNeedHelp ? '#ef4444' : 'rgba(239, 68, 68, 0.12)',
                                      color: iNeedHelp ? '#ffffff' : '#ef4444',
                                      border: '1px solid rgba(239, 68, 68, 0.3)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="Ask teammates for an explanation"
                                  >
                                    <AlertCircle size={12} /> {iNeedHelp ? 'Help Requested' : 'Need Help 🆘'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 4. TAB 2: FRIEND-TO-FRIEND KNOWLEDGE EXCHANGE */}
      {activeTab === 'friend_exchange' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Friend Selector Capsule */}
          <div className="glass-panel" style={{ padding: '18px 24px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.2)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={20} color="#d4a373" />
              <div>
                <span style={{ fontSize: '0.72rem', color: '#d4a373', fontWeight: 700, textTransform: 'uppercase' }}>
                  1-on-1 Peer Knowledge Bridge
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                  Compare Knowledge with a Teammate
                </h3>
              </div>
            </div>

            {/* Friend Dropdown Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Select Peer:</span>
              <select
                value={selectedFriendId}
                onChange={(e) => setSelectedFriendId(e.target.value)}
                className="form-control"
                style={{ padding: '8px 14px', fontSize: '0.82rem', width: 'auto', background: 'rgba(255, 255, 255, 0.06)', color: '#eae6e1', border: '1px solid rgba(212, 163, 115, 0.3)', borderRadius: '10px', fontWeight: 700 }}
              >
                {members
                  .filter((m) => m.id !== currentUser.id)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.currentPhase.split(':')[0]})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Friend Exchange Comparison Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            
            {/* Column 1: What Friend Can Teach You */}
            <div className="glass-panel" style={{ padding: '20px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                <GraduationCap size={18} color="#38bdf8" />
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                    What {selectedFriend?.name.split(' ')[0]} Can Teach You
                  </h4>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Concepts {selectedFriend?.name.split(' ')[0]} has mastered that you're practicing
                  </span>
                </div>
              </div>

              {friendExchange.whatFriendCanTeachMe.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                  No active learning gaps found between you and {selectedFriend?.name.split(' ')[0]}.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {friendExchange.whatFriendCanTeachMe.map((sub) => (
                    <div key={sub.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.64rem', color: '#38bdf8', fontWeight: 700 }}>{sub.category}</span>
                        <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#eae6e1', margin: '2px 0 0 0' }}>{sub.name}</h5>
                      </div>
                      <button
                        onClick={() => handleLaunchPairing(selectedFriend.id, sub.name, sub.category)}
                        className="btn btn-primary"
                        style={{ padding: '5px 10px', fontSize: '0.7rem', borderRadius: '8px' }}
                      >
                        Ask to Pair
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: What You Can Teach Friend */}
            <div className="glass-panel" style={{ padding: '20px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                <UserCheck size={18} color="#34d399" />
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                    What You Can Teach {selectedFriend?.name.split(' ')[0]}
                  </h4>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Concepts you've mastered where {selectedFriend?.name.split(' ')[0]} needs guidance
                  </span>
                </div>
              </div>

              {friendExchange.whatICanTeachFriend.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                  {selectedFriend?.name.split(' ')[0]} has not flagged any difficulties in your mastered topics.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {friendExchange.whatICanTeachFriend.map((sub) => (
                    <div key={sub.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.64rem', color: '#34d399', fontWeight: 700 }}>{sub.category}</span>
                        <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#eae6e1', margin: '2px 0 0 0' }}>{sub.name}</h5>
                      </div>
                      <button
                        onClick={() => handleLaunchPairing(selectedFriend.id, sub.name, sub.category)}
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.7rem', borderRadius: '8px' }}
                      >
                        Offer Help
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 3: Mutual Study Topics */}
            <div className="glass-panel" style={{ padding: '20px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.25)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                <Handshake size={18} color="#d4a373" />
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                    Mutual Co-Op Study Topics
                  </h4>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Concepts you are both currently practicing together
                  </span>
                </div>
              </div>

              {friendExchange.mutualTopics.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                  No overlapping in-progress topics found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {friendExchange.mutualTopics.map((sub) => (
                    <div key={sub.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.64rem', color: '#d4a373', fontWeight: 700 }}>{sub.category}</span>
                        <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#eae6e1', margin: '2px 0 0 0' }}>{sub.name}</h5>
                      </div>
                      <button
                        onClick={() => handleLaunchPairing(selectedFriend.id, sub.name, sub.category)}
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.7rem', borderRadius: '8px' }}
                      >
                        Co-Op Solve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 5. TAB 3: 15-PHASE OVERVIEW MATRIX TABLE */}
      {activeTab === '15_phase_matrix' && (
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

    </div>
  );
};
