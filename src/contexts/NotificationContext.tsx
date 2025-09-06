import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification, NotificationPreferences, NotificationStats } from '../types/notification';
import { NotificationService } from '../services/NotificationService';
import { useAuth } from './AuthContext';
import { message } from 'antd';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  stats: NotificationStats | null;
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  
  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  updatePreferences: (preferences: NotificationPreferences) => Promise<void>;
  refreshStats: () => Promise<void>;
  
  // Filters
  filterCategory: string | null;
  filterPriority: string | null;
  showRead: boolean;
  setFilterCategory: (category: string | null) => void;
  setFilterPriority: (priority: string | null) => void;
  setShowRead: (show: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filters
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [showRead, setShowRead] = useState(false);

  // Computed values
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const userPreferences = await NotificationService.getUserPreferences(user.uid);
      if (userPreferences) {
        setPreferences(userPreferences);
      } else {
        // Create default preferences
        const defaultPreferences: NotificationPreferences = {
          userId: user.uid,
          emailNotifications: true,
          pushNotifications: true,
          categories: {
            project: true,
            payment: true,
            equipment: true,
            team: true,
            system: true,
            location: true
          },
          priorities: {
            low: true,
            medium: true,
            high: true,
            urgent: true
          },
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00'
          },
          updatedAt: new Date().toISOString()
        };
        
        await NotificationService.updateUserPreferences(defaultPreferences);
        setPreferences(defaultPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      message.error('Erreur lors du chargement des préférences');
    }
  }, [user?.uid]);

  // Load notification stats
  const refreshStats = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const notificationStats = await NotificationService.getNotificationStats(user.uid);
      setStats(notificationStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [user?.uid]);

  // Subscribe to notifications
  useEffect(() => {
    if (!user?.uid) return;

    setIsLoading(true);

    const unsubscribe = NotificationService.subscribeToUserNotifications(
      user.uid,
      (newNotifications) => {
        setNotifications(newNotifications);
        setIsLoading(false);
      },
      {
        includeRead: showRead,
        includeArchived: false,
        category: filterCategory || undefined,
        priority: filterPriority || undefined
      }
    );

    return unsubscribe;
  }, [user?.uid, showRead, filterCategory, filterPriority]);

  // Load preferences and stats on mount
  useEffect(() => {
    if (user?.uid) {
      loadPreferences();
      refreshStats();
    }
  }, [user?.uid, loadPreferences, refreshStats]);

  // Actions
  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      message.success('Notification marquée comme lue');
      refreshStats();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      message.error('Erreur lors de la mise à jour');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      if (unreadIds.length === 0) {
        message.info('Aucune notification non lue');
        return;
      }

      await NotificationService.markMultipleAsRead(unreadIds);
      message.success(`${unreadIds.length} notifications marquées comme lues`);
      refreshStats();
    } catch (error) {
      console.error('Error marking all as read:', error);
      message.error('Erreur lors de la mise à jour');
    }
  };

  const archiveNotification = async (notificationId: string) => {
    try {
      await NotificationService.archiveNotification(notificationId);
      message.success('Notification archivée');
      refreshStats();
    } catch (error) {
      console.error('Error archiving notification:', error);
      message.error('Erreur lors de l\'archivage');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      message.success('Notification supprimée');
      refreshStats();
    } catch (error) {
      console.error('Error deleting notification:', error);
      message.error('Erreur lors de la suppression');
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await NotificationService.updateUserPreferences(newPreferences);
      setPreferences(newPreferences);
      message.success('Préférences mises à jour');
    } catch (error) {
      console.error('Error updating preferences:', error);
      message.error('Erreur lors de la mise à jour des préférences');
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    stats,
    preferences,
    isLoading,
    
    // Actions
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    updatePreferences,
    refreshStats,
    
    // Filters
    filterCategory,
    filterPriority,
    showRead,
    setFilterCategory,
    setFilterPriority,
    setShowRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
