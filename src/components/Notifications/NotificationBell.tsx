import React, { useState } from 'react';
import { Bell, BellRing, Check, Archive, Trash2, Settings, Filter } from 'lucide-react';
import { Badge, Dropdown, Button, Spin, Empty, Switch } from 'antd';
import { useNotifications } from '../../contexts/NotificationContext';
import { Notification } from '../../types/notification';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    archiveNotification,
    deleteNotification,
    markAllAsRead,
    filterCategory,
    filterPriority,
    showRead,
    setFilterCategory,
    setFilterPriority,
    setShowRead
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'project':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'equipment':
        return 'bg-yellow-100 text-yellow-800';
      case 'team':
        return 'bg-purple-100 text-purple-800';
      case 'location':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // Navigate to the action URL
      window.location.href = notification.actionUrl;
    }
  };

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
    <div
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getNotificationIcon(notification.type)}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notification.category)}`}>
              {notification.category}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
              {notification.priority}
            </span>
          </div>
          
          <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
            {notification.title}
          </h4>
          
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(notification.createdAt), { 
                addSuffix: true, 
                locale: fr 
              })}
            </span>
            
            {notification.actionLabel && (
              <span className="text-xs text-blue-600 font-medium">
                {notification.actionLabel}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          {!notification.isRead && (
            <Button
              type="text"
              size="small"
              icon={<Check className="w-3 h-3" />}
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(notification.id);
              }}
              className="text-green-600 hover:text-green-700"
            />
          )}
          
          <Button
            type="text"
            size="small"
            icon={<Archive className="w-3 h-3" />}
            onClick={(e) => {
              e.stopPropagation();
              archiveNotification(notification.id);
            }}
            className="text-gray-500 hover:text-gray-700"
          />
          
          <Button
            type="text"
            size="small"
            icon={<Trash2 className="w-3 h-3" />}
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification(notification.id);
            }}
            className="text-red-500 hover:text-red-700"
          />
        </div>
      </div>
    </div>
  );

  const FilterControls: React.FC = () => (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Filtres</h3>
        <Button
          type="text"
          size="small"
          onClick={() => {
            setFilterCategory(null);
            setFilterPriority(null);
            setShowRead(false);
          }}
        >
          Réinitialiser
        </Button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Afficher les lues</span>
          <Switch
            size="small"
            checked={showRead}
            onChange={setShowRead}
          />
        </div>
        
        <div>
          <label className="text-xs text-gray-500 block mb-1">Catégorie</label>
          <select
            value={filterCategory || ''}
            onChange={(e) => setFilterCategory(e.target.value || null)}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="">Toutes</option>
            <option value="project">Projets</option>
            <option value="payment">Paiements</option>
            <option value="equipment">Équipements</option>
            <option value="team">Équipe</option>
            <option value="location">Localisations</option>
            <option value="system">Système</option>
          </select>
        </div>
        
        <div>
          <label className="text-xs text-gray-500 block mb-1">Priorité</label>
          <select
            value={filterPriority || ''}
            onChange={(e) => setFilterPriority(e.target.value || null)}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="">Toutes</option>
            <option value="urgent">Urgent</option>
            <option value="high">Élevée</option>
            <option value="medium">Moyenne</option>
            <option value="low">Faible</option>
          </select>
        </div>
      </div>
    </div>
  );

  const dropdownContent = (
    <div className="w-96 max-h-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Notifications</h2>
            <p className="text-sm opacity-90">
              {unreadCount} non lue{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="text"
              size="small"
              icon={<Filter className="w-4 h-4" />}
              className="text-white hover:bg-white/20"
            />
            
            {unreadCount > 0 && (
              <Button
                type="text"
                size="small"
                icon={<Check className="w-4 h-4" />}
                onClick={markAllAsRead}
                className="text-white hover:bg-white/20"
              >
                Tout lire
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterControls />

      {/* Notifications List */}
      <div className="max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <Spin size="large" />
            <p className="text-gray-500 mt-2">Chargement des notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Aucune notification"
            />
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <Button
            type="link"
            size="small"
            icon={<Settings className="w-4 h-4" />}
            className="w-full text-center"
          >
            Gérer les préférences
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={dropdownContent}
      trigger={['click']}
      placement="bottomRight"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <Button
        type="text"
        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Badge count={unreadCount} size="small" offset={[2, -2]}>
          {unreadCount > 0 ? (
            <BellRing className="w-5 h-5 text-blue-600 animate-pulse" />
          ) : (
            <Bell className="w-5 h-5 text-gray-600" />
          )}
        </Badge>
      </Button>
    </Dropdown>
  );
};

export default NotificationBell;
