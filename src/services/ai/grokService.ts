// Service Grok - Veille marché temps réel et chat conversationnel
export interface GrokResponse {
  content: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost: number;
}

export interface MarketData {
  material: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  source: string;
}

export interface MarketAlert {
  id: string;
  material: string;
  alertType: 'price_increase' | 'price_decrease' | 'shortage' | 'regulation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  impact: string;
  recommendation: string;
  timestamp: string;
}

export class GrokService {
  private apiKey: string;
  private baseUrl = 'https://api.x.ai/v1';
  private model = 'grok-beta';

  constructor() {
    this.apiKey = import.meta.env.VITE_GROK_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ Clé API Grok manquante - Fonctionnalités limitées');
    }
  }

  /**
   * Chat conversationnel avec personnalité Grok
   */
  async chatAssistant(message: string): Promise<GrokResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API Grok requise');
    }

    // Vérification temporaire : désactiver Grok en cas de problème CORS
    if (typeof window !== 'undefined') {
      console.warn('⚠️ Grok temporairement désactivé (problème CORS)');
      throw new Error('Service Grok temporairement indisponible');
    }

    const systemPrompt = this.buildSystemPrompt();
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API Grok: ${response.status}`);
      }

      const data = await response.json();
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      
      return {
        content: data.choices[0]?.message?.content || '',
        model: this.model,
        usage,
        cost: this.calculateCost(usage.total_tokens)
      };

    } catch (error) {
      console.error('Erreur Grok chat:', error);
      throw error;
    }
  }

  /**
   * Veille marché temps réel
   */
  async getMarketUpdates(): Promise<MarketData[]> {
    if (!this.apiKey) {
      return this.getMockMarketData();
    }

    const prompt = `
Donne-moi les dernières évolutions de prix des matériaux BTP en France aujourd'hui.
Format de réponse JSON strict :
[
  {
    "material": "Béton C25/30",
    "currentPrice": 120,
    "previousPrice": 115,
    "change": 5,
    "changePercent": 4.3,
    "trend": "up",
    "lastUpdated": "${new Date().toISOString()}",
    "source": "Marché français BTP"
  }
]

Matériaux à surveiller : béton, acier, bois, isolation, carrelage, plomberie, électricité.
`;

    try {
      const response = await this.chatAssistant(prompt);
      const marketData = JSON.parse(response.content);
      return Array.isArray(marketData) ? marketData : [];
    } catch (error) {
      console.error('Erreur veille marché:', error);
      return this.getMockMarketData();
    }
  }

  /**
   * Alertes marché intelligentes
   */
  async generateMarketAlerts(marketData: MarketData[]): Promise<MarketAlert[]> {
    const alerts: MarketAlert[] = [];

    marketData.forEach(data => {
      // Alerte augmentation significative
      if (data.changePercent > 10) {
        alerts.push({
          id: `alert-${Date.now()}-${data.material}`,
          material: data.material,
          alertType: 'price_increase',
          severity: data.changePercent > 20 ? 'critical' : 'high',
          message: `Prix ${data.material} en hausse de ${data.changePercent.toFixed(1)}%`,
          impact: `Coût supplémentaire estimé : +${data.changePercent.toFixed(1)}% sur vos projets`,
          recommendation: data.changePercent > 20 
            ? 'Considérer un approvisionnement immédiat ou des matériaux alternatifs'
            : 'Surveiller l\'évolution et ajuster les devis en cours',
          timestamp: new Date().toISOString()
        });
      }

      // Alerte baisse intéressante
      if (data.changePercent < -5) {
        alerts.push({
          id: `alert-${Date.now()}-${data.material}-down`,
          material: data.material,
          alertType: 'price_decrease',
          severity: 'medium',
          message: `Opportunité : ${data.material} en baisse de ${Math.abs(data.changePercent).toFixed(1)}%`,
          impact: `Économies potentielles : ${Math.abs(data.changePercent).toFixed(1)}% sur vos achats`,
          recommendation: 'Moment favorable pour les achats groupés ou le stockage',
          timestamp: new Date().toISOString()
        });
      }
    });

    return alerts;
  }

  /**
   * Analyse de sentiment client
   */
  async analyzeClientFeedback(feedback: string): Promise<GrokResponse> {
    const prompt = `
Analyse ce retour client BTP et fournis une réponse structurée :

RETOUR CLIENT : "${feedback}"

Format de réponse JSON :
{
  "sentiment": "positive|negative|neutral",
  "score": 0-100,
  "mainConcerns": ["concern1", "concern2"],
  "recommendations": ["action1", "action2"],
  "responseTemplate": "Réponse professionnelle suggérée",
  "urgency": "low|medium|high|critical"
}
`;

    return await this.chatAssistant(prompt);
  }

  /**
   * Génération de réponse client empathique
   */
  async generateClientResponse(complaint: string, context?: Record<string, unknown>): Promise<GrokResponse> {
    const prompt = `
Rédige une réponse professionnelle mais chaleureuse pour cette réclamation client BTP :

RÉCLAMATION : "${complaint}"

CONTEXTE : ${context ? JSON.stringify(context) : 'Aucun contexte spécifique'}

Critères de réponse :
- Ton professionnel mais empathique
- Reconnaissance du problème
- Solutions concrètes proposées
- Engagement sur le suivi
- Préservation de la relation client

Format : Réponse directe prête à envoyer.
`;

    return await this.chatAssistant(prompt);
  }

  /**
   * Veille réglementaire BTP
   */
  async getRegulationUpdates(): Promise<GrokResponse> {
    const prompt = `
Quelles sont les dernières réglementations et normes BTP en France ?
Focus sur : RT2020, accessibilité PMR, sécurité chantier, environnement.

Format : Liste structurée avec impact pratique pour les entreprises BTP.
`;

    return await this.chatAssistant(prompt);
  }

  /**
   * Estimation de coûts avec données marché
   */
  async estimateProjectCost(projectData: Record<string, unknown>): Promise<GrokResponse> {
    const marketData = await this.getMarketUpdates();
    
    const prompt = `
Estime le coût de ce projet BTP avec les prix marché actuels :

PROJET : ${JSON.stringify(projectData)}

PRIX MARCHÉ ACTUELS : ${JSON.stringify(marketData)}

Fournis une estimation détaillée avec :
- Coût par poste (matériaux, main d'œuvre, équipement)
- Marge d'erreur estimée
- Facteurs de risque prix
- Recommandations d'optimisation

Format JSON structuré.
`;

    return await this.chatAssistant(prompt);
  }

  /**
   * Construction du prompt système contextuel
   */
  private buildSystemPrompt(context?: Record<string, unknown>): string {
    let systemPrompt = `Tu es un assistant BTP expert avec la personnalité Grok : intelligent, direct, parfois avec une pointe d'humour approprié, mais toujours professionnel.

Tu as accès aux données temps réel du marché BTP français et tu peux fournir des informations actualisées sur :
- Prix des matériaux
- Réglementations en vigueur
- Tendances du secteur
- Bonnes pratiques

Réponds de manière précise et actionnable.`;

    if (context) {
      systemPrompt += `\n\nCONTEXTE UTILISATEUR :\n${JSON.stringify(context, null, 2)}`;
    }

    return systemPrompt;
  }

  /**
   * Calcul du coût basé sur les tokens
   */
  private calculateCost(totalTokens: number): number {
    // Prix Grok estimé : $0.002 per 1K tokens (plus abordable que Modèle-4)
    return (totalTokens / 1000) * 0.002;
  }

  /**
   * Données marché mock pour fallback
   */
  private getMockMarketData(): MarketData[] {
    return [
      {
        material: 'Béton C25/30',
        currentPrice: 120,
        previousPrice: 115,
        change: 5,
        changePercent: 4.3,
        trend: 'up',
        lastUpdated: new Date().toISOString(),
        source: 'Données simulées'
      },
      {
        material: 'Acier HA',
        currentPrice: 850,
        previousPrice: 820,
        change: 30,
        changePercent: 3.7,
        trend: 'up',
        lastUpdated: new Date().toISOString(),
        source: 'Données simulées'
      },
      {
        material: 'Bois charpente',
        currentPrice: 450,
        previousPrice: 480,
        change: -30,
        changePercent: -6.3,
        trend: 'down',
        lastUpdated: new Date().toISOString(),
        source: 'Données simulées'
      }
    ];
  }

  /**
   * Vérification de santé du service
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await this.chatAssistant('Test de connexion');
      return response.content.length > 0;
    } catch {
      return false;
    }
  }
}

export const grokService = new GrokService();
export default grokService;
