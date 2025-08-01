import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeSelectorProps {
  className?: string;
  showLabel?: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    {
      id: 'light' as const,
      name: 'Clair',
      icon: Sun,
      description: 'Mode clair permanent',
      preview: 'bg-white border-gray-200'
    },
    {
      id: 'dark' as const,
      name: 'Sombre',
      icon: Moon,
      description: 'Mode sombre permanent',
      preview: 'bg-gray-900 border-gray-700'
    },
    {
      id: 'auto' as const,
      name: 'Auto',
      icon: Monitor,
      description: 'Suit les préférences système',
      preview: 'bg-gradient-to-r from-white to-gray-900 border-gray-400'
    }
  ];

  const currentTheme = themes.find(t => t.id === theme);
  const CurrentIcon = currentTheme?.icon || Monitor;

  return (
    <div className={`relative ${className}`}>
      {/* Bouton principal */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
          ${resolvedTheme === 'dark' 
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700' 
            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
          }
          hover:scale-105 active:scale-95
        `}
        whileTap={{ scale: 0.95 }}
        aria-label="Sélectionner le thème"
      >
        <motion.div
          key={resolvedTheme}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CurrentIcon className="w-4 h-4" />
        </motion.div>
        
        {showLabel && (
          <span className="text-sm font-medium">
            {currentTheme?.name}
          </span>
        )}
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.button>

      {/* Menu déroulant */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay pour fermer */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`
                absolute top-full mt-2 right-0 z-50 min-w-[240px]
                ${resolvedTheme === 'dark'
                  ? 'bg-gray-800 border-gray-700 shadow-2xl'
                  : 'bg-white border-gray-200 shadow-xl'
                }
                border rounded-xl overflow-hidden backdrop-blur-sm
              `}
            >
              <div className="p-2">
                {themes.map((themeOption, index) => {
                  const Icon = themeOption.icon;
                  const isSelected = theme === themeOption.id;
                  
                  return (
                    <motion.button
                      key={themeOption.id}
                      onClick={() => {
                        setTheme(themeOption.id);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-all duration-200 text-left
                        ${resolvedTheme === 'dark'
                          ? isSelected
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-700 text-gray-200'
                          : isSelected
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }
                      `}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Icône et preview */}
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <div className={`w-4 h-4 rounded border ${themeOption.preview}`} />
                      </div>
                      
                      {/* Contenu */}
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {themeOption.name}
                        </div>
                        <div className={`text-xs ${
                          resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {themeOption.description}
                        </div>
                      </div>
                      
                      {/* Indicateur de sélection */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Check className="w-4 h-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Footer avec info */}
              <div className={`
                px-3 py-2 text-xs border-t
                ${resolvedTheme === 'dark'
                  ? 'bg-gray-900 border-gray-700 text-gray-400'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
                }
              `}>
                💡 Le mode Auto s'adapte à vos préférences système
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;
