import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProjects } from '../../hooks/useProjects';
import { useCurrency } from '../../hooks/useCurrency';
import { 
  Calendar, 
  Users, 
  Euro, 
  TrendingUp,
  FileText,
  Settings,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Target,
  Activity,
  Briefcase,
  BarChart3,
  Sparkles
} from 'lucide-react';
import ActivityTimelineWidget from './widgets/ActivityTimelineWidget';
import AdvancedFinancialWidget from './widgets/AdvancedFinancialWidget';
import EquipmentMaintenanceWidget from './widgets/EquipmentMaintenanceWidget';
import TeamProductivityWidget from './widgets/TeamProductivityWidget';
import DeliverySupplyWidget from './widgets/DeliverySupplyWidget';
import DocumentsComplianceWidget from './widgets/DocumentsComplianceWidget';
import AnalyticsWidget from './widgets/AnalyticsWidget';

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

const UltraModernDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentProject, projects } = useProjects();
  const { formatAmount } = useCurrency();
  
  const validProject = projects.find(p => p.id === currentProject?.id);
  
  // Calcul des statistiques basées sur le projet sélectionné
  const stats = useMemo(() => {
    if (!validProject) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        delayedTasks: 0,
        progress: 0,
        budget: 0,
        budgetSpent: 0,
        budgetRemaining: 0,
        budgetPercentage: 0,
        totalPhases: 0,
        completedPhases: 0,
        teamMembers: 0,
        totalEquipment: 0,
        activeEquipment: 0
      };
    }

    const allTasks = (validProject.phases || []).flatMap(phase => (phase.tasks || []));
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task && task.status === 'done').length;
    const inProgressTasks = allTasks.filter(task => task && task.status === 'in_progress').length;
    const todoTasks = allTasks.filter(task => task && task.status === 'todo').length;
    const delayedTasks = allTasks.filter(task => 
      task && task.status !== 'done' && 
      task.dueDate && new Date(task.dueDate) < new Date()
    ).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const budget = validProject.budget || 0;
    const budgetSpent = (validProject.phases || []).reduce(
      (sum, phase) => sum + (phase.tasks || []).reduce((tSum, t) => tSum + (t.spent || 0), 0),
      0
    );
    const budgetRemaining = Math.max(0, budget - budgetSpent);
    const budgetPercentage = budget > 0 ? Math.round((budgetSpent / budget) * 100) : 0;
    
    const totalPhases = (validProject.phases || []).length;
    const completedPhases = (validProject.phases || []).filter(phase => {
      const phaseTasks = phase.tasks || [];
      return phaseTasks.length > 0 && phaseTasks.every(task => task.status === 'done');
    }).length;
    
    const assignedMembers = new Set(
      allTasks.flatMap(task => task.assignedTo || [])
    );
    const teamMembers = assignedMembers.size;
    
    const equipment = validProject.equipment || [];
    const totalEquipment = equipment.length;
    const activeEquipment = equipment.filter(eq => eq.status === 'in-use').length;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      delayedTasks,
      progress,
      budget,
      budgetSpent,
      budgetRemaining,
      budgetPercentage,
      totalPhases,
      completedPhases,
      teamMembers,
      totalEquipment,
      activeEquipment
    };
  }, [validProject]);

  if (!validProject) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center py-12"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              className="relative mb-8"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Briefcase className="w-20 h-20 text-purple-500 mx-auto" />
              <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </motion.div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Sélectionnez votre projet
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              Découvrez un tableau de bord révolutionnaire avec des données en temps réel
            </p>
            <motion.button 
              onClick={() => onNavigate?.('projects')}
              className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Explorer les projets
              </span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header ultra-moderne */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-3xl shadow-2xl p-8 text-white"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Briefcase className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    {validProject.name}
                  </h1>
                  <p className="text-white/80 text-lg">
                    {validProject.description || 'Tableau de bord en temps réel'}
                  </p>
                </div>
              </div>
              <motion.div 
                className="text-right"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="text-white/80 text-sm mb-1">Progression globale</div>
                <div className="text-5xl font-bold">{stats.progress}%</div>
              </motion.div>
            </div>
            
            {/* Barre de progression ultra-moderne */}
            <div className="relative w-full bg-white/20 backdrop-blur-sm rounded-full h-4 mb-6 overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${stats.progress}%` }}
                transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </motion.div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Target, value: stats.totalTasks, label: 'Tâches totales', delay: 0.2 },
                { icon: CheckCircle, value: stats.completedTasks, label: 'Terminées', delay: 0.3 },
                { icon: Clock, value: stats.inProgressTasks, label: 'En cours', delay: 0.4 },
                { icon: Users, value: stats.teamMembers, label: 'Membres', delay: 0.5 }
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  className="relative overflow-hidden bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: stat.delay, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white/80 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="absolute top-4 right-4">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Activity className="w-5 h-5 text-cyan-300 animate-bounce" />
          </div>
        </motion.div>

        {/* Widgets avancés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          <AdvancedFinancialWidget />
          <EquipmentMaintenanceWidget />
          <TeamProductivityWidget />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          <DeliverySupplyWidget />
          <DocumentsComplianceWidget />
        </div>

        <div className="mb-6">
          <AnalyticsWidget />
        </div>
      </div>
    </motion.div>
  );
};

export default UltraModernDashboard;
