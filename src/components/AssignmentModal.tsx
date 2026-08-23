import React, { useState } from 'react';
import { useLTrack } from '../context/LTrackContext';
import type { Assignment, Submission } from '../types/ltrack';
import { X, Send, Award, GitPullRequest, Code, FileText } from 'lucide-react';

interface SubmitModalProps {
  assignment: Assignment | null;
  onClose: () => void;
}

export const SubmitAssignmentModal: React.FC<SubmitModalProps> = ({ assignment, onClose }) => {
  const { addSubmission } = useLTrack();

  const [githubPr, setGithubPr] = useState('');
  const [branch, setBranch] = useState('feature/assignment-impl');
  const [notes, setNotes] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');

  if (!assignment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSubmission({
      assignmentId: assignment.id,
      githubPr: githubPr || 'https://github.com/group-ltrack/repo/pull/12',
      branch,
      notes: notes || 'Completed core assignment implementation.',
      codeSnippet: codeSnippet || '# Implementation code snippet'
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#eae6e1' }}>Submit Assignment</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{assignment.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              <GitPullRequest size={14} style={{ display: 'inline', marginRight: '4px' }} />
              GitHub Pull Request URL
            </label>
            <input
              type="url"
              className="form-control"
              placeholder="https://github.com/user/ltrack/pull/1"
              value={githubPr}
              onChange={(e) => setGithubPr(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Git Branch Name
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="feature/jwt-auth"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              <FileText size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Implementation Notes & Summary
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Briefly explain your architectural decisions and approach..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              <Code size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Key Code Snippet (Python / FastAPI)
            </label>
            <textarea
              className="form-control"
              rows={4}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
              placeholder="async def get_current_user(...):"
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Send size={16} /> Submit Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface GradeModalProps {
  submission: Submission | null;
  onClose: () => void;
}

export const GradeAssignmentModal: React.FC<GradeModalProps> = ({ submission, onClose }) => {
  const { gradeSubmission, members, assignments } = useLTrack();

  const [codeQuality, setCodeQuality] = useState(8);
  const [understanding, setUnderstanding] = useState(9);
  const [testing, setTesting] = useState(7);
  const [documentation, setDocumentation] = useState(8);
  const [feedback, setFeedback] = useState('Great clean code! Good async dependency separation.');

  if (!submission) return null;

  const student = members.find((m) => m.id === submission.userId);
  const asgn = assignments.find((a) => a.id === submission.assignmentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    gradeSubmission(submission.id, {
      codeQuality,
      understanding,
      testing,
      documentation,
      feedback
    });
    onClose();
  };

  const calculatedOverall = (
    (codeQuality + understanding + testing + documentation) / 4
  ).toFixed(1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '650px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#eae6e1' }}>
              Evaluate Code Submission
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Student: <strong style={{ color: '#d4a373' }}>{student?.name}</strong> • {asgn?.title}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* PR & Code View */}
        <div className="glass-panel" style={{ padding: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
          <div style={{ marginBottom: '6px' }}>
            <strong style={{ color: 'var(--text-muted)' }}>PR Link: </strong>
            <a href={submission.githubPr} target="_blank" rel="noreferrer" style={{ color: '#d4a373' }}>
              {submission.githubPr}
            </a>
          </div>
          <div style={{ marginBottom: '6px' }}>
            <strong style={{ color: 'var(--text-muted)' }}>Notes: </strong> {submission.notes}
          </div>
          {submission.codeSnippet && (
            <pre style={{ maxHeight: '140px', overflowY: 'auto', marginTop: '6px' }}>
              {submission.codeSnippet}
            </pre>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Multi-Axis Score Sliders */}
          {[
            { label: 'Code Quality', val: codeQuality, setter: setCodeQuality },
            { label: 'Conceptual Understanding', val: understanding, setter: setUnderstanding },
            { label: 'Testing & Edge Cases', val: testing, setter: setTesting },
            { label: 'Documentation & Cleanliness', val: documentation, setter: setDocumentation }
          ].map((item, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: '#eae6e1', marginBottom: '4px' }}>
                <span>{item.label}</span>
                <span style={{ color: '#d4a373' }}>{item.val} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={item.val}
                onChange={(e) => item.setter(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#d4a373', cursor: 'pointer' }}
              />
            </div>
          ))}

          {/* Overall Score Preview */}
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(212, 163, 115, 0.15)', border: '1px solid rgba(212, 163, 115, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#d4a373', fontSize: '0.9rem' }}>Calculated Overall Score</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#d4a373' }}>{calculatedOverall} / 10</span>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Feedback & Recommendations
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent">
              <Award size={16} /> Grade & Save Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
