import { apiClient } from './api/httpClient';
import { generateQuotePdf } from './pdf/quotePdf';
import { Quote } from './quotesService';

export interface EmailData {
    to: string;
    cc?: string;
    subject: string;
    message: string;
    attachPdf: boolean;
    sendCopy: boolean;
    provider?: 'sendgrid' | 'mailgun' | 'resend';
}

export interface EmailAttachment {
    filename: string;
    content: string;
    type: string;
    disposition: string;
}

export interface EmailResult {
    success: boolean;
    error?: string;
    message?: string;
}

export interface BrandingConfig {
    companyName?: string;
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
}

class EmailService {
    async sendEmail(emailData: EmailData, attachments?: EmailAttachment[]): Promise<EmailResult> {
        try {
            const response = await apiClient.post<EmailResult>('/email/send', {
                ...emailData,
                attachments
            });

            return response;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erreur inconnue lors de l\'envoi de l\'email';
            console.error('Erreur proxy email:', error);
            return { success: false, error: message };
        }
    }

    async sendQuoteEmail(
        quote: Quote,
        emailData: EmailData,
        branding?: BrandingConfig
    ): Promise<EmailResult> {
        const attachments: EmailAttachment[] = [];

        if (emailData.attachPdf) {
            try {
                const pdfBlob = await generateQuotePdf(quote, branding);
                if (!pdfBlob) {
                    return { success: false, error: 'Échec de la génération du PDF' };
                }

                const pdfBase64 = await this.blobToBase64(pdfBlob);
                attachments.push({
                    filename: `Devis_${quote.reference || quote.id}.pdf`,
                    content: pdfBase64.split(',')[1],
                    type: 'application/pdf',
                    disposition: 'attachment'
                });
            } catch (error) {
                console.error('Erreur lors de la génération du PDF:', error);
                return { success: false, error: 'Impossible de générer le PDF du devis' };
            }
        }

        const result = await this.sendEmail(emailData, attachments);
        if (!result.success) {
            return result;
        }

        if (emailData.sendCopy) {
            const copyResult = await this.sendEmail({
                ...emailData,
                to: emailData.cc || emailData.to,
                subject: `[COPIE] ${emailData.subject}`,
                message: `Copie de l'email envoyé à ${emailData.to}\n\n${emailData.message}`,
                sendCopy: false,
                attachPdf: emailData.attachPdf
            }, attachments);

            if (!copyResult.success) {
                return copyResult;
            }
        }

        return result;
    }

    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}

export const emailService = new EmailService();

export default emailService;
