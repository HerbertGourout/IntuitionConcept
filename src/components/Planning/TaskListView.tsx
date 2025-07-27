import React from 'react';
import { Users, Calendar, Clock, CheckCircle, AlertTriangle, Pause } from 'lucide-react';
import { ProjectTask } from '../../contexts/projectTypes';
import { TeamMember } from '../../types/team';

interface TaskListViewProps {
  tasks: ProjectTask[];
  teamMembers: TeamMember[];
}

const TaskListView: React.FC<TaskListViewProps> = ({ tasks, teamMembers }) => {
  
  // Fonction simple pour obtenir les noms des membres assignés
  const getAssignedMemberNames = (assignedTo: string[] = []): string => {
    if (!assignedTo || assignedTo.length === 0) {
      return 'Non assigné';
    }

    // Essayer de trouver les noms dans teamMembers
    const names = assignedTo.map(id => {
      const member = teamMembers.find(m => m.id === id);
      if (member) {
        return member.name;
      }
      
      // Si l'ID ressemble à un nom (contient des espaces ou des lettres), l'utiliser tel quel
      if (id.includes(' ') || /^[a-zA-ZÀ-ÿ\s]+$/.test(id)) {
        return id;
      }
      
      // Sinon, afficher un nom générique
      return `Membre ${assignedTo.indexOf(id) + 1}`;
    });

    return names.join(', ');
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'blocked':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'on_hold':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // Fonction pour obtenir le label du statut
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'todo':
        return 'À faire';
      case 'planned':
        return 'Planifié';
      case 'in_progress':
        return 'En cours';
      case 'done':
      case 'completed':
        return 'Terminé';
      case 'blocked':
        return 'Bloqué';
      case 'on_hold':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'done':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'planned':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">Aucune tâche à afficher</div>
        <div className="text-sm text-gray-400">Les tâches apparaîtront ici une fois créées</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div
          key={task.id || index}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          {/* En-tête de la tâche */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                {task.name || 'Tâche sans nom'}
              </h3>
              
              {/* Statut et informations */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Statut */}
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                  {getStatusIcon(task.status)}
                  {getStatusLabel(task.status)}
                </span>

                {/* Membres assignés */}
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                  <Users className="w-3 h-3" />
                  {getAssignedMemberNames(task.assignedTo)}
                </span>

                {/* Date de fin */}
                {task.endDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                    <Calendar className="w-3 h-3" />
                    {new Date(task.endDate).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="text-sm text-gray-600 mb-3">
              {task.description}
            </div>
          )}

          {/* Informations financières */}
          {(task.budget || task.spent) && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="text-xs font-medium text-gray-700 mb-2">Budget</div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-center">
                  <div className="text-gray-500">Alloué</div>
                  <div className="font-semibold text-blue-600">
                    {(task.budget || 0).toLocaleString()} FCFA
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">Dépensé</div>
                  <div className="font-semibold text-orange-600">
                    {(task.spent || 0).toLocaleString()} FCFA
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">Restant</div>
                  <div className={`font-semibold ${
                    ((task.budget || 0) - (task.spent || 0)) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {((task.budget || 0) - (task.spent || 0)).toLocaleString()} FCFA
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskListView;
