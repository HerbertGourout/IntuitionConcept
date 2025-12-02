// AI Copilot service for intelligent assistance

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
  currentProject: {
    id: string;
    name: string;
    status: string;
    budget: number;
    spent: number;
    startDate: string;
    endDate?: string;
  } | null;
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
  } | null;
  activeSection: string;
  userRole: string;
}

export interface CopilotResponse {
  message: string;
  suggestedActions?: Array<{
    id: string;
    label: string;
    type: 'create_quote' | 'create_project' | 'export_data' | 'view_details' | 'navigate';
    params?: Record<string, unknown>;
  }>;
  relatedData?: Array<{
    type: 'project' | 'quote' | 'transaction';
    id: string;
    title: string;
    summary: string;
  }>;
  confidence: number;
}

class AICopilot {
  private conversationHistory: CopilotMessage[] = [];

  async processMessage(message: string, context: CopilotContext): Promise<CopilotResponse> {
    try {
      const intent = await this.analyzeIntent(message);
      
      // Générer la réponse basée sur l'intention et le contexte
      return await this.generateResponse(message, intent, context);
    } catch (error) {
      console.error('Erreur lors du traitement du message:', error);
      return {
        message: 'Désolé, je rencontre une difficulté technique. Pouvez-vous réessayer ?',
        confidence: 0,
        suggestedActions: []
      };
    }
  }

  async processQuery(query: string): Promise<CopilotResponse> {
    // Get context from current project and user state
    const context: CopilotContext = {
      currentProject: null,
      projects: [],
      quotes: [],
      transactions: [],
      currentUser: null,
      activeSection: 'dashboard',
      userRole: 'user'
    };
    // Ajouter le message utilisateur à l'historique
    const userMessage: CopilotMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };
    this.conversationHistory.push(userMessage);

    try {
      // Analyser l'intention de la requête
      const intent = await this.analyzeIntent(query);
      
      // Générer la réponse basée sur l'intention et le contexte
      const response = await this.generateResponse(query, intent, context);
      
      // Ajouter la réponse à l'historique
      const assistantMessage: CopilotMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: response.confidence
        }
      };
      this.conversationHistory.push(assistantMessage);

      return response;
    } catch (error) {
      console.error('Erreur lors du traitement de la requête:', error);
      return {
        message: "Désolé, je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?",
        confidence: 0
      };
    }
  }

  private async analyzeIntent(query: string): Promise<{
    type: string;
    entities: Record<string, unknown>;
    confidence: number;
  }> {
    const lowerQuery = query.toLowerCase();
    
    // Intentions de base avec patterns
    const intents = [
      {
        type: 'project_status',
        patterns: ['statut', 'état', 'avancement', 'projet', 'comment va'],
        confidence: 0.8
      },
      {
        type: 'financial_summary',
        patterns: ['budget', 'coût', 'dépense', 'argent', 'financier', 'combien', 'reste', 'dépenser', 'finaliser'],
        confidence: 0.8
      },
      {
        type: 'quote_inquiry',
        patterns: ['devis', 'estimation', 'prix', 'tarif', 'quote'],
        confidence: 0.8
      },
      {
        type: 'vendor_analysis',
        patterns: ['fournisseur', 'prestataire', 'vendor', 'supplier'],
        confidence: 0.7
      },
      {
        type: 'timeline_query',
        patterns: ['délai', 'planning', 'calendrier', 'quand', 'date'],
        confidence: 0.7
      },
      {
        type: 'create_request',
        patterns: ['créer', 'nouveau', 'ajouter', 'faire', 'creer'],
        confidence: 0.6
      },
      {
        type: 'help_request',
        patterns: ['aide', 'help', 'comment', 'expliquer'],
        confidence: 0.5
      }
    ];

    // Trouver l'intention la plus probable
    let bestMatch = { type: 'general_query', confidence: 0.1, entities: {} };
    
    for (const intent of intents) {
      const matches = intent.patterns.filter(pattern => 
        lowerQuery.includes(pattern)
      ).length;
      
      if (matches > 0) {
        // Améliorer le calcul de confiance - donner plus de poids aux correspondances
        const confidence = Math.min(0.95, intent.confidence * (matches * 0.5 + 0.5));
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            type: intent.type,
            confidence,
            entities: this.extractEntities(query)
          };
        }
      }
    }
    
    // Debug logging
    console.log('Query:', query);
    console.log('Best match:', bestMatch);

    return bestMatch;
  }

  private extractEntities(query: string): Record<string, unknown> {
    const entities: Record<string, unknown> = {};

    // Extraction d'entités basiques
    const numberMatch = query.match(/\d+/g);
    if (numberMatch) {
      entities.numbers = numberMatch.map(n => parseInt(n));
    }

    // Extraction de noms de projets potentiels
    const projectKeywords = ['projet', 'chantier', 'construction', 'rénovation'];
    projectKeywords.forEach(keyword => {
      if (query.toLowerCase().includes(keyword)) {
        entities.projectType = keyword;
      }
    });

    return entities;
  }

  private async generateResponse(
    query: string,
    intent: { type: string; entities: Record<string, unknown>; confidence: number },
    context: CopilotContext
  ): Promise<CopilotResponse> {
    
    switch (intent.type) {
      case 'project_status':
        return this.handleProjectStatusQuery(query, context);
      
      case 'financial_summary':
        return this.handleFinancialQuery(query, context);
      
      case 'quote_inquiry':
        return this.handleQuoteQuery(query, context);
      
      case 'vendor_analysis':
        return this.handleVendorQuery(query, context);
      
      case 'timeline_query':
        return this.handleTimelineQuery(query, context);
      
      case 'create_request':
        return this.handleCreateRequest(query, context);
      
      case 'help_request':
        return this.handleHelpRequest();
      
      default:
        return this.handleGeneralQuery(query, context);
    }
  }

  private handleProjectStatusQuery(_query: string, context: CopilotContext): CopilotResponse {
    const activeProjects = context.projects.filter(p => p.status === 'active');
    const completedProjects = context.projects.filter(p => p.status === 'completed');
    
    let message = `📊 **État de vos projets:**\n\n`;
    
    if (activeProjects.length > 0) {
      message += `**Projets actifs (${activeProjects.length}):**\n`;
      activeProjects.forEach(project => {
        const progress = (project.spent / project.budget) * 100;
        message += `• ${project.name}: ${progress.toFixed(1)}% du budget utilisé\n`;
      });
    }
    
    if (completedProjects.length > 0) {
      message += `\n**Projets terminés:** ${completedProjects.length}`;
    }

    const relatedData = activeProjects.map(project => ({
      type: 'project' as const,
      id: project.id,
      title: project.name,
      summary: `Budget: ${project.budget.toLocaleString()} XAF - Dépensé: ${project.spent.toLocaleString()} XAF`
    }));

    return {
      message,
      relatedData,
      suggestedActions: [
        {
          id: 'view_all_projects',
          label: 'Voir tous les projets',
          type: 'navigate',
          params: { section: 'projects' }
        }
      ],
      confidence: 0.9
    };
  }

  private handleFinancialQuery(_query: string, context: CopilotContext): CopilotResponse {
    const totalBudget = context.projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = context.projects.reduce((sum, p) => sum + p.spent, 0);
    const totalQuoteValue = context.quotes.reduce((sum, q) => sum + q.totalAmount, 0);
    const remaining = totalBudget - totalSpent;
    
    // Analyser la question spécifique
    if (_query.toLowerCase().includes('reste') || _query.toLowerCase().includes('restant') || _query.toLowerCase().includes('finaliser')) {
      if (context.projects.length === 0) {
        return {
          message: `📊 Vous n'avez actuellement aucun projet actif. Voulez-vous créer un nouveau projet ?`,
          suggestedActions: [
            {
              id: 'create_project',
              label: 'Créer un projet',
              type: 'create_project'
            }
          ],
          confidence: 0.9
        };
      }
      
      if (context.projects.length === 1) {
        const project = context.projects[0];
        const projectRemaining = project.budget - project.spent;
        const progressPercent = ((project.spent / project.budget) * 100).toFixed(1);
        
        return {
          message: `💰 **Projet: ${project.name}**\n\n• Budget total: ${project.budget.toLocaleString()} XAF\n• Déjà dépensé: ${project.spent.toLocaleString()} XAF\n• **Il vous reste: ${projectRemaining.toLocaleString()} XAF**\n\n📊 Progression: ${progressPercent}% du budget utilisé\n\n${projectRemaining > 0 ? '✅ Vous avez encore de la marge pour finaliser le projet.' : '⚠️ Attention: budget dépassé !'}`,
          suggestedActions: [
            {
              id: 'view_project_details',
              label: 'Voir détails du projet',
              type: 'view_details',
              params: { projectId: project.id }
            },
            {
              id: 'create_quote',
              label: 'Créer un devis',
              type: 'create_quote'
            }
          ],
          confidence: 0.95
        };
      }
      
      // Plusieurs projets
      let message = `💰 **Résumé de vos ${context.projects.length} projets:**\n\n`;
      
      context.projects.forEach(project => {
        const projectRemaining = project.budget - project.spent;
        const progressPercent = ((project.spent / project.budget) * 100).toFixed(1);
        message += `**${project.name}:**\n• Reste: ${projectRemaining.toLocaleString()} XAF (${progressPercent}% utilisé)\n\n`;
      });
      
      message += `**Total général:**\n• Il vous reste: ${remaining.toLocaleString()} XAF sur ${totalBudget.toLocaleString()} XAF`;
      
      return {
        message,
        suggestedActions: [
          {
            id: 'view_all_projects',
            label: 'Voir tous les projets',
            type: 'navigate',
            params: { section: 'projects' }
          }
        ],
        confidence: 0.95
      };
    }
    
    // Résumé financier général
    const message = `💰 **Résumé financier:**\n\n**Projets:**\n• Budget total: ${totalBudget.toLocaleString()} XAF\n• Dépensé: ${totalSpent.toLocaleString()} XAF\n• Reste: ${remaining.toLocaleString()} XAF\n\n**Devis:**\n• Valeur totale: ${totalQuoteValue.toLocaleString()} XAF\n• Nombre de devis: ${context.quotes.length}\n\n**Utilisation du budget:** ${totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0'}%`;

    return {
      message,
      suggestedActions: [
        {
          id: 'export_financial_report',
          label: 'Exporter rapport financier',
          type: 'export_data',
          params: { type: 'financial' }
        },
        {
          id: 'view_budget_details',
          label: 'Voir détails budget',
          type: 'navigate',
          params: { section: 'budget' }
        }
      ],
      confidence: 0.95
    };
  }

  private handleQuoteQuery(_query: string, context: CopilotContext): CopilotResponse {
    const pendingQuotes = context.quotes.filter(q => q.status === 'pending');
    const acceptedQuotes = context.quotes.filter(q => q.status === 'accepted');
    
    let message = `📋 **État de vos devis:**\n\n`;
    
    if (pendingQuotes.length > 0) {
      message += `**En attente (${pendingQuotes.length}):**\n`;
      pendingQuotes.slice(0, 3).forEach(quote => {
        message += `• ${quote.title} - ${quote.totalAmount.toLocaleString()} XAF\n`;
      });
    }
    
    if (acceptedQuotes.length > 0) {
      message += `\n**Acceptés:** ${acceptedQuotes.length} devis`;
    }

    const relatedData = context.quotes.slice(0, 5).map(quote => ({
      type: 'quote' as const,
      id: quote.id,
      title: quote.title,
      summary: `Client: ${quote.clientName} - ${quote.totalAmount.toLocaleString()} XAF`
    }));

    return {
      message,
      relatedData,
      suggestedActions: [
        {
          id: 'create_new_quote',
          label: 'Créer nouveau devis',
          type: 'create_quote'
        },
        {
          id: 'view_all_quotes',
          label: 'Voir tous les devis',
          type: 'navigate',
          params: { section: 'quotes' }
        }
      ],
      confidence: 0.9
    };
  }

  private handleVendorQuery(_query: string, context: CopilotContext): CopilotResponse {
    const vendorSpending = context.transactions.reduce((acc, transaction) => {
      if (!acc[transaction.vendorName]) {
        acc[transaction.vendorName] = 0;
      }
      acc[transaction.vendorName] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    const topVendors = Object.entries(vendorSpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    let message = `🏢 **Analyse des fournisseurs:**\n\n`;
    
    if (topVendors.length > 0) {
      message += `**Top 5 fournisseurs:**\n`;
      topVendors.forEach(([vendor, amount], index) => {
        message += `${index + 1}. ${vendor}: ${amount.toLocaleString()} XAF\n`;
      });
    }

    return {
      message,
      suggestedActions: [
        {
          id: 'export_vendor_report',
          label: 'Exporter rapport fournisseurs',
          type: 'export_data',
          params: { type: 'vendors' }
        }
      ],
      confidence: 0.8
    };
  }

  private handleTimelineQuery(_query: string, context: CopilotContext): CopilotResponse {
    const upcomingDeadlines = context.projects
      .filter(p => p.endDate && new Date(p.endDate) > new Date())
      .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime());

    let message = `📅 **Planning et délais:**\n\n`;
    
    if (upcomingDeadlines.length > 0) {
      message += `**Prochaines échéances:**\n`;
      upcomingDeadlines.slice(0, 3).forEach(project => {
        const daysLeft = Math.ceil((new Date(project.endDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        message += `• ${project.name}: ${daysLeft} jours restants\n`;
      });
    } else {
      message += `Aucune échéance définie pour vos projets actifs.`;
    }

    return {
      message,
      suggestedActions: [
        {
          id: 'view_calendar',
          label: 'Voir le calendrier',
          type: 'navigate',
          params: { section: 'calendar' }
        }
      ],
      confidence: 0.8
    };
  }

  private handleCreateRequest(_query: string, context: CopilotContext): CopilotResponse {
    const lowerQuery = _query.toLowerCase();
    
    if (lowerQuery.includes('devis') || lowerQuery.includes('quote')) {
      // Analyser le contexte pour des suggestions intelligentes
      let contextualMessage = ` Parfait ! Je vais vous aider à créer un nouveau devis.`;
      
      if (context.projects.length > 0) {
        const activeProjects = context.projects.filter(p => p.status === 'active');
        if (activeProjects.length > 0) {
          contextualMessage += ` Je vois que vous avez ${activeProjects.length} projet(s) actif(s). Voulez-vous créer un devis lié à l'un d'eux ?`;
        }
      }
      
      const actions = [
        {
          id: 'create_quote_blank',
          label: 'Créer un devis vierge',
          type: 'create_quote' as const,
          params: { useTemplate: false }
        }
      ];
      
      if (context.quotes.length > 0) {
        actions.unshift({
          id: 'create_quote_template',
          label: 'Utiliser un devis existant comme modèle',
          type: 'create_quote' as const,
          params: { useTemplate: true }
        });
      }
      
      return {
        message: contextualMessage,
        suggestedActions: actions,
        confidence: 0.95
      };
    }
    
    if (lowerQuery.includes('projet') || lowerQuery.includes('project')) {
      let message = ` Parfait ! Je vais vous aider à créer un nouveau projet.`;
      
      if (context.projects.length > 0) {
        const totalBudget = context.projects.reduce((sum, p) => sum + p.budget, 0);
        message += ` Vous gérez actuellement ${context.projects.length} projet(s) avec un budget total de ${totalBudget.toLocaleString()} XAF.`;
      }
      
      return {
        message,
        suggestedActions: [
          {
            id: 'create_project',
            label: 'Créer un nouveau projet',
            type: 'create_project'
          },
          {
            id: 'view_project_templates',
            label: 'Voir les modèles de projet',
            type: 'navigate',
            params: { section: 'project-templates' }
          }
        ],
        confidence: 0.95
      };
    }

    return {
      message: ` Je peux vous aider à créer des devis, projets, ou exporter des données. Que souhaitez-vous créer ?`,
      suggestedActions: [
        {
          id: 'create_quote',
          label: 'Créer un devis',
          type: 'create_quote'
        },
        {
          id: 'create_project',
          label: 'Créer un projet',
          type: 'create_project'
        }
      ],
      confidence: 0.8
    };
  }

  private handleHelpRequest(): CopilotResponse {
    return {
      message: ` **Je suis votre Assistant BTP !**

Je peux vous aider avec:
• 📊 État et suivi de vos projets
• 💰 Analyses financières et budgets
• 📋 Gestion des devis
• 🏢 Analyses fournisseurs
• 📅 Planning et délais
•  Création de nouveaux éléments

**Exemples de questions:**
• "Quel est l'état de mes projets ?"
• "Combien ai-je dépensé ce mois ?"
• "Créer un nouveau devis"
• "Qui sont mes principaux fournisseurs ?"`,
      suggestedActions: [
        {
          id: 'view_dashboard',
          label: 'Retour au tableau de bord',
          type: 'navigate',
          params: { section: 'dashboard' }
        }
      ],
      confidence: 1.0
    };
  }

  private handleGeneralQuery(message: string, context: CopilotContext): CopilotResponse {
    // Analyse basique du message pour fournir une réponse contextuelle
    const projectName = context.currentProject?.name || 'votre projet';
    
    return {
      message: `Je comprends votre question sur ${projectName}. Pouvez-vous être plus spécifique ? Je peux vous aider avec :\n\n• L'état d'avancement du projet\n• Les finances et le budget\n• Les devis et factures\n• La planification des tâches\n• L'analyse des fournisseurs`,
      confidence: 60,
      suggestedActions: [
        { id: 'show_progress', label: 'Voir l\'avancement', type: 'view_details' },
        { id: 'show_budget', label: 'Consulter le budget', type: 'view_details' },
        { id: 'create_quote', label: 'Créer un devis', type: 'create_quote' }
      ]
    };
  }

  private handleGeneralQueryRules(query: string, context: CopilotContext): CopilotResponse {
    const lowerQuery = query.toLowerCase();
    
    // Essayer de détecter des intentions cachées
    if (lowerQuery.includes('aide') || lowerQuery.includes('help')) {
      return this.handleHelpRequest();
    }
    
    if (lowerQuery.includes('projet') && !lowerQuery.includes('créer')) {
      return this.handleProjectStatusQuery(query, context);
    }
    
    if (lowerQuery.includes('argent') || lowerQuery.includes('budget') || lowerQuery.includes('coût')) {
      return this.handleFinancialQuery(query, context);
    }
    
    // Réponse contextuelle basée sur les données
    const contextualSuggestions = [];
    
    if (context.projects.length > 0) {
      contextualSuggestions.push('"Quel est l\'état de mes projets ?"');
      contextualSuggestions.push('"Combien il me reste à dépenser ?"');
    }
    
    if (context.quotes.length === 0) {
      contextualSuggestions.push('"Créer un nouveau devis"');
    } else {
      contextualSuggestions.push('"Voir mes devis en cours"');
    }
    
    const suggestions = contextualSuggestions.length > 0 
      ? contextualSuggestions.join('\n• ') 
      : '"Créer un projet"\n• "Créer un devis"\n• "Voir l\'aide"';
    
    return {
      message: `Je peux vous aider avec la gestion de vos projets BTP. Voici quelques suggestions basées sur votre situation actuelle:\n\n• ${suggestions}`,
      suggestedActions: [
        {
          id: 'view_dashboard',
          label: 'Retour au tableau de bord',
          type: 'navigate',
          params: { section: 'dashboard' }
        },
        {
          id: 'help',
          label: 'Voir toutes les fonctionnalités',
          type: 'navigate',
          params: { section: 'help' }
        }
      ],
      confidence: 0.6
    };
  }

  // Méthodes utilitaires
  getConversationHistory(): CopilotMessage[] {
    return [...this.conversationHistory];
  }

  clearConversation(): void {
    this.conversationHistory = [];
  }

  exportConversation(): string {
    return JSON.stringify(this.conversationHistory, null, 2);
  }
}

export const aiCopilot = new AICopilot();
