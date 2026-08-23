import React, { useState, useEffect } from 'react';
import { useLTrack } from '../../context/LTrackContext';
import type { Assignment } from '../../types/ltrack';
import { FileCode, Trash2, X } from 'lucide-react';

interface AssignmentCrudModalProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AssignmentCrudModal: React.FC<AssignmentCrudModalProps> = ({ assignment, isOpen, onClose }) => {
  const { topics, createAssignment, updateAssignment, deleteAssignment } = useLTrack();

  const [title, setTitle] = useState('');
  const [topicId, setTopicId] = useState(topics[0]?.id || 'top_1');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [deadline, setDeadline] = useState('2026-08-30');
  const [expectedMinutes, setExpectedMinutes] = useState(60);
  const [description, setDescription] = useState('');
  const [requiredGithub, setRequiredGithub] = useState(true);

  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title);
      setTopicId(assignment.topicId);
      setDifficulty(assignment.difficulty);
      setDeadline(assignment.deadline);
      setExpectedMinutes(assignment.expectedMinutes);
      setDescription(assignment.description);
      setRequiredGithub(assignment.requiredGithub);
    } else {
      setTitle('');
      setTopicId(topics[0]?.id || 'top_1');
      setDifficulty('Medium');
      setDeadline('2026-08-30');
      setExpectedMinutes(60);
      setDescription('');
      setRequiredGithub(true);
    }
  }, [assignment, isOpen, topics]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (assignment) {
      updateAssignment(assignment.id, {
        title,
        topicId,
        difficulty,
        deadline,
        expectedMinutes: Number(expectedMinutes),
        description,
        requiredGithub
      });
    } else {
      createAssignment({
        title,
        topicId,
        difficulty,
        deadline,
        expectedMinutes: Number(expectedMinutes),
        description,
        requiredGithub
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!assignment) return;
    if (confirm(`Are you sure you want to delete assignment "${assignment.title}"?`)) {
      deleteAssignment(assignment.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCode size={22} color="#d4a373" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#eae6e1' }}>
              {assignment ? 'Edit Assignment' : 'Create New Assignment'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Assignment Title
            </label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build an Asynchronous User Auth API with JWT & Tests"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Linked Topic
              </label>
              <select
                className="form-control"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id} style={{ background: '#1c1c1c' }}>
                    Phase {t.phaseNumber}: {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Difficulty
              </label>
              <select
                className="form-control"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
              >
                <option value="Easy" style={{ background: '#1c1c1c' }}>Easy</option>
                <option value="Medium" style={{ background: '#1c1c1c' }}>Medium</option>
                <option value="Hard" style={{ background: '#1c1c1c' }}>Hard</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Submission Deadline
              </label>
              <input
                type="date"
                className="form-control"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Expected Time (Mins)
              </label>
              <input
                type="number"
                className="form-control"
                value={expectedMinutes}
                onChange={(e) => setExpectedMinutes(Number(e.target.value))}
                min={15}
                step={15}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Assignment Brief & Acceptance Criteria
            </label>
            <textarea
              className="form-control"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the problem statement, testing requirements, and submission instructions."
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="reqGithub"
              checked={requiredGithub}
              onChange={(e) => setRequiredGithub(e.target.checked)}
            />
            <label htmlFor="reqGithub" style={{ fontSize: '0.85rem', color: '#eae6e1', cursor: 'pointer' }}>
              Require verified GitHub Pull Request link for submission
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            {assignment ? (
              <button type="button" onClick={handleDelete} className="btn" style={{ background: 'rgba(196, 118, 98, 0.15)', color: '#c47662', border: '1px solid rgba(196, 118, 98, 0.3)', padding: '8px 14px' }}>
                <Trash2 size={15} /> Delete
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {assignment ? 'Save Changes' : 'Publish Assignment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
