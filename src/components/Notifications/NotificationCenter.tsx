import React, { useState } from 'react';
import { 
  Bell, 
  Filter, 
  Search, 
  Check, 
  CheckCheck, 
  Archive, 
  Trash2, 
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Settings,
  TestTube
} from 'lucide-react';
import { Input, Select, Button, Card, Empty, Spin, Badge, Switch, Tabs } from 'antd';
import { useNotifications } from '../../contexts/NotificationContext';
import { Notification } from '../../types/notification';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import NotificationDemo from './NotificationDemo';
import NotificationPreferences from './NotificationPreferences';

const { Option } = Select;

const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    stats,
    isLoading,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    filterCategory,
    filterPriority,
    showRead,
    setFilterCategory,
    setFilterPriority,
    setShowRead
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Filter notifications based on search term
  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[priority as keyof typeof colors]}`}>
        {priority === 'urgent' ? 'Urgent' : 
         priority === 'high' ? 'Élevée' : 
         priority === 'medium' ? 'Moyenne' : 'Faible'}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      project: 'bg-blue-100 text-blue-800',
      payment: 'bg-green-100 text-green-800',
      equipment: 'bg-yellow-100 text-yellow-800',
      team: 'bg-purple-100 text-purple-800',
      location: 'bg-indigo-100 text-indigo-800',
      system: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      project: 'Projet',
      payment: 'Paiement',
      equipment: 'Équipement',
      team: 'Équipe',
      location: 'Localisation',
      system: 'Système'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[category as keyof typeof colors]}`}>
        {labels[category as keyof typeof labels]}
      </span>
    );
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkMarkAsRead = async () => {
    const promises = selectedNotifications.map(id => markAsRead(id));
    await Promise.all(promises);
    setSelectedNotifications([]);
  };

  const handleBulkArchive = async () => {
    const promises = selectedNotifications.map(id => archiveNotification(id));
    await Promise.all(promises);
    setSelectedNotifications([]);
  };

  const handleBulkDelete = async () => {
    const promises = selectedNotifications.map(id => deleteNotification(id));
    await Promise.all(promises);
    setSelectedNotifications([]);
  };

  const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => (
    <Card
      className={`mb-4 transition-all hover:shadow-md ${
        !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
      } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}`}
      size="small"
    >
      <div className="flex items-start gap-4">
        {/* Selection checkbox */}
        <input
          type="checkbox"
          checked={selectedNotifications.includes(notification.id)}
          onChange={() => handleSelectNotification(notification.id)}
          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />

        {/* Notification icon */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {getCategoryBadge(notification.category)}
            {getPriorityBadge(notification.priority)}
            {!notification.isRead && (
              <Badge status="processing" text="Non lu" />
            )}
          </div>

          <h3 className={`text-base font-medium mb-2 ${
            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
          }`}>
            {notification.title}
          </h3>

          <p className="text-gray-600 mb-3 leading-relaxed">
            {notification.message}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDistanceToNow(new Date(notification.createdAt), { 
                  addSuffix: true, 
                  locale: fr 
                })}
              </span>
              
              {notification.projectId && (
                <span className="text-blue-600">
                  Projet #{notification.projectId.slice(-6)}
                </span>
              )}
            </div>

            {notification.actionLabel && notification.actionUrl && (
              <Button
                type="link"
                size="small"
                onClick={() => window.location.href = notification.actionUrl!}
                className="p-0 h-auto text-blue-600 hover:text-blue-700"
              >
                {notification.actionLabel}
              </Button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {!notification.isRead && (
            <Button
              type="text"
              size="small"
              icon={<Check className="w-4 h-4" />}
              onClick={() => markAsRead(notification.id)}
              className="text-green-600 hover:text-green-700"
              title="Marquer comme lu"
            />
          )}
          
          <Button
            type="text"
            size="small"
            icon={<Archive className="w-4 h-4" />}
            onClick={() => archiveNotification(notification.id)}
            className="text-gray-500 hover:text-gray-700"
            title="Archiver"
          />
          
          <Button
            type="text"
            size="small"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => deleteNotification(notification.id)}
            className="text-red-500 hover:text-red-700"
            title="Supprimer"
          />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" />
              Centre de Notifications
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez vos notifications et préférences
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="notifications"
        items={[
          {
            key: 'notifications',
            label: (
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
                {unreadCount > 0 && (
                  <Badge count={unreadCount} size="small" />
                )}
              </span>
            ),
            children: (
              <div>

                {/* Stats */}
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card size="small" className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </Card>
                    <Card size="small" className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.total - stats.unread}</div>
                      <div className="text-sm text-gray-600">Lues</div>
                    </Card>
                    <Card size="small" className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
                      <div className="text-sm text-gray-600">Non lues</div>
                    </Card>
                    <Card size="small" className="text-center">
                      <div className="text-2xl font-bold text-red-600">{stats.byPriority.urgent || 0}</div>
                      <div className="text-sm text-gray-600">Urgentes</div>
                    </Card>
                  </div>
                )}
                <Card className="mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtres et Recherche
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Afficher les lues</span>
                        <Switch
                          checked={showRead}
                          onChange={setShowRead}
                          size="small"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        placeholder="Rechercher dans les notifications..."
                        prefix={<Search className="w-4 h-4 text-gray-400" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        allowClear
                      />
                      
                      <Select
                        placeholder="Catégorie"
                        value={filterCategory}
                        onChange={setFilterCategory}
                        allowClear
                        className="w-full"
                      >
                        <Option value="project">Projets</Option>
                        <Option value="payment">Paiements</Option>
                        <Option value="equipment">Équipements</Option>
                        <Option value="team">Équipe</Option>
                        <Option value="location">Localisations</Option>
                        <Option value="system">Système</Option>
                      </Select>
                      
                      <Select
                        placeholder="Priorité"
                        value={filterPriority}
                        onChange={setFilterPriority}
                        allowClear
                        className="w-full"
                      >
                        <Option value="urgent">Urgent</Option>
                        <Option value="high">Élevée</Option>
                        <Option value="medium">Moyenne</Option>
                        <Option value="low">Faible</Option>
                      </Select>
                    </div>
                  </div>
                </Card>

                {/* Bulk Actions */}
                {selectedNotifications.length > 0 && (
                  <Card className="mb-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">
                        {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} sélectionnée{selectedNotifications.length !== 1 ? 's' : ''}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="small"
                          icon={<Check className="w-4 h-4" />}
                          onClick={handleBulkMarkAsRead}
                        >
                          Marquer comme lues
                        </Button>
                        
                        <Button
                          size="small"
                          icon={<Archive className="w-4 h-4" />}
                          onClick={handleBulkArchive}
                        >
                          Archiver
                        </Button>
                        
                        <Button
                          size="small"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={handleBulkDelete}
                          danger
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Quick Actions */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Button
                      type="text"
                      size="small"
                      onClick={handleSelectAll}
                      className="text-blue-600"
                    >
                      {selectedNotifications.length === filteredNotifications.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                    </Button>
                    
                    {unreadCount > 0 && (
                      <Button
                        type="text"
                        size="small"
                        icon={<CheckCheck className="w-4 h-4" />}
                        onClick={markAllAsRead}
                        className="text-green-600"
                      >
                        Tout marquer comme lu
                      </Button>
                    )}
                  </div>
                  
                  <span className="text-sm text-gray-500">
                    {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Notifications List */}
                <div>
                  {isLoading ? (
                    <div className="text-center py-12">
                      <Spin size="large" />
                      <p className="text-gray-500 mt-4">Chargement des notifications...</p>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <Card>
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          searchTerm || filterCategory || filterPriority
                            ? "Aucune notification ne correspond aux filtres"
                            : "Aucune notification"
                        }
                      />
                    </Card>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          },
          {
            key: 'preferences',
            label: (
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Préférences
              </span>
            ),
            children: <NotificationPreferences />
          },
          {
            key: 'demo',
            label: (
              <span className="flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Démonstration
              </span>
            ),
            children: <NotificationDemo />
          }
        ]}
      />
    </div>
  );
};

export default NotificationCenter;
