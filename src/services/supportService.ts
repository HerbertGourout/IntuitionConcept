import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export interface SupportTicket {
  id?: string;
  ticketNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general' | 'training';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  firstResponseAt?: Date;
  tags?: string[];
  attachments?: string[];
  satisfaction?: {
    rating: number; // 1-5
    feedback?: string;
    submittedAt: Date;
  };
}

export interface SupportMessage {
  id?: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorType: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  isInternal?: boolean;
  attachments?: string[];
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  role: 'agent' | 'senior_agent' | 'supervisor' | 'admin';
  specialties: string[];
  isOnline: boolean;
  currentTickets: number;
  maxTickets: number;
  languages: string[];
  avatar?: string;
}

export interface KnowledgeBaseArticle {
  id?: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  published: boolean;
}

class SupportService {
  // Créer un nouveau ticket
  async createTicket(ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> {
    try {
      const ticketNumber = this.generateTicketNumber();
      
      const newTicket: Omit<SupportTicket, 'id'> = {
        ...ticket,
        ticketNumber,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'supportTickets'), newTicket);
      
      // Auto-assigner à un agent disponible
      await this.autoAssignTicket(docRef.id);
      
      // Envoyer notification de création
      await this.sendTicketNotification(docRef.id, 'created');
      
      return docRef.id;
    } catch (error) {
      console.error('Erreur création ticket:', error);
      throw error;
    }
  }

  // Ajouter un message à un ticket
  async addMessage(message: Omit<SupportMessage, 'id' | 'timestamp'>): Promise<string> {
    try {
      const newMessage: Omit<SupportMessage, 'id'> = {
        ...message,
        timestamp: new Date()
      };

      const docRef = await addDoc(collection(db, 'supportMessages'), newMessage);
      
      // Mettre à jour le ticket
      await this.updateTicketStatus(message.ticketId, {
        updatedAt: new Date(),
        ...(message.authorType === 'agent' && !await this.hasAgentResponded(message.ticketId) && {
          firstResponseAt: new Date()
        })
      });

      return docRef.id;
    } catch (error) {
      console.error('Erreur ajout message:', error);
      throw error;
    }
  }

  // Mettre à jour un ticket
  async updateTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<void> {
    try {
      await updateDoc(doc(db, 'supportTickets', ticketId), {
        ...updates,
        updatedAt: new Date(),
        ...(updates.status === 'resolved' && { resolvedAt: new Date() })
      });
    } catch (error) {
      console.error('Erreur mise à jour ticket:', error);
      throw error;
    }
  }

  // Obtenir un ticket par ID
  async getTicket(ticketId: string): Promise<SupportTicket | null> {
    try {
      const docSnap = await getDoc(doc(db, 'supportTickets', ticketId));
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as SupportTicket : null;
    } catch (error) {
      console.error('Erreur récupération ticket:', error);
      return null;
    }
  }

  // Obtenir les messages d'un ticket
  async getTicketMessages(ticketId: string): Promise<SupportMessage[]> {
    try {
      const q = query(
        collection(db, 'supportMessages'),
        where('ticketId', '==', ticketId),
        orderBy('timestamp', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupportMessage[];
    } catch (error) {
      console.error('Erreur récupération messages:', error);
      return [];
    }
  }

  // Lister les tickets avec filtres
  async getTickets(filters: {
    userId?: string;
    status?: SupportTicket['status'];
    assignedTo?: string;
    category?: SupportTicket['category'];
    priority?: SupportTicket['priority'];
    limit?: number;
  }): Promise<SupportTicket[]> {
    try {
      let q = collection(db, 'supportTickets');

      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId)) as any;
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status)) as any;
      }
      if (filters.assignedTo) {
        q = query(q, where('assignedTo', '==', filters.assignedTo)) as any;
      }
      if (filters.category) {
        q = query(q, where('category', '==', filters.category)) as any;
      }
      if (filters.priority) {
        q = query(q, where('priority', '==', filters.priority)) as any;
      }

      q = query(q, orderBy('createdAt', 'desc')) as any;

      if (filters.limit) {
        q = query(q, limit(filters.limit)) as any;
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupportTicket[];
    } catch (error) {
      console.error('Erreur récupération tickets:', error);
      return [];
    }
  }

  // Auto-assigner un ticket à un agent
  private async autoAssignTicket(ticketId: string): Promise<void> {
    try {
      const agents = await this.getAvailableAgents();
      if (agents.length === 0) return;

      // Trouver l'agent avec le moins de tickets
      const bestAgent = agents.reduce((prev, current) => 
        prev.currentTickets < current.currentTickets ? prev : current
      );

      await this.updateTicket(ticketId, {
        assignedTo: bestAgent.id,
        status: 'in_progress'
      });
    } catch (error) {
      console.error('Erreur auto-assignation:', error);
    }
  }

  // Obtenir les agents disponibles
  async getAvailableAgents(): Promise<SupportAgent[]> {
    // Simulation - en production, récupérer depuis Firebase
    return [
      {
        id: 'agent_1',
        name: 'Sophie Martin',
        email: 'sophie.martin@intuitionconcept.com',
        role: 'senior_agent',
        specialties: ['technical', 'billing'],
        isOnline: true,
        currentTickets: 3,
        maxTickets: 10,
        languages: ['fr', 'en'],
        avatar: 'https://via.placeholder.com/40'
      },
      {
        id: 'agent_2',
        name: 'Thomas Dubois',
        email: 'thomas.dubois@intuitionconcept.com',
        role: 'agent',
        specialties: ['feature_request', 'training'],
        isOnline: true,
        currentTickets: 5,
        maxTickets: 8,
        languages: ['fr'],
        avatar: 'https://via.placeholder.com/40'
      },
      {
        id: 'agent_3',
        name: 'Marie Diallo',
        email: 'marie.diallo@intuitionconcept.com',
        role: 'supervisor',
        specialties: ['bug_report', 'technical'],
        isOnline: false,
        currentTickets: 2,
        maxTickets: 12,
        languages: ['fr', 'en', 'wo'],
        avatar: 'https://via.placeholder.com/40'
      }
    ];
  }

  // Rechercher dans la base de connaissances
  async searchKnowledgeBase(query: string, category?: string): Promise<KnowledgeBaseArticle[]> {
    // Simulation - en production, utiliser une recherche full-text
    const mockArticles: KnowledgeBaseArticle[] = [
      {
        id: 'kb_1',
        title: 'Comment créer un nouveau projet BTP',
        content: 'Pour créer un nouveau projet, cliquez sur le bouton "Nouveau Projet" dans le dashboard...',
        category: 'getting_started',
        tags: ['projet', 'création', 'débutant'],
        views: 245,
        helpful: 23,
        notHelpful: 2,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-02-10'),
        authorId: 'admin_1',
        published: true
      },
      {
        id: 'kb_2',
        title: 'Utilisation de la signature électronique',
        content: 'La signature électronique permet de faire signer vos devis et contrats...',
        category: 'features',
        tags: ['signature', 'électronique', 'devis', 'contrat'],
        views: 189,
        helpful: 31,
        notHelpful: 1,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-03-05'),
        authorId: 'admin_1',
        published: true
      },
      {
        id: 'kb_3',
        title: 'Résolution des problèmes de synchronisation',
        content: 'Si vous rencontrez des problèmes de synchronisation...',
        category: 'troubleshooting',
        tags: ['synchronisation', 'problème', 'résolution'],
        views: 156,
        helpful: 18,
        notHelpful: 4,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-02-15'),
        authorId: 'agent_1',
        published: true
      }
    ];

    // Filtrer par catégorie si spécifiée
    let results = category 
      ? mockArticles.filter(article => article.category === category)
      : mockArticles;

    // Filtrer par terme de recherche
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(article =>
        article.title.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    return results.sort((a, b) => b.views - a.views);
  }

  // Soumettre une évaluation de satisfaction
  async submitSatisfactionRating(ticketId: string, rating: number, feedback?: string): Promise<void> {
    try {
      await this.updateTicket(ticketId, {
        satisfaction: {
          rating,
          feedback,
          submittedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Erreur soumission satisfaction:', error);
      throw error;
    }
  }

  // Obtenir les statistiques de support
  async getSupportStats(): Promise<{
    totalTickets: number;
    openTickets: number;
    avgResponseTime: number; // en heures
    avgResolutionTime: number; // en heures
    satisfactionScore: number; // 1-5
    ticketsByCategory: Record<string, number>;
    ticketsByPriority: Record<string, number>;
  }> {
    // Simulation - en production, calculer depuis les vraies données
    return {
      totalTickets: 1247,
      openTickets: 23,
      avgResponseTime: 2.5,
      avgResolutionTime: 18.3,
      satisfactionScore: 4.2,
      ticketsByCategory: {
        technical: 45,
        billing: 12,
        feature_request: 18,
        bug_report: 8,
        general: 15,
        training: 22
      },
      ticketsByPriority: {
        low: 35,
        medium: 48,
        high: 15,
        urgent: 2
      }
    };
  }

  // Méthodes utilitaires privées
  private generateTicketNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `IC-${timestamp}-${random}`.toUpperCase();
  }

  private async updateTicketStatus(ticketId: string, updates: Partial<SupportTicket>): Promise<void> {
    try {
      await updateDoc(doc(db, 'supportTickets', ticketId), updates);
    } catch (error) {
      console.error('Erreur mise à jour statut ticket:', error);
    }
  }

  private async hasAgentResponded(ticketId: string): Promise<boolean> {
    try {
      const messages = await this.getTicketMessages(ticketId);
      return messages.some(msg => msg.authorType === 'agent');
    } catch (error) {
      return false;
    }
  }

  private async sendTicketNotification(ticketId: string, type: 'created' | 'updated' | 'resolved'): Promise<void> {
    // Simulation - en production, envoyer des emails/notifications
    console.log(`Notification ${type} pour ticket ${ticketId}`);
  }

  // Obtenir les suggestions automatiques basées sur le contenu
  async getSuggestedSolutions(description: string): Promise<KnowledgeBaseArticle[]> {
    
    const keywords = description.toLowerCase().split(' ');
    const articles = await this.searchKnowledgeBase('');
    
    return articles.filter(article => 
      keywords.some(keyword => 
        article.title.toLowerCase().includes(keyword) ||
        article.tags.some(tag => tag.toLowerCase().includes(keyword))
      )
    ).slice(0, 3);
  }
}

export const supportService = new SupportService();
export default supportService;
