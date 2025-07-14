import React from 'react';
import { Clock, CheckCircle, AlertCircle, User, Calendar } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'task_completed' | 'task_started' | 'milestone' | 'alert' | 'meeting';
  title: string;
  description: string;
  time: string;
  user?: string;
  priority?: 'low' | 'medium' | 'high';
}

const ActivityTimelineWidget: React.FC = () => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'task_completed',
      title: 'Fondations terminées',
      description: 'Coulage des fondations du bâtiment A',
      time: '2h',
      user: 'Jean Dupont',
      priority: 'high'
    },
    {
      id: '2',
      type: 'task_started',
      title: 'Début des murs porteurs',
      description: 'Équipe de maçonnerie mobilisée',
      time: '4h',
      user: 'Marie Martin',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'alert',
      title: 'Retard livraison matériaux',
      description: 'Béton prévu pour demain matin',
      time: '6h',
      priority: 'high'
    },
    {
      id: '4',
      type: 'meeting',
      title: 'Réunion équipe',
      description: 'Point hebdomadaire avec les chefs d\'équipe',
      time: '1j',
      user: 'Chef de projet'
    },
    {
      id: '5',
      type: 'milestone',
      title: 'Phase 1 complétée',
      description: 'Gros œuvre terminé selon planning',
      time: '2j',
      priority: 'high'
    }
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'task_started':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'milestone':
        return <CheckCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Activités Récentes</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`relative pl-6 pb-4 border-l-2 ${getPriorityColor(activity.priority)} ${
              index === activities.length - 1 ? '' : 'border-b border-gray-100 dark:border-gray-700'
            }`}
          >
            {/* Timeline dot */}
            <div className="absolute -left-2 top-1 bg-white dark:bg-gray-800 rounded-full p-1 border-2 border-gray-200 dark:border-gray-600">
              {getActivityIcon(activity.type)}
            </div>
            
            {/* Content */}
            <div className="ml-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {activity.description}
                  </p>
                  {activity.user && (
                    <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <User className="w-3 h-3 mr-1" />
                      {activity.user}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  il y a {activity.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
          Voir toutes les activités →
        </button>
      </div>
    </div>
  );
};

export default ActivityTimelineWidget;
