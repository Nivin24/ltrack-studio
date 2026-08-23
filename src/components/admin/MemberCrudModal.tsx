import React, { useState, useEffect } from 'react';
import { useLTrack } from '../../context/LTrackContext';
import type { User, Role } from '../../types/ltrack';
import { UserPlus, Trash2, X } from 'lucide-react';

interface MemberCrudModalProps {
  member: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MemberCrudModal: React.FC<MemberCrudModalProps> = ({ member, isOpen, onClose }) => {
  const { createMember, updateMember, deleteMember } = useLTrack();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [github, setGithub] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const [currentPhase, setCurrentPhase] = useState('Phase 1: Python Advanced OOP');
  const [targetHoursPerWeek, setTargetHoursPerWeek] = useState(8);
  const [bio, setBio] = useState('Learning backend & AI engineering.');

  useEffect(() => {
    if (member) {
      setName(member.name);
      setEmail(member.email);
      setGithub(member.github);
      setRole(member.role);
      setAvatar(member.avatar);
      setCurrentPhase(member.currentPhase);
      setTargetHoursPerWeek(member.targetHoursPerWeek);
      setBio(member.bio || '');
    } else {
      setName('');
      setEmail('');
      setGithub('');
      setRole('member');
      setAvatar('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');
      setCurrentPhase('Phase 1: Python Advanced OOP');
      setTargetHoursPerWeek(8);
      setBio('');
    }
  }, [member, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (member) {
      updateMember(member.id, {
        name,
        email,
        github,
        role,
        avatar,
        currentPhase,
        targetHoursPerWeek: Number(targetHoursPerWeek),
        bio
      });
    } else {
      createMember({
        name,
        email,
        github,
        role,
        avatar,
        currentPhase,
        targetHoursPerWeek: Number(targetHoursPerWeek),
        bio
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!member) return;
    if (confirm(`Are you sure you want to remove "${member.name}" from the group?`)) {
      deleteMember(member.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserPlus size={22} color="#d4a373" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#eae6e1' }}>
              {member ? 'Edit Member Profile' : 'Add New Group Learner'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                GitHub Username
              </label>
              <input
                type="text"
                className="form-control"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="alex-dev"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Role
              </label>
              <select
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="member" style={{ background: '#1c1c1c' }}>Learner (Member)</option>
                <option value="admin" style={{ background: '#1c1c1c' }}>Coordinator (Admin)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Target Commitment
              </label>
              <input
                type="number"
                className="form-control"
                value={targetHoursPerWeek}
                onChange={(e) => setTargetHoursPerWeek(Number(e.target.value))}
                min={2}
                max={40}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Current Syllabus Phase
            </label>
            <input
              type="text"
              className="form-control"
              value={currentPhase}
              onChange={(e) => setCurrentPhase(e.target.value)}
              placeholder="e.g. Phase 4: FastAPI Dependency Injection"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Avatar URL
            </label>
            <input
              type="url"
              className="form-control"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            {member ? (
              <button type="button" onClick={handleDelete} className="btn" style={{ background: 'rgba(196, 118, 98, 0.15)', color: '#c47662', border: '1px solid rgba(196, 118, 98, 0.3)', padding: '8px 14px' }}>
                <Trash2 size={15} /> Remove Member
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {member ? 'Save Changes' : 'Add Learner'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
