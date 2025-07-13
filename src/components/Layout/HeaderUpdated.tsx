import React, { useState } from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import GlobalSearch from '../UI/GlobalSearch';
import NotificationCenter from '../UI/NotificationCenter';
import { useAppShortcuts } from '../../hooks/useKeyboardShortcuts';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuCollapsed: boolean;
  onNavigate: (section: string, id?: string) => void;
  onCreateProject: () => void;
}

const HeaderUpdated: React.FC<HeaderProps> = ({ 
  onMenuToggle,
  onNavigate,
  onCreateProject 
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Keyboard shortcuts
  useAppShortcuts({
    openSearch: () => setIsSearchOpen(true),
    openNotifications: () => setIsNotificationsOpen(true),
    createProject: onCreateProject,
    createTask: () => console.log('Create task'),
    createEquipment: () => console.log('Create equipment')
  });

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsSearchOpen(true)}
              className="relative flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors w-64 lg:w-96"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500 text-left flex-1">
                Rechercher un projet, équipement...
              </span>
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                ⌘K
              </kbd>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">Pierre Dubois</p>
                <p className="text-xs text-gray-500">Chef de Projet</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
};

export default HeaderUpdated;