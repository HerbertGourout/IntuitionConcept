import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    getDoc,
    setDoc,
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy, 
    where,
    Timestamp,
    onSnapshot,
    QuerySnapshot,
    Unsubscribe,
    DocumentData,
    runTransaction
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Phase } from '../types/StructuredQuote';

// Interface pour les devis (compatible avec QuoteCreatorSimple)
export interface Quote {
    id: string;
    reference?: string;
    title: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    companyName: string;
    projectType: string;
    phases: Phase[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    discountRate?: number;
    discountAmount?: number;
    status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
    validityDays: number;
    validUntil: string;
    paymentTerms?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

const QUOTES_COLLECTION = 'quotes';

/**
 * Service Firebase pour la gestion des devis
 */
export class QuotesService {
    
    /**
     * Génère une référence de devis cohérente et séquentielle du type QU-YYYYMM-####
     * Utilise un compteur transactionnel dans Firestore: collection `counters`, doc `quotes_YYYYMM`.
     */
    static async generateNextQuoteReference(date: Date = new Date()): Promise<string> {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const period = `${year}${month}`; // YYYYMM
        const counterDocRef = doc(db, 'counters', `quotes_${period}`);

        const seq = await runTransaction(db, async (tx) => {
            const snap = await tx.get(counterDocRef);
            if (!snap.exists()) {
                tx.set(counterDocRef, { last: 1, period });
                return 1;
            }
            const current = (snap.data().last as number) || 0;
            const next = current + 1;
            tx.update(counterDocRef, { last: next });
            return next;
        });

        const padded = `${seq}`.padStart(4, '0');
        return `QU-${period}-${padded}`;
    }

    /**
     * Créer un nouveau devis dans Firebase
     */
    static async createQuote(quote: Omit<Quote, 'id'>): Promise<string> {
        try {
            // Ne jamais stocker un champ "id" dans le document Firestore
            // même si on nous passe un objet contenant potentiellement un id accidentellement.
            // On s'assure ici que le payload ne contient pas de clé id.
            const { /* id: _ignoredId, */ ...safeQuote } = (quote as unknown) as Record<string, unknown>;

            // Assigner une référence si absente
            let reference = (safeQuote as Partial<Quote>).reference;
            if (!reference) {
                reference = await this.generateNextQuoteReference(new Date());
            }

            const quoteData = {
                ...(safeQuote as Omit<Quote, 'id'>),
                reference,
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
     * Récupérer un devis par ID
     */
    static async getQuoteById(id: string): Promise<Quote | null> {
        try {
            const ref = doc(db, QUOTES_COLLECTION, id);
            const snap = await getDoc(ref);
            if (!snap.exists()) return null;
            const data = snap.data() as DocumentData;
            return {
                ...data,
                id: snap.id, // s'assurer que l'id du document Firestore prévaut
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
            } as Quote;
        } catch (error) {
            console.error('Erreur lors de la récupération du devis par ID:', error);
            throw new Error('Impossible de récupérer le devis');
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
                    ...data,
                    id: doc.id, // id en dernier pour éviter d'être écrasé par data.id
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
     * S'abonner en temps réel à la liste des devis (trié par date de création desc)
     */
    static subscribeToQuotes(callback: (quotes: Quote[]) => void): Unsubscribe {
        const q = query(
            collection(db, QUOTES_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, 
            (snapshot: QuerySnapshot) => {
                try {
                    const quotes: Quote[] = snapshot.docs.map((d) => {
                        const data = d.data() as DocumentData;
                        return {
                            ...data,
                            id: d.id, // id en dernier
                            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
                        } as Quote;
                    });
                    callback(quotes);
                } catch (processingError) {
                    console.error('Erreur lors du traitement des données des devis:', processingError);
                    callback([]); // Fallback avec tableau vide
                }
            },
            (error) => {
                console.error('Erreur Firestore lors de l\'écoute des devis:', error);
                if (error.code === 'permission-denied') {
                    console.warn('Permissions insuffisantes pour écouter les devis');
                } else if (error.code === 'unavailable') {
                    console.warn('Service Firestore temporairement indisponible');
                }
                callback([]); // Fallback avec tableau vide
            }
        );
    }

    /**
     * S'abonner en temps réel au compteur total des devis
     */
    static subscribeToQuoteCount(callback: (count: number) => void): Unsubscribe {
        const q = query(
            collection(db, QUOTES_COLLECTION)
        );
        return onSnapshot(q, 
            (snapshot: QuerySnapshot) => {
                try {
                    callback(snapshot.size);
                } catch (processingError) {
                    console.error('Erreur lors du traitement du compteur de devis:', processingError);
                    callback(0); // Fallback avec 0
                }
            },
            (error) => {
                console.error('Erreur Firestore lors de l\'écoute du compteur de devis:', error);
                if (error.code === 'permission-denied') {
                    console.warn('Permissions insuffisantes pour compter les devis');
                } else if (error.code === 'unavailable') {
                    console.warn('Service Firestore temporairement indisponible');
                }
                callback(0); // Fallback avec 0
            }
        );
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
            // Ne jamais pousser 'id' (ou écraser createdAt) dans Firestore
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _ignoredId, createdAt: _ignoredCreatedAt, ...rest } = (updates as Partial<Quote>);
            const updateData = {
                ...rest,
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
            const docRef = doc(db, QUOTES_COLLECTION, quoteId);
            await deleteDoc(docRef);
            console.log('Devis supprimé avec succès:', quoteId);
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

    /**
     * Sauvegarder un devis (créer ou mettre à jour selon l'existence dans Firebase)
     */
    static async saveQuote(quote: Quote): Promise<string> {
        try {
            // Si le devis a un ID, vérifier s'il existe dans Firebase
            if (quote.id && quote.id.length > 0) {
                try {
                    const docRef = doc(db, QUOTES_COLLECTION, quote.id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        // Le document existe, on le met à jour (exclure l'ID)
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { id: _id, ...updateData } = quote as Quote;
                        await this.updateQuote(quote.id, updateData as Partial<Omit<Quote, 'id'>>);
                        return quote.id;
                    } else {
                        // Le document n'existe pas, on le crée avec l'ID spécifié
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { id: _id, ...rest } = quote as Quote;
                        const quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'> & { createdAt: Timestamp; updatedAt: Timestamp } = {
                            ...(rest as Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>),
                            createdAt: Timestamp.now(),
                            updatedAt: Timestamp.now()
                        };
                        await setDoc(docRef, quoteData as unknown as DocumentData);
                        return quote.id;
                    }
                } catch (checkError) {
                    console.error('Erreur lors de la vérification du document:', checkError);
                    // En cas d'erreur de vérification, essayer de créer un nouveau document
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id: _id, ...quoteWithoutId } = quote as Quote;
                    const newId = await this.createQuote(quoteWithoutId as Omit<Quote, 'id'>);
                    return newId;
                }
            } else {
                // Pas d'ID, créer un nouveau devis
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id: _id, ...quoteWithoutId } = quote as Quote;
                const newId = await this.createQuote(quoteWithoutId as Omit<Quote, 'id'>);
                return newId;
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du devis:', error);
            throw new Error('Impossible de sauvegarder le devis');
        }
    }
}

export default QuotesService;
