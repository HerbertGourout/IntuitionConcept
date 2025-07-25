import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import ModernCard from '../UI/ModernCard';

import { Project } from '../../contexts/projectTypes';

interface ProjectChartProps {
  project: Project;
}

const ProjectChart: React.FC<ProjectChartProps> = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [animatedProgress, setAnimatedProgress] = useState<number>(0);

  useEffect(() => {
    // Animer la progression de la barre
    const timer = setTimeout(() => {
      setAnimatedProgress(project.progress ?? 0);
    }, 100);
    return () => clearTimeout(timer);
  }, [project.progress]);

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'from-red-500 to-red-600';
    if (progress < 70) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    return {
      text: percentage > 100 ? 'Dépassé' : 'Dans le budget',
      icon: percentage > 100 ? 
        <ArrowUpRight className="w-4 h-4 text-red-500" /> : 
        <ArrowDownRight className="w-4 h-4 text-green-500" />,
      color: percentage > 100 ? 'text-red-500' : 'text-green-500'
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ModernCard 
        className="overflow-hidden"
        hoverEffect
        glassEffect
      >
        <div 
          className="flex items-center justify-between mb-6 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Avancement des Projets
          </h3>
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </motion.div>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Carte unique pour le projet courant */}
              <motion.div 
                className="space-y-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {project.name}
                  </h4>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {animatedProgress}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(project.progress ?? 0)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${animatedProgress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Budget</div>
                    <div className="font-medium">
                      {(project.budget / 1000000).toFixed(1)}M FCFA
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Dépensé</div>
                    <div className="font-medium">
                      {(project.spent / 1000000).toFixed(1)}M FCFA
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Statut</div>
                    <div className={`flex items-center gap-1 ${getBudgetStatus(project.spent, project.budget).color}`}>
                      {getBudgetStatus(project.spent, project.budget).icon}
                      <span>{getBudgetStatus(project.spent, project.budget).text}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Restant</div>
                    <div className="font-medium">
                      {Math.max(0, (project.budget - project.spent) / 1000000).toFixed(1)}M FCFA
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ModernCard>
    </motion.div>
  );
};

export default ProjectChart;