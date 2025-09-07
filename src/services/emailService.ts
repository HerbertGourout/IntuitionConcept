import { generateQuotePdf } from './pdf/quotePdf';
import { Quote } from './quotesService';

export interface EmailData {
    to: string;
    cc?: string;
    subject: string;
    message: string;
    attachPdf: boolean;
    sendCopy: boolean;
}

export interface EmailAttachment {
    filename: string;
    content: string;
    type: string;
    disposition: string;
}

export interface EmailServiceConfig {
    apiKey: string;
    fromEmail: string;
    fromName: string;
    provider: 'sendgrid' | 'mailgun' | 'resend';
    domain?: string; // For Mailgun
}

export interface EmailResult {
    success: boolean;
    error?: string;
}

class EmailService {
    private config: EmailServiceConfig | null = null;

    // Configuration du service email
    configure(config: EmailServiceConfig) {
        this.config = config;
    }

    // Vérifier si le service est configuré
    isConfigured(): boolean {
        return this.config !== null;
    }

    // Envoyer un email avec SendGrid
    private async sendWithSendGrid(emailData: EmailData, attachments?: EmailAttachment[]): Promise<void> {
        if (!this.config) throw new Error('Service email non configuré');

        const payload = {
            personalizations: [
                {
                    to: [{ email: emailData.to }],
                    ...(emailData.cc && { cc: [{ email: emailData.cc }] }),
                    subject: emailData.subject
                }
            ],
            from: {
                email: this.config.fromEmail,
                name: this.config.fromName
            },
            content: [
                {
                    type: 'text/plain',
                    value: emailData.message
                },
                {
                    type: 'text/html',
                    value: emailData.message.replace(/\n/g, '<br>')
                }
            ],
            ...(attachments && attachments.length > 0 && { attachments })
        };

        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur SendGrid: ${error}`);
        }
    }

    // Envoyer un email avec Mailgun
    private async sendWithMailgun(emailData: EmailData, attachments?: EmailAttachment[]): Promise<void> {
        if (!this.config) throw new Error('Service email non configuré');

        const formData = new FormData();
        formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`);
        formData.append('to', emailData.to);
        if (emailData.cc) formData.append('cc', emailData.cc);
        formData.append('subject', emailData.subject);
        formData.append('text', emailData.message);
        formData.append('html', emailData.message.replace(/\n/g, '<br>'));

        // Ajouter les pièces jointes
        if (attachments && attachments.length > 0) {
            attachments.forEach((attachment, index) => {
                const blob = new Blob([attachment.content], { type: attachment.type });
                formData.append('attachment', blob, attachment.filename);
            });
        }

        // Note: Mailgun nécessite un domaine configuré
        const domain = this.config.domain || 'mg.votredomaine.com';
        const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur Mailgun: ${error}`);
        }
    }

    // Envoyer un email avec Resend
    private async sendWithResend(emailData: EmailData, attachments?: EmailAttachment[]): Promise<void> {
        if (!this.config) throw new Error('Service email non configuré');

        const payload = {
            from: `${this.config.fromName} <${this.config.fromEmail}>`,
            to: [emailData.to],
            ...(emailData.cc && { cc: [emailData.cc] }),
            subject: emailData.subject,
            text: emailData.message,
            html: emailData.message.replace(/\n/g, '<br>'),
            ...(attachments && attachments.length > 0 && { attachments })
        };

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Erreur Resend: ${error}`);
        }
    }

    // Méthode principale pour envoyer un email
    async sendEmail(emailData: EmailData, attachments?: EmailAttachment[]): Promise<EmailResult> {
        if (!this.config) {
            return { success: false, error: 'Service email non configuré. Utilisez configure() d\'abord.' };
        }

        try {
            switch (this.config.provider) {
                case 'sendgrid':
                    await this.sendWithSendGrid(emailData, attachments);
                    break;
                case 'mailgun':
                    await this.sendWithMailgun(emailData, attachments);
                    break;
                case 'resend':
                    await this.sendWithResend(emailData, attachments);
                    break;
                default:
                    return { success: false, error: `Provider non supporté: ${this.config.provider}` };
            }
            return { success: true };
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
        }
    }

    // Envoyer un devis par email
    async sendQuoteEmail(
        quote: Quote, 
        emailData: EmailData, 
        branding?: any
    ): Promise<EmailResult> {
        const attachments: EmailAttachment[] = [];

        // Générer et attacher le PDF si demandé
        if (emailData.attachPdf) {
            try {
                const pdfBlob = await generateQuotePdf(quote, branding);
                if (!pdfBlob) {
                    return { success: false, error: 'Échec de la génération du PDF' };
                }
                const pdfBase64 = await this.blobToBase64(pdfBlob);
                
                attachments.push({
                    filename: `Devis_${quote.reference || quote.id}.pdf`,
                    content: pdfBase64.split(',')[1], // Retirer le préfixe data:
                    type: 'application/pdf',
                    disposition: 'attachment'
                });
            } catch (error) {
                console.error('Erreur lors de la génération du PDF:', error);
                return { success: false, error: 'Impossible de générer le PDF du devis' };
            }
        }

        // Envoyer l'email
        const result = await this.sendEmail(emailData, attachments);
        if (!result.success) {
            return result;
        }

        // Envoyer une copie si demandé
        if (emailData.sendCopy && this.config) {
            const copyEmailData = {
                ...emailData,
                to: this.config.fromEmail,
                subject: `[COPIE] ${emailData.subject}`,
                message: `Copie de l'email envoyé à ${emailData.to}\n\n${emailData.message}`
            };
            
            const copyResult = await this.sendEmail(copyEmailData, attachments);
            if (!copyResult.success) {
                return copyResult;
            }
        }

        return { success: true };
    }

    // Utilitaire pour convertir Blob en Base64
    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Tester la configuration
    async testConfiguration(): Promise<boolean> {
        if (!this.config) {
            throw new Error('Service email non configuré');
        }

        try {
            const testEmail: EmailData = {
                to: this.config.fromEmail,
                subject: 'Test de configuration - BTP Manager',
                message: 'Ceci est un email de test pour vérifier la configuration du service email.',
                attachPdf: false,
                sendCopy: false
            };

            await this.sendEmail(testEmail);
            return true;
        } catch (error) {
            console.error('Test de configuration échoué:', error);
            return false;
        }
    }

    // Obtenir les statistiques d'envoi (si supporté par le provider)
    async getEmailStats(): Promise<any> {
        if (!this.config) {
            throw new Error('Service email non configuré');
        }

        // Implémentation basique - à étendre selon le provider
        return {
            provider: this.config.provider,
            configured: true,
            lastTest: new Date().toISOString()
        };
    }
}

// Instance singleton
export const emailService = new EmailService();

// Configuration par défaut basée sur les variables d'environnement
const getEmailConfig = (): EmailServiceConfig => {
  const provider = (import.meta.env.VITE_EMAIL_PROVIDER || 'sendgrid') as 'sendgrid' | 'mailgun' | 'resend';
  
  switch (provider) {
    case 'sendgrid':
      return {
        provider: 'sendgrid',
        apiKey: import.meta.env.VITE_SENDGRID_API_KEY || '',
        fromEmail: import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@votredomaine.com',
        fromName: import.meta.env.VITE_SENDGRID_FROM_NAME || 'BTP Manager'
      };
    case 'mailgun':
      this.configure({
        provider: 'mailgun',
        apiKey: process.env.VITE_MAILGUN_API_KEY,
        domain: process.env.VITE_MAILGUN_DOMAIN,
        fromEmail: process.env.VITE_FROM_EMAIL,
        fromName: process.env.VITE_FROM_NAME || 'BTP Manager'
      });
      return {
        provider: 'mailgun',
        apiKey: import.meta.env.VITE_MAILGUN_API_KEY || '',
        domain: import.meta.env.VITE_MAILGUN_DOMAIN || 'mg.votredomaine.com',
        fromEmail: import.meta.env.VITE_MAILGUN_FROM_EMAIL || 'noreply@votredomaine.com'
      };
    case 'resend':
      this.configure({
        provider: 'resend',
        apiKey: process.env.VITE_RESEND_API_KEY,
        fromEmail: process.env.VITE_FROM_EMAIL,
        fromName: process.env.VITE_FROM_NAME || 'BTP Manager'
      });
      return {
        provider: 'resend',
        apiKey: import.meta.env.VITE_RESEND_API_KEY || '',
        fromEmail: import.meta.env.VITE_RESEND_FROM_EMAIL || 'noreply@votredomaine.com'
      };
    default:
      return {
        provider: 'sendgrid',
        apiKey: '',
        fromEmail: 'noreply@votredomaine.com',
        fromName: 'BTP Manager'
      };
  }
};

// Configuration automatique au démarrage
emailService.configure(getEmailConfig());

// Configuration manuelle (optionnelle)
export const configureEmailService = (config: EmailServiceConfig) => {
  emailService.configure(config);
};

// Exemple de configuration pour différents providers
export const EMAIL_PROVIDERS = {
  sendgrid: {
    name: 'SendGrid',
    description: 'Service email fiable avec API simple',
    setupUrl: 'https://sendgrid.com/docs/api-reference/'
  },
  mailgun: {
    name: 'Mailgun',
    description: 'Service email pour développeurs',
    setupUrl: 'https://documentation.mailgun.com/en/latest/api_reference.html'
  },
  resend: {
    name: 'Resend',
    description: 'Service email moderne pour développeurs',
    setupUrl: 'https://resend.com/docs'
  }
};

export default emailService;
