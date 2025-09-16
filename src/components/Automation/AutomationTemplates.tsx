import React, { useState } from 'react';
import { Clock, Zap, Play, CheckCircle, Bell, Mail, Database } from 'lucide-react';
import { automationService } from '../../services/automationService';

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  estimatedTimeSaved: string;
  businessImpact: string;
  trigger: {
    type: 'webhook' | 'schedule' | 'event';
    config: Record<string, unknown>;
  };
  actions: Array<{
    type: 'email' | 'notification' | 'api_call' | 'data_update';
    config: Record<string, unknown>;
  }>;
}

const PREDEFINED_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'quote-approval-notification',
    name: 'Notification Devis Approuvé',
    description: 'Envoie automatiquement une notification à l\'équipe quand un devis est approuvé',
    category: 'Devis',
    icon: CheckCircle,
    estimatedTimeSaved: '2h/semaine',
    businessImpact: 'Réduction délais de traitement',
    trigger: {
      type: 'webhook',
      config: {
        endpoint: '/webhooks/quote-approved',
        method: 'POST'
      }
    },
    actions: [
      {
        type: 'email',
        config: {
          to: '{{project.manager.email}}',
          subject: 'Devis {{quote.number}} approuvé - {{client.name}}',
          template: 'quote_approved'
        }
      },
      {
        type: 'notification',
        config: {
          type: 'success',
          message: 'Devis {{quote.number}} approuvé par {{client.name}}',
          recipients: ['project_team']
        }
      }
    ]
  },
  {
    id: 'budget-alert-workflow',
    name: 'Alerte Dépassement Budget',
    description: 'Alerte automatique quand un projet dépasse 80% de son budget',
    category: 'Finance',
    icon: Bell,
    estimatedTimeSaved: '1h/jour',
    businessImpact: 'Prévention dépassements budgétaires',
    trigger: {
      type: 'event',
      config: {
        event: 'budget_threshold_exceeded',
        threshold: 0.8
      }
    },
    actions: [
      {
        type: 'email',
        config: {
          to: '{{project.manager.email}}, {{project.client.email}}',
          subject: 'ALERTE: Budget projet {{project.name}} à {{budget.percentage}}%',
          template: 'budget_alert'
        }
      },
      {
        type: 'data_update',
        config: {
          collection: 'projects',
          documentId: '{{project.id}}',
          updates: {
            'alerts.budgetAlert': true,
            'alerts.lastBudgetAlert': '{{timestamp}}'
          }
        }
      }
    ]
  },
  {
    id: 'task-completion-update',
    name: 'Mise à jour Tâche Terminée',
    description: 'Met à jour automatiquement le statut du projet quand toutes les tâches sont terminées',
    category: 'Projet',
    icon: CheckCircle,
    estimatedTimeSaved: '30min/jour',
    businessImpact: 'Suivi temps réel des projets',
    trigger: {
      type: 'event',
      config: {
        event: 'task_completed'
      }
    },
    actions: [
      {
        type: 'data_update',
        config: {
          collection: 'projects',
          documentId: '{{project.id}}',
          updates: {
            'progress': '{{calculated.progress}}',
            'updatedAt': '{{timestamp}}'
          }
        }
      },
      {
        type: 'notification',
        config: {
          type: 'info',
          message: 'Tâche {{task.name}} terminée - Projet à {{project.progress}}%',
          recipients: ['project_team']
        }
      }
    ]
  },
  {
    id: 'equipment-maintenance-reminder',
    name: 'Rappel Maintenance Équipement',
    description: 'Rappel automatique de maintenance préventive des équipements',
    category: 'Équipement',
    icon: Clock,
    estimatedTimeSaved: '1h/semaine',
    businessImpact: 'Réduction pannes équipements',
    trigger: {
      type: 'schedule',
      config: {
        cron: '0 9 * * 1', // Tous les lundis à 9h
        timezone: 'Europe/Paris'
      }
    },
    actions: [
      {
        type: 'email',
        config: {
          to: '{{equipment.responsible.email}}',
          subject: 'Maintenance programmée - {{equipment.name}}',
          template: 'maintenance_reminder'
        }
      },
      {
        type: 'data_update',
        config: {
          collection: 'equipment',
          query: { 'maintenance.nextDate': { '$lte': '{{date.nextWeek}}' } },
          updates: {
            'maintenance.reminderSent': true,
            'maintenance.reminderDate': '{{timestamp}}'
          }
        }
      }
    ]
  },
  {
    id: 'client-invoice-generation',
    name: 'Génération Facture Client',
    description: 'Génère et envoie automatiquement les factures aux clients',
    category: 'Finance',
    icon: Mail,
    estimatedTimeSaved: '3h/semaine',
    businessImpact: 'Accélération encaissements',
    trigger: {
      type: 'event',
      config: {
        event: 'project_milestone_completed'
      }
    },
    actions: [
      {
        type: 'api_call',
        config: {
          url: '/api/invoices/generate',
          method: 'POST',
          body: {
            projectId: '{{project.id}}',
            milestoneId: '{{milestone.id}}',
            clientId: '{{client.id}}'
          }
        }
      },
      {
        type: 'email',
        config: {
          to: '{{client.email}}',
          subject: 'Facture {{invoice.number}} - {{project.name}}',
          template: 'invoice_generated',
          attachments: ['{{invoice.pdfPath}}']
        }
      }
    ]
  },
  {
    id: 'team-daily-report',
    name: 'Rapport Quotidien Équipe',
    description: 'Envoie un rapport quotidien des activités de l\'équipe',
    category: 'Équipe',
    icon: Database,
    estimatedTimeSaved: '45min/jour',
    businessImpact: 'Amélioration communication équipe',
    trigger: {
      type: 'schedule',
      config: {
        cron: '0 18 * * 1-5', // Tous les jours ouvrés à 18h
        timezone: 'Europe/Paris'
      }
    },
    actions: [
      {
        type: 'api_call',
        config: {
          url: '/api/reports/daily-team',
          method: 'GET',
          params: {
            date: '{{date.today}}',
            teamId: '{{team.id}}'
          }
        }
      },
      {
        type: 'email',
        config: {
          to: '{{team.manager.email}}',
          cc: '{{team.members.emails}}',
          subject: 'Rapport quotidien équipe - {{date.today}}',
          template: 'daily_team_report'
        }
      }
    ]
  }
];

export const AutomationTemplates: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<string | null>(null);

  const categories = ['all', 'Devis', 'Projet', 'Finance', 'Équipe', 'Équipement'];

  const filteredTemplates = selectedCategory === 'all' 
    ? PREDEFINED_TEMPLATES 
    : PREDEFINED_TEMPLATES.filter(t => t.category === selectedCategory);

  const createWorkflowFromTemplate = async (template: AutomationTemplate) => {
    setLoading(template.id);
    try {
      await automationService.createWorkflow({
        name: template.name,
        description: template.description,
        trigger: template.trigger,
        actions: template.actions,
        isActive: false, // Créé inactif par défaut
        createdBy: 'system',
        tags: [template.category.toLowerCase(), 'template']
      });

      alert(`✅ Workflow "${template.name}" créé avec succès!\n\nVous pouvez maintenant l'activer depuis la gestion des workflows.`);
      
    } catch (error) {
      console.error('Erreur lors de la création du workflow:', error);
      alert(`❌ Erreur lors de la création du workflow: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl border border-blue-500/20">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Templates d'Automatisation BTP</h1>
            <p className="text-blue-100 text-lg">
              Déployez rapidement des workflows prêts à l'emploi pour votre activité BTP
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{PREDEFINED_TEMPLATES.length}</div>
            <div className="text-blue-200 text-sm">Templates disponibles</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">12h+</div>
            <div className="text-blue-200 text-sm">Temps économisé/semaine</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">6</div>
            <div className="text-blue-200 text-sm">Catégories</div>
          </div>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filtrer par catégorie</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category === 'all' ? 'Toutes' : category}
            </button>
          ))}
        </div>
      </div>


      {/* Liste des templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredTemplates.map(template => {
          const Icon = template.icon;
          return (
            <div key={template.id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{template.name}</h3>
                    <span className="inline-block px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                      {template.category}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">{template.description}</p>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Temps économisé</p>
                  <p className="text-lg text-green-600 dark:text-green-400 font-bold">{template.estimatedTimeSaved}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Impact business</p>
                  <p className="text-lg text-blue-600 dark:text-blue-400 font-bold">{template.businessImpact}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Déclencheur: {template.trigger.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>{template.actions.length} action(s)</span>
                  </div>
                </div>
                
                <button
                  onClick={() => createWorkflowFromTemplate(template)}
                  disabled={loading === template.id}
                  className="btn-base btn-gradient-accent hover-lift px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading === template.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Création...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Utiliser</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-8 max-w-md mx-auto">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Aucun template trouvé</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Aucun template ne correspond à la catégorie sélectionnée.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
