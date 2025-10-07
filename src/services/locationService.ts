import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Location {
  id: string;
  name: string;
  address: string;
  type: 'warehouse' | 'office' | 'construction_site' | 'storage';
  status: 'active' | 'inactive' | 'maintenance';
  description?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  capacity?: {
    area: number; // m²
    volume?: number; // m³
  };
  equipmentCount: number;
  contact: {
    name: string;
    phone: string;
    email?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'locations';

export class LocationService {
  /**
   * Récupérer toutes les localisations
   */
  static async getAllLocations(): Promise<Location[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Location[];
    } catch (error) {
      console.error('Erreur lors de la récupération des localisations:', error);
      throw error;
    }
  }

  /**
   * Ajouter une nouvelle localisation
   */
  static async addLocation(locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...locationData,
        createdAt: now,
        updatedAt: now
      });
      if (import.meta.env.DEV) console.log('Localisation ajoutée avec ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la localisation:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une localisation
   */
  static async updateLocation(id: string, updates: Partial<Omit<Location, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const locationRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(locationRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      if (import.meta.env.DEV) console.log('Localisation mise à jour:', id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la localisation:', error);
      throw error;
    }
  }

  /**
   * Supprimer une localisation
   */
  static async deleteLocation(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      if (import.meta.env.DEV) console.log('Localisation supprimée:', id);
    } catch (error) {
      console.error('Erreur lors de la suppression de la localisation:', error);
      throw error;
    }
  }

  /**
   * Récupérer les localisations par type
   */
  static async getLocationsByType(type: Location['type']): Promise<Location[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('type', '==', type),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Location[];
    } catch (error) {
      console.error('Erreur lors de la récupération des localisations par type:', error);
      throw error;
    }
  }

  /**
   * Récupérer les localisations actives
   */
  static async getActiveLocations(): Promise<Location[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('status', '==', 'active'),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Location[];
    } catch (error) {
      console.error('Erreur lors de la récupération des localisations actives:', error);
      throw error;
    }
  }

  /**
   * Écouter les changements en temps réel
   */
  static subscribeToLocations(callback: (locations: Location[]) => void): () => void {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const locations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Location[];
      
      callback(locations);
    }, (error) => {
      console.error('Erreur lors de l\'écoute des localisations:', error);
    });
  }

  /**
   * Initialiser avec des données de test (à utiliser une seule fois)
   */
  static async initializeTestData(): Promise<void> {
    try {
      const existingLocations = await this.getAllLocations();
      if (existingLocations.length > 0) {
        if (import.meta.env.DEV) console.log('Les localisations existent déjà, pas d\'initialisation nécessaire');
        return;
      }

      const testLocations = [
        {
          name: 'Entrepôt Principal',
          address: '123 Rue de l\'Industrie, 59000 Lille',
          type: 'warehouse' as const,
          status: 'active' as const,
          description: 'Entrepôt principal pour le stockage des matériaux de construction',
          coordinates: { lat: 50.6292, lng: 3.0573 },
          capacity: { area: 2500, volume: 12000 },
          equipmentCount: 15,
          contact: { name: 'Jean Dupont', phone: '03 20 12 34 56', email: 'jean.dupont@btpmanager.com' }
        },
        {
          name: 'Bureau Central',
          address: '456 Avenue des Affaires, 59800 Lille',
          type: 'office' as const,
          status: 'active' as const,
          description: 'Bureau principal de l\'entreprise',
          coordinates: { lat: 50.6365, lng: 3.0635 },
          capacity: { area: 800 },
          equipmentCount: 25,
          contact: { name: 'Marie Martin', phone: '03 20 98 76 54', email: 'marie.martin@btpmanager.com' }
        },
        {
          name: 'Chantier Résidence Les Jardins',
          address: '789 Rue des Jardins, 59160 Lomme',
          type: 'construction_site' as const,
          status: 'active' as const,
          description: 'Construction d\'une résidence de 50 logements',
          coordinates: { lat: 50.6421, lng: 3.0123 },
          capacity: { area: 5000 },
          equipmentCount: 12,
          contact: { name: 'Pierre Leroy', phone: '03 20 45 67 89' }
        },
        {
          name: 'Dépôt Temporaire Nord',
          address: '321 Zone Industrielle, 59700 Marcq-en-Barœul',
          type: 'storage' as const,
          status: 'maintenance' as const,
          description: 'Dépôt temporaire en cours de rénovation',
          coordinates: { lat: 50.6789, lng: 3.1234 },
          capacity: { area: 1200, volume: 6000 },
          equipmentCount: 8,
          contact: { name: 'Sophie Leroy', phone: '03 20 12 34 56' }
        }
      ];

      for (const location of testLocations) {
        await this.addLocation(location);
      }

      if (import.meta.env.DEV) console.log('✅ Données de test des localisations initialisées');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des données de test:', error);
      throw error;
    }
  }
}
