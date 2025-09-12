import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  getDocs,
  Timestamp,
  writeBatch,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase';
import { Notification, NotificationPreferences, NotificationStats } from '../types/notification';

export class NotificationService {
  private static readonly COLLECTION_NAME = 'notifications';
  private static readonly PREFERENCES_COLLECTION = 'notificationPreferences';

  // Create a new notification
  static async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    try {
      const notificationData = {
        ...notification,
        createdAt: Timestamp.now(),
        readAt: null,
        expiresAt: notification.expiresAt ? Timestamp.fromDate(new Date(notification.expiresAt)) : null
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications for a user with real-time updates
  static subscribeToUserNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void,
    options: {
      includeRead?: boolean;
      includeArchived?: boolean;
      limitCount?: number;
      category?: string;
      priority?: string;
    } = {}
  ): () => void {
    try {
      // Build constraints dynamically to avoid composite index requirements.
      // If multiple filters are applied, we avoid server orderBy and sort client-side.
      const constraints: QueryConstraint[] = [where('userId', '==', userId)];

      if (!options.includeRead) {
        constraints.push(where('isRead', '==', false));
      }

      if (!options.includeArchived) {
        constraints.push(where('isArchived', '==', false));
      }

      if (options.category) {
        constraints.push(where('category', '==', options.category));
      }

      if (options.priority) {
        constraints.push(where('priority', '==', options.priority));
      }

      // Minimal mode (only userId filter): we can safely orderBy on server without composite index.
      const minimalFilterCount = 1; // only userId
      const hasMinimalFilters = constraints.length === minimalFilterCount;

      if (hasMinimalFilters) {
        constraints.push(orderBy('createdAt', 'desc'));
        if (options.limitCount) constraints.push(limit(options.limitCount));
      } else {
        // No server-side orderBy to avoid composite index; we will sort locally.
        if (options.limitCount) constraints.push(limit(options.limitCount * 3));
      }

      const q = query(collection(db, this.COLLECTION_NAME), ...constraints);

      return onSnapshot(q, 
        (snapshot) => {
          try {
            let notifications: Notification[] = snapshot.docs.map(docSnapshot => ({
              id: docSnapshot.id,
              ...docSnapshot.data(),
              createdAt: docSnapshot.data().createdAt?.toDate?.()?.toISOString() || docSnapshot.data().createdAt,
              updatedAt: docSnapshot.data().updatedAt?.toDate?.()?.toISOString() || docSnapshot.data().updatedAt
            } as unknown)) as Notification[];

            // Client-side sorting if we couldn't use server-side orderBy
            if (!hasMinimalFilters) {
              notifications = notifications
                .sort((a, b) => {
                  const ta = new Date(a.createdAt).getTime();
                  const tb = new Date(b.createdAt).getTime();
                  return tb - ta;
                })
                .slice(0, options.limitCount || notifications.length);
            }

            callback(notifications);
          } catch (processingError) {
            console.error('Erreur lors du traitement des données des notifications:', processingError);
            callback([]); // Fallback avec tableau vide
          }
        },
        (error) => {
          console.error('Erreur Firestore lors de l\'écoute des notifications:', error);
          if (error.code === 'permission-denied') {
            console.warn('Permissions insuffisantes pour écouter les notifications');
          } else if (error.code === 'unavailable') {
            console.warn('Service Firestore temporairement indisponible');
          } else if (error.code === 'failed-precondition') {
            console.warn('[Notifications] Cette requête nécessite un index Firestore composite. Ouvrez le lien fourni dans l\'erreur pour le créer.');
          }
          callback([]); // Fallback avec tableau vide
        }
      );
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, this.COLLECTION_NAME, notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark multiple notifications as read
  static async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      notificationIds.forEach(id => {
        const notificationRef = doc(db, this.COLLECTION_NAME, id);
        batch.update(notificationRef, {
          isRead: true,
          readAt: Timestamp.now()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
      throw error;
    }
  }

  // Archive notification
  static async archiveNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, this.COLLECTION_NAME, notificationId);
      await updateDoc(notificationRef, {
        isArchived: true
      });
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, this.COLLECTION_NAME, notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get notification statistics
  static async getNotificationStats(userId: string): Promise<NotificationStats> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('isArchived', '==', false)
      );

      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => doc.data() as Notification);

      const stats: NotificationStats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length,
        byCategory: {},
        byPriority: {},
        byType: {}
      };

      notifications.forEach(notification => {
        // By category
        stats.byCategory[notification.category] = (stats.byCategory[notification.category] || 0) + 1;
        
        // By priority
        stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
        
        // By type
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }

  // User preferences management
  static async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const q = query(
        collection(db, this.PREFERENCES_COLLECTION),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString()
      } as NotificationPreferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  static async updateUserPreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      const q = query(
        collection(db, this.PREFERENCES_COLLECTION),
        where('userId', '==', preferences.userId)
      );

      const snapshot = await getDocs(q);
      const preferencesData = {
        ...preferences,
        updatedAt: Timestamp.now()
      };

      if (snapshot.empty) {
        // Create new preferences
        await addDoc(collection(db, this.PREFERENCES_COLLECTION), preferencesData);
      } else {
        // Update existing preferences
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, preferencesData);
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Utility methods for creating specific notification types
  static async createProjectNotification(
    userId: string,
    projectId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<string> {
    return this.createNotification({
      title,
      message,
      type,
      category: 'project',
      priority,
      userId,
      projectId,
      isRead: false,
      isArchived: false,
      actionUrl: `/projects/${projectId}`,
      actionLabel: 'Voir le projet'
    });
  }

  static async createPaymentNotification(
    userId: string,
    paymentId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<string> {
    return this.createNotification({
      title,
      message,
      type,
      category: 'payment',
      priority,
      userId,
      relatedEntityId: paymentId,
      relatedEntityType: 'payment',
      isRead: false,
      isArchived: false,
      actionUrl: '/payments',
      actionLabel: 'Voir les paiements'
    });
  }

  static async createEquipmentNotification(
    userId: string,
    equipmentId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<string> {
    return this.createNotification({
      title,
      message,
      type,
      category: 'equipment',
      priority,
      userId,
      relatedEntityId: equipmentId,
      relatedEntityType: 'equipment',
      isRead: false,
      isArchived: false,
      actionUrl: '/equipment',
      actionLabel: 'Voir les équipements'
    });
  }

  static async createLocationNotification(
    userId: string,
    locationId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<string> {
    return this.createNotification({
      title,
      message,
      type,
      category: 'location',
      priority,
      userId,
      relatedEntityId: locationId,
      relatedEntityType: 'location',
      isRead: false,
      isArchived: false,
      actionUrl: '/locations',
      actionLabel: 'Voir les localisations'
    });
  }

  // Clean up expired notifications
  static async cleanupExpiredNotifications(): Promise<void> {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('expiresAt', '<=', now)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Cleaned up ${snapshot.docs.length} expired notifications`);
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  }
}
