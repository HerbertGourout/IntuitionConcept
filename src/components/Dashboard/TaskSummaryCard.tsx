import React from 'react';
import { motion, Variants } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, XCircle, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { useTaskStats } from '../../hooks/useTaskStats';
import ModernCard from '../UI/ModernCard';

// Composant pour afficher une statistique individuelle
const StatItem = ({ 
  count, 
  label, 
  icon: Icon, 
  color,
  onClick 
}: { 
  count: number; 
  label: string; 
  icon: React.ElementType; 
  color: string;
  onClick?: () => void;
}) => (
  <motion.div
    className={`p-3 rounded-lg cursor-pointer transition-colors ${onClick ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''}`}
    whileHover={onClick ? { scale: 1.02 } : {}}
    whileTap={onClick ? { scale: 0.98 } : {}}
    onClick={onClick}
    role={onClick ? 'button' : 'listitem'}
    tabIndex={onClick ? 0 : -1}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
          <div className="text-xl font-semibold dark:text-white">{count}</div>
        </div>
      </div>
      {onClick && (
        <ChevronRight className="w-4 h-4 text-gray-400" />
      )}
    </div>
  </motion.div>
);

// Composant pour la barre de progression
const ProgressBar = ({ 
  percentage, 
  color = 'bg-blue-500',
  height = 'h-2.5',
  className = ''
}: { 
  percentage: number; 
  color?: string;
  height?: string;
  className?: string;
}) => (
  <div className={`w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden ${height} ${className}`}>
    <motion.div
      className={`h-full rounded-full ${color}`}
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      transition={{ duration: 1, ease: 'easeOut' }}
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      role="progressbar"
    />
  </div>
);

const TaskSummaryCard: React.FC = () => {
  const [expandedView, setExpandedView] = React.useState<'summary' | 'phases'>('summary');
  const { 
    total, 
    completed, 
    inProgress, 
    pending, 
    blocked, 
    completionPercentage,
    byPhase 
  } = useTaskStats();
  
  const toggleView = () => {
    setExpandedView(prev => prev === 'summary' ? 'phases' : 'summary');
  };

  // Variants d'animation pour le contenu
  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        staggerChildren: 0.05,
        when: 'beforeChildren'
      }
    }
  };

  return (
    <ModernCard 
      className="overflow-hidden"
      hoverEffect
      glassEffect
    >
      <div className="p-5">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Résumé des tâches
          </h2>
          <button 
            onClick={toggleView}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
            aria-expanded={expandedView === 'phases'}
            aria-controls="task-summary-content"
          >
            {expandedView === 'summary' ? 'Voir par phase' : 'Voir le résumé'}
            {expandedView === 'summary' ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Barre de progression globale */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Progression globale
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {completionPercentage}%
            </span>
          </div>
          <ProgressBar 
            percentage={completionPercentage} 
            color={completionPercentage < 30 ? 'bg-red-500' : 
                  completionPercentage < 70 ? 'bg-yellow-500' : 'bg-green-500'}
            className="mb-1"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
            {completed} sur {total} tâches complétées
          </div>
        </div>

        {/* Contenu principal */}
        <motion.div 
          id="task-summary-content"
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: 1, 
            height: 'auto',
            transition: { duration: 0.3 }
          }}
          className="overflow-hidden"
        >
          {expandedView === 'summary' ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              <StatItem 
                count={completed}
                label="Terminées"
                icon={CheckCircle}
                color="text-green-500"
              />
              <StatItem 
                count={inProgress}
                label="En cours"
                icon={Clock}
                color="text-blue-500"
              />
              <StatItem 
                count={pending}
                label="En attente"
                icon={AlertCircle}
                color="text-yellow-500"
              />
              <StatItem 
                count={blocked}
                label="Bloquées"
                icon={XCircle}
                color="text-red-500"
              />
            </motion.div>
          ) : (
            <motion.div
              className="space-y-4"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              {Object.entries(byPhase).map(([phaseId, phaseStats]) => (
                <motion.div 
                  key={phaseId}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
                  variants={contentVariants}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Phase {phaseId}
                    </h3>
                    <span className="text-sm font-medium">
                      {phaseStats.completed}/{phaseStats.total} tâches
                    </span>
                  </div>
                  <ProgressBar 
                    percentage={phaseStats.completionPercentage}
                    height="h-2"
                    className="mb-1"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{phaseStats.completionPercentage}% complété</span>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {phaseStats.completed}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {phaseStats.inProgress}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        {phaseStats.pending}
                      </span>
                      {phaseStats.blocked > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          {phaseStats.blocked}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </ModernCard>
  );
};

export default TaskSummaryCard;
