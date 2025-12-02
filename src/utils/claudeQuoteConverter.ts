import type { Quote } from '../services/quotesService';
import type { Phase, Task, Article } from '../types/StructuredQuote';

/**
 * Convertit le devis généré par Modèle vers le format Quote de l'application
 */
export function convertModèleQuoteToAppQuote(
  ModèleQuote: any,
  planMetadata: {
    fileName: string;
    clientName?: string;
    projectType?: string;
  }
): Omit<Quote, 'id'> {
  
  // Générer les phases au format de l'application
  const phases: Phase[] = [];
  
  // Support des deux formats : ModèleQuote.detailedQuote.phases OU ModèleQuote.phases
  const sourcePhasesarray = ModèleQuote.detailedQuote?.phases || ModèleQuote.phases;
  
  if (sourcePhasesarray && Array.isArray(sourcePhasesarray)) {
    // Cas 1 : Modèle a généré un devis détaillé (ou format generatedQuote)
    sourcePhasesarray.forEach((ModèlePhase: any, phaseIndex: number) => {
      const tasks: Task[] = [];
      
      // Support des deux formats : items OU lignes
      const sourceItems = ModèlePhase.items || ModèlePhase.lignes;
      
      // Convertir chaque item en tâche avec articles
      if (sourceItems && Array.isArray(sourceItems)) {
        sourceItems.forEach((item: any, itemIndex: number) => {
          const article: Article = {
            id: `article-${Date.now()}-${phaseIndex}-${itemIndex}`,
            description: item.designation || 'Article',
            quantity: item.quantity || 0,
            unit: item.unit || 'unité',
            unitPrice: item.unitPrice || item.prixUnitaire || 0,
            totalPrice: item.totalPrice || item.prixTotal || 0,
            notes: item.note || undefined
          };
          
          const task: Task = {
            id: `task-${Date.now()}-${phaseIndex}-${itemIndex}`,
            name: item.designation || `Article ${itemIndex + 1}`,
            description: item.note || '',
            articles: [article],
            totalPrice: article.totalPrice,
            expanded: false
          };
          
          tasks.push(task);
        });
      }
      
      const phase: Phase = {
        id: `phase-${Date.now()}-${phaseIndex}`,
        name: ModèlePhase.name || ModèlePhase.poste || `Phase ${phaseIndex + 1}`,
        description: ModèlePhase.description || '',
        tasks,
        totalPrice: tasks.reduce((sum, task) => sum + task.totalPrice, 0),
        expanded: true
      };
      
      phases.push(phase);
    });
  } else if (ModèleQuote.measurements?.floors && Array.isArray(ModèleQuote.measurements.floors)) {
    // Cas 2 : Pas de devis détaillé, créer des phases depuis les mesures (measurements.floors)
    // Créer une phase par étage
    ModèleQuote.measurements.floors.forEach((floorData: any, floorIndex: number) => {
      const tasks: Task[] = [];
      
      if (floorData.rooms && Array.isArray(floorData.rooms)) {
        floorData.rooms.forEach((room: any, roomIndex: number) => {
          const article: Article = {
            id: `article-${Date.now()}-${floorIndex}-${roomIndex}`,
            description: room.name || 'Pièce',
            quantity: room.area || 0,
            unit: 'm²',
            unitPrice: 0, // À remplir par l'utilisateur
            totalPrice: 0,
            notes: room.purpose || undefined
          };
          
          const task: Task = {
            id: `task-${Date.now()}-${floorIndex}-${roomIndex}`,
            name: room.name || `Pièce ${roomIndex + 1}`,
            description: `Surface: ${room.area || 0} m²${room.purpose ? ` - ${room.purpose}` : ''}`,
            articles: [article],
            totalPrice: 0,
            expanded: false
          };
          
          tasks.push(task);
        });
      }
      
      const phase: Phase = {
        id: `phase-${Date.now()}-${floorIndex}`,
        name: floorData.name || floorData.level || 
              (floorIndex === 0 ? 'Rez-de-chaussée' : `Étage ${floorIndex}`),
        description: `${floorData.name || floorData.level || `Niveau ${floorIndex}`} - ${tasks.length} pièces - ${floorData.totalArea || 0} m²`,
        tasks,
        totalPrice: 0,
        expanded: true
      };
      
      phases.push(phase);
    });
  }
  
  // Calculer les totaux
  const subtotal = phases.reduce((sum, phase) => sum + phase.totalPrice, 0);
  const taxRate = 18; // TVA par défaut (ajustable)
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount;
  
  // Construire le devis au format de l'application
  const quote: Omit<Quote, 'id'> = {
    projectId: '', // À remplir par l'application
    reference: undefined, // Sera généré automatiquement
    title: ModèleQuote.projectInfo?.title || planMetadata.fileName.replace('.pdf', ''),
    clientName: ModèleQuote.projectInfo?.client || planMetadata.clientName || 'Client à définir',
    clientEmail: '',
    clientPhone: ModèleQuote.projectInfo?.contact || '',
    companyName: ModèleQuote.projectInfo?.architect || '',
    projectType: planMetadata.projectType || 'construction',
    phases,
    subtotal,
    taxRate,
    taxAmount,
    totalAmount,
    discountRate: 0,
    discountAmount: 0,
    status: 'draft',
    validityDays: 30,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    paymentTerms: 'Paiement en 3 fois : 30% à la commande, 40% à mi-parcours, 30% à la livraison',
    notes: `Devis généré automatiquement depuis le plan architectural.\n\n` +
           `${ModèleQuote.hypotheses ? `Hypothèses retenues :\n${ModèleQuote.hypotheses.join('\n')}\n\n` : ''}` +
           `${ModèleQuote.elementsAbsents ? `Éléments non visibles sur le plan :\n${ModèleQuote.elementsAbsents.join('\n')}\n\n` : ''}` +
           `⚠️ Les prix sont à vérifier et ajuster selon le marché local.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return quote;
}

/**
 * Extrait les métadonnées du plan pour le devis
 */
export function extractPlanMetadata(analysisResult: any): {
  fileName: string;
  clientName?: string;
  projectType?: string;
  location?: string;
} {
  return {
    fileName: analysisResult.metadata?.fileName || 'Plan architectural',
    clientName: analysisResult.architecturalData?.projectInfo?.client,
    projectType: 'construction',
    location: analysisResult.architecturalData?.projectInfo?.location
  };
}
