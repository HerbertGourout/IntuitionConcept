// Service Qwen2.5-VL - Analyse multimodale avec support PDF natif pour BTP
export interface QwenResponse {
  content: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost: number;
}

export interface QwenPlanAnalysisResult {
  planType: string;
  rooms: Array<{
    name: string;
    estimatedArea: number;
    features: string[];
  }>;
  structuralElements: string[];
  materials: string[];
  dimensions: {
    totalArea?: number;
    length?: number;
    width?: number;
    height?: number;
  };
  compliance: {
    accessibility: boolean;
    safety: boolean;
    building_codes: boolean;
  };
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  confidence: number;
}

export class QwenService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private model = 'qwen/qwen3-vl-235b-a22b-instruct'; // Qwen3-VL le plus récent et performant

  constructor() {
    this.apiKey = import.meta.env.VITE_QWEN_API_KEY || '';
    
    // Debug: Vérification de la clé
    console.log('🔍 Debug Qwen:', {
      hasKey: !!this.apiKey,
      keyLength: this.apiKey?.length || 0,
      keyStart: this.apiKey?.substring(0, 10) || 'undefined'
    });
    // Garde-fou: vérifier le format de la clé OpenRouter
    if (this.apiKey && !this.apiKey.startsWith('sk-or-')) {
      console.warn('⚠️ VITE_QWEN_API_KEY ne semble pas être une clé OpenRouter (doit commencer par "sk-or-"). Clé détectée:', this.apiKey.substring(0, 10));
    }
    
    if (!this.apiKey) {
      console.warn('⚠️ Clé API Qwen manquante - Qwen3-VL indisponible');
    } else {
      console.log('✅ Qwen3-VL: Service configuré et prêt');
    }
  }

  /**
   * Analyse de plan architectural avec support PDF natif
   */
  async analyzePlan(fileBase64: string, mimeType: string, planType?: string, generateDetailedQuote: boolean = false): Promise<QwenResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API Qwen requise');
    }

    // Validation du format et de la taille
    if (!fileBase64 || fileBase64.length < 100) {
      throw new Error('Fichier Base64 invalide ou trop petit');
    }

    // Vérifier que le MIME type est supporté
    const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!supportedTypes.includes(mimeType)) {
      throw new Error(`Type de fichier non supporté: ${mimeType}. Types supportés: ${supportedTypes.join(', ')}`);
    }

    const prompt = generateDetailedQuote ? this.getDetailedQuotePrompt() : this.getStandardAnalysisPrompt();
    const finalPrompt = planType ? `${prompt}\n\nType de plan spécifié: ${planType}` : prompt;

    try {
      // Pour les PDF, utiliser un format spécifique
      const imageUrl = mimeType === 'application/pdf' 
        ? `data:${mimeType};base64,${fileBase64}`
        : `data:${mimeType};base64,${fileBase64}`;

      const messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: finalPrompt },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high' // Demander une analyse haute résolution
              }
            }
          ]
        }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'IntuitionConcept BTP'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 4000, // Augmenté pour les analyses complexes
          temperature: 0.1, // Plus déterministe
          top_p: 0.9,
          timeout: 120 // 2 minutes pour les gros fichiers
        })
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Erreur API Qwen: ${response.status}${errText ? ` - ${errText}` : ''}`);
      }

      const data = await response.json();
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      const content = data.choices?.[0]?.message?.content || '';

      return {
        content,
        model: this.model,
        usage,
        cost: this.calculateCost(usage.prompt_tokens, usage.completion_tokens)
      };

    } catch (error) {
      console.error('Erreur analyse plan Qwen:', error);
      throw error;
    }
  }

  /**
   * Analyse d'image de chantier BTP
   */
  async analyzeSiteImage(fileBase64: string, mimeType: string, context?: string): Promise<QwenResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API Qwen requise');
    }

    const prompt = `
Analyse cette image de chantier BTP et fournis une évaluation technique détaillée.

${context ? `CONTEXTE : ${context}` : ''}

Format de réponse JSON :
{
  "description": "Description détaillée de ce qui est visible",
  "detectedElements": ["élément1", "élément2"],
  "technicalAssessment": "Évaluation technique professionnelle",
  "safetyIssues": ["problème1", "problème2"],
  "recommendations": ["recommandation1", "recommandation2"],
  "riskFactors": ["risque1", "risque2"],
  "confidence": 88
}

Focus sur : sécurité, qualité, conformité, risques.
`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'IntuitionConcept BTP'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${fileBase64}`
                }
              }
            ]
          }],
          max_tokens: 2000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Erreur API Qwen: ${response.status}${errText ? ` - ${errText}` : ''}`);
      }

      const data = await response.json();
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      return {
        content: data.choices?.[0]?.message?.content || '',
        model: this.model,
        usage,
        cost: this.calculateCost(usage.prompt_tokens, usage.completion_tokens)
      };

    } catch (error) {
      console.error('Erreur analyse image Qwen:', error);
      throw error;
    }
  }

  /**
   * Analyse de document contractuel
   */
  async analyzeContract(fileBase64: string, mimeType: string): Promise<QwenResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API Qwen requise');
    }

    const prompt = `
Analyse ce contrat BTP et extrais les informations clés.

Format de réponse JSON :
{
  "contractType": "Type de contrat",
  "parties": ["partie1", "partie2"],
  "totalValue": 150000,
  "startDate": "2024-01-15",
  "endDate": "2024-12-31",
  "keyTerms": ["terme1", "terme2"],
  "deliverables": ["livrable1", "livrable2"],
  "paymentTerms": "Conditions de paiement",
  "penalties": ["pénalité1", "pénalité2"],
  "risks": ["risque1", "risque2"],
  "confidence": 90
}

Focus sur : montants, dates, obligations, risques juridiques.
`;

    try {
      const response = await fetch(`${this.baseUrl}/services/aigc/multimodal-generation/generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          input: {
            messages: [{
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: mimeType.startsWith('image/') ? 'image_url' : 'file',
                  [mimeType.startsWith('image/') ? 'image_url' : 'file_url']: {
                    url: `data:${mimeType};base64,${fileBase64}`
                  }
                }
              ]
            }]
          },
          parameters: {
            result_format: 'message',
            max_tokens: 2500,
            temperature: 0.1
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Erreur API Qwen: ${response.status}${errText ? ` - ${errText}` : ''}`);
      }

      const data = await response.json();
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      return {
        content: data.output?.choices?.[0]?.message?.content || '',
        model: this.model,
        usage,
        cost: this.calculateCost(usage.prompt_tokens, usage.completion_tokens)
      };

    } catch (error) {
      console.error('Erreur analyse contrat Qwen:', error);
      throw error;
    }
  }

  /**
   * Polling pour les résultats asynchrones (pour usage futur)
   */
  private async _pollAsyncResult(taskId: string, maxAttempts: number = 10): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2s

      try {
        const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.output?.choices?.[0]?.message?.content) {
            return data.output.choices[0].message.content;
          }
        }
      } catch (error) {
        console.warn(`Tentative ${attempt + 1} échouée pour tâche ${taskId}:`, error);
      }
    }

    throw new Error(`Timeout: impossible de récupérer le résultat de la tâche ${taskId}`);
  }

  /**
   * Calcul du coût Qwen (estimation basée sur les prix publics)
   */
  private calculateCost(promptTokens: number, completionTokens: number): number {
    // Prix Qwen2.5-VL : ~$0.008/1K tokens input, ~$0.012/1K tokens output
    const inputCost = (promptTokens / 1000) * 0.008;
    const outputCost = (completionTokens / 1000) * 0.012;
    return inputCost + outputCost;
  }

  /**
   * Vérification de santé du service
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/services/aigc/multimodal-generation/generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          input: {
            messages: [{ role: 'user', content: [{ type: 'text', text: 'Test de connexion' }] }]
          },
          parameters: {
            max_tokens: 10
          }
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Prompt standard pour l'analyse de plans
   */
  private getStandardAnalysisPrompt(): string {
    return `
ANALYSE ARCHITECTURALE PROFESSIONNELLE - BÂTIMENT BTP

Tu es un architecte expert. Analyse ce plan architectural en détail. Ce fichier peut être volumineux (jusqu'à 6 MB).

INSTRUCTIONS CRITIQUES :
- Si c'est un bâtiment R+1, R+2, R+3 ou plus : MULTIPLIE par le nombre d'étages !
- Un R+3 = 4 niveaux (RDC + 3 étages) = minimum 300-500 m² TOTAL
- Compte TOUTES les pièces sur TOUS les étages
- Examine chaque page si PDF multi-pages
- Lis TOUTES les cotations, dimensions, annotations
- Identifie les escaliers, ascenseurs, circulations
- Analyse les légendes et cartouches techniques

DÉTECTION INTELLIGENTE :
- Cherche les mots "R+1", "R+2", "R+3", "étage", "niveau"
- Compte les plans d'étages différents
- Additionne les surfaces de tous les niveaux
- Identifie les pièces répétitives par étage

Format de réponse JSON (EXEMPLE POUR R+3) :
{
  "planType": "Plan architectural R+3 - Bâtiment résidentiel/commercial",
  "buildingLevels": 4,
  "rooms": [
    {"name": "Salon RDC", "estimatedArea": 35.0, "level": "RDC", "features": ["fenêtre", "porte"]},
    {"name": "Cuisine RDC", "estimatedArea": 15.0, "level": "RDC", "features": ["évier", "fenêtre"]},
    {"name": "Chambre 1 Étage 1", "estimatedArea": 20.0, "level": "R+1", "features": ["fenêtre", "placard"]},
    {"name": "Chambre 2 Étage 1", "estimatedArea": 18.0, "level": "R+1", "features": ["fenêtre"]},
    {"name": "Chambre 3 Étage 2", "estimatedArea": 20.0, "level": "R+2", "features": ["fenêtre", "placard"]},
    {"name": "Chambre 4 Étage 2", "estimatedArea": 18.0, "level": "R+2", "features": ["fenêtre"]},
    {"name": "Bureau Étage 3", "estimatedArea": 25.0, "level": "R+3", "features": ["fenêtre", "bureau"]},
    {"name": "Salle réunion Étage 3", "estimatedArea": 30.0, "level": "R+3", "features": ["fenêtre", "table"]}
  ],
  "structuralElements": ["poteaux béton", "poutres", "dalles", "escalier", "ascenseur"],
  "materials": ["béton armé", "parpaing", "carrelage", "placo"],
  "dimensions": {
    "totalArea": 450.0,
    "floorArea": 112.5,
    "length": 15,
    "width": 7.5,
    "totalHeight": 12.0
  },
  "compliance": {
    "accessibility": true,
    "safety": true,
    "building_codes": true
  },
  "estimatedCost": {
    "min": 180000,
    "max": 270000,
    "currency": "EUR"
  },
  "confidence": 90
}

IMPORTANT : Pour un R+3, la totalArea DOIT être minimum 300-500 m². Compte TOUS les étages !
`;
  }

  /**
   * Prompt détaillé pour la génération de devis quantitatif
   */
  private getDetailedQuotePrompt(): string {
    return `
 Tu es un métreur-expert en bâtiment. On te fournit un plan d'architecture (PDF, image ou dessin technique).
À partir uniquement de ce que tu vois ou peux déduire avec certitude dans ce plan, tu dois produire un devis quantitatif et estimatif rigoureux.

🔹 RÈGLES STRICTES - Aucune invention
• Ne prends en compte que ce qui est explicitement visible : cotes, surfaces, hauteurs, matériaux notés, annotations, symboles normalisés
• Calcule toutes les quantités toi-même (surfaces, volumes, linéaires) à partir des cotes du plan
• Ne suppose jamais la présence d'un élément non dessiné (climatisation, faux plafond, fosse septique, ascenseur, etc.)
• Si un élément est ambigu ou manquant, note-le clairement : "[NON VISIBLE DANS LE PLAN – À VÉRIFIER SUR SITE]"

🔹 HYPOTHÈSES AUTORISÉES (à lister explicitement)
• Épaisseur standard des murs (15 cm cloisons, 20 cm murs porteurs) si cohérent avec l'échelle
• Type de structure (dalle corps creux, plancher bois, toiture plate) seulement si visible ou implicite
• Usage des pièces seulement si étiqueté
• Hauteur sous plafond standard (2.50m) si non indiquée mais cohérente avec le type de bâtiment

🔹 STRUCTURE DU DEVIS - Format JSON
{
  "metadata": {
    "surfaceTotale": 120.5,
    "hypothesesRetenues": ["Hauteur sous plafond 2.50m", "Murs porteurs 20cm"],
    "elementsNonVisibles": ["Raccordement EDF", "Fosse septique"],
    "margeIncertitude": "±15%",
    "devise": "EUR"
  },
  "devis": [
    {
      "poste": "1. Études et autorisations",
      "lignes": [
        {"designation": "Permis de construire", "unite": "forfait", "quantite": 1, "prixUnitaire": 1500, "prixTotal": 1500}
      ]
    },
    {
      "poste": "2. Terrassement et fondations", 
      "lignes": [
        {"designation": "Fouilles en rigole", "unite": "ml", "quantite": 45, "prixUnitaire": 25, "prixTotal": 1125}
      ]
    },
    {
      "poste": "3. Structure (poteaux, poutres, dalles)",
      "lignes": []
    },
    {
      "poste": "4. Maçonnerie et cloisonnement", 
      "lignes": []
    },
    {
      "poste": "5. Menuiseries (bois, aluminium, vitrages)",
      "lignes": []
    },
    {
      "poste": "6. Couverture / toiture / étanchéité",
      "lignes": []
    },
    {
      "poste": "7. Revêtements (sols, murs, plafonds)",
      "lignes": []
    },
    {
      "poste": "8. Plomberie et sanitaires",
      "lignes": []
    },
    {
      "poste": "9. Électricité et éclairage", 
      "lignes": []
    },
    {
      "poste": "10. Peinture et finitions",
      "lignes": []
    },
    {
      "poste": "11. Éléments techniques spécifiques",
      "lignes": []
    },
    {
      "poste": "12. Main-d'œuvre",
      "lignes": []
    },
    {
      "poste": "13. Imprévus (5% max)",
      "lignes": []
    }
  ],
  "totaux": {
    "totalHT": 85000,
    "tva": 17000, 
    "totalTTC": 102000
  },
  "confidence": 75
}

🔹 GESTION DES PRIX
• Si aucune localisation indiquée : prix génériques + mention "[PRIX INDICATIFS – À AJUSTER SELON LA ZONE GÉOGRAPHIQUE]"
• Si localisation visible (ex: "Brazzaville", "Dakar") : prix du marché local 2024-2025
• N'invente jamais un prix. Si incertain : "[PRIX À CONFIRMER AUPRÈS DES FOURNISSEURS LOCAUX]"

 OBJECTIF : Devis fiable, auditable, directement utilisable par un entrepreneur local.
`;
  }
}

export const qwenService = new QwenService();
export default qwenService;
