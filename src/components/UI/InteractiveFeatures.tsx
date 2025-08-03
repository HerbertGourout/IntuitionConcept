import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HelpCircle, Keyboard, Search, Command, Zap, Eye, EyeOff } from 'lucide-react';

// Hook pour les raccourcis clavier
export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Vérifier que event.key existe avant d'appeler toLowerCase
      if (!event.key) return;
      
      const key = event.key.toLowerCase();
      const ctrlKey = event.ctrlKey || event.metaKey;
      const altKey = event.altKey;
      const shiftKey = event.shiftKey;

      let shortcutKey = '';
      if (ctrlKey) shortcutKey += 'ctrl+';
      if (altKey) shortcutKey += 'alt+';
      if (shiftKey) shortcutKey += 'shift+';
      shortcutKey += key;

      if (shortcuts[shortcutKey]) {
        event.preventDefault();
        shortcuts[shortcutKey]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Composant Tooltip Intelligent
interface SmartTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  interactive?: boolean;
  shortcut?: string;
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 500,
  interactive = false,
  shortcut
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Ajuster la position si nécessaire
      if (tooltipRef.current && triggerRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        let newPosition = position;
        if (position === 'top' && triggerRect.top < tooltipRect.height + 10) {
          newPosition = 'bottom';
        } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height + 10 > viewportHeight) {
          newPosition = 'top';
        } else if (position === 'left' && triggerRect.left < tooltipRect.width + 10) {
          newPosition = 'right';
        } else if (position === 'right' && triggerRect.right + tooltipRect.width + 10 > viewportWidth) {
          newPosition = 'left';
        }
        setActualPosition(newPosition);
      }
    }, delay);
  }, [delay, position]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!interactive) {
      setIsVisible(false);
    }
  }, [interactive]);

  const getPositionClasses = () => {
    switch (actualPosition) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div 
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap ${getPositionClasses()}`}
          onMouseEnter={() => interactive && setIsVisible(true)}
          onMouseLeave={() => interactive && setIsVisible(false)}
        >
          <div className="flex items-center space-x-2">
            <span>{content}</span>
            {shortcut && (
              <kbd className="px-1.5 py-0.5 text-xs bg-gray-700 rounded border border-gray-600">
                {shortcut}
              </kbd>
            )}
          </div>
          {/* Flèche du tooltip */}
          <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
            actualPosition === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
            actualPosition === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
            actualPosition === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
            'right-full top-1/2 -translate-y-1/2 -mr-1'
          }`}></div>
        </div>
      )}
    </div>
  );
};

// Composant de Recherche Intelligente
interface SmartSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  suggestions?: string[];
  className?: string;
}

export const SmartSearch: React.FC<SmartSearchProps> = ({
  placeholder = "Rechercher...",
  onSearch,
  suggestions = [],
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        setQuery(filteredSuggestions[selectedIndex]);
        onSearch(filteredSuggestions[selectedIndex]);
      } else {
        onSearch(query);
      }
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0 && filteredSuggestions.length > 0);
    setSelectedIndex(-1);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(query.length > 0 && filteredSuggestions.length > 0)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
      </div>
      
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setQuery(suggestion);
                onSearch(suggestion);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                index === selectedIndex ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : ''
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Composant de Raccourcis Clavier
interface KeyboardShortcutsProps {
  shortcuts: Array<{
    key: string;
    description: string;
    action: () => void;
  }>;
}

export const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsProps> = ({ shortcuts }) => {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcuts({
    'ctrl+/': () => setIsOpen(!isOpen),
    'escape': () => setIsOpen(false)
  });

  if (!isOpen) {
    return (
      <SmartTooltip content="Raccourcis clavier" shortcut="Ctrl+/">
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
        >
          <Keyboard className="w-5 h-5" />
        </button>
      </SmartTooltip>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Raccourcis Clavier
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {shortcut.description}
              </span>
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Composant de Mode Focus
export const FocusMode: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);

  useKeyboardShortcuts({
    'ctrl+shift+f': () => setIsFocusMode(!isFocusMode)
  });

  return (
    <div className={`transition-all duration-300 ${isFocusMode ? 'focus-mode' : ''}`}>
      {children}
      <SmartTooltip content="Mode Focus" shortcut="Ctrl+Shift+F">
        <button
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={`fixed top-4 right-4 p-2 rounded-lg shadow-lg transition-all duration-200 z-40 ${
            isFocusMode 
              ? 'bg-orange-500 text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          }`}
        >
          {isFocusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </SmartTooltip>
    </div>
  );
};

// Composant de Commande Rapide
interface QuickCommandProps {
  commands: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    action: () => void;
    shortcut?: string;
  }>;
}

export const QuickCommand: React.FC<QuickCommandProps> = ({ commands }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(query.toLowerCase())
  );

  useKeyboardShortcuts({
    'ctrl+k': () => setIsOpen(true),
    'escape': () => {
      setIsOpen(false);
      setQuery('');
      setSelectedIndex(0);
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(0);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-32 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Command className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Tapez une commande..."
              className="w-full pl-10 pr-4 py-2 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredCommands.map((command, index) => (
            <button
              key={command.id}
              onClick={() => {
                command.action();
                setIsOpen(false);
                setQuery('');
                setSelectedIndex(0);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                index === selectedIndex ? 'bg-orange-50 dark:bg-orange-900/20' : ''
              }`}
            >
              {command.icon && (
                <div className="flex-shrink-0 w-5 h-5 text-gray-400">
                  {command.icon}
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {command.label}
                </div>
              </div>
              {command.shortcut && (
                <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                  {command.shortcut}
                </kbd>
              )}
            </button>
          ))}
          {filteredCommands.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              Aucune commande trouvée
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default {
  useKeyboardShortcuts,
  SmartTooltip,
  SmartSearch,
  KeyboardShortcutsPanel,
  FocusMode,
  QuickCommand
};
