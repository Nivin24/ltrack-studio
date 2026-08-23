import React, { useState, useMemo, useEffect } from 'react';
import { useLTrack } from '../context/LTrackContext';
import { DailyCheckInModal } from '../components/DailyCheckInModal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Target,
  BookOpen,
  ExternalLink,
  Plus,
  Trash2,
  GitCommit,
  Award,
  CheckCircle2,
  Flame,
  Clock,
  CheckSquare,
  Square
} from 'lucide-react';
import { getISTDateString, getISTFullDateString } from '../utils/dateUtils';

interface CustomDayTask {
  id: string;
  text: string;
  completed: boolean;
}

export const DailyLearningView: React.FC = () => {
  const {
    topics,
    toggleSubtopic,
    checkIns,
    assignments,
    gitCommits,
    currentUser,
    setActiveTab
  } = useLTrack();

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return getISTDateString(new Date());
  });

  // Calendar Navigation State
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth()); // 0-indexed

  // Custom User Tasks per Day stored in localStorage
  const [customTasks, setCustomTasks] = useState<Record<string, CustomDayTask[]>>(() => {
    try {
      const saved = localStorage.getItem('ltrack_custom_day_tasks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [newTaskInput, setNewTaskInput] = useState('');

  // Save custom tasks
  useEffect(() => {
    try {
      localStorage.setItem('ltrack_custom_day_tasks', JSON.stringify(customTasks));
    } catch {}
  }, [customTasks]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(today.toISOString().slice(0, 10));
  };

  // Calendar Grid Calculation
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayWeekday = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 1 = Mon, ...
  }, [currentYear, currentMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to map any date string (YYYY-MM-DD) to day's tasks & syllabus
  const getDayData = (dateStr: string) => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfMonth = dateObj.getDate();
    
    // Map day of month cyclically to curriculum topics (15 phases)
    const topicIndex = (dayOfMonth - 1) % Math.max(1, topics.length);
    const assignedTopic = topics[topicIndex] || topics[0];

    const dayCheckIn = checkIns.find(
      (c) => c.date === dateStr && (c.userId === currentUser.id || !c.userId)
    );

    const dayAssignments = assignments.filter((a) => a.deadline === dateStr);
    const dayCommits = gitCommits.filter((g) => g.timestamp.slice(0, 10) === dateStr);
    const dayCustomTasks = customTasks[dateStr] || [];

    // Calculate total items and completed items
    const subtopics = assignedTopic ? assignedTopic.subtopics : [];
    const completedSubtopics = subtopics.filter((s) => s.status === 'completed').length;
    const completedCustom = dayCustomTasks.filter((t) => t.completed).length;

    const totalItems = subtopics.length + dayCustomTasks.length + (dayAssignments.length > 0 ? 1 : 0) + 1; // +1 for checkin
    let completedItems = completedSubtopics + completedCustom;
    if (dayCheckIn) completedItems += 1;

    const isFullyCompleted = totalItems > 0 && completedItems >= totalItems;
    const isPartiallyCompleted = completedItems > 0 && !isFullyCompleted;

    return {
      dateStr,
      dayOfMonth,
      assignedTopic,
      dayCheckIn,
      dayAssignments,
      dayCommits,
      dayCustomTasks,
      subtopics,
      completedSubtopics,
      totalItems,
      completedItems,
      isFullyCompleted,
      isPartiallyCompleted
    };
  };

  // Selected Day Data
  const selectedDayData = useMemo(() => {
    return getDayData(selectedDateStr);
  }, [selectedDateStr, topics, checkIns, assignments, gitCommits, customTasks, currentUser.id]);

  // Add custom task
  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;

    const newTask: CustomDayTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: newTaskInput.trim(),
      completed: false
    };

    setCustomTasks((prev) => ({
      ...prev,
      [selectedDateStr]: [...(prev[selectedDateStr] || []), newTask]
    }));
    setNewTaskInput('');
  };

  // Toggle custom task
  const handleToggleCustomTask = (taskId: string) => {
    setCustomTasks((prev) => {
      const currentList = prev[selectedDateStr] || [];
      const updated = currentList.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return { ...prev, [selectedDateStr]: updated };
    });
  };

  // Delete custom task
  const handleDeleteCustomTask = (taskId: string) => {
    setCustomTasks((prev) => {
      const currentList = prev[selectedDateStr] || [];
      const updated = currentList.filter((t) => t.id !== taskId);
      return { ...prev, [selectedDateStr]: updated };
    });
  };

  const todayStr = getISTDateString(new Date());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(20, 20, 26, 0.95) 0%, rgba(30, 30, 42, 0.85) 100%)', border: '1px solid rgba(212, 163, 115, 0.22)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-learning" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CalendarIcon size={12} /> Interactive Day-by-Day Task Calendar
              </span>
              <span style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={13} /> {currentUser.streak} Day Active Streak
              </span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#eae6e1', letterSpacing: '-0.02em', margin: 0 }}>
              Curriculum Task Log & Calendar
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              Click on any day in the calendar to inspect, track, and complete that day's specific tasks, learning topics, and assignments.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleJumpToToday}
              className="btn btn-secondary"
              style={{ padding: '7px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Target size={13} /> Jump to Today
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowCheckInModal(true)}
              style={{ padding: '7px 16px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCircle2 size={14} /> Submit Check-In
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Calendar (Left 60%) + Selected Day Task Inspector (Right 40%) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Interactive Month Calendar */}
        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Calendar Navigation Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#eae6e1', margin: 0 }}>
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                {daysInMonth} Days
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handlePrevMonth}
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#eae6e1', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextMonth}
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#eae6e1', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '4px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 0' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {/* Blank cells for offset before 1st of month */}
            {Array.from({ length: firstDayWeekday }).map((_, idx) => (
              <div
                key={`empty_${idx}`}
                style={{
                  height: '74px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  opacity: 0.2
                }}
              />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayData = getDayData(dateStr);
              const isSelected = selectedDateStr === dateStr;
              const isToday = todayStr === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  style={{
                    height: '74px',
                    borderRadius: '10px',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    background: isSelected
                      ? 'rgba(212, 163, 115, 0.18)'
                      : isToday
                      ? 'rgba(52, 211, 153, 0.1)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected
                      ? '2px solid #d4a373'
                      : isToday
                      ? '1px solid rgba(52, 211, 153, 0.45)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    boxShadow: isSelected
                      ? '0 0 14px rgba(212, 163, 115, 0.35)'
                      : isToday
                      ? '0 0 10px rgba(52, 211, 153, 0.2)'
                      : 'none',
                    transform: isSelected ? 'scale(1.02)' : 'none',
                    zIndex: isSelected ? 5 : 1
                  }}
                >
                  {/* Day Header: Number + Status Dot */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: isSelected || isToday ? 800 : 600,
                        color: isSelected ? '#d4a373' : isToday ? '#34d399' : '#eae6e1',
                        background: isToday ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                        padding: isToday ? '1px 5px' : 0,
                        borderRadius: '4px'
                      }}
                    >
                      {dayNum}
                    </span>

                    {/* Completion Icon or Indicator */}
                    {dayData.isFullyCompleted ? (
                      <CheckCircle2 size={12} color="#34d399" />
                    ) : dayData.dayCheckIn ? (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
                    ) : null}
                  </div>

                  {/* Task Pills / Badges in Calendar Cell */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                    {dayData.assignedTopic && (
                      <div
                        style={{
                          fontSize: '0.58rem',
                          color: '#849c86',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 600
                        }}
                      >
                        {dayData.assignedTopic.name.split(' ')[0]}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
                      {dayData.dayAssignments.length > 0 && (
                        <span style={{ fontSize: '0.54rem', background: 'rgba(212, 163, 115, 0.25)', color: '#d4a373', borderRadius: '3px', padding: '0 3px', fontWeight: 700 }}>
                          PR
                        </span>
                      )}
                      {dayData.dayCustomTasks.length > 0 && (
                        <span style={{ fontSize: '0.54rem', background: 'rgba(255, 255, 255, 0.08)', color: '#eae6e1', borderRadius: '3px', padding: '0 3px' }}>
                          +{dayData.dayCustomTasks.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Color Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
              <span>Completed / Check-In Logged</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1px solid #d4a373', background: 'rgba(212, 163, 115, 0.3)' }} />
              <span>Selected Day</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d4a373' }} />
              <span>Assignment Due</span>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Day Inspector & Task Breakdown */}
        <div className="glass-panel" style={{ padding: '22px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.22)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Selected Date Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#d4a373', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Day {selectedDayData.dayOfMonth} Schedule & Tasks
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#eae6e1', margin: '2px 0 0 0' }}>
                {getISTFullDateString(new Date(selectedDateStr + 'T00:00:00'))}
              </h3>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>
                {selectedDayData.completedItems} of {selectedDayData.totalItems} done
              </span>
              <div style={{ width: '80px', height: '5px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${selectedDayData.totalItems > 0 ? (selectedDayData.completedItems / selectedDayData.totalItems) * 100 : 0}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #d4a373, #34d399)',
                    borderRadius: '3px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 1: Assigned Curriculum Topic & Subtopics */}
          {selectedDayData.assignedTopic && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={15} color="#d4a373" />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1' }}>
                    Phase {selectedDayData.assignedTopic.phaseNumber}: {selectedDayData.assignedTopic.name}
                  </span>
                </div>
                <span className="badge badge-learning" style={{ fontSize: '0.64rem' }}>
                  ~{selectedDayData.assignedTopic.estimatedMinutes} mins
                </span>
              </div>

              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                {selectedDayData.assignedTopic.description}
              </p>

              {/* Subtopics Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                {selectedDayData.subtopics.map((sub) => {
                  const isDone = sub.status === 'completed';
                  return (
                    <div
                      key={sub.id}
                      onClick={() => toggleSubtopic(selectedDayData.assignedTopic.id, sub.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: isDone ? 'rgba(52, 211, 153, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        border: isDone ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isDone ? <CheckSquare size={15} color="#34d399" /> : <Square size={15} color="var(--text-dim)" />}
                        <span style={{ fontSize: '0.78rem', color: isDone ? '#eae6e1' : 'var(--text-muted)', textDecoration: isDone ? 'line-through' : 'none' }}>
                          {sub.name}
                        </span>
                      </div>
                      <span className={`badge badge-${sub.status}`} style={{ fontSize: '0.62rem' }}>
                        {sub.status.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Study Resources */}
              {selectedDayData.assignedTopic.resources.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {selectedDayData.assignedTopic.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: 'rgba(212, 163, 115, 0.12)',
                        border: '1px solid rgba(212, 163, 115, 0.25)',
                        color: '#d4a373',
                        fontSize: '0.7rem',
                        textDecoration: 'none',
                        fontWeight: 600
                      }}
                    >
                      <BookOpen size={11} /> {res.title}
                      <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Assignments & Coding Challenges Due */}
          {selectedDayData.dayAssignments.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Award size={15} color="#d4a373" />
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1' }}>
                  Assignment & PR Due Today
                </span>
              </div>
              {selectedDayData.dayAssignments.map((asgn) => (
                <div
                  key={asgn.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(212, 163, 115, 0.1)',
                    border: '1px solid rgba(212, 163, 115, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#eae6e1', display: 'block' }}>
                      {asgn.title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      Difficulty: {asgn.difficulty} • ~{asgn.expectedMinutes} mins
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                  >
                    View PR Task
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Section 3: Daily Reflection Check-In Status */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} color="#34d399" />
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1' }}>
                  Day Check-In & Reflection
                </span>
              </div>
              {selectedDayData.dayCheckIn ? (
                <span className="badge badge-completed" style={{ fontSize: '0.64rem' }}>
                  Checked In ({selectedDayData.dayCheckIn.timeSpentMinutes} mins)
                </span>
              ) : (
                <button
                  onClick={() => setShowCheckInModal(true)}
                  style={{ background: 'none', border: 'none', color: '#d4a373', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  <Plus size={12} /> Log Check-In
                </button>
              )}
            </div>

            {selectedDayData.dayCheckIn ? (
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong style={{ color: '#eae6e1' }}>Learned:</strong> {selectedDayData.dayCheckIn.whatLearned}</div>
                {selectedDayData.dayCheckIn.confusedAbout && selectedDayData.dayCheckIn.confusedAbout !== 'None' && (
                  <div><strong style={{ color: '#d4a373' }}>Confusion:</strong> {selectedDayData.dayCheckIn.confusedAbout}</div>
                )}
                <div><strong style={{ color: '#34d399' }}>Confidence Score:</strong> {'⭐'.repeat(selectedDayData.dayCheckIn.confidenceScore)} ({selectedDayData.dayCheckIn.confidenceScore}/5)</div>
              </div>
            ) : (
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                No daily check-in logged yet for this date. Click "Log Check-In" to record your study hours and confidence score.
              </div>
            )}
          </div>

          {/* Section 4: Custom Personal Tasks / Day Todos */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1' }}>
                Personal Day Tasks & Custom Goals
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                {selectedDayData.dayCustomTasks.length} items
              </span>
            </div>

            {/* Custom Task List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
              {selectedDayData.dayCustomTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: task.completed ? 'rgba(52, 211, 153, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div
                    onClick={() => handleToggleCustomTask(task.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, minWidth: 0 }}
                  >
                    {task.completed ? <CheckSquare size={14} color="#34d399" /> : <Square size={14} color="var(--text-dim)" />}
                    <span style={{ fontSize: '0.76rem', color: task.completed ? 'var(--text-dim)' : '#eae6e1', textDecoration: task.completed ? 'line-through' : 'none', wordBreak: 'break-word' }}>
                      {task.text}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteCustomTask(task.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                    title="Delete task"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Task Form */}
            <form onSubmit={handleAddCustomTask} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Add custom task (e.g. Read PEP 695)..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                style={{ flex: 1, height: '32px', fontSize: '0.78rem' }}
              />
              <button
                type="submit"
                className="btn btn-secondary"
                style={{ padding: '4px 10px', height: '32px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={13} /> Add
              </button>
            </form>
          </div>

          {/* Section 5: Git Activity on this Date */}
          {selectedDayData.dayCommits.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <GitCommit size={14} color="#849c86" />
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#eae6e1' }}>
                  Git Commits Logged ({selectedDayData.dayCommits.length})
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {selectedDayData.dayCommits.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ color: '#eae6e1', fontFamily: 'monospace' }}>
                      {c.message}
                    </span>
                    <span style={{ color: '#d4a373', fontSize: '0.66rem' }}>
                      {c.branch}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Check-In Modal with Pre-filled Selected Date */}
      <DailyCheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        selectedDate={selectedDateStr}
      />
    </div>
  );
};
