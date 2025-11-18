import { useState, useEffect, FC } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Calendar, 
  Hammer, 
  Euro, 
  PieChart, 
  ShoppingCart, 
  CreditCard, 
  MapPin, 
  Bell, 
  Wrench, 
  ChevronLeft,
  HardHat,
  Building,
  Truck,
  Target,
  Clock,
  Scan, 
  AlertTriangle, 
  FileImage,
  Zap,
  TrendingUp,
  CheckCircle,
  UserCheck,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  currentProjectId: string | null;
  projects: Project[];
  onProjectSelect: (projectId: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onNavigate, 
  collapsed, 
  onCollapse,
  currentProjectId,
  projects,
  onProjectSelect
}) => {
  // État des sections collapsibles (sauvegardé dans localStorage)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('sidebar-expanded-sections');
    return saved ? JSON.parse(saved) : {
      'project': true,
      'finance': true,
      'quotes': true,
      'docs': true,
      'team': false,
      'ai': false
    };
  });

  // Sauvegarder les préférences
  useEffect(() => {
    localStorage.setItem('sidebar-expanded-sections', JSON.stringify(expandedSections));
  }, [expandedSections]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Données simulées pour les mini-aperçus
  const getProjectStats = (projectId: string | null) => {
    if (!projectId) return null;
    return {
      progress: Math.floor(Math.random() * 100),
      activeTasks: Math.floor(Math.random() * 20) + 1,
      budget: Math.floor(Math.random() * 5000000) + 1000000,
      team: Math.floor(Math.random() * 15) + 5
    };
  };

  // Structure organisée en sections collapsibles
  const menuSections = [
    {
      id: 'project',
      title: 'GESTION PROJET',
      icon: Building,
      items: [
        { 
          id: 'dashboard', 
          label: 'Tableau de Bord', 
          icon: HardHat, 
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          description: 'Vue d\'ensemble du projet'
        },
    { 
      id: 'projects', 
      label: 'Projets', 
      icon: Building, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'Gestion des projets'
    },
    { 
      id: 'project-budget', 
      label: 'Budget Projet', 
      icon: Euro, 
      disabled: !currentProjectId,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      description: 'Suivi budgétaire',
      status: currentProjectId ? 'active' : 'disabled'
    },
    { 
      id: 'equipment', 
      label: 'Équipements', 
      icon: Truck, 
      disabled: !currentProjectId,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      description: 'Matériel de chantier',
      status: currentProjectId ? 'active' : 'disabled'
    },
    { 
      id: 'tasks', 
      label: 'Tâches', 
      icon: Hammer, 
      disabled: !currentProjectId,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Gestion des tâches',
      status: currentProjectId ? 'active' : 'disabled'
    },
    { 
      id: 'planning', 
      label: 'Planning', 
      icon: Calendar, 
      disabled: !currentProjectId,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      description: 'Planification projet',
      status: currentProjectId ? 'active' : 'disabled'
    },
    { 
      id: 'finances', 
      label: 'Finances', 
      icon: PieChart, 
      disabled: !currentProjectId,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      description: 'Analyse financière',
      status: currentProjectId ? 'active' : 'disabled'
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      icon: FileText, 
      disabled: !currentProjectId,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      description: 'Documentation projet',
      status: currentProjectId ? 'active' : 'disabled'
    },
    { 
      id: 'quotes', 
      label: 'Devis', 
      icon: Euro, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      description: 'Création et gestion des devis'
    },
    { 
      id: 'quote-comparisons', 
      label: 'Comparaisons Devis', 
      icon: TrendingUp, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Comparer devis estimatifs et définitifs'
    },
    { 
      id: 'approval-workflows', 
      label: 'Workflows Approbation', 
      icon: CheckCircle, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'Gérer les approbations de devis'
    },
    { 
      id: 'external-engineers', 
      label: 'Ingénieurs Externes', 
      icon: UserCheck, 
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      description: 'Réseau d\'ingénieurs partenaires'
    },
    { 
      id: 'study-costs', 
      label: 'Coûts Études', 
      icon: DollarSign, 
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      description: 'Suivi rentabilité des études'
    },
    { 
      id: 'tender-response', 
      label: 'Appels d\'Offres IA', 
      icon: FileText, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'Réponse automatique aux appels d\'offres',
      badge: 'IA'
    },
    { 
      id: 'reports', 
      label: 'Rapports', 
      icon: BarChart3, 
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      description: 'Rapports et analyses'
    },
    { 
      id: 'team', 
      label: 'Équipe', 
      icon: Users, 
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
      description: 'Gestion de l\'équipe'
    },
    { 
      id: 'purchase-orders', 
      label: 'Bons d\'Achat', 
      icon: ShoppingCart, 
      disabled: !currentProjectId,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      description: 'Gestion des commandes et livraisons',
      status: currentProjectId ? 'active' : 'disabled'
    },
    { 
      id: 'payments', 
      label: 'Paiements', 
      icon: CreditCard, 
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
      description: 'Mobile Money et paiements'
    },
    { 
      id: 'locations', 
      label: 'Localisation', 
      icon: MapPin, 
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      description: 'Géolocalisation'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'Centre de notifications'
    },
    { 
      id: 'ocr-scanner', 
      label: 'Scanner OCR IA', 
      icon: Scan, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Reconnaissance optique intelligente'
    },
    { 
      id: 'anomaly-detection', 
      label: 'Détection d\'Anomalies', 
      icon: AlertTriangle, 
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      description: 'Analyse IA des anomalies projet'
    },
    { 
      id: 'architectural-plan-analyzer', 
      label: 'Analyseur de Plans', 
      icon: FileImage, 
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      description: 'Analyse IA de plans architecturaux'
    },
    { 
      id: 'analyse',
      label: 'Analyse de Plan (Page)',
      icon: FileImage,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-400/10',
      description: 'Page dédiée: analyse + devis (Claude)'
    },
    { 
      id: 'rendu-3d',
      label: 'Rendu 3D (Page)',
      icon: Zap,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      description: 'Page dédiée: génération d\'images 3D (Replicate)'
    },
    { 
      id: 'automation-hub', 
      label: 'Automatisations & Workflows', 
      icon: Zap, 
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      description: 'Hub complet d\'automatisation et workflows'
    },
    { 
      id: 'settings', 
      label: 'Paramètres', 
      icon: Wrench, 
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      description: 'Configuration'
    }
      ]
    }
  ];

  const projectStats = getProjectStats(currentProjectId);

  return (
    <div className={`bg-gradient-to-b from-slate-900 to-slate-800 text-white flex-shrink-0 shadow-2xl ${
      collapsed ? 'w-16' : 'w-72'
    } md:relative fixed md:translate-x-0 ${collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'} z-50 h-full md:h-auto`}>
      {/* Header avec logo et toggle */}
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">BTP Manager</div>
              <div className="text-xs text-slate-400">Construction Pro</div>
            </div>
          </div>
        )}
        <button
          onClick={() => onCollapse(!collapsed)}
          className="p-2 rounded-lg group"
          title={collapsed ? 'Agrandir' : 'Réduire'}
        >
          <ChevronLeft className={`h-4 w-4 ${
            !collapsed ? 'rotate-180' : ''
          }`} />
        </button>
      </div>
      
      {/* Sélecteur de projet avec stats */}
      {!collapsed && (
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
          <div className="mb-3">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">
              Projet Actuel
            </label>
            <select
              value={currentProjectId || ''}
              onChange={(e) => onProjectSelect(e.target.value || null)}
              className="w-full bg-slate-700/50 text-white rounded-lg p-3 text-sm border border-slate-600/50 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            >
              <option value="">Sélectionner un projet</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Mini stats du projet */}
          {currentProjectId && projectStats && (
            <div className="bg-slate-700/30 rounded-lg p-3 mb-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <Target className="w-3 h-3 text-orange-400" />
                  <span className="text-slate-300">{projectStats.progress}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span className="text-slate-300">{projectStats.activeTasks}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Euro className="w-3 h-3 text-green-400" />
                  <span className="text-slate-300">{(projectStats.budget / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-3 h-3 text-purple-400" />
                  <span className="text-slate-300">{projectStats.team}</span>
                </div>
              </div>
            </div>
          )}
          
        </div>
      )}
      
      {/* Navigation avec icônes colorées */}
      <nav className="p-3 overflow-y-auto flex-1">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => !item.disabled && onNavigate(item.id)}
                  disabled={item.disabled}
                  className={`group relative flex items-center w-full p-3 rounded-xl ${
                    isActive 
                      ? `bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 text-white shadow-lg` 
                      : item.disabled
                      ? 'text-slate-500 cursor-not-allowed'
                      : `text-slate-300`
                  }`}
                  title={collapsed ? item.label : item.disabled ? 'Sélectionnez d\'abord un projet' : item.description}
                >
                  {/* Indicateur de statut */}
                  {!collapsed && item.status && (
                    <div className={`absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-6 rounded-full ${
                      item.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                  )}
                  
                  {/* Icône avec couleur */}
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    isActive ? 'bg-orange-500/30' : item.disabled ? 'bg-slate-700/30' : item.bgColor
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      isActive ? 'text-orange-300' : item.disabled ? 'text-slate-500' : item.color
                    }`} />
                  </div>
                  
                  {!collapsed && (
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-sm">{item.label}</div>
                    </div>
                  )}
                  
                  {/* Badge de notification (exemple) */}
                  {!collapsed && item.id === 'tasks' && currentProjectId && (
                    <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {projectStats?.activeTasks || 0}
                    </div>
                  )}
                  
                  {/* Effet de hover */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-xl"></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        
        {/* Status en bas */}
        {!collapsed && (
          <div className="mt-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-slate-400">Système en ligne</span>
            </div>
            <div className="text-xs text-slate-500">
              {projects.length} projet{projects.length > 1 ? 's' : ''} • Version 2.1.0
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
