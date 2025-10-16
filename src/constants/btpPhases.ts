/**
 * Phases Standard BTP - Structure de Devis Complète
 * 
 * Les 13 phases obligatoires pour tout devis de construction
 * Compatible avec la structure Phase/Task/Article existante
 * 
 * @author IntuitionConcept BTP Platform
 * @version 1.0.0
 */

import { PhaseTemplate } from '../types/StructuredQuote';

/**
 * Les 13 phases standard d'un projet BTP complet
 * Structure hiérarchique : Phase → Tâches → Articles
 */
export const BTP_STANDARD_PHASES: PhaseTemplate[] = [
  {
    name: '1. Installation de chantier',
    description: 'Préparation et sécurisation du chantier',
    tasks: [
      {
        name: 'Hangar provisoire',
        description: 'Construction abri pour matériaux et outils',
        articles: []
      },
      {
        name: 'Clôture de chantier',
        description: 'Sécurisation périmètre',
        articles: []
      },
      {
        name: 'Branchements provisoires',
        description: 'Eau et électricité de chantier',
        articles: []
      },
      {
        name: 'Signalisation',
        description: 'Panneaux et balisage',
        articles: []
      }
    ]
  },
  {
    name: '2. Terrassement et fondations',
    description: 'Préparation terrain et coulage fondations',
    tasks: [
      {
        name: 'Décapage terre végétale',
        description: 'Enlèvement couche superficielle',
        articles: []
      },
      {
        name: 'Fouilles en rigole',
        description: 'Excavation pour semelles',
        articles: []
      },
      {
        name: 'Béton de propreté',
        description: 'Couche de fond',
        articles: []
      },
      {
        name: 'Ferraillage semelles',
        description: 'Armatures acier',
        articles: []
      },
      {
        name: 'Coulage béton fondations',
        description: 'Béton armé C25/30',
        articles: []
      },
      {
        name: 'Longrines',
        description: 'Poutres de liaison',
        articles: []
      }
    ]
  },
  {
    name: '3. Assainissement',
    description: 'Système évacuation eaux usées',
    tasks: [
      {
        name: 'Fosse septique',
        description: 'Installation fosse toutes eaux',
        articles: []
      },
      {
        name: 'Puisard',
        description: 'Puits d\'infiltration',
        articles: []
      },
      {
        name: 'Canalisations EU/EV',
        description: 'Tuyaux PVC évacuation',
        articles: []
      },
      {
        name: 'Regards de visite',
        description: 'Points d\'accès réseau',
        articles: []
      }
    ]
  },
  {
    name: '4. Gros œuvre',
    description: 'Structure, maçonnerie, dalles',
    tasks: [
      {
        name: 'Élévation murs',
        description: 'Maçonnerie parpaings/briques',
        articles: []
      },
      {
        name: 'Poteaux béton armé',
        description: 'Éléments porteurs verticaux',
        articles: []
      },
      {
        name: 'Chaînages',
        description: 'Ceintures béton armé',
        articles: []
      },
      {
        name: 'Dalle RDC',
        description: 'Plancher rez-de-chaussée',
        articles: []
      },
      {
        name: 'Dalle étage',
        description: 'Plancher niveau supérieur',
        articles: []
      },
      {
        name: 'Escalier béton',
        description: 'Liaison entre niveaux',
        articles: []
      }
    ]
  },
  {
    name: '5. Charpente et couverture',
    description: 'Structure toiture et étanchéité',
    tasks: [
      {
        name: 'Charpente bois/métal',
        description: 'Ossature toiture',
        articles: []
      },
      {
        name: 'Couverture tuiles/tôles',
        description: 'Revêtement imperméable',
        articles: []
      },
      {
        name: 'Zinguerie',
        description: 'Chéneaux, gouttières, descentes EP',
        articles: []
      },
      {
        name: 'Isolation toiture',
        description: 'Laine de verre/roche',
        articles: []
      }
    ]
  },
  {
    name: '6. Menuiseries extérieures',
    description: 'Portes, fenêtres, volets',
    tasks: [
      {
        name: 'Porte d\'entrée',
        description: 'Porte principale blindée/standard',
        articles: []
      },
      {
        name: 'Fenêtres',
        description: 'Menuiseries aluminium/PVC/bois',
        articles: []
      },
      {
        name: 'Portes-fenêtres',
        description: 'Accès terrasse/jardin',
        articles: []
      },
      {
        name: 'Volets',
        description: 'Roulants ou battants',
        articles: []
      },
      {
        name: 'Garde-corps',
        description: 'Balcons et terrasses',
        articles: []
      }
    ]
  },
  {
    name: '7. Électricité',
    description: 'Installation électrique complète',
    tasks: [
      {
        name: 'Tableau électrique',
        description: 'Coffret disjoncteurs',
        articles: []
      },
      {
        name: 'Câblage général',
        description: 'Passage câbles dans gaines',
        articles: []
      },
      {
        name: 'Prises électriques',
        description: 'Prises 16A et 32A',
        articles: []
      },
      {
        name: 'Points lumineux',
        description: 'Plafonniers et appliques',
        articles: []
      },
      {
        name: 'Interrupteurs',
        description: 'Va-et-vient et simples',
        articles: []
      },
      {
        name: 'Branchement SBEE/CIE',
        description: 'Raccordement réseau public',
        articles: []
      }
    ]
  },
  {
    name: '8. Plomberie sanitaire',
    description: 'Réseau eau et équipements',
    tasks: [
      {
        name: 'Réseau eau froide',
        description: 'Tuyauterie PVC/cuivre',
        articles: []
      },
      {
        name: 'Réseau eau chaude',
        description: 'Distribution ECS',
        articles: []
      },
      {
        name: 'Chauffe-eau',
        description: 'Ballon électrique/solaire',
        articles: []
      },
      {
        name: 'WC',
        description: 'Cuvettes et mécanismes',
        articles: []
      },
      {
        name: 'Lavabos',
        description: 'Vasques et robinetterie',
        articles: []
      },
      {
        name: 'Douches/Baignoires',
        description: 'Équipements salle de bain',
        articles: []
      },
      {
        name: 'Cuisine',
        description: 'Évier et robinetterie',
        articles: []
      }
    ]
  },
  {
    name: '9. Carrelage et faïence',
    description: 'Revêtements sols et murs',
    tasks: [
      {
        name: 'Carrelage sols',
        description: 'Pose carrelage pièces principales',
        articles: []
      },
      {
        name: 'Carrelage salles d\'eau',
        description: 'Sols cuisine et SDB',
        articles: []
      },
      {
        name: 'Faïence murale',
        description: 'Revêtement murs cuisine/SDB',
        articles: []
      },
      {
        name: 'Plinthes',
        description: 'Finitions bas de murs',
        articles: []
      }
    ]
  },
  {
    name: '10. Menuiseries intérieures',
    description: 'Portes et placards',
    tasks: [
      {
        name: 'Portes intérieures',
        description: 'Portes chambres et pièces',
        articles: []
      },
      {
        name: 'Portes techniques',
        description: 'WC, SDB, cuisine',
        articles: []
      },
      {
        name: 'Placards intégrés',
        description: 'Rangements chambres',
        articles: []
      },
      {
        name: 'Quincaillerie',
        description: 'Poignées, serrures, charnières',
        articles: []
      }
    ]
  },
  {
    name: '11. Peinture et finitions',
    description: 'Revêtements muraux et décoration',
    tasks: [
      {
        name: 'Enduit intérieur',
        description: 'Préparation murs et plafonds',
        articles: []
      },
      {
        name: 'Peinture intérieure',
        description: 'Murs et plafonds',
        articles: []
      },
      {
        name: 'Enduit extérieur',
        description: 'Crépi façades',
        articles: []
      },
      {
        name: 'Peinture extérieure',
        description: 'Façades et menuiseries',
        articles: []
      }
    ]
  },
  {
    name: '12. Nettoyage final',
    description: 'Remise en état et finitions',
    tasks: [
      {
        name: 'Évacuation gravats',
        description: 'Enlèvement déchets chantier',
        articles: []
      },
      {
        name: 'Nettoyage intérieur',
        description: 'Nettoyage complet pièces',
        articles: []
      },
      {
        name: 'Nettoyage extérieur',
        description: 'Façades et abords',
        articles: []
      },
      {
        name: 'Aménagement extérieur',
        description: 'Terrasse, allées, clôture',
        articles: []
      }
    ]
  },
  {
    name: '13. Réception et livraison',
    description: 'Contrôles et remise des clés',
    tasks: [
      {
        name: 'Essais installations',
        description: 'Tests électricité, plomberie',
        articles: []
      },
      {
        name: 'Contrôle qualité',
        description: 'Vérification finitions',
        articles: []
      },
      {
        name: 'Levée réserves',
        description: 'Corrections défauts',
        articles: []
      },
      {
        name: 'Réception travaux',
        description: 'PV de réception',
        articles: []
      },
      {
        name: 'Remise documents',
        description: 'Plans, garanties, notices',
        articles: []
      }
    ]
  }
];

/**
 * Mapping des phases vers les catégories de prix
 */
export const PHASE_PRICE_CATEGORIES = {
  '1. Installation de chantier': 'installation',
  '2. Terrassement et fondations': 'gros_oeuvre',
  '3. Assainissement': 'gros_oeuvre',
  '4. Gros œuvre': 'gros_oeuvre',
  '5. Charpente et couverture': 'gros_oeuvre',
  '6. Menuiseries extérieures': 'second_oeuvre',
  '7. Électricité': 'second_oeuvre',
  '8. Plomberie sanitaire': 'second_oeuvre',
  '9. Carrelage et faïence': 'finitions',
  '10. Menuiseries intérieures': 'finitions',
  '11. Peinture et finitions': 'finitions',
  '12. Nettoyage final': 'finitions',
  '13. Réception et livraison': 'finitions'
} as const;

/**
 * Répartition budgétaire standard par catégorie (%)
 */
export const BUDGET_DISTRIBUTION = {
  installation: 0.03,      // 3%
  gros_oeuvre: 0.50,       // 50%
  second_oeuvre: 0.30,     // 30%
  finitions: 0.17          // 17%
} as const;

/**
 * Prix de référence au m² par catégorie (FCFA)
 * Marché Afrique de l'Ouest francophone
 */
export const REFERENCE_PRICES_PER_SQM = {
  installation: 7500,       // 7,500 FCFA/m²
  gros_oeuvre: 125000,      // 125,000 FCFA/m²
  second_oeuvre: 75000,     // 75,000 FCFA/m²
  finitions: 42500          // 42,500 FCFA/m²
} as const;

/**
 * Note : La génération dynamique des articles avec quantités calculées
 * est implémentée dans src/utils/quoteArticlesGenerator.ts
 * via la fonction generateArticlesForPhase()
 */
