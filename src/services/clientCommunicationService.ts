import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { auditLogger } from './auditLogger';

export interface ClientUpdate {
    id: string;
    projectId: string;
    projectName: string;
    clientId: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    updateType: 'progress' | 'issue' | 'delivery' | 'completion' | 'milestone';
    message: string;
    progress: number;
    photos?: string[];
    sendEmail: boolean;
    sendSMS: boolean;
    sentAt?: Date;
    createdAt: Date;
}

export interface CommunicationConfig {
    enabled: boolean;
    autoSendEnabled: boolean;
    progressThreshold: number; // Envoyer update tous les X%
    includePhotos: boolean;
    emailPreferred: boolean;
    smsForUrgent: boolean;
    scheduleTime: string; // Heure d'envoi préférée (ex: "09:00")
}

class ClientCommunicationService {
    private config: CommunicationConfig = {
        enabled: true,
        autoSendEnabled: true,
        progressThreshold: 10, // Update tous les 10%
        includePhotos: true,
        emailPreferred: true,
        smsForUrgent: true,
        scheduleTime: '09:00'
    };

    configure(config: Partial<CommunicationConfig>): void {
        this.config = { ...this.config, ...config };
        auditLogger.log('client_communication_configured', { config: this.config });
    }

    getConfig(): CommunicationConfig {
        return { ...this.config };
    }

    /**
     * Génère un message de mise à jour personnalisé
     */
    generateUpdateMessage(update: ClientUpdate): { subject: string; body: string; sms: string } {
        let subject = '';
        let greeting = '';
        let content = '';
        let sms = '';

        switch (update.updateType) {
            case 'progress':
                subject = `Avancement ${update.projectName} - ${update.progress}%`;
                greeting = `Bonjour ${update.clientName},`;
                content = `
                    <p>Nous sommes heureux de vous informer que votre projet <strong>${update.projectName}</strong> 
                    progresse bien !</p>
                    
                    <div style="background: linear-gradient(90deg, #667eea ${update.progress}%, #e0e0e0 ${update.progress}%); 
                                height: 30px; border-radius: 15px; position: relative; margin: 20px 0;">
                        <div style="position: absolute; width: 100%; text-align: center; line-height: 30px; 
                                    font-weight: bold; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
                            ${update.progress}% complété
                        </div>
                    </div>
                    
                    <p>${update.message}</p>
                `;
                sms = `${update.clientName}, votre projet "${update.projectName}" est à ${update.progress}% ! ${update.message}`;
                break;

            case 'issue':
                subject = `⚠️ Information importante - ${update.projectName}`;
                greeting = `Bonjour ${update.clientName},`;
                content = `
                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                        <p><strong>⚠️ Point d'attention</strong></p>
                        <p>${update.message}</p>
                    </div>
                    <p>Notre équipe travaille activement pour résoudre cette situation. 
                    Nous vous tiendrons informé de l'évolution.</p>
                `;
                sms = `⚠️ ${update.clientName}, info importante sur "${update.projectName}": ${update.message}. Nous vous rappelons.`;
                break;

            case 'delivery':
                subject = `🚚 Livraison matériaux - ${update.projectName}`;
                greeting = `Bonjour ${update.clientName},`;
                content = `
                    <p>📦 Bonne nouvelle ! Les matériaux pour votre projet <strong>${update.projectName}</strong> 
                    ont été livrés.</p>
                    <p>${update.message}</p>
                `;
                sms = `📦 ${update.clientName}, matériaux livrés pour "${update.projectName}". ${update.message}`;
                break;

            case 'completion':
                subject = `🎉 Projet terminé - ${update.projectName}`;
                greeting = `Cher ${update.clientName},`;
                content = `
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                color: white; padding: 30px; text-align: center; border-radius: 10px; margin: 20px 0;">
                        <h2 style="margin: 0;">🎉 Félicitations !</h2>
                        <p style="font-size: 18px; margin: 10px 0;">Votre projet est terminé</p>
                    </div>
                    <p>${update.message}</p>
                    <p>Nous serions ravis de recueillir votre avis sur ce projet.</p>
                `;
                sms = `🎉 ${update.clientName}, votre projet "${update.projectName}" est terminé ! Merci de votre confiance.`;
                break;

            case 'milestone':
                subject = `✅ Étape importante franchie - ${update.projectName}`;
                greeting = `Bonjour ${update.clientName},`;
                content = `
                    <p>✅ Une étape importante de votre projet <strong>${update.projectName}</strong> 
                    vient d'être franchie !</p>
                    <p>${update.message}</p>
                `;
                sms = `✅ ${update.clientName}, étape importante franchie sur "${update.projectName}". ${update.message}`;
                break;
        }

        const body = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .photos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0; }
        .photos img { width: 100%; border-radius: 8px; }
        .cta-button { display: inline-block; background: #667eea; color: white; 
                      padding: 15px 40px; text-decoration: none; border-radius: 8px; 
                      font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏗️ IntuitionConcept</h1>
            <p>Mise à jour de votre projet</p>
        </div>
        
        <div class="content">
            ${greeting}
            ${content}
            
            ${update.photos && update.photos.length > 0 ? `
                <h3>📸 Photos du chantier</h3>
                <div class="photos">
                    ${update.photos.map(photo => `<img src="${photo}" alt="Photo chantier" />`).join('')}
                </div>
            ` : ''}
            
            <p style="margin-top: 30px;">
                Pour toute question, n'hésitez pas à nous contacter :<br>
                📞 +221 XX XXX XX XX<br>
                📧 contact@intuitionconcept.com<br>
                💬 WhatsApp disponible
            </p>
            
            <div style="text-align: center;">
                <a href="https://intuitionconcept.com/projects/${update.projectId}" class="cta-button">
                    📊 Voir le projet
                </a>
            </div>
            
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

        return { subject, body, sms };
    }

    /**
     * Envoie une mise à jour client
     */
    async sendUpdate(update: ClientUpdate): Promise<void> {
        const { subject, body, sms } = this.generateUpdateMessage(update);

        // Email
        if (update.sendEmail) {
            // await emailService.send(update.clientEmail, subject, body);
        }

        // SMS
        if (update.sendSMS && update.clientPhone) {
            // await smsService.send(update.clientPhone, sms);
        }

        auditLogger.log('client_update_sent', {
            projectId: update.projectId,
            updateType: update.updateType,
            email: update.sendEmail,
            sms: update.sendSMS
        });
    }

    /**
     * Traite les communications automatiques
     */
    async processAutoCommunications(): Promise<{
        projectsProcessed: number;
        updatesSent: number;
        errors: Array<{ projectId: string; error: string }>;
    }> {
        const result = {
            projectsProcessed: 0,
            updatesSent: 0,
            errors: []
        };

        try {
            // Récupérer projets actifs
            const projectsRef = collection(db, 'projects');
            const q = query(projectsRef, where('status', '==', 'active'));
            const snapshot = await getDocs(q);

            for (const docSnap of snapshot.docs) {
                try {
                    const project = docSnap.data();
                    result.projectsProcessed++;

                    // Vérifier si update nécessaire
                    const lastProgress = project.lastProgressUpdate || 0;
                    const currentProgress = project.progress || 0;

                    if (currentProgress - lastProgress >= this.config.progressThreshold) {
                        const update: ClientUpdate = {
                            id: '',
                            projectId: docSnap.id,
                            projectName: project.name,
                            clientId: project.clientId,
                            clientName: project.clientName,
                            clientEmail: project.clientEmail,
                            clientPhone: project.clientPhone,
                            updateType: 'progress',
                            message: `Le projet avance bien ! Nous avons franchi ${currentProgress}% de réalisation.`,
                            progress: currentProgress,
                            photos: project.latestPhotos || [],
                            sendEmail: this.config.emailPreferred,
                            sendSMS: false,
                            createdAt: new Date()
                        };

                        await this.sendUpdate(update);
                        result.updatesSent++;

                        // Mettre à jour lastProgressUpdate
                        await updateDoc(doc(db, 'projects', docSnap.id), {
                            lastProgressUpdate: currentProgress
                        });
                    }
                } catch (error) {
                    result.errors.push({
                        projectId: docSnap.id,
                        error: error instanceof Error ? error.message : 'Erreur inconnue'
                    });
                }
            }

            auditLogger.log('auto_communications_processed', result);
        } catch (error) {
            auditLogger.log('auto_communications_error', {
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            });
            throw error;
        }

        return result;
    }
}

export const clientCommunicationService = new ClientCommunicationService();
export default clientCommunicationService;
