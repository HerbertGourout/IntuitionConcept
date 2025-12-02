import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Calendar, 
  DollarSign, 
  FileText, 
  BarChart3,
  Settings,
  Package,
  MapPin,
  ShoppingCart,
  Home,
  CreditCard,
  LogIn,
  UserPlus,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

interface MegaMenuProps {
  isAppMode?: boolean;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ isAppMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Accueil',
      href: '/',
      icon: <Home className="w-4 h-4" />,
      showInApp: false
    },
    {
      label: 'Fonctionnalités',
      href: '#',
      icon: <Building2 className="w-4 h-4" />,
      showInApp: false,
      dropdown: [
        {
          category: 'Gestion de Projets',
          items: [
            { label: 'Tableau de Bord', href: '/app/dashboard', icon: <BarChart3 className="w-4 h-4" />, description: 'Vue d\'ensemble de vos projets' },
            { label: 'Projets', href: '/app/projects', icon: <Building2 className="w-4 h-4" />, description: 'Gérez vos projets de construction' },
            { label: 'Tâches', href: '/app/tasks', icon: <FileText className="w-4 h-4" />, description: 'Organisez et suivez les tâches' },
            { labelgrammes de Gantt interactifs' }
          ]
        },
        {
          category: 'Ressources',
          items: [
            { label: 'Équipe', href: '/app/team', icon: <Users className="w-4 h-4" />, description: 'Gestion des membres d\'équipe' },
            { label: 'Équipements', href: '/app/equipment', icon: <Package className="w-4 h-4" />, description: 'Inventaire des équipements' },
            { label: 'Localisations', href: '/app/locations', icon: <MapPin className="w-4 h-4" />, description: 'Gestion des sites de travail' }
          ]
        },
        {
          category: 'Finance & Admin',
          items: [
            { label: 'Finances', href: '/app/finances', icon: <DollarSign className="w-4 h-4" />, description: 'Budgets et dépenses' },
            { label: 'Bons de Commande', href: '/app/purchase-orders', icon: <ShoppingCart className="w-4 h-4" />, description: 'Gestion des commandes' },
            { label: 'Documents', href: '/app/documents', icon: <FileText className="w-4 h-4" />, description: 'Centralisation documentaire' },
            { label: 'Paramètres', href: '/app/settings', icon: <Settings className="w-4 h-4" />, description: 'Configuration de l\'application' }
          ]
        }
      ]
    },
    {
      label: 'Tarifs',
      href: '/pricing',
      icon: <CreditCard className="w-4 h-4" />,
      showInApp: true
    }
  ];

  const authItems = [
    {
      label: 'Connexion',
      href: '/login',
      icon: <LogIn className="w-4 h-4" />,
      variant: 'outline' as const
    },
    {
      label: 'Inscription',
      href: '/register',
      icon: <UserPlus className="w-4 h-4" />,
      variant: 'primary' as const
    }
  ];

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">IntuitionBTP</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems
              .filter(item => !isAppMode || item.showInApp)
              .map((item) => (
              <div key={item.label} className="relative">
                {item.dropdown ? (
                  <button
                    onClick={() => handleDropdownToggle(item.label)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeDropdown === item.label
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      activeDropdown === item.label ? 'rotate-180' : ''
                    }`} />
                  </button>
                ) : (
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )}
              </div>
            ))}

            {/* Auth Buttons */}
            {!isAppMode && (
              <div className="flex items-center space-x-4 ml-8 pl-8 border-l border-gray-200">
                {authItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.variant === 'primary'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {activeDropdown === 'Fonctionnalités' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 bg-white shadow-xl border-t border-gray-200"
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid md:grid-cols-3 gap-8">
                {navigationItems
                  .find(item => item.label === 'Fonctionnalités')
                  ?.dropdown?.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                      {category.category}
                    </h3>
                    <div className="space-y-3">
                      {category.items.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="text-blue-600 mt-1 group-hover:text-blue-700">
                              {item.icon}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                                {item.label}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-6 space-y-4">
              {navigationItems
                .filter(item => !isAppMode || item.showInApp)
                .map((item) => (
                <div key={item.label}>
                  {item.dropdown ? (
                    <div>
                      <button
                        onClick={() => handleDropdownToggle(item.label)}
                        className="flex items-center justify-between w-full px-3 py-2 text-left text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${
                          activeDropdown === item.label ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 ml-4 space-y-2"
                          >
                            {item.dropdown?.map((category) => (
                              <div key={category.category}>
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                  {category.category}
                                </div>
                                {category.items.map((subItem) => (
                                  <Link
                                    key={subItem.label}
                                    to={subItem.href}
                                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                                    onClick={() => {
                                      setIsOpen(false);
                                      setActiveDropdown(null);
                                    }}
                                  >
                                    {subItem.icon}
                                    <span>{subItem.label}</span>
                                  </Link>
                                ))}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile Auth Buttons */}
              {!isAppMode && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {authItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-colors w-full ${
                        item.variant === 'primary'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default MegaMenu;
