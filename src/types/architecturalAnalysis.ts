/**
 * Types pour l'analyse architecturale et la génération multi-vues 3D
 */

// Résultat de l'analyse Claude d'un plan architectural
export interface ArchitecturalAnalysis {
  project: ProjectInfo;
  facades: FacadeInfo[];
  levels: LevelInfo[];
  rooms: RoomInfo[];
  openings: OpeningsInfo;
  landscaping: LandscapingInfo;
  technicalDetails: TechnicalDetails;
}

export interface ProjectInfo {
  style: ArchitecturalStyle;
  materials: string[]; // ["béton", "bois", "pierre", "enduit", "verre"]
  colorPalette: string[]; // ["blanc cassé", "bois clair", "gris anthracite"]
  description?: string;
}

export type ArchitecturalStyle = 
  | 'moderne' 
  | 'contemporain' 
  | 'mediterraneen' 
  | 'traditionnel' 
  | 'industriel' 
  | 'minimaliste'
  | 'classique';

export interface FacadeInfo {
  type: 'principale' | 'secondaire' | 'arriere' | 'cote';
  orientation?: 'nord' | 'sud' | 'est' | 'ouest';
  materials: string[];
  openings: {
    windows: number;
    doors: number;
    balconies?: number;
  };
  features?: string[]; // ["terrasse", "balcon", "pergola"]
}

export interface LevelInfo {
  name: string; // "RDC", "R+1", "R+2", "Sous-sol"
  area_m2?: number;
  height_m?: number;
  rooms: string[]; // IDs des pièces de ce niveau
}

export interface RoomInfo {
  id: string;
  type: RoomType;
  name?: string; // "Salon principal", "Chambre 1"
  level: string; // "RDC", "R+1"
  area_m2?: number;
  features?: string[]; // ["cheminée", "dressing", "baignoire"]
}

export type RoomType = 
  | 'salon' 
  | 'cuisine' 
  | 'salle-a-manger'
  | 'chambre' 
  | 'salle-de-bain' 
  | 'wc'
  | 'hall' 
  | 'entree'
  | 'couloir'
  | 'bureau'
  | 'cellier'
  | 'garage'
  | 'terrasse'
  | 'balcon'
  | 'autre';

export interface OpeningsInfo {
  windows: {
    total: number;
    types?: string[]; // ["baie vitrée", "fenêtre standard", "velux"]
  };
  doors: {
    total: number;
    types?: string[]; // ["porte d'entrée", "porte-fenêtre", "porte intérieure"]
  };
  stairs?: {
    count: number;
    type?: string; // "escalier droit", "escalier tournant"
  };
}

export interface LandscapingInfo {
  features: LandscapeFeature[];
  totalArea_m2?: number;
}

export type LandscapeFeature = 
  | 'jardin' 
  | 'terrasse' 
  | 'piscine' 
  | 'acces' 
  | 'parking'
  | 'pergola'
  | 'vegetation';

export interface TechnicalDetails {
  totalArea_m2?: number;
  builtArea_m2?: number;
  floors: number;
  dimensions?: {
    length_m?: number;
    width_m?: number;
    height_m?: number;
  };
}

// Spécifications pour la génération de vues 3D
export interface ViewGenerationSpec {
  views: ViewSpec[];
  globalSettings: GlobalRenderSettings;
  variants: VariantSettings;
}

export interface ViewSpec {
  id: string;
  type: ViewType;
  category: 'exterior' | 'interior';
  pageIndex?: number; // Index de la page PDF source
  
  // Paramètres de vue
  viewAngle: 'front-facade' | 'aerial-view' | '3d-perspective' | 'interior';
  cameraPosition?: CameraPosition;
  
  // Contexte architectural
  subject?: string; // "Façade principale", "Salon", "Vue aérienne"
  roomId?: string; // Pour vues intérieures
  facadeType?: FacadeInfo['type']; // Pour vues extérieures
  
  // Paramètres de rendu
  model: 'flux-1.1-pro' | 'flux-pro' | 'seedream-4' | 'imagen-4' | 'sdxl';
  quality: 'draft' | 'standard' | 'hd' | '4k' | '8k';
  
  // Variantes
  timeOfDay: 'day' | 'sunset' | 'night';
  season?: 'summer' | 'winter' | 'spring' | 'autumn';
  decorationStyle?: DecorationStyle;
  lightingMode?: LightingMode;
}

export type ViewType = 
  // Extérieurs
  | 'facade-principale'
  | 'facade-secondaire'
  | 'facade-arriere'
  | 'facade-cote'
  | 'aerial-oblique'
  | 'aerial-frontal'
  | 'perspective-3d'
  | 'landscaping'
  // Intérieurs
  | 'interior-wide'
  | 'interior-detail'
  | 'interior-circulation';

export interface CameraPosition {
  distance?: 'close' | 'medium' | 'far';
  angle?: 'low' | 'eye-level' | 'high';
  focus?: string; // "entrée principale", "coin repas"
}

export type DecorationStyle = 
  | 'minimaliste' 
  | 'cosy' 
  | 'luxueux' 
  | 'moderne'
  | 'classique'
  | 'industriel';

export type LightingMode = 
  | 'natural' 
  | 'spots' 
  | 'led' 
  | 'ambient'
  | 'dramatic';

export interface GlobalRenderSettings {
  // Cohérence multi-vues
  projectAnchor: {
    style: ArchitecturalStyle;
    materials: string[];
    colorPalette: string[];
    sharedSeed?: number; // Pour cohérence entre vues
  };
  
  // Qualité par défaut
  defaultQuality: ViewSpec['quality'];
  defaultModel: ViewSpec['model'];
  
  // Contraintes techniques
  respectDimensions: boolean;
  respectOpenings: boolean;
  respectMaterials: boolean;
}

export interface VariantSettings {
  generateDayNight: boolean;
  generateSeasons: boolean;
  decorationStyles: DecorationStyle[];
  lightingModes: LightingMode[];
}

// Résultat de génération
export interface GeneratedView {
  id: string;
  spec: ViewSpec;
  
  // Résultat
  imageUrl: string;
  thumbnailUrl?: string;
  
  // Métadonnées
  prompt: string;
  negativePrompt?: string;
  model: string;
  generatedAt: string;
  processingTime: number; // secondes
  cost: number; // USD
  
  // Statut
  status: 'queued' | 'processing' | 'completed' | 'failed';
  error?: string;
  progress?: number; // 0-100
}

// Classification automatique des pages PDF
export interface PageClassification {
  pageIndex: number;
  type: PageType;
  confidence: number; // 0-1
  detectedKeywords: string[];
  suggestedViews: ViewType[];
}

export type PageType = 
  | 'plan-niveau' 
  | 'facade' 
  | 'coupe' 
  | 'detail-technique'
  | 'plan-interieur'
  | 'plan-masse'
  | 'page-garde'
  | 'inconnu';

// Export batch
export interface BatchExportConfig {
  format: 'zip' | 'folder';
  structure: 'flat' | 'categorized'; // flat: tous dans un dossier, categorized: Exterieur/Interieur/...
  includeMetadata: boolean; // Fichiers JSON avec prompts/params
  includeThumbnails: boolean;
  filenamePattern: string; // "{category}_{subject}_{variant}_{timestamp}"
}
