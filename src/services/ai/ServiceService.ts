// Stub service for AI quote generation
// TODO: Implement actual AI service when API keys are available

export class ServiceService {
  static async generateQuote(
    _projectData: Record<string, unknown>,
    _requirements: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // Return mock quote data
    return {
      title: 'Devis généré par IA',
      phases: [
        {
          name: 'Phase 1 - Préparation',
          description: 'Travaux préparatoires',
          duration: 7,
          items: [
            { description: 'Préparation du site', quantity: 1, unit: 'forfait', unitPrice: 500000, totalPrice: 500000 },
            { description: 'Installation chantier', quantity: 1, unit: 'forfait', unitPrice: 300000, totalPrice: 300000 },
          ],
          totalCost: 800000,
        },
        {
          name: 'Phase 2 - Gros œuvre',
          description: 'Travaux de structure',
          duration: 30,
          items: [
            { description: 'Fondations', quantity: 1, unit: 'forfait', unitPrice: 3000000, totalPrice: 3000000 },
            { description: 'Élévation murs', quantity: 100, unit: 'm²', unitPrice: 50000, totalPrice: 5000000 },
          ],
          totalCost: 8000000,
        },
        {
          name: 'Phase 3 - Second œuvre',
          description: 'Finitions et installations',
          duration: 21,
          items: [
            { description: 'Électricité', quantity: 1, unit: 'forfait', unitPrice: 2000000, totalPrice: 2000000 },
            { description: 'Plomberie', quantity: 1, unit: 'forfait', unitPrice: 1500000, totalPrice: 1500000 },
            { description: 'Peinture', quantity: 200, unit: 'm²', unitPrice: 10000, totalPrice: 2000000 },
          ],
          totalCost: 5500000,
        },
      ],
      totalCost: 14300000,
      totalDuration: 58,
      confidence: 0.85,
    };
  }
}

export default ServiceService;
