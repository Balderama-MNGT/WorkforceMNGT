import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { notificationService } from '../services/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    notificationService.getAll()
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback(async (id) => {
    try {
      const updated = await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, ...updated } : n));
    } catch {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, []);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification, deleteNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
