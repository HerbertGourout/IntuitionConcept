import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { storage, db } from '../firebase';

const QUOTES_COLLECTION = 'structuredQuotes';

export interface StructuralDocument {
  id: string;
  name: string;
  type: 'plan' | 'calculation' | 'geotechnical' | 'photo' | 'other';
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  size: number;
}

export class StructuralDocumentService {
  /**
   * Upload un document d'étude structurale
   */
  static async uploadDocument(
    quoteId: string,
    file: File,
    type: StructuralDocument['type'],
    uploadedBy: string
  ): Promise<StructuralDocument> {
    try {
      // Créer une référence unique dans Storage
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `quotes/${quoteId}/structural-docs/${timestamp}_${sanitizedFileName}`;
      const storageRef = ref(storage, storagePath);

      // Upload le fichier
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Créer l'objet document
      const document: StructuralDocument = {
        id: `doc_${timestamp}`,
        name: file.name,
        type,
        url: downloadURL,
        uploadedAt: new Date().toISOString(),
        uploadedBy,
        size: file.size
      };

      // Mettre à jour le devis dans Firestore
      const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
      await updateDoc(quoteRef, {
        'structuralStudy.documents': {
          [document.id]: document
        },
        updatedAt: Timestamp.now()
      });

      console.log('✅ Document uploadé:', document.name);
      return document;
    } catch (error) {
      console.error('❌ Erreur upload document:', error);
      throw error;
    }
  }

  /**
   * Supprime un document
   */
  static async deleteDocument(
    quoteId: string,
    documentId: string,
    documentUrl: string
  ): Promise<void> {
    try {
      // Supprimer de Storage
      const storageRef = ref(storage, documentUrl);
      await deleteObject(storageRef);

      // Supprimer de Firestore
      const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
      await updateDoc(quoteRef, {
        [`structuralStudy.documents.${documentId}`]: null,
        updatedAt: Timestamp.now()
      });

      console.log('✅ Document supprimé');
    } catch (error) {
      console.error('❌ Erreur suppression document:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les documents d'un devis
   */
  static getDocumentsByType(
    documents: Record<string, StructuralDocument> | undefined,
    type?: StructuralDocument['type']
  ): StructuralDocument[] {
    if (!documents) return [];

    const docArray = Object.values(documents).filter(doc => doc !== null);

    if (type) {
      return docArray.filter(doc => doc.type === type);
    }

    return docArray;
  }

  /**
   * Formate la taille du fichier
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Valide le type de fichier
   */
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return allowedTypes.includes(fileExtension || '');
  }

  /**
   * Valide la taille du fichier (max 10MB par défaut)
   */
  static validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
}

export default StructuralDocumentService;
