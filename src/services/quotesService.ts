import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy, 
    where,
    Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Interface pour les devis (compatible avec QuoteCreatorSimple)
export interface Quote {
    id: string;
    title: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    projectType: string;
    phases: Phase[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
    validityDays: number;
    notes: string;
    paymentTerms: string;
    createdAt: string;
    updatedAt: string;
}

export interface Phase {
    id: string;
    name: string;
    description: string;
    tasks: Task[];
    totalPrice: number;
    expanded: boolean;
}

export interface Task {
    id: string;
    name: string;
    description: string;
    articles: Article[];
    totalPrice: number;
    expanded: boolean;
}

export interface Article {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
}

const QUOTES_COLLECTION = 'quotes';

/**
 * Service Firebase pour la gestion des devis
 */
export class QuotesService {
    
    /**
     * Créer un nouveau devis dans Firebase
     */
    static async createQuote(quote: Omit<Quote, 'id'>): Promise<string> {
        try {
            const quoteData = {
                ...quote,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };
            
            const docRef = await addDoc(collection(db, QUOTES_COLLECTION), quoteData);
            console.log('Devis créé avec ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Erreur lors de la création du devis:', error);
            throw new Error('Impossible de créer le devis');
        }
    }

    /**
     * Récupérer tous les devis
     */
    static async getAllQuotes(): Promise<Quote[]> {
        try {
            const q = query(
                collection(db, QUOTES_COLLECTION), 
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const quotes: Quote[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                quotes.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
                } as Quote);
            });
            
            return quotes;
        } catch (error) {
            console.error('Erreur lors de la récupération des devis:', error);
            throw new Error('Impossible de récupérer les devis');
        }
    }

    /**
     * Récupérer les devis par statut
     */
    static async getQuotesByStatus(status: string): Promise<Quote[]> {
        try {
            const q = query(
                collection(db, QUOTES_COLLECTION),
                where('status', '==', status),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const quotes: Quote[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                quotes.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
                } as Quote);
            });
            
            return quotes;
        } catch (error) {
            console.error('Erreur lors de la récupération des devis par statut:', error);
            throw new Error('Impossible de récupérer les devis');
        }
    }

    /**
     * Mettre à jour un devis
     */
    static async updateQuote(quoteId: string, updates: Partial<Quote>): Promise<void> {
        try {
            const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
            const updateData = {
                ...updates,
                updatedAt: Timestamp.now()
            };
            
            await updateDoc(quoteRef, updateData);
            console.log('Devis mis à jour:', quoteId);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du devis:', error);
            throw new Error('Impossible de mettre à jour le devis');
        }
    }

    /**
     * Supprimer un devis
     */
    static async deleteQuote(quoteId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, QUOTES_COLLECTION, quoteId));
            console.log('Devis supprimé:', quoteId);
        } catch (error) {
            console.error('Erreur lors de la suppression du devis:', error);
            throw new Error('Impossible de supprimer le devis');
        }
    }

    /**
     * Rechercher des devis par nom de client
     */
    static async searchQuotesByClient(clientName: string): Promise<Quote[]> {
        try {
            // Note: Firestore ne supporte pas les recherches textuelles complexes
            // Cette méthode récupère tous les devis et filtre côté client
            const allQuotes = await this.getAllQuotes();
            
            return allQuotes.filter(quote => 
                quote.clientName.toLowerCase().includes(clientName.toLowerCase())
            );
        } catch (error) {
            console.error('Erreur lors de la recherche de devis:', error);
            throw new Error('Impossible de rechercher les devis');
        }
    }
}

export default QuotesService;
