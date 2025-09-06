import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Mail, 
  Clock, 
  Save,
  RotateCcw
} from 'lucide-react';
import { Card, Switch, Button, TimePicker, Divider, message } from 'antd';
import { useNotifications } from '../../contexts/NotificationContext';
import { NotificationPreferences as NotificationPrefsType } from '../../types/notification';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const NotificationPreferences: React.FC = () => {
  const { user } = useAuth();
  const { preferences, updatePreferences } = useNotifications();
  const [localPreferences, setLocalPreferences] = useState<NotificationPrefsType | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize local preferences when component mounts or preferences change
  useEffect(() => {
    if (preferences) {
      setLocalPreferences({ ...preferences });
      setHasChanges(false);
    } else if (user?.uid) {
      // Create default preferences if none exist
      const defaultPrefs: NotificationPrefsType = {
        userId: user.uid,
        emailNotifications: true,
        pushNotifications: true,
        categories: {
          project: true,
          payment: true,
          equipment: true,
          team: true,
          system: true,
          location: true
        },
        priorities: {
          low: true,
          medium: true,
          high: true,
          urgent: true
        },
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00'
        },
        updatedAt: new Date().toISOString()
      };
      setLocalPreferences(defaultPrefs);
    }
  }, [preferences, user?.uid]);

  const handleCategoryChange = (category: keyof NotificationPrefsType['categories'], enabled: boolean) => {
    if (!localPreferences) return;
    
    setLocalPreferences({
      ...localPreferences,
      categories: {
        ...localPreferences.categories,
        [category]: enabled
      }
    });
    setHasChanges(true);
  };

  const handlePriorityChange = (priority: keyof NotificationPrefsType['priorities'], enabled: boolean) => {
    if (!localPreferences) return;
    
    setLocalPreferences({
      ...localPreferences,
      priorities: {
        ...localPreferences.priorities,
        [priority]: enabled
      }
    });
    setHasChanges(true);
  };

  const handleQuietHoursChange = (field: 'enabled' | 'startTime' | 'endTime', value: boolean | string) => {
    if (!localPreferences) return;
    
    setLocalPreferences({
      ...localPreferences,
      quietHours: {
        ...localPreferences.quietHours,
        [field]: value
      }
    });
    setHasChanges(true);
  };

  const handleGeneralChange = (field: 'emailNotifications' | 'pushNotifications', value: boolean) => {
    if (!localPreferences) return;
    
    setLocalPreferences({
      ...localPreferences,
      [field]: value
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!localPreferences || !hasChanges) return;
    
    setIsSaving(true);
    try {
      await updatePreferences({
        ...localPreferences,
        updatedAt: new Date().toISOString()
      });
      setHasChanges(false);
      message.success('Préférences sauvegardées avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      message.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (preferences) {
      setLocalPreferences({ ...preferences });
      setHasChanges(false);
      message.info('Préférences réinitialisées');
    }
  };

  if (!localPreferences) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des préférences...</p>
        </div>
      </div>
    );
  }

  const categoryLabels = {
    project: 'Projets',
    payment: 'Paiements',
    equipment: 'Équipements',
    team: 'Équipe',
    system: 'Système',
    location: 'Localisations'
  };

  const priorityLabels = {
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Élevée',
    urgent: 'Urgent'
  };

  const priorityColors = {
    low: 'text-gray-600',
    medium: 'text-blue-600',
    high: 'text-orange-600',
    urgent: 'text-red-600'
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Préférences de Notifications
          </h1>
          <p className="text-gray-600 mt-1">
            Configurez vos préférences de notifications pour rester informé
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={handleReset}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button
              type="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              loading={isSaving}
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
            >
              Sauvegarder
            </Button>
          </div>
        )}
      </div>

      {/* General Settings */}
      <Card title="Paramètres généraux" className="shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-gray-900">Notifications push</h3>
                <p className="text-sm text-gray-500">Recevoir des notifications dans l'application</p>
              </div>
            </div>
            <Switch
              checked={localPreferences.pushNotifications}
              onChange={(checked) => handleGeneralChange('pushNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-medium text-gray-900">Notifications par email</h3>
                <p className="text-sm text-gray-500">Recevoir des notifications par email</p>
              </div>
            </div>
            <Switch
              checked={localPreferences.emailNotifications}
              onChange={(checked) => handleGeneralChange('emailNotifications', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Categories */}
      <Card title="Catégories de notifications" className="shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div>
                <h4 className="font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500">
                  Notifications liées aux {label.toLowerCase()}
                </p>
              </div>
              <Switch
                checked={localPreferences.categories[key as keyof typeof localPreferences.categories]}
                onChange={(checked) => handleCategoryChange(key as keyof typeof localPreferences.categories, checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Priorities */}
      <Card title="Niveaux de priorité" className="shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(priorityLabels).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div>
                <h4 className={`font-medium ${priorityColors[key as keyof typeof priorityColors]}`}>
                  {label}
                </h4>
                <p className="text-sm text-gray-500">
                  Notifications de priorité {label.toLowerCase()}
                </p>
              </div>
              <Switch
                checked={localPreferences.priorities[key as keyof typeof localPreferences.priorities]}
                onChange={(checked) => handlePriorityChange(key as keyof typeof localPreferences.priorities, checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Quiet Hours */}
      <Card title="Heures silencieuses" className="shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-medium text-gray-900">Activer les heures silencieuses</h3>
                <p className="text-sm text-gray-500">
                  Désactiver les notifications pendant certaines heures
                </p>
              </div>
            </div>
            <Switch
              checked={localPreferences.quietHours.enabled}
              onChange={(checked) => handleQuietHoursChange('enabled', checked)}
            />
          </div>
          
          {localPreferences.quietHours.enabled && (
            <>
              <Divider />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de début
                  </label>
                  <TimePicker
                    value={dayjs(localPreferences.quietHours.startTime, 'HH:mm')}
                    onChange={(time) => {
                      if (time) {
                        handleQuietHoursChange('startTime', time.format('HH:mm'));
                      }
                    }}
                    format="HH:mm"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de fin
                  </label>
                  <TimePicker
                    value={dayjs(localPreferences.quietHours.endTime, 'HH:mm')}
                    onChange={(time) => {
                      if (time) {
                        handleQuietHoursChange('endTime', time.format('HH:mm'));
                      }
                    }}
                    format="HH:mm"
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Les notifications seront silencieuses de {localPreferences.quietHours.startTime} à {localPreferences.quietHours.endTime}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-2">Résumé de vos préférences</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                • Notifications push: {localPreferences.pushNotifications ? 'Activées' : 'Désactivées'}
              </p>
              <p>
                • Notifications email: {localPreferences.emailNotifications ? 'Activées' : 'Désactivées'}
              </p>
              <p>
                • Catégories actives: {Object.values(localPreferences.categories).filter(Boolean).length}/6
              </p>
              <p>
                • Priorités actives: {Object.values(localPreferences.priorities).filter(Boolean).length}/4
              </p>
              <p>
                • Heures silencieuses: {localPreferences.quietHours.enabled ? 
                  `${localPreferences.quietHours.startTime} - ${localPreferences.quietHours.endTime}` : 
                  'Désactivées'
                }
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationPreferences;
