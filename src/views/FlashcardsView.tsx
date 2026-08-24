import React, { useState, useMemo } from 'react';
import { initialFlashcards } from '../data/sandboxData';
import type { Flashcard, QuizAttemptRecord } from '../types/sandbox';
import { useLTrack } from '../context/LTrackContext';
import {
  Layers,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Search,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
  Check,
  RotateCcw,
  LayoutGrid,
  Maximize2
} from 'lucide-react';

/**
 * Sea Wave Question Text: smoothly moves each letter up and down in an undulating ocean wave on hover
 */
const SeaWaveQuestionText: React.FC<{ text: string; className?: string; style?: React.CSSProperties }> = ({ text, className, style }) => {
  let letterCounter = 0;
  const words = text.split(' ');

  return (
    <span className={className} style={{ display: 'inline', ...style }}>
      {words.map((word, wIdx) => {
        const letters = Array.from(word);
        return (
          <span key={wIdx} style={{ display: 'inline-block', whiteSpace: 'nowrap', marginRight: '0.28em' }}>
            {letters.map((char, cIdx) => {
              const delay = (letterCounter * 0.035).toFixed(3);
              letterCounter++;
              return (
                <span
                  key={cIdx}
                  className="sea-wave-letter"
                  style={{
                    '--letter-delay': `${delay}s`,
                    display: 'inline-block'
                  } as React.CSSProperties}
                >
                  {char}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
};

/**
 * Renders Python code snippets with syntax highlighting matching the scratchpad / code editor
 */
const PythonCodeSnippet: React.FC<{ code: string; maxHeight?: string }> = ({ code, maxHeight = '130px' }) => {
  const lines = code.split('\n');

  const highlightLine = (line: string) => {
    if (line.trim().startsWith('#')) {
      return <span style={{ color: '#64748b', fontStyle: 'italic' }}>{line}</span>;
    }

    // Token regex capturing comments, strings, keywords, builtins/types/numbers, operators/brackets, and identifiers
    const tokens = line.split(/(#.*$|f?"(?:\\.|[^"\\])*"|f?'(?:\\.|[^'\\])*'|\b(?:async|def|await|import|from|return|class|yield|with|if|elif|else|try|except|finally|for|while|in|as|pass|raise|break|continue|True|False|None)\b|\b(?:print|range|len|type|int|str|dict|list|set|tuple|float|bool|Depends|BaseModel|FastAPI|APIRouter|Session|select|func|Vector|Embeddings)\b|\b\d+(?:\.\d+)?\b|[{}()[\]:.,=+\-*/%><!&|^~]+)/g);

    return tokens.map((token, i) => {
      if (!token) return null;

      // 1. Comments
      if (token.startsWith('#')) {
        return <span key={i} style={{ color: '#64748b', fontStyle: 'italic' }}>{token}</span>;
      }

      // 2. Strings
      if (token.startsWith('"') || token.startsWith("'") || token.startsWith('f"') || token.startsWith("f'")) {
        return <span key={i} style={{ color: '#f8fafc' }}>{token}</span>;
      }

      // 3. Keywords & Control Flow (Salmon-Red)
      if (/^(async|def|await|import|from|return|class|yield|with|if|elif|else|try|except|finally|for|while|in|as|pass|raise|break|continue|True|False|None)$/.test(token)) {
        return <span key={i} style={{ color: '#f87171', fontWeight: 600 }}>{token}</span>;
      }

      // 4. Builtins, Types & Numbers (Vibrant Sky Blue)
      if (/^(print|range|len|type|int|str|dict|list|set|tuple|float|bool|Depends|BaseModel|FastAPI|APIRouter|Session|select|func|Vector|Embeddings)$/.test(token) || /^\d+(\.\d+)?$/.test(token)) {
        return <span key={i} style={{ color: '#60a5fa', fontWeight: 600 }}>{token}</span>;
      }

      // 5. Operators, Brackets & Punctuation (Salmon-Red / Coral)
      if (/^[{}()[\]:.,=+\-*/%><!&|^~]+$/.test(token)) {
        return <span key={i} style={{ color: '#f87171' }}>{token}</span>;
      }

      // 6. Variables & Identifiers (Clean White)
      return <span key={i} style={{ color: '#f8fafc' }}>{token}</span>;
    });
  };

  return (
    <div
      style={{
        background: '#0a0a0e',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '12px 14px',
        fontFamily: "'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: '0.76rem',
        lineHeight: 1.55,
        overflowX: 'auto',
        overflowY: 'auto',
        maxHeight,
        boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.65)'
      }}
    >
      <pre style={{ margin: 0, color: '#f8fafc' }}>
        {lines.map((line, lIdx) => (
          <div key={lIdx}>{highlightLine(line) || ' '}</div>
        ))}
      </pre>
    </div>
  );
};

/**
 * Renders text with `inline code` enclosed in stylish highlighted boxes.
 * If isQuestion is true, non-code text letters animate with the Sea Wave letter lift.
 */
const FormattedText: React.FC<{
  text: string;
  isQuestion?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({ text, isQuestion = false, className, style }) => {
  if (!text) return null;

  const parts = text.split(/(`[^`]+`)/g);

  return (
    <span className={className} style={{ display: 'inline', ...style }}>
      {parts.map((part, idx) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          const codeContent = part.slice(1, -1);
          return (
            <code
              key={idx}
              className="inline-code-box"
              style={{
                display: 'inline-block',
                background: 'rgba(212, 163, 115, 0.12)',
                border: '1px solid rgba(212, 163, 115, 0.3)',
                color: '#d4a373',
                borderRadius: '6px',
                padding: '1px 6px',
                fontSize: '0.86em',
                fontFamily: "'Fira Code', ui-monospace, SFMono-Regular, monospace",
                fontWeight: 600,
                margin: '0 3px',
                verticalAlign: 'baseline',
                letterSpacing: '-0.01em'
              }}
            >
              {codeContent}
            </code>
          );
        }

        if (isQuestion) {
          return <SeaWaveQuestionText key={idx} text={part} />;
        }

        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
};

export const FlashcardsView: React.FC = () => {
  const { currentUser } = useLTrack();

  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deckMode, setDeckMode] = useState<'curated' | 'failed_quiz'>('curated');
  const [viewLayout, setViewLayout] = useState<'grid' | 'focus'>('grid');

  // Pagination State (10, 20, 30, All)
  const [pageSize, setPageSize] = useState<number | 'all'>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Focus Study Card Index
  const [focusCardIndex, setFocusCardIndex] = useState(0);
  const [isFocusFlipped, setIsFocusFlipped] = useState(false);

  // Grid Flipped Cards Map: Record<cardId, boolean>
  const [gridFlippedMap, setGridFlippedMap] = useState<Record<string, boolean>>({});

  // Mastered Card IDs (stored in localStorage)
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`ltrack_flashcards_mastered_${currentUser.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Load private quiz history to generate dynamic failed questions deck
  const failedQuizFlashcards: Flashcard[] = useMemo(() => {
    try {
      const saved = localStorage.getItem(`ltrack_private_quiz_history_${currentUser.id}`);
      const history: QuizAttemptRecord[] = saved ? JSON.parse(saved) : [];
      const failedMap = new Map<string, Flashcard>();

      history.forEach((attempt) => {
        attempt.failedQuestions.forEach((fq) => {
          if (!failedMap.has(fq.questionId)) {
            failedMap.set(fq.questionId, {
              id: `failed_${fq.questionId}`,
              category: attempt.category,
              phaseNumber: 1,
              title: `Quiz Revision: ${attempt.category}`,
              prompt: fq.question,
              answer: fq.correctAnswer,
              explanation: fq.explanation,
              keyTakeaway: `Your previous answer was: "${fq.selectedAnswer}". Review the correct answer above to cement your understanding.`,
              difficulty: 'Intermediate'
            });
          }
        });
      });

      return Array.from(failedMap.values());
    } catch {
      return [];
    }
  }, [currentUser.id]);

  // Main Domains list
  const domains = useMemo(() => {
    const set = new Set<string>();
    initialFlashcards.forEach((f) => set.add(f.category));
    return ['all', ...Array.from(set)];
  }, []);

  // Subtopics list for selected domain
  const subtopics = useMemo(() => {
    const set = new Set<string>();
    initialFlashcards.forEach((f) => {
      if (selectedDomain === 'all' || f.category === selectedDomain) {
        if (f.subtopicName) set.add(f.subtopicName);
      }
    });
    return ['all', ...Array.from(set)];
  }, [selectedDomain]);

  // Active Deck Filtered List
  const activeDeckList: Flashcard[] = useMemo(() => {
    const source = deckMode === 'failed_quiz' ? failedQuizFlashcards : initialFlashcards;

    return source.filter((c) => {
      if (selectedDomain !== 'all' && c.category !== selectedDomain) return false;
      if (selectedSubtopic !== 'all' && c.subtopicName !== selectedSubtopic) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchPrompt = c.prompt.toLowerCase().includes(q);
        const matchAnswer = c.answer.toLowerCase().includes(q);
        const matchSub = (c.subtopicName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchPrompt && !matchAnswer && !matchSub) return false;
      }
      return true;
    });
  }, [deckMode, failedQuizFlashcards, selectedDomain, selectedSubtopic, searchQuery]);

  // Total pages
  const totalPages = useMemo(() => {
    if (pageSize === 'all') return 1;
    return Math.max(1, Math.ceil(activeDeckList.length / pageSize));
  }, [activeDeckList.length, pageSize]);

  // Paginated Cards for Grid View
  const paginatedCards = useMemo(() => {
    if (pageSize === 'all') return activeDeckList;
    const start = (currentPage - 1) * pageSize;
    return activeDeckList.slice(start, start + pageSize);
  }, [activeDeckList, currentPage, pageSize]);

  // Reset page to 1 when filters or page size change
  const handleFilterChange = (domain: string, subtopic: string) => {
    setSelectedDomain(domain);
    setSelectedSubtopic(subtopic);
    setCurrentPage(1);
    setFocusCardIndex(0);
    setIsFocusFlipped(false);
  };

  const handleToggleCardFlip = (cardId: string) => {
    setGridFlippedMap((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const handleToggleMastered = (cardId: string, mastered: boolean) => {
    const updated = { ...masteredCards, [cardId]: mastered };
    setMasteredCards(updated);
    try {
      localStorage.setItem(`ltrack_flashcards_mastered_${currentUser.id}`, JSON.stringify(updated));
    } catch {}
  };

  const handleShuffle = () => {
    setGridFlippedMap({});
    setIsFocusFlipped(false);
    setFocusCardIndex(Math.floor(Math.random() * Math.max(activeDeckList.length, 1)));
  };

  // Progress stats
  const masteredInDeck = activeDeckList.filter((c) => masteredCards[c.id]).length;
  const masteryPct = activeDeckList.length > 0 ? Math.round((masteredInDeck / activeDeckList.length) * 100) : 0;

  const currentFocusCard: Flashcard | undefined = activeDeckList[focusCardIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
      
      {/* 1. Header Banner */}
      <div className="glass-panel" style={{ padding: '22px 28px', background: 'linear-gradient(135deg, rgba(20, 20, 26, 0.95) 0%, rgba(30, 30, 42, 0.85) 100%)', border: '1px solid rgba(212, 163, 115, 0.22)', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-learning" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Layers size={13} color="#d4a373" /> Active Revision & Concept Memory Engine
              </span>
              <span style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Award size={13} /> {masteredInDeck}/{activeDeckList.length} Cards Mastered ({masteryPct}%)
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#eae6e1', letterSpacing: '-0.02em', margin: 0 }}>
              Revision Flashcards Hub
            </h1>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              Explore comprehensive engineering cards with 10, 20, 30 card views, interactive 3D flips, and spaced repetition tracking.
            </p>
          </div>

          {/* Deck Mode Toggle & View Layout Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.03)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={() => {
                  setDeckMode('curated');
                  setCurrentPage(1);
                  setFocusCardIndex(0);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: deckMode === 'curated' ? 'rgba(212, 163, 115, 0.2)' : 'transparent',
                  color: deckMode === 'curated' ? '#d4a373' : 'var(--text-muted)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <BookOpen size={13} /> Core Decks ({initialFlashcards.length})
              </button>

              <button
                onClick={() => {
                  setDeckMode('failed_quiz');
                  setCurrentPage(1);
                  setFocusCardIndex(0);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: deckMode === 'failed_quiz' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                  color: deckMode === 'failed_quiz' ? '#ef4444' : 'var(--text-muted)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <AlertCircle size={13} /> Quiz Review ({failedQuizFlashcards.length})
              </button>
            </div>

            {/* Layout Toggle: Grid vs Focus */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.03)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={() => setViewLayout('grid')}
                title="Grid Gallery View"
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: viewLayout === 'grid' ? '#d4a373' : 'transparent',
                  color: viewLayout === 'grid' ? '#0e0e12' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 700
                }}
              >
                <LayoutGrid size={14} /> Grid
              </button>
              <button
                onClick={() => setViewLayout('focus')}
                title="1-by-1 Focus Study Room"
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: viewLayout === 'focus' ? '#d4a373' : 'transparent',
                  color: viewLayout === 'focus' ? '#0e0e12' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 700
                }}
              >
                <Maximize2 size={14} /> Focus Study
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Topic & Subtopic Filters + Pagination Controls Toolbar */}
      <div className="glass-panel" style={{ padding: '14px 18px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Left: Main Domain & Subtopic Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Main Topic Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, marginRight: '2px' }}>
              MAIN TOPIC:
            </span>
            {domains.map((dom) => (
              <button
                key={dom}
                onClick={() => handleFilterChange(dom, 'all')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  fontWeight: selectedDomain === dom ? 700 : 500,
                  cursor: 'pointer',
                  background: selectedDomain === dom ? '#d4a373' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedDomain === dom ? '#0e0e12' : 'var(--text-muted)',
                  border: selectedDomain === dom ? '1px solid #d4a373' : '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                {dom.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Subtopic Dropdown */}
          {subtopics.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>
                SUBTOPIC:
              </span>
              <select
                value={selectedSubtopic}
                onChange={(e) => handleFilterChange(selectedDomain, e.target.value)}
                className="form-control"
                style={{ padding: '5px 10px', fontSize: '0.76rem', width: 'auto', background: 'rgba(255, 255, 255, 0.05)', color: '#eae6e1', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
              >
                <option value="all">All Subtopics ({activeDeckList.length})</option>
                {subtopics.filter((s) => s !== 'all').map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Items Per Page Selector (10, 20, 30, All) & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Items Per View Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>
              SHOW:
            </span>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.03)', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {[10, 20, 30, 'all' as const].map((size) => (
                <button
                  key={String(size)}
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '6px',
                    border: 'none',
                    background: pageSize === size ? '#d4a373' : 'transparent',
                    color: pageSize === size ? '#0e0e12' : 'var(--text-muted)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {size === 'all' ? 'All' : size}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleShuffle}
            className="btn btn-secondary"
            style={{ padding: '5px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '8px' }}
            title="Shuffle deck"
          >
            <Shuffle size={13} /> Shuffle
          </button>

          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '5px 10px' }}>
            <Search size={13} color="#d4a373" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search concepts..."
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#eae6e1', fontSize: '0.75rem', width: '130px' }}
            />
          </div>
        </div>
      </div>

      {/* 3. FLASHCARDS GRID GALLERY VIEW */}
      {viewLayout === 'grid' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Result Count & Pagination Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0 4px' }}>
            <span>
              Showing <strong>{paginatedCards.length}</strong> of <strong>{activeDeckList.length}</strong> cards
              {pageSize !== 'all' && ` (Page ${currentPage} of ${totalPages})`}
            </span>

            {/* Pagination Button Controls */}
            {pageSize !== 'all' && totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.72rem', opacity: currentPage === 1 ? 0.4 : 1 }}
                >
                  <ChevronLeft size={13} />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        border: currentPage === pageNum ? '1px solid #d4a373' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: currentPage === pageNum ? '#d4a373' : 'rgba(255, 255, 255, 0.03)',
                        color: currentPage === pageNum ? '#0e0e12' : 'var(--text-muted)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.72rem', opacity: currentPage === totalPages ? 0.4 : 1 }}
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Cards Grid */}
          {activeDeckList.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              {deckMode === 'failed_quiz'
                ? 'No failed quiz questions found! You have a clean quiz record or haven\'t taken a quiz yet.'
                : 'No flashcards match the selected filter. Try selecting "All Main Topics".'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {paginatedCards.map((card) => {
                const isFlipped = Boolean(gridFlippedMap[card.id]);
                const isMastered = Boolean(masteredCards[card.id]);

                return (
                  <div key={card.id} className="flashcard-3d-perspective" style={{ height: '370px' }}>
                    <div
                      onClick={() => handleToggleCardFlip(card.id)}
                      className={`flashcard-3d-wrapper ${isFlipped ? 'is-flipped' : ''}`}
                      style={{ height: '100%', cursor: 'pointer' }}
                    >
                      {/* 1. FRONT FACE (QUESTION & PROMPT) */}
                      <div
                        className="glass-panel flashcard-face flashcard-face-front flashcard-interactive-card"
                        style={{
                          padding: '20px 22px',
                          background: 'rgba(20, 20, 26, 0.95)',
                          border: isMastered ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(212, 163, 115, 0.22)',
                          borderRadius: '18px',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                        }}
                      >
                        {/* Front Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d4a373', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Phase {card.phaseNumber} • {card.category} {card.subtopicName ? `(${card.subtopicName})` : ''}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isMastered && (
                              <span style={{ fontSize: '0.65rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Check size={10} /> Mastered
                              </span>
                            )}
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <RotateCw size={11} /> Question
                            </span>
                          </div>
                        </div>

                        {/* Front Body with Auto Scroll if long */}
                        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, lineHeight: 1.45, margin: 0, color: '#f5f5f7' }}>
                            <FormattedText text={card.prompt} isQuestion={true} />
                          </h3>

                          {card.codeSnippet && (
                            <PythonCodeSnippet code={card.codeSnippet} maxHeight="120px" />
                          )}
                        </div>

                        {/* Front Bottom Action Bar */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}
                        >
                          <button
                            onClick={() => handleToggleCardFlip(card.id)}
                            style={{ background: 'transparent', border: 'none', color: '#d4a373', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                          >
                            <RotateCw size={11} /> Flip for Answer
                          </button>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleToggleMastered(card.id, false)}
                              title="Mark for revision"
                              style={{
                                padding: '5px 9px',
                                borderRadius: '6px',
                                background: !isMastered ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                color: '#ef4444',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleToggleMastered(card.id, true)}
                              title="Mark as mastered"
                              style={{
                                padding: '5px 11px',
                                borderRadius: '6px',
                                background: isMastered ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(52, 211, 153, 0.3)',
                                color: '#34d399',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <Check size={11} /> Mastered
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 2. REVERSE BACK FACE (ANSWER & EXPLANATION) */}
                      <div
                        className="glass-panel flashcard-face flashcard-face-back flashcard-interactive-card"
                        style={{
                          padding: '20px 22px',
                          background: 'rgba(24, 24, 34, 0.96)',
                          border: '1px solid rgba(56, 189, 248, 0.35)',
                          borderRadius: '18px',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)'
                        }}
                      >
                        {/* Back Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Core Answer & Breakdown
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <RotateCw size={11} /> Answer
                          </span>
                        </div>

                        {/* Back Body with Auto Scroll if long */}
                        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div>
                            <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                              Core Answer:
                            </span>
                            <p style={{ fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.45, margin: 0, color: '#eae6e1' }}>
                              <FormattedText text={card.answer} isQuestion={false} />
                            </p>
                          </div>

                          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '9px 11px', borderRadius: '8px', fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                            <strong style={{ color: '#d4a373', display: 'block', marginBottom: '2px' }}>Deep Explanation:</strong>
                            <FormattedText text={card.explanation} isQuestion={false} />
                          </div>

                          <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.72rem', color: '#eae6e1', lineHeight: 1.4 }}>
                            <strong style={{ color: '#34d399', display: 'block', marginBottom: '1px' }}>Key Takeaway:</strong>
                            <FormattedText text={card.keyTakeaway} isQuestion={false} />
                          </div>
                        </div>

                        {/* Back Bottom Action Bar */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}
                        >
                          <button
                            onClick={() => handleToggleCardFlip(card.id)}
                            style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                          >
                            <RotateCw size={11} /> Back to Question
                          </button>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleToggleMastered(card.id, false)}
                              title="Mark for revision"
                              style={{
                                padding: '5px 9px',
                                borderRadius: '6px',
                                background: !isMastered ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                color: '#ef4444',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleToggleMastered(card.id, true)}
                              title="Mark as mastered"
                              style={{
                                padding: '5px 11px',
                                borderRadius: '6px',
                                background: isMastered ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(52, 211, 153, 0.3)',
                                color: '#34d399',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <Check size={11} /> Mastered
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Pagination Bar */}
          {pageSize !== 'all' && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px', paddingBottom: '20px' }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.76rem', opacity: currentPage === 1 ? 0.4 : 1 }}
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0 8px' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.76rem', opacity: currentPage === totalPages ? 0.4 : 1 }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. FLASHCARD 1-BY-1 FOCUS STUDY ROOM VIEW */}
      {viewLayout === 'focus' && currentFocusCard && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center', width: '100%' }}>
          
          {/* Card Progress Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '780px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#d4a373' }}>
              Card {focusCardIndex + 1} of {activeDeckList.length} • {currentFocusCard.category} {currentFocusCard.subtopicName ? `(${currentFocusCard.subtopicName})` : ''}
            </span>

            <span style={{ fontSize: '0.72rem', color: masteredCards[currentFocusCard.id] ? '#34d399' : 'var(--text-dim)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {masteredCards[currentFocusCard.id] ? <Check size={12} /> : null}
              {masteredCards[currentFocusCard.id] ? 'Mastered' : 'Needs Practice'}
            </span>
          </div>

          {/* Interactive 3D Focus Card */}
          <div
            onClick={() => setIsFocusFlipped(!isFocusFlipped)}
            className="flashcard-3d-perspective"
            style={{
              width: '100%',
              maxWidth: '820px',
              minHeight: '390px',
              cursor: 'pointer'
            }}
          >
            <div
              className={`flashcard-3d-wrapper ${isFocusFlipped ? 'is-flipped' : ''}`}
              style={{
                width: '100%',
                minHeight: '390px',
                height: '100%'
              }}
            >
              {/* 1. FRONT FACE (QUESTION) */}
              <div
                className="glass-panel flashcard-face flashcard-face-front flashcard-interactive-card"
                style={{
                  padding: '30px 34px',
                  background: 'rgba(20, 20, 26, 0.95)',
                  border: masteredCards[currentFocusCard.id] ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(212, 163, 115, 0.3)',
                  borderRadius: '24px',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
                  minHeight: '390px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {/* Focus Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
                  <span className="badge badge-completed" style={{ fontSize: '0.7rem' }}>
                    FRONT SIDE (CONCEPT QUESTION)
                  </span>

                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RotateCw size={12} /> Click anywhere to flip
                  </span>
                </div>

                {/* Focus Front Body with Auto Scroll if long */}
                <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.45, margin: 0, color: '#f5f5f7' }}>
                    <FormattedText text={currentFocusCard.prompt} isQuestion={true} />
                  </h2>

                  {currentFocusCard.codeSnippet && (
                    <PythonCodeSnippet code={currentFocusCard.codeSnippet} maxHeight="180px" />
                  )}
                </div>

                {/* Bottom Navigation & Mastery Buttons */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginTop: '16px',
                    flexShrink: 0
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setIsFocusFlipped(false);
                        setFocusCardIndex((prev) => (prev > 0 ? prev - 1 : activeDeckList.length - 1));
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '7px 12px', fontSize: '0.76rem', borderRadius: '8px' }}
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <button
                      onClick={() => {
                        setIsFocusFlipped(false);
                        setFocusCardIndex((prev) => (prev < activeDeckList.length - 1 ? prev + 1 : 0));
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '7px 12px', fontSize: '0.76rem', borderRadius: '8px' }}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        handleToggleMastered(currentFocusCard.id, false);
                        setIsFocusFlipped(false);
                        setFocusCardIndex((prev) => (prev < activeDeckList.length - 1 ? prev + 1 : 0));
                      }}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <RotateCcw size={12} /> Review Again
                    </button>

                    <button
                      onClick={() => {
                        handleToggleMastered(currentFocusCard.id, true);
                        setIsFocusFlipped(false);
                        setFocusCardIndex((prev) => (prev < activeDeckList.length - 1 ? prev + 1 : 0));
                      }}
                      style={{
                        padding: '7px 16px',
                        borderRadius: '8px',
                        background: 'rgba(52, 211, 153, 0.15)',
                        border: '1px solid rgba(52, 211, 153, 0.4)',
                        color: '#34d399',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <CheckCircle2 size={13} /> Got It / Mastered
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. REVERSE BACK FACE (ANSWER & EXPLANATION) */}
              <div
                className="glass-panel flashcard-face flashcard-face-back flashcard-interactive-card"
                style={{
                  padding: '30px 34px',
                  background: 'rgba(25, 25, 36, 0.96)',
                  border: '1px solid rgba(56, 189, 248, 0.38)',
                  borderRadius: '24px',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)',
                  minHeight: '390px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {/* Focus Back Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
                  <span className="badge badge-learning" style={{ fontSize: '0.7rem' }}>
                    REVERSE SIDE (ANSWER & EXPLANATION)
                  </span>

                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RotateCw size={12} /> Click anywhere to flip
                  </span>
                </div>

                {/* Focus Back Body with Auto Scroll if long */}
                <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      Core Answer:
                    </span>
                    <p style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.45, margin: 0, color: '#eae6e1' }}>
                      <FormattedText text={currentFocusCard.answer} isQuestion={false} />
                    </p>
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px 14px', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <strong style={{ color: '#d4a373', display: 'block', marginBottom: '2px' }}>Deep Explanation:</strong>
                    <FormattedText text={currentFocusCard.explanation} isQuestion={false} />
                  </div>

                  <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.78rem', color: '#eae6e1' }}>
                    <strong style={{ color: '#34d399', display: 'block', marginBottom: '2px' }}>Key Takeaway:</strong>
                    <FormattedText text={currentFocusCard.keyTakeaway} isQuestion={false} />
                  </div>
                </div>

                {/* Bottom Navigation & Mastery Buttons */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginTop: '16px',
                    flexShrink: 0
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setIsFocusFlipped(false);
                        setFocusCardIndex((prev) => (prev > 0 ? prev - 1 : activeDeckList.length - 1));
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '7px 12px', fontSize: '0.76rem', borderRadius: '8px' }}
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <button
                      onClick={() => {
                        setIsFocusFlipped(false);
                        setFocusCardIndex((prev) => (prev < activeDeckList.length - 1 ? prev + 1 : 0));
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '7px 12px', fontSize: '0.76rem', borderRadius: '8px' }}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        handleToggleMastered(currentFocusCard.id, false);
                        setIsFocusFlipped(false);
                        setFocusCardIndex((prev) => (prev < activeDeckList.length - 1 ? prev + 1 : 0));
                      }}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <RotateCcw size={12} /> Review Again
                    </button>

                    <button
                      onClick={() => {
                        handleToggleMastered(currentFocusCard.id, true);
                        setIsFocusFlipped(false);
                        setFocusCardIndex((prev) => (prev < activeDeckList.length - 1 ? prev + 1 : 0));
                      }}
                      style={{
                        padding: '7px 16px',
                        borderRadius: '8px',
                        background: 'rgba(52, 211, 153, 0.15)',
                        border: '1px solid rgba(52, 211, 153, 0.4)',
                        color: '#34d399',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <CheckCircle2 size={13} /> Got It / Mastered
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
