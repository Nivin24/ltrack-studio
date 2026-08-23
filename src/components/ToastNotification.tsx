import React from 'react';
import { Sparkles, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: '#1e1e1e',
      border: '1px solid #d4a373',
      borderRadius: '12px',
      padding: '14px 20px',
      color: '#eae6e1',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 1000,
      animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(212, 163, 115, 0.2)', color: '#d4a373', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Sparkles size={16} />
      </div>
      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '8px' }}>
        <X size={16} />
      </button>
    </div>
  );
};
