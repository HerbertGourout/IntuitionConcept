import React from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';

import {
  Zap,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ArrowRight,
  Heart,
  Globe,
  Shield,
  Smartphone,
  Users,
  BarChart3,
  Calendar,
  FileText,
  CreditCard
} from 'lucide-react';

const ModernFooter: React.FC = () => {
  const footerSections = [
    {
      title: 'Produit',
      links: [
        { name: 'Fonctionnalités', href: '/features', icon: BarChart3 },
        { name: 'Tarification', href: '/pricing', icon: CreditCard },
        { name: 'Mobile Money', href: '/features/payments', icon: Smartphone },
        { name: 'Sécurité', href: '/security', icon: Shield },
      ]
    },
    {
      title: 'Solutions',
      links: [
        { name: 'PME & Startups', href: '/solutions/sme', icon: Users },
        { name: 'Grandes Entreprises', href: '/solutions/enterprise', icon: BarChart3 },
        { name: 'Afrique Francophone', href: '/solutions/francophone', icon: Globe },
        { name: 'Intégrations', href: '/integrations', icon: Calendar },
      ]
    },
    {
      title: 'Ressources',
      links: [
        { name: 'Documentation', href: '/docs', icon: FileText },
        { name: 'API', href: '/api', icon: BarChart3 },
        { name: 'Support', href: '/support', icon: Users },
        { name: 'Blog', href: '/blog', icon: FileText },
      ]
    },
    {
      title: 'Entreprise',
      links: [
        { name: 'À propos', href: '/about', icon: Users },
        { name: 'Carrières', href: '/careers', icon: Heart },
        { name: 'Contact', href: '/contact', icon: Mail },
        { name: 'Partenaires', href: '/partners', icon: Globe },
      ]
    }
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook, color: 'hover:text-blue-600' },
    { name: 'Twitter', href: '#', icon: Twitter, color: 'hover:text-sky-500' },
    { name: 'LinkedIn', href: '#', icon: Linkedin, color: 'hover:text-blue-700' },
    { name: 'Instagram', href: '#', icon: Instagram, color: 'hover:text-pink-600' },
    { name: 'YouTube', href: '#', icon: Youtube, color: 'hover:text-red-600' },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 0.84, 0.44, 1] as const }
    }
  };

  const linkHoverVariants = {
    hover: {
      x: 5,
      color: "#3B82F6",
      transition: { duration: 0.2 }
    }
  };
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Animations de fond */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative">
        {/* Section principale */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="container mx-auto px-6 py-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
            {/* Logo et description */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center"
                >
                  <Zap className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    IntuitionConcept
                  </h3>
                  <p className="text-sm text-gray-400">SaaS pour l'Afrique</p>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-6">
                La plateforme de gestion de projets conçue spécialement pour l'Afrique francophone. 
                Gérez vos projets, équipes et paiements Mobile Money en toute simplicité.
              </p>

              {/* Statistiques animées */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { number: '10K+', label: 'Utilisateurs' },
                  { number: '25+', label: 'Pays' },
                  { number: '99.9%', label: 'Uptime' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                      className="text-2xl font-bold text-blue-400"
                    >
                      {stat.number}
                    </motion.div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Réseaux sociaux */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className={`w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300 backdrop-blur-sm`}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Liens de navigation */}
            {footerSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                variants={itemVariants}
                className="lg:col-span-1"
              >
                <h4 className="text-lg font-semibold mb-6 text-white">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: (sectionIndex * 0.1) + (linkIndex * 0.05), duration: 0.4 }}
                    >
                      <motion.div
                        variants={linkHoverVariants}
                        whileHover="hover"
                      >
                        <Link
                          to={link.href}
                          className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors group"
                        >
                          <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span>{link.name}</span>
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </Link>
                      </motion.div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Newsletter */}
          <motion.div
            variants={itemVariants}
            className="mt-16 p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h4 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Restez informé
                </h4>
                <p className="text-gray-300">
                  Recevez les dernières nouvelles sur nos fonctionnalités et l'écosystème SaaS africain.
                </p>
              </div>
              <div className="flex space-x-3">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <span>S'abonner</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Barre de copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="border-t border-white/10 py-8"
        >
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-2 text-gray-400">
                <span>© 2024 IntuitionConcept. Fait avec</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                </motion.div>
                <span>pour l'Afrique francophone.</span>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <Link to="/privacy" className="hover:text-blue-400 transition-colors">
                  Confidentialité
                </Link>
                <Link to="/terms" className="hover:text-blue-400 transition-colors">
                  Conditions
                </Link>
                <Link to="/cookies" className="hover:text-blue-400 transition-colors">
                  Cookies
                </Link>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Français</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default ModernFooter;
