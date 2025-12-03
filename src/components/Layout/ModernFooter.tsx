import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

/**
 * Footer avec empreinte africaine authentique
 * Design cohérent avec le header et le design system BTP Africa
 */
const ModernFooter: React.FC = () => {
  const footerSections = [
    {
      title: 'Solutions',
      links: [
        { name: 'Artisans & Indépendants', href: '/solutions/artisan' },
        { name: 'PME du BTP', href: '/solutions/pme' },
        { name: 'Grandes Entreprises', href: '/solutions/enterprise' },
      ]
    },
    {
      title: 'Produit',
      links: [
        { name: 'Fonctionnalités', href: '/features' },
        { name: 'Tarifs', href: '/pricing' },
        { name: 'Démo gratuite', href: '/contact' },
      ]
    },
    {
      title: 'Ressources',
      links: [
        { name: 'Support & FAQ', href: '/support' },
        { name: 'Contact', href: '/contact' },
        { name: 'À propos', href: '/about' },
      ]
    }
  ];

  const offices = [
    { city: 'Brazzaville', country: 'Congo' },
    { city: 'Kinshasa', country: 'RDC' },
    { city: 'Douala', country: 'Cameroun' },
    { city: 'Paris', country: 'France' },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Motif africain en fond */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='%23C45C3E' fill-opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }}
      />

      {/* Bande latérite en haut */}
      <div className="h-2 bg-gradient-to-r from-[#C45C3E] via-[#E5A832] to-[#4A7C59]" />

      {/* Section principale */}
      <div className="bg-[#1E4B6E] text-white relative">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            
            {/* Logo et description */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                {/* Logo avec couleurs terrain */}
                <div className="w-12 h-12 bg-[#C45C3E] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">IC</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">IntuitionConcept</h3>
                  <p className="text-sm text-[#E5A832]">Gestion BTP pour l'Afrique</p>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-8 max-w-md">
                La plateforme de gestion de chantiers conçue pour les réalités du terrain africain. 
                Mobile Money, mode hors-ligne, support local.
              </p>

              {/* Bureaux */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-[#E5A832] uppercase tracking-wider mb-4">
                  Nos bureaux
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {offices.map((office) => (
                    <div key={office.city} className="flex items-center gap-2 text-gray-300 text-sm">
                      <MapPin className="w-3 h-3 text-[#C45C3E]" />
                      <span>{office.city}, {office.country}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact direct */}
              <div className="space-y-2">
                <a href="tel:+242065000000" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm">
                  <Phone className="w-4 h-4 text-[#4A7C59]" />
                  <span>+242 06 500 00 00</span>
                </a>
                <a href="mailto:contact@intuitionconcept.com" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm">
                  <Mail className="w-4 h-4 text-[#4A7C59]" />
                  <span>contact@intuitionconcept.com</span>
                </a>
              </div>
            </div>

            {/* Liens de navigation */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-[#E5A832] uppercase tracking-wider mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-gray-300 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA Newsletter - Style terrain */}
          <div className="mt-16 p-6 bg-[#C45C3E]/10 border border-[#C45C3E]/30 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-bold text-white mb-1">
                  Prêt à simplifier vos chantiers ?
                </h4>
                <p className="text-gray-300 text-sm">
                  Essai gratuit 14 jours, sans carte bancaire
                </p>
              </div>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-[#C45C3E] text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-[#a84d33] transition-colors"
                >
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </div>
        </div>

        {/* Barre de copyright */}
        <div className="border-t border-white/10 py-6">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p>
                © 2024 IntuitionConcept. Conçu en Afrique, pour l'Afrique.
              </p>
              
              <div className="flex items-center gap-6">
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Confidentialité
                </Link>
                <Link to="/terms" className="hover:text-white transition-colors">
                  CGU
                </Link>
                <span className="text-[#E5A832]">FR</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bande végétation en bas */}
      <div className="h-1 bg-[#4A7C59]" />
    </footer>
  );
};

export default ModernFooter;
