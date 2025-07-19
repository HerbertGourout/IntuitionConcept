import React, { useMemo } from 'react';
import { Clock, CheckCircle, AlertCircle, User, Calendar } from 'lucide-react';
import { useProjects } from '../../../hooks/useProjects';

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
  const { currentProject } = useProjects();

  // Fonction utilitaire pour calculer le temps écoulé
  const getTimeAgo = (date: Date, now: Date): string => {
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}j`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      return 'maintenant';
    }
  };

  // Générer des activités dynamiques basées sur les vraies données du projet
  const activities: ActivityItem[] = useMemo(() => {
    if (!currentProject) {
      return [];
    }

    const recentActivities: ActivityItem[] = [];
    const now = new Date();

    // Activités basées sur les tâches du projet
    (currentProject.phases || []).forEach(phase => {
      (phase.tasks || []).forEach(task => {
        if (task.status === 'done') {
          recentActivities.push({
            id: `task-${task.id}`,
            type: 'task_completed',
            title: `Tâche terminée: ${task.name}`,
            description: `Phase: ${phase.name}`,
            time: task.updatedAt ? getTimeAgo(new Date(task.updatedAt), now) : '1j',
            user: task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo[0] : undefined,
            priority: task.priority as 'low' | 'medium' | 'high'
          });
        } else if (task.status === 'in_progress') {
          recentActivities.push({
            id: `task-progress-${task.id}`,
            type: 'task_started',
            title: `En cours: ${task.name}`,
            description: `Phase: ${phase.name}`,
            time: task.startDate ? getTimeAgo(new Date(task.startDate), now) : '2h',
            user: task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo[0] : undefined,
            priority: task.priority as 'low' | 'medium' | 'high'
          });
        }

        // Alertes pour les tâches en retard
        if (task.status !== 'done' && task.dueDate && new Date(task.dueDate) < now) {
          recentActivities.push({
            id: `alert-${task.id}`,
            type: 'alert',
            title: `Tâche en retard: ${task.name}`,
            description: `Échéance dépassée depuis ${getTimeAgo(new Date(task.dueDate), now)}`,
            time: getTimeAgo(new Date(task.dueDate), now),
            priority: 'high'
          });
        }
      });
    });

    // Activités basées sur les équipements
    (currentProject.equipment || []).forEach(equipment => {
      if (equipment.status === 'maintenance') {
        recentActivities.push({
          id: `equipment-${equipment.id}`,
          type: 'alert',
          title: `Équipement en maintenance`,
          description: `${equipment.name} (${equipment.type})`,
          time: '3h',
          priority: 'medium'
        });
      }
    });

    // Milestones basés sur les phases terminées
    (currentProject.phases || []).forEach(phase => {
      if (phase.status === 'completed') {
        recentActivities.push({
          id: `milestone-${phase.id}`,
          type: 'milestone',
          title: `Phase terminée: ${phase.name}`,
          description: `Toutes les tâches de la phase sont complétées`,
          time: phase.endDate ? getTimeAgo(new Date(phase.endDate), now) : '1j',
          priority: 'high'
        });
      }
    });

    // Si pas d'activités, afficher un message par défaut
    if (recentActivities.length === 0) {
      recentActivities.push({
        id: 'default',
        type: 'task_started',
        title: 'Projet initialisé',
        description: `Projet "${currentProject.name}" créé et prêt`,
        time: currentProject.createdAt ? getTimeAgo(new Date(currentProject.createdAt), now) : 'récemment',
        user: currentProject.manager || 'Gestionnaire',
        priority: 'medium'
      });
    }

    // Trier par ordre chronologique et limiter à 5 activités
    return recentActivities
      .sort((a, b) => {
        // Tri basique par type de priorité et temps
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2);
      })
      .slice(0, 5);
  }, [currentProject, getTimeAgo]);

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
