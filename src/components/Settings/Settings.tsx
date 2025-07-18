import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Bell, Shield, Database, Save, Upload,
  User, Globe, Clock, DollarSign, Palette, Monitor, Moon, Sun,
  Mail, Smartphone, AlertTriangle, Lock, Key, Timer, HardDrive,
  Cloud, Download, RefreshCw, Check, X
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AppSettings {
  general: {
    companyName: string;
    companyLogo?: string;
    language: string;
    timezone: string;
    currency: string;
    dateFormat: string;
    theme: 'light' | 'dark' | 'auto';
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    taskReminders: boolean;
    projectUpdates: boolean;
    budgetAlerts: boolean;
    maintenanceAlerts: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: 'basic' | 'medium' | 'strong';
    loginAttempts: number;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    retentionPeriod: number;
    cloudBackup: boolean;
  };
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    general: {
      companyName: 'Construction BTP Congo',
      language: 'fr',
      timezone: 'Africa/Brazzaville',
      currency: 'FCFA',
      dateFormat: 'DD/MM/YYYY',
      theme: 'light'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      taskReminders: true,
      projectUpdates: true,
      budgetAlerts: true,
      maintenanceAlerts: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: 'medium',
      loginAttempts: 5
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionPeriod: 30,
      cloudBackup: true
    }
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Paramètres sauvegardés avec succès !');
    } catch {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (section: keyof AppSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent">
                Paramètres
              </h1>
              <p className="text-gray-600 mt-1">
                Configurez votre application selon vos préférences
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            <span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="glass-card">
        <div className="border-b border-white/20">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'general', label: 'Général', icon: SettingsIcon },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Sécurité', icon: Shield },
              { id: 'backup', label: 'Sauvegarde', icon: Database }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Informations de l'entreprise
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'entreprise
                      </label>
                      <input
                        type="text"
                        value={settings.general.companyName}
                        onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                        className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo de l'entreprise
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <User className="h-8 w-8 text-white" />
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                          <Upload className="h-4 w-4" />
                          <span>Changer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-green-600" />
                    Préférences régionales
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Langue
                      </label>
                      <select
                        value={settings.general.language}
                        onChange={(e) => updateSetting('general', 'language', e.target.value)}
                        className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fuseau horaire
                      </label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                        className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="Africa/Brazzaville">Brazzaville</option>
                        <option value="Africa/Kinshasa">Kinshasa</option>
                        <option value="Europe/Paris">Paris</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Devise
                      </label>
                      <select
                        value={settings.general.currency}
                        onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                        className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="FCFA">FCFA</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dollar ($)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-purple-600" />
                  Apparence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Clair', icon: Sun },
                    { id: 'dark', label: 'Sombre', icon: Moon },
                    { id: 'auto', label: 'Automatique', icon: Monitor }
                  ].map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => updateSetting('general', 'theme', theme.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        settings.general.theme === theme.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <theme.icon className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <p className="text-sm font-medium text-gray-800">{theme.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-blue-600" />
                  Préférences de notification
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Notifications par email', icon: Mail, desc: 'Recevoir des notifications par email' },
                    { key: 'pushNotifications', label: 'Notifications push', icon: Smartphone, desc: 'Notifications sur votre appareil' },
                    { key: 'taskReminders', label: 'Rappels de tâches', icon: Clock, desc: 'Rappels pour les tâches à venir' },
                    { key: 'projectUpdates', label: 'Mises à jour de projet', icon: RefreshCw, desc: 'Notifications des changements de projet' },
                    { key: 'budgetAlerts', label: 'Alertes budgétaires', icon: DollarSign, desc: 'Alertes de dépassement de budget' },
                    { key: 'maintenanceAlerts', label: 'Alertes de maintenance', icon: AlertTriangle, desc: 'Notifications de maintenance' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-800">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                        onChange={(checked) => updateSetting('notifications', item.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-600" />
                  Paramètres de sécurité
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Key className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">Authentification à deux facteurs</p>
                        <p className="text-sm text-gray-600">Sécurité renforcée pour votre compte</p>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.security.twoFactorAuth}
                      onChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Délai d'expiration de session (minutes)
                      </label>
                      <select
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 heure</option>
                        <option value={120}>2 heures</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Politique de mot de passe
                      </label>
                      <select
                        value={settings.security.passwordPolicy}
                        onChange={(e) => updateSetting('security', 'passwordPolicy', e.target.value)}
                        className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="basic">Basique</option>
                        <option value="medium">Moyenne</option>
                        <option value="strong">Forte</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Database className="h-5 w-5 mr-2 text-green-600" />
                  Sauvegarde et restauration
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <HardDrive className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">Sauvegarde automatique</p>
                        <p className="text-sm text-gray-600">Sauvegarde régulière de vos données</p>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.backup.autoBackup}
                      onChange={(checked) => updateSetting('backup', 'autoBackup', checked)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fréquence de sauvegarde
                      </label>
                      <select
                        value={settings.backup.backupFrequency}
                        onChange={(e) => updateSetting('backup', 'backupFrequency', e.target.value)}
                        className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="daily">Quotidienne</option>
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuelle</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Période de rétention
                      </label>
                      <select
                        value={settings.backup.retentionPeriod}
                        onChange={(e) => updateSetting('backup', 'retentionPeriod', parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value={7}>7 jours</option>
                        <option value={30}>30 jours</option>
                        <option value={90}>90 jours</option>
                        <option value={365}>1 an</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Cloud className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">Sauvegarde cloud</p>
                        <p className="text-sm text-gray-600">Stockage sécurisé dans le cloud</p>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={settings.backup.cloudBackup}
                      onChange={(checked) => updateSetting('backup', 'cloudBackup', checked)}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-3">Actions manuelles</h4>
                    <div className="flex flex-wrap gap-3">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        <Download className="h-4 w-4" />
                        <span>Créer une sauvegarde</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                        <Upload className="h-4 w-4" />
                        <span>Restaurer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
