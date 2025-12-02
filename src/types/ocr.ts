// Types pour le système OCR

export type OCRProvider = 'tesseract' | 'google_vision' | 'auto';

export interface OCRProviderConfig {
  provider: OCRProvider;
  apiKey?: string;
  fallbackProvider?: OCRProvider;
  autoSelectBestProvider?: boolean;
}

export interface OCRProviderInfo {
  id: OCRProvider;
  name: string;
  description: string;
  features: string[];
  cost: string;
  speed: 'fast' | 'medium' | 'slow';
  accuracy: 'high' | 'medium' | 'low';
  requiresApiKey: boolean;
  icon: string;
}

export const OCR_PROVIDERS: Record<OCRProvider, OCRProviderInfo> = {
  tesseract: {
    id: 'tesseract',
    name: 'Tesseract OCR',
    description: 'OCR gratuit et local, idéal pour documents simples',
    features: [
      'Gratuit et illimité',
      'Traitement local (confidentialité)',
      'Support français + anglais',
      'Bon pour documents clairs'
    ],
    cost: 'Gratuit',
    speed: 'medium',
    accuracy: 'medium',
    requiresApiKey: false,
    icon: '🔤'
  },
  google_vision: {
    id: 'google_vision',
    name: 'Google Vision API',
    description: 'OCR professionnel haute précision pour documents complexes',
    features: [
      'Précision supérieure (95%+)',
      'Détection tableaux et structures',
      'Support multi-langues',
      'Analyse plans techniques'
    ],
    cost: '12 FCFA/scan',
    speed: 'fast',
    accuracy: 'high',
    requiresApiKey: true,
    icon: '🔍'
  },
  auto: {
    id: 'auto',
    name: 'Sélection Automatique',
    description: 'Choisit automatiquement le meilleur provider selon le document',
    features: [
      'Optimisation automatique',
      'Fallback intelligent',
      'Meilleur rapport qualité/coût',
      'Recommandé pour débutants'
    ],
    cost: 'Variable',
    speed: 'medium',
    accuracy: 'high',
    requiresApiKey: false,
    icon: ''
  }
};

export interface OCRResult {
  text: string;
  confidence: number;
  provider: OCRProvider;
  processingTime: number;
  cost?: number;
}

export interface OCRAnalytics {
  totalScans: number;
  successRate: number;
  averageConfidence: number;
  providerUsage: Record<OCRProvider, number>;
  totalCost: number;
}
