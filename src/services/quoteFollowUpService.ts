import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { auditLogger } from './auditLogger';

export interface Quote {
    id: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    amount: number;
    status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
    sentAt?: Date;
    viewedAt?: Date;
    expiresAt?: Date;
    lastFollowUpAt?: Date;
    followUpCount: number;
    projectName: string;
    createdBy: string;
}

export interface FollowUpConfig {
    enabled: boolean;
    firstFollowUpDays: number;      // Jours après envoi pour 1ère relance
    secondFollowUpDays: number;     // Jours après 1ère relance pour 2ème
    thirdFollowUpDays: number;      // Jours après 2ème relance pour 3ème
    maxFollowUps: number;           // Nombre max de relances
    expiryWarningDays: number;      // Jours avant expiration pour alerte
    sendSMS: boolean;               // Envoyer SMS en plus de l'email
    smsOnlyUrgent: boolean;         // SMS uniquement pour relances urgentes
}

export interface FollowUpResult {
    quotesProcessed: number;
    emailsSent: number;
    smsSent: number;
    errors: Array<{ quoteId: string; error: string }>;
}

class QuoteFollowUpService {
    private config: FollowUpConfig = {
        enabled: true,
        firstFollowUpDays: 3,
        secondFollowUpDays: 7,
        thirdFollowUpDays: 14,
        maxFollowUps: 3,
        expiryWarningDays: 2,
        sendSMS: false,
        smsOnlyUrgent: true
    };

    /**
     * Configure le service de relances
     */
    configure(config: Partial<FollowUpConfig>): void {
        this.config = { ...this.config, ...config };
        auditLogger.log('quote_followup_configured', { config: this.config });
    }

    /**
     * Récupère la configuration actuelle
     */
    getConfig(): FollowUpConfig {
        return { ...this.config };
    }

    /**
     * Trouve les devis nécessitant une relance
     */
    async findQuotesNeedingFollowUp(): Promise<Quote[]> {
        if (!this.config.enabled) {
            return [];
        }

        const quotesRef = collection(db, 'quotes');
        const now = new Date();
        const quotes: Quote[] = [];

        // Requête pour les devis envoyés mais pas acceptés/rejetés
        const q = query(
            quotesRef,
            where('status', 'in', ['sent', 'viewed'])
        );

        const snapshot = await getDocs(q);

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const quote: Quote = {
                id: docSnap.id,
                clientName: data.clientName || 'Client',
                clientEmail: data.clientEmail,
                clientPhone: data.clientPhone,
                amount: data.amount || 0,
                status: data.status,
                sentAt: data.sentAt?.toDate(),
                viewedAt: data.viewedAt?.toDate(),
                expiresAt: data.expiresAt?.toDate(),
                lastFollowUpAt: data.lastFollowUpAt?.toDate(),
                followUpCount: data.followUpCount || 0,
                projectName: data.projectName || 'Projet',
                createdBy: data.createdBy || 'system'
            };

            // Vérifier si le devis nécessite une relance
            if (this.shouldFollowUp(quote, now)) {
                quotes.push(quote);
            }
        });

        return quotes;
    }

    /**
     * Détermine si un devis nécessite une relance
     */
    private shouldFollowUp(quote: Quote, now: Date): boolean {
        // Pas de relance si déjà max atteint
        if (quote.followUpCount >= this.config.maxFollowUps) {
            return false;
        }

        // Pas de relance si expiré
        if (quote.expiresAt && quote.expiresAt < now) {
            return false;
        }

        const referenceDate = quote.lastFollowUpAt || quote.sentAt;
        if (!referenceDate) {
            return false;
        }

        const daysSinceReference = this.getDaysDifference(referenceDate, now);

        // Déterminer le délai selon le nombre de relances
        let requiredDays: number;
        switch (quote.followUpCount) {
            case 0:
                requiredDays = this.config.firstFollowUpDays;
                break;
            case 1:
                requiredDays = this.config.secondFollowUpDays;
                break;
            case 2:
                requiredDays = this.config.thirdFollowUpDays;
                break;
            default:
                return false;
        }

        return daysSinceReference >= requiredDays;
    }

    /**
     * Trouve les devis proches de l'expiration
     */
    async findQuotesNearExpiry(): Promise<Quote[]> {
        if (!this.config.enabled) {
            return [];
        }

        const quotesRef = collection(db, 'quotes');
        const now = new Date();
        const warningDate = new Date(now.getTime() + this.config.expiryWarningDays * 24 * 60 * 60 * 1000);
        const quotes: Quote[] = [];

        const q = query(
            quotesRef,
            where('status', 'in', ['sent', 'viewed'])
        );

        const snapshot = await getDocs(q);

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const expiresAt = data.expiresAt?.toDate();

            if (expiresAt && expiresAt > now && expiresAt <= warningDate) {
                quotes.push({
                    id: docSnap.id,
                    clientName: data.clientName || 'Client',
                    clientEmail: data.clientEmail,
                    clientPhone: data.clientPhone,
                    amount: data.amount || 0,
                    status: data.status,
                    sentAt: data.sentAt?.toDate(),
                    viewedAt: data.viewedAt?.toDate(),
                    expiresAt,
                    lastFollowUpAt: data.lastFollowUpAt?.toDate(),
                    followUpCount: data.followUpCount || 0,
                    projectName: data.projectName || 'Projet',
                    createdBy: data.createdBy || 'system'
                });
            }
        });

        return quotes;
    }

    /**
     * Génère le contenu de l'email de relance
     */
    generateFollowUpEmail(quote: Quote): { subject: string; body: string } {
        const followUpNumber = quote.followUpCount + 1;
        const daysLeft = quote.expiresAt 
            ? Math.ceil(this.getDaysDifference(new Date(), quote.expiresAt))
            : null;

        let subject: string;
        let urgency: string;

        if (followUpNumber === 1) {
            subject = `Rappel : Votre devis pour ${quote.projectName}`;
            urgency = 'Nous espérons que vous avez eu le temps de consulter notre proposition.';
        } else if (followUpNumber === 2) {
            subject = `2ème rappel : Devis ${quote.projectName} - Besoin d'informations ?`;
            urgency = 'Nous souhaitons nous assurer que vous avez toutes les informations nécessaires.';
        } else {
            subject = `Dernière chance : Devis ${quote.projectName}`;
            urgency = 'C\'est votre dernière opportunité de bénéficier de cette offre.';
        }

        const expiryText = daysLeft 
            ? `<p><strong>⚠️ Attention :</strong> Ce devis expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.</p>`
            : '';

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
        .quote-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .amount { font-size: 32px; font-weight: bold; color: #667eea; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .urgency { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏗️ IntuitionConcept</h1>
            <p>Votre partenaire BTP de confiance</p>
        </div>
        
        <div class="content">
            <h2>Bonjour ${quote.clientName},</h2>
            
            <p>${urgency}</p>
            
            <div class="quote-details">
                <h3>📋 Détails du devis</h3>
                <p><strong>Projet :</strong> ${quote.projectName}</p>
                <p><strong>Montant :</strong> <span class="amount">${quote.amount.toLocaleString('fr-FR')} FCFA</span></p>
                ${quote.sentAt ? `<p><strong>Envoyé le :</strong> ${quote.sentAt.toLocaleDateString('fr-FR')}</p>` : ''}
                ${quote.viewedAt ? `<p>✅ <em>Vous avez consulté ce devis le ${quote.viewedAt.toLocaleDateString('fr-FR')}</em></p>` : ''}
            </div>
            
            ${expiryText}
            
            <div class="urgency">
                <strong> Besoin d'aide ?</strong><br>
                Notre équipe est à votre disposition pour répondre à toutes vos questions :
                <ul>
                    <li>📞 Appelez-nous au +221 XX XXX XX XX</li>
                    <li>📧 Répondez à cet email</li>
                    <li>💬 Contactez-nous via WhatsApp</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="https://intuitionconcept.com/quotes/${quote.id}" class="cta-button">
                    📄 Consulter mon devis
                </a>
            </div>
            
            <p style="margin-top: 30px;">
                Nous serions ravis de collaborer avec vous sur ce projet !
            </p>
            
            <p>
                Cordialement,<br>
                <strong>L'équipe IntuitionConcept</strong>
            </p>
        </div>
        
        <div class="footer">
            <p>IntuitionConcept - Plateforme de Gestion BTP Intelligente</p>
            <p>Dakar, Sénégal | www.intuitionconcept.com</p>
        </div>
    </div>
</body>
</html>
        `.trim();

        return { subject, body };
    }

    /**
     * Génère le contenu du SMS de relance
     */
    generateFollowUpSMS(quote: Quote): string {
        const followUpNumber = quote.followUpCount + 1;
        const daysLeft = quote.expiresAt 
            ? Math.ceil(this.getDaysDifference(new Date(), quote.expiresAt))
            : null;

        if (followUpNumber === 1) {
            return `Bonjour ${quote.clientName}, votre devis "${quote.projectName}" (${quote.amount.toLocaleString()} FCFA) attend votre réponse. Consultez-le : https://intuitionconcept.com/quotes/${quote.id}`;
        } else if (followUpNumber === 2) {
            return `${quote.clientName}, besoin d'infos sur votre devis "${quote.projectName}" ? ${daysLeft ? `Expire dans ${daysLeft}j.` : ''} Contactez-nous : +221 XX XXX XX XX`;
        } else {
            return `⚠️ DERNIÈRE CHANCE ${quote.clientName} ! Devis "${quote.projectName}" expire ${daysLeft ? `dans ${daysLeft}j` : 'bientôt'}. Répondez vite : https://intuitionconcept.com/quotes/${quote.id}`;
        }
    }

    /**
     * Marque un devis comme relancé
     */
    async markAsFollowedUp(quoteId: string): Promise<void> {
        const quoteRef = doc(db, 'quotes', quoteId);
        
        await updateDoc(quoteRef, {
            lastFollowUpAt: Timestamp.now(),
            followUpCount: (await getDocs(query(collection(db, 'quotes'), where('__name__', '==', quoteId))))
                .docs[0]?.data().followUpCount + 1 || 1,
            updatedAt: Timestamp.now()
        });

        auditLogger.log('quote_followed_up', { quoteId });
    }

    /**
     * Exécute le processus de relance pour tous les devis éligibles
     */
    async processFollowUps(): Promise<FollowUpResult> {
        const result: FollowUpResult = {
            quotesProcessed: 0,
            emailsSent: 0,
            smsSent: 0,
            errors: []
        };

        try {
            // Trouver les devis nécessitant une relance
            const quotes = await this.findQuotesNeedingFollowUp();
            const expiringQuotes = await this.findQuotesNearExpiry();

            // Combiner et dédupliquer
            const allQuotes = [...quotes, ...expiringQuotes];
            const uniqueQuotes = Array.from(
                new Map(allQuotes.map(q => [q.id, q])).values()
            );

            for (const quote of uniqueQuotes) {
                try {
                    result.quotesProcessed++;

                    // Générer email
                    const { subject, body } = this.generateFollowUpEmail(quote);

                    // Ici, vous intégrerez votre service d'envoi d'email
                    // await emailService.send(quote.clientEmail, subject, body);
                    result.emailsSent++;

                    // SMS si configuré
                    if (this.shouldSendSMS(quote)) {
                        const smsText = this.generateFollowUpSMS(quote);
                        // await smsService.send(quote.clientPhone, smsText);
                        result.smsSent++;
                    }

                    // Marquer comme relancé
                    await this.markAsFollowedUp(quote.id);

                } catch (error) {
                    result.errors.push({
                        quoteId: quote.id,
                        error: error instanceof Error ? error.message : 'Erreur inconnue'
                    });
                }
            }

            auditLogger.log('quote_followups_processed', {
                quotesProcessed: result.quotesProcessed,
                emailsSent: result.emailsSent,
                smsSent: result.smsSent,
                errorsCount: result.errors.length
            });

        } catch (error) {
            auditLogger.log('quote_followups_error', {
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            });
            throw error;
        }

        return result;
    }

    /**
     * Détermine si un SMS doit être envoyé
     */
    private shouldSendSMS(quote: Quote): boolean {
        if (!this.config.sendSMS || !quote.clientPhone) {
            return false;
        }

        if (this.config.smsOnlyUrgent) {
            // SMS uniquement pour dernière relance ou proche expiration
            const isLastFollowUp = quote.followUpCount + 1 >= this.config.maxFollowUps;
            const isNearExpiry = quote.expiresAt 
                ? this.getDaysDifference(new Date(), quote.expiresAt) <= this.config.expiryWarningDays
                : false;
            
            return isLastFollowUp || isNearExpiry;
        }

        return true;
    }

    /**
     * Calcule la différence en jours entre deux dates
     */
    private getDaysDifference(date1: Date, date2: Date): number {
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Obtient les statistiques des relances
     */
    async getFollowUpStats(): Promise<{
        totalQuotesNeedingFollowUp: number;
        quotesNearExpiry: number;
        averageFollowUpCount: number;
        conversionRateAfterFollowUp: number;
    }> {
        const needingFollowUp = await this.findQuotesNeedingFollowUp();
        const nearExpiry = await this.findQuotesNearExpiry();

        // Calculer stats (à implémenter avec vraies données)
        return {
            totalQuotesNeedingFollowUp: needingFollowUp.length,
            quotesNearExpiry: nearExpiry.length,
            averageFollowUpCount: 0, // À calculer
            conversionRateAfterFollowUp: 0 // À calculer
        };
    }
}

export const quoteFollowUpService = new QuoteFollowUpService();
export default quoteFollowUpService;
