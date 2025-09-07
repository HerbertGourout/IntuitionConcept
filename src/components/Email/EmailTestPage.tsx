import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Send, CheckCircle, AlertCircle, Settings, User, FileText } from 'lucide-react';
import { emailService, EmailData } from '../../services/emailService';

const EmailTestPage: React.FC = () => {
  const [testEmail, setTestEmail] = useState({
    to: 'test@example.com',
    subject: 'Test Email - BTP Manager',
    html: '<h1>Email de Test</h1><p>Si vous recevez cet email, la configuration fonctionne parfaitement !</p>',
    text: 'Email de Test - Si vous recevez cet email, la configuration fonctionne parfaitement !'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleSendTest = async () => {
    if (!testEmail.to || !testEmail.subject) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);
    try {
      const result = await emailService.sendEmail(testEmail as EmailData);
      setLastResult({ success: true, data: result });
      toast.success('Email de test envoyé avec succès !');
    } catch (error: any) {
      setLastResult({ success: false, error: error.message });
      toast.error(`Erreur d'envoi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuoteTest = async () => {
    const quoteEmail = {
      to: testEmail.to,
      subject: 'Devis BTP Manager - Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1>🏗️ BTP Manager</h1>
            <p>Votre devis personnalisé</p>
          </header>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333;">Devis #TEST-001</h2>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            <p><strong>Client:</strong> Client Test</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #e9ecef;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Quantité</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Prix unitaire</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">Fondations béton</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">50 m²</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">120 FCFA</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">6 000 FCFA</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">Murs en parpaing</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">100 m²</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">80 FCFA</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">8 000 FCFA</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style="background: #e9ecef; font-weight: bold;">
                  <td colspan="3" style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total HT:</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">14 000 FCFA</td>
                </tr>
                <tr style="background: #667eea; color: white; font-weight: bold;">
                  <td colspan="3" style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total TTC:</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">16 520 FCFA</td>
                </tr>
              </tfoot>
            </table>
            
            <div style="margin: 20px 0; padding: 15px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px;">
              <p><strong>Validité:</strong> Ce devis est valable 30 jours à compter de sa date d'émission.</p>
              <p><strong>Conditions:</strong> Acompte de 30% à la commande, solde à la livraison.</p>
            </div>
          </div>
          
          <footer style="background: #343a40; color: white; padding: 20px; text-align: center;">
            <p>Merci de votre confiance !</p>
            <p style="font-size: 12px;">BTP Manager - Gestion de projets de construction</p>
          </footer>
        </div>
      `,
      text: `
        Devis BTP Manager - Test
        
        Devis #TEST-001
        Date: ${new Date().toLocaleDateString('fr-FR')}
        Client: Client Test
        
        Détail:
        - Fondations béton: 50 m² × 120 FCFA = 6 000 FCFA
        - Murs en parpaing: 100 m² × 80 FCFA = 8 000 FCFA
        
        Total HT: 14 000 FCFA
        Total TTC: 16 520 FCFA
        
        Validité: 30 jours
        Conditions: Acompte 30% à la commande
        
        Merci de votre confiance !
        BTP Manager
      `
    };

    setIsLoading(true);
    try {
      const result = await emailService.sendEmail(quoteEmail as EmailData);
      setLastResult({ success: true, data: result });
      toast.success('Email de devis test envoyé avec succès !');
    } catch (error: any) {
      setLastResult({ success: false, error: error.message });
      toast.error(`Erreur d'envoi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderInfo = () => {
    const provider = import.meta.env.VITE_EMAIL_PROVIDER;
    switch (provider) {
      case 'sendgrid':
        return {
          name: 'SendGrid',
          icon: '📧',
          color: 'blue',
          configured: !!import.meta.env.VITE_SENDGRID_API_KEY
        };
      case 'mailgun':
        return {
          name: 'Mailgun',
          icon: '🔫',
          color: 'red',
          configured: !!import.meta.env.VITE_MAILGUN_API_KEY
        };
      case 'resend':
        return {
          name: 'Resend',
          icon: '🚀',
          color: 'purple',
          configured: !!import.meta.env.VITE_RESEND_API_KEY
        };
      default:
        return {
          name: 'Non configuré',
          icon: '❌',
          color: 'gray',
          configured: false
        };
    }
  };

  const providerInfo = getProviderInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Test Service d'Email
            </h1>
          </div>
          <p className="text-gray-600">
            Testez la configuration de votre service d'email et l'envoi de devis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration actuelle */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Configuration Actuelle
            </h2>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${
                providerInfo.configured 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{providerInfo.icon}</span>
                  <span className="font-medium">{providerInfo.name}</span>
                  {providerInfo.configured ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <p className={`text-sm ${
                  providerInfo.configured ? 'text-green-700' : 'text-red-700'
                }`}>
                  {providerInfo.configured 
                    ? 'Service configuré et prêt à utiliser' 
                    : 'Service non configuré - Vérifiez vos variables d\'environnement'
                  }
                </p>
              </div>

              <div className="text-sm space-y-2">
                <h3 className="font-medium text-gray-700">Variables d'environnement:</h3>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span>VITE_EMAIL_PROVIDER:</span>
                    <span className={import.meta.env.VITE_EMAIL_PROVIDER ? 'text-green-600' : 'text-red-600'}>
                      {import.meta.env.VITE_EMAIL_PROVIDER || 'Non défini'}
                    </span>
                  </div>
                  {providerInfo.name === 'SendGrid' && (
                    <>
                      <div className="flex justify-between">
                        <span>VITE_SENDGRID_API_KEY:</span>
                        <span className={import.meta.env.VITE_SENDGRID_API_KEY ? 'text-green-600' : 'text-red-600'}>
                          {import.meta.env.VITE_SENDGRID_API_KEY ? '✓ Configuré' : '✗ Manquant'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>VITE_SENDGRID_FROM_EMAIL:</span>
                        <span className={import.meta.env.VITE_SENDGRID_FROM_EMAIL ? 'text-green-600' : 'text-red-600'}>
                          {import.meta.env.VITE_SENDGRID_FROM_EMAIL || '✗ Manquant'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de test */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Test d'Envoi
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email destinataire *
                </label>
                <input
                  type="email"
                  value={testEmail.to}
                  onChange={(e) => setTestEmail({ ...testEmail, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre-email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sujet *
                </label>
                <input
                  type="text"
                  value={testEmail.subject}
                  onChange={(e) => setTestEmail({ ...testEmail, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Sujet de l'email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu HTML
                </label>
                <textarea
                  value={testEmail.html}
                  onChange={(e) => setTestEmail({ ...testEmail, html: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contenu HTML de l'email"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSendTest}
                  disabled={isLoading || !providerInfo.configured}
                  className="flex-1 btn-glass bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? 'Envoi...' : 'Test Simple'}
                </button>

                <button
                  onClick={handleQuoteTest}
                  disabled={isLoading || !providerInfo.configured}
                  className="flex-1 btn-glass bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isLoading ? 'Envoi...' : 'Test Devis'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Résultat du dernier test */}
        {lastResult && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {lastResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              Résultat du Dernier Test
            </h2>
            
            <div className={`p-4 rounded-lg ${
              lastResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {lastResult.success ? (
                <div>
                  <p className="text-green-800 font-medium mb-2">✅ Email envoyé avec succès !</p>
                  {lastResult.data && (
                    <pre className="text-xs text-green-700 bg-green-100 p-2 rounded overflow-auto">
                      {JSON.stringify(lastResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-red-800 font-medium mb-2">❌ Erreur d'envoi</p>
                  <p className="text-red-700 text-sm">{lastResult.error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Guide de configuration */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Guide de Configuration
          </h2>
          
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 mb-4">
              Pour configurer le service d'email, consultez le fichier <code>EMAIL_SETUP_GUIDE.md</code> 
              à la racine du projet qui contient toutes les instructions détaillées.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-800 font-medium mb-2">Configuration rapide SendGrid :</h3>
              <ol className="text-blue-700 text-sm space-y-1">
                <li>1. Créer un compte sur sendgrid.com</li>
                <li>2. Générer une clé API avec permissions "Mail Send"</li>
                <li>3. Ajouter les variables dans votre fichier .env :</li>
              </ol>
              <pre className="text-xs bg-blue-100 p-2 rounded mt-2 overflow-auto">
{`VITE_EMAIL_PROVIDER=sendgrid
VITE_SENDGRID_API_KEY=SG.votre_cle_api
VITE_SENDGRID_FROM_EMAIL=noreply@votredomaine.com
VITE_SENDGRID_FROM_NAME=BTP Manager`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTestPage;
