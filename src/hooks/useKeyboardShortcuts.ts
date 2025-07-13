import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcuts.find(s => 
        s.key.toLowerCase() === event.key.toLowerCase() &&
        !!s.ctrlKey === event.ctrlKey &&
        !!s.shiftKey === event.shiftKey &&
        !!s.altKey === event.altKey
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Predefined shortcuts for the application
export const useAppShortcuts = (actions: {
  openSearch: () => void;
  openNotifications: () => void;
  createProject: () => void;
  createTask: () => void;
  createEquipment: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      ctrlKey: true,
      action: actions.openSearch,
      description: 'Ouvrir la recherche globale'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: actions.openNotifications,
      description: 'Ouvrir les notifications'
    },
    {
      key: 'p',
      ctrlKey: true,
      shiftKey: true,
      action: actions.createProject,
      description: 'Créer un nouveau projet'
    },
    {
      key: 't',
      ctrlKey: true,
      shiftKey: true,
      action: actions.createTask,
      description: 'Créer une nouvelle tâche'
    },
    {
      key: 'e',
      ctrlKey: true,
      shiftKey: true,
      action: actions.createEquipment,
      description: 'Ajouter un équipement'
    }
  ];

  useKeyboardShortcuts(shortcuts);
  return shortcuts;
};