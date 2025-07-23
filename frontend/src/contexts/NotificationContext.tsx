import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Notification = {
  id: number;
  message: string;
  type?: 'info' | 'success' | 'error';
  timestamp: Date;
};

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: 'info' | 'success' | 'error') => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotifications(prev => [
      { id: Date.now(), message, type, timestamp: new Date() },
      ...prev.slice(0, 19) // keep only last 20
    ]);
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
