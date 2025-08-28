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
  startAfter as fsStartAfter,
  limit as fsLimit,
  getDoc,
  type QueryConstraint 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Document {
  id: string;
  name: string;
  type: 'photo' | 'plan' | 'contract' | 'report' | 'permit' | 'other';
  url: string;
  size: number;
  uploadDate: Date;
  tags?: string[];
  description?: string;
  projectId: string;
  uploadedBy: string;
  version: string;
  folderId?: string;
  shared?: boolean;
  shareSettings?: {
    accessLevel: 'view' | 'comment' | 'edit';
    expiration: string;
    requireAuth: boolean;
    allowDownload: boolean;
  };
  permissions?: {
    ownerId: string;
    sharedWith: Array<{ userId: string; role: 'view' | 'comment' | 'edit' }>;
    publicLink?: {
      tokenHash: string;
      accessLevel: 'view' | 'comment' | 'edit';
      allowDownload?: boolean;
      expiresAt?: Date;
      createdAt: Date;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Firestore representation with Timestamps for date fields
type PublicLinkFs = {
  tokenHash: string;
  accessLevel: 'view' | 'comment' | 'edit';
  allowDownload?: boolean;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
};

type PermissionsFs = {
  ownerId: string;
  sharedWith: Array<{ userId: string; role: 'view' | 'comment' | 'edit' }>;
  publicLink?: PublicLinkFs | null;
};

type FirestoreDocument = Omit<
  Document,
  'id' | 'createdAt' | 'updatedAt' | 'uploadDate' | 'permissions'
> & {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  uploadDate?: Timestamp;
  permissions?: PermissionsFs;
};

const COLLECTION_NAME = 'documents';

// Centralized Firestore DataConverter to map Firestore Timestamps ⇄ JS Dates
const documentConverter: import('firebase/firestore').FirestoreDataConverter<Document> = {
  toFirestore(model: Document) {
    const { createdAt, updatedAt, uploadDate, permissions, ...rest } = model;
    const fsPermissions: PermissionsFs | undefined = permissions
      ? {
          ownerId: permissions.ownerId,
          sharedWith: permissions.sharedWith,
          publicLink: permissions.publicLink
            ? {
                tokenHash: permissions.publicLink.tokenHash,
                accessLevel: permissions.publicLink.accessLevel,
                allowDownload: permissions.publicLink.allowDownload,
                expiresAt: permissions.publicLink.expiresAt
                  ? Timestamp.fromDate(permissions.publicLink.expiresAt)
                  : undefined,
                createdAt: Timestamp.fromDate(
                  permissions.publicLink.createdAt ?? new Date()
                ),
              }
            : undefined,
        }
      : undefined;

    const payload: FirestoreDocument = {
      ...(rest as Omit<
        Document,
        'id' | 'createdAt' | 'updatedAt' | 'uploadDate' | 'permissions'
      >),
      createdAt: createdAt ? Timestamp.fromDate(createdAt) : Timestamp.now(),
      updatedAt: updatedAt ? Timestamp.fromDate(updatedAt) : Timestamp.now(),
      uploadDate: uploadDate ? Timestamp.fromDate(uploadDate) : Timestamp.now(),
      permissions: fsPermissions,
    };
    return payload as unknown as import('firebase/firestore').DocumentData;
  },
  fromFirestore(snap) {
    const data = snap.data() as FirestoreDocument;
    const permissions: Document['permissions'] | undefined = data.permissions
      ? {
          ownerId: data.permissions.ownerId,
          sharedWith: data.permissions.sharedWith,
          publicLink: data.permissions.publicLink
            ? {
                tokenHash: data.permissions.publicLink.tokenHash,
                accessLevel: data.permissions.publicLink.accessLevel,
                allowDownload: data.permissions.publicLink.allowDownload,
                expiresAt: data.permissions.publicLink.expiresAt
                  ? data.permissions.publicLink.expiresAt.toDate()
                  : undefined,
                createdAt: data.permissions.publicLink.createdAt
                  ? data.permissions.publicLink.createdAt.toDate()
                  : new Date(),
              }
            : undefined,
        }
      : undefined;

    const docModel: Document = {
      id: snap.id,
      // Spread the non-date, non-permissions fields
      ...(data as unknown as Omit<
        Document,
        'id' | 'createdAt' | 'updatedAt' | 'uploadDate' | 'permissions'
      >),
      permissions,
      uploadDate: data.uploadDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
    return docModel;
  },
};

export class DocumentService {
  // Convenience helpers to always use the converter
  private static col() {
    return collection(db, COLLECTION_NAME).withConverter(documentConverter);
  }

  /**
   * Ajouter un nouveau document
   */
  static async addDocument(documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const documentsRef = this.col();
    const now = new Date();
    const full: Document = {
      id: '',
      ...documentData,
      createdAt: now,
      updatedAt: now,
      uploadDate: documentData.uploadDate || now,
    } as Document;
    return (await addDoc(documentsRef, full)).id;
  }

  /**
   * Mettre à jour un document
   */
  static async updateDocument(id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>): Promise<void> {
    const documentRef = doc(db, COLLECTION_NAME, id);
    const updateData: Partial<Omit<Document, 'id' | 'createdAt'>> & { uploadDate?: Date } = { ...updates };
    type FirestoreDocumentUpdate = Partial<
      Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'uploadDate'>
    > & {
      uploadDate?: Timestamp;
      updatedAt?: Timestamp;
    };
    const payload: FirestoreDocumentUpdate = { ...updateData } as unknown as FirestoreDocumentUpdate;
    if (updateData.uploadDate) {
      payload.uploadDate = Timestamp.fromDate(new Date(updateData.uploadDate));
    }
    payload.updatedAt = Timestamp.now();
    await updateDoc(documentRef, payload as unknown as Partial<FirestoreDocument>);
  }

  /**
   * Récupérer tous les documents
   */
  static async getAllDocuments(options?: { limit?: number; startAfter?: Date }): Promise<Document[]> {
    const documentsRef = this.col();
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    if (options?.startAfter) {
      constraints.push(fsStartAfter(Timestamp.fromDate(options.startAfter)));
    }
    if (options?.limit) {
      constraints.push(fsLimit(options.limit));
    }
    const q = query(documentsRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data());
  }

  /**
   * Récupérer les documents par projet
   */
  static async getDocumentsByProject(projectId: string, options?: { limit?: number; startAfter?: Date }): Promise<Document[]> {
    const documentsRef = this.col();
    const constraints: QueryConstraint[] = [where('projectId', '==', projectId), orderBy('createdAt', 'desc')];
    if (options?.startAfter) {
      constraints.push(fsStartAfter(Timestamp.fromDate(options.startAfter)));
    }
    if (options?.limit) {
      constraints.push(fsLimit(options.limit));
    }
    const q = query(documentsRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data());
  }

  /**
   * Écouter les changements en temps réel
   */
  static subscribeToDocuments(callback: (documents: Document[]) => void): () => void {
    const documentsRef = this.col();
    const q = query(documentsRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map(d => d.data());
      callback(documents);
    });
  }

  /**
   * Supprimer un document
   */
  static async deleteDocument(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  }

  /**
   * Rechercher des documents par tags
   */
  static async searchDocumentsByTags(tags: string[]): Promise<Document[]> {
    const documentsRef = this.col();
    const q = query(documentsRef, where('tags', 'array-contains-any', tags), orderBy('createdAt', 'desc'), fsLimit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data());
  }

  // ===================== Partage sécurisé & permissions =====================
  // ... rest of the code remains the same ...
  /**
   * Générer un token aléatoire sûr (base64url)
   */
  private static generateToken(bytes = 32): string {
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      const arr = new Uint8Array(bytes);
      window.crypto.getRandomValues(arr);
      // base64url
      const str = btoa(String.fromCharCode(...Array.from(arr))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return str;
    }
    // Fallback simple
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  /**
   * Hacher un token (SHA-256 -> hex) via Web Crypto lorsque dispo
   */
  private static async hashToken(token: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const enc = new TextEncoder().encode(token);
      const digest = await window.crypto.subtle.digest('SHA-256', enc);
      const bytes = Array.from(new Uint8Array(digest));
      return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback non-crypto (moins sûr) uniquement si nécessaire
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash << 5) - hash + token.charCodeAt(i);
      hash |= 0;
    }
    return `fallback_${Math.abs(hash)}`;
  }

  /**
   * Créer un lien de partage signé et persister son hash et les paramètres
   */
  static async generateShareLink(
    documentId: string,
    options: { accessLevel: 'view' | 'comment' | 'edit'; expiresAt?: Date; allowDownload?: boolean }
  ): Promise<{ url: string; token: string; expiresAt?: Date }> {
    const token = this.generateToken(32);
    const tokenHash = await this.hashToken(token);
    const now = Timestamp.now();
    const expiresTs = options.expiresAt ? Timestamp.fromDate(options.expiresAt) : undefined;

    const documentRef = doc(db, COLLECTION_NAME, documentId);
    await updateDoc(documentRef, {
      'permissions.publicLink': {
        tokenHash,
        accessLevel: options.accessLevel,
        allowDownload: options.allowDownload ?? true,
        createdAt: now,
        ...(expiresTs ? { expiresAt: expiresTs } : {})
      },
      updatedAt: now
    } as unknown as Partial<FirestoreDocument>);

    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${base}/share/${documentId}/${token}`;
    return { url, token, expiresAt: options.expiresAt };
  }

  /**
   * Révoquer le lien public (supprimer les infos de publicLink)
   */
  static async revokeShareLink(documentId: string): Promise<void> {
    const documentRef = doc(db, COLLECTION_NAME, documentId);
    await updateDoc(documentRef, {
      'permissions.publicLink': null,
      updatedAt: Timestamp.now()
    } as unknown as Partial<FirestoreDocument>);
  }

  /**
   * Mettre à jour de manière atomique les paramètres du lien public
   * - expiresAt: Date | null (null pour retirer l'expiration)
   * - allowDownload: boolean
   * - accessLevel: 'view' | 'comment' | 'edit'
   */
  static async updateShareLinkSettings(
    documentId: string,
    updates: { expiresAt?: Date | null; allowDownload?: boolean; accessLevel?: 'view' | 'comment' | 'edit' }
  ): Promise<void> {
    const dRef = doc(db, COLLECTION_NAME, documentId);
    const snap = await getDoc(dRef);
    if (!snap.exists()) throw new Error('Document not found');
    const data = snap.data() as FirestoreDocument;
    if (!data.permissions?.publicLink) throw new Error('No public link to update');

    const updatePayload: Record<string, unknown> = { updatedAt: Timestamp.now() };
    if ('expiresAt' in updates) {
      updatePayload['permissions.publicLink.expiresAt'] = updates.expiresAt instanceof Date
        ? Timestamp.fromDate(updates.expiresAt)
        : updates.expiresAt === null
          ? null
          : undefined;
    }
    if (typeof updates.allowDownload === 'boolean') {
      updatePayload['permissions.publicLink.allowDownload'] = updates.allowDownload;
    }
    if (updates.accessLevel) {
      updatePayload['permissions.publicLink.accessLevel'] = updates.accessLevel;
    }

    await updateDoc(dRef, updatePayload as unknown as Partial<FirestoreDocument>);
  }

  /**
   * Valider un token client-side (vérification basique). Pour sécurité forte, implémenter côté Cloud Function.
   */
  static async validateShareLink(documentId: string, token: string): Promise<{ valid: boolean; reason?: string; accessLevel?: 'view' | 'comment' | 'edit'; allowDownload?: boolean }>{
    try {
      const tokenHash = await this.hashToken(token);
      // Optimisation: requête directe du doc par id
      // Ici on simplifie en récupérant le doc précis via getDocs(docRef) si vous avez util.
      const dRef = doc(db, COLLECTION_NAME, documentId);
      const snap = await getDoc(dRef);
      if (!snap.exists()) return { valid: false, reason: 'not_found' };
      const data = snap.data() as FirestoreDocument;
      const link = data?.permissions?.publicLink as PublicLinkFs | undefined | null;
      if (!link) return { valid: false, reason: 'no_link' };
      if (link.tokenHash !== tokenHash) return { valid: false, reason: 'bad_token' };
      if (link.expiresAt?.toDate && link.expiresAt.toDate() < new Date()) return { valid: false, reason: 'expired' };
      return { valid: true, accessLevel: link.accessLevel, allowDownload: link.allowDownload };
    } catch (e) {
      console.error('validateShareLink error', e);
      return { valid: false, reason: 'error' };
    }
  }

  /**
   * Ajouter un utilisateur avec rôle aux permissions
   */
  static async addSharedUser(documentId: string, userId: string, role: 'view' | 'comment' | 'edit'): Promise<void> {
    const dRef = doc(db, COLLECTION_NAME, documentId);
    const snap = await getDoc(dRef);
    const now = Timestamp.now();
    let sharedWith: Array<{ userId: string; role: 'view' | 'comment' | 'edit' }> = [];
    if (snap.exists()) {
      const data = snap.data() as FirestoreDocument;
      sharedWith = data?.permissions?.sharedWith || [];
    }
    const idx = sharedWith.findIndex(s => s.userId === userId);
    if (idx >= 0) sharedWith[idx].role = role; else sharedWith.push({ userId, role });
    await updateDoc(dRef, { 'permissions.sharedWith': sharedWith, updatedAt: now } as unknown as Partial<FirestoreDocument>);
  }

  /**
   * Retirer un utilisateur des permissions
   */
  static async removeSharedUser(documentId: string, userId: string): Promise<void> {
    const dRef = doc(db, COLLECTION_NAME, documentId);
    const snap = await getDoc(dRef);
    const now = Timestamp.now();
    let sharedWith: Array<{ userId: string; role: 'view' | 'comment' | 'edit' }> = [];
    if (snap.exists()) {
      const data = snap.data() as FirestoreDocument;
      sharedWith = (data?.permissions?.sharedWith || []).filter((s) => s.userId !== userId);
    }
    await updateDoc(dRef, { 'permissions.sharedWith': sharedWith, updatedAt: now } as unknown as Partial<FirestoreDocument>);
  }

  /**
   * Définir complètement l'objet permissions
   */
  static async setPermissions(documentId: string, permissions: NonNullable<Document['permissions']>): Promise<void> {
    const dRef = doc(db, COLLECTION_NAME, documentId);
    const payload: PermissionsFs = { ...permissions } as unknown as PermissionsFs;
    if (payload.publicLink) {
      const pl = payload.publicLink as Partial<{
        expiresAt: Timestamp | Date;
        createdAt: Timestamp | Date;
      }> & Omit<PublicLinkFs, 'expiresAt' | 'createdAt'>;
      if (pl.expiresAt instanceof Date) {
        pl.expiresAt = Timestamp.fromDate(pl.expiresAt);
      }
      if (pl.createdAt instanceof Date) {
        pl.createdAt = Timestamp.fromDate(pl.createdAt);
      }
    }
    await updateDoc(dRef, { permissions: payload, updatedAt: Timestamp.now() } as unknown as Partial<FirestoreDocument>);
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
          version: '1'
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
          version: '1'
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
          version: '2'
        },
        {
          name: 'Permis de construire',
          type: 'permit' as const,
          url: '#',
          size: 256000,
          uploadDate: new Date('2024-01-31'),
          tags: ['permis', 'construction', 'administratif'],
          description: 'Permis de construire officiel du projet',
          projectId: 'project-1',
          uploadedBy: 'Sophie Leroy',
          version: '1'
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
          version: '1'
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
