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

// Import the main Equipment interface to ensure consistency
import { Equipment } from '../types/index';

const COLLECTION_NAME = 'equipment';

export class EquipmentService {
  /**
   * Récupérer tous les équipements
   */
  static async getAllEquipment(): Promise<Equipment[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        purchaseDate: doc.data().purchaseDate?.toDate() || undefined,
        lastMaintenanceDate: doc.data().lastMaintenanceDate?.toDate() || undefined,
        nextMaintenanceDate: doc.data().nextMaintenanceDate?.toDate() || undefined,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Equipment[];
    } catch (error) {
      console.error('Erreur lors de la récupération des équipements:', error);
      throw error;
    }
  }

  /**
   * Récupérer les équipements par statut
   */
  static async getEquipmentByStatus(status: Equipment['status']): Promise<Equipment[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        purchaseDate: doc.data().purchaseDate?.toDate() || undefined,
        lastMaintenanceDate: doc.data().lastMaintenanceDate?.toDate() || undefined,
        nextMaintenanceDate: doc.data().nextMaintenanceDate?.toDate() || undefined,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Equipment[];
    } catch (error) {
      console.error('Erreur lors de la récupération des équipements par statut:', error);
      throw error;
    }
  }

  /**
   * Récupérer les équipements par projet
   */
  static async getEquipmentByProject(projectId: string): Promise<Equipment[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        purchaseDate: doc.data().purchaseDate?.toDate() || undefined,
        lastMaintenanceDate: doc.data().lastMaintenanceDate?.toDate() || undefined,
        nextMaintenanceDate: doc.data().nextMaintenanceDate?.toDate() || undefined,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Equipment[];
    } catch (error) {
      console.error('Erreur lors de la récupération des équipements par projet:', error);
      throw error;
    }
  }

  /**
   * Ajouter un nouvel équipement
   */
  static async addEquipment(equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...equipmentData,
        purchaseDate: equipmentData.purchaseDate ? Timestamp.fromDate(equipmentData.purchaseDate) : null,
        lastMaintenanceDate: equipmentData.lastMaintenanceDate ? Timestamp.fromDate(equipmentData.lastMaintenanceDate) : null,
        nextMaintenanceDate: equipmentData.nextMaintenanceDate ? Timestamp.fromDate(equipmentData.nextMaintenanceDate) : null,
        createdAt: now,
        updatedAt: now
      });
      console.log('Équipement ajouté avec ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'équipement:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un équipement
   */
  static async updateEquipment(id: string, updates: Partial<Omit<Equipment, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const equipmentRef = doc(db, COLLECTION_NAME, id);
      const updateData: any = { ...updates };
      
      if (updateData.purchaseDate) {
        updateData.purchaseDate = Timestamp.fromDate(updateData.purchaseDate);
      }
      if (updateData.lastMaintenanceDate) {
        updateData.lastMaintenanceDate = Timestamp.fromDate(updateData.lastMaintenanceDate);
      }
      if (updateData.nextMaintenanceDate) {
        updateData.nextMaintenanceDate = Timestamp.fromDate(updateData.nextMaintenanceDate);
      }
      
      await updateDoc(equipmentRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });
      console.log('Équipement mis à jour:', id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'équipement:', error);
      throw error;
    }
  }

  /**
   * Supprimer un équipement
   */
  static async deleteEquipment(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      console.log('Équipement supprimé:', id);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'équipement:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'un équipement
   */
  static async updateEquipmentStatus(id: string, status: Equipment['status']): Promise<void> {
    try {
      const equipmentRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(equipmentRef, {
        status,
        updatedAt: Timestamp.now()
      });
      console.log('Statut équipement mis à jour:', id, status);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  /**
   * Assigner un équipement à un projet
   */
  static async assignEquipmentToProject(id: string, projectId: string, assignedTo?: string): Promise<void> {
    try {
      const equipmentRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(equipmentRef, {
        projectId,
        assignedTo,
        status: 'in_use',
        updatedAt: Timestamp.now()
      });
      console.log('Équipement assigné au projet:', id, projectId);
    } catch (error) {
      console.error('Erreur lors de l\'assignation de l\'équipement:', error);
      throw error;
    }
  }

  /**
   * Écouter les changements en temps réel
   */
  static subscribeToEquipment(callback: (equipment: Equipment[]) => void): () => void {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const equipment = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        purchaseDate: doc.data().purchaseDate?.toDate() || undefined,
        lastMaintenanceDate: doc.data().lastMaintenanceDate?.toDate() || undefined,
        nextMaintenanceDate: doc.data().nextMaintenanceDate?.toDate() || undefined,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Equipment[];
      
      callback(equipment);
    }, (error) => {
      console.error('Erreur lors de l\'écoute des équipements:', error);
    });
  }

  /**
   * Initialiser avec des données de test (à utiliser une seule fois)
   */
  static async initializeTestData(): Promise<void> {
    try {
      const existingEquipment = await this.getAllEquipment();
      if (existingEquipment.length > 0) {
        console.log('Les équipements existent déjà, pas d\'initialisation nécessaire');
        return;
      }

      const testEquipment = [
        {
          name: 'Excavatrice CAT 320',
          type: 'excavator' as const,
          brand: 'Caterpillar',
          model: '320',
          serialNumber: 'CAT320-2024-001',
          status: 'available' as const,
          location: 'Dépôt principal',
          dailyRate: 850,
          purchaseDate: new Date('2023-06-15'),
          lastMaintenanceDate: new Date('2024-01-15'),
          nextMaintenanceDate: new Date('2024-04-15'),
          description: 'Excavatrice hydraulique 20 tonnes',
          specifications: {
            power: '129 kW',
            capacity: '1.2 m³',
            weight: '20 500 kg',
            dimensions: '9.5 x 2.8 x 3.1 m'
          }
        },
        {
          name: 'Grue mobile Liebherr',
          type: 'crane' as const,
          brand: 'Liebherr',
          model: 'LTM 1030-2.1',
          serialNumber: 'LBR1030-2024-002',
          status: 'in_use' as const,
          location: 'Chantier Les Jardins',
          dailyRate: 1200,
          purchaseDate: new Date('2023-03-20'),
          lastMaintenanceDate: new Date('2024-01-10'),
          nextMaintenanceDate: new Date('2024-07-10'),
          description: 'Grue mobile 30 tonnes',
          specifications: {
            power: '200 kW',
            capacity: '30 t',
            weight: '36 000 kg',
            dimensions: '12.2 x 2.75 x 3.8 m'
          },
          projectId: 'project-1',
          assignedTo: 'Pierre Leroy'
        },
        {
          name: 'Bulldozer Komatsu D65',
          type: 'bulldozer' as const,
          brand: 'Komatsu',
          model: 'D65PX-18',
          serialNumber: 'KOM65-2024-003',
          status: 'maintenance' as const,
          location: 'Atelier de maintenance',
          dailyRate: 950,
          purchaseDate: new Date('2023-08-10'),
          lastMaintenanceDate: new Date('2024-01-20'),
          nextMaintenanceDate: new Date('2024-02-20'),
          description: 'Bulldozer chenillé 18 tonnes',
          specifications: {
            power: '119 kW',
            capacity: '3.4 m³',
            weight: '18 200 kg',
            dimensions: '6.2 x 3.4 x 3.2 m'
          }
        },
        {
          name: 'Bétonnière Schwing',
          type: 'mixer' as const,
          brand: 'Schwing',
          model: 'Stetter C3',
          serialNumber: 'SCH-C3-2024-004',
          status: 'available' as const,
          location: 'Dépôt principal',
          dailyRate: 450,
          purchaseDate: new Date('2023-11-05'),
          lastMaintenanceDate: new Date('2024-01-05'),
          nextMaintenanceDate: new Date('2024-04-05'),
          description: 'Camion malaxeur 8 m³',
          specifications: {
            power: '250 kW',
            capacity: '8 m³',
            weight: '26 000 kg',
            dimensions: '9.8 x 2.5 x 3.9 m'
          }
        },
        {
          name: 'Générateur Caterpillar',
          type: 'generator' as const,
          brand: 'Caterpillar',
          model: 'C9 DE220E0',
          serialNumber: 'CAT-GEN-2024-005',
          status: 'available' as const,
          location: 'Dépôt principal',
          dailyRate: 180,
          purchaseDate: new Date('2023-09-15'),
          lastMaintenanceDate: new Date('2024-01-08'),
          nextMaintenanceDate: new Date('2024-04-08'),
          description: 'Générateur diesel 220 kVA',
          specifications: {
            power: '220 kVA',
            capacity: '176 kW',
            weight: '1 850 kg',
            dimensions: '3.2 x 1.2 x 1.8 m'
          }
        }
      ];

      for (const equipment of testEquipment) {
        await this.addEquipment(equipment);
      }

      console.log('✅ Données de test des équipements initialisées');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des données de test:', error);
      throw error;
    }
  }
}
