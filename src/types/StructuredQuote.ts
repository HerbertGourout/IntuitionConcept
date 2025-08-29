export interface Article {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
}

export interface Task {
    id: string;
    name: string;
    description: string;
    articles: Article[];
    totalPrice: number;
    expanded: boolean;
}

export interface Phase {
    id: string;
    name: string;
    description: string;
    tasks: Task[];
    totalPrice: number;
    expanded: boolean;
}

// Templates are definitions used to generate runtime entities. They should not require
// fields that are created at runtime (ids, totals, UI flags).
export type TaskTemplate = Omit<Task, 'id' | 'totalPrice' | 'expanded'>;
export type PhaseTemplate = Omit<Phase, 'id' | 'totalPrice' | 'expanded' | 'tasks'> & {
    tasks: TaskTemplate[];
};

export interface StructuredQuote {
    id: string;
    reference?: string;
    title: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    projectType: string;
    phases: Phase[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountRate: number;
    discountAmount: number;
    totalAmount: number;
    validityDays: number;
    paymentTerms: string;
    notes: string;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    createdAt: string;
    updatedAt: string;
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
}

export interface QuoteTemplate {
    id: string;
    name: string;
    description: string;
    projectType: string;
    phases: PhaseTemplate[];
}

export const PROJECT_TYPES = [
    { value: 'construction', label: '🏗️ Construction neuve', icon: '🏗️' },
    { value: 'renovation', label: '🔨 Rénovation', icon: '🔨' },
    { value: 'extension', label: '📐 Extension', icon: '📐' },
    { value: 'infrastructure', label: '🛣️ Infrastructure', icon: '🛣️' },
    { value: 'maintenance', label: '🔧 Maintenance', icon: '🔧' },
    { value: 'demolition', label: '💥 Démolition', icon: '💥' }
] as const;

export const UNITS = [
    'unité', 'm²', 'm³', 'm', 'kg', 'tonne', 
    'jour', 'heure', 'forfait', 'lot', 'pièce'
] as const;

export const DEFAULT_TEMPLATES: QuoteTemplate[] = [
    {
        id: 'gros-oeuvre',
        name: 'Gros Œuvre',
        description: 'Fondations, structure, maçonnerie',
        projectType: 'construction',
        phases: [
            {
                name: 'Terrassement',
                description: 'Préparation du terrain et excavation',
                tasks: [
                    { name: 'Décapage terre végétale', description: 'Enlèvement de la couche superficielle', articles: [] },
                    { name: 'Excavation fondations', description: 'Creusement pour fondations', articles: [] },
                    { name: 'Évacuation terres', description: 'Transport et évacuation des déblais', articles: [] }
                ]
            },
            {
                name: 'Fondations',
                description: 'Coulage des fondations et soubassement',
                tasks: [
                    { name: 'Semelles filantes', description: 'Coulage béton armé', articles: [] },
                    { name: 'Murs de soubassement', description: 'Élévation murs enterrés', articles: [] },
                    { name: 'Drainage', description: 'Système d\'évacuation des eaux', articles: [] }
                ]
            },
            {
                name: 'Élévation',
                description: 'Montage des murs et structure',
                tasks: [
                    { name: 'Murs porteurs', description: 'Maçonnerie traditionnelle', articles: [] },
                    { name: 'Cloisons', description: 'Séparations intérieures', articles: [] },
                    { name: 'Charpente', description: 'Structure de toiture', articles: [] }
                ]
            }
        ]
    },
    {
        id: 'second-oeuvre',
        name: 'Second Œuvre',
        description: 'Finitions, électricité, plomberie',
        projectType: 'construction',
        phases: [
            {
                name: 'Électricité',
                description: 'Installation électrique complète',
                tasks: [
                    { name: 'Tableau électrique', description: 'Pose et raccordement', articles: [] },
                    { name: 'Câblage', description: 'Passage des câbles', articles: [] },
                    { name: 'Prises et éclairage', description: 'Installation points lumineux', articles: [] }
                ]
            },
            {
                name: 'Plomberie',
                description: 'Installation sanitaire et chauffage',
                tasks: [
                    { name: 'Réseau eau froide/chaude', description: 'Tuyauterie complète', articles: [] },
                    { name: 'Sanitaires', description: 'WC, lavabos, douches', articles: [] },
                    { name: 'Chauffage', description: 'Radiateurs et chaudière', articles: [] }
                ]
            },
            {
                name: 'Menuiseries',
                description: 'Portes et fenêtres',
                tasks: [
                    { name: 'Fenêtres', description: 'Pose menuiseries extérieures', articles: [] },
                    { name: 'Portes intérieures', description: 'Installation portes', articles: [] },
                    { name: 'Volets', description: 'Pose volets roulants', articles: [] }
                ]
            }
        ]
    },
    {
        id: 'finitions',
        name: 'Finitions',
        description: 'Peinture, revêtements, nettoyage',
        projectType: 'construction',
        phases: [
            {
                name: 'Revêtements sols',
                description: 'Carrelage, parquet, moquette',
                tasks: [
                    { name: 'Carrelage', description: 'Pose carrelage salles d\'eau', articles: [] },
                    { name: 'Parquet', description: 'Pose parquet chambres/salon', articles: [] },
                    { name: 'Faïence', description: 'Revêtement mural cuisine/SDB', articles: [] }
                ]
            },
            {
                name: 'Peinture',
                description: 'Peinture intérieure et extérieure',
                tasks: [
                    { name: 'Préparation supports', description: 'Ponçage et rebouchage', articles: [] },
                    { name: 'Peinture intérieure', description: 'Murs et plafonds', articles: [] },
                    { name: 'Peinture extérieure', description: 'Façades et menuiseries', articles: [] }
                ]
            },
            {
                name: 'Nettoyage',
                description: 'Nettoyage final et livraison',
                tasks: [
                    { name: 'Nettoyage chantier', description: 'Évacuation gravats', articles: [] },
                    { name: 'Nettoyage final', description: 'Remise en état', articles: [] },
                    { name: 'Réception travaux', description: 'Contrôle qualité', articles: [] }
                ]
            }
        ]
    }
];
