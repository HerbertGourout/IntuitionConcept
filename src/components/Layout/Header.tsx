import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between z-10">
      <div className="flex items-center">
        <button onClick={onMenuToggle} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden">
          <Menu className="text-gray-600 dark:text-gray-300" />
        </button>
        <div className="relative hidden md:block ml-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">Utilisateur</p>
              <p className="text-xs text-gray-500">Chef de Projet</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;