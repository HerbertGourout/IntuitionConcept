// Stub service for Modèle AI integration
// TODO: Implement actual AI service when API keys are available

export interface ModèleAnalysisResult {
  success: boolean;
  data?: {
    rooms?: Array<{
      name: string;
      area?: number;
      dimensions?: string;
    }>;
    totalArea?: number;
    planType?: string;
    complexity?: 'low' | 'moderate' | 'high' | 'very_high';
  };
  error?: string;
}

export interface ModèleQuoteResult {
  success: boolean;
  quote?: {
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
  };
  error?: string;
}

export class ModèleServiceDirect {
  private static instance: ModèleServiceDirect | null = null;
  private initialized = false;

  static getInstance(): ModèleServiceDirect {
    if (!ModèleServiceDirect.instance) {
      ModèleServiceDirect.instance = new ModèleServiceDirect();
    }
    return ModèleServiceDirect.instance;
  }

  async initialize(): Promise<boolean> {
    this.initialized = true;
    return true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async analyzePlan(_imageBase64: string): Promise<ModèleAnalysisResult> {
    // Stub implementation - returns mock data
    return {
      success: true,
      data: {
        rooms: [
          { name: 'Salon', area: 25, dimensions: '5m x 5m' },
          { name: 'Chambre 1', area: 15, dimensions: '5m x 3m' },
          { name: 'Cuisine', area: 12, dimensions: '4m x 3m' },
          { name: 'Salle de bain', area: 6, dimensions: '3m x 2m' },
        ],
        totalArea: 58,
        planType: 'residential',
        complexity: 'moderate',
      },
    };
  }

  async generateQuote(_analysis: ModèleAnalysisResult): Promise<ModèleQuoteResult> {
    // Stub implementation - returns mock quote
    return {
      success: true,
      quote: {
        title: 'Devis de construction',
        totalCost: 15000000,
        phases: [
          {
            name: 'Gros œuvre',
            description: 'Travaux de structure',
            totalCost: 8000000,
            items: [
              { designation: 'Fondations', quantity: 1, unit: 'forfait', unitPrice: 3000000, totalPrice: 3000000 },
              { designation: 'Murs porteurs', quantity: 58, unit: 'm²', unitPrice: 50000, totalPrice: 2900000 },
              { designation: 'Dalle béton', quantity: 58, unit: 'm²', unitPrice: 35000, totalPrice: 2030000 },
            ],
          },
          {
            name: 'Second œuvre',
            description: 'Finitions et installations',
            totalCost: 7000000,
            items: [
              { designation: 'Électricité', quantity: 1, unit: 'forfait', unitPrice: 2500000, totalPrice: 2500000 },
              { designation: 'Plomberie', quantity: 1, unit: 'forfait', unitPrice: 2000000, totalPrice: 2000000 },
              { designation: 'Peinture', quantity: 116, unit: 'm²', unitPrice: 15000, totalPrice: 1740000 },
              { designation: 'Carrelage', quantity: 58, unit: 'm²', unitPrice: 13000, totalPrice: 754000 },
            ],
          },
        ],
      },
    };
  }
}

export function initializeModèleServiceDirect(): ModèleServiceDirect {
  const service = ModèleServiceDirect.getInstance();
  service.initialize();
  return service;
}

export default ModèleServiceDirect;
