import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import ProgressBar from '../../UI/ProgressBar';

interface ProjectsOverviewWidgetProps {
  className?: string;
}

const ProjectsOverviewWidget: React.FC<ProjectsOverviewWidgetProps> = ({ className = '' }) => {
  const { resolvedTheme } = useTheme();

  // Données simulées (en production, récupérer depuis l'API)
  const projectStats = {
    total: 12,
    active: 8,
    completed: 3,
    delayed: 1,
    totalBudget: 2450000,
    completedBudget: 850000,
  };

  const recentProjects = [
    { id: 1, name: 'Immeuble Almadies', progress: 75, status: 'active', budget: 450000 },
    { id: 2, name: 'Villa Ngor', progress: 100, status: 'completed', budget: 280000 },
    { id: 3, name: 'Centre Commercial', progress: 45, status: 'delayed', budget: 890000 },
    { id: 4, name: 'Résidence Plateau', progress: 30, status: 'active', budget: 320000 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'delayed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'delayed': return <AlertCircle className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  return (
    <div className={`h-full ${className}`}>
      {/* En-tête avec statistiques */}
      <div className="mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            className={`p-4 rounded-lg border ${
              resolvedTheme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-blue-50 border-blue-200'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {projectStats.total}
            </p>
          </motion.div>

          <motion.div
            className={`p-4 rounded-lg border ${
              resolvedTheme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-green-50 border-green-200'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Actifs</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {projectStats.active}
            </p>
          </motion.div>

          <motion.div
            className={`p-4 rounded-lg border ${
              resolvedTheme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-yellow-50 border-yellow-200'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium">Terminés</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {projectStats.completed}
            </p>
          </motion.div>

          <motion.div
            className={`p-4 rounded-lg border ${
              resolvedTheme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-red-50 border-red-200'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium">En retard</span>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {projectStats.delayed}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Budget global */}
      <div className={`p-4 rounded-lg border mb-6 ${
        resolvedTheme === 'dark'
          ? 'bg-gray-700 border-gray-600'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className="font-semibold mb-3">Budget Global</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">Progression</span>
          <span className="text-sm font-medium">
            {Math.round((projectStats.completedBudget / projectStats.totalBudget) * 100)}%
          </span>
        </div>
        <div className="mb-3">
          <ProgressBar value={(projectStats.completedBudget / projectStats.totalBudget) * 100} tone="blue" />
        </div>
        <div className="flex justify-between text-sm">
          <span>
            Réalisé: {(projectStats.completedBudget / 1000000).toFixed(1)}M FCFA
          </span>
          <span>
            Total: {(projectStats.totalBudget / 1000000).toFixed(1)}M FCFA
          </span>
        </div>
      </div>

      {/* Liste des projets récents */}
      <div>
        <h3 className="font-semibold mb-3">Projets Récents</h3>
        <div className="space-y-3">
          {recentProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                resolvedTheme === 'dark'
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={getStatusColor(project.status)}>
                    {getStatusIcon(project.status)}
                  </div>
                  <span className="font-medium text-sm">{project.name}</span>
                </div>
                <span className="text-xs font-medium">
                  {(project.budget / 1000).toFixed(0)}K FCFA
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-3">
                  {(() => {
                    const tone: 'green' | 'red' | 'blue' = project.status === 'completed' ? 'green' : project.status === 'delayed' ? 'red' : 'blue';
                    return <ProgressBar value={project.progress} tone={tone} />;
                  })()}
                </div>
                <span className="text-xs font-medium">{project.progress}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsOverviewWidget;
