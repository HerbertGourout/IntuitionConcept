import React, { useState, useEffect } from 'react';
import { Plus, Play, Pause, Edit, Trash2, Clock, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { automationService, Workflow, WorkflowExecution } from '../../services/automationService';
import { CRITICAL_AUTOMATIONS } from '../../config/automationWorkflows';
import { WorkflowCreator } from './WorkflowCreator';

export const WorkflowManager: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<Record<string, WorkflowExecution[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'active' | 'templates' | 'executions'>('active');
  const [showCreator, setShowCreator] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | undefined>();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const workflowList = automationService.getWorkflows();
      setWorkflows(workflowList);
      
      // Charger les exécutions pour chaque workflow
      const executionData: Record<string, WorkflowExecution[]> = {};
      workflowList.forEach(workflow => {
        executionData[workflow.id] = automationService.getWorkflowExecutions(workflow.id);
      });
      setExecutions(executionData);
    } catch (error) {
      console.error('Erreur lors du chargement des workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkflow = async (workflowId: string, isActive: boolean) => {
    try {
      await automationService.toggleWorkflow(workflowId, isActive);
      loadWorkflows();
    } catch (error) {
      console.error('Erreur lors de l\'activation/désactivation:', error);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce workflow ?')) {
      try {
        await automationService.deleteWorkflow(workflowId);
        loadWorkflows();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      await automationService.executeWorkflow(workflowId);
      loadWorkflows();
    } catch (error) {
      console.error('Erreur lors de l\'exécution:', error);
    }
  };

  const createTemplateWorkflow = async (template: typeof CRITICAL_AUTOMATIONS[0]) => {
    try {
      await automationService.createWorkflow({
        name: template.name,
        description: template.description,
        trigger: {
          id: 'trigger_1',
          type: 'webhook',
          config: { url: `/webhook/${template.id}` }
        },
        actions: [
          {
            id: 'action_1',
            type: 'notification',
            config: { message: `Automation: ${template.name}` }
          }
        ],
        isActive: false,
        createdBy: 'system'
      });
      loadWorkflows();
    } catch (error) {
      console.error('Erreur lors de la création du template:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestionnaire d'Automatisations</h1>
            <p className="text-blue-100">
              Gérez vos workflows n8n et automatisations BTP
            </p>
          </div>
          <button
            onClick={() => setShowCreator(true)}
            className="btn-base btn-gradient-accent hover-lift px-6 py-3 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau Workflow</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1 p-4 bg-gray-50 dark:bg-gray-700 rounded-t-2xl">
          {[
            { id: 'active', label: 'Workflows Actifs', count: workflows.filter(w => w.isActive).length },
            { id: 'templates', label: 'Templates', count: CRITICAL_AUTOMATIONS.length },
            { id: 'executions', label: 'Exécutions', count: Object.values(executions).flat().length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as 'active' | 'templates' | 'executions')}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                selectedTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-600'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                selectedTab === tab.id 
                  ? 'bg-blue-400 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

      {/* Content */}
      <div className="p-6">
        {selectedTab === 'active' && (
          <div className="space-y-4">
            {workflows.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun workflow configuré</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Créez votre premier workflow pour automatiser vos processus BTP
                </p>
                <button
                  onClick={() => setShowCreator(true)}
                  className="btn-base btn-gradient-accent hover-lift px-6 py-3"
                >
                  Créer un workflow
                </button>
              </div>
            ) : (
              workflows.map(workflow => (
                <div key={workflow.id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{workflow.name}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          workflow.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {workflow.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      {workflow.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{workflow.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>Trigger: {workflow.trigger.type}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span>{workflow.actions.length} action(s)</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          <span>Créé le {new Date(workflow.createdAt).toLocaleDateString('fr-FR')}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExecuteWorkflow(workflow.id)}
                        className="p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-300 hover:scale-110"
                        title="Exécuter maintenant"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleToggleWorkflow(workflow.id, !workflow.isActive)}
                        className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                          workflow.isActive 
                            ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30' 
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                        }`}
                        title={workflow.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {workflow.isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingWorkflow(workflow);
                          setShowCreator(true);
                        }}
                        className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl transition-all duration-300 hover:scale-110"
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-300 hover:scale-110"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Dernières exécutions */}
                  {executions[workflow.id] && executions[workflow.id].length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Dernières exécutions</h4>
                      <div className="flex flex-wrap gap-2">
                        {executions[workflow.id].slice(0, 5).map(execution => (
                          <div
                            key={execution.id}
                            className={`px-3 py-2 text-xs rounded-full flex items-center space-x-2 font-medium ${getStatusColor(execution.status)}`}
                          >
                            {getStatusIcon(execution.status)}
                            <span>{new Date(execution.startedAt).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CRITICAL_AUTOMATIONS.map(template => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      template.priority === 'critique' ? 'bg-red-100 text-red-800' :
                      template.priority === 'haute' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {template.priority}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{template.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="text-xs text-gray-500">
                    <strong>Économies:</strong> {template.estimatedTimeSaved}
                  </div>
                  <div className="text-xs text-gray-500">
                    <strong>Fréquence:</strong> {template.frequency}
                  </div>
                </div>

                <button
                  onClick={() => createTemplateWorkflow(template)}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Créer ce workflow
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'executions' && (
          <div className="space-y-4">
            {Object.values(executions).flat().length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune exécution</h3>
                <p className="text-gray-600">
                  Les exécutions de vos workflows apparaîtront ici
                </p>
              </div>
            ) : (
              Object.entries(executions).map(([workflowId, workflowExecutions]) => {
                const workflow = workflows.find(w => w.id === workflowId);
                if (!workflow || workflowExecutions.length === 0) return null;

                return (
                  <div key={workflowId} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">{workflow.name}</h3>
                    <div className="space-y-2">
                      {workflowExecutions.slice(0, 10).map(execution => (
                        <div key={execution.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(execution.status)}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {execution.status === 'completed' ? 'Exécution réussie' :
                                 execution.status === 'failed' ? 'Exécution échouée' :
                                 'En cours d\'exécution'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(execution.startedAt).toLocaleString('fr-FR')}
                                {execution.completedAt && (
                                  <span> - Durée: {Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000)}s</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {execution.error && (
                            <div className="text-xs text-red-600 max-w-xs truncate" title={execution.error}>
                              {execution.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      </div>

      {/* Modal de création/édition */}
      {showCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <WorkflowCreator
              workflow={editingWorkflow}
              onSave={() => {
                loadWorkflows();
                setShowCreator(false);
                setEditingWorkflow(undefined);
              }}
              onCancel={() => {
                setShowCreator(false);
                setEditingWorkflow(undefined);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
