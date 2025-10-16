/**
 * Convertisseur de format de devis
 * 
 * Convertit le format simple de l'analyseur de plans vers le format structuré
 * attendu par le système de devis (Phase → Task → Article)
 */

import type { Quote } from '../services/quotesService';
import type { Phase, Task, Article } from '../types/StructuredQuote';

/**
 * Format simple généré par l'analyseur de plans
 */
export interface SimpleQuote {
  totalCost?: number;
  totalDuration?: number;
  title?: string;
  phases?: Array<{
    name?: string;
    description?: string;
    totalCost?: number;
    duration?: number;
    // Format détaillé Qwen (optionnel)
    lignes?: Array<{
      designation: string;
      unite: string;
      quantite: number;
      prixUnitaire: number;
      prixTotal: number;
    }>;
  }>;
}

/**
 * Métadonnées client pour le devis
 */
export interface QuoteClientInfo {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  companyName?: string;
  projectType?: string;
}

/**
 * Convertit un devis simple vers le format structuré complet
 */
export function convertSimpleQuoteToStructured(
  simpleQuote: SimpleQuote,
  clientInfo: QuoteClientInfo,
  projectId: string = 'default-project'
): Omit<Quote, 'id'> {
  
  const now = new Date().toISOString();
  const totalCost = simpleQuote.totalCost || 0;
  
  // Calculer la TVA (18% par défaut pour l'Afrique de l'Ouest)
  const taxRate = 18;
  const subtotal = totalCost;
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount;

  // Convertir les phases simples vers le format structuré
  const structuredPhases: Phase[] = (simpleQuote.phases || []).map((simplePhase, phaseIndex) => {
    const phaseId = `phase-${Date.now()}-${phaseIndex}`;
    
    // Créer une tâche par défaut pour cette phase
    const tasks: Task[] = [];
    
    // Si la phase a des lignes détaillées (format Qwen), créer des articles
    if (simplePhase.lignes && simplePhase.lignes.length > 0) {
      // Créer une tâche contenant tous les articles
      const articles: Article[] = simplePhase.lignes.map((ligne, articleIndex) => ({
        id: `article-${Date.now()}-${phaseIndex}-${articleIndex}`,
        description: ligne.designation || 'Article',
        quantity: ligne.quantite || 1,
        unit: ligne.unite || 'unité',
        unitPrice: ligne.prixUnitaire || 0,
        totalPrice: ligne.prixTotal || 0,
        notes: ''
      }));

      tasks.push({
        id: `task-${Date.now()}-${phaseIndex}-0`,
        name: simplePhase.name || `Tâche ${phaseIndex + 1}`,
        description: simplePhase.description || '',
        articles,
        totalPrice: articles.reduce((sum, article) => sum + article.totalPrice, 0),
        expanded: true
      });
    } else {
      // Créer une tâche vide avec un article générique
      const article: Article = {
        id: `article-${Date.now()}-${phaseIndex}-0`,
        description: simplePhase.description || 'Prestations diverses',
        quantity: 1,
        unit: 'forfait',
        unitPrice: simplePhase.totalCost || 0,
        totalPrice: simplePhase.totalCost || 0,
        notes: ''
      };

      tasks.push({
        id: `task-${Date.now()}-${phaseIndex}-0`,
        name: simplePhase.name || `Tâche ${phaseIndex + 1}`,
        description: simplePhase.description || '',
        articles: [article],
        totalPrice: article.totalPrice,
        expanded: true
      });
    }

    return {
      id: phaseId,
      name: simplePhase.name || `Phase ${phaseIndex + 1}`,
      description: simplePhase.description || '',
      tasks,
      totalPrice: tasks.reduce((sum, task) => sum + task.totalPrice, 0),
      expanded: true
    };
  });

  // Calculer la date de validité (30 jours par défaut)
  const validityDays = 30;
  const validUntil = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();

  // Construire le devis structuré complet
  const structuredQuote: Omit<Quote, 'id'> = {
    projectId,
    reference: '', // Sera généré par QuotesService.generateNextQuoteReference()
    title: simpleQuote.title || 'Devis généré depuis plan architectural',
    clientName: clientInfo.clientName,
    clientEmail: clientInfo.clientEmail,
    clientPhone: clientInfo.clientPhone,
    companyName: clientInfo.companyName || '',
    projectType: clientInfo.projectType || 'construction',
    phases: structuredPhases,
    subtotal,
    taxRate,
    taxAmount,
    totalAmount,
    discountRate: 0,
    discountAmount: 0,
    status: 'draft',
    validityDays,
    validUntil,
    paymentTerms: 'Paiement en 3 fois : 30% à la commande, 40% à mi-parcours, 30% à la livraison',
    notes: `Devis généré automatiquement depuis l'analyse du plan architectural.\n\nDurée estimée : ${simpleQuote.totalDuration || 0} jours`,
    createdAt: now,
    updatedAt: now
  };

  return structuredQuote;
}

/**
 * Valide qu'un devis simple contient les informations minimales
 */
export function validateSimpleQuote(simpleQuote: SimpleQuote): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!simpleQuote.totalCost || simpleQuote.totalCost <= 0) {
    errors.push('Le coût total doit être supérieur à 0');
  }

  if (!simpleQuote.phases || simpleQuote.phases.length === 0) {
    errors.push('Le devis doit contenir au moins une phase');
  }

  if (simpleQuote.phases) {
    simpleQuote.phases.forEach((phase, index) => {
      if (!phase.name || phase.name.trim() === '') {
        errors.push(`La phase ${index + 1} doit avoir un nom`);
      }
      if (!phase.totalCost || phase.totalCost <= 0) {
        errors.push(`La phase ${index + 1} doit avoir un coût supérieur à 0`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valide les informations client
 */
export function validateClientInfo(clientInfo: QuoteClientInfo): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!clientInfo.clientName || clientInfo.clientName.trim() === '') {
    errors.push('Le nom du client est obligatoire');
  }

  if (!clientInfo.clientEmail || clientInfo.clientEmail.trim() === '') {
    errors.push('L\'email du client est obligatoire');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientInfo.clientEmail)) {
    errors.push('L\'email du client est invalide');
  }

  if (!clientInfo.clientPhone || clientInfo.clientPhone.trim() === '') {
    errors.push('Le téléphone du client est obligatoire');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Exemple d'utilisation
 */
export function exampleUsage() {
  // Devis simple généré par l'analyseur
  const simpleQuote: SimpleQuote = {
    totalCost: 87500000,
    totalDuration: 29,
    title: 'Devis - Plan_Maison_R+1.pdf',
    phases: [
      {
        name: 'Gros œuvre',
        description: 'Construction structure R+1 pour 350 m² (22 pièces)',
        totalCost: 36750000,
        duration: 12
      },
      {
        name: 'Second œuvre',
        description: 'Menuiseries, électricité, plomberie sur 2 niveau(x)',
        totalCost: 29750000,
        duration: 10
      },
      {
        name: 'Finitions',
        description: 'Revêtements, peinture, aménagements',
        totalCost: 21000000,
        duration: 7
      }
    ]
  };

  // Informations client
  const clientInfo: QuoteClientInfo = {
    clientName: 'Jean Dupont',
    clientEmail: 'jean.dupont@example.com',
    clientPhone: '+225 07 12 34 56 78',
    companyName: 'Entreprise Dupont SARL',
    projectType: 'construction'
  };

  // Convertir vers le format structuré
  const structuredQuote = convertSimpleQuoteToStructured(
    simpleQuote,
    clientInfo,
    'project-123'
  );

  console.log('Devis structuré:', structuredQuote);
  
  return structuredQuote;
}
