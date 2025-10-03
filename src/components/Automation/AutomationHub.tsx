import React, { useState } from 'react';
import { Zap, Settings, Target, ArrowRight, BarChart3 } from 'lucide-react';
import { AutomationDashboard } from './AutomationDashboard';
import { WorkflowManager } from './WorkflowManager';
import { AutomationTemplates } from './AutomationTemplates';

type AutomationView = 'dashboard' | 'workflows' | 'templates';

const AutomationHub: React.FC = () => {
  const [activeView, setActiveView] = useState<AutomationView>('dashboard');

  const navigationItems = [
    {
      id: 'dashboard' as AutomationView,
      label: 'Tableau de Bord',
      icon: BarChart3,
      description: 'Vue d\'ensemble des automatisations',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      hoverColor: 'hover:bg-blue-500/20'
    },
    {
      id: 'workflows' as AutomationView,
      label: 'Gestion Workflows',
      icon: Settings,
      description: 'Créer et gérer les workflows',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      hoverColor: 'hover:bg-purple-500/20'
    },
    {
      id: 'templates' as AutomationView,
      label: 'Templates Auto',
      icon: Target,
      description: 'Templates d\'automatisation prêts',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      hoverColor: 'hover:bg-green-500/20'
    }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <AutomationDashboard />;
      case 'workflows':
        return <WorkflowManager />;
      case 'templates':
        return <AutomationTemplates />;
      default:
        return <AutomationDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Zap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Hub d'Automatisation
                </h1>
                <p className="text-blue-100 text-sm">
                  Gestion complète des workflows et templates d'automatisation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`group relative flex items-center p-4 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-gray-900 dark:text-white shadow-lg' 
                        : `text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${item.hoverColor} hover:shadow-md hover:transform hover:scale-105`
                    }`}
                  >
                    {/* Icône avec couleur */}
                    <div className={`flex-shrink-0 p-3 rounded-xl ${
                      isActive ? 'bg-blue-500/30' : item.bgColor
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : item.color
                      }`} />
                    </div>
                    
                    <div className="ml-4 flex-1 text-left">
                      <div className="font-semibold text-lg">{item.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.description}
                      </div>
                    </div>
                    
                    {/* Flèche pour l'item actif */}
                    {isActive && (
                      <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                    
                    {/* Effet de hover */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="transition-all duration-300">
          {renderContent()}
        </div>
    </div>
  );
};

export default AutomationHub;
