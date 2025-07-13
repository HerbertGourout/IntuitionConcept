import React from 'react';
import { 
  Home, 
  FolderOpen, 
  Truck, 
  ClipboardList, 
  Euro, 
  FileText, 
  BarChart3, 
  Settings,
  Users,
  Calendar,
  MapPin,
  ChevronLeft,
  PieChart
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
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: Home },
    { id: 'projects', label: 'Projets', icon: FolderOpen },
    { id: 'project-budget', label: 'Budget Projet', icon: PieChart, disabled: !currentProjectId },
    { id: 'equipment', label: 'Équipements', icon: Truck, disabled: !currentProjectId },
    { id: 'tasks', label: 'Tâches', icon: ClipboardList, disabled: !currentProjectId },
    { id: 'planning', label: 'Planning', icon: Calendar, disabled: !currentProjectId },
    { id: 'finances', label: 'Finances', icon: Euro, disabled: !currentProjectId },
    { id: 'documents', label: 'Documents', icon: FileText, disabled: !currentProjectId },
    { id: 'reports', label: 'Rapports', icon: BarChart3 },
    { id: 'team', label: 'Équipe', icon: Users },
    { id: 'locations', label: 'Localisation', icon: MapPin },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <div className={`bg-slate-900 text-white transition-all duration-300 flex-shrink-0 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        {!collapsed && (
          <div className="text-lg font-semibold">
            {currentProjectId 
              ? projects.find(p => p.id === currentProjectId)?.name || 'Projet sélectionné'
              : 'Aucun projet'}
          </div>
        )}
        <button
          onClick={() => onCollapse(!collapsed)}
          className="p-1 rounded-full hover:bg-slate-700 transition-colors"
          title={collapsed ? 'Agrandir' : 'Réduire'}
        >
          <ChevronLeft className={`h-5 w-5 transition-transform ${!collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {!collapsed && (
        <div className="p-4 border-b border-slate-700">
          <select
            value={currentProjectId || ''}
            onChange={(e) => onProjectSelect(e.target.value || null)}
            className="w-full bg-slate-800 text-white rounded p-2 text-sm"
          >
            <option value="">Sélectionner un projet</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <button
            onClick={onCreateProject}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
          >
            Nouveau Projet
          </button>
        </div>
      )}
      
      <nav className="p-4 overflow-y-auto flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => !item.disabled && onNavigate(item.id)}
                  disabled={item.disabled}
                  className={`flex items-center p-3 rounded-lg transition-colors w-full text-left ${
                    activeSection === item.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800'
                  } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={collapsed ? item.label : item.disabled ? 'Sélectionnez d\'abord un projet' : item.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="ml-3">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;