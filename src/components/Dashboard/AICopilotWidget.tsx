import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageCircle, Send, Bot, User, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';
import { aiCopilot, CopilotMessage, CopilotContext, CopilotResponse } from '../../services/ai/copilot';

interface AICopilotWidgetProps {
  context: CopilotContext;
  onActionRequested?: (action: { type: string; params?: Record<string, unknown> }) => void;
}

export const AICopilotWidget: React.FC<AICopilotWidgetProps> = ({
  context,
  onActionRequested
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastResponse, setLastResponse] = useState<CopilotResponse | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: CopilotMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await aiCopilot.processMessage(inputValue.trim(), context);
      setLastResponse(response);

      const assistantMessage: CopilotMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: response.confidence
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur copilot:', error);
      const errorMessage: CopilotMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Désolé, je rencontre une difficulté technique. Pouvez-vous réessayer ?',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleActionClick = (action: { type: string; params?: Record<string, unknown> }) => {
    onActionRequested?.(action);
  };

  const formatMessage = (content: string) => {
    // Convertir le markdown basique en HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const initializeChat = useCallback(() => {
    if (messages.length === 0) {
      const welcomeMessage: CopilotMessage = {
        id: 'welcome_msg',
        role: 'assistant',
        content: `${getGreeting()} ${context.currentUser?.name || 'cher utilisateur'} ! 👋

Je suis votre Assistant pour la gestion BTP. Je peux vous aider avec:

• 📊 Suivi de vos ${context.projects.length} projets
• 💰 Analyses financières et budgets  
• 📋 Gestion de vos ${context.quotes.length} devis
• 🏢 Analyses fournisseurs
•  Création de nouveaux éléments

Comment puis-je vous aider aujourd'hui ?`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, context.currentUser?.name, context.projects.length, context.quotes.length]);

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen, context.currentUser?.name, context.projects.length, context.quotes.length, messages.length, initializeChat]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 z-50"
        title="Ouvrir l'Assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 transition-all ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Assistant BTP</h3>
            {!isMinimized && (
              <p className="text-xs text-gray-600">
                {isTyping ? 'En train d\'écrire...' : 'En ligne'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            title={isMinimized ? 'Agrandir' : 'Réduire'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[440px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                }`}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-2xl max-w-[280px] ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}>
                    <div 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                    {message.metadata?.confidence && (
                      <div className="text-xs opacity-70 mt-1">
                        Confiance: {message.metadata.confidence}%
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Actions suggérées */}
            {lastResponse?.suggestedActions && lastResponse.suggestedActions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {lastResponse.suggestedActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Données liées */}
            {lastResponse?.relatedData && lastResponse.relatedData.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Données liées:</h4>
                <div className="space-y-2">
                  {lastResponse.relatedData.slice(0, 3).map((data) => (
                    <div key={data.id} className="text-xs text-gray-600">
                      <span className="font-medium">{data.title}</span>
                      <br />
                      <span className="text-gray-500">{data.summary}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              Appuyez sur Entrée pour envoyer
            </div>
          </div>
        </>
      )}
    </div>
  );
};
