import { aiConfig } from './aiConfig';
import { openaiService } from './openaiService';

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    projectId?: string;
    quoteId?: string;
    actionType?: string;
    confidence?: number;
  };
}

export interface CopilotContext {
  projects: Array<{
    id: string;
    name: string;
    status: string;
    budget: number;
    spent: number;
    startDate: string;
    endDate?: string;
  }>;
  quotes: Array<{
    id: string;
    title: string;
    clientName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    description: string;
    vendorName: string;
    date: string;
    projectId?: string;
  }>;
  currentUser: {
    name: string;
    role: string;
    permissions: string[];
  };
  currentProject?: {
    id: string;
    name: string;
  };
}

export interface CopilotAction {
  label: string;
  action: string;
}

export interface CopilotResponse {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  confidence: number;
  suggestedActions: CopilotAction[];
}

class AICopilot {
  private conversationHistory: CopilotMessage[] = [];

  async processMessage(message: string, context: CopilotContext): Promise<CopilotResponse> {
    try {
      // Utiliser OpenAI si configuré, sinon utiliser les règles
      if (aiConfig.copilot.enabled && aiConfig.openaiApiKey) {
        return await this.processWithOpenAI(message, context);
      }
      
      // Fallback vers le système de règles
      return await this.processWithRules(message, context);
    } catch (error) {
      console.error('Erreur lors du traitement du message:', error);
      return {
        message: 'Désolé, je rencontre une difficulté technique. Pouvez-vous réessayer ?',
        type: 'error',
        confidence: 0,
        suggestedActions: []
      };
    }
  }

  private async processWithOpenAI(message: string, context: CopilotContext): Promise<CopilotResponse> {
    try {
      const aiResponse = await openaiService.processCopilotQuery(message, context);
      
      return {
        message: aiResponse,
        type: 'success',
        confidence: 90,
        suggestedActions: this.generateContextualActions(message, context)
      };
    } catch (error) {
      console.error('Erreur OpenAI:', error);
      // Fallback vers les règles en cas d'erreur
      return await this.processWithRules(message, context);
    }
  }
  
  private async processWithRules(message: string, context: CopilotContext): Promise<CopilotResponse> {
    // Détection d'intention simple
    const lowerMessage = message.toLowerCase();
    
    // Statut du projet
    if (lowerMessage.includes('statut') || lowerMessage.includes('avancement') || lowerMessage.includes('état')) {
      return this.handleProjectStatus(context);
    }
    
    // Budget et finances
    if (lowerMessage.includes('budget') || lowerMessage.includes('coût') || lowerMessage.includes('dépense')) {
      return this.handleFinancialSummary(context);
    }
    
    // Devis
    if (lowerMessage.includes('devis') || lowerMessage.includes('quote')) {
      return this.handleQuoteInquiry(context);
    }
    
    // Aide
    if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
      return this.handleHelp();
    }
    
    // Réponse générale
    return this.handleGeneralQuery(message, context);
  }
  
  private generateContextualActions(message: string, context: CopilotContext): CopilotAction[] {
    const actions: CopilotAction[] = [];
    
    // Actions basées sur le contexte
    if (context.currentProject) {
      actions.push({ label: 'Voir le projet', action: 'show_project' });
    }
    
    // Actions basées sur le message
    if (message.toLowerCase().includes('devis') || message.toLowerCase().includes('quote')) {
      actions.push({ label: 'Créer un devis', action: 'create_quote' });
    }
    
    if (message.toLowerCase().includes('budget') || message.toLowerCase().includes('coût')) {
      actions.push({ label: 'Voir le budget', action: 'show_budget' });
    }
    
    return actions;
  }

  private handleProjectStatus(context: CopilotContext): CopilotResponse {
    const activeProjects = context.projects.filter(p => p.status === 'active');
    const totalBudget = activeProjects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = activeProjects.reduce((sum, p) => sum + p.spent, 0);
    
    return {
      message: `📊 **État de vos projets:**\n\n• ${activeProjects.length} projet(s) actif(s)\n• Budget total: ${totalBudget.toLocaleString()} FCFA\n• Dépensé: ${totalSpent.toLocaleString()} FCFA\n• Reste: ${(totalBudget - totalSpent).toLocaleString()} FCFA`,
      type: 'info',
      confidence: 95,
      suggestedActions: [
        { label: 'Voir détails', action: 'show_project_details' },
        { label: 'Ajouter dépense', action: 'add_expense' }
      ]
    };
  }

  private handleFinancialSummary(context: CopilotContext): CopilotResponse {
    const totalRevenue = context.quotes
      .filter(q => q.status === 'accepted')
      .reduce((sum, q) => sum + q.totalAmount, 0);
    
    const totalExpenses = context.transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      message: `💰 **Résumé financier:**\n\n• Revenus: ${totalRevenue.toLocaleString()} FCFA\n• Dépenses: ${totalExpenses.toLocaleString()} FCFA\n• Bénéfice: ${(totalRevenue - totalExpenses).toLocaleString()} FCFA`,
      type: 'success',
      confidence: 90,
      suggestedActions: [
        { label: 'Voir détails', action: 'show_financial_details' },
        { label: 'Exporter rapport', action: 'export_financial_report' }
      ]
    };
  }

  private handleQuoteInquiry(context: CopilotContext): CopilotResponse {
    const pendingQuotes = context.quotes.filter(q => q.status === 'sent' || q.status === 'draft');
    const acceptedQuotes = context.quotes.filter(q => q.status === 'accepted');
    
    return {
      message: `📋 **Vos devis:**\n\n• ${pendingQuotes.length} devis en attente\n• ${acceptedQuotes.length} devis acceptés\n• Valeur totale acceptée: ${acceptedQuotes.reduce((sum, q) => sum + q.totalAmount, 0).toLocaleString()} FCFA`,
      type: 'info',
      confidence: 95,
      suggestedActions: [
        { label: 'Créer un devis', action: 'create_quote' },
        { label: 'Voir tous les devis', action: 'show_all_quotes' }
      ]
    };
  }

  private handleHelp(): CopilotResponse {
    return {
      message: `🤖 **Je peux vous aider avec:**\n\n• Statut et avancement des projets\n• Résumé financier et budget\n• Gestion des devis\n• Analyse des dépenses\n• Création de rapports\n\nPosez-moi une question ou demandez-moi d'effectuer une action !`,
      type: 'info',
      confidence: 100,
      suggestedActions: [
        { label: 'Voir projets', action: 'show_projects' },
        { label: 'Créer devis', action: 'create_quote' },
        { label: 'Voir finances', action: 'show_finances' }
      ]
    };
  }

  private handleGeneralQuery(message: string, context: CopilotContext): CopilotResponse {
    const projectName = context.currentProject?.name || 'votre projet';
    
    return {
      message: `Je comprends votre question sur ${projectName}. Pouvez-vous être plus spécifique ? Je peux vous aider avec :\n\n• L'état d'avancement du projet\n• Les finances et le budget\n• Les devis et factures\n• La planification des tâches\n• L'analyse des fournisseurs`,
      type: 'info',
      confidence: 60,
      suggestedActions: [
        { label: 'Voir l\'avancement', action: 'show_progress' },
        { label: 'Consulter le budget', action: 'show_budget' },
        { label: 'Créer un devis', action: 'create_quote' }
      ]
    };
  }
}

export const aiCopilot = new AICopilot();
