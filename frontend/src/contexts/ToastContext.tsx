import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: number;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, { id, message, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            minWidth: 220,
            background: t.type === 'success' ? '#43a047' : t.type === 'error' ? '#e53935' : '#444',
            color: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px 0 rgba(34,34,34,0.13)',
            padding: '14px 22px',
            fontWeight: 700,
            fontSize: '1.05em',
            letterSpacing: 0.2,
            opacity: 0.97,
            transition: 'all 0.3s',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            {t.type === 'success' && <span role="img" aria-label="success">✅</span>}
            {t.type === 'error' && <span role="img" aria-label="error">❌</span>}
            {t.type === 'info' && <span role="img" aria-label="info">ℹ️</span>}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
