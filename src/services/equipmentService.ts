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
  Timestamp,
  writeBatch,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Equipment } from '../types/index';

const COLLECTION_NAME = 'equipment';

// Helper to convert data from Firestore
const fromFirestore = (doc: QueryDocumentSnapshot<DocumentData>): Equipment => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    purchaseDate: data.purchaseDate instanceof Timestamp ? data.purchaseDate.toDate() : data.purchaseDate,
    lastMaintenance: data.lastMaintenance instanceof Timestamp ? data.lastMaintenance.toDate().toISOString() : data.lastMaintenance,
    nextMaintenance: data.nextMaintenance instanceof Timestamp ? data.nextMaintenance.toDate().toISOString() : data.nextMaintenance,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
  } as Equipment;
};

// Helper to convert data to Firestore
const toFirestore = (data: Partial<Omit<Equipment, 'id'>>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firestoreData: { [key: string]: any } = { ...data };
  if (data.purchaseDate) {
    firestoreData.purchaseDate = Timestamp.fromDate(new Date(data.purchaseDate));
  }
  if (data.lastMaintenance) {
    firestoreData.lastMaintenance = Timestamp.fromDate(new Date(data.lastMaintenance));
  }
  if (data.nextMaintenance) {
    firestoreData.nextMaintenance = Timestamp.fromDate(new Date(data.nextMaintenance));
  }
  return firestoreData;
};

export class EquipmentService {
  static async getAllEquipment(): Promise<Equipment[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(fromFirestore);
    } catch (error) {
      console.error('Erreur lors de la récupération des équipements:', error);
      throw error;
    }
  }

  static async getEquipmentByStatus(status: Equipment['status']): Promise<Equipment[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(fromFirestore);
    } catch (error) {
      console.error('Erreur lors de la récupération des équipements par statut:', error);
      throw error;
    }
  }

  static async getEquipmentByProject(projectId: string): Promise<Equipment[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(fromFirestore);
    } catch (error) {
      console.error('Erreur lors de la récupération des équipements par projet:', error);
      throw error;
    }
  }

  static async addEquipment(equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const dataToSave = toFirestore({
        ...equipmentData,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      });

      const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
      console.log('Équipement ajouté avec ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'équipement:", error);
      throw error;
    }
  }

  static async updateEquipment(id: string, updates: Partial<Omit<Equipment, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const equipmentRef = doc(db, COLLECTION_NAME, id);
      const dataToUpdate = toFirestore({ ...updates, updatedAt: new Date() });
      await updateDoc(equipmentRef, dataToUpdate);
      console.log('Équipement mis à jour:', id);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'équipement:", error);
      throw error;
    }
  }

  static async deleteEquipment(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      console.log('Équipement supprimé:', id);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'équipement:", error);
      throw error;
    }
  }

  static subscribeToEquipment(callback: (equipment: Equipment[]) => void): () => void {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (querySnapshot) => {
      const equipment = querySnapshot.docs.map(fromFirestore);
      callback(equipment);
    }, (error) => {
      console.error("Erreur lors de l'écoute des équipements:", error);
    });
  }

  static async initializeTestData(): Promise<void> {
    try {
      const querySnapshot = await getDocs(query(collection(db, COLLECTION_NAME)));
      if (!querySnapshot.empty) {
        console.log('La collection équipements contient déjà des données. Initialisation annulée.');
        return;
      }

      const testEquipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Excavatrice CAT 320',
          type: 'excavator',
          brand: 'Caterpillar',
          model: '320',
          serialNumber: 'CAT320-2024-001',
          status: 'available',
          location: 'Dépôt principal',
          dailyRate: 850,
          purchaseDate: new Date('2023-06-15'),
          lastMaintenance: new Date('2024-01-15').toISOString(),
          nextMaintenance: new Date('2024-04-15').toISOString(),
          description: 'Excavatrice hydraulique 20 tonnes',
          specifications: { power: '129 kW', capacity: '1.2 m³', weight: '20 500 kg', dimensions: '9.5 x 2.8 x 3.1 m' }
        },
        {
          name: 'Grue mobile Liebherr',
          type: 'crane',
          brand: 'Liebherr',
          model: 'LTM 1030-2.1',
          serialNumber: 'LBR1030-2024-002',
          status: 'in_use',
          location: 'Chantier Les Jardins',
          dailyRate: 1200,
          purchaseDate: new Date('2023-03-20'),
          lastMaintenance: new Date('2024-01-10').toISOString(),
          nextMaintenance: new Date('2024-07-10').toISOString(),
          description: 'Grue mobile 30 tonnes',
          specifications: { power: '200 kW', capacity: '30 t', weight: '36 000 kg', dimensions: '12.2 x 2.75 x 3.8 m' },
          projectId: 'project-1',
          operator: 'Pierre Leroy'
        },
        {
          name: 'Bulldozer Komatsu D65',
          type: 'bulldozer',
          brand: 'Komatsu',
          model: 'D65PX-18',
          serialNumber: 'KOM65-2024-003',
          status: 'maintenance',
          location: 'Atelier de maintenance',
          dailyRate: 950,
          purchaseDate: new Date('2023-08-10'),
          lastMaintenance: new Date('2024-01-20').toISOString(),
          nextMaintenance: new Date('2024-02-20').toISOString(),
          description: 'Bulldozer chenillé 18 tonnes',
          specifications: { power: '119 kW', capacity: '3.4 m³', weight: '18 200 kg', dimensions: '6.2 x 3.4 x 3.2 m' }
        },
      ];

      const batch = writeBatch(db);
      for (const equipment of testEquipment) {
        const docRef = doc(collection(db, COLLECTION_NAME));
        batch.set(docRef, toFirestore({ ...equipment, createdAt: new Date(), updatedAt: new Date() }));
      }
      await batch.commit();

      console.log('✅ Données de test des équipements initialisées par batch.');
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation des données de test:", error);
      throw error;
    }
  }
}
