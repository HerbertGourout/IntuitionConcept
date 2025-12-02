import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronRight,
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
  DollarSign
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

const SidebarCollapsible: React.FC<SidebarProps> = ({ 
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
      'docs': false,
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
      color: 'text-blue-400',
      items: [
        { id: 'dashboard', label: 'Tableau de Bord', icon: HardHat, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
        { id: 'projects', label: 'Projets', icon: Building, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
        { id: 'project-budget', label: 'Budget Projet', icon: Euro, disabled: !currentProjectId, color: 'text-green-500', bgColor: 'bg-green-500/10' },
        { id: 'equipment', label: 'Équipements', icon: Truck, disabled: !currentProjectId, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
        { id: 'tasks', label: 'Tâches', icon: Hammer, disabled: !currentProjectId, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
        { id: 'planning', label: 'Planning', icon: Calendar, disabled: !currentProjectId, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
      ]
    },
    {
      id: 'finance',
      title: 'FINANCES',
      icon: PieChart,
      color: 'text-green-400',
      items: [
        { id: 'finances', label: 'Finances', icon: PieChart, disabled: !currentProjectId, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
        { id: 'payments', label: 'Paiements', icon: CreditCard, color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
        { id: 'purchase-orders', label: 'Bons d\'Achat', icon: ShoppingCart, disabled: !currentProjectId, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
      ]
    },
    {
      id: 'quotes',
      title: 'DEVIS & ÉTUDES',
      icon: FileText,
      color: 'text-purple-400',
      items: [
        { id: 'quotes', label: 'Devis', icon: Euro, color: 'text-green-500', bgColor: 'bg-green-500/10' },
        { id: 'quote-comparisons', label: 'Comparaisons', icon: TrendingUp, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
        { id: 'approval-workflows', label: 'Workflows', icon: CheckCircle, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
        { id: 'external-engineers', label: 'Ingénieurs Externes', icon: UserCheck, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
        { id: 'study-costs', label: 'Coûts Études', icon: DollarSign, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
        { id: 'tender-response', label: 'Réponse Appels d\'Offres', icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-500/10', badge: 'IA' },
      ]
    },
    {
      id: 'docs',
      title: 'DOCUMENTS & RAPPORTS',
      icon: FileText,
      color: 'text-cyan-400',
      items: [
        { id: 'documents', label: 'Documents', icon: FileText, disabled: !currentProjectId, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
        { id: 'reports', label: 'Rapports', icon: BarChart3, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
      ]
    },
    {
      id: 'team',
      title: 'ÉQUIPE & COLLABORATION',
      icon: Users,
      color: 'text-violet-400',
      items: [
        { id: 'team', label: 'Équipe', icon: Users, color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
        { id: 'locations', label: 'Localisation', icon: MapPin, color: 'text-red-500', bgColor: 'bg-red-500/10' },
        { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
      ]
    },
    {
      id: 'ai',
      title: 'Système automatisé',
      icon: Zap,
      color: 'text-yellow-400',
      items: [
        { id: 'ocr-scanner', label: 'Scanner OCR', icon: Scan, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
        { id: 'anomaly-detection', label: 'Détection Anomalies', icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
        { id: 'architectural-plan-analyzer', label: 'Analyseur Plans', icon: FileImage, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
        { id: 'analyse', label: 'Analyse Plan', icon: FileImage, color: 'text-indigo-400', bgColor: 'bg-indigo-400/10' },
        { id: 'rendu-3d', label: 'Rendu 3D', icon: Zap, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
        { id: 'automation-hub', label: 'Automatisations', icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
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
          className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
          title={collapsed ? 'Agrandir' : 'Réduire'}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${
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
              className="w-full bg-slate-700/50 text-white rounded-lg p-3 text-sm border border-slate-600/50 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
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
            <div className="bg-slate-700/30 rounded-lg p-3">
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
      
      {/* Navigation avec sections collapsibles */}
      <nav className="p-3 overflow-y-auto flex-1 max-h-[calc(100vh-300px)]">
        <div className="space-y-2">
          {menuSections.map((section) => {
            const SectionIcon = section.icon;
            const isExpanded = expandedSections[section.id];
            
            return (
              <div key={section.id}>
                {/* Section Header */}
                {!collapsed && (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-700/30 transition-colors group"
                  >
                    <div className="flex items-center space-x-2">
                      <SectionIcon className={`w-4 h-4 ${section.color}`} />
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                        {section.title}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                    )}
                  </button>
                )}
                
                {/* Section Items */}
                {(isExpanded || collapsed) && (
                  <div className={`space-y-1 ${!collapsed ? 'mt-1 ml-2' : ''}`}>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => !item.disabled && onNavigate(item.id)}
                          disabled={item.disabled}
                          className={`group relative flex items-center w-full p-2.5 rounded-lg transition-all ${
                            isActive 
                              ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 text-white shadow-lg' 
                              : item.disabled
                              ? 'text-slate-500 cursor-not-allowed opacity-50'
                              : 'text-slate-300 hover:bg-slate-700/30'
                          }`}
                          title={collapsed ? item.label : undefined}
                        >
                          {/* Icône */}
                          <div className={`flex-shrink-0 p-1.5 rounded-lg ${
                            isActive ? 'bg-orange-500/30' : item.disabled ? 'bg-slate-700/30' : item.bgColor
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              isActive ? 'text-orange-300' : item.disabled ? 'text-slate-500' : item.color
                            }`} />
                          </div>
                          
                          {!collapsed && (
                            <div className="ml-3 flex-1 text-left">
                              <div className="font-medium text-sm">{item.label}</div>
                            </div>
                          )}
                          
                          {/* Badge */}
                          {!collapsed && item.badge && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-full font-bold">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Paramètres en bas */}
        {!collapsed && (
          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <button
              onClick={() => onNavigate('settings')}
              className={`group relative flex items-center w-full p-2.5 rounded-lg transition-all ${
                activeSection === 'settings'
                  ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 text-white'
                  : 'text-slate-300 hover:bg-slate-700/30'
              }`}
            >
              <div className={`flex-shrink-0 p-1.5 rounded-lg ${
                activeSection === 'settings' ? 'bg-orange-500/30' : 'bg-gray-500/10'
              }`}>
                <Wrench className={`w-4 h-4 ${
                  activeSection === 'settings' ? 'text-orange-300' : 'text-gray-500'
                }`} />
              </div>
              <div className="ml-3 flex-1 text-left">
                <div className="font-medium text-sm">Paramètres</div>
              </div>
            </button>
          </div>
        )}
        
        {/* Status en bas */}
        {!collapsed && (
          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
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

export default SidebarCollapsible;
