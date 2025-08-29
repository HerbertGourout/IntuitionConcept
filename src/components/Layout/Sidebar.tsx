import React, { useState } from 'react';
import { 
  Truck, 
  Euro, 
  FileText, 
  BarChart3, 
  Users,
  Calendar,
  MapPin,
  ChevronLeft,
  PieChart,
  HardHat,
  Hammer,
  Building,
  Wrench,
  Clock,
  Target,
  ShoppingCart
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string, id?: string) => void;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  onCreateProject: () => void;
  currentProjectId: string | null;
  projects: Array<{ id: string; name: string }>;
  onProjectSelect: (projectId: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onNavigate, 
  collapsed, 
  onCollapse,
  onCreateProject,
  currentProjectId,
  projects,
  onProjectSelect
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
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

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Tableau de Bord', 
      icon: HardHat, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      hoverColor: 'hover:bg-orange-500/20',
      description: 'Vue d\'ensemble du projet'
    },
    { 
      id: 'projects', 
      label: 'Projets', 
      icon: Building, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      hoverColor: 'hover:bg-blue-500/20',
      description: 'Gestion des projets'
    },
    { 
      id: 'project-budget', 
      label: 'Budget Projet', 
      icon: Euro, 
      disabled: !currentProjectId,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      hoverColor: 'hover:bg-green-500/20',
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
      hoverColor: 'hover:bg-yellow-500/20',
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
      hoverColor: 'hover:bg-purple-500/20',
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
      hoverColor: 'hover:bg-indigo-500/20',
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
      hoverColor: 'hover:bg-emerald-500/20',
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
      hoverColor: 'hover:bg-cyan-500/20',
      description: 'Documentation projet',
      status: currentProjectId ? 'active' : 'disabled'
    },
    { 
      id: 'quotes', 
      label: 'Devis', 
      icon: Euro, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      hoverColor: 'hover:bg-green-500/20',
      description: 'Création et gestion des devis'
    },
    { 
      id: 'reports', 
      label: 'Rapports', 
      icon: BarChart3, 
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      hoverColor: 'hover:bg-pink-500/20',
      description: 'Rapports et analyses'
    },
    { 
      id: 'team', 
      label: 'Équipe', 
      icon: Users, 
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
      hoverColor: 'hover:bg-violet-500/20',
      description: 'Gestion de l\'équipe'
    },
    { 
      id: 'purchase-orders', 
      label: 'Bons d\'Achat', 
      icon: ShoppingCart, 
      disabled: !currentProjectId,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      hoverColor: 'hover:bg-orange-500/20',
      description: 'Gestion des commandes et livraisons',
      status: currentProjectId ? 'active' : 'disabled'
    },
    { 
      id: 'locations', 
      label: 'Localisation', 
      icon: MapPin, 
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      hoverColor: 'hover:bg-red-500/20',
      description: 'Géolocalisation'
    },
    { 
      id: 'settings', 
      label: 'Paramètres', 
      icon: Wrench, 
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      hoverColor: 'hover:bg-gray-500/20',
      description: 'Configuration'
    }
  ];

  const projectStats = getProjectStats(currentProjectId);

  return (
    <div className={`bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex-shrink-0 shadow-2xl ${
      collapsed ? 'w-16' : 'w-72'
    }`}>
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
          className="p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200 group"
          title={collapsed ? 'Agrandir' : 'Réduire'}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
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
              className="w-full bg-slate-700/50 text-white rounded-lg p-3 text-sm border border-slate-600/50 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
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
          
          <button
            onClick={onCreateProject}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <Building className="w-4 h-4" />
            <span>Nouveau Projet</span>
          </button>
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
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`group relative flex items-center w-full p-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? `bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 text-white shadow-lg` 
                      : item.disabled
                      ? 'text-slate-500 cursor-not-allowed'
                      : `text-slate-300 hover:text-white ${item.hoverColor} hover:shadow-md hover:transform hover:scale-105`
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
                      {hoveredItem === item.id && !item.disabled && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {item.description}
                        </div>
                      )}
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
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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