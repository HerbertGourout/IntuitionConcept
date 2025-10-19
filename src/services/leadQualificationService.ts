import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { auditLogger } from './auditLogger';

export interface Lead {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    projectType: string;
    budget?: number;
    timeline?: string;
    source: 'website' | 'email' | 'phone' | 'referral' | 'social';
    score: number; // 0-100
    status: 'new' | 'qualified' | 'contacted' | 'converted' | 'lost';
    assignedTo?: string;
    notes?: string;
    createdAt: Date;
    qualifiedAt?: Date;
}

export interface QualificationCriteria {
    budgetWeight: number;
    timelineWeight: number;
    projectTypeWeight: number;
    companyWeight: number;
    sourceWeight: number;
}

export interface QualificationConfig {
    enabled: boolean;
    autoAssignEnabled: boolean;
    minScoreForQualified: number; // Score minimum pour "qualifié"
    criteria: QualificationCriteria;
    autoFollowUpEnabled: boolean;
    followUpDelayHours: number;
}

class LeadQualificationService {
    private config: QualificationConfig = {
        enabled: true,
        autoAssignEnabled: true,
        minScoreForQualified: 60,
        criteria: {
            budgetWeight: 30,
            timelineWeight: 20,
            projectTypeWeight: 20,
            companyWeight: 15,
            sourceWeight: 15
        },
        autoFollowUpEnabled: true,
        followUpDelayHours: 24
    };

    configure(config: Partial<QualificationConfig>): void {
        this.config = { ...this.config, ...config };
        auditLogger.log('lead_qualification_configured', { config: this.config });
    }

    getConfig(): QualificationConfig {
        return { ...this.config };
    }

    /**
     * Calcule le score d'un prospect
     */
    calculateLeadScore(lead: Partial<Lead>): number {
        let score = 0;
        const { criteria } = this.config;

        // Score Budget
        if (lead.budget) {
            if (lead.budget >= 5000000) score += criteria.budgetWeight;
            else if (lead.budget >= 1000000) score += criteria.budgetWeight * 0.7;
            else if (lead.budget >= 500000) score += criteria.budgetWeight * 0.4;
            else score += criteria.budgetWeight * 0.2;
        }

        // Score Timeline
        if (lead.timeline) {
            if (lead.timeline === 'urgent') score += criteria.timelineWeight;
            else if (lead.timeline === '1-3 mois') score += criteria.timelineWeight * 0.8;
            else if (lead.timeline === '3-6 mois') score += criteria.timelineWeight * 0.5;
            else score += criteria.timelineWeight * 0.3;
        }

        // Score Type de Projet
        const highValueProjects = ['construction', 'renovation_complete', 'infrastructure'];
        if (lead.projectType && highValueProjects.includes(lead.projectType)) {
            score += criteria.projectTypeWeight;
        } else {
            score += criteria.projectTypeWeight * 0.5;
        }

        // Score Entreprise
        if (lead.company) {
            score += criteria.companyWeight;
        }

        // Score Source
        const sourceScores: Record<string, number> = {
            'referral': 1.0,
            'website': 0.8,
            'social': 0.6,
            'email': 0.5,
            'phone': 0.7
        };
        if (lead.source) {
            score += criteria.sourceWeight * (sourceScores[lead.source] || 0.5);
        }

        return Math.min(Math.round(score), 100);
    }

    /**
     * Recherche des informations sur l'entreprise (API externe)
     */
    async enrichLeadData(lead: Partial<Lead>): Promise<{
        companyInfo?: any;
        socialProfiles?: any;
        enriched: boolean;
    }> {
        // Simulation - À remplacer par vraie API (Clearbit, Hunter.io, etc.)
        if (!lead.company && !lead.email) {
            return { enriched: false };
        }

        try {
            // Exemple d'enrichissement
            const companyInfo = {
                name: lead.company,
                industry: 'Construction',
                size: '10-50 employees',
                website: `https://${lead.company?.toLowerCase().replace(/\s/g, '')}.com`
            };

            return {
                companyInfo,
                enriched: true
            };
        } catch (error) {
            return { enriched: false };
        }
    }

    /**
     * Assigne automatiquement un commercial
     */
    async assignSalesRep(lead: Lead): Promise<string> {
        // Logique d'assignation (round-robin, par région, par charge, etc.)
        // Simulation simple
        const salesReps = ['rep1', 'rep2', 'rep3'];
        
        // Assignation basée sur le score
        if (lead.score >= 80) {
            return 'senior_rep'; // Meilleur commercial pour leads chauds
        } else if (lead.score >= 60) {
            return salesReps[Math.floor(Math.random() * salesReps.length)];
        } else {
            return 'junior_rep'; // Junior pour leads froids
        }
    }

    /**
     * Génère un brief pour le commercial
     */
    generateSalesBrief(lead: Lead, enrichedData?: any): string {
        return `
📋 BRIEF PROSPECT - ${lead.name}

🎯 Score de Qualification : ${lead.score}/100
${lead.score >= this.config.minScoreForQualified ? '✅ QUALIFIÉ' : '⚠️ À QUALIFIER'}

👤 INFORMATIONS CONTACT
Nom : ${lead.name}
Email : ${lead.email}
Téléphone : ${lead.phone || 'Non renseigné'}
Entreprise : ${lead.company || 'Particulier'}

🏗️ PROJET
Type : ${lead.projectType}
Budget : ${lead.budget ? `${lead.budget.toLocaleString('fr-FR')} FCFA` : 'Non renseigné'}
Timeline : ${lead.timeline || 'Non renseigné'}
Source : ${lead.source}

${enrichedData?.companyInfo ? `
🏢 INFORMATIONS ENTREPRISE
Secteur : ${enrichedData.companyInfo.industry}
Taille : ${enrichedData.companyInfo.size}
Site web : ${enrichedData.companyInfo.website}
` : ''}

💡 RECOMMANDATIONS
${lead.score >= 80 ? '🔥 PROSPECT CHAUD - Contacter sous 2h' : ''}
${lead.score >= 60 ? '⭐ Bon prospect - Contacter sous 24h' : ''}
${lead.score < 60 ? '📧 Envoyer email de qualification d\'abord' : ''}

${lead.budget && lead.budget >= 5000000 ? '💰 Budget élevé - Proposer RDV en personne' : ''}
${lead.timeline === 'urgent' ? '⚡ Timeline urgente - Prioriser' : ''}

📝 PROCHAINES ACTIONS
1. ${lead.score >= 80 ? 'Appel téléphonique immédiat' : 'Email de prise de contact'}
2. ${lead.budget ? 'Préparer devis préliminaire' : 'Qualifier le budget'}
3. ${lead.company ? 'Rechercher projets similaires' : 'Comprendre les besoins'}
4. Planifier RDV dans les ${lead.score >= 80 ? '48h' : '7 jours'}

---
Créé automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
        `.trim();
    }

    /**
     * Génère l'email de premier contact
     */
    generateFollowUpEmail(lead: Lead): { subject: string; body: string } {
        const subject = `${lead.name}, parlons de votre projet ${lead.projectType}`;

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
        .cta-button { display: inline-block; background: #667eea; color: white; 
                      padding: 15px 40px; text-decoration: none; border-radius: 8px; 
                      font-weight: bold; margin: 20px 0; }
        .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .benefits li { margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏗️ IntuitionConcept</h1>
            <p>Concrétisons votre projet ensemble</p>
        </div>
        
        <div class="content">
            <h2>Bonjour ${lead.name},</h2>
            
            <p>Merci de l'intérêt que vous portez à IntuitionConcept pour votre projet de 
            <strong>${lead.projectType}</strong>.</p>
            
            <p>Nous avons bien reçu votre demande et nous sommes ravis de pouvoir vous accompagner.</p>
            
            <div class="benefits">
                <h3>🎯 Pourquoi choisir IntuitionConcept ?</h3>
                <ul>
                    <li>✅ <strong>Expertise BTP</strong> : 10+ ans d'expérience en Afrique</li>
                    <li>✅ <strong>Technologie IA</strong> : Devis en 1h au lieu de 3 jours</li>
                    <li>✅ <strong>Transparence</strong> : Suivi en temps réel de votre projet</li>
                    <li>✅ <strong>Prix compétitifs</strong> : Optimisation des coûts garantie</li>
                    <li>✅ <strong>Qualité</strong> : Contrôle qualité à chaque étape</li>
                </ul>
            </div>
            
            ${lead.budget ? `
                <p>Avec un budget de <strong>${lead.budget.toLocaleString('fr-FR')} FCFA</strong>, 
                nous pouvons vous proposer plusieurs options adaptées à vos besoins.</p>
            ` : ''}
            
            <p><strong>Prochaines étapes :</strong></p>
            <ol>
                <li>📞 Échange téléphonique pour comprendre vos besoins (15 min)</li>
                <li>📋 Visite du site si nécessaire</li>
                <li>💰 Devis détaillé sous 24-48h</li>
                <li>🤝 Démarrage des travaux</li>
            </ol>
            
            <div style="text-align: center;">
                <a href="https://intuitionconcept.com/schedule?lead=${lead.id}" class="cta-button">
                    📅 Planifier un appel
                </a>
            </div>
            
            <p style="margin-top: 30px;">
                Je reste à votre disposition pour toute question :<br>
                📞 +221 XX XXX XX XX<br>
                📧 ${lead.assignedTo}@intuitionconcept.com<br>
                💬 WhatsApp disponible
            </p>
            
            <p>
                Au plaisir d'échanger avec vous,<br>
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
     * Qualifie un nouveau prospect
     */
    async qualifyLead(leadData: Partial<Lead>): Promise<Lead> {
        // Calculer le score
        const score = this.calculateLeadScore(leadData);

        // Enrichir les données
        const enrichedData = await this.enrichLeadData(leadData);

        // Créer le lead
        const lead: Omit<Lead, 'id'> = {
            name: leadData.name || '',
            email: leadData.email || '',
            phone: leadData.phone,
            company: enrichedData.companyInfo?.name || leadData.company,
            projectType: leadData.projectType || 'general',
            budget: leadData.budget,
            timeline: leadData.timeline,
            source: leadData.source || 'website',
            score,
            status: score >= this.config.minScoreForQualified ? 'qualified' : 'new',
            createdAt: new Date(),
            qualifiedAt: score >= this.config.minScoreForQualified ? new Date() : undefined
        };

        // Assigner un commercial si auto-assign activé
        if (this.config.autoAssignEnabled) {
            lead.assignedTo = await this.assignSalesRep(lead as Lead);
        }

        // Générer le brief
        const brief = this.generateSalesBrief(lead as Lead, enrichedData);
        lead.notes = brief;

        // Sauvegarder dans Firebase
        const leadsRef = collection(db, 'leads');
        const docRef = await addDoc(leadsRef, {
            ...lead,
            createdAt: Timestamp.now(),
            qualifiedAt: lead.qualifiedAt ? Timestamp.fromDate(lead.qualifiedAt) : null
        });

        const savedLead = { ...lead, id: docRef.id } as Lead;

        // Envoyer email de suivi si configuré
        if (this.config.autoFollowUpEnabled && score >= this.config.minScoreForQualified) {
            setTimeout(async () => {
                const { subject, body } = this.generateFollowUpEmail(savedLead);
                // await emailService.send(savedLead.email, subject, body);
            }, this.config.followUpDelayHours * 60 * 60 * 1000);
        }

        auditLogger.log('lead_qualified', {
            leadId: docRef.id,
            score,
            status: savedLead.status,
            assignedTo: savedLead.assignedTo
        });

        return savedLead;
    }

    /**
     * Traite les nouveaux prospects
     */
    async processNewLeads(): Promise<{
        leadsProcessed: number;
        leadsQualified: number;
        leadsAssigned: number;
        errors: Array<{ leadId: string; error: string }>;
    }> {
        const result = {
            leadsProcessed: 0,
            leadsQualified: 0,
            leadsAssigned: 0,
            errors: []
        };

        try {
            const leadsRef = collection(db, 'leads');
            const q = query(leadsRef, where('status', '==', 'new'));
            const snapshot = await getDocs(q);

            for (const docSnap of snapshot.docs) {
                try {
                    const leadData = docSnap.data();
                    result.leadsProcessed++;

                    // Recalculer le score
                    const score = this.calculateLeadScore(leadData);

                    // Mettre à jour si qualifié
                    if (score >= this.config.minScoreForQualified) {
                        await updateDoc(doc(db, 'leads', docSnap.id), {
                            score,
                            status: 'qualified',
                            qualifiedAt: Timestamp.now()
                        });
                        result.leadsQualified++;

                        // Assigner si pas encore fait
                        if (!leadData.assignedTo && this.config.autoAssignEnabled) {
                            const assignedTo = await this.assignSalesRep({ ...leadData, score } as Lead);
                            await updateDoc(doc(db, 'leads', docSnap.id), { assignedTo });
                            result.leadsAssigned++;
                        }
                    }
                } catch (error) {
                    result.errors.push({
                        leadId: docSnap.id,
                        error: error instanceof Error ? error.message : 'Erreur inconnue'
                    });
                }
            }

            auditLogger.log('new_leads_processed', result);
        } catch (error) {
            auditLogger.log('new_leads_error', {
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            });
            throw error;
        }

        return result;
    }
}

export const leadQualificationService = new LeadQualificationService();
export default leadQualificationService;
