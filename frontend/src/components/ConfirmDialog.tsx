import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(34,34,34,0.18)',
  zIndex: 3000,
};

const dialogStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 16px 0 rgba(229,57,53,0.13)',
  zIndex: 3001,
  minWidth: 320,
  padding: '2rem 2.2rem 1.5rem 2.2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <>
      <div style={overlayStyle} onClick={onCancel} />
      <div style={dialogStyle} role="dialog" aria-modal="true">
        {title && <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#e53935', marginBottom: 10 }}>{title}</div>}
        <div style={{ marginBottom: 22, color: '#444', fontSize: '1.05em', textAlign: 'center' }}>{message}</div>
        <div style={{ display: 'flex', gap: 18 }}>
          <button onClick={onCancel} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 6, padding: '8px 22px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 22px', fontWeight: 700, cursor: 'pointer' }}>Confirm</button>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;
