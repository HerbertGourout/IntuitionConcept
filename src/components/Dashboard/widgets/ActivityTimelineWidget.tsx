import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, CheckCircle, AlertCircle, User, Calendar } from 'lucide-react';
import { useProjects } from '../../../hooks/useProjects';
import { db } from '../../../firebase';
import { collection, onSnapshot, query, where, limit } from 'firebase/firestore';

interface ActivityItem {
  id: string;
  type: 'task_completed' | 'task_started' | 'milestone' | 'alert' | 'meeting';
  title: string;
  description: string;
  time: string;
  user?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface ActivityTimelineWidgetProps {
  className?: string;
}

const ActivityTimelineWidget: React.FC<ActivityTimelineWidgetProps> = ({ className = '' }) => {
  const { currentProject } = useProjects();
  const [rtActivities, setRtActivities] = useState<ActivityItem[] | null>(null);

  // Fonction utilitaire pour calculer le temps écoulé
  const getTimeAgo = useCallback((date: Date, now: Date): string => {
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
  }, []);

  // Générer des activités dynamiques basées sur les vraies données du projet
  const activities: ActivityItem[] = useMemo(() => {
    if (rtActivities && rtActivities.length > 0) {
      return rtActivities.slice(0, 5);
    }
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
  }, [currentProject, getTimeAgo, rtActivities]);

  // Écoute en temps réel des activités Firestore si disponible
  useEffect(() => {
    if (!currentProject?.id) {
      setRtActivities(null);
      return;
    }
    let unsub: undefined | (() => void);
    try {
      const activitiesRef = collection(db, 'activities');
      // Pour éviter l'exigence d'un index composite (where + orderBy),
      // on évite orderBy côté serveur et on trie côté client.
      // On limite à 100 éléments pour rester performant.
      const q = query(
        activitiesRef,
        where('projectId', '==', currentProject.id),
        limit(100)
      );
      unsub = onSnapshot(q, 
        (snap) => {
          try {
            const now = new Date();
            const items = snap.docs.map((d) => {
              const data = d.data() as Record<string, unknown>;
              const rawTs = data.timestamp as { seconds?: number } | string | undefined;
              const tsDate = rawTs
                ? typeof rawTs === 'string'
                  ? new Date(rawTs)
                  : new Date((rawTs.seconds ?? 0) * 1000)
                : now;
              return {
                id: d.id,
                tsDate,
                type: (data.type as ActivityItem['type']) || 'task_started',
                title: (data.title as string) || 'Activité',
                description: (data.description as string) || ((data.phaseName as string) ? `Phase: ${data.phaseName as string}` : ''),
                user: (data.user as string) || (data.userName as string) || undefined,
                priority: (data.priority as ActivityItem['priority']) || 'medium',
              };
            });
            const sorted = items
              .sort((a, b) => b.tsDate.getTime() - a.tsDate.getTime())
              .slice(0, 20)
              .map((it) => ({
                id: it.id,
                type: it.type,
                title: it.title,
                description: it.description,
                time: getTimeAgo(it.tsDate, now),
                user: it.user,
                priority: it.priority,
              }));
            setRtActivities(sorted);
          } catch (processingError) {
            console.error('Erreur lors du traitement des activités:', processingError);
            setRtActivities(null); // Fallback vers les données statiques
          }
        },
        (error) => {
          console.error('Erreur Firestore lors de l\'écoute des activités:', error);
          if (error.code === 'permission-denied') {
            console.warn('Permissions insuffisantes pour écouter les activités');
          } else if (error.code === 'unavailable') {
            console.warn('Service Firestore temporairement indisponible');
          }
          setRtActivities(null); // Fallback vers les données statiques
        }
      );
    } catch (initError) {
      // Collection absente ou règles: ignorer et rester en fallback
      console.warn('Impossible d\'initialiser l\'écoute des activités:', initError);
      setRtActivities(null);
    }
    return () => { if (unsub) unsub(); };
  }, [currentProject?.id, getTimeAgo]);

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
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Activités récentes
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {activities.length} activités
        </span>
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
