import React from 'react';
import { Button, Card, Divider } from 'antd';
import { 
  Bell, 
  Plus, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Wrench,
  CreditCard,
  MapPin,
  Users
} from 'lucide-react';
import { NotificationTriggers } from '../../utils/notificationTriggers';
import { useAuth } from '../../contexts/AuthContext';
import { message } from 'antd';

const NotificationDemo: React.FC = () => {
  const { user } = useAuth();

  const createDemoNotification = async (type: string) => {
    if (!user?.uid) {
      message.error('Vous devez être connecté pour créer des notifications');
      return;
    }

    try {
      switch (type) {
        case 'project-created':
          await NotificationTriggers.onProjectCreated(
            user.uid,
            'demo-project-1',
            'Construction Résidentielle Abidjan'
          );
          break;
          
        case 'payment-success':
          await NotificationTriggers.onPaymentSuccess(
            user.uid,
            'demo-payment-1',
            50000,
            'FCFA'
          );
          break;
          
        case 'payment-failed':
          await NotificationTriggers.onPaymentFailed(
            user.uid,
            'demo-payment-2',
            25000,
            'FCFA',
            'Solde insuffisant'
          );
          break;
          
        case 'equipment-maintenance':
          await NotificationTriggers.onEquipmentMaintenanceDue(
            user.uid,
            'demo-equipment-1',
            'Excavatrice CAT 320',
            '15 janvier 2025'
          );
          break;
          
        case 'equipment-breakdown':
          await NotificationTriggers.onEquipmentBreakdown(
            user.uid,
            'demo-equipment-2',
            'Grue mobile Liebherr'
          );
          break;
          
        case 'budget-exceeded':
          await NotificationTriggers.onProjectBudgetExceeded(
            user.uid,
            'demo-project-2',
            'Rénovation Bureau Dakar',
            1000000,
            1250000
          );
          break;
          
        case 'task-overdue':
          await NotificationTriggers.onTaskOverdue(
            user.uid,
            'demo-project-3',
            'Installation électrique phase 1'
          );
          break;
          
        case 'team-member-added':
          await NotificationTriggers.onTeamMemberAdded(
            user.uid,
            'Amadou Diallo',
            'Ingénieur Civil'
          );
          break;
          
        case 'location-added':
          await NotificationTriggers.onLocationAdded(
            user.uid,
            'demo-location-1',
            'Chantier Plateau',
            'site de construction'
          );
          break;
          
        case 'system-update':
          await NotificationTriggers.onSystemUpdate(
            user.uid,
            'v2.1.0',
            ['Notifications temps réel', 'Cartes interactives', 'Rapports PDF améliorés']
          );
          break;
          
        default:
          message.error('Type de notification non reconnu');
          return;
      }
      
      message.success('Notification de démonstration créée !');
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      message.error('Erreur lors de la création de la notification');
    }
  };

  const demoButtons = [
    {
      key: 'project-created',
      label: 'Projet créé',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Notification de création de projet'
    },
    {
      key: 'payment-success',
      label: 'Paiement réussi',
      icon: <CreditCard className="w-4 h-4" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Confirmation de paiement Mobile Money'
    },
    {
      key: 'payment-failed',
      label: 'Paiement échoué',
      icon: <XCircle className="w-4 h-4" />,
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Échec de paiement avec raison'
    },
    {
      key: 'equipment-maintenance',
      label: 'Maintenance due',
      icon: <Wrench className="w-4 h-4" />,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      description: 'Maintenance d\'équipement requise'
    },
    {
      key: 'equipment-breakdown',
      label: 'Panne équipement',
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'bg-red-600 hover:bg-red-700',
      description: 'Panne critique d\'équipement'
    },
    {
      key: 'budget-exceeded',
      label: 'Budget dépassé',
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Dépassement de budget projet'
    },
    {
      key: 'task-overdue',
      label: 'Tâche en retard',
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      description: 'Tâche dépassant la date limite'
    },
    {
      key: 'team-member-added',
      label: 'Nouveau membre',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Ajout d\'un membre d\'équipe'
    },
    {
      key: 'location-added',
      label: 'Nouvelle localisation',
      icon: <MapPin className="w-4 h-4" />,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      description: 'Ajout d\'une localisation'
    },
    {
      key: 'system-update',
      label: 'Mise à jour système',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-cyan-500 hover:bg-cyan-600',
      description: 'Nouvelle version disponible'
    }
  ];

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Démonstration des Notifications
        </h2>
        <p className="text-gray-600">
          Cliquez sur les boutons ci-dessous pour générer des notifications de démonstration et tester le système.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoButtons.map((button) => (
          <div key={button.key} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 ${button.color} rounded-lg flex items-center justify-center text-white`}>
                {button.icon}
              </div>
              <h3 className="font-medium text-gray-900">{button.label}</h3>
            </div>
            <p className="text-sm text-gray-500 mb-3">{button.description}</p>
            <Button
              type="primary"
              size="small"
              icon={<Plus className="w-3 h-3" />}
              onClick={() => createDemoNotification(button.key)}
              className={`${button.color} border-0 w-full`}
            >
              Créer
            </Button>
          </div>
        ))}
      </div>

      <Divider />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Instructions
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Cliquez sur les boutons pour créer des notifications de test</li>
          <li>• Vérifiez la cloche de notification dans l'en-tête pour voir le compteur</li>
          <li>• Cliquez sur la cloche pour ouvrir le panneau de notifications</li>
          <li>• Allez dans le Centre de Notifications pour une vue complète</li>
          <li>• Les notifications sont sauvegardées dans Firebase en temps réel</li>
        </ul>
      </div>
    </Card>
  );
};

export default NotificationDemo;
