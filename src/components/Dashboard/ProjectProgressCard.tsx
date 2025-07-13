import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Tooltip } from 'antd';
import { 
  CalendarClock, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Clock,
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Project, ProjectPhase, ProjectTask } from '../../contexts/projectTypes';
import ModernCard from '../UI/ModernCard';

interface ProjectProgressCardProps {
  project: Project;
  className?: string;
  onExpand?: (isExpanded: boolean) => void;
}

// Composant pour l'icône d'état du projet
const ProjectStatusIcon = ({ 
  isLate, 
  isCloseToDeadline, 
  progress 
}: { 
  isLate: boolean; 
  isCloseToDeadline: boolean; 
  progress: number 
}) => {
  if (isLate) {
    return (
      <Tooltip title="Projet en retard">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          aria-label="Projet en retard"
        >
          <AlertTriangle className="text-red-500 h-5 w-5" />
        </motion.div>
      </Tooltip>
    );
  }

  if (isCloseToDeadline) {
    return (
      <Tooltip title="Échéance proche">
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          aria-label="Échéance proche"
        >
          <CalendarClock className="text-yellow-500 h-5 w-5" />
        </motion.div>
      </Tooltip>
    );
  }

  if (progress >= 95) {
    return (
      <Tooltip title="Projet presque terminé">
        <CheckCircle className="text-green-500 h-5 w-5" aria-label="Projet presque terminé" />
      </Tooltip>
    );
  }

  return null;
};

// Composant pour la barre de progression
const ProgressBar = ({ 
  progress, 
  isLate, 
  isCloseToDeadline 
}: { 
  progress: number; 
  isLate: boolean; 
  isCloseToDeadline: boolean 
}) => {
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValue(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getProgressColor = () => {
    if (isLate) return 'bg-red-500';
    if (isCloseToDeadline && progress < 80) return 'bg-yellow-500';
    return 'bg-gradient-to-r from-blue-500 to-teal-400';
  };

  return (
    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${getProgressColor()} shadow-md`}
        initial={{ width: 0 }}
        animate={{ width: `${progressValue}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      />
    </div>
  );
};

const ProjectProgressCard: React.FC<ProjectProgressCardProps> = ({ 
  project, 
  className = '',
  onExpand
}) => {
  // Calculer le nombre de jours restants
  const calculateDaysRemaining = useCallback(() => {
    if (!project.endDate) return null;

    const endDate = new Date(project.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [project.endDate]);

  // Calculer la progression en fonction des phases
  const calculateProgress = useCallback(() => {
    if (!project.phases || project.phases.length === 0) return 0;
    
    // Calculer la progression basée sur l'achèvement des tâches dans chaque phase
    const completedPhases = project.phases.filter(
      (phase: ProjectPhase) => {
        if (!phase.tasks || phase.tasks.length === 0) return false;
        return phase.tasks.every((task: ProjectTask) => task.status === 'done');
      }
    ).length;
    
    return Math.round((completedPhases / project.phases.length) * 100);
  }, [project.phases]);

  const daysRemaining = calculateDaysRemaining();
  const isLate = daysRemaining !== null && daysRemaining < 0;
  const isCloseToDeadline = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7;
  const progress = calculateProgress();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpand?.(newState);
  }, [isExpanded, onExpand]);

  // Variants d'animation pour le contenu dépliable
  const contentVariants: Variants = {
    collapsed: { 
      opacity: 0, 
      height: 0,
      marginBottom: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    expanded: { 
      opacity: 1, 
      height: 'auto',
      marginBottom: '1rem',
      transition: { 
        duration: 0.3, 
        ease: 'easeInOut',
        staggerChildren: 0.1
      }
    }
  };

  // Données pour les métriques du projet
  const projectMetrics = useMemo(() => [
    {
      label: 'Statut',
      value: project.status ? project.status.replace('_', ' ') : 'N/A',
      icon: <TrendingUp className="w-4 h-4" />,
      className: ''
    },
    {
      label: 'Échéance',
      value: project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A',
      icon: <Calendar className="w-4 h-4" />,
      className: isLate ? 'text-red-500' : isCloseToDeadline ? 'text-yellow-500' : ''
    },
    {
      label: 'Budget utilisé',
      value: project.spent && project.budget 
        ? `${Math.round((project.spent / project.budget) * 100)}%` 
        : 'N/A',
      icon: <DollarSign className="w-4 h-4" />,
      className: ''
    },
    {
      label: 'Jours restants',
      value: daysRemaining !== null 
        ? isLate 
          ? `${Math.abs(daysRemaining)} jours de retard` 
          : `${daysRemaining} jours` 
        : 'N/A',
      icon: <Clock className="w-4 h-4" />,
      className: isLate ? 'text-red-500' : isCloseToDeadline ? 'text-yellow-500' : ''
    }
  ], [project, daysRemaining, isLate, isCloseToDeadline]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <ModernCard 
        className="overflow-hidden transition-all duration-300 hover:shadow-lg dark:shadow-gray-800/20"
        hoverEffect
        glassEffect
      >
        <div 
          className="cursor-pointer p-4 sm:p-5"
          onClick={toggleExpand}
          onKeyDown={(e) => e.key === 'Enter' && toggleExpand()}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-controls={`project-${project.id}-content`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {project.name}
              <ProjectStatusIcon 
                isLate={isLate} 
                isCloseToDeadline={isCloseToDeadline} 
                progress={progress} 
              />
            </h3>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              aria-hidden="true"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              )}
            </motion.div>
          </div>
        </div>
        
        {/* Barre de progression */}
        <motion.div 
          className="px-4 sm:px-5 pb-4 sm:pb-5"
          initial="collapsed"
          animate={isExpanded ? 'expanded' : 'collapsed'}
          variants={{
            expanded: { 
              opacity: 1, 
              height: 'auto',
              transition: { duration: 0.3, ease: 'easeInOut' }
            },
            collapsed: { 
              opacity: 0, 
              height: 0,
              transition: { duration: 0.2, ease: 'easeInOut' }
            }
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Progression</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {progress}%
            </span>
          </div>
          <ProgressBar 
            progress={progress} 
            isLate={isLate} 
            isCloseToDeadline={isCloseToDeadline} 
          />
        </motion.div>

        {/* Contenu dépliable */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              id={`project-${project.id}-content`}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm px-4 sm:px-5 pb-4 sm:pb-5 pt-0"
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={contentVariants}
              aria-live="polite"
            >
              {projectMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      delay: 0.1 * index,
                      type: 'spring',
                      stiffness: 300,
                      damping: 20
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">
                    {metric.icon}
                    <span>{metric.label}</span>
                  </div>
                  <div className={`font-medium text-sm ${metric.className}`}>
                    {metric.value}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </ModernCard>
    </motion.div>
  );
};

export default ProjectProgressCard;
