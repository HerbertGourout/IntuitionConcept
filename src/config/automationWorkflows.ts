export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  category: 'devis' | 'projet' | 'finance' | 'equipe' | 'client' | 'admin';
  priority: 'critique' | 'haute' | 'moyenne' | 'basse';
  frequency: 'temps_reel' | 'quotidien' | 'hebdomadaire' | 'mensuel';
  triggers: string[];
  actions: string[];
  estimatedTimeSaved: string; // en heures/semaine
  businessImpact: string;
}

export const CRITICAL_AUTOMATIONS: AutomationWorkflow[] = [
  // === DEVIS & FACTURATION ===
  {
    id: 'auto_quote_generation',
    name: 'Génération Automatique de Devis',
    description: 'IA génère automatiquement des devis à partir de plans architecturaux uploadés',
    category: 'devis',
    priority: 'critique',
    frequency: 'temps_reel',
    triggers: [
      'Upload de plans PDF/DWG',
      'Demande client via formulaire',
      'Email avec pièces jointes'
    ],
    actions: [
      'Analyse OCR des plans',
      'Calcul automatique des quantités',
      'Application des prix du marché',
      'Génération PDF du devis',
      'Envoi automatique au client'
    ],
    estimatedTimeSaved: '15-20h/semaine',
    businessImpact: 'Réduction 80% du temps de création devis, réponse client en 1h au lieu de 2-3 jours'
  },
  {
    id: 'quote_follow_up',
    name: 'Relances Automatiques Devis',
    description: 'Système de relances intelligentes pour les devis en attente',
    category: 'devis',
    priority: 'haute',
    frequency: 'quotidien',
    triggers: [
      'Devis non répondu après 3 jours',
      'Devis expiré dans 2 jours',
      'Client a ouvert le devis mais pas répondu'
    ],
    actions: [
      'Email de relance personnalisé',
      'SMS si urgent',
      'Notification équipe commerciale',
      'Mise à jour CRM automatique'
    ],
    estimatedTimeSaved: '5-8h/semaine',
    businessImpact: '+25% taux de conversion devis'
  },
  {
    id: 'invoice_automation',
    name: 'Facturation Automatique',
    description: 'Génération et envoi automatique des factures selon avancement projet',
    category: 'finance',
    priority: 'critique',
    frequency: 'temps_reel',
    triggers: [
      'Validation étape projet',
      'Livraison matériaux',
      'Fin de phase travaux',
      'Date échéance contractuelle'
    ],
    actions: [
      'Calcul montant selon avancement',
      'Génération facture PDF',
      'Envoi client + comptable',
      'Mise à jour trésorerie',
      'Programmation relances paiement'
    ],
    estimatedTimeSaved: '10-12h/semaine',
    businessImpact: 'Réduction délais paiement de 30%, cash-flow amélioré'
  },

  // === GESTION PROJET ===
  {
    id: 'project_monitoring',
    name: 'Surveillance Projet Temps Réel',
    description: 'Monitoring automatique avancement, budget, délais avec alertes prédictives',
    category: 'projet',
    priority: 'critique',
    frequency: 'temps_reel',
    triggers: [
      'Mise à jour tâche',
      'Dépassement budget prévu',
      'Retard sur planning',
      'Problème météo/livraison'
    ],
    actions: [
      'Calcul impact sur planning global',
      'Alerte équipe + client si nécessaire',
      'Proposition solutions alternatives',
      'Mise à jour automatique Gantt',
      'Rapport hebdomadaire automatique'
    ],
    estimatedTimeSaved: '8-10h/semaine',
    businessImpact: 'Réduction 40% des retards projet, satisfaction client +30%'
  },
  {
    id: 'resource_optimization',
    name: 'Optimisation Ressources & Équipes',
    description: 'IA optimise automatiquement allocation équipes et matériels',
    category: 'equipe',
    priority: 'haute',
    frequency: 'quotidien',
    triggers: [
      'Nouveau projet validé',
      'Changement planning',
      'Absence équipe',
      'Panne matériel'
    ],
    actions: [
      'Réallocation optimale des équipes',
      'Commande matériaux automatique',
      'Notification changements planning',
      'Optimisation trajets chantiers',
      'Mise à jour coûts projet'
    ],
    estimatedTimeSaved: '6-8h/semaine',
    businessImpact: '+15% productivité équipes, -20% coûts logistique'
  },
  {
    id: 'quality_control',
    name: 'Contrôle Qualité Automatisé',
    description: 'IA analyse photos chantier pour détecter défauts et non-conformités',
    category: 'projet',
    priority: 'haute',
    frequency: 'temps_reel',
    triggers: [
      'Upload photos chantier',
      'Fin étape travaux',
      'Demande contrôle qualité'
    ],
    actions: [
      'Analyse IA des photos',
      'Détection défauts/non-conformités',
      'Génération rapport qualité',
      'Alerte équipe si problème',
      'Planification corrections'
    ],
    estimatedTimeSaved: '4-6h/semaine',
    businessImpact: 'Réduction 60% défauts, -50% reprises'
  },

  // === FINANCE & COMPTABILITÉ ===
  {
    id: 'expense_processing',
    name: 'Traitement Automatique Dépenses',
    description: 'OCR + IA pour traiter automatiquement factures et notes de frais',
    category: 'finance',
    priority: 'haute',
    frequency: 'temps_reel',
    triggers: [
      'Email facture fournisseur',
      'Photo note de frais',
      'Scan document comptable'
    ],
    actions: [
      'Extraction données OCR',
      'Validation IA des montants',
      'Affectation projet automatique',
      'Mise à jour comptabilité',
      'Demande validation si doute'
    ],
    estimatedTimeSaved: '8-12h/semaine',
    businessImpact: 'Réduction 70% temps saisie comptable, -90% erreurs'
  },
  {
    id: 'cash_flow_prediction',
    name: 'Prédiction Trésorerie',
    description: 'IA prédit trésorerie et optimise paiements fournisseurs',
    category: 'finance',
    priority: 'critique',
    frequency: 'quotidien',
    triggers: [
      'Nouvelle facture',
      'Paiement reçu',
      'Échéance fournisseur',
      'Début de mois'
    ],
    actions: [
      'Calcul prévisionnel trésorerie',
      'Optimisation calendrier paiements',
      'Alerte risque découvert',
      'Proposition négociation délais',
      'Rapport CFO automatique'
    ],
    estimatedTimeSaved: '4-6h/semaine',
    businessImpact: 'Réduction 80% risques trésorerie, optimisation financière'
  },

  // === RELATION CLIENT ===
  {
    id: 'client_communication',
    name: 'Communication Client Automatisée',
    description: 'IA gère communication client avec mises à jour personnalisées',
    category: 'client',
    priority: 'haute',
    frequency: 'quotidien',
    triggers: [
      'Avancement projet',
      'Problème chantier',
      'Livraison matériaux',
      'Demande client'
    ],
    actions: [
      'Génération update personnalisé',
      'Envoi SMS/email selon préférence',
      'Photos avant/après automatiques',
      'Planification RDV si nécessaire',
      'Mise à jour satisfaction client'
    ],
    estimatedTimeSaved: '6-8h/semaine',
    businessImpact: 'Satisfaction client +40%, réduction 60% réclamations'
  },
  {
    id: 'lead_qualification',
    name: 'Qualification Automatique Prospects',
    description: 'IA qualifie et score automatiquement les nouveaux prospects',
    category: 'client',
    priority: 'haute',
    frequency: 'temps_reel',
    triggers: [
      'Nouveau contact site web',
      'Email demande devis',
      'Appel téléphonique',
      'Référencement client'
    ],
    actions: [
      'Scoring automatique prospect',
      'Recherche infos entreprise',
      'Affectation commercial optimal',
      'Génération brief prospect',
      'Planification rappel automatique'
    ],
    estimatedTimeSaved: '4-6h/semaine',
    businessImpact: '+30% taux conversion prospects, focus sur leads qualifiés'
  },

  // === CONFORMITÉ & ADMIN ===
  {
    id: 'regulatory_compliance',
    name: 'Conformité Réglementaire Auto',
    description: 'Vérification automatique conformité normes BTP et génération documents',
    category: 'admin',
    priority: 'critique',
    frequency: 'temps_reel',
    triggers: [
      'Nouveau projet',
      'Changement réglementation',
      'Contrôle périodique',
      'Demande certification'
    ],
    actions: [
      'Vérification conformité normes',
      'Génération documents obligatoires',
      'Alerte non-conformité',
      'Planification contrôles',
      'Mise à jour procédures'
    ],
    estimatedTimeSaved: '6-10h/semaine',
    businessImpact: 'Réduction 90% risques conformité, -100% amendes'
  },
  {
    id: 'document_management',
    name: 'Gestion Documentaire Intelligente',
    description: 'IA classe, indexe et archive automatiquement tous les documents',
    category: 'admin',
    priority: 'moyenne',
    frequency: 'temps_reel',
    triggers: [
      'Upload document',
      'Email avec PJ',
      'Scan papier',
      'Génération rapport'
    ],
    actions: [
      'Classification automatique',
      'Extraction métadonnées',
      'Indexation recherche',
      'Archivage sécurisé',
      'Notification parties prenantes'
    ],
    estimatedTimeSaved: '3-5h/semaine',
    businessImpact: 'Recherche documents 10x plus rapide, conformité archivage'
  },

  // === MAINTENANCE & ÉQUIPEMENTS ===
  {
    id: 'predictive_maintenance',
    name: 'Maintenance Prédictive Équipements',
    description: 'IA prédit pannes équipements et planifie maintenance préventive',
    category: 'equipe',
    priority: 'haute',
    frequency: 'quotidien',
    triggers: [
      'Données capteurs IoT',
      'Heures utilisation',
      'Historique pannes',
      'Conditions météo'
    ],
    actions: [
      'Analyse prédictive pannes',
      'Planification maintenance',
      'Commande pièces détachées',
      'Notification équipe technique',
      'Optimisation planning chantiers'
    ],
    estimatedTimeSaved: '4-6h/semaine',
    businessImpact: 'Réduction 70% pannes, +25% disponibilité équipements'
  }
];

// Calcul impact global
export const AUTOMATION_SUMMARY = {
  totalTimeSaved: '70-100h/semaine', // Équivalent 2-3 ETP
  totalWorkflows: CRITICAL_AUTOMATIONS.length,
  criticalWorkflows: CRITICAL_AUTOMATIONS.filter(w => w.priority === 'critique').length,
  estimatedROI: '300-500%', // Retour sur investissement
  implementationPriority: [
    'auto_quote_generation',
    'invoice_automation', 
    'project_monitoring',
    'expense_processing',
    'cash_flow_prediction'
  ]
};

export default CRITICAL_AUTOMATIONS;
