// import { projectPlanGenerator } from './projectPlanGenerator';
import { priceLibraryService } from '../priceLibraryService';

// Minimal ambient declarations for Web Speech API to satisfy TypeScript in browser context
// These are intentionally lightweight to avoid adding a dependency on lib.dom types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionEvent = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionErrorEvent = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionCtor = new () => any;

export interface VoiceCommand {
  id: string;
  transcript: string;
  intent: string;
  entities: Record<string, unknown>;
  confidence: number;
  timestamp: Date;
  response?: string;
  action?: string;
}

export interface VoiceSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  commands: VoiceCommand[];
  context: {
    currentProject?: string;
    currentQuote?: string;
    lastAction?: string;
  };
}

class VocalCopilotService {
  // Use a broad type for compatibility across browsers and test environments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;
  private currentSession: VoiceSession | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const ctor = (
        (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition
      ) as SpeechRecognitionCtor | undefined;
      this.recognition = ctor ? new ctor() : null;
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'fr-FR';
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        console.log('🎤 Écoute vocale démarrée');
      };

      this.recognition.onend = () => {
        console.log('🎤 Écoute vocale arrêtée');
        this.isListening = false;
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Erreur reconnaissance vocale:', event.error);
        this.isListening = false;
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results as ArrayLike<{ 0: { transcript: string }; isFinal?: boolean }>)
          .map((result) => result[0])
          .map((alt) => alt.transcript)
          .join('');

        const last = (event.results as ArrayLike<{ isFinal?: boolean }>)[
          (event.results as ArrayLike<unknown>).length - 1
        ];
        if (last && last.isFinal) {
          this.processVoiceCommand(transcript);
        }
      };
    }
  }

  // Démarrer l'écoute vocale
  startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Reconnaissance vocale non supportée'));
        return;
      }

      if (this.isListening) {
        resolve();
        return;
      }

      try {
        this.isListening = true;
        this.startNewSession();
        this.recognition.start();
        resolve();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  // Arrêter l'écoute vocale
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.endCurrentSession();
    }
  }

  // Traiter une commande vocale
  private async processVoiceCommand(transcript: string): Promise<void> {
    try {
      const command = await this.analyzeIntent(transcript);
      
      if (this.currentSession) {
        this.currentSession.commands.push(command);
      }

      const response = await this.executeCommand(command);
      
      if (response) {
        this.speak(response);
        command.response = response;
      }

    } catch (error) {
      console.error('Erreur traitement commande vocale:', error);
      this.speak("Désolé, je n'ai pas compris votre demande.");
    }
  }

  // Analyser la commande vocale avec IA
  private async analyzeIntent(transcript: string): Promise<VoiceCommand> {
    // Patterns de reconnaissance d'intentions
    const intentPatterns = [
      {
        intent: 'create_quote',
        patterns: [/créer? (un )?devis/i, /nouveau devis/i, /faire (un )?devis/i],
        entities: this.extractQuoteEntities
      },
      {
        intent: 'search_price',
        patterns: [/prix (de |du |des )?(.+)/i, /combien coûte (.+)/i, /tarif (.+)/i],
        entities: this.extractPriceEntities
      },
      {
        intent: 'create_project',
        patterns: [/créer? (un )?projet/i, /nouveau projet/i, /démarrer (un )?projet/i],
        entities: this.extractProjectEntities
      },
      {
        intent: 'add_task',
        patterns: [/ajouter (une )?tâche/i, /nouvelle tâche/i, /créer (une )?tâche/i],
        entities: this.extractTaskEntities
      },
      {
        intent: 'check_budget',
        patterns: [/budget/i, /combien (j'ai )?dépensé/i, /état financier/i],
        entities: this.extractBudgetEntities
      },
      {
        intent: 'generate_plan',
        patterns: [/générer (un )?plan/i, /plan de projet/i, /planifier/i],
        entities: this.extractPlanEntities
      },
      {
        intent: 'help',
        patterns: [/aide/i, /comment/i, /que peux-tu faire/i, /commandes/i],
        entities: () => ({})
      }
    ];

    // Trouver l'intention correspondante
    let matchedIntent = 'unknown';
    let entities = {};
    let confidence = 0;

    for (const pattern of intentPatterns) {
      for (const regex of pattern.patterns) {
        const match = transcript.match(regex);
        if (match) {
          matchedIntent = pattern.intent;
          entities = pattern.entities(transcript, match);
          confidence = 0.8; // Score de confiance simulé
          break;
        }
      }
      if (matchedIntent !== 'unknown') break;
    }

    return {
      id: `cmd_${Date.now()}`,
      transcript,
      intent: matchedIntent,
      entities,
      confidence,
      timestamp: new Date()
    };
  }

  // Exécuter une commande
  private async executeCommand(command: VoiceCommand): Promise<string> {
    switch (command.intent) {
      case 'create_quote':
        return this.handleCreateQuote(command);
      
      case 'search_price':
        return await this.handleSearchPrice(command);
      
      case 'create_project':
        return this.handleCreateProject(command);
      
      case 'add_task':
        return this.handleAddTask(command);
      
      case 'check_budget':
        return this.handleCheckBudget(command);
      
      case 'generate_plan':
        return await this.handleGeneratePlan(command);
      
      case 'help':
        return this.handleHelp();
      
      default:
        return 'Je n\'ai pas compris votre demande. Dites "aide" pour voir les commandes disponibles.';
    }
  }

  // Gestionnaires de commandes
  private handleCreateQuote(command: VoiceCommand): string {
    const client = (command.entities.client as string | undefined) || 'Client';
    command.action = 'navigate_to_quote_creation';
    return `D'accord, je vais créer un nouveau devis${client !== 'Client' ? ` pour ${client}` : ''}. Redirection vers la page de création de devis.`;
  }

  private async handleSearchPrice(command: VoiceCommand): Promise<string> {
    const item = command.entities.item as string | undefined;
    if (!item) {
      return 'Quel élément souhaitez-vous rechercher dans la bibliothèque de prix ?';
    }

    try {
      const results = await priceLibraryService.searchPriceItems({
        searchTerm: item,
        limit: 3
      });

      if (results.length === 0) {
        return `Aucun prix trouvé pour "${item}". Voulez-vous que j'estime un prix avec l'IA ?`;
      }

      const topResult = results[0];
      const formattedPrice = new Intl.NumberFormat('fr-FR').format(topResult.unitPrice);
      
      return `J'ai trouvé "${topResult.designation}" à ${formattedPrice} ${topResult.currency} par ${topResult.unit} dans la région ${topResult.region}.`;
    } catch (error) {
      console.error('Erreur recherche prix:', error);
      return 'Erreur lors de la recherche de prix. Veuillez réessayer.';
    }
  }

  private handleCreateProject(command: VoiceCommand): string {
    const projectName = (command.entities.name as string | undefined) || 'Nouveau Projet';
    command.action = 'navigate_to_project_creation';
    return `Parfait, je vais créer le projet "${projectName}". Redirection vers la page de création de projet.`;
  }

  private handleAddTask(command: VoiceCommand): string {
    const taskName = (command.entities.task as string | undefined) || 'Nouvelle tâche';
    command.action = 'open_task_modal';
    return `Je vais ajouter la tâche "${taskName}". Ouverture du formulaire de création de tâche.`;
  }

  private async handleCheckBudget(command: VoiceCommand): Promise<string> {
    // Mark parameter as intentionally unused to satisfy eslint/no-unused-vars
    void command;
    try {
      // Récupérer les vraies données financières depuis le service
      const { financialService } = await import('../financialService');
      const summary = await financialService.getBudgetSummary('current-project-id');
      
      if (!summary) {
        return "Impossible de récupérer les informations budgétaires. Aucun projet sélectionné.";
      }
      
      const spent = summary.spentAmount || 0;
      const budget = summary.allocatedBudget || summary.estimatedBudget || 0;
      const remaining = budget - spent;
      const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;

      if (budget === 0) {
        return "Aucun budget n'est défini pour le projet actuel. Veuillez configurer un budget dans les paramètres du projet.";
      }

      return `Vous avez dépensé ${new Intl.NumberFormat('fr-FR').format(spent)} francs CFA sur un budget de ${new Intl.NumberFormat('fr-FR').format(budget)}, soit ${percentage}%. Il vous reste ${new Intl.NumberFormat('fr-FR').format(remaining)} francs CFA.`;
    } catch (error) {
      console.error('Erreur lors de la récupération du budget:', error);
      return "Impossible de récupérer les informations budgétaires. Veuillez vérifier votre connexion et réessayer.";
    }
  }

  private async handleGeneratePlan(command: VoiceCommand): Promise<string> {
    const description = command.entities.description as string | undefined;
    if (!description) {
      return 'Décrivez-moi le projet pour lequel vous souhaitez générer un plan.';
    }

    try {
      command.action = 'generate_ai_plan';
      return `Je vais générer un plan détaillé pour "${description}". Cela peut prendre quelques secondes...`;
    } catch (error) {
      console.error('Erreur lors de la génération du plan:', error);
      return 'Erreur lors de la génération du plan. Veuillez réessayer.';
    }
  }

  private handleHelp(): string {
    return `Voici ce que je peux faire pour vous :
    - "Créer un devis pour [client]"
    - "Prix du béton" ou "Combien coûte le carrelage"
    - "Créer un projet [nom]"
    - "Ajouter une tâche [nom]"
    - "Quel est mon budget" ou "Combien j'ai dépensé"
    - "Générer un plan pour [description]"
    
    Dites simplement votre demande naturellement !`;
  }

  // Extracteurs d'entités
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractQuoteEntities(transcript: string, _match: RegExpMatchArray): Record<string, unknown> {
    const clientMatch = transcript.match(/pour (.+?)(?:\s|$)/i);
    return {
      client: clientMatch ? clientMatch[1] : null
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractPriceEntities(_transcript: string, match: RegExpMatchArray): Record<string, unknown> {
    return {
      item: match[2] || match[1] || null
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractProjectEntities(transcript: string, _match: RegExpMatchArray): Record<string, unknown> {
    const nameMatch = transcript.match(/projet (.+?)(?:\s|$)/i);
    return {
      name: nameMatch ? nameMatch[1] : null
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractTaskEntities(transcript: string, _match: RegExpMatchArray): Record<string, unknown> {
    const taskMatch = transcript.match(/tâche (.+?)(?:\s|$)/i);
    return {
      task: taskMatch ? taskMatch[1] : null
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractBudgetEntities(_transcript: string, _match: RegExpMatchArray): Record<string, unknown> {
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractPlanEntities(transcript: string, _match: RegExpMatchArray): Record<string, unknown> {
    const descMatch = transcript.match(/pour (.+?)(?:\s|$)/i);
    return {
      description: descMatch ? descMatch[1] : null
    };
  }

  // Synthèse vocale
  speak(text: string, options?: { rate?: number; pitch?: number; volume?: number }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Synthèse vocale non supportée'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = options?.rate || 1;
      utterance.pitch = options?.pitch || 1;
      utterance.volume = options?.volume || 1;

      utterance.onend = () => resolve();
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => reject(event);

      this.synthesis.speak(utterance);
    });
  }

  // Gestion des sessions
  private startNewSession(): void {
    this.currentSession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      commands: [],
      context: {}
    };
  }

  private endCurrentSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
      // Sauvegarder la session si nécessaire
      console.log('Session vocale terminée:', this.currentSession);
      this.currentSession = null;
    }
  }

  // État du service
  getIsListening(): boolean {
    return this.isListening;
  }

  getCurrentSession(): VoiceSession | null {
    return this.currentSession;
  }

  // Test de compatibilité
  static isSupported(): boolean {
    return !!(
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) &&
      'speechSynthesis' in window
    );
  }
}

export const vocalCopilotService = new VocalCopilotService();
export { VocalCopilotService };
export default vocalCopilotService;
