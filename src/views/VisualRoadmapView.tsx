import React, { useState } from 'react';
import { useLTrack } from '../context/LTrackContext';
import { useDebounce } from '../hooks/useDebounce';
import type { Topic } from '../types/ltrack';
import { TopicDetailModal } from '../components/TopicDetailModal';
import { Clock, ChevronRight, ShieldCheck, Sparkles, Search, X } from 'lucide-react';

export const VisualRoadmapView: React.FC = () => {
  const { topics, calculateEvidence, currentUser } = useLTrack();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'learning' | 'not_started'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 220);

  const categories = ['All', 'Python', 'HTTP', 'REST', 'FastAPI', 'PostgreSQL', 'Auth', 'ML', 'AI', 'RAG', 'MCP', 'Agentic AI', 'Docker', 'CI/CD'];

  const filteredTopics = topics.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || t.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.subtopics.some((s) => s.name.toLowerCase().includes(debouncedSearch.toLowerCase()));

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getCoverImage = (category: string) => {
    switch (category.toLowerCase()) {
      case 'python':
        return '/python_cover.png';
      case 'fastapi':
      case 'http':
        return '/fastapi_cover.png';
      case 'ai':
      case 'rag':
      case 'mcp':
      case 'agentic ai':
      case 'ml':
        return '/rag_cover.png';
      case 'docker':
      case 'ci/cd':
      case 'postgresql':
      default:
        return '/docker_cover.png';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: '#1c1c1c', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sparkles size={20} color="#d4a373" />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#eae6e1' }}>
                Engineering Syllabus Roadmap & Module Pipeline
              </h1>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Step-by-step 13-phase software engineering curriculum from Python foundations to Agentic AI & DevOps containerization.
            </p>
          </div>

          {/* Debounced Search */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search topics, concepts (Debounced)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '34px', height: '36px', fontSize: '0.82rem' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
            <select
              className="form-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: '140px', height: '32px', fontSize: '0.78rem' }}
            >
              {categories.map((c) => (
                <option key={c} value={c} style={{ background: '#1c1c1c' }}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['all', 'completed', 'learning', 'not_started'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: statusFilter === st ? '#d4a373' : 'var(--border-color)',
                  background: statusFilter === st ? 'rgba(212, 163, 115, 0.15)' : '#222222',
                  color: statusFilter === st ? '#d4a373' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Roadmap Topics */}
      {filteredTopics.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No topics found matching your search and filter criteria.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '24px'
        }}>
          {filteredTopics.map((topic) => {
            const evidence = calculateEvidence(topic.id, currentUser.id);
            const coverImg = getCoverImage(topic.category);

            return (
              <div
                key={topic.id}
                className="glass-panel"
                onClick={() => setSelectedTopic(topic)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#1a1a1a',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Course Cover Image Banner */}
                <div style={{ position: 'relative', height: '140px', width: '100%', overflow: 'hidden', background: '#242424' }}>
                  <img
                    src={coverImg}
                    alt={topic.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(26,26,26,0.1) 0%, rgba(26,26,26,0.85) 100%)'
                  }} />

                  {/* Phase & Status Badge */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                    <span className="badge" style={{ background: 'rgba(0,0,0,0.65)', color: '#eae6e1', border: '1px solid rgba(255,255,255,0.15)' }}>
                      Phase {topic.phaseNumber}
                    </span>
                    <span className={`badge badge-${topic.status}`}>
                      {topic.status === 'completed' ? 'Mastered' : topic.status === 'learning' ? 'In Progress' : 'Not Started'}
                    </span>
                  </div>

                  <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d4a373', letterSpacing: '0.04em' }}>
                      {topic.category.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {topic.estimatedMinutes} mins
                    </span>
                  </div>
                </div>

                {/* Card Content Area */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#eae6e1', marginBottom: '8px', lineHeight: 1.3 }}>
                      {topic.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {topic.description}
                    </p>
                  </div>

                  {/* Evidence & Checklist Status */}
                  <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#849c86', fontWeight: 600 }}>
                      <ShieldCheck size={15} />
                      <span>{evidence.verifiedMasteryPct}% Verified Mastery</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d4a373', fontSize: '0.8rem', fontWeight: 700 }}>
                      <span>View Module</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Topic Inspection & Checklist Drawer */}
      {selectedTopic && (
        <TopicDetailModal topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
      )}
    </div>
  );
};
