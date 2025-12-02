import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, Bell, Shield, Database, Save, Upload,
  User, Globe, Clock, DollarSign, Palette, Monitor, Moon, Sun,
  Mail, Smartphone, AlertTriangle, Key, HardDrive,
  Cloud, Download, RefreshCw, CheckCircle, XCircle
} from 'lucide-react';
import { useBranding } from '../../contexts/BrandingContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserSettingsService, UserSettings } from '../../services/userSettingsService';

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
  const branding = useBranding();
  const { firebaseUser, resendEmailVerification, refreshClaims, user, mfaGenerateTotpSecret, mfaEnrollTotp, mfaGetEnrolledFactors, mfaUnenroll } = useAuth();
  const [revokeUid, setRevokeUid] = useState('');
  const [totpUri, setTotpUri] = useState<string>('');
  const [totpSecret, setTotpSecret] = useState<string>('');
  const [totpCode, setTotpCode] = useState<string>('');
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [mfaFactors, setMfaFactors] = useState<Array<{ uid: string; displayName?: string; factorId: string }>>([]);
  const [brandForm, setBrandForm] = useState({
    companyName: '',
    companyAddress: '',
    footerContact: '',
  });

  useEffect(() => {
    if (branding.profile) {
      setBrandForm({
        companyName: branding.profile.companyName || '',
        companyAddress: branding.profile.companyAddress || '',
        footerContact: branding.profile.footerContact || '',
      });
    }
  }, [branding.profile]);

  // Charger la liste des facteurs MFA lorsque l'onglet sécurité est actif
  useEffect(() => {
    if (activeTab === 'security') {
      try {
        const factors = mfaGetEnrolledFactors();
        setMfaFactors(factors);
      } catch (error) {
        console.error('Error loading MFA factors:', error);
      }
    }
  }, [activeTab, firebaseUser, mfaGetEnrolledFactors]);
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

  // Load user settings on component mount
  useEffect(() => {
    const loadUserSettings = async () => {
      if (firebaseUser?.uid) {
        try {
          const settings = await UserSettingsService.getUserSettings(firebaseUser.uid);
          setUserSettings(settings);
        } catch (error) {
          console.error('Error loading user settings:', error);
        }
      }
    };
    loadUserSettings();
  }, [firebaseUser]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (firebaseUser?.uid && userSettings) {
        await UserSettingsService.updateUserSettings(firebaseUser.uid, {
          theme: settings.general.theme as 'light' | 'dark' | 'system',
          language: settings.general.language as 'fr' | 'en',
          notifications: {
            email: settings.notifications.emailNotifications,
            push: settings.notifications.pushNotifications,
            taskReminders: settings.notifications.taskReminders,
            budgetAlerts: settings.notifications.budgetAlerts
          },
          preferences: {
            defaultView: 'dashboard',
            autoSave: true,
            compactMode: false,
            defaultCurrency: settings.general.currency
          }
        });
      }
      alert('Paramètres sauvegardés avec succès !');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = <S extends keyof AppSettings, K extends keyof AppSettings[S]>(
    section: S,
    key: K,
    value: AppSettings[S][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      } as AppSettings[S],
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
              { id: 'admin', label: 'Administration', icon: Shield },
              { id: 'branding', label: 'Branding', icon: Palette },
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
                        <option value="EUR">FCFA</option>
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
                  {([
                    { id: 'light', label: 'Clair', icon: Sun },
                    { id: 'dark', label: 'Sombre', icon: Moon },
                    { id: 'auto', label: 'Automatique', icon: Monitor }
                  ] as const).map(theme => (
                    <button
                      key={theme.id}
                      onClick={() =>
                        updateSetting('general', 'theme', theme.id as AppSettings['general']['theme'])
                      }
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

          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-purple-600" />
                  Identité de marque
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
                      <input
                        type="text"
                        value={brandForm.companyName}
                        onChange={(e) => setBrandForm(f => ({ ...f, companyName: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adresse de l'entreprise</label>
                      <textarea
                        value={brandForm.companyAddress}
                        onChange={(e) => setBrandForm(f => ({ ...f, companyAddress: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact pied de page</label>
                      <input
                        type="text"
                        value={brandForm.footerContact}
                        onChange={(e) => setBrandForm(f => ({ ...f, footerContact: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={async () => {
                          await branding.save({
                            companyName: brandForm.companyName,
                            companyAddress: brandForm.companyAddress,
                            footerContact: brandForm.footerContact,
                          });
                          alert('Branding sauvegardé');
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        <span>Sauvegarder le branding</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-24 rounded-lg border bg-white/60 flex items-center justify-center overflow-hidden">
                        {branding.logoDataUrl ? (
                          <img src={branding.logoDataUrl} alt="Logo" className="max-w-full max-h-full" />
                        ) : (
                          <User className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <span>Choisir un logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) await branding.uploadLogo(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
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
                  {([
                    { key: 'emailNotifications', label: 'Notifications par email', icon: Mail, desc: 'Recevoir des notifications par email' },
                    { key: 'pushNotifications', label: 'Notifications push', icon: Smartphone, desc: 'Notifications sur votre appareil' },
                    { key: 'taskReminders', label: 'Rappels de tâches', icon: Clock, desc: 'Rappels pour les tâches à venir' },
                    { key: 'projectUpdates', label: 'Mises à jour de projet', icon: RefreshCw, desc: 'Notifications des changements de projet' },
                    { key: 'budgetAlerts', label: 'Alertes budgétaires', icon: DollarSign, desc: 'Alertes de dépassement de budget' },
                    { key: 'maintenanceAlerts', labelngle, desc: 'Notifications de maintenance' }
                  ] as const).map(item => (
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
                        onChange={(checked) =>
                          updateSetting('notifications', item.key as keyof AppSettings['notifications'], checked)
                        }
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
                  {/* Email verification status */}
                  <div className="p-4 bg-white/50 rounded-lg border border-white/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {firebaseUser?.emailVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-orange-500" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">Adresse e-mail</p>
                          <p className="text-sm text-gray-600">{firebaseUser?.email || '—'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${firebaseUser?.emailVerified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {firebaseUser?.emailVerified ? 'Vérifié' : 'Non vérifié'}
                        </span>
                      </div>
                    </div>
                    {!firebaseUser?.emailVerified && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        <button
                          onClick={async () => { await resendEmailVerification(); alert("Email de vérification renvoyé."); }}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                          <span>Renvoyer l'email</span>
                        </button>
                        <button
                          onClick={async () => { await refreshClaims(); }}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>J'ai déjà vérifié</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* MFA TOTP */}
                  <div className="p-4 bg-white/50 rounded-lg border border-white/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-800">Authentification à deux facteurs (TOTP)</p>
                          <p className="text-sm text-gray-600">Utilisez une application d'authentification (Google Authenticator, 1Password, etc.)</p>
                        </div>
                      </div>
                    </div>

                    {/* Étape 1: Générer QR */}
                    {!totpUri && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const { uri, secretKey } = await mfaGenerateTotpSecret();
                            setTotpUri(uri);
                            setTotpSecret(secretKey);
                          } catch {
                            alert("Impossible de générer le secret TOTP. Assurez-vous d'être connecté.");
                          }
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Activer TOTP
                      </button>
                    )}

                    {/* Étape 2: Afficher QR et saisir code */}
                    {totpUri && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="flex flex-col items-center">
                          <img
                            alt="QR TOTP"
                            className="w-40 h-40 border rounded-lg bg-white"
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`}
                          />
                          <p className="text-xs text-gray-500 mt-2">Secret: {totpSecret}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Code à 6 chiffres</label>
                          <input
                            type="text"
                            value={totpCode}
                            onChange={(e) => setTotpCode(e.target.value)}
                            placeholder="123456"
                            className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                          />
                          <div className="flex gap-3 mt-3">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await mfaEnrollTotp(totpCode, 'TOTP');
                                  setTotpUri('');
                                  setTotpSecret('');
                                  setTotpCode('');
                                  const factors = mfaGetEnrolledFactors();
                                  setMfaFactors(factors);
                                  alert('TOTP activé avec succès.');
                                } catch {
                                  alert('Échec de l\'activation TOTP. Vérifiez le code.');
                                }
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Valider
                            </button>
                            <button
                              type="button"
                              onClick={() => { setTotpUri(''); setTotpSecret(''); setTotpCode(''); }}
                              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Facteurs enrôlés */}
                    {mfaFactors.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Facteurs enrôlés</p>
                        <div className="space-y-2">
                          {mfaFactors.map(f => (
                            <div key={f.uid} className="flex items-center justify-between p-3 bg-white/60 rounded-lg border">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{f.displayName || 'TOTP'}</p>
                                <p className="text-xs text-gray-500">{f.factorId} • {f.uid}</p>
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!confirm('Supprimer ce facteur MFA ?')) return;
                                  try {
                                    await mfaUnenroll(f.uid);
                                    const factors = mfaGetEnrolledFactors();
                                    setMfaFactors(factors);
                                  } catch {
                                    alert('Échec de la suppression du facteur.');
                                  }
                                }}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                              >
                                Supprimer
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Admin: Logout everywhere helper */}
                  {user?.role === 'admin' && (
                    <div className="p-4 bg-white/50 rounded-lg border border-white/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <HardDrive className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="font-medium text-gray-800">Déconnexion sur tous les appareils (admin)</p>
                            <p className="text-sm text-gray-600">Révoquer les refresh tokens d'un utilisateur (nécessite clé Admin SDK côté serveur)</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">UID cible</label>
                          <input
                            type="text"
                            value={revokeUid}
                            onChange={(e) => setRevokeUid(e.target.value)}
                            placeholder="Saisir l'UID Firebase"
                            className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200"
                          />
                          <p className="text-xs text-gray-500 mt-1">Votre UID: <span className="font-mono">{firebaseUser?.uid || '—'}</span></p>
                        </div>
                        <div className="flex items-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              const uid = revokeUid.trim();
                              if (!uid) return alert("Veuillez saisir un UID");
                              const cmd = `node scripts/revokeUserTokens.js ${uid}`;
                              navigator.clipboard?.writeText(cmd);
                              alert("Commande copiée dans le presse-papiers:\n\n" + cmd);
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Copier la commande
                          </button>
                          <a
                            href="https://firebase.google.com/docs/auth/admin/manage-sessions?hl=fr"
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Documentation
                          </a>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">Note: cette action se lance côté serveur. Assurez-vous que <code>scripts/serviceAccountKey.json</code> est configuré puis exécutez la commande dans votre terminal.</p>
                    </div>
                  )}

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
                        onChange={(e) =>
                          updateSetting(
                            'security',
                            'passwordPolicy',
                            e.target.value as AppSettings['security']['passwordPolicy']
                          )
                        }
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

          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-600" />
                  Tableau de Bord Sécurité
                </h3>
                <p className="text-gray-600 mb-6">
                  Accédez aux outils d'administration et de surveillance de la sécurité.
                </p>
                
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-red-800 mb-2">Surveillance de Sécurité</h4>
                      <p className="text-red-700 text-sm mb-4">
                        Consultez les logs d'audit, les alertes de sécurité et surveillez l'activité des utilisateurs.
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded">Logs d'audit</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">Alertes sécurité</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Activité utilisateurs</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open('/security-dashboard', '_blank')}
                      className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Ouvrir le Dashboard</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white/50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <h4 className="font-medium text-gray-800">Permissions Système</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Gérez les rôles et permissions des utilisateurs.
                    </p>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Configurer →
                    </button>
                  </div>

                  <div className="bg-white/50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Database className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-gray-800">Règles Firestore</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Configurez les règles de sécurité de la base de données.
                    </p>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Déployer →
                    </button>
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
                        onChange={(e) =>
                          updateSetting(
                            'backup',
                            'backupFrequency',
                            e.target.value as AppSettings['backup']['backupFrequency']
                          )
                        }
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

