import React, { useState, useMemo, useEffect } from 'react';
import { initialQuizzes } from '../data/sandboxData';
import type { QuizQuestion, QuizAttemptRecord } from '../types/sandbox';
import { useLTrack } from '../context/LTrackContext';
import { getISTFullDateString, getISTTimeString } from '../utils/dateUtils';
import {
  HelpCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Clock,
  Search,
  Check,
  X,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  History,
  Lock
} from 'lucide-react';

export const QuizStudioView: React.FC = () => {
  const { currentUser, setActiveTab } = useLTrack();

  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTabMode] = useState<'practice' | 'history'>('practice');

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
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz Completed: Calculate Diagnostic Report & Save to Private History
      completeQuiz();
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
    } catch {}

    setQuizFinished(true);
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setQuizFinished(false);
    setQuizStartTime(Date.now());
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      
      {/* 1. Header Banner */}
      <div className="glass-panel" style={{ padding: '22px 28px', background: 'linear-gradient(135deg, rgba(20, 20, 26, 0.95) 0%, rgba(30, 30, 42, 0.85) 100%)', border: '1px solid rgba(212, 163, 115, 0.22)', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-learning" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <HelpCircle size={13} color="#38bdf8" /> Concept Assessment Studio
              </span>
              <span style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={12} /> Private to {currentUser.name.split(' ')[0]}
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#eae6e1', letterSpacing: '-0.02em', margin: 0 }}>
              Engineering Concept Quizzes & Diagnostic Reports
            </h1>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              Test your deep understanding of Python, FastAPI, Docker, and RAG. Diagnostic reports highlight topics you need to revise.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTabMode('practice')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: activeTab === 'practice' ? '1px solid #d4a373' : '1px solid rgba(255, 255, 255, 0.08)',
                background: activeTab === 'practice' ? 'rgba(212, 163, 115, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: activeTab === 'practice' ? '#d4a373' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <HelpCircle size={14} /> Practice Quizzes
            </button>

            <button
              onClick={() => setActiveTabMode('history')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: activeTab === 'history' ? '1px solid #d4a373' : '1px solid rgba(255, 255, 255, 0.08)',
                background: activeTab === 'history' ? 'rgba(212, 163, 115, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: activeTab === 'history' ? '#d4a373' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <History size={14} /> Private History ({privateHistory.length})
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: PRACTICE QUIZZES & DIAGNOSTIC REPORT */}
      {activeTab === 'practice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Main Topic & Subtopic Filters Toolbar */}
          <div className="glass-panel" style={{ padding: '14px 18px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Main Topic Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, marginRight: '4px' }}>
                  TOPIC:
                </span>
                {domains.map((dom) => (
                  <button
                    key={dom}
                    onClick={() => {
                      setSelectedDomain(dom);
                      setSelectedSubtopic('all');
                    }}
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

              {/* Subtopic Filter Dropdown */}
              {subtopics.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>
                    SUBTOPIC:
                  </span>
                  <select
                    value={selectedSubtopic}
                    onChange={(e) => setSelectedSubtopic(e.target.value)}
                    className="form-control"
                    style={{ padding: '5px 10px', fontSize: '0.76rem', width: 'auto', background: 'rgba(255, 255, 255, 0.05)', color: '#eae6e1', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                  >
                    <option value="all">All Subtopics ({filteredQuizzes.length})</option>
                    {subtopics.filter((s) => s !== 'all').map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '5px 10px' }}>
              <Search size={13} color="#d4a373" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search question keywords..."
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#eae6e1', fontSize: '0.75rem', width: '180px' }}
              />
            </div>
          </div>

          {/* If No Quizzes Match Filter */}
          {filteredQuizzes.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.86rem' }}>
              No quizzes match the selected filters. Please select "All Topics".
            </div>
          ) : quizFinished ? (
            /* ============================================================ */
            /* 2. FULL DIAGNOSTIC FAILURE & RECOVERY REPORT AREA */
            /* ============================================================ */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Score Summary Card */}
              <div className="glass-panel" style={{ padding: '26px', background: 'rgba(20, 20, 26, 0.9)', border: '1px solid rgba(212, 163, 115, 0.3)', borderRadius: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d4a373', textTransform: 'uppercase' }}>
                      Diagnostic Assessment Report
                    </span>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#eae6e1', margin: '4px 0 0 0' }}>
                      {scorePct >= 80 ? 'Mastery Achieved!' : scorePct >= 50 ? 'Good Progress - Review Suggested' : 'Focused Revision Recommended'}
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                      Completed {filteredQuizzes.length} questions in {timeSpentSeconds} seconds. Results saved privately to your learning record.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: scorePct >= 80 ? '#34d399' : scorePct >= 50 ? '#38bdf8' : '#ef4444' }}>
                        {scorePct}%
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {correctCount} / {filteredQuizzes.length} Correct
                      </span>
                    </div>

                    <button
                      onClick={handleRestartQuiz}
                      className="btn btn-primary"
                      style={{ padding: '9px 18px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
                    >
                      <RotateCcw size={14} /> Retake Quiz
                    </button>
                  </div>
                </div>
              </div>

              {/* FAILED TOPICS & REVISION ACTIONS (What needs to be checked/learned again) */}
              {failedQuestionsList.length > 0 ? (
                <div className="glass-panel" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <AlertCircle size={18} color="#ef4444" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                      Topics Requiring Revision ({failedQuestionsList.length})
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
                    These concepts were answered incorrectly. Review the explanations below to solidify your mental model.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {failedQuestionsList.map((q, idx) => {
                      const userChoice = q.options.find((o) => o.id === userAnswers[q.id]);
                      const correctChoice = q.options.find((o) => o.id === q.correctOptionId);

                      return (
                        <div
                          key={q.id}
                          style={{
                            background: 'rgba(20, 20, 26, 0.85)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
                              Question {idx + 1} • {q.category} {q.subtopicName ? `(${q.subtopicName})` : ''}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#eae6e1', margin: 0 }}>
                            {q.question}
                          </h4>

                          {/* Side-by-side: Your Answer vs Correct Answer */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.76rem' }}>
                              <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#ef4444', display: 'block', marginBottom: '2px' }}>
                                YOUR ANSWER (INCORRECT):
                              </span>
                              <span style={{ color: '#eae6e1' }}>{userChoice?.text || 'Not answered'}</span>
                            </div>

                            <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.76rem' }}>
                              <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#34d399', display: 'block', marginBottom: '2px' }}>
                                CORRECT ANSWER:
                              </span>
                              <span style={{ color: '#eae6e1' }}>{correctChoice?.text}</span>
                            </div>
                          </div>

                          {/* Deep Concept Explanation */}
                          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.76rem', color: '#eae6e1', lineHeight: 1.5 }}>
                            <strong style={{ color: '#d4a373', display: 'block', marginBottom: '2px' }}>Core Concept & Explanation:</strong>
                            {q.explanation}
                          </div>

                          {/* 1-Click Action to Revision Flashcards */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                            <button
                              onClick={() => setActiveTab('flashcards')}
                              className="btn btn-secondary"
                              style={{ padding: '5px 12px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '8px' }}
                            >
                              <BookOpen size={12} color="#d4a373" />
                              <span>Review in Flashcards Hub</span>
                              <ArrowRight size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '24px', background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <ShieldCheck size={28} color="#34d399" />
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                      Flawless Score! Zero Failed Questions
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      You demonstrated complete mastery across all concepts tested in this module.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ============================================================ */
            /* 3. INTERACTIVE QUIZ PLAYER */
            /* ============================================================ */
            activeQuestion && (
              <div className="glass-panel" style={{ padding: '28px', background: 'rgba(20, 20, 26, 0.9)', border: '1px solid rgba(212, 163, 115, 0.22)', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Progress Bar & Counter */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#d4a373', textTransform: 'uppercase' }}>
                      Question {currentQuizIndex + 1} of {filteredQuizzes.length} • {activeQuestion.category} {activeQuestion.subtopicName ? `(${activeQuestion.subtopicName})` : ''}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Phase {activeQuestion.phaseNumber}
                    </span>
                  </div>

                  <div className="progress-track" style={{ height: '6px' }}>
                    <div className="progress-fill" style={{ width: `${((currentQuizIndex + 1) / filteredQuizzes.length) * 100}%`, background: '#d4a373' }} />
                  </div>
                </div>

                {/* Question Prompt */}
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#eae6e1', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                    {activeQuestion.question}
                  </h3>

                  {/* Code Snippet if present */}
                  {activeQuestion.codeSnippet && (
                    <div style={{ background: '#0a0a0e', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#38bdf8', lineHeight: 1.5, overflowX: 'auto', marginBottom: '16px' }}>
                      <pre style={{ margin: 0 }}>{activeQuestion.codeSnippet}</pre>
                    </div>
                  )}
                </div>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeQuestion.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    const isCorrect = opt.id === activeQuestion.correctOptionId;

                    let bg = 'rgba(255, 255, 255, 0.03)';
                    let border = 'rgba(255, 255, 255, 0.08)';
                    let textColor = '#eae6e1';

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        bg = 'rgba(52, 211, 153, 0.15)';
                        border = 'rgba(52, 211, 153, 0.4)';
                        textColor = '#34d399';
                      } else if (isSelected && !isCorrect) {
                        bg = 'rgba(239, 68, 68, 0.15)';
                        border = 'rgba(239, 68, 68, 0.4)';
                        textColor = '#ef4444';
                      }
                    } else if (isSelected) {
                      bg = 'rgba(212, 163, 115, 0.15)';
                      border = 'rgba(212, 163, 115, 0.4)';
                      textColor = '#d4a373';
                    }

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '12px',
                          background: bg,
                          border: `1px solid ${border}`,
                          cursor: isAnswerSubmitted ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: isSelected ? '2px solid currentColor' : '2px solid rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', color: textColor }}>
                          {isAnswerSubmitted && isCorrect ? <Check size={12} /> : isAnswerSubmitted && isSelected && !isCorrect ? <X size={12} /> : isSelected ? <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }} /> : null}
                        </div>

                        <span style={{ fontSize: '0.86rem', color: textColor, lineHeight: 1.4 }}>
                          {opt.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box (Revealed after submission) */}
                {isAnswerSubmitted && (
                  <div style={{ background: 'rgba(212, 163, 115, 0.08)', border: '1px solid rgba(212, 163, 115, 0.25)', padding: '14px 18px', borderRadius: '12px', fontSize: '0.82rem', color: '#eae6e1', lineHeight: 1.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d4a373', fontWeight: 700, marginBottom: '4px' }}>
                      <Sparkles size={14} /> Concept Takeaway:
                    </div>
                    {activeQuestion.explanation}
                  </div>
                )}

                {/* Action Controls */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!selectedOptionId}
                      className="btn btn-primary"
                      style={{ padding: '9px 22px', fontSize: '0.84rem', borderRadius: '10px' }}
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="btn btn-primary"
                      style={{ padding: '9px 22px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
                    >
                      <span>{currentQuizIndex < filteredQuizzes.length - 1 ? 'Next Question' : 'View Diagnostic Report'}</span>
                      <ChevronRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* TAB 2: PRIVATE QUIZ HISTORY & TIME STAMPS */}
      {activeTab === 'history' && (
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="#d4a373" /> My Private Quiz & Assessment Logs
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                All quiz records are saved strictly for your personal review. Other teammates cannot view your individual quiz results.
              </p>
            </div>

            <span className="badge badge-learning" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} /> Private Storage
            </span>
          </div>

          {privateHistory.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.86rem' }}>
              No quiz attempts recorded yet. Complete a quiz to view your history and time stamps.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {privateHistory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#eae6e1' }}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} /> {item.timestamp}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {item.correctCount}/{item.totalCount} correct • {item.timeSpentSeconds}s duration • {item.failedQuestions.length} failed topics flagged
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: item.scorePct >= 80 ? '#34d399' : item.scorePct >= 50 ? '#38bdf8' : '#ef4444' }}>
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
                      style={{ padding: '6px 12px', fontSize: '0.74rem', borderRadius: '8px' }}
                    >
                      Retry Module
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
