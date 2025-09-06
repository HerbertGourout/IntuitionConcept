import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ChevronDown,
  Zap,
  Users,
  BarChart3,
  Calendar,
  FileText,
  Smartphone,
  Shield,
  ArrowRight
} from 'lucide-react';
import NotificationBell from '../Notifications/NotificationBell';

interface ModernHeaderProps {
  forceSolid?: boolean; // force un fond opaque et des textes sombres (utile en in-app)
  onNavigate?: (section: string) => void; // navigation interne pour /app/*
  currentSection?: string; // section active de l'app pour surligner le menu
}

const ModernHeader: React.FC<ModernHeaderProps> = ({ forceSolid = false, onNavigate, currentSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  // Détection du scroll pour effet glassmorphism
  useEffect(() => {
    if (forceSolid) {
      setIsScrolled(true);
      return;
    }
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [forceSolid]);

  const solid = forceSolid || isScrolled;

  // util pour router interne de l'app
  const sectionFromHref = (href: string): string | null => {
    const m = href.match(/^\/app\/(.+)$/);
    return m ? m[1] : null;
  };

  // Types forts pour les éléments de menu
  type DropdownItem = {
    name: string;
    href: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    description?: string;
  };

  type MenuItem = {
    name: string;
    href: string;
    hasDropdown?: boolean;
    dropdownItems?: DropdownItem[];
  };

  const isItemActive = (item: MenuItem): boolean => {
    const section = sectionFromHref(item.href || '');
    if (item.hasDropdown && item.dropdownItems) {
      return item.dropdownItems.some((d: DropdownItem) => sectionFromHref(d.href || '') === currentSection);
    }
    if (section && currentSection) return section === currentSection;
    // fallback pour liens marketing
    return location.pathname === item.href;
  };

  const menuItems: MenuItem[] = [
    {
      name: 'Fonctionnalités',
      href: '#',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Gestion de Projets', href: '/app/projects', icon: BarChart3, description: 'Organisez vos projets efficacement' },
        { name: 'Équipes & Collaboration', href: '/app/team', icon: Users, description: 'Travaillez en équipe facilement' },
        { name: 'Planning & Gantt', href: '/app/planning', icon: Calendar, description: 'Planifiez avec des diagrammes Gantt' },
        { name: 'Documents', href: '/app/documents', icon: FileText, description: 'Gérez vos documents en un lieu' },
        { name: 'Finances & Paiements', href: '/app/finances', icon: Smartphone, description: 'Gestion financière et paiements' },
      ]
    },
    {
      name: 'Outils',
      href: '#',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Tableau de Bord', href: '/app/dashboard', icon: BarChart3, description: 'Vue d\'ensemble de vos projets' },
        { name: 'Tâches', href: '/app/tasks', icon: Calendar, description: 'Gestion des tâches' },
        { name: 'Équipements', href: '/app/equipment', icon: Shield, description: 'Gestion des équipements' },
        { name: 'Bons de Commande', href: '/app/purchase-orders', icon: FileText, description: 'Gestion des commandes' },
      ]
    },
    { name: 'Tarification', href: '/pricing' },
    { name: 'Connexion', href: '/login' },
  ];

  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const logoVariants = {
    hover: { 
      scale: 1.05,
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.3 }
    }
  };

  const menuItemVariants = {
    hover: { 
      scale: 1.05,
      color: "#3B82F6",
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid 
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo animé */}
          <motion.div
            variants={logoVariants}
            whileHover="hover"
            className="flex items-center space-x-3"
          >
            <Link to="/" className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  IntuitionConcept
                </motion.h1>
                <motion.p 
                  className="text-xs text-gray-500 -mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  SaaS pour l'Afrique
                </motion.p>
              </div>
            </Link>
          </motion.div>

          {/* Navigation desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item, index) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <motion.div
                  variants={menuItemVariants}
                  whileHover="hover"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.hasDropdown ? (
                    <button className={`flex items-center space-x-1 font-medium transition-colors relative ${
                      isItemActive(item)
                        ? 'text-blue-600'
                        : solid 
                          ? 'text-gray-800 hover:text-blue-600' 
                          : 'text-white hover:text-blue-200 drop-shadow-lg'
                    }`}>
                      <span className="relative">
                        <span>{item.name}</span>
                        <span
                          className={`absolute left-0 -bottom-1 h-0.5 rounded bg-blue-600 transition-all duration-200 ${
                            isItemActive(item) ? 'w-full opacity-100' : 'w-0 opacity-0'
                          }`}
                        />
                      </span>
                      <motion.div
                        animate={{ rotate: activeDropdown === item.name ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className={`font-medium transition-colors relative ${
                        isItemActive(item)
                          ? 'text-blue-600'
                          : solid 
                            ? 'text-gray-800 hover:text-blue-600' 
                            : 'text-white hover:text-blue-200 drop-shadow-lg'
                      }`}
                      onClick={(e) => {
                        const section = sectionFromHref(item.href);
                        if (section && onNavigate) {
                          e.preventDefault();
                          onNavigate(section);
                        }
                      }}
                    >
                      <span className="relative">
                        <span>{item.name}</span>
                        <span
                          className={`absolute left-0 -bottom-1 h-0.5 rounded bg-blue-600 transition-all duration-200 ${
                            isItemActive(item) ? 'w-full opacity-100' : 'w-0 opacity-0'
                          }`}
                        />
                      </span>
                    </Link>
                  )}
                </motion.div>

                {/* Dropdown mega menu */}
                <AnimatePresence>
                  {item.hasDropdown && activeDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-6"
                    >
                      <div className="space-y-4">
                        {item.dropdownItems?.map((dropdownItem, idx) => (
                          <motion.div
                            key={dropdownItem.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ x: 5, backgroundColor: "#F8FAFC" }}
                            className="p-3 rounded-xl transition-all duration-200"
                          >
                            <Link
                              to={dropdownItem.href}
                              className={`flex items-start space-x-3 group ${sectionFromHref(dropdownItem.href) === currentSection ? 'text-blue-600' : ''}`}
                              onClick={(e) => {
                                const section = sectionFromHref(dropdownItem.href);
                                if (section && onNavigate) {
                                  e.preventDefault();
                                  setIsMenuOpen(false);
                                  setActiveDropdown(null);
                                  onNavigate(section);
                                }
                              }}
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                {dropdownItem.icon
                                  ? React.createElement(dropdownItem.icon, { className: 'w-5 h-5 text-white' })
                                  : null}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {dropdownItem.name}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  {dropdownItem.description}
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Notification Bell & Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Notification Bell - only show in app context */}
            {onNavigate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <NotificationBell />
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                to="/login"
                className={`font-medium transition-colors ${
                  solid 
                    ? 'text-gray-800 hover:text-blue-600' 
                    : 'text-white hover:text-blue-200 drop-shadow-lg'
                }`}
              >
                Connexion
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <span>Commencer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Mobile: Notification + Menu */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Notification Bell */}
            {onNavigate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <NotificationBell />
              </motion.div>
            )}
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Menu mobile dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white/95 backdrop-blur-xl rounded-2xl mt-4 p-6 shadow-2xl border border-gray-200/50"
            >
              <div className="space-y-4">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                      onClick={(e) => {
                        const section = sectionFromHref(item.href);
                        if (section && onNavigate) {
                          e.preventDefault();
                          setIsMenuOpen(false);
                          onNavigate(section);
                        } else {
                          setIsMenuOpen(false);
                        }
                      }}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                
                <hr className="border-gray-200" />
                
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold text-center transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Commencer
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default ModernHeader;
