import React, { useState } from 'react';
import { useLTrack } from '../context/LTrackContext';
import { useDebounce } from '../hooks/useDebounce';
import { FormattedText } from '../components/FormattedText';
import type { Assignment, Submission } from '../types/ltrack';
import { SubmitAssignmentModal, GradeAssignmentModal } from '../components/AssignmentModal';
import {
  FileCode,
  Clock,
  Send,
  Award,
  Search,
  X,
  Star,
  ExternalLink,
  CheckCircle2,
  Filter
} from 'lucide-react';

export const AssignmentsView: React.FC = () => {
  const { assignments, submissions, currentUser, members } = useLTrack();

  const [selectedAsgnToSubmit, setSelectedAsgnToSubmit] = useState<Assignment | null>(null);
  const [selectedSubmToGrade, setSelectedSubmToGrade] = useState<Submission | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'submitted' | 'evaluated'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 200);

  // Compute accurate filter counts
  const isAdmin = currentUser.role === 'admin';

  const countAll = assignments.length;

  const countSubmitted = isAdmin
    ? assignments.filter((a) => submissions.some((s) => s.assignmentId === a.id)).length
    : assignments.filter((a) => submissions.some((s) => s.assignmentId === a.id && s.userId === currentUser.id)).length;

  const countEvaluated = isAdmin
    ? assignments.filter((a) => submissions.some((s) => s.assignmentId === a.id && s.status === 'evaluated')).length
    : assignments.filter((a) => submissions.some((s) => s.assignmentId === a.id && s.userId === currentUser.id && s.status === 'evaluated')).length;

  const filteredAssignments = assignments.filter((a) => {
    // 1. Search Query Filter
    const matchesSearch =
      a.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      a.description.toLowerCase().includes(debouncedSearch.toLowerCase());

    // 2. Difficulty Filter
    const matchesDifficulty = difficultyFilter === 'all' || a.difficulty === difficultyFilter;

    // 3. Status Filter (Accurate based on Admin / Learner context)
    let matchesStatus = true;
    if (isAdmin) {
      const hasAnySubmission = submissions.some((s) => s.assignmentId === a.id);
      const hasEvaluatedSubmission = submissions.some((s) => s.assignmentId === a.id && s.status === 'evaluated');
      if (activeFilter === 'submitted') matchesStatus = hasAnySubmission;
      else if (activeFilter === 'evaluated') matchesStatus = hasEvaluatedSubmission;
    } else {
      const mySub = submissions.find((s) => s.assignmentId === a.id && s.userId === currentUser.id);
      if (activeFilter === 'submitted') matchesStatus = !!mySub;
      else if (activeFilter === 'evaluated') matchesStatus = !!mySub && mySub.status === 'evaluated';
    }

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* 1. Header & High-Visibility Filter Bar */}
      <div className="glass-panel" style={{ padding: '18px 24px', background: 'rgba(20, 20, 26, 0.85)', border: '1px solid rgba(212, 163, 115, 0.16)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <FileCode size={22} color="#d4a373" />
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#eae6e1' }}>
                GitHub PR Coding Assignments Hub
              </h1>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Submit feature branch PRs, get peer reviews with automated score diagnostics, and track mastery grades.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Debounced Search */}
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search assignments..."
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
        </div>

        {/* High-Visibility Filter Switchers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
          {/* Difficulty Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Filter size={12} color="#d4a373" /> Difficulty:
            </span>
            {[
              { id: 'all', label: 'All Difficulties' },
              { id: 'Easy', label: 'Easy' },
              { id: 'Medium', label: 'Medium' },
              { id: 'Hard', label: 'Hard' }
            ].map((diff) => {
              const isSelected = difficultyFilter === diff.id;
              return (
                <button
                  key={diff.id}
                  onClick={() => setDifficultyFilter(diff.id as any)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: isSelected ? '#d4a373' : 'rgba(255, 255, 255, 0.12)',
                    background: isSelected ? 'rgba(212, 163, 115, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? '#d4a373' : '#eae6e1',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(212, 163, 115, 0.25)' : 'none'
                  }}
                >
                  {diff.label}
                </button>
              );
            })}
          </div>

          {/* Submission Status Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Assignments (${countAll})` },
              { id: 'submitted', label: `${isAdmin ? 'Has Submissions' : 'My Submitted'} (${countSubmitted})` },
              { id: 'evaluated', label: `${isAdmin ? 'Graded' : 'Evaluated'} (${countEvaluated})` }
            ].map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: isSelected ? '#849c86' : 'rgba(255, 255, 255, 0.12)',
                    background: isSelected ? 'rgba(132, 156, 134, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? '#a4bfa6' : '#eae6e1',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(132, 156, 134, 0.25)' : 'none'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2-Per-Row Grid Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '0.9rem', background: 'rgba(20, 20, 26, 0.5)', borderRadius: '16px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
          No assignments found matching your filter criteria.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '20px',
          alignItems: 'stretch'
        }}>
          {filteredAssignments.map((asgn) => {
            const mySubmission = submissions.find((s) => s.assignmentId === asgn.id && s.userId === currentUser.id);
            const allSubmissionsForAsgn = submissions.filter((s) => s.assignmentId === asgn.id);

            return (
              <div
                key={asgn.id}
                className="glass-panel"
                style={{
                  padding: '22px',
                  background: 'rgba(20, 20, 26, 0.85)',
                  border: '1px solid rgba(212, 163, 115, 0.16)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  height: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {/* Top Half: Meta, Title, Description, & Submit Action */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${asgn.difficulty === 'Easy' ? 'completed' : 'learning'}`} style={{ fontSize: '0.68rem' }}>
                        {asgn.difficulty} Difficulty
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {asgn.expectedMinutes} mins
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                        • Due {asgn.deadline}
                      </span>
                    </div>

                    {/* Status Badge or Submit PR Button */}
                    <div>
                      {mySubmission ? (
                        <div style={{ textAlign: 'right' }}>
                          <span className={`badge badge-${mySubmission.status === 'evaluated' ? 'completed' : 'learning'}`} style={{ fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {mySubmission.status === 'evaluated' ? (
                              <>
                                <CheckCircle2 size={12} color="#34d399" /> Graded {mySubmission.evaluation?.overallScore}/10
                              </>
                            ) : (
                              <>
                                <Clock size={12} color="#d4a373" /> Awaiting Review
                              </>
                            )}
                          </span>
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => setSelectedAsgnToSubmit(asgn)}
                          style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Send size={13} /> Submit PR
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#eae6e1', marginBottom: '6px', lineHeight: 1.3 }}>
                    {asgn.title}
                  </h3>

                  <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
                    <FormattedText text={asgn.description} />
                  </p>

                  {mySubmission && (
                    <div style={{ marginBottom: '8px' }}>
                      <a
                        href={mySubmission.githubPr}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.76rem', color: '#d4a373', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}
                      >
                        <span>View My Pull Request</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Bottom Half: Team Submissions */}
                {allSubmissionsForAsgn.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Team Submissions ({allSubmissionsForAsgn.length})
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {allSubmissionsForAsgn.map((sub) => {
                        const submitter = members.find((m) => m.id === sub.userId);
                        return (
                          <div
                            key={sub.id}
                            style={{
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img
                                src={submitter?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                alt={submitter?.name}
                                style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <div>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#eae6e1', margin: 0 }}>
                                  {submitter?.name || 'Teammate'}
                                </h4>
                                <a
                                  href={sub.githubPr}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ fontSize: '0.72rem', color: '#d4a373', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                >
                                  PR Link <ExternalLink size={10} />
                                </a>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {sub.status === 'evaluated' ? (
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#a4bfa6', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    Score: {sub.evaluation?.overallScore}/10 <Star size={11} fill="#fbbf24" color="#fbbf24" />
                                  </span>
                                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
                                    by {sub.evaluation?.gradedBy}
                                  </span>
                                </div>
                              ) : (
                                <button
                                  className="btn btn-secondary"
                                  onClick={() => setSelectedSubmToGrade(sub)}
                                  style={{ padding: '4px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Award size={13} /> Grade
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedAsgnToSubmit && (
        <SubmitAssignmentModal
          assignment={selectedAsgnToSubmit}
          onClose={() => setSelectedAsgnToSubmit(null)}
        />
      )}

      {selectedSubmToGrade && (
        <GradeAssignmentModal
          submission={selectedSubmToGrade}
          onClose={() => setSelectedSubmToGrade(null)}
        />
      )}
    </div>
  );
};
