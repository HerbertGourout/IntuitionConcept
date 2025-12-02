import React, { useState } from 'react';
import { Save, X, Plus, Trash2, Settings, Zap, Clock, Webhook, Mail, Bell } from 'lucide-react';
import { automationService, Workflow, WorkflowTrigger, WorkflowAction } from '../../services/automationService';

interface WorkflowCreatorProps {
  workflow?: Workflow;
  onSave?: (workflow: Workflow) => void;
  onCancel?: () => void;
}

export const WorkflowCreator: React.FC<WorkflowCreatorProps> = ({
  workflow,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: workflow?.name || '',
    description: workflow?.description || '',
    isActive: workflow?.isActive || false
  });

  const [trigger, setTrigger] = useState<WorkflowTrigger>(
    workflow?.trigger || {
      id: 'trigger_1',
      type: 'webhook',
      config: {}
    }
  );

  const [actions, setActions] = useState<WorkflowAction[]>(
    workflow?.actions || [{
      id: 'action_1',
      type: 'email',
      config: {}
    }]
  );

  const [saving, setSaving] = useState(false);

  const triggerTypes = [
    { id: 'webhook', label: 'Webhook', icon: Webhook, description: 'Déclenché par un appel HTTP' },
    { id: 'schedule', label: 'Planification', icon: Clock, description: 'Déclenché selon un horaire' },
    { id: 'event', label: 'Événement', icon: Zap, description: 'Déclenché par un événement système' }
  ];

  const actionTypes = [
    { id: 'email', label: 'Email', icon: Mail, description: 'Envoyer un email' },
    { id: 'notification', label: 'Notification', icon: Bell, description: 'Envoyer une notification' },
    { id: 'api_call', label: 'Appel API', icon: Settings, description: 'Effectuer un appel API' },
    { id: 'data_update', label: 'Mise à jour', icon: Settings, description: 'Mettre à jour des données' }
  ];

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Le nom du workflow est requis');
      return;
    }

    setSaving(true);
    try {
      let savedWorkflow: Workflow;
      
      if (workflow) {
        // Mise à jour
        savedWorkflow = await automationService.updateWorkflow(workflow.id, {
          ...formData,
          trigger,
          actions
        }) as Workflow;
      } else {
        // Création
        savedWorkflow = await automationService.createWorkflow({
          ...formData,
          trigger,
          actions,
          createdBy: 'user' // TODO: récupérer l'utilisateur actuel
        });
      }

      onSave?.(savedWorkflow);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du workflow');
    } finally {
      setSaving(false);
    }
  };

  const addAction = () => {
    const newAction: WorkflowAction = {
      id: `action_${actions.length + 1}`,
      type: 'email',
      config: {}
    };
    setActions([...actions, newAction]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, updates: Partial<WorkflowAction>) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updates };
    setActions(newActions);
  };

  const renderTriggerConfig = () => {
    switch (trigger.type) {
      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                URL du Webhook
              </label>
              <input
                type="text"
                value={trigger.config.url || ''}
                onChange={(e) => setTrigger({
                  ...trigger,
                  config: { ...trigger.config, url: e.target.value }
                })}
                placeholder="/webhook/mon-workflow"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        );
      case 'schedule':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Expression Cron
              </label>
              <input
                type="text"
                value={trigger.config.cron || ''}
                onChange={(e) => setTrigger({
                  ...trigger,
                  config: { ...trigger.config, cron: e.target.value }
                })}
                placeholder="0 9 * * 1-5"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                Exemple: "0 9 * * 1-5" = tous les jours ouvrés à 9h
              </p>
            </div>
          </div>
        );
      case 'event':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Type d'événement
              </label>
              <select
                value={trigger.config.event || ''}
                onChange={(e) => setTrigger({
                  ...trigger,
                  config: { ...trigger.config, event: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner un événement</option>
                <option value="quote_created">Devis créé</option>
                <option value="project_started">Projet démarré</option>
                <option value="invoice_paid">Facture payée</option>
                <option value="task_completed">Tâche terminée</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderActionConfig = (action: WorkflowAction, index: number) => {
    switch (action.type) {
      case 'email':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destinataire
              </label>
              <input
                type="email"
                value={(action.config.to as string) || ''}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, to: e.target.value }
                })}
                placeholder="email@exemple.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sujet
              </label>
              <input
                type="text"
                value={(action.config.subject as string) || ''}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, subject: e.target.value }
                })}
                placeholder="Sujet de l'email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={(action.config.message as string) || ''}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, message: e.target.value }
                })}
                placeholder="Contenu du message"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        );
      case 'notification':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <input
                type="text"
                value={(action.config.message as string) || ''}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, message: e.target.value }
                })}
                placeholder="Message de notification"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={(action.config.type as string) || 'info'}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, type: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="info">Information</option>
                <option value="success">Succès</option>
                <option value="warning">Avertissement</option>
                <option value="error">Erreur</option>
              </select>
            </div>
          </div>
        );
      case 'api_call':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                value={(action.config.url as string) || ''}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, url: e.target.value }
                })}
                placeholder="https://api.exemple.com/endpoint"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Méthode
              </label>
              <select
                value={(action.config.method as string) || 'POST'}
                onChange={(e) => updateAction(index, {
                  config: { ...action.config, method: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-t-2xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {workflow ? 'Modifier le Workflow' : 'Créer un Workflow'}
              </h2>
              <p className="text-blue-100 mt-1">
                Configurez les déclencheurs et actions de votre automatisation
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-10">
        {/* Informations générales */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <span>Informations générales</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Nom du workflow *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mon workflow d'automatisation"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
              />
            </div>
            
            <div className="flex items-center justify-center">
              <label className="flex items-center space-x-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activer immédiatement</span>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de ce que fait ce workflow"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
            />
          </div>
        </div>

        {/* Déclencheur */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
            <Zap className="w-6 h-6 text-orange-600" />
            <span>Déclencheur</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {triggerTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setTrigger({ ...trigger, type: type.id as 'webhook' | 'schedule' | 'event' })}
                  className={`p-6 border-2 rounded-2xl text-left transition-all duration-300 hover:scale-105 ${
                    trigger.type === type.id
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-3 ${
                    trigger.type === type.id ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{type.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{type.description}</p>
                </button>
              );
            })}
          </div>

          {trigger.type && (
            <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              {renderTriggerConfig()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Settings className="w-6 h-6 text-purple-600" />
              <span>Actions</span>
            </h3>
            <button
              onClick={addAction}
              className="btn-base btn-gradient-accent hover-lift px-4 py-2 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter une action</span>
            </button>
          </div>

          <div className="space-y-6">
            {actions.map((action, index) => (
              <div key={action.id} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 border border-gray-200 dark:border-gray-600 rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span>Action {index + 1}</span>
                  </h4>
                  {actions.length > 1 && (
                    <button
                      onClick={() => removeAction(index)}
                      className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-300 hover:scale-110"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Type d'action
                    </label>
                    <select
                      value={action.type}
                      onChange={(e) => updateAction(index, { type: e.target.value as 'email' | 'notification' | 'api_call' | 'data_update' })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                    >
                      {actionTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.label} - {type.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    {renderActionConfig(action, index)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-700 p-8 border-t border-gray-200 dark:border-gray-600 rounded-b-2xl flex items-center justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 font-medium"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !formData.name.trim()}
          className="btn-base btn-gradient-accent hover-lift px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {saving && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          <Save className="w-5 h-5" />
          <span>{workflow ? 'Mettre à jour' : 'Créer le workflow'}</span>
        </button>
      </div>
    </div>
  );
};
