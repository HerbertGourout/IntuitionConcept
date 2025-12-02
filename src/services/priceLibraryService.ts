import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export interface PriceItem {
  id?: string;
  code: string;
  designation: string;
  unit: string;
  unitPrice: number;
  currency: 'XOF' | 'XAF' | 'MAD' | 'USD' | 'EUR';
  category: string;
  subcategory: string;
  trade: string;
  region: string;
  country: string;
  lastUpdated: Date;
  source: 'official' | 'market' | 'user' | 'ai_estimated';
  description?: string;
  specifications?: string;
  supplier?: string;
  minQuantity?: number;
  maxQuantity?: number;
  priceHistory?: Array<{
    date: Date;
    price: number;
    source: string;
  }>;
  tags?: string[];
}

export interface PriceCategory {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  trade: string;
  description?: string;
  icon?: string;
  itemCount: number;
}

export interface Trade {
  id: string;
  name: string;
  code: string;
  description: string;
  categories: string[];
  icon: string;
}

class PriceLibraryService {
  // Trades BTP disponibles
  private trades: Trade[] = [
    {
      id: 'gros_oeuvre',
      name: 'Gros Œuvre',
      code: 'GO',
      description: 'Fondations, maçonnerie, béton armé',
      categories: ['fondations', 'maconnerie', 'beton', 'charpente'],
      icon: '🏗️'
    },
    {
      id: 'second_oeuvre',
      name: 'Second Œuvre',
      code: 'SO',
      description: 'Plomberie, électricité, menuiserie',
      categories: ['plomberie', 'electricite', 'menuiserie', 'peinture'],
      icon: '🔧'
    },
    {
      id: 'finitions',
      name: 'Finitions',
      code: 'FI',
      description: 'Carrelage, peinture, revêtements',
      categories: ['carrelage', 'peinture', 'revetements', 'decoration'],
      icon: ''
    },
    {
      id: 'terrassement',
      name: 'Terrassement',
      code: 'TE',
      description: 'Excavation, remblai, voirie',
      categories: ['excavation', 'remblai', 'voirie', 'assainissement'],
      icon: '🚜'
    },
    {
      id: 'couverture',
      name: 'Couverture',
      code: 'CO',
      description: 'Toiture, étanchéité, zinguerie',
      categories: ['toiture', 'etancheite', 'zinguerie', 'isolation'],
      icon: '🏠'
    }
  ];

  // Initialiser la bibliothèque avec des prix de base
  async initializePriceLibrary(): Promise<void> {
    try {
      // Vérifier si déjà initialisée
      const existingItems = await this.searchPriceItems({ limit: 1 });
      if (existingItems.length > 0) {
        console.log('Bibliothèque déjà initialisée');
        return;
      }

      console.log('Initialisation de la bibliothèque de prix...');
      
      // Prix de base pour l'Afrique de l'Ouest (Sénégal, Côte d'Ivoire, Mali)
      const basePrices: Omit<PriceItem, 'id' | 'lastUpdated'>[] = [
        // GROS ŒUVRE
        {
          code: 'GO001',
          designation: 'Béton dosé à 350kg/m³',
          unit: 'm³',
          unitPrice: 85000,
          currency: 'XOF',
          category: 'beton',
          subcategory: 'beton_structure',
          trade: 'gros_oeuvre',
          region: 'Dakar',
          country: 'Sénégal',
          source: 'market',
          description: 'Béton prêt à l\'emploi pour structures',
          specifications: 'Résistance 25 MPa, granulats 0/20'
        },
        {
          code: 'GO002',
          designation: 'Parpaing creux 20x20x40',
          unit: 'unité',
          unitPrice: 400,
          currency: 'XOF',
          category: 'maconnerie',
          subcategory: 'blocs',
          trade: 'gros_oeuvre',
          region: 'Abidjan',
          country: 'Côte d\'Ivoire',
          source: 'market',
          description: 'Bloc béton creux standard'
        },
        {
          code: 'GO003',
          designation: 'Ciment Portland CEM II 42.5',
          unit: 'sac 50kg',
          unitPrice: 4500,
          currency: 'XOF',
          category: 'materiaux_base',
          subcategory: 'liants',
          trade: 'gros_oeuvre',
          region: 'Bamako',
          country: 'Mali',
          source: 'official',
          description: 'Ciment haute qualité'
        },
        {
          code: 'GO004',
          designation: 'Acier HA 12mm',
          unit: 'kg',
          unitPrice: 650,
          currency: 'XOF',
          category: 'ferraillage',
          subcategory: 'acier_rond',
          trade: 'gros_oeuvre',
          region: 'Dakar',
          country: 'Sénégal',
          source: 'market',
          description: 'Acier haute adhérence diamètre 12mm'
        },

        // SECOND ŒUVRE
        {
          code: 'SO001',
          designation: 'Tube PVC Ø110 évacuation',
          unit: 'ml',
          unitPrice: 2500,
          currency: 'XOF',
          category: 'plomberie',
          subcategory: 'evacuation',
          trade: 'second_oeuvre',
          region: 'Abidjan',
          country: 'Côte d\'Ivoire',
          source: 'market',
          description: 'Tube PVC pour évacuation eaux usées'
        },
        {
          code: 'SO002',
          designation: 'Câble électrique 2.5mm² H07V-U',
          unit: 'ml',
          unitPrice: 450,
          currency: 'XOF',
          category: 'electricite',
          subcategory: 'cables',
          trade: 'second_oeuvre',
          region: 'Dakar',
          country: 'Sénégal',
          source: 'market',
          description: 'Câble rigide pour installation électrique'
        },
        {
          code: 'SO003',
          designation: 'Porte isoplane 83x204',
          unit: 'unité',
          unitPrice: 45000,
          currency: 'XOF',
          category: 'menuiserie',
          subcategory: 'portes_interieures',
          trade: 'second_oeuvre',
          region: 'Bamako',
          country: 'Mali',
          source: 'market',
          description: 'Porte intérieure standard avec huisserie'
        },

        // FINITIONS
        {
          code: 'FI001',
          designation: 'Carrelage grès cérame 30x30',
          unit: 'm²',
          unitPrice: 8500,
          currency: 'XOF',
          category: 'carrelage',
          subcategory: 'sol_interieur',
          trade: 'finitions',
          region: 'Abidjan',
          country: 'Côte d\'Ivoire',
          source: 'market',
          description: 'Carrelage sol intérieur standard'
        },
        {
          code: 'FI002',
          designation: 'Peinture acrylique mate',
          unit: 'litre',
          unitPrice: 3200,
          currency: 'XOF',
          category: 'peinture',
          subcategory: 'peinture_interieure',
          trade: 'finitions',
          region: 'Dakar',
          country: 'Sénégal',
          source: 'market',
          description: 'Peinture acrylique pour murs intérieurs'
        },

        // TERRASSEMENT
        {
          code: 'TE001',
          designation: 'Excavation terrain meuble',
          unit: 'm³',
          unitPrice: 2500,
          currency: 'XOF',
          category: 'excavation',
          subcategory: 'fouilles',
          trade: 'terrassement',
          region: 'Dakar',
          country: 'Sénégal',
          source: 'market',
          description: 'Excavation mécanique terrain meuble'
        },
        {
          code: 'TE002',
          designation: 'Remblai compacté',
          unit: 'm³',
          unitPrice: 3500,
          currency: 'XOF',
          category: 'remblai',
          subcategory: 'remblai_compacte',
          trade: 'terrassement',
          region: 'Abidjan',
          country: 'Côte d\'Ivoire',
          source: 'market',
          description: 'Remblai avec compactage mécanique'
        },

        // COUVERTURE
        {
          code: 'CO001',
          designation: 'Tôle bac acier galvanisé',
          unit: 'm²',
          unitPrice: 4500,
          currency: 'XOF',
          category: 'toiture',
          subcategory: 'tole_metallique',
          trade: 'couverture',
          region: 'Bamako',
          country: 'Mali',
          source: 'market',
          description: 'Tôle nervurée galvanisée épaisseur 0.4mm'
        }
      ];

      // Ajouter les prix à Firebase
      for (const price of basePrices) {
        await addDoc(collection(db, 'priceLibrary'), {
          ...price,
          lastUpdated: new Date()
        });
      }

      console.log(`${basePrices.length} prix ajoutés à la bibliothèque`);
    } catch (error) {
      console.error('Erreur initialisation bibliothèque:', error);
      throw error;
    }
  }

  // Rechercher des prix
  async searchPriceItems(filters: {
    trade?: string;
    category?: string;
    region?: string;
    country?: string;
    searchTerm?: string;
    limit?: number;
  }): Promise<PriceItem[]> {
    try {
      let q = collection(db, 'priceLibrary');

      if (filters.trade) {
        q = query(q, where('trade', '==', filters.trade)) as any;
      }
      if (filters.category) {
        q = query(q, where('category', '==', filters.category)) as any;
      }
      if (filters.region) {
        q = query(q, where('region', '==', filters.region)) as any;
      }
      if (filters.country) {
        q = query(q, where('country', '==', filters.country)) as any;
      }

      q = query(q, orderBy('designation')) as any;

      const snapshot = await getDocs(q);
      let results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PriceItem[];

      // Filtrage par terme de recherche (côté client)
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        results = results.filter(item => 
          item.designation.toLowerCase().includes(term) ||
          item.code.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)
        );
      }

      // Limiter les résultats
      if (filters.limit) {
        results = results.slice(0, filters.limit);
      }

      return results;
    } catch (error) {
      console.error('Erreur recherche prix:', error);
      return [];
    }
  }

  // Ajouter un nouveau prix
  async addPriceItem(item: Omit<PriceItem, 'id' | 'lastUpdated'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'priceLibrary'), {
        ...item,
        lastUpdated: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur ajout prix:', error);
      throw error;
    }
  }

  // Mettre à jour un prix
  async updatePriceItem(id: string, updates: Partial<PriceItem>): Promise<void> {
    try {
      await updateDoc(doc(db, 'priceLibrary', id), {
        ...updates,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Erreur mise à jour prix:', error);
      throw error;
    }
  }

  // Obtenir les catégories par métier
  async getCategoriesByTrade(tradeId: string): Promise<PriceCategory[]> {
    try {
      const items = await this.searchPriceItems({ trade: tradeId });
      
      // Grouper par catégorie
      const categoryMap = new Map<string, { count: number; items: PriceItem[] }>();
      
      items.forEach(item => {
        const key = item.category;
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { count: 0, items: [] });
        }
        categoryMap.get(key)!.count++;
        categoryMap.get(key)!.items.push(item);
      });

      // Convertir en tableau de catégories
      return Array.from(categoryMap.entries()).map(([category, data]) => ({
        id: category,
        name: this.getCategoryDisplayName(category),
        code: category.toUpperCase(),
        trade: tradeId,
        itemCount: data.count
      }));
    } catch (error) {
      console.error('Erreur récupération catégories:', error);
      return [];
    }
  }

  // Obtenir les métiers disponibles
  getTrades(): Trade[] {
    return this.trades;
  }

  // Obtenir les régions disponibles
  async getAvailableRegions(): Promise<string[]> {
    try {
      const items = await this.searchPriceItems({});
      const regions = [...new Set(items.map(item => item.region))];
      return regions.sort();
    } catch (error) {
      console.error('Erreur récupération régions:', error);
      return [];
    }
  }

  // Obtenir les pays disponibles
  async getAvailableCountries(): Promise<string[]> {
    try {
      const items = await this.searchPriceItems({});
      const countries = [...new Set(items.map(item => item.country))];
      return countries.sort();
    } catch (error) {
      console.error('Erreur récupération pays:', error);
      return [];
    }
  }

  
  async estimatePriceWithAI(description: string, region: string): Promise<PriceItem | null> {
    try {
      
      // En production, ceci ferait appel à Service pour analyser la description
      
      const estimatedPrice: Omit<PriceItem, 'id' | 'lastUpdated'> = {
        code: `AI${Date.now()}`,
        designation: description,
        unit: 'unité',
        unitPrice: Math.floor(Math.random() * 50000) + 5000, // Prix aléatoire pour simulation
        currency: 'XOF',
        category: 'estimation_ia',
        subcategory: 'non_categorise',
        trade: 'estimation',
        region,
        country: 'Estimation',
        source: 'ai_estimated',
        description: `Prix estimé par IA pour: ${description}`,
        tags: ['estimation_ia', 'temporaire']
      };

      return { ...estimatedPrice, id: 'temp_ai', lastUpdated: new Date() };
    } catch (error) {
      console.error('Erreur estimation IA:', error);
      return null;
    }
  }

  // Convertir les devises
  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    // Taux de change approximatifs (à actualiser avec une API réelle)
    const rates: Record<string, number> = {
      'XOF': 1,      // Franc CFA Ouest
      'XAF': 1,      // Franc CFA Central  
      'MAD': 60,     // Dirham marocain
      'USD': 600,    // Dollar US
      'EUR': 655     // Euro
    };

    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    
    return Math.round((amount / fromRate) * toRate);
  }

  // Obtenir le nom d'affichage d'une catégorie
  private getCategoryDisplayName(category: string): string {
    const displayNames: Record<string, string> = {
      'beton': 'Béton',
      'maconnerie': 'Maçonnerie',
      'ferraillage': 'Ferraillage',
      'materiaux_base': 'Matériaux de base',
      'plomberie': 'Plomberie',
      'electricite': 'Électricité',
      'menuiserie': 'Menuiserie',
      'carrelage': 'Carrelage',
      'peinture': 'Peinture',
      'excavation': 'Excavation',
      'remblai': 'Remblai',
      'toiture': 'Toiture',
      'estimation_ia': 'Estimation IA'
    };

    return displayNames[category] || category;
  }
}

export const priceLibraryService = new PriceLibraryService();
export default priceLibraryService;
