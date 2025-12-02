// Utility functions for converting Modèle AI quotes to app format

import type { Quote } from '../services/quotesService';

export interface ModèleQuote {
  title?: string;
  totalCost?: number;
  phases?: Array<{
    name: string;
    description?: string;
    totalCost?: number;
    items?: Array<{
      designation: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      totalPrice: number;
    }>;
  }>;
}

export interface PlanMetadata {
  planType: string;
  totalArea: number;
  roomCount: number;
  complexity: string;
}

/**
 * Convert a Modèle AI quote to the app's Quote format
 */
export function convertModèleQuoteToAppQuote(
  modèleQuote: ModèleQuote,
  clientInfo: {
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    companyName?: string;
    projectType?: string;
    projectId?: string;
  }
): Omit<Quote, 'id'> {
  const now = new Date().toISOString();
  
  const phases = (modèleQuote.phases || []).map((phase, index) => ({
    id: `phase-${Date.now()}-${index}`,
    name: phase.name || `Phase ${index + 1}`,
    description: phase.description || '',
    tasks: (phase.items || []).map((item, itemIndex) => ({
      id: `task-${Date.now()}-${index}-${itemIndex}`,
      name: item.designation,
      description: item.designation,
      articles: [{
        id: `article-${Date.now()}-${index}-${itemIndex}`,
        description: item.designation,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      }],
      totalPrice: item.totalPrice,
      expanded: true,
    })),
    totalPrice: phase.totalCost || 0,
    expanded: true,
  }));

  const totalAmount = phases.reduce((sum, phase) => sum + (phase.totalPrice || 0), 0);

  const taxRate = 18;
  const subtotal = totalAmount;
  const taxAmount = subtotal * (taxRate / 100);
  const totalWithTax = subtotal + taxAmount;
  
  // Calculate validity date (30 days from now)
  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + 30);

  return {
    title: modèleQuote.title || 'Devis généré par IA',
    projectId: clientInfo.projectId || 'project-default',
    clientName: clientInfo.clientName,
    clientEmail: clientInfo.clientEmail,
    clientPhone: clientInfo.clientPhone || '',
    companyName: clientInfo.companyName || '',
    projectType: clientInfo.projectType || 'construction',
    status: 'draft' as const,
    phases,
    subtotal,
    taxRate,
    taxAmount,
    totalAmount: totalWithTax,
    validityDays: 30,
    validUntil: validUntilDate.toISOString(),
    notes: 'Devis généré automatiquement à partir de l\'analyse du plan architectural.',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Extract metadata from plan analysis
 */
export function extractPlanMetadata(analysis: {
  extractedMeasurements?: {
    rooms?: Array<{ name: string; area?: number }>;
    totalArea?: number;
  };
  estimatedComplexity?: string;
  planType?: string;
}): PlanMetadata {
  const rooms = analysis.extractedMeasurements?.rooms || [];
  
  return {
    planType: analysis.planType || 'residential',
    totalArea: analysis.extractedMeasurements?.totalArea || 0,
    roomCount: rooms.length,
    complexity: analysis.estimatedComplexity || 'moderate',
  };
}

export default {
  convertModèleQuoteToAppQuote,
  extractPlanMetadata,
};
