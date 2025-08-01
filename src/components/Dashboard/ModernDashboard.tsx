import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Plus, 
  Layout, 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Grid3X3,
  Maximize2
} from 'lucide-react';
import { useWidgets } from '../../contexts/WidgetContext';
import { useTheme } from '../../contexts/ThemeContext';
import CustomizableWidget from './CustomizableWidget';

// Import des widgets concrets
import ProjectsOverviewWidget from './Widgets/ProjectsOverviewWidget';
import TeamTrackingWidget from './Widgets/TeamTrackingWidget';
import EquipmentScannerWidget from './Widgets/EquipmentScannerWidget';
import BudgetAlertsWidget from './Widgets/BudgetAlertsWidget';
import OfflineStatusWidget from './Widgets/OfflineStatusWidget';

// Import des widgets existants
import WeatherWidget from './widgets/WeatherWidget';
import CircularProgressWidget from './widgets/CircularProgressWidget';
import ActivityTimelineWidget from './widgets/ActivityTimelineWidget';
import RealTimeChartWidget from './widgets/RealTimeChartWidget';

interface ModernDashboardProps {
  onNavigate?: (section: string) => void;
}

const ModernDashboard: React.FC<ModernDashboardProps> = ({ onNavigate }) => {
  const { 
    currentLayout, 
    availableWidgets, 
    addWidget, 
    resetToDefault,
    layouts,
    setCurrentLayout,
    createLayout
  } = useWidgets();
  const { resolvedTheme } = useTheme();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWidgetPalette, setShowWidgetPalette] = useState(false);
  const [showLayoutManager, setShowLayoutManager] = useState(false);

  // Rendu des widgets selon leur type
  const renderWidget = (widgetType: string) => {
    switch (widgetType) {
      case 'projects-overview':
        return <ProjectsOverviewWidget />;
      case 'team-activity':
        return <TeamTrackingWidget />;
      case 'equipment-status':
        return <EquipmentScannerWidget />;
      case 'budget-tracker':
        return <BudgetAlertsWidget />;
      case 'offline-status':
        return <OfflineStatusWidget />;
      case 'weather':
        return <WeatherWidget />;
      case 'tasks-summary':
        return <CircularProgressWidget title="Progression des Tâches" percentage={75} />;
      case 'notifications':
        return <ActivityTimelineWidget />;
      case 'financial-kpi':
        return <RealTimeChartWidget />;
      case 'calendar':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Grid3X3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm opacity-70">Widget Calendrier</p>
              <p className="text-xs opacity-50 mt-1">À implémenter</p>
            </div>
          </div>
        );
      case 'quick-actions':
        return (
          <div className="h-full p-4">
            <h3 className="font-semibold mb-4">Actions Rapides</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate?.('projects')}
                className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Nouveau Projet
              </button>
              <button
                onClick={() => onNavigate?.('planning')}
                className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                Planning
              </button>
              <button
                onClick={() => onNavigate?.('tasks')}
                className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                Tâches
              </button>
              <button
                onClick={() => onNavigate?.('finances')}
                className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
              >
                Budget
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm opacity-70">Widget {widgetType}</p>
              <p className="text-xs opacity-50 mt-1">En cours de développement</p>
            </div>
          </div>
        );
    }
  };

  const getWidgetTitle = (type: string) => {
    const titles: Record<string, string> = {
      'projects-overview': 'Vue d\'ensemble des projets',
      'team-activity': 'Activité de l\'équipe',
      'equipment-status': 'État de l\'équipement',
      'budget-tracker': 'Suivi budgétaire',
      'offline-status': 'Statut hors-ligne',
      'weather': 'Météo du chantier',
      'tasks-summary': 'Résumé des tâches',
      'notifications': 'Notifications',
      'financial-kpi': 'KPI Financiers',
      'calendar': 'Calendrier',
      'quick-actions': 'Actions rapides',
    };
    return titles[type] || type;
  };

  if (!currentLayout) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Aucun layout configuré</p>
          <button
            onClick={() => createLayout('Mon Dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Créer un dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Barre d'outils du dashboard */}
      <div className={`
        sticky top-0 z-40 mb-6 p-4 rounded-xl border backdrop-blur-sm
        ${resolvedTheme === 'dark'
          ? 'bg-gray-800/90 border-gray-700'
          : 'bg-white/90 border-gray-200'
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              📊 Dashboard Moderne
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-70">Layout:</span>
              <select
                value={currentLayout.id}
                onChange={(e) => setCurrentLayout(e.target.value)}
                className={`px-3 py-1 rounded border text-sm ${
                  resolvedTheme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {layouts.map(layout => (
                  <option key={layout.id} value={layout.id}>
                    {layout.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode édition */}
            <motion.button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                ${isEditMode
                  ? 'bg-blue-500 text-white'
                  : resolvedTheme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isEditMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {isEditMode ? 'Quitter' : 'Éditer'}
              </span>
            </motion.button>

            {/* Ajouter widget */}
            {isEditMode && (
              <motion.button
                onClick={() => setShowWidgetPalette(!showWidgetPalette)}
                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Widget</span>
              </motion.button>
            )}

            {/* Réinitialiser */}
            {isEditMode && (
              <motion.button
                onClick={resetToDefault}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                  ${resolvedTheme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">Reset</span>
              </motion.button>
            )}

            {/* Paramètres */}
            <motion.button
              onClick={() => setShowLayoutManager(!showLayoutManager)}
              className={`
                p-2 rounded-lg transition-colors
                ${resolvedTheme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Palette de widgets */}
        <AnimatePresence>
          {showWidgetPalette && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
            >
              <h3 className="text-sm font-medium mb-3">Ajouter un widget :</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {availableWidgets.map((widgetType) => (
                  <motion.button
                    key={widgetType}
                    onClick={() => {
                      addWidget(widgetType);
                      setShowWidgetPalette(false);
                    }}
                    className={`
                      p-3 rounded-lg border text-left transition-all
                      ${resolvedTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      }
                    `}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Layout className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium">
                        {getWidgetTitle(widgetType)}
                      </span>
                    </div>
                    <p className="text-xs opacity-70">
                      Cliquer pour ajouter
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grille de widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min">
        <AnimatePresence>
          {currentLayout.widgets
            .filter(widget => widget.isVisible || isEditMode)
            .map((widget) => (
              <CustomizableWidget
                key={widget.id}
                widget={widget}
                isEditMode={isEditMode}
                onEdit={() => {
                  // Ouvrir un modal de configuration du widget
                  console.log('Configurer widget:', widget.id);
                }}
              >
                {renderWidget(widget.type)}
              </CustomizableWidget>
            ))}
        </AnimatePresence>
      </div>

      {/* Message si aucun widget */}
      {currentLayout.widgets.filter(w => w.isVisible).length === 0 && !isEditMode && (
        <motion.div
          className={`
            flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed
            ${resolvedTheme === 'dark'
              ? 'border-gray-600 text-gray-400'
              : 'border-gray-300 text-gray-500'
            }
          `}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Layout className="w-16 h-16 mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Dashboard vide</h3>
          <p className="text-sm opacity-70 mb-4 text-center max-w-md">
            Votre dashboard ne contient aucun widget visible. 
            Activez le mode édition pour ajouter des widgets.
          </p>
          <button
            onClick={() => setIsEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter des widgets
          </button>
        </motion.div>
      )}

      {/* Indicateur de mode édition */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
          >
            <div className={`
              px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm
              ${resolvedTheme === 'dark'
                ? 'bg-blue-900/90 border-blue-700 text-blue-200'
                : 'bg-blue-50/90 border-blue-200 text-blue-800'
              }
            `}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Mode édition actif</span>
              </div>
              <p className="text-xs opacity-70 mt-1">
                Glissez-déposez pour réorganiser les widgets
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernDashboard;
