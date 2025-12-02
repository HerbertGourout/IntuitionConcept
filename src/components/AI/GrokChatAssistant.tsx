import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Zap, TrendingUp, AlertCircle, Lightbulb, Clock } from 'lucide-react';
import { grokService } from '../../services/ai/grokService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  cost?: number;
  processingTime?: number;
  recommendations?: string[];
}

interface ChatContext {
  currentProject?: {
    id: string;
    name: string;
    type: string;
    budget: number;
    phase: string;
  };
  userProfile?: {
    role: string;
    company: string;
    preferences: string[];
  };
  recentActivity?: string[];
}

const GrokChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ChatContext>({});
  const [totalCost, setTotalCost] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Messages de bienvenue
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Salut ! Je suis votre assistant BTP Grok, toujours à jour avec les dernières infos du marché !

 **Ce que je peux faire pour vous :**
• 📊 Veille marché temps réel (prix matériaux, tendances)
• 💰 Estimations de coûts avec données actuelles
• 📋 Conseils techniques et réglementaires
• 🔍 Analyse de vos projets et documents
•  Réponses rapides et directes (style Grok !)

**Essayez par exemple :**
- "Quels sont les prix du béton cette semaine ?"
- "Analyse mon projet de 150m²"
- "Nouvelles réglementations RT2020"

Alors, par quoi on commence ? 😎`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Chargement du contexte utilisateur
  useEffect(() => {
    loadUserContext();
  }, []);

  const loadUserContext = () => {
    // Simulation du contexte utilisateur (à remplacer par vraies données)
    setContext({
      currentProject: {
        id: 'proj-001',
        name: 'Maison individuelle Dupont',
        type: 'construction',
        budget: 250000,
        phase: 'gros_oeuvre'
      },
      userProfile: {
        role: 'chef_de_projet',
        company: 'BTP Solutions',
        preferences: ['notifications_prix', 'alertes_reglementaires']
      },
      recentActivity: [
        'Consultation prix béton',
        'Analyse plan architectural',
        'Devis électricité'
      ]
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Utiliser directement Grok pour le chat
      const response = await grokService.chatAssistant(inputMessage);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        cost: response.cost,
        processingTime: 0, // Grok ne retourne pas processingTime
        recommendations: [] // Grok ne retourne pas recommendations
      };

      setMessages(prev => [...prev, assistantMessage]);
      setTotalCost(prev => prev + response.cost);

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Oups ! Une erreur s'est produite : ${error}. Mais bon, on n'abandonne pas ! 😅 Réessayez ou reformulez votre question.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 4
    }).format(cost);
  };

  const getQuickActions = () => [
    {
      icon: <TrendingUp className="w-4 h-4" />,
      labelux",
      action: "Quels sont les derniers prix des matériaux BTP ?"
    },
    {
      icon: <AlertCircle className="w-4 h-4" />,
      label: "Alertes marché",
      action: "Y a-t-il des alertes importantes sur le marché ?"
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      label: "Conseils projet",
      action: "Donne-moi des conseils pour optimiser mon projet actuel"
    },
    {
      icon: <Zap className="w-4 h-4" />,
      label: "Réglementations",
      action: "Quelles sont les nouvelles réglementations BTP ?"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            
            <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : ''}`}>
              <div
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* Recommandations */}
                {message.recommendations && message.recommendations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Lightbulb className="w-4 h-4" />
                      Recommandations :
                    </p>
                    <ul className="text-sm space-y-1">
                      {message.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Métadonnées du message */}
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>{message.timestamp.toLocaleTimeString('fr-FR')}</span>
                {message.cost && (
                  <span>Coût: {formatCost(message.cost)}</span>
                )}
                {message.processingTime && (
                  <span>{message.processingTime}ms</span>
                )}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 order-3">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 dark:text-gray-400">Grok réfléchit...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Actions rapides */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Actions rapides :</p>
          <div className="grid grid-cols-2 gap-2">
            {getQuickActions().map((action, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(action.action)}
                className="flex items-center gap-2 p-2 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-left"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zone de saisie */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question à Grok... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
              className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
              {inputMessage.length}/1000
            </div>
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Envoyer</span>
          </button>
        </div>
        
        {/* Contexte utilisateur */}
        {context.currentProject && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              📋 Projet actuel : {context.currentProject.name} 
              ({context.currentProject.type}, {context.currentProject.budget.toLocaleString('fr-FR')}€)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrokChatAssistant;
