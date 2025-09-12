import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, Query, CollectionReference, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';

export interface SignatureRequest {
  id?: string;
  documentId: string;
  documentType: 'quote' | 'contract' | 'invoice' | 'purchase_order';
  documentTitle: string;
  signerEmail: string;
  signerName: string;
  companyName?: string;
  status: 'pending' | 'sent' | 'signed' | 'declined' | 'expired';
  createdAt: Date;
  sentAt?: Date;
  signedAt?: Date;
  expiresAt: Date;
  signatureUrl?: string;
  documentUrl: string;
  metadata?: Record<string, unknown>;
}

export interface SignatureField {
  id: string;
  type: 'signature' | 'initial' | 'date' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required: boolean;
  signerEmail: string;
}

export interface SignedDocument {
  id: string;
  originalDocumentId: string;
  signedDocumentUrl: string;
  signatures: Array<{
    signerEmail: string;
    signedAt: Date;
    ipAddress: string;
    signatureImageUrl: string;
  }>;
  auditTrail: Array<{
    action: string;
    timestamp: Date;
    details: string;
  }>;
}

class SignatureService {
  private baseUrl = 'https://api.docusign.com'; // Ou HelloSign API

  // Créer une demande de signature
  async createSignatureRequest(request: Omit<SignatureRequest, 'id' | 'createdAt' | 'status' | 'expiresAt'>): Promise<string> {
    try {
      const signatureRequest: SignatureRequest = {
        ...request,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
      };

      const docRef = await addDoc(collection(db, 'signatureRequests'), signatureRequest);
      
      // Ajouter à l'audit trail
      await this.addAuditEntry(docRef.id, 'created', 'Demande de signature créée');
      
      return docRef.id;
    } catch (error) {
      console.error('Erreur création demande signature:', error);
      throw error;
    }
  }

  // Envoyer la demande de signature par email
  async sendSignatureRequest(requestId: string, fields: SignatureField[]): Promise<void> {
    try {
      // Simulation d'envoi via DocuSign/HelloSign API
      const requestDoc = await getDoc(doc(db, 'signatureRequests', requestId));
      if (!requestDoc.exists()) {
        throw new Error('Demande de signature introuvable');
      }

      const request = requestDoc.data() as SignatureRequest;

      // Préparer les données pour l'API de signature
      const signatureData = {
        document_url: request.documentUrl,
        signers: [{
          email: request.signerEmail,
          name: request.signerName,
          company: request.companyName
        }],
        fields: fields,
        subject: `Signature requise: ${request.documentTitle}`,
        message: `Bonjour ${request.signerName},\n\nVeuillez signer le document "${request.documentTitle}".\n\nCordialement,\nÉquipe IntuitionConcept`
      };

      // Appel API (simulation)
      console.log('Envoi demande signature:', signatureData);
      
      // Mettre à jour le statut
      await updateDoc(doc(db, 'signatureRequests', requestId), {
        status: 'sent',
        sentAt: new Date()
      });

      await this.addAuditEntry(requestId, 'sent', `Demande envoyée à ${request.signerEmail}`);

    } catch (error) {
      console.error('Erreur envoi signature:', error);
      throw error;
    }
  }

  // Récupérer le statut d'une demande
  async getSignatureStatus(requestId: string): Promise<Record<string, unknown> | null> {
    try {
      const docSnapshot = await getDoc(doc(db, 'signatureRequests', requestId));
      return docSnapshot.exists() ? { id: docSnapshot.id, ...docSnapshot.data() } : null;
    } catch (error) {
      console.error('Erreur récupération statut:', error);
      return null;
    }
  }

  // Lister les demandes de signature
  async getSignatureRequests(filters?: { 
    status?: SignatureRequest['status'];
    documentType?: SignatureRequest['documentType'];
  }): Promise<SignatureRequest[]> {
    try {
      const baseCollection = collection(db, 'signatureRequests');
      let q: Query<DocumentData> | CollectionReference<DocumentData> = baseCollection;
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      if (filters?.documentType) {
        q = query(q, where('documentType', '==', filters.documentType));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SignatureRequest[];
    } catch (error) {
      console.error('Erreur récupération demandes:', error);
      return [];
    }
  }

  // Traiter une signature reçue (webhook)
  async processSignature(requestId: string, signatureData: {
    signerEmail: string;
    signedAt: Date;
    signatureImageUrl: string;
    signedDocumentUrl: string;
    ipAddress: string;
  }): Promise<void> {
    try {
      // Mettre à jour la demande
      await updateDoc(doc(db, 'signatureRequests', requestId), {
        status: 'signed',
        signedAt: signatureData.signedAt,
        signatureUrl: signatureData.signatureImageUrl
      });

      // Créer l'enregistrement du document signé
      const signedDoc: Omit<SignedDocument, 'id'> = {
        originalDocumentId: requestId,
        signedDocumentUrl: signatureData.signedDocumentUrl,
        signatures: [{
          signerEmail: signatureData.signerEmail,
          signedAt: signatureData.signedAt,
          ipAddress: signatureData.ipAddress,
          signatureImageUrl: signatureData.signatureImageUrl
        }],
        auditTrail: []
      };

      await addDoc(collection(db, 'signedDocuments'), signedDoc);
      await this.addAuditEntry(requestId, 'signed', `Document signé par ${signatureData.signerEmail}`);

    } catch (error) {
      console.error('Erreur traitement signature:', error);
      throw error;
    }
  }

  // Annuler une demande de signature
  async cancelSignatureRequest(requestId: string): Promise<Record<string, unknown>> {
    try {
      await updateDoc(doc(db, 'signatureRequests', requestId), {
        status: 'declined'
      });

      await this.addAuditEntry(requestId, 'cancelled', `Demande annulée`);
      
      return { success: true, requestId, status: 'cancelled' };
    } catch (error) {
      console.error('Erreur annulation signature:', error);
      throw error;
    }
  }

  // Ajouter une entrée d'audit
  private async addAuditEntry(requestId: string, action: string, details: string): Promise<void> {
    try {
      const auditEntry = {
        requestId,
        action,
        details,
        timestamp: new Date(),
        userAgent: navigator.userAgent
      };

      await addDoc(collection(db, 'signatureAudit'), auditEntry);
    } catch (error) {
      console.error('Erreur ajout audit:', error);
    }
  }

  // Générer un lien de signature temporaire
  generateSignatureLink(requestId: string): string {
    // En production, ceci serait un lien sécurisé avec token
    return `${window.location.origin}/signature/${requestId}`;
  }

  // Vérifier la validité d'une signature
  async verifySignature(signedDocumentId: string): Promise<{
    isValid: boolean;
    details: {
      signedAt: Date;
      signerEmail: string;
      ipAddress: string;
      documentHash?: string;
    };
  }> {
    try {
      const docSnapshot = await getDoc(doc(db, 'signedDocuments', signedDocumentId));
      if (!docSnapshot.exists()) {
        return { 
          isValid: false, 
          details: {
            signedAt: new Date(),
            signerEmail: '',
            ipAddress: ''
          }
        };
      }

      const signedDoc = docSnapshot.data() as SignedDocument;
      const signature = signedDoc.signatures[0]; // Premier signataire

      return {
        isValid: true,
        details: {
          signedAt: signature.signedAt,
          signerEmail: signature.signerEmail,
          ipAddress: signature.ipAddress
        }
      };
    } catch (error) {
      console.error('Erreur vérification signature:', error);
      return { 
        isValid: false, 
        details: {
          signedAt: new Date(),
          signerEmail: '',
          ipAddress: ''
        }
      };
    }
  }
}

export const signatureService = new SignatureService();
export default signatureService;
