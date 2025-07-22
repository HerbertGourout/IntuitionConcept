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

export interface Document {
  id: string;
  name: string;
  type: 'photo' | 'plan' | 'contract' | 'invoice' | 'report' | 'other';
  url: string;
  size: number;
  uploadDate: Date;
  tags: string[];
  description?: string;
  projectId?: string;
  uploadedBy?: string;
  version?: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'documents';

export class DocumentService {
  /**
   * Récupérer tous les documents
   */
  static async getAllDocuments(): Promise<Document[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('uploadDate', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadDate: doc.data().uploadDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Document[];
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      throw error;
    }
  }

  /**
   * Récupérer les documents par projet
   */
  static async getDocumentsByProject(projectId: string): Promise<Document[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('projectId', '==', projectId),
        orderBy('uploadDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadDate: doc.data().uploadDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Document[];
    } catch (error) {
      console.error('Erreur lors de la récupération des documents par projet:', error);
      throw error;
    }
  }

  /**
   * Ajouter un nouveau document
   */
  static async addDocument(documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...documentData,
        uploadDate: Timestamp.fromDate(documentData.uploadDate),
        createdAt: now,
        updatedAt: now
      });
      console.log('Document ajouté avec ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un document
   */
  static async updateDocument(id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const documentRef = doc(db, COLLECTION_NAME, id);
      const updateData: any = { ...updates };
      
      if (updateData.uploadDate) {
        updateData.uploadDate = Timestamp.fromDate(updateData.uploadDate);
      }
      
      await updateDoc(documentRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });
      console.log('Document mis à jour:', id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du document:', error);
      throw error;
    }
  }

  /**
   * Supprimer un document
   */
  static async deleteDocument(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      console.log('Document supprimé:', id);
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      throw error;
    }
  }

  /**
   * Rechercher des documents par tags
   */
  static async searchDocumentsByTags(tags: string[]): Promise<Document[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('tags', 'array-contains-any', tags),
        orderBy('uploadDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadDate: doc.data().uploadDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Document[];
    } catch (error) {
      console.error('Erreur lors de la recherche de documents par tags:', error);
      throw error;
    }
  }

  /**
   * Écouter les changements en temps réel
   */
  static subscribeToDocuments(callback: (documents: Document[]) => void): () => void {
    const q = query(collection(db, COLLECTION_NAME), orderBy('uploadDate', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadDate: doc.data().uploadDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Document[];
      
      callback(documents);
    }, (error) => {
      console.error('Erreur lors de l\'écoute des documents:', error);
    });
  }

  /**
   * Initialiser avec des données de test (à utiliser une seule fois)
   */
  static async initializeTestData(): Promise<void> {
    try {
      const existingDocuments = await this.getAllDocuments();
      if (existingDocuments.length > 0) {
        console.log('Les documents existent déjà, pas d\'initialisation nécessaire');
        return;
      }

      const testDocuments = [
        {
          name: 'Plan architectural - Résidence Les Jardins',
          type: 'plan' as const,
          url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
          size: 2048576,
          uploadDate: new Date('2024-01-15'),
          tags: ['plan', 'architecture', 'résidence'],
          description: 'Plans détaillés de la résidence Les Jardins',
          projectId: 'project-1',
          uploadedBy: 'Jean Dupont',
          version: 1,
          isPublic: false
        },
        {
          name: 'Photo chantier - Fondations',
          type: 'photo' as const,
          url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
          size: 1536000,
          uploadDate: new Date('2024-01-20'),
          tags: ['photo', 'chantier', 'fondations'],
          description: 'État d\'avancement des fondations',
          projectId: 'project-1',
          uploadedBy: 'Marie Martin',
          version: 1,
          isPublic: true
        },
        {
          name: 'Contrat entreprise générale',
          type: 'contract' as const,
          url: '#',
          size: 512000,
          uploadDate: new Date('2024-01-10'),
          tags: ['contrat', 'juridique'],
          description: 'Contrat principal avec l\'entreprise générale',
          projectId: 'project-1',
          uploadedBy: 'Pierre Leroy',
          version: 2,
          isPublic: false
        },
        {
          name: 'Facture matériaux janvier',
          type: 'invoice' as const,
          url: '#',
          size: 256000,
          uploadDate: new Date('2024-01-31'),
          tags: ['facture', 'matériaux', 'janvier'],
          description: 'Facture des matériaux commandés en janvier',
          projectId: 'project-1',
          uploadedBy: 'Sophie Leroy',
          version: 1,
          isPublic: false
        },
        {
          name: 'Rapport qualité - Semaine 4',
          type: 'report' as const,
          url: '#',
          size: 768000,
          uploadDate: new Date('2024-01-28'),
          tags: ['rapport', 'qualité', 'contrôle'],
          description: 'Rapport de contrôle qualité de la semaine 4',
          projectId: 'project-1',
          uploadedBy: 'Jean Dupont',
          version: 1,
          isPublic: true
        }
      ];

      for (const document of testDocuments) {
        await this.addDocument(document);
      }

      console.log('✅ Données de test des documents initialisées');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des données de test:', error);
      throw error;
    }
  }
}
