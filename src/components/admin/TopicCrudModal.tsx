import React, { useState, useEffect } from 'react';
import { useLTrack } from '../../context/LTrackContext';
import type { Topic } from '../../types/ltrack';
import { Layers, Plus, Trash2, X } from 'lucide-react';

interface TopicCrudModalProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TopicCrudModal: React.FC<TopicCrudModalProps> = ({ topic, isOpen, onClose }) => {
  const { createTopic, updateTopic, deleteTopic } = useLTrack();

  const [name, setName] = useState('');
  const [phaseNumber, setPhaseNumber] = useState(1);
  const [category, setCategory] = useState('Python');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(300);
  const [subtopics, setSubtopics] = useState<{ id: string; name: string; status: 'not_started' | 'learning' | 'completed' }[]>([]);
  const [newSubtopicName, setNewSubtopicName] = useState('');

  useEffect(() => {
    if (topic) {
      setName(topic.name);
      setPhaseNumber(topic.phaseNumber);
      setCategory(topic.category);
      setDescription(topic.description);
      setEstimatedMinutes(topic.estimatedMinutes);
      setSubtopics(topic.subtopics);
    } else {
      setName('');
      setPhaseNumber(14);
      setCategory('FastAPI');
      setDescription('');
      setEstimatedMinutes(240);
      setSubtopics([]);
    }
  }, [topic, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtopic = () => {
    if (!newSubtopicName.trim()) return;
    setSubtopics([
      ...subtopics,
      { id: `sub_${Date.now()}`, name: newSubtopicName.trim(), status: 'not_started' }
    ]);
    setNewSubtopicName('');
  };

  const handleRemoveSubtopic = (id: string) => {
    setSubtopics(subtopics.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (topic) {
      updateTopic(topic.id, {
        name,
        phaseNumber: Number(phaseNumber),
        category,
        description,
        estimatedMinutes: Number(estimatedMinutes),
        subtopics
      });
    } else {
      createTopic({
        name,
        phaseNumber: Number(phaseNumber),
        category,
        description,
        status: 'not_started',
        estimatedMinutes: Number(estimatedMinutes),
        subtopics,
        prerequisites: [],
        resources: []
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!topic) return;
    if (confirm(`Are you sure you want to delete "${topic.name}" from the syllabus?`)) {
      deleteTopic(topic.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={22} color="#d4a373" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#eae6e1' }}>
              {topic ? 'Edit Syllabus Topic' : 'Add New Syllabus Topic'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Topic Title
            </label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Model Context Protocol (MCP) Server Architecture"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Phase Number
              </label>
              <input
                type="number"
                className="form-control"
                value={phaseNumber}
                onChange={(e) => setPhaseNumber(Number(e.target.value))}
                min={1}
                max={30}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Category
              </label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {['Python', 'HTTP', 'REST', 'FastAPI', 'PostgreSQL', 'Auth', 'ML', 'AI', 'RAG', 'MCP', 'Agentic AI', 'Docker', 'CI/CD'].map((cat) => (
                  <option key={cat} value={cat} style={{ background: '#1c1c1c' }}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Est. Minutes
              </label>
              <input
                type="number"
                className="form-control"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                min={30}
                step={30}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Description & Learning Objectives
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What core competencies will members master in this topic?"
              required
            />
          </div>

          {/* Subtopics Checklist Manager */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Subtopic Checklist ({subtopics.length})
            </label>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                className="form-control"
                value={newSubtopicName}
                onChange={(e) => setNewSubtopicName(e.target.value)}
                placeholder="Add subtopic concept..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtopic();
                  }
                }}
              />
              <button type="button" className="btn btn-secondary" onClick={handleAddSubtopic} style={{ flexShrink: 0 }}>
                <Plus size={16} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
              {subtopics.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#222222',
                    fontSize: '0.82rem',
                    color: '#eae6e1'
                  }}
                >
                  <span>• {sub.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtopic(sub.id)}
                    style={{ background: 'none', border: 'none', color: '#c47662', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            {topic ? (
              <button type="button" onClick={handleDelete} className="btn" style={{ background: 'rgba(196, 118, 98, 0.15)', color: '#c47662', border: '1px solid rgba(196, 118, 98, 0.3)', padding: '8px 14px' }}>
                <Trash2 size={15} /> Delete Topic
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {topic ? 'Save Changes' : 'Create Topic'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
