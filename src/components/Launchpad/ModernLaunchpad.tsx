import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, 
  BarChart3, 
  FolderKanban, 
  Calendar, 
  FileText, 
  Wallet, 
  Users, 
  Settings as SettingsIcon,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  Target,
  Building2,
  Receipt,
} from 'lucide-react';
// Link disponible si besoin de navigation directe
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../hooks/useProjects';

interface ModernLaunchpadProps {
  onOpenSection: (section: string) => void;
}

const ModernLaunchpad: React.FC<ModernLaunchpadProps> = ({ onOpenSection }) => {
  const { firebaseUser } = useAuth();
  const { projects } = useProjects();

  // Calculer les stats
  const stats = useMemo(() => {
    const activeProjects = projects?.filter(p => p.status === 'planning' || p.status === 'in_progress').length || 0;
    const totalBudget = projects?.reduce((sum, p) => sum + (Number(p.budget) || 0), 0) || 0;
    const totalSpent = projects?.reduce((sum, p) => sum + (Number(p.spent) || 0), 0) || 0;
    
    return {
      activeProjects,
      totalProjects: projects?.length || 0,
      totalBudget,
      totalSpent,
      budgetRemaining: totalBudget - totalSpent,
    };
  }, [projects]);

  // Salutation selon l'heure
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }, []);

  const userName = firebaseUser?.displayName?.split(' ')[0] || 'Utilisateur';

  // Modules principaux
  const mainModules = [
    { key: 'dashboard', label: 'Tableau de bord', description: 'Vue d\'ensemble', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
    { key: 'projects', label: 'Projets', description: 'Gérer vos chantiers', icon: FolderKanban, color: 'from-amber-500 to-yellow-500' },
    { key: 'quotes', label: 'Devis', description: 'Créer et suivre', icon: Receipt, color: 'from-green-500 to-emerald-500' },
    { key: 'planning', label: 'Planning', description: 'Calendrier équipe', icon: Calendar, color: 'from-purple-500 to-violet-500' },
  ];

  // Modules secondaires
  const secondaryModules = [
    { key: 'documents', label: 'Documents', icon: FileText, color: 'from-orange-500 to-amber-500' },
    { key: 'finances', label: 'Finances', icon: Wallet, color: 'from-indigo-500 to-purple-500' },
    { key: 'team', label: 'Équipe', icon: Users, color: 'from-rose-500 to-pink-500' },
    { key: 'purchase-orders', label: 'Commandes', icon: FileText, color: 'from-sky-500 to-blue-500' },
    { key: 'settings', label: 'Paramètres', icon: SettingsIcon, color: 'from-gray-600 to-gray-800' },
  ];

  // Actions rapides
  const quickActions = [
    { label: 'Nouveau devis', icon: Plus, action: () => onOpenSection('quotes'), color: 'bg-green-500' },
    { label: 'Nouveau projet', icon: Building2, action: () => onOpenSection('projects'), color: 'bg-blue-500' },
    { label: 'Ajouter tâche', icon: Target, action: () => onOpenSection('planning'), color: 'bg-purple-500' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      {/* Header avec salutation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {greeting}, {userName} 👋
            </h1>
            <p className="text-gray-500 mt-1">
              Voici un aperçu de votre activité
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {quickActions.map((action, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.action}
                className={`${action.color} text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Actifs
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
          <p className="text-sm text-gray-500">Projets en cours</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</p>
          <p className="text-sm text-gray-500">Budget total</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-amber-600 font-medium">En attente</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">3</p>
          <p className="text-sm text-gray-500">Devis à valider</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-purple-600 font-medium">Ce mois</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">12</p>
          <p className="text-sm text-gray-500">Tâches terminées</p>
        </div>
      </motion.div>

      {/* Modules principaux */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Accès rapide</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainModules.map((module, idx) => (
            <motion.button
              key={module.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenSection(module.key)}
              className="group relative overflow-hidden rounded-2xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all text-left"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-white shadow-lg mb-4`}>
                  <module.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{module.label}</h3>
                <p className="text-sm text-gray-500">{module.description}</p>
                <ArrowRight className="absolute bottom-0 right-0 w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Modules secondaires + Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules secondaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Autres modules</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {secondaryModules.map((module, idx) => (
              <motion.button
                key={module.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.03 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOpenSection(module.key)}
                className="group bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all text-center"
              >
                <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center text-white shadow mb-2`}>
                  <module.icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-gray-700">{module.label}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Activité récente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">Voir tout</button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">Devis #2024-089 accepté</p>
                <p className="text-xs text-gray-500">Il y a 2 heures</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FolderKanban className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">Nouveau projet créé</p>
                <p className="text-xs text-gray-500">Il y a 5 heures</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">Rappel: Facture en attente</p>
                <p className="text-xs text-gray-500">Hier</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">Automatisation exécutée</p>
                <p className="text-xs text-gray-500">Il y a 2 jours</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Astuce */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Astuce du jour</p>
            <p className="text-sm text-gray-600">
              Utilisez <kbd className="px-2 py-0.5 bg-white rounded text-xs font-mono">Ctrl+K</kbd> pour ouvrir la recherche rapide et accéder à n'importe quel module.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernLaunchpad;
