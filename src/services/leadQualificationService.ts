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
