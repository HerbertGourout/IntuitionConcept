import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { auditLogger } from './auditLogger';

export interface Project {
    id: string;
    name: string;
    clientId: string;
    clientName: string;
    clientEmail: string;
    totalAmount: number;
    paidAmount: number;
    phases: ProjectPhase[];
    paymentTerms: PaymentTerms;
    status: 'active' | 'completed' | 'on_hold';
}

export interface ProjectPhase {
    id: string;
    name: string;
    percentage: number;
    amount: number;
    status: 'pending' | 'in_progress' | 'completed' | 'validated';
    completedAt?: Date;
    validatedAt?: Date;
}

export interface PaymentTerms {
    type: 'milestone' | 'percentage' | 'monthly';
    schedule: PaymentSchedule[];
}

export interface PaymentSchedule {
    id: string;
    description: string;
    percentage: number;
    amount: number;
    dueDate?: Date;
    triggerEvent?: 'phase_completion' | 'delivery' | 'date' | 'manual';
    phaseId?: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    projectId: string;
    projectName: string;
    clientId: string;
    clientName: string;
    clientEmail: string;
    amount: number;
    taxAmount: number;
    totalAmount: number;
    description: string;
    items: InvoiceItem[];
    dueDate: Date;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    sentAt?: Date;
    paidAt?: Date;
    paymentMethod?: string;
    createdAt: Date;
    createdBy: string;
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface InvoiceConfig {
    enabled: boolean;
    autoSendEnabled: boolean;
    taxRate: number; // TVA en %
    paymentTermDays: number; // Délai de paiement par défaut
    reminderDays: number[]; // Jours pour relances [7, 15, 30]
    includePaymentLink: boolean;
    emailTemplate: 'professional' | 'modern' | 'minimal';
}

class AutoInvoiceService {
    private config: InvoiceConfig = {
        enabled: true,
        autoSendEnabled: true,
        taxRate: 18, // TVA Sénégal
        paymentTermDays: 30,
        reminderDays: [7, 15, 30],
        includePaymentLink: true,
        emailTemplate: 'professional'
    };

    /**
     * Configure le service
     */
    configure(config: Partial<InvoiceConfig>): void {
        this.config = { ...this.config, ...config };
        auditLogger.log('auto_invoice_configured', { config: this.config });
    }

    /**
     * Récupère la configuration
     */
    getConfig(): InvoiceConfig {
        return { ...this.config };
    }

    /**
     * Trouve les projets nécessitant une facturation
     */
    async findProjectsNeedingInvoice(): Promise<Project[]> {
        if (!this.config.enabled) {
            return [];
        }

        const projectsRef = collection(db, 'projects');
        const q = query(
            projectsRef,
            where('status', '==', 'active')
        );

        const snapshot = await getDocs(q);
        const projects: Project[] = [];

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const project: Project = {
                id: docSnap.id,
                name: data.name,
                clientId: data.clientId,
                clientName: data.clientName,
                clientEmail: data.clientEmail,
                totalAmount: data.totalAmount || 0,
                paidAmount: data.paidAmount || 0,
                phases: data.phases || [],
                paymentTerms: data.paymentTerms || { type: 'milestone', schedule: [] },
                status: data.status
            };

            // Vérifier si une facturation est nécessaire
            if (this.shouldGenerateInvoice(project)) {
                projects.push(project);
            }
        });

        return projects;
    }

    /**
     * Détermine si un projet nécessite une facture
     */
    private shouldGenerateInvoice(project: Project): boolean {
        // Vérifier les phases complétées non facturées
        const completedPhases = project.phases.filter(
            p => p.status === 'validated' && p.validatedAt
        );

        if (completedPhases.length === 0) {
            return false;
        }

        // Calculer le montant total des phases validées
        const validatedAmount = completedPhases.reduce((sum, p) => sum + p.amount, 0);

        // Vérifier si le montant validé dépasse le montant payé
        return validatedAmount > project.paidAmount;
    }

    /**
     * Génère un numéro de facture unique
     */
    private generateInvoiceNumber(): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `INV-${year}${month}-${random}`;
    }

    /**
     * Génère une facture pour un projet
     */
    async generateInvoice(projectId: string): Promise<Invoice> {
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('__name__', '==', projectId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            throw new Error('Projet non trouvé');
        }

        const projectData = snapshot.docs[0].data();
        const project: Project = {
            id: projectId,
            name: projectData.name,
            clientId: projectData.clientId,
            clientName: projectData.clientName,
            clientEmail: projectData.clientEmail,
            totalAmount: projectData.totalAmount || 0,
            paidAmount: projectData.paidAmount || 0,
            phases: projectData.phases || [],
            paymentTerms: projectData.paymentTerms,
            status: projectData.status
        };

        // Calculer le montant à facturer
        const completedPhases = project.phases.filter(p => p.status === 'validated');
        const validatedAmount = completedPhases.reduce((sum, p) => sum + p.amount, 0);
        const amountToInvoice = validatedAmount - project.paidAmount;

        if (amountToInvoice <= 0) {
            throw new Error('Aucun montant à facturer');
        }

        // Créer les items de facture
        const items: InvoiceItem[] = completedPhases.map(phase => ({
            description: phase.name,
            quantity: 1,
            unitPrice: phase.amount,
            total: phase.amount
        }));

        // Calculer la TVA
        const taxAmount = (amountToInvoice * this.config.taxRate) / 100;
        const totalAmount = amountToInvoice + taxAmount;

        // Calculer la date d'échéance
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + this.config.paymentTermDays);

        // Créer la facture
        const invoice: Omit<Invoice, 'id'> = {
            invoiceNumber: this.generateInvoiceNumber(),
            projectId: project.id,
            projectName: project.name,
            clientId: project.clientId,
            clientName: project.clientName,
            clientEmail: project.clientEmail,
            amount: amountToInvoice,
            taxAmount,
            totalAmount,
            description: `Facture pour ${project.name} - Phases complétées`,
            items,
            dueDate,
            status: 'draft',
            createdAt: new Date(),
            createdBy: 'system'
        };

        // Sauvegarder dans Firebase
        const invoicesRef = collection(db, 'invoices');
        const docRef = await addDoc(invoicesRef, {
            ...invoice,
            createdAt: Timestamp.now(),
            dueDate: Timestamp.fromDate(dueDate)
        });

        auditLogger.log('invoice_generated', {
            invoiceId: docRef.id,
            projectId,
            amount: totalAmount
        });

        return { ...invoice, id: docRef.id };
    }

    /**
     * Génère le contenu HTML de la facture
     */
    generateInvoicePDF(invoice: Invoice): string {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 2cm; }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 40px; 
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
        }
        .company-info { flex: 1; }
        .invoice-info { text-align: right; }
        .invoice-number { 
            font-size: 28px; 
            font-weight: bold; 
            color: #667eea; 
        }
        .client-info { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 30px 0; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 30px 0; 
        }
        th { 
            background: #667eea; 
            color: white; 
            padding: 12px; 
            text-align: left; 
        }
        td { 
            padding: 12px; 
            border-bottom: 1px solid #ddd; 
        }
        .total-row { 
            font-weight: bold; 
            background: #f8f9fa; 
        }
        .grand-total { 
            font-size: 20px; 
            color: #667eea; 
        }
        .footer { 
            margin-top: 50px; 
            text-align: center; 
            color: #666; 
            font-size: 12px; 
        }
        .payment-info { 
            background: #fff3cd; 
            border-left: 4px solid #ffc107; 
            padding: 15px; 
            margin: 20px 0; 
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <h1 style="margin: 0; color: #667eea;">🏗️ IntuitionConcept</h1>
            <p style="margin: 5px 0;">Plateforme de Gestion BTP Intelligente</p>
            <p style="margin: 5px 0;">Dakar, Sénégal</p>
            <p style="margin: 5px 0;">Tel: +221 XX XXX XX XX</p>
            <p style="margin: 5px 0;">Email: contact@intuitionconcept.com</p>
        </div>
        <div class="invoice-info">
            <div class="invoice-number">FACTURE</div>
            <div class="invoice-number">${invoice.invoiceNumber}</div>
            <p style="margin: 10px 0;">Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</p>
            <p style="margin: 10px 0;">Échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
        </div>
    </div>

    <div class="client-info">
        <h3 style="margin-top: 0;">Facturé à :</h3>
        <p style="margin: 5px 0;"><strong>${invoice.clientName}</strong></p>
        <p style="margin: 5px 0;">Email: ${invoice.clientEmail}</p>
        <p style="margin: 5px 0;">Projet: ${invoice.projectName}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: center;">Quantité</th>
                <th style="text-align: right;">Prix Unitaire</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${item.unitPrice.toLocaleString('fr-FR')} FCFA</td>
                    <td style="text-align: right;">${item.total.toLocaleString('fr-FR')} FCFA</td>
                </tr>
            `).join('')}
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="3" style="text-align: right;">Sous-total HT</td>
                <td style="text-align: right;">${invoice.amount.toLocaleString('fr-FR')} FCFA</td>
            </tr>
            <tr class="total-row">
                <td colspan="3" style="text-align: right;">TVA (${this.config.taxRate}%)</td>
                <td style="text-align: right;">${invoice.taxAmount.toLocaleString('fr-FR')} FCFA</td>
            </tr>
            <tr class="total-row grand-total">
                <td colspan="3" style="text-align: right;">TOTAL TTC</td>
                <td style="text-align: right;">${invoice.totalAmount.toLocaleString('fr-FR')} FCFA</td>
            </tr>
        </tfoot>
    </table>

    <div class="payment-info">
        <h4 style="margin-top: 0;">💳 Informations de Paiement</h4>
        <p><strong>Modes de paiement acceptés :</strong></p>
        <ul>
            <li>Virement bancaire</li>
            <li>Mobile Money (Orange Money, Wave, Free Money)</li>
            <li>Chèque à l'ordre de IntuitionConcept</li>
        </ul>
        <p><strong>Échéance :</strong> ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
        ${this.config.includePaymentLink ? `
            <p><strong>Payer en ligne :</strong> <a href="https://intuitionconcept.com/invoices/${invoice.id}/pay">Cliquez ici</a></p>
        ` : ''}
    </div>

    <div class="footer">
        <p>Merci de votre confiance !</p>
        <p>IntuitionConcept - NINEA: XXXXXXXXX - RC: XXXXXXXXX</p>
        <p>www.intuitionconcept.com | contact@intuitionconcept.com</p>
    </div>
</body>
</html>
        `.trim();

        return html;
    }

    /**
     * Génère l'email d'envoi de facture
     */
    generateInvoiceEmail(invoice: Invoice): { subject: string; body: string } {
        const subject = `Facture ${invoice.invoiceNumber} - ${invoice.projectName}`;

        const body = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .invoice-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .amount { font-size: 36px; font-weight: bold; color: #667eea; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .payment-methods { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏗️ IntuitionConcept</h1>
            <p>Nouvelle Facture</p>
        </div>
        
        <div class="content">
            <h2>Bonjour ${invoice.clientName},</h2>
            
            <p>Nous vous remercions pour votre confiance. Veuillez trouver ci-joint la facture pour le projet <strong>${invoice.projectName}</strong>.</p>
            
            <div class="invoice-summary">
                <h3>📋 Détails de la facture</h3>
                <p><strong>Numéro :</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Date :</strong> ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</p>
                <p><strong>Échéance :</strong> ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
                <p><strong>Montant TTC :</strong> <span class="amount">${invoice.totalAmount.toLocaleString('fr-FR')} FCFA</span></p>
            </div>
            
            <div class="payment-methods">
                <strong>💳 Modes de paiement :</strong>
                <ul>
                    <li>Virement bancaire</li>
                    <li>Mobile Money (Orange Money, Wave, Free Money)</li>
                    <li>Chèque</li>
                </ul>
            </div>
            
            ${this.config.includePaymentLink ? `
                <div style="text-align: center;">
                    <a href="https://intuitionconcept.com/invoices/${invoice.id}/pay" class="cta-button">
                        💳 Payer en ligne
                    </a>
                </div>
            ` : ''}
            
            <p style="margin-top: 30px;">
                La facture complète est jointe à cet email au format PDF.
            </p>
            
            <p>
                Pour toute question, n'hésitez pas à nous contacter :<br>
                📞 +221 XX XXX XX XX<br>
                📧 contact@intuitionconcept.com
            </p>
            
            <p>
                Cordialement,<br>
                <strong>L'équipe IntuitionConcept</strong>
            </p>
        </div>
    </div>
</body>
</html>
        `.trim();

        return { subject, body };
    }

    /**
     * Envoie une facture par email
     */
    async sendInvoice(invoiceId: string): Promise<void> {
        // Récupérer la facture
        const invoicesRef = collection(db, 'invoices');
        const q = query(invoicesRef, where('__name__', '==', invoiceId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            throw new Error('Facture non trouvée');
        }

        const invoiceData = snapshot.docs[0].data();
        const invoice: Invoice = {
            id: invoiceId,
            ...invoiceData,
            createdAt: invoiceData.createdAt.toDate(),
            dueDate: invoiceData.dueDate.toDate(),
            sentAt: invoiceData.sentAt?.toDate(),
            paidAt: invoiceData.paidAt?.toDate()
        } as Invoice;

        // Générer PDF et email
        const pdfHtml = this.generateInvoicePDF(invoice);
        const { subject, body } = this.generateInvoiceEmail(invoice);

        // Ici, intégration avec service d'envoi email + PDF
        // await emailService.sendWithAttachment(invoice.clientEmail, subject, body, pdfHtml);

        // Mettre à jour le statut
        const invoiceRef = doc(db, 'invoices', invoiceId);
        await updateDoc(invoiceRef, {
            status: 'sent',
            sentAt: Timestamp.now()
        });

        auditLogger.log('invoice_sent', { invoiceId, clientEmail: invoice.clientEmail });
    }

    /**
     * Traite toutes les facturations automatiques
     */
    async processAutoInvoicing(): Promise<{
        projectsProcessed: number;
        invoicesGenerated: number;
        invoicesSent: number;
        errors: Array<{ projectId: string; error: string }>;
    }> {
        const result = {
            projectsProcessed: 0,
            invoicesGenerated: 0,
            invoicesSent: 0,
            errors: []
        };

        try {
            const projects = await this.findProjectsNeedingInvoice();
            result.projectsProcessed = projects.length;

            for (const project of projects) {
                try {
                    // Générer la facture
                    const invoice = await this.generateInvoice(project.id);
                    result.invoicesGenerated++;

                    // Envoyer automatiquement si configuré
                    if (this.config.autoSendEnabled) {
                        await this.sendInvoice(invoice.id);
                        result.invoicesSent++;
                    }
                } catch (error) {
                    result.errors.push({
                        projectId: project.id,
                        error: error instanceof Error ? error.message : 'Erreur inconnue'
                    });
                }
            }

            auditLogger.log('auto_invoicing_processed', result);
        } catch (error) {
            auditLogger.log('auto_invoicing_error', {
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            });
            throw error;
        }

        return result;
    }
}

export const autoInvoiceService = new AutoInvoiceService();
export default autoInvoiceService;
