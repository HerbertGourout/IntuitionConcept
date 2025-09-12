export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'project' | 'payment' | 'equipment' | 'team' | 'system' | 'location';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: string;
  projectId?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'task' | 'payment' | 'equipment' | 'purchase_order' | 'location';
  isRead: boolean;
  isArchived: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  categories: {
    project: boolean;
    payment: boolean;
    equipment: boolean;
    team: boolean;
    system: boolean;
    location: boolean;
  };
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
}
