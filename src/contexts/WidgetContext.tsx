import React, { createContext, useContext, useEffect, useState } from 'react';

export type WidgetSize = 'small' | 'medium' | 'large' | 'xl';
export type WidgetType = 
  | 'projects-overview' 
  | 'tasks-summary' 
  | 'budget-tracker' 
  | 'team-activity' 
  | 'weather' 
  | 'calendar' 
  | 'notifications' 
  | 'quick-actions'
  | 'gantt-preview'
  | 'financial-kpi'
  | 'equipment-status'
  | 'recent-documents';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: { x: number; y: number };
  isVisible: boolean;
  config?: Record<string, unknown>;
  lastUpdated?: Date;
}

export interface WidgetLayout {
  id: string;
  name: string;
  widgets: Widget[];
  isDefault?: boolean;
}

interface WidgetContextType {
  layouts: WidgetLayout[];
  currentLayout: WidgetLayout | null;
  availableWidgets: WidgetType[];
  setCurrentLayout: (layoutId: string) => void;
  createLayout: (name: string) => void;
  deleteLayout: (layoutId: string) => void;
  addWidget: (type: WidgetType, position?: { x: number; y: number }) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<Widget>) => void;
  moveWidget: (widgetId: string, position: { x: number; y: number }) => void;
  resizeWidget: (widgetId: string, size: WidgetSize) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  resetToDefault: () => void;
  exportLayout: () => string;
  importLayout: (layoutData: string) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const useWidgets = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
};

// Configuration par défaut des widgets
const defaultWidgets: Widget[] = [
  {
    id: 'projects-overview-1',
    type: 'projects-overview',
    title: 'Vue d\'ensemble des projets',
    size: 'large',
    position: { x: 0, y: 0 },
    isVisible: true,
  },
  {
    id: 'tasks-summary-1',
    type: 'tasks-summary',
    title: 'Résumé des tâches',
    size: 'medium',
    position: { x: 2, y: 0 },
    isVisible: true,
  },
  {
    id: 'budget-tracker-1',
    type: 'budget-tracker',
    title: 'Suivi budgétaire',
    size: 'medium',
    position: { x: 0, y: 1 },
    isVisible: true,
  },
  {
    id: 'team-activity-1',
    type: 'team-activity',
    title: 'Activité de l\'équipe',
    size: 'small',
    position: { x: 2, y: 1 },
    isVisible: true,
  },
  {
    id: 'weather-1',
    type: 'weather',
    title: 'Météo du chantier',
    size: 'small',
    position: { x: 3, y: 1 },
    isVisible: true,
  },
  {
    id: 'quick-actions-1',
    type: 'quick-actions',
    title: 'Actions rapides',
    size: 'small',
    position: { x: 3, y: 0 },
    isVisible: true,
  },
];

const defaultLayout: WidgetLayout = {
  id: 'default',
  name: 'Layout par défaut',
  widgets: defaultWidgets,
  isDefault: true,
};

interface WidgetProviderProps {
  children: React.ReactNode;
}

export const WidgetProvider: React.FC<WidgetProviderProps> = ({ children }) => {
  const [layouts, setLayouts] = useState<WidgetLayout[]>([defaultLayout]);
  const [currentLayoutId, setCurrentLayoutId] = useState<string>('default');

  const currentLayout = layouts.find(l => l.id === currentLayoutId) || null;

  const availableWidgets: WidgetType[] = [
    'projects-overview',
    'tasks-summary',
    'budget-tracker',
    'team-activity',
    'weather',
    'calendar',
    'notifications',
    'quick-actions',
    'gantt-preview',
    'financial-kpi',
    'equipment-status',
    'recent-documents',
  ];

  // Charger les layouts depuis localStorage
  useEffect(() => {
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    const savedCurrentLayout = localStorage.getItem('current-layout');
    
    if (savedLayouts) {
      try {
        const parsedLayouts = JSON.parse(savedLayouts);
        setLayouts(parsedLayouts);
      } catch (error) {
        console.error('Erreur lors du chargement des layouts:', error);
      }
    }
    
    if (savedCurrentLayout) {
      setCurrentLayoutId(savedCurrentLayout);
    }
  }, []);

  // Sauvegarder les layouts dans localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
    localStorage.setItem('current-layout', currentLayoutId);
  }, [layouts, currentLayoutId]);

  const setCurrentLayout = (layoutId: string) => {
    setCurrentLayoutId(layoutId);
  };

  const createLayout = (name: string) => {
    const newLayout: WidgetLayout = {
      id: `layout-${Date.now()}`,
      name,
      widgets: [...defaultWidgets],
    };
    setLayouts(prev => [...prev, newLayout]);
    setCurrentLayoutId(newLayout.id);
  };

  const deleteLayout = (layoutId: string) => {
    if (layoutId === 'default') return; // Ne pas supprimer le layout par défaut
    
    setLayouts(prev => prev.filter(l => l.id !== layoutId));
    if (currentLayoutId === layoutId) {
      setCurrentLayoutId('default');
    }
  };

  const addWidget = (type: WidgetType, position = { x: 0, y: 0 }) => {
    if (!currentLayout) return;

    const newWidget: Widget = {
      id: `${type}-${Date.now()}`,
      type,
      title: getWidgetTitle(type),
      size: getDefaultSize(type),
      position,
      isVisible: true,
      lastUpdated: new Date(),
    };

    setLayouts(prev => prev.map(layout => 
      layout.id === currentLayoutId
        ? { ...layout, widgets: [...layout.widgets, newWidget] }
        : layout
    ));
  };

  const removeWidget = (widgetId: string) => {
    setLayouts(prev => prev.map(layout => 
      layout.id === currentLayoutId
        ? { ...layout, widgets: layout.widgets.filter(w => w.id !== widgetId) }
        : layout
    ));
  };

  const updateWidget = (widgetId: string, updates: Partial<Widget>) => {
    setLayouts(prev => prev.map(layout => 
      layout.id === currentLayoutId
        ? {
            ...layout,
            widgets: layout.widgets.map(widget =>
              widget.id === widgetId
                ? { ...widget, ...updates, lastUpdated: new Date() }
                : widget
            )
          }
        : layout
    ));
  };

  const moveWidget = (widgetId: string, position: { x: number; y: number }) => {
    updateWidget(widgetId, { position });
  };

  const resizeWidget = (widgetId: string, size: WidgetSize) => {
    updateWidget(widgetId, { size });
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const widget = currentLayout?.widgets.find(w => w.id === widgetId);
    if (widget) {
      updateWidget(widgetId, { isVisible: !widget.isVisible });
    }
  };

  const resetToDefault = () => {
    setLayouts(prev => prev.map(layout => 
      layout.id === currentLayoutId
        ? { ...layout, widgets: [...defaultWidgets] }
        : layout
    ));
  };

  const exportLayout = (): string => {
    if (!currentLayout) return '';
    return JSON.stringify(currentLayout, null, 2);
  };

  const importLayout = (layoutData: string) => {
    try {
      const importedLayout = JSON.parse(layoutData) as WidgetLayout;
      importedLayout.id = `imported-${Date.now()}`;
      importedLayout.name = `${importedLayout.name} (Importé)`;
      
      setLayouts(prev => [...prev, importedLayout]);
      setCurrentLayoutId(importedLayout.id);
    } catch (error) {
      console.error('Erreur lors de l\'importation du layout:', error);
    }
  };

  const value: WidgetContextType = {
    layouts,
    currentLayout,
    availableWidgets,
    setCurrentLayout,
    createLayout,
    deleteLayout,
    addWidget,
    removeWidget,
    updateWidget,
    moveWidget,
    resizeWidget,
    toggleWidgetVisibility,
    resetToDefault,
    exportLayout,
    importLayout,
  };

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
};

// Utilitaires
const getWidgetTitle = (type: WidgetType): string => {
  const titles: Record<WidgetType, string> = {
    'projects-overview': 'Vue d\'ensemble des projets',
    'tasks-summary': 'Résumé des tâches',
    'budget-tracker': 'Suivi budgétaire',
    'team-activity': 'Activité de l\'équipe',
    'weather': 'Météo du chantier',
    'calendar': 'Calendrier',
    'notifications': 'Notifications',
    'quick-actions': 'Actions rapides',
    'gantt-preview': 'Aperçu Gantt',
    'financial-kpi': 'KPI Financiers',
    'equipment-status': 'État de l\'équipement',
    'recent-documents': 'Documents récents',
  };
  return titles[type];
};

const getDefaultSize = (type: WidgetType): WidgetSize => {
  const sizes: Record<WidgetType, WidgetSize> = {
    'projects-overview': 'large',
    'tasks-summary': 'medium',
    'budget-tracker': 'medium',
    'team-activity': 'small',
    'weather': 'small',
    'calendar': 'medium',
    'notifications': 'small',
    'quick-actions': 'small',
    'gantt-preview': 'xl',
    'financial-kpi': 'large',
    'equipment-status': 'medium',
    'recent-documents': 'medium',
  };
  return sizes[type];
};
