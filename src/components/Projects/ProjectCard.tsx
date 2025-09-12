import React from 'react';
import { Calendar, User, MapPin, TrendingUp } from 'lucide-react';
import ProjectActionsMenu from './ProjectActionsMenu';
import { useFormatCurrency } from '../../utils/currency';
import ProgressBar from '../UI/ProgressBar';

// Interface pour les propriétés du composant
interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'archived';
    location: string;
    budget: number;
    spent: number;
    progress: number;
    priority: string;
    manager: string;
    client: string;
    team: string[];
    startDate: string;
    endDate: string;
  };
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const formatCurrency = useFormatCurrency();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on-hold':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in-progress':
        return 'En cours';
      case 'planning':
        return 'Planification';
      case 'on-hold':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const budget = project.budget || 0;
  const spent = project.spent || 0;
  const budgetUsage = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
              {project.name || 'Sans nom'}
            </h3>
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority || 'medium')}`}></div>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">{project.description || 'Aucune description'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status || '')}`}>
            {getStatusLabel(project.status || '')}
          </span>
          <div onClick={(e) => e.stopPropagation()}>
            <ProjectActionsMenu projectId={project.id} project={project} />
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progression</span>
          <span className="text-sm text-gray-600">{Math.round(project.progress || 0)}%</span>
        </div>
        <ProgressBar value={project.progress || 0} tone="orange" />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4 flex-shrink-0" />
          <span>{project.manager || 'Non assigné'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{project.location || 'Non spécifié'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>{project.startDate ? new Date(project.startDate).toLocaleDateString('fr-FR') : 'Non défini'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4 flex-shrink-0" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-medium text-sm break-words">{formatCurrency(budget)}</span>
            <span className="text-xs text-gray-500">Budget total</span>
          </div>
        </div>
      </div>

      {/* Budget Usage */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Budget utilisé</span>
          <span className="text-sm text-gray-600">{budgetUsage.toFixed(1)}%</span>
        </div>
        {(() => {
          const tone: 'red' | 'orange' | 'green' = budgetUsage > 80 ? 'red' : budgetUsage > 60 ? 'orange' : 'green';
          return <ProgressBar value={Math.min(budgetUsage, 100)} tone={tone} />;
        })()}
      </div>
    </div>
  );
};

export default ProjectCard;