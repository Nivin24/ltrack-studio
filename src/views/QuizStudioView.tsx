import React, { useState, useMemo, useEffect } from 'react';
import { initialQuizzes } from '../data/sandboxData';
import type { QuizQuestion, QuizAttemptRecord } from '../types/sandbox';
import { useLTrack } from '../context/LTrackContext';
import { getISTFullDateString, getISTTimeString } from '../utils/dateUtils';
import { FormattedText } from '../components/FormattedText';
import {
  HelpCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Clock,
  Search,
  Check,
  X,
  BookOpen,
  History,
  Lock,
  Layers,
  Award,
  Filter,
  CheckCircle2,
  XCircle,
  Copy,
  CheckCheck
} from 'lucide-react';

/**
 * Syntax-highlighted Python Code Snippet Component
 * Matches VSCode/Monokai Code Sandbox & Flashcards theme
 */
const PythonCodeSnippet: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const lines = code.trim().split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightLine = (line: string) => {
    if (line.trim().startsWith('#')) {
      return <span style={{ color: '#64748b', fontStyle: 'italic' }}>{line}</span>;
    }

    const tokens = line.split(/(#.*$|f?"(?:\\.|[^"\\])*"|f?'(?:\\.|[^'\\])*'|\b(?:async|def|await|import|from|return|class|yield|with|if|elif|else|try|except|finally|for|while|in|as|pass|raise|break|continue|True|False|None)\b|\b(?:print|range|len|type|int|str|dict|list|set|tuple|float|bool|Depends|BaseModel|FastAPI|APIRouter|Session|select|func|Vector|Embeddings)\b|\b\d+(?:\.\d+)?\b|[{}()[\]:.,=+\-*/%><!&|^~]+)/g);

    return tokens.map((token, i) => {
      if (!token) return null;
      if (token.startsWith('#')) {
        return <span key={i} style={{ color: '#64748b', fontStyle: 'italic' }}>{token}</span>;
      }
      if (token.startsWith('"') || token.startsWith("'") || token.startsWith('f"') || token.startsWith("f'")) {
        return <span key={i} style={{ color: '#f8fafc' }}>{token}</span>;
      }
      if (/^(async|def|await|import|from|return|class|yield|with|if|elif|else|try|except|finally|for|while|in|as|pass|raise|break|continue|True|False|None)$/.test(token)) {
        return <span key={i} style={{ color: '#f87171', fontWeight: 600 }}>{token}</span>;
      }
      if (/^(print|range|len|type|int|str|dict|list|set|tuple|float|bool|Depends|BaseModel|FastAPI|APIRouter|Session|select|func|Vector|Embeddings)$/.test(token) || /^\d+(\.\d+)?$/.test(token)) {
        return <span key={i} style={{ color: '#60a5fa', fontWeight: 600 }}>{token}</span>;
      }
      if (/^[{}()[\]:.,=+\-*/%><!&|^~]+$/.test(token)) {
        return <span key={i} style={{ color: '#f87171' }}>{token}</span>;
      }
      return <span key={i} style={{ color: '#f8fafc' }}>{token}</span>;
    });
  };

  return (
    <div
      style={{
        position: 'relative',
        background: '#09090d',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.7)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '4px 10px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.64rem',
          color: 'var(--text-dim)'
        }}
      >
        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>python</span>
        <button
          onClick={handleCopy}
          style={{
            background: 'transparent',
            border: 'none',
            color: copied ? '#34d399' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '0.64rem'
          }}
        >
          {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div style={{ padding: '10px 12px', maxHeight: '110px', overflowY: 'auto', overflowX: 'auto', fontFamily: "'Fira Code', monospace", fontSize: '0.74rem', lineHeight: 1.5 }}>
        {lines.map((line, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '10px' }}>
            <span style={{ width: '16px', textAlign: 'right', color: '#475569', userSelect: 'none', fontSize: '0.68rem' }}>
              {idx + 1}
            </span>
            <div style={{ color: '#f8fafc', whiteSpace: 'pre' }}>
              {highlightLine(line) || ' '}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const QuizStudioView: React.FC = () => {
  const { currentUser, setActiveTab } = useLTrack();

  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabMode, setActiveTabMode] = useState<'practice' | 'history'>('practice');

  // Diagnostic Report filter ('all' | 'failed' | 'passed')
  const [reportFilter, setReportFilter] = useState<'all' | 'failed' | 'passed'>('all');

  // Quiz Player State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);

  // Private Quiz History State (stored in localStorage keyed per user)
  const [privateHistory, setPrivateHistory] = useState<QuizAttemptRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`ltrack_private_quiz_history_${currentUser.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Domains list
  const domains = useMemo(() => {
    const set = new Set<string>();
    initialQuizzes.forEach((q) => set.add(q.category));
    return ['all', ...Array.from(set)];
  }, []);

  // Subtopics list for selected domain
  const subtopics = useMemo(() => {
    const set = new Set<string>();
    initialQuizzes.forEach((q) => {
      if (selectedDomain === 'all' || q.category === selectedDomain) {
        if (q.subtopicName) set.add(q.subtopicName);
      }
    });
    return ['all', ...Array.from(set)];
  }, [selectedDomain]);

  // Filtered Quizzes
  const filteredQuizzes: QuizQuestion[] = useMemo(() => {
    return initialQuizzes.filter((q) => {
      if (selectedDomain !== 'all' && q.category !== selectedDomain) return false;
      if (selectedSubtopic !== 'all' && q.subtopicName !== selectedSubtopic) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchQ = q.question.toLowerCase().includes(query);
        const matchCat = q.category.toLowerCase().includes(query);
        const matchSub = (q.subtopicName || '').toLowerCase().includes(query);
        if (!matchQ && !matchCat && !matchSub) return false;
      }
      return true;
    });
  }, [selectedDomain, selectedSubtopic, searchQuery]);

  const activeQuestion: QuizQuestion | undefined = filteredQuizzes[currentQuizIndex];

  // Reset question index when filter changes
  useEffect(() => {
    setCurrentQuizIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setQuizFinished(false);
    setQuizStartTime(Date.now());
  }, [selectedDomain, selectedSubtopic]);

  // Set selected option on current question if already answered
  useEffect(() => {
    if (activeQuestion && userAnswers[activeQuestion.id]) {
      setSelectedOptionId(userAnswers[activeQuestion.id]);
      setIsAnswerSubmitted(true);
    } else {
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    }
  }, [currentQuizIndex, activeQuestion, userAnswers]);

  // Live timer while quiz is active
  useEffect(() => {
    if (quizFinished) return;
    const interval = setInterval(() => {
      setTimeSpentSeconds(Math.round((Date.now() - quizStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [quizStartTime, quizFinished]);

  const handleSelectOption = (optionId: string) => {
    if (isAnswerSubmitted || quizFinished) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || !activeQuestion || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    setUserAnswers((prev) => ({ ...prev, [activeQuestion.id]: selectedOptionId }));
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < filteredQuizzes.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
    } else {
      completeQuiz();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex((prev) => prev - 1);
    }
  };

  const completeQuiz = () => {
    const total = filteredQuizzes.length;
    let correct = 0;
    const failedList: QuizAttemptRecord['failedQuestions'] = [];

    filteredQuizzes.forEach((q) => {
      const ans = userAnswers[q.id] || (q.id === activeQuestion?.id ? selectedOptionId : undefined);
      if (ans === q.correctOptionId) {
        correct += 1;
      } else {
        const selectedOpt = q.options.find((o) => o.id === ans);
        const correctOpt = q.options.find((o) => o.id === q.correctOptionId);
        failedList.push({
          questionId: q.id,
          question: q.question,
          selectedAnswer: selectedOpt?.text || 'No answer selected',
          correctAnswer: correctOpt?.text || '',
          explanation: q.explanation
        });
      }
    });

    const elapsed = Math.round((Date.now() - quizStartTime) / 1000);
    setTimeSpentSeconds(elapsed);
    const score = Math.round((correct / Math.max(total, 1)) * 100);

    const record: QuizAttemptRecord = {
      id: `attempt_${Date.now()}`,
      userId: currentUser.id,
      category: selectedDomain === 'all' ? 'All Engineering Topics' : selectedDomain,
      scorePct: score,
      correctCount: correct,
      totalCount: total,
      timeSpentSeconds: elapsed,
      timestamp: `${getISTFullDateString(new Date())} at ${getISTTimeString(new Date())} IST`,
      failedQuestions: failedList
    };

    const updatedHistory = [record, ...privateHistory];
    setPrivateHistory(updatedHistory);
    try {
      localStorage.setItem(`ltrack_private_quiz_history_${currentUser.id}`, JSON.stringify(updatedHistory));
    } catch {
      // ignore
    }

    setQuizFinished(true);
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setQuizFinished(false);
    setQuizStartTime(Date.now());
    setReportFilter('all');
  };

  // Diagnostic Stats for Finished Quiz
  const correctCount = useMemo(() => {
    let count = 0;
    filteredQuizzes.forEach((q) => {
      if (userAnswers[q.id] === q.correctOptionId) count += 1;
    });
    return count;
  }, [filteredQuizzes, userAnswers]);

  const scorePct = Math.round((correctCount / Math.max(filteredQuizzes.length, 1)) * 100);

  const failedQuestionsList = useMemo(() => {
    return filteredQuizzes.filter((q) => userAnswers[q.id] !== q.correctOptionId);
  }, [filteredQuizzes, userAnswers]);

  const passedQuestionsList = useMemo(() => {
    return filteredQuizzes.filter((q) => userAnswers[q.id] === q.correctOptionId);
  }, [filteredQuizzes, userAnswers]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      
      {/* 1. Header & View Switcher (Slim Height) */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 18px',
          background: 'linear-gradient(135deg, rgba(20, 20, 26, 0.95) 0%, rgba(30, 30, 42, 0.85) 100%)',
          border: '1px solid rgba(212, 163, 115, 0.22)',
          borderRadius: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(212, 163, 115, 0.12)',
              border: '1px solid rgba(212, 163, 115, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d4a373'
            }}
          >
            <HelpCircle size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', letterSpacing: '-0.02em', margin: 0 }}>
                Concept Assessment & Diagnostic Studio
              </h1>
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '5px',
                  background: 'rgba(52, 211, 153, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.35)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <Lock size={10} /> Private
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
              Master Python 3.12, FastAPI, PostgreSQL, Docker, and RAG with diagnostic takeaways.
            </p>
          </div>
        </div>

        {/* View Mode Toggle (Practice vs History) */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '2px',
            display: 'flex',
            gap: '3px'
          }}
        >
          <button
            onClick={() => setActiveTabMode('practice')}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              border: 'none',
              background: activeTabMode === 'practice' ? 'rgba(212, 163, 115, 0.2)' : 'transparent',
              color: activeTabMode === 'practice' ? '#d4a373' : 'var(--text-muted)',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <HelpCircle size={13} /> Assessment ({filteredQuizzes.length})
          </button>

          <button
            onClick={() => setActiveTabMode('history')}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              border: 'none',
              background: activeTabMode === 'history' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: activeTabMode === 'history' ? '#38bdf8' : 'var(--text-muted)',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <History size={13} /> Logs ({privateHistory.length})
          </button>
        </div>
      </div>

      {/* TAB 1: PRACTICE QUIZZES & DIAGNOSTIC REPORT */}
      {activeTabMode === 'practice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Main Topic & Subtopic Filters Bar (Compact) */}
          <div
            className="glass-panel"
            style={{
              padding: '8px 14px',
              background: 'rgba(18, 18, 24, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            {/* Domain Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflowX: 'auto', maxWidth: '75%' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 800, marginRight: '2px', textTransform: 'uppercase' }}>
                <Filter size={11} style={{ display: 'inline', marginRight: '2px' }} /> Module:
              </span>
              {domains.map((dom) => {
                const isSel = selectedDomain === dom;
                const count = dom === 'all' ? initialQuizzes.length : initialQuizzes.filter((q) => q.category === dom).length;
                return (
                  <button
                    key={dom}
                    onClick={() => {
                      setSelectedDomain(dom);
                      setSelectedSubtopic('all');
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: isSel ? 700 : 500,
                      cursor: 'pointer',
                      background: isSel ? '#d4a373' : 'rgba(255, 255, 255, 0.04)',
                      color: isSel ? '#0e0e12' : '#eae6e1',
                      border: isSel ? '1px solid #d4a373' : '1px solid rgba(255, 255, 255, 0.08)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {dom === 'all' ? `All (${count})` : `${dom} (${count})`}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '190px' }}>
              <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search concepts..."
                style={{
                  width: '100%',
                  padding: '4px 8px 4px 26px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#eae6e1',
                  fontSize: '0.72rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Subtopics Pill Strip (if domain has subtopics) */}
          {subtopics.length > 2 && (
            <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', padding: '0 2px' }}>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', fontWeight: 700, alignSelf: 'center', marginRight: '3px' }}>
                Subtopics:
              </span>
              {subtopics.map((sub) => {
                const isSel = selectedSubtopic === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubtopic(sub)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '0.68rem',
                      fontWeight: isSel ? 700 : 500,
                      cursor: 'pointer',
                      background: isSel ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: isSel ? '#38bdf8' : 'var(--text-muted)',
                      border: isSel ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {sub === 'all' ? 'All' : sub}
                  </button>
                );
              })}
            </div>
          )}

          {/* If No Quizzes Match Filter */}
          {filteredQuizzes.length === 0 ? (
            <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.84rem' }}>
              No quiz questions match the selected filter. Try selecting "All Modules".
            </div>
          ) : quizFinished ? (
            /* ============================================================ */
            /* 2. FULL DIAGNOSTIC FAILURE & RECOVERY REPORT AREA */
            /* ============================================================ */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Score Hero Summary Card */}
              <div
                className="glass-panel"
                style={{
                  padding: '20px 24px',
                  background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.96) 0%, rgba(28, 28, 40, 0.9) 100%)',
                  border: '1px solid rgba(212, 163, 115, 0.3)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 28px rgba(0, 0, 0, 0.5)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Score Radial Ring */}
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: `conic-gradient(${scorePct >= 80 ? '#34d399' : scorePct >= 50 ? '#38bdf8' : '#ef4444'} ${scorePct * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '5px',
                        flexShrink: 0
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: '#121218',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: scorePct >= 80 ? '#34d399' : scorePct >= 50 ? '#38bdf8' : '#ef4444' }}>
                          {scorePct}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '5px',
                            background: scorePct >= 80 ? 'rgba(52, 211, 153, 0.15)' : scorePct >= 50 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: scorePct >= 80 ? '#34d399' : scorePct >= 50 ? '#38bdf8' : '#ef4444',
                            textTransform: 'uppercase'
                          }}
                        >
                          {scorePct >= 80 ? 'Mastery Achieved' : scorePct >= 50 ? 'Proficient • Review Suggested' : 'Targeted Revision Needed'}
                        </span>
                      </div>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', margin: '3px 0 0 0' }}>
                        Diagnostic Evaluation Complete
                      </h2>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                        {correctCount} of {filteredQuizzes.length} questions answered correctly • Completed in {formatTime(timeSpentSeconds)}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setActiveTab('flashcards')}
                      className="btn btn-secondary"
                      style={{ padding: '7px 14px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '8px' }}
                    >
                      <BookOpen size={13} color="#d4a373" /> Flashcards
                    </button>
                    <button
                      onClick={handleRestartQuiz}
                      className="btn btn-primary"
                      style={{ padding: '7px 16px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '8px' }}
                    >
                      <RotateCcw size={13} /> Retake Assessment
                    </button>
                  </div>
                </div>
              </div>

              {/* Diagnostic Question Review & Breakdown Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={15} color="#38bdf8" />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                      Detailed Question Diagnostic Breakdown
                    </h3>
                  </div>

                  {/* Filter between All, Failed, Passed */}
                  <div style={{ display: 'flex', gap: '3px', background: 'rgba(0, 0, 0, 0.4)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <button
                      onClick={() => setReportFilter('all')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '5px',
                        border: 'none',
                        background: reportFilter === 'all' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        color: reportFilter === 'all' ? '#ffffff' : 'var(--text-muted)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      All ({filteredQuizzes.length})
                    </button>
                    <button
                      onClick={() => setReportFilter('failed')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '5px',
                        border: 'none',
                        background: reportFilter === 'failed' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                        color: reportFilter === 'failed' ? '#ef4444' : 'var(--text-muted)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Incorrect ({failedQuestionsList.length})
                    </button>
                    <button
                      onClick={() => setReportFilter('passed')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '5px',
                        border: 'none',
                        background: reportFilter === 'passed' ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                        color: reportFilter === 'passed' ? '#34d399' : 'var(--text-muted)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Correct ({passedQuestionsList.length})
                    </button>
                  </div>
                </div>

                {/* List of Questions in Report */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(reportFilter === 'all'
                    ? filteredQuizzes
                    : reportFilter === 'failed'
                    ? failedQuestionsList
                    : passedQuestionsList
                  ).map((q, idx) => {
                    const userChoice = q.options.find((o) => o.id === userAnswers[q.id]);
                    const correctChoice = q.options.find((o) => o.id === q.correctOptionId);
                    const isPassed = userAnswers[q.id] === q.correctOptionId;

                    return (
                      <div
                        key={q.id}
                        className="glass-panel"
                        style={{
                          padding: '14px 18px',
                          background: isPassed ? 'rgba(20, 24, 22, 0.9)' : 'rgba(26, 20, 22, 0.9)',
                          border: isPassed ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontSize: '0.64rem',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: isPassed ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: isPassed ? '#34d399' : '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              {isPassed ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                              {isPassed ? 'CORRECT' : 'INCORRECT'}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                              Q{idx + 1} • {q.category} {q.subtopicName ? `(${q.subtopicName})` : ''} • Phase {q.phaseNumber}
                            </span>
                          </div>
                        </div>

                        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#eae6e1', margin: 0, lineHeight: 1.4 }}>
                          <FormattedText text={q.question} />
                        </h4>

                        {/* Code snippet if question has one */}
                        {q.codeSnippet && (
                          <div style={{ marginTop: '1px' }}>
                            <PythonCodeSnippet code={q.codeSnippet} />
                          </div>
                        )}

                        {/* Answers Comparison */}
                        <div style={{ display: 'grid', gridTemplateColumns: isPassed ? '1fr' : '1fr 1fr', gap: '8px' }}>
                          {!isPassed && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.74rem' }}>
                              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#ef4444', display: 'block', marginBottom: '2px' }}>
                                YOUR CHOICE:
                              </span>
                              <span style={{ color: '#eae6e1' }}>
                                <FormattedText text={userChoice?.text || 'No option selected'} />
                              </span>
                            </div>
                          )}

                          <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.74rem' }}>
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#34d399', display: 'block', marginBottom: '2px' }}>
                              {isPassed ? 'YOUR CORRECT ANSWER:' : 'CORRECT ANSWER:'}
                            </span>
                            <span style={{ color: '#eae6e1' }}>
                              <FormattedText text={correctChoice?.text || ''} />
                            </span>
                          </div>
                        </div>

                        {/* Concept Takeaway Explanation */}
                        <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.74rem', color: '#eae6e1', lineHeight: 1.45 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d4a373', fontWeight: 700, marginBottom: '2px' }}>
                            <Sparkles size={12} /> Architectural Concept Takeaway:
                          </div>
                          <FormattedText text={q.explanation} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* 3. INTERACTIVE QUIZ PLAYER (BALANCED COMPACT 2-COLUMN VIEW) */
            /* ============================================================ */
            activeQuestion && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                {/* Horizontal Question Stepper Bar (Slim) */}
                <div
                  className="glass-panel"
                  style={{
                    padding: '8px 14px',
                    background: 'rgba(20, 20, 28, 0.92)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    overflowX: 'auto'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', padding: '1px 0' }}>
                    {filteredQuizzes.map((q, idx) => {
                      const isCurrent = idx === currentQuizIndex;
                      const hasAnswered = !!userAnswers[q.id];
                      const isCorrect = userAnswers[q.id] === q.correctOptionId;

                      let bubbleBg = 'rgba(255, 255, 255, 0.04)';
                      let bubbleBorder = 'rgba(255, 255, 255, 0.1)';
                      let bubbleColor = 'var(--text-muted)';

                      if (isCurrent) {
                        bubbleBg = 'rgba(212, 163, 115, 0.25)';
                        bubbleBorder = '#d4a373';
                        bubbleColor = '#ffffff';
                      } else if (hasAnswered) {
                        if (isCorrect) {
                          bubbleBg = 'rgba(52, 211, 153, 0.2)';
                          bubbleBorder = 'rgba(52, 211, 153, 0.5)';
                          bubbleColor = '#34d399';
                        } else {
                          bubbleBg = 'rgba(239, 68, 68, 0.2)';
                          bubbleBorder = 'rgba(239, 68, 68, 0.5)';
                          bubbleColor = '#ef4444';
                        }
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuizIndex(idx)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: `1px solid ${bubbleBorder}`,
                            background: bubbleBg,
                            color: bubbleColor,
                            fontSize: '0.72rem',
                            fontWeight: isCurrent ? 800 : 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.15s ease'
                          }}
                          title={`Question ${idx + 1}: ${q.category}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700 }}>
                      <Clock size={12} /> {formatTime(timeSpentSeconds)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                      {Object.keys(userAnswers).length}/{filteredQuizzes.length} answered
                    </div>
                  </div>
                </div>

                {/* 2-Column Main Workspace (Zero-Scroll Balanced Layout) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.2fr) minmax(240px, 1fr)', gap: '12px', alignItems: 'stretch' }}>
                  
                  {/* Left Column: Hero Question Arena */}
                  <div
                    className="glass-panel"
                    style={{
                      padding: '20px 22px',
                      background: 'rgba(20, 20, 28, 0.94)',
                      border: '1px solid rgba(212, 163, 115, 0.22)',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Question Header & Category Tags */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '5px',
                              background: 'rgba(212, 163, 115, 0.15)',
                              color: '#d4a373',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}
                          >
                            Phase {activeQuestion.phaseNumber} • {activeQuestion.category}
                          </span>

                          {activeQuestion.subtopicName && (
                            <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>
                              {activeQuestion.subtopicName}
                            </span>
                          )}
                        </div>

                        {/* Question Text with Backtick Code Highlights */}
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f5f5f7', lineHeight: 1.4, margin: 0 }}>
                          <FormattedText text={activeQuestion.question} />
                        </h3>
                      </div>

                      {/* Python Code Snippet (if question contains code) */}
                      {activeQuestion.codeSnippet && (
                        <div>
                          <PythonCodeSnippet code={activeQuestion.codeSnippet} />
                        </div>
                      )}

                      {/* Options Grid (2x2 Balanced Grid on medium+ screens to prevent scrolling) */}
                      <div>
                        <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                          Select Option:
                        </span>
                        <div style={{ display: 'grid', gridTemplateColumns: activeQuestion.options.length > 2 ? '1fr 1fr' : '1fr', gap: '8px' }}>
                          {activeQuestion.options.map((opt, oIdx) => {
                            const isSelected = selectedOptionId === opt.id;
                            const isCorrect = opt.id === activeQuestion.correctOptionId;
                            const letterLabel = String.fromCharCode(65 + oIdx); // A, B, C, D

                            let bg = 'rgba(255, 255, 255, 0.03)';
                            let border = 'rgba(255, 255, 255, 0.08)';
                            let badgeBg = 'rgba(255, 255, 255, 0.06)';
                            let badgeColor = '#94a3b8';
                            let textColor = '#eae6e1';

                            if (isAnswerSubmitted) {
                              if (isCorrect) {
                                bg = 'rgba(52, 211, 153, 0.15)';
                                border = 'rgba(52, 211, 153, 0.5)';
                                badgeBg = '#34d399';
                                badgeColor = '#0e0e12';
                                textColor = '#34d399';
                              } else if (isSelected && !isCorrect) {
                                bg = 'rgba(239, 68, 68, 0.15)';
                                border = 'rgba(239, 68, 68, 0.5)';
                                badgeBg = '#ef4444';
                                badgeColor = '#ffffff';
                                textColor = '#ef4444';
                              }
                            } else if (isSelected) {
                              bg = 'rgba(212, 163, 115, 0.18)';
                              border = '#d4a373';
                              badgeBg = '#d4a373';
                              badgeColor = '#0e0e12';
                              textColor = '#ffffff';
                            }

                            return (
                              <div
                                key={opt.id}
                                onClick={() => handleSelectOption(opt.id)}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: '10px',
                                  background: bg,
                                  border: `1px solid ${border}`,
                                  cursor: isAnswerSubmitted ? 'default' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '10px',
                                  transition: 'all 0.15s ease',
                                  minHeight: '44px',
                                  boxShadow: isSelected ? '0 3px 10px rgba(0,0,0,0.3)' : 'none'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div
                                    style={{
                                      width: '22px',
                                      height: '22px',
                                      borderRadius: '6px',
                                      background: badgeBg,
                                      color: badgeColor,
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}
                                  >
                                    {letterLabel}
                                  </div>
                                  <span style={{ fontSize: '0.8rem', color: textColor, lineHeight: 1.35, fontWeight: isSelected ? 600 : 400 }}>
                                    <FormattedText text={opt.text} />
                                  </span>
                                </div>

                                {/* Status Icon indicator */}
                                <div>
                                  {isAnswerSubmitted && isCorrect ? (
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                                      <Check size={11} />
                                    </div>
                                  ) : isAnswerSubmitted && isSelected && !isCorrect ? (
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                                      <X size={11} />
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explanation Box (Revealed after submission) */}
                      {isAnswerSubmitted && (
                        <div
                          style={{
                            background: 'rgba(212, 163, 115, 0.08)',
                            border: '1px solid rgba(212, 163, 115, 0.25)',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            fontSize: '0.76rem',
                            color: '#eae6e1',
                            lineHeight: 1.45,
                            animation: 'fadeIn 0.2s ease-out'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#d4a373', fontWeight: 800, marginBottom: '3px', textTransform: 'uppercase', fontSize: '0.68rem' }}>
                            <Sparkles size={12} /> Concept Takeaway:
                          </div>
                          <FormattedText text={activeQuestion.explanation} />
                        </div>
                      )}
                    </div>

                    {/* Bottom Arena Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                      <button
                        onClick={handlePrevQuestion}
                        disabled={currentQuizIndex === 0}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.74rem', borderRadius: '7px', opacity: currentQuizIndex === 0 ? 0.4 : 1 }}
                      >
                        <ChevronLeft size={13} style={{ display: 'inline', marginRight: '2px' }} /> Prev
                      </button>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!isAnswerSubmitted ? (
                          <button
                            onClick={handleSubmitAnswer}
                            disabled={!selectedOptionId}
                            className="btn btn-primary"
                            style={{ padding: '7px 20px', fontSize: '0.8rem', borderRadius: '8px', opacity: !selectedOptionId ? 0.5 : 1 }}
                          >
                            Check Answer
                          </button>
                        ) : (
                          <button
                            onClick={handleNextQuestion}
                            className="btn btn-primary"
                            style={{ padding: '7px 20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '8px' }}
                          >
                            <span>{currentQuizIndex < filteredQuizzes.length - 1 ? 'Next Question' : 'View Diagnostic Report'}</span>
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Companion Diagnostic Sidebar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    {/* Live Progress Dial Card */}
                    <div
                      className="glass-panel"
                      style={{
                        padding: '16px',
                        background: 'rgba(20, 20, 28, 0.94)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Live Performance
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#eae6e1' }}>
                            {correctCount} / {filteredQuizzes.length}
                          </div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                            Correct Answers
                          </span>
                        </div>

                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            background: `conic-gradient(#34d399 ${Math.round((correctCount / Math.max(Object.keys(userAnswers).length, 1)) * 100) * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3px'
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              background: '#14141c',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              color: '#34d399'
                            }}
                          >
                            {Object.keys(userAnswers).length > 0
                              ? `${Math.round((correctCount / Object.keys(userAnswers).length) * 100)}%`
                              : '0%'}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '3px' }}>
                          <span>Completion</span>
                          <span>{Math.round((Object.keys(userAnswers).length / filteredQuizzes.length) * 100)}%</span>
                        </div>
                        <div className="progress-track" style={{ height: '5px' }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${(Object.keys(userAnswers).length / filteredQuizzes.length) * 100}%`,
                              background: '#38bdf8'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Topic Revision Links */}
                    <div
                      className="glass-panel"
                      style={{
                        padding: '14px',
                        background: 'rgba(20, 20, 28, 0.94)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                        Flashcards Revision
                      </span>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.35 }}>
                        Review fast recall cards with smooth sea-wave motion.
                      </p>

                      <button
                        onClick={() => setActiveTab('flashcards')}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.72rem', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                      >
                        <BookOpen size={12} color="#d4a373" /> Open Flashcards
                      </button>
                    </div>

                    {/* Complete Early Action */}
                    {Object.keys(userAnswers).length > 0 && (
                      <button
                        onClick={completeQuiz}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-muted)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <Award size={12} /> Finish & Diagnostic Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* TAB 2: PRIVATE QUIZ HISTORY & TIME STAMPS */}
      {activeTabMode === 'history' && (
        <div
          className="glass-panel"
          style={{
            padding: '20px',
            background: 'rgba(20, 20, 26, 0.85)',
            border: '1px solid rgba(212, 163, 115, 0.16)',
            borderRadius: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#eae6e1', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={16} color="#d4a373" /> Personal Assessment Log History
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                All quiz records are saved strictly for your personal review.
              </p>
            </div>

            <span className="badge badge-learning" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Lock size={11} /> Encrypted Local Store
            </span>
          </div>

          {privateHistory.length === 0 ? (
            <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
              No quiz attempts recorded yet. Complete an assessment to view your diagnostic logs.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {privateHistory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#eae6e1' }}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={10} /> {item.timestamp}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {item.correctCount}/{item.totalCount} correct • {formatTime(item.timeSpentSeconds)} duration • {item.failedQuestions.length} topics flagged
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 900, color: item.scorePct >= 80 ? '#34d399' : item.scorePct >= 50 ? '#38bdf8' : '#ef4444' }}>
                        {item.scorePct}%
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDomain(item.category === 'All Engineering Topics' ? 'all' : item.category);
                        setActiveTabMode('practice');
                        handleRestartQuiz();
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '5px 10px', fontSize: '0.72rem', borderRadius: '6px' }}
                    >
                      Retake Module
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
