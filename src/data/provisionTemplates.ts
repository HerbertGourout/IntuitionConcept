import { StructuralProvisions } from '../types/StructuredQuote';

export interface ProvisionTemplate {
  id: string;
  name: string;
  description: string;
  projectType: string;
  provisions: Omit<StructuralProvisions, 'disclaimer'>;
}

export const PROVISION_TEMPLATES: ProvisionTemplate[] = [
  {
    id: 'villa-r1',
    name: 'Villa R+1 Standard',
    description: 'Maison individuelle à un étage (150-200m²)',
    projectType: 'construction',
    provisions: {
      foundations: 5000000,
      structure: 8000000,
      reinforcement: 3000000
    }
  },
  {
    id: 'villa-r2',
    name: 'Villa R+2',
    description: 'Maison individuelle à deux étages (200-300m²)',
    projectType: 'construction',
    provisions: {
      foundations: 7000000,
      structure: 12000000,
      reinforcement: 4500000
    }
  },
  {
    id: 'immeuble-r4',
    name: 'Immeuble R+4',
    description: 'Immeuble collectif 4 étages',
    projectType: 'construction',
    provisions: {
      foundations: 15000000,
      structure: 25000000,
      reinforcement: 10000000
    }
  },
  {
    id: 'immeuble-r8',
    name: 'Immeuble R+8',
    description: 'Immeuble collectif 8 étages',
    projectType: 'construction',
    provisions: {
      foundations: 30000000,
      structure: 50000000,
      reinforcement: 20000000
    }
  },
  {
    id: 'extension-simple',
    name: 'Extension Simple',
    description: 'Extension de bâtiment existant (< 50m²)',
    projectType: 'extension',
    provisions: {
      foundations: 2000000,
      structure: 4000000,
      reinforcement: 1500000
    }
  },
  {
    id: 'extension-complexe',
    name: 'Extension Complexe',
    description: 'Extension avec étage (50-100m²)',
    projectType: 'extension',
    provisions: {
      foundations: 4000000,
      structure: 7000000,
      reinforcement: 2500000
    }
  },
  {
    id: 'renovation-legere',
    name: 'Rénovation Légère',
    description: 'Renforcement structure existante',
    projectType: 'renovation',
    provisions: {
      foundations: 1000000,
      structure: 3000000,
      reinforcement: 1000000
    }
  },
  {
    id: 'renovation-lourde',
    name: 'Rénovation Lourde',
    description: 'Restructuration complète',
    projectType: 'renovation',
    provisions: {
      foundations: 3000000,
      structure: 8000000,
      reinforcement: 3000000
    }
  },
  {
    id: 'hangar-industriel',
    name: 'Hangar Industriel',
    description: 'Structure métallique (500-1000m²)',
    projectType: 'infrastructure',
    provisions: {
      foundations: 10000000,
      structure: 20000000,
      reinforcement: 5000000
    }
  },
  {
    id: 'batiment-commercial',
    name: 'Bâtiment Commercial',
    description: 'Centre commercial / Showroom',
    projectType: 'infrastructure',
    provisions: {
      foundations: 12000000,
      structure: 22000000,
      reinforcement: 8000000
    }
  }
];

/**
 * Récupère un template par ID
 */
export function getProvisionTemplate(id: string): ProvisionTemplate | undefined {
  return PROVISION_TEMPLATES.find(t => t.id === id);
}

/**
 * Récupère les templates par type de projet
 */
export function getTemplatesByProjectType(projectType: string): ProvisionTemplate[] {
  return PROVISION_TEMPLATES.filter(t => t.projectType === projectType);
}

/**
 * Génère le disclaimer pour un template
 */
export function generateTemplateDisclaimer(template: ProvisionTemplate): string {
  return `Provisions basées sur le modèle "${template.name}".
Ces montants sont estimatifs et seront affinés après étude structurale complète.
Fondations: ${(template.provisions.foundations / 1000000).toFixed(1)}M FCFA
Structure: ${(template.provisions.structure / 1000000).toFixed(1)}M FCFA
Ferraillage: ${(template.provisions.reinforcement / 1000000).toFixed(1)}M FCFA
Total provisions: ${((template.provisions.foundations + template.provisions.structure + template.provisions.reinforcement) / 1000000).toFixed(1)}M FCFA`;
}
