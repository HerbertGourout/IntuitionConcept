import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Comparaison avec les vrais concurrents du marché BTP
 * Données basées sur l'analyse des solutions existantes (Sage, EBP, Onaya, Alobees, Procore)
 */

interface Competitor {
  name: string;
  origin: string;
  target: string;
  mobileMoney: boolean;
  offlineMode: boolean;
  africanSupport: boolean;
  localCurrency: boolean;
  aiDevis: boolean;
  gpsTracking: boolean;
  mobileApp: boolean;
  frenchSupport: boolean;
  price: string;
  priceNote?: string;
  weaknesses: string[];
}

const CompetitorComparison: React.FC = () => {
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const competitors: Competitor[] = [
    {
      name: 'IntuitionConcept',
      origin: '🇨🇬 Congo',
      target: 'Artisans & PME Afrique',
      mobileMoney: true,
      offlineMode: true,
      africanSupport: true,
      localCurrency: true,
      aiDevis: true,
      gpsTracking: true,
      mobileApp: true,
      frenchSupport: true,
      price: '15 000 FCFA/mois',
      priceNote: '≈ 23€',
      weaknesses: []
    },
    {
      name: 'Sage Batigest',
      origin: '🇫🇷 France',
      target: 'PME Europe',
      mobileMoney: false,
      offlineMode: false,
      africanSupport: false,
      localCurrency: false,
      aiDevis: false,
      gpsTracking: false,
      mobileApp: false,
      frenchSupport: true,
      price: '~150€/mois',
      weaknesses: [
        'Pas de Mobile Money',
        'Nécessite connexion internet stable',
        'Support uniquement en France métropolitaine',
        'Interface complexe, formation obligatoire',
        'Pas adapté aux réalités terrain africaines'
      ]
    },
    {
      name: 'EBP Bâtiment',
      origin: '🇫🇷 France',
      target: 'TPE/PME Europe',
      mobileMoney: false,
      offlineMode: true,
      africanSupport: false,
      localCurrency: false,
      aiDevis: false,
      gpsTracking: false,
      mobileApp: false,
      frenchSupport: true,
      price: '~80€/mois',
      weaknesses: [
        'Pas de gestion de planning intégrée',
        'Pas de module CRM',
        'Factures non modifiables après validation',
        'Logiciel jugé "usine à gaz" par utilisateurs',
        'Pas de paiement Mobile Money'
      ]
    },
    {
      name: 'Onaya',
      origin: '🇫🇷 France',
      target: 'PME/Grandes entreprises',
      mobileMoney: false,
      offlineMode: false,
      africanSupport: false,
      localCurrency: false,
      aiDevis: false,
      gpsTracking: false,
      mobileApp: false,
      frenchSupport: true,
      price: 'Sur devis',
      priceNote: 'Souvent >200€/mois',
      weaknesses: [
        'Pas d\'essai gratuit',
        'Assistance payante en supplément',
        'Tarifs non transparents',
        'Conçu pour le marché français uniquement',
        'Pas de mode hors-ligne'
      ]
    },
    {
      name: 'Alobees',
      origin: '🇫🇷 France',
      target: 'TPE/PME Europe',
      mobileMoney: false,
      offlineMode: true,
      africanSupport: false,
      localCurrency: false,
      aiDevis: false,
      gpsTracking: true,
      mobileApp: true,
      frenchSupport: true,
      price: '~50€/mois + 10€/user',
      weaknesses: [
        'Pas de facturation intégrée',
        'Pas de comptabilité',
        'Pas de visionnage des plans',
        'Pas de Mobile Money',
        'Support uniquement Europe'
      ]
    },
    {
      name: 'Procore',
      origin: '🇺🇸 USA',
      target: 'Grandes entreprises',
      mobileMoney: false,
      offlineMode: true,
      africanSupport: false,
      localCurrency: false,
      aiDevis: false,
      gpsTracking: true,
      mobileApp: true,
      frenchSupport: false,
      price: '>10 000$/an',
      priceNote: '≈ 6M FCFA/an',
      weaknesses: [
        'Prix prohibitif pour PME africaines',
        'Interface en anglais principalement',
        'Pas de support francophone Afrique',
        'Pas de Mobile Money',
        'Conçu pour marchés US/Europe'
      ]
    }
  ];

  const features = [
    { id: 'mobileMoney', label: 'Paiement Mobile Money', description: 'Orange Money, MTN, Wave...' },
    { id: 'offlineMode', label: 'Mode Hors-Ligne', description: 'Fonctionne sans internet' },
    { id: 'africanSupport', label: 'Support Afrique', description: 'Équipes locales, fuseaux horaires' },
    { id: 'localCurrency', label: 'Devises Locales', description: 'FCFA, Franc Congolais...' },
    { id: 'aiDevis', label: 'Devis IA', description: 'Génération automatique de devis' },
    { id: 'gpsTracking', label: 'Suivi GPS Équipes', description: 'Localisation temps réel' },
    { id: 'mobileApp', label: 'App Mobile Complète', description: 'Toutes fonctions sur mobile' },
    { id: 'frenchSupport', label: 'Support Français', description: 'Assistance en français' }
  ];

  const renderValue = (value: boolean) => {
    return value ? (
      <span className="text-[#4A7C59] font-bold text-lg">✓</span>
    ) : (
      <span className="text-[#C45C3E] font-bold text-lg">✗</span>
    );
  };

  // Afficher seulement les 4 premiers concurrents dans le tableau principal
  const mainCompetitors = competitors.slice(0, 4);

  return (
    <section className="py-20 bg-[#F5F0E8]">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="font-handwritten text-xl text-[#C45C3E] mb-2" style={{ transform: 'rotate(-1deg)' }}>
            → Comparaison honnête avec la concurrence
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Pourquoi <span className="text-[#1E4B6E]">IntuitionConcept</span> ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Les solutions européennes ne sont pas conçues pour l'Afrique. 
            Nous avons créé l'outil qu'il vous fallait.
          </p>
        </motion.div>

        {/* Tableau de comparaison */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="overflow-x-auto mb-12"
        >
          <table className="w-full min-w-[900px] bg-white rounded-2xl shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-4 px-4 text-left text-gray-600 font-medium">Critère</th>
                {mainCompetitors.map((competitor, index) => (
                  <th
                    key={competitor.name}
                    className={`py-4 px-3 text-center ${
                      index === 0 ? 'bg-[#1E4B6E] text-white' : 'text-gray-700'
                    }`}
                  >
                    <span className="block font-bold">{competitor.name}</span>
                    <span className="block text-xs opacity-70 mt-1">{competitor.origin}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr key={feature.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-800">{feature.label}</span>
                    <span className="block text-xs text-gray-500">{feature.description}</span>
                  </td>
                  {mainCompetitors.map((competitor, index) => (
                    <td
                      key={`${competitor.name}-${feature.id}`}
                      className={`py-3 px-3 text-center ${
                        index === 0 ? 'bg-[#1E4B6E]/5' : ''
                      }`}
                    >
                      {renderValue(competitor[feature.id as keyof Competitor] as boolean)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Ligne Prix */}
              <tr className="border-t-2 border-gray-200 bg-gray-100">
                <td className="py-4 px-4 font-bold text-gray-900">Prix mensuel</td>
                {mainCompetitors.map((competitor, index) => (
                  <td
                    key={`${competitor.name}-price`}
                    className={`py-4 px-3 text-center ${
                      index === 0 ? 'bg-[#4A7C59] text-white font-bold' : 'text-gray-700'
                    }`}
                  >
                    <span className="block font-bold">{competitor.price}</span>
                    {competitor.priceNote && (
                      <span className="block text-xs opacity-70">{competitor.priceNote}</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </motion.div>

        {/* Faiblesses des concurrents - Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Ce que les autres ne font pas
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors.slice(1).map((competitor) => (
              <div 
                key={competitor.name}
                className="bg-white rounded-xl p-5 shadow-md border-l-4 border-[#C45C3E]"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">{competitor.name}</h4>
                  <span className="text-xs text-gray-500">{competitor.origin}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Cible : {competitor.target}</p>
                <ul className="space-y-1">
                  {competitor.weaknesses.slice(0, 3).map((weakness, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-[#C45C3E] mt-0.5">✗</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowDetails(showDetails === competitor.name ? null : competitor.name)}
                  className="mt-3 text-xs text-[#1E4B6E] hover:underline flex items-center gap-1"
                >
                  {showDetails === competitor.name ? 'Moins' : 'Plus de détails'}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showDetails === competitor.name ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showDetails === competitor.name && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 space-y-1 overflow-hidden"
                    >
                      {competitor.weaknesses.slice(3).map((weakness, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-[#C45C3E] mt-0.5">✗</span>
                          {weakness}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-gray-600 mb-4">
            Conçu en Afrique, pour l'Afrique. Avec les réalités du terrain en tête.
          </p>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-[#1E4B6E] text-white px-8 py-4 rounded-xl font-bold inline-flex items-center gap-2 shadow-lg"
            >
              Essayer gratuitement 14 jours
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <p className="text-sm text-gray-500 mt-3">Sans carte bancaire • Support en français</p>
        </motion.div>
      </div>
    </section>
  );
};

export default CompetitorComparison;
