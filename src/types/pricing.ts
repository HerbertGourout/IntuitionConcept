// Types pour les bases de données de prix d'ouvrages BTP par pays

export interface OuvrageItem {
  id: string;
  code: string; // Code normalisé (ex: "B.01.001")
  designation: string;
  unite: string; // m², m³, ml, u, kg, etc.
  prixUnitaire: number;
  devise: string;
  coefficients?: {
    main_oeuvre?: number;
    materiaux?: number;
    materiel?: number;
    sous_traitance?: number;
  };
  specifications?: string[];
  dateValidite: Date;
  source: string;
}

export interface CategoryOuvrages {
  id: string;
  name: string;
  description: string;
  ouvrages: OuvrageItem[];
}

export interface PricingDatabase {
  id: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  currency: string;
  currencySymbol: string;
  categories: {
    terrassement: CategoryOuvrages;
    grosOeuvre: CategoryOuvrages;
    charpente: CategoryOuvrages;
    couverture: CategoryOuvrages;
    menuiserie: CategoryOuvrages;
    plomberie: CategoryOuvrages;
    electricite: CategoryOuvrages;
    peinture: CategoryOuvrages;
    carrelage: CategoryOuvrages;
    equipements: CategoryOuvrages;
  };
  metadata: {
    version: string;
    lastUpdated: Date;
    source: string;
    validityPeriod: string; // "Q1-2024", "2024", etc.
    region?: string; // "Dakar", "Abidjan", etc.
    indexCoefficient?: number; // Coefficient d'actualisation
  };
}

export interface PricingRegion {
  id: string;
  name: string;
  countries: string[];
  commonCurrency?: string;
  priceVariationFactor: number; // 0.8 à 1.2 selon la région
}

export interface PricingUpdate {
  databaseId: string;
  category: string;
  ouvrageId: string;
  oldPrice: number;
  newPrice: number;
  variation: number; // Pourcentage
  reason: string;
  updatedAt: Date;
  validatedBy?: string;
}

export interface PricingSource {
  id: string;
  name: string;
  type: 'official' | 'professional' | 'market' | 'estimated';
  country: string;
  reliability: number; // 1-5
  updateFrequency: 'monthly' | 'quarterly' | 'yearly';
  contact?: {
    organization: string;
    email?: string;
    website?: string;
  };
}
