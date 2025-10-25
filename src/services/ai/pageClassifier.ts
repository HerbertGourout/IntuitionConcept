/**
 * Service de classification automatique des pages de plans architecturaux
 * Utilise OCR léger + heuristiques pour détecter le type de page
 */

import { PageClassification, PageType, ViewType } from '../../types/architecturalAnalysis';

class PageClassifier {
  /**
   * Classifie une page à partir de son image (thumbnail)
   */
  async classifyPage(
    pageIndex: number,
    imageDataUrl: string
  ): Promise<PageClassification> {
    try {
      // Extraction de texte simple (heuristique basée sur les mots clés courants)
      const keywords = await this.extractKeywords(imageDataUrl);
      
      // Classification par mots-clés
      const { type, confidence } = this.classifyByKeywords(keywords);
      
      // Suggestions de vues selon le type
      const suggestedViews = this.suggestViews(type);
      
      return {
        pageIndex,
        type,
        confidence,
        detectedKeywords: keywords,
        suggestedViews
      };
    } catch (error) {
      console.error('Erreur classification page:', error);
      return {
        pageIndex,
        type: 'inconnu',
        confidence: 0,
        detectedKeywords: [],
        suggestedViews: []
      };
    }
  }

  /**
   * Extraction de mots-clés depuis l'image (heuristique simple)
   * Pour une vraie OCR, utiliser Tesseract.js
   */
  private async extractKeywords(imageDataUrl: string): Promise<string[]> {
    // Simulation: dans la vraie implémentation, utiliser Tesseract.js
    // Pour l'instant, retourner des mots-clés basés sur l'analyse visuelle
    
    // TODO: Intégrer Tesseract.js pour OCR réel
    // const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'fra');
    
    // Pour l'instant, retourner un tableau vide
    // L'utilisateur pourra corriger manuellement
    return [];
  }

  /**
   * Classification par mots-clés détectés
   */
  private classifyByKeywords(keywords: string[]): { type: PageType; confidence: number } {
    const keywordsLower = keywords.map(k => k.toLowerCase());
    
    // Patterns de détection
    const patterns: Record<PageType, { keywords: string[]; weight: number }> = {
      'facade': {
        keywords: ['facade', 'façade', 'elevation', 'élévation', 'vue', 'exterieur', 'extérieur'],
        weight: 0.9
      },
      'plan-niveau': {
        keywords: ['plan', 'niveau', 'rdc', 'r+1', 'r+2', 'etage', 'étage', 'rez'],
        weight: 0.85
      },
      'coupe': {
        keywords: ['coupe', 'section', 'transversale', 'longitudinale'],
        weight: 0.9
      },
      'plan-interieur': {
        keywords: ['interieur', 'intérieur', 'amenagement', 'aménagement', 'mobilier'],
        weight: 0.8
      },
      'plan-masse': {
        keywords: ['masse', 'implantation', 'parcelle', 'terrain', 'site'],
        weight: 0.85
      },
      'detail-technique': {
        keywords: ['detail', 'détail', 'technique', 'construction', 'assemblage'],
        weight: 0.75
      },
      'page-garde': {
        keywords: ['projet', 'architecte', 'maitre', 'maître', 'ouvrage', 'dossier', 'sommaire'],
        weight: 0.7
      },
      'inconnu': {
        keywords: [],
        weight: 0
      }
    };

    let bestMatch: PageType = 'inconnu';
    let bestScore = 0;

    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = pattern.keywords.filter(kw => 
        keywordsLower.some(detected => detected.includes(kw))
      );
      
      if (matches.length > 0) {
        const score = (matches.length / pattern.keywords.length) * pattern.weight;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = type as PageType;
        }
      }
    }

    return {
      type: bestMatch,
      confidence: bestScore
    };
  }

  /**
   * Suggère des vues 3D selon le type de page
   */
  private suggestViews(pageType: PageType): ViewType[] {
    const viewMapping: Record<PageType, ViewType[]> = {
      'facade': ['facade-principale', 'facade-secondaire', 'facade-arriere', 'facade-cote'],
      'plan-niveau': ['aerial-oblique', 'aerial-frontal', 'perspective-3d'],
      'coupe': ['perspective-3d'],
      'plan-interieur': ['interior-wide', 'interior-detail'],
      'plan-masse': ['aerial-oblique', 'landscaping'],
      'detail-technique': [],
      'page-garde': [],
      'inconnu': ['perspective-3d']
    };

    return viewMapping[pageType] || [];
  }

  /**
   * Classification batch de toutes les pages
   */
  async classifyPages(
    thumbnails: string[]
  ): Promise<PageClassification[]> {
    const classifications: PageClassification[] = [];
    
    for (let i = 0; i < thumbnails.length; i++) {
      const classification = await this.classifyPage(i, thumbnails[i]);
      classifications.push(classification);
    }
    
    return classifications;
  }

  /**
   * Heuristique simple basée sur la position de la page
   * Page 1 = souvent page de garde
   * Pages 2-4 = souvent plans de niveaux
   * Pages suivantes = façades, coupes
   */
  classifyByPosition(pageIndex: number, totalPages: number): PageClassification {
    let type: PageType = 'inconnu';
    let confidence = 0.5;
    let suggestedViews: ViewType[] = [];

    if (pageIndex === 0) {
      type = 'page-garde';
      confidence = 0.7;
    } else if (pageIndex >= 1 && pageIndex <= 3) {
      type = 'plan-niveau';
      confidence = 0.6;
      suggestedViews = ['aerial-oblique', 'perspective-3d'];
    } else if (pageIndex > 3 && pageIndex < totalPages - 2) {
      type = 'facade';
      confidence = 0.5;
      suggestedViews = ['facade-principale'];
    }

    return {
      pageIndex,
      type,
      confidence,
      detectedKeywords: [],
      suggestedViews
    };
  }
}

export const pageClassifier = new PageClassifier();
export default pageClassifier;
