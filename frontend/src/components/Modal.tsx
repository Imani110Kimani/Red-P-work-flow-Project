import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(34,34,34,0.18)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 16px 0 rgba(34,34,34,0.12)',
        padding: 0,
        minWidth: 320,
        maxWidth: 520,
        width: '100%',
        position: 'relative',
      }} onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 10,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 22,
            color: '#e53935',
            cursor: 'pointer',
            zIndex: 2,
          }}
          aria-label="Close"
        >
          &times;
        </button>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
