/**
 * Données mock pour tester le système de génération 3D
 * Simule une analyse architecturale complète
 */

import { ArchitecturalAnalysis } from '../../types/architecturalAnalysis';

/**
 * Exemple 1: Villa moderne méditerranéenne
 */
export const mockVillaModerne: ArchitecturalAnalysis = {
  project: {
    style: 'moderne',
    materials: ['béton', 'bois', 'verre', 'pierre naturelle'],
    colorPalette: ['blanc cassé', 'bois clair', 'gris anthracite'],
    description: 'Villa moderne de standing avec piscine et jardin méditerranéen'
  },
  facades: [
    {
      type: 'principale',
      orientation: 'sud',
      materials: ['béton blanc', 'verre', 'bois'],
      openings: {
        windows: 12,
        doors: 2,
        balconies: 2
      },
      features: ['grande baie vitrée', 'terrasse couverte', 'pergola']
    },
    {
      type: 'secondaire',
      orientation: 'est',
      materials: ['béton', 'bois'],
      openings: {
        windows: 8,
        doors: 1
      },
      features: ['fenêtres hautes']
    },
    {
      type: 'arriere',
      orientation: 'nord',
      materials: ['béton', 'pierre'],
      openings: {
        windows: 6,
        doors: 1
      }
    },
    {
      type: 'cote',
      orientation: 'ouest',
      materials: ['béton', 'bois'],
      openings: {
        windows: 4,
        doors: 0
      }
    }
  ],
  levels: [
    {
      name: 'RDC',
      area_m2: 180,
      height_m: 3.2,
      rooms: ['salon-1', 'cuisine-1', 'salle-manger-1', 'wc-1', 'entree-1']
    },
    {
      name: 'R+1',
      area_m2: 150,
      height_m: 2.8,
      rooms: ['chambre-1', 'chambre-2', 'chambre-3', 'sdb-1', 'sdb-2', 'dressing-1']
    }
  ],
  rooms: [
    {
      id: 'salon-1',
      type: 'salon',
      name: 'Salon principal',
      level: 'RDC',
      area_m2: 45,
      features: ['cheminée', 'baie vitrée', 'hauteur sous plafond 3.5m']
    },
    {
      id: 'cuisine-1',
      type: 'cuisine',
      name: 'Cuisine ouverte',
      level: 'RDC',
      area_m2: 28,
      features: ['îlot central', 'électroménager intégré', 'accès terrasse']
    },
    {
      id: 'salle-manger-1',
      type: 'salle-a-manger',
      name: 'Salle à manger',
      level: 'RDC',
      area_m2: 22,
      features: ['grande table', 'vue jardin']
    },
    {
      id: 'chambre-1',
      type: 'chambre',
      name: 'Chambre parentale',
      level: 'R+1',
      area_m2: 32,
      features: ['dressing', 'salle de bain privative', 'balcon']
    },
    {
      id: 'chambre-2',
      type: 'chambre',
      name: 'Chambre 2',
      level: 'R+1',
      area_m2: 18
    },
    {
      id: 'chambre-3',
      type: 'chambre',
      name: 'Chambre 3',
      level: 'R+1',
      area_m2: 16
    },
    {
      id: 'sdb-1',
      type: 'salle-de-bain',
      name: 'Salle de bain parentale',
      level: 'R+1',
      area_m2: 12,
      features: ['douche italienne', 'double vasque', 'baignoire']
    },
    {
      id: 'sdb-2',
      type: 'salle-de-bain',
      name: 'Salle de bain commune',
      level: 'R+1',
      area_m2: 8,
      features: ['douche', 'vasque']
    },
    {
      id: 'wc-1',
      type: 'wc',
      name: 'WC invités',
      level: 'RDC',
      area_m2: 3
    },
    {
      id: 'entree-1',
      type: 'entree',
      name: 'Hall d\'entrée',
      level: 'RDC',
      area_m2: 12,
      features: ['escalier', 'rangements']
    }
  ],
  openings: {
    windows: {
      total: 30,
      types: ['baie vitrée', 'fenêtre standard', 'fenêtre haute']
    },
    doors: {
      total: 12,
      types: ['porte d\'entrée vitrée', 'porte-fenêtre', 'porte intérieure']
    },
    stairs: {
      count: 1,
      type: 'escalier droit avec garde-corps verre'
    }
  },
  landscaping: {
    features: ['jardin', 'terrasse', 'piscine', 'acces', 'pergola', 'vegetation'],
    totalArea_m2: 800
  },
  technicalDetails: {
    totalArea_m2: 330,
    builtArea_m2: 220,
    floors: 2,
    dimensions: {
      length_m: 18,
      width_m: 12,
      height_m: 7.5
    }
  }
};

/**
 * Exemple 2: Maison traditionnelle
 */
export const mockMaisonTraditionnelle: ArchitecturalAnalysis = {
  project: {
    style: 'traditionnel',
    materials: ['pierre', 'bois', 'tuiles', 'enduit'],
    colorPalette: ['beige', 'terre cuite', 'bois naturel'],
    description: 'Maison traditionnelle de charme avec jardin arboré'
  },
  facades: [
    {
      type: 'principale',
      orientation: 'sud',
      materials: ['pierre', 'enduit', 'bois'],
      openings: {
        windows: 8,
        doors: 1
      },
      features: ['volets bois', 'balcon fer forgé']
    },
    {
      type: 'arriere',
      orientation: 'nord',
      materials: ['pierre', 'enduit'],
      openings: {
        windows: 6,
        doors: 1
      }
    }
  ],
  levels: [
    {
      name: 'RDC',
      area_m2: 120,
      height_m: 2.8,
      rooms: ['salon-1', 'cuisine-1', 'salle-manger-1', 'wc-1']
    },
    {
      name: 'R+1',
      area_m2: 100,
      height_m: 2.6,
      rooms: ['chambre-1', 'chambre-2', 'chambre-3', 'sdb-1']
    }
  ],
  rooms: [
    {
      id: 'salon-1',
      type: 'salon',
      name: 'Salon',
      level: 'RDC',
      area_m2: 35,
      features: ['cheminée pierre', 'poutres apparentes']
    },
    {
      id: 'cuisine-1',
      type: 'cuisine',
      name: 'Cuisine',
      level: 'RDC',
      area_m2: 18
    },
    {
      id: 'salle-manger-1',
      type: 'salle-a-manger',
      name: 'Salle à manger',
      level: 'RDC',
      area_m2: 20
    },
    {
      id: 'chambre-1',
      type: 'chambre',
      name: 'Chambre 1',
      level: 'R+1',
      area_m2: 18
    },
    {
      id: 'chambre-2',
      type: 'chambre',
      name: 'Chambre 2',
      level: 'R+1',
      area_m2: 16
    },
    {
      id: 'chambre-3',
      type: 'chambre',
      name: 'Chambre 3',
      level: 'R+1',
      area_m2: 14
    },
    {
      id: 'sdb-1',
      type: 'salle-de-bain',
      name: 'Salle de bain',
      level: 'R+1',
      area_m2: 10
    },
    {
      id: 'wc-1',
      type: 'wc',
      name: 'WC',
      level: 'RDC',
      area_m2: 3
    }
  ],
  openings: {
    windows: {
      total: 14,
      types: ['fenêtre bois', 'fenêtre avec volets']
    },
    doors: {
      total: 8,
      types: ['porte d\'entrée bois', 'porte intérieure']
    },
    stairs: {
      count: 1,
      type: 'escalier bois tournant'
    }
  },
  landscaping: {
    features: ['jardin', 'terrasse', 'acces', 'vegetation'],
    totalArea_m2: 500
  },
  technicalDetails: {
    totalArea_m2: 220,
    builtArea_m2: 150,
    floors: 2,
    dimensions: {
      length_m: 14,
      width_m: 10,
      height_m: 7
    }
  }
};

/**
 * Exemple 3: Immeuble contemporain
 */
export const mockImmeubleContemporain: ArchitecturalAnalysis = {
  project: {
    style: 'contemporain',
    materials: ['béton', 'verre', 'métal', 'bois composite'],
    colorPalette: ['gris clair', 'blanc', 'bois composite'],
    description: 'Immeuble résidentiel contemporain de 4 étages'
  },
  facades: [
    {
      type: 'principale',
      orientation: 'sud',
      materials: ['béton', 'verre', 'bois composite'],
      openings: {
        windows: 32,
        doors: 1,
        balconies: 8
      },
      features: ['balcons filants', 'brise-soleil', 'entrée vitrée']
    },
    {
      type: 'secondaire',
      orientation: 'est',
      materials: ['béton', 'verre'],
      openings: {
        windows: 24,
        doors: 0,
        balconies: 4
      }
    },
    {
      type: 'arriere',
      orientation: 'nord',
      materials: ['béton', 'métal'],
      openings: {
        windows: 16,
        doors: 1
      }
    }
  ],
  levels: [
    {
      name: 'RDC',
      area_m2: 200,
      height_m: 3.5,
      rooms: ['hall-1', 'local-1', 'parking-1']
    },
    {
      name: 'R+1',
      area_m2: 180,
      height_m: 2.8,
      rooms: ['appt-1-salon', 'appt-1-cuisine', 'appt-2-salon', 'appt-2-cuisine']
    },
    {
      name: 'R+2',
      area_m2: 180,
      height_m: 2.8,
      rooms: ['appt-3-salon', 'appt-3-cuisine', 'appt-4-salon', 'appt-4-cuisine']
    },
    {
      name: 'R+3',
      area_m2: 180,
      height_m: 2.8,
      rooms: ['appt-5-salon', 'appt-5-cuisine', 'appt-6-salon', 'appt-6-cuisine']
    }
  ],
  rooms: [
    {
      id: 'hall-1',
      type: 'hall',
      name: 'Hall d\'entrée',
      level: 'RDC',
      area_m2: 40,
      features: ['boîtes aux lettres', 'escalier', 'ascenseur']
    },
    {
      id: 'appt-1-salon',
      type: 'salon',
      name: 'Salon Appartement 1',
      level: 'R+1',
      area_m2: 28
    },
    {
      id: 'appt-1-cuisine',
      type: 'cuisine',
      name: 'Cuisine Appartement 1',
      level: 'R+1',
      area_m2: 12
    }
    // ... autres appartements
  ],
  openings: {
    windows: {
      total: 72,
      types: ['baie vitrée', 'fenêtre standard', 'porte-fenêtre']
    },
    doors: {
      total: 30,
      types: ['porte d\'entrée', 'porte palière', 'porte intérieure']
    },
    stairs: {
      count: 1,
      type: 'escalier béton + ascenseur'
    }
  },
  landscaping: {
    features: ['jardin', 'parking', 'acces', 'vegetation'],
    totalArea_m2: 400
  },
  technicalDetails: {
    totalArea_m2: 740,
    builtArea_m2: 600,
    floors: 4,
    dimensions: {
      length_m: 24,
      width_m: 16,
      height_m: 14
    }
  }
};

/**
 * Utilitaire pour récupérer un mock par nom
 */
export function getMockAnalysis(type: 'villa' | 'maison' | 'immeuble'): ArchitecturalAnalysis {
  switch (type) {
    case 'villa':
      return mockVillaModerne;
    case 'maison':
      return mockMaisonTraditionnelle;
    case 'immeuble':
      return mockImmeubleContemporain;
    default:
      return mockVillaModerne;
  }
}

/**
 * Liste tous les mocks disponibles
 */
export const availableMocks = [
  { id: 'villa', name: 'Villa Moderne Méditerranéenne', analysis: mockVillaModerne },
  { id: 'maison', name: 'Maison Traditionnelle', analysis: mockMaisonTraditionnelle },
  { id: 'immeuble', name: 'Immeuble Contemporain', analysis: mockImmeubleContemporain }
];
