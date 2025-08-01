import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Récupérer le thème sauvegardé ou utiliser 'auto' par défaut
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'auto';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Détecter la préférence système
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Résoudre le thème effectif
  useEffect(() => {
    let effectiveTheme: ResolvedTheme;
    
    if (theme === 'auto') {
      effectiveTheme = getSystemTheme();
    } else {
      effectiveTheme = theme as ResolvedTheme;
    }

    setResolvedTheme(effectiveTheme);

    // Appliquer le thème au document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    
    // Mettre à jour la couleur de la barre d'état mobile
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#1f2937' : '#ffffff');
    }

    // Sauvegarder le thème
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Écouter les changements de préférence système
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        setResolvedTheme(getSystemTheme());
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('auto');
    } else {
      setTheme('light');
    }
  };

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme: handleSetTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook pour les animations de transition de thème
export const useThemeTransition = () => {
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    // Ajouter une classe de transition temporaire
    document.documentElement.classList.add('theme-transition');
    
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);

    return () => clearTimeout(timer);
  }, [resolvedTheme]);
};

// Utilitaires pour les composants
export const themeClasses = {
  light: {
    bg: 'bg-white',
    bgSecondary: 'bg-gray-50',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
    card: 'bg-white shadow-sm',
    input: 'bg-white border-gray-300',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  dark: {
    bg: 'bg-gray-900',
    bgSecondary: 'bg-gray-800',
    text: 'text-gray-100',
    textSecondary: 'text-gray-300',
    border: 'border-gray-700',
    card: 'bg-gray-800 shadow-lg',
    input: 'bg-gray-700 border-gray-600 text-white',
    button: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
};

export const getThemeClasses = (resolvedTheme: ResolvedTheme) => {
  return themeClasses[resolvedTheme];
};
