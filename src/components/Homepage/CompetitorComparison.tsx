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
  // Fonctionnalités Afrique
  mobileMoney: boolean;
  offlineMode: boolean;
  africanSupport: boolean;
  localCurrency: boolean;
  // IA & Innovation
  aiPlanAnalysis: boolean;
  aiQuoteGeneration: boolean;
  ai3DRender: boolean;
  aiAnomalyDetection: boolean;
  aiMarketIntelligence: boolean;
  aiVoiceAssistant: boolean;
  // Terrain & Mobile
  gpsTracking: boolean;
  geofencing: boolean;
  offlineReports: boolean;
  photoGeotagging: boolean;
  mobileApp: boolean;
  // Gestion
  ganttPlanning: boolean;
  priceLibrary: boolean;
  documentManagement: boolean;
  multiCurrency: boolean;
  // Support
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
      // Afrique
      mobileMoney: true,
      offlineMode: true,
      africanSupport: true,
      localCurrency: true,
      // IA (7 modules)
      aiPlanAnalysis: true,
      aiQuoteGeneration: true,
      ai3DRender: true,
      aiAnomalyDetection: true,
      aiMarketIntelligence: true,
      aiVoiceAssistant: true,
      // Terrain
      gpsTracking: true,
      geofencing: true,
      offlineReports: true,
      photoGeotagging: true,
      mobileApp: true,
      // Gestion
      ganttPlanning: true,
      priceLibrary: true,
      documentManagement: true,
      multiCurrency: true,
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
      aiPlanAnalysis: false,
      aiQuoteGeneration: false,
      ai3DRender: false,
      aiAnomalyDetection: false,
      aiMarketIntelligence: false,
      aiVoiceAssistant: false,
      gpsTracking: false,
      geofencing: false,
      offlineReports: false,
      photoGeotagging: false,
      mobileApp: false,
      ganttPlanning: true,
      priceLibrary: true,
      documentManagement: true,
      multiCurrency: false,
      frenchSupport: true,
      price: '~150€/mois',
      weaknesses: [
        'Aucun module IA',
        'Pas de Mobile Money',
        'Nécessite connexion internet stable',
        'Support uniquement France métropolitaine',
        'Interface complexe, formation obligatoire'
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
      aiPlanAnalysis: false,
      aiQuoteGeneration: false,
      ai3DRender: false,
      aiAnomalyDetection: false,
      aiMarketIntelligence: false,
      aiVoiceAssistant: false,
      gpsTracking: false,
      geofencing: false,
      offlineReports: false,
      photoGeotagging: false,
      mobileApp: false,
      ganttPlanning: false,
      priceLibrary: true,
      documentManagement: false,
      multiCurrency: false,
      frenchSupport: true,
      price: '~80€/mois',
      weaknesses: [
        'Aucun module IA',
        'Pas de planning Gantt intégré',
        'Pas de suivi terrain/GPS',
        'Logiciel jugé "usine à gaz"',
        'Pas de Mobile Money'
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
      aiPlanAnalysis: false,
      aiQuoteGeneration: false,
      ai3DRender: false,
      aiAnomalyDetection: false,
      aiMarketIntelligence: false,
      aiVoiceAssistant: false,
      gpsTracking: false,
      geofencing: false,
      offlineReports: false,
      photoGeotagging: false,
      mobileApp: false,
      ganttPlanning: true,
      priceLibrary: true,
      documentManagement: true,
      multiCurrency: false,
      frenchSupport: true,
      price: 'Sur devis',
      priceNote: 'Souvent >200€/mois',
      weaknesses: [
        'Aucun module IA',
        'Pas d\'essai gratuit',
        'Assistance payante en supplément',
        'Pas de mode hors-ligne',
        'Marché français uniquement'
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
      aiPlanAnalysis: false,
      aiQuoteGeneration: false,
      ai3DRender: false,
      aiAnomalyDetection: false,
      aiMarketIntelligence: false,
      aiVoiceAssistant: false,
      gpsTracking: true,
      geofencing: false,
      offlineReports: true,
      photoGeotagging: true,
      mobileApp: true,
      ganttPlanning: true,
      priceLibrary: false,
      documentManagement: false,
      multiCurrency: false,
      frenchSupport: true,
      price: '~50€/mois + 10€/user',
      weaknesses: [
        'Aucun module IA',
        'Pas de facturation intégrée',
        'Pas de bibliothèque de prix',
        'Pas de Mobile Money',
        'Support Europe uniquement'
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
      aiPlanAnalysis: false,
      aiQuoteGeneration: false,
      ai3DRender: false,
      aiAnomalyDetection: true,
      aiMarketIntelligence: false,
      aiVoiceAssistant: false,
      gpsTracking: true,
      geofencing: true,
      offlineReports: true,
      photoGeotagging: true,
      mobileApp: true,
      ganttPlanning: true,
      priceLibrary: true,
      documentManagement: true,
      multiCurrency: true,
      frenchSupport: false,
      price: '>10 000$/an',
      priceNote: '≈ 6M FCFA/an',
      weaknesses: [
        'Prix prohibitif (6M FCFA/an)',
        'Interface en anglais',
        'Pas de support Afrique francophone',
        'Pas de Mobile Money',
        'IA limitée (1 module sur 6)'
      ]
    }
  ];

  // Catégories de fonctionnalités
  const featureCategories = [
    {
      name: '🌍 Adapté à l\'Afrique',
      features: [
        { id: 'mobileMoney', label: 'Mobile Money', description: 'Orange, MTN, Wave, Moov' },
        { id: 'offlineMode', label: 'Mode Hors-Ligne', description: 'Fonctionne sans internet' },
        { id: 'africanSupport', label: 'Support Afrique', description: 'Équipes locales' },
        { id: 'localCurrency', label: 'Multi-devises', description: 'FCFA, CDF, EUR...' },
      ]
    },
    {
      name: '🤖 Intelligence Artificielle',
      features: [
        { id: 'aiPlanAnalysis', label: 'Analyse de plans', description: 'OCR + extraction auto' },
        { id: 'aiQuoteGeneration', label: 'Devis automatiques', description: 'Génération IA' },
        { id: 'ai3DRender', label: 'Rendu 3D', description: 'Visualisation projets' },
        { id: 'aiAnomalyDetection', label: 'Détection anomalies', description: 'Alertes budget/planning' },
        { id: 'aiMarketIntelligence', label: 'Intelligence marché', description: 'Prix matériaux temps réel' },
        { id: 'aiVoiceAssistant', label: 'Assistant vocal', description: 'Commandes vocales FR' },
      ]
    },
    {
      name: '📍 Terrain & Mobile',
      features: [
        { id: 'gpsTracking', label: 'Suivi GPS équipes', description: 'Localisation temps réel' },
        { id: 'geofencing', label: 'Géofencing', description: 'Zones de chantier' },
        { id: 'offlineReports', label: 'Rapports terrain', description: 'Photos + notes offline' },
        { id: 'photoGeotagging', label: 'Photos géolocalisées', description: 'Preuves terrain' },
        { id: 'mobileApp', label: 'App mobile complète', description: 'Toutes fonctions' },
      ]
    },
    {
      name: '📊 Gestion de projet',
      features: [
        { id: 'ganttPlanning', label: 'Planning Gantt', description: 'Diagramme interactif' },
        { id: 'priceLibrary', label: 'Bibliothèque prix', description: 'Tarifs locaux' },
        { id: 'documentManagement', label: 'GED', description: 'Gestion documents' },
        { id: 'frenchSupport', label: 'Support français', description: 'Assistance FR' },
      ]
    }
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

        {/* Tableau de comparaison par catégorie */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="overflow-x-auto mb-12"
        >
          <table className="w-full min-w-[900px] bg-white rounded-2xl shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-4 px-4 text-left text-gray-600 font-medium">Fonctionnalité</th>
                {mainCompetitors.map((competitor, index) => (
                  <th
                    key={competitor.name}
                    className={`py-4 px-3 text-center ${
                      index === 0 ? 'bg-[#1E4B6E] text-white' : 'text-gray-700'
                    }`}
                  >
                    <span className="block font-bold text-sm">{competitor.name}</span>
                    <span className="block text-xs opacity-70 mt-1">{competitor.origin}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureCategories.map((category) => (
                <React.Fragment key={category.name}>
                  {/* Ligne de catégorie */}
                  <tr className="bg-[#1E4B6E]/10">
                    <td colSpan={mainCompetitors.length + 1} className="py-2 px-4 font-bold text-[#1E4B6E]">
                      {category.name}
                    </td>
                  </tr>
                  {/* Fonctionnalités de la catégorie */}
                  {category.features.map((feature, idx) => (
                    <tr key={feature.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-4">
                        <span className="font-medium text-gray-800 text-sm">{feature.label}</span>
                        <span className="block text-xs text-gray-500">{feature.description}</span>
                      </td>
                      {mainCompetitors.map((competitor, index) => (
                        <td
                          key={`${competitor.name}-${feature.id}`}
                          className={`py-2 px-3 text-center ${
                            index === 0 ? 'bg-[#1E4B6E]/5' : ''
                          }`}
                        >
                          {renderValue(competitor[feature.id as keyof Competitor] as boolean)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              {/* Ligne Prix */}
              <tr className="border-t-2 border-gray-200 bg-gray-100">
                <td className="py-4 px-4 font-bold text-gray-900">💰 Prix mensuel</td>
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

        {/* Score IA - Mise en avant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-12 bg-gradient-to-r from-[#1E4B6E] to-[#2d6a9f] rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-6 text-center">
            🤖 Modules IA : IntuitionConcept vs Concurrence
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {competitors.slice(0, 6).map((competitor) => {
              const aiCount = [
                competitor.aiPlanAnalysis,
                competitor.aiQuoteGeneration,
                competitor.ai3DRender,
                competitor.aiAnomalyDetection,
                competitor.aiMarketIntelligence,
                competitor.aiVoiceAssistant
              ].filter(Boolean).length;
              
              return (
                <div 
                  key={competitor.name}
                  className={`text-center p-4 rounded-xl ${
                    competitor.name === 'IntuitionConcept' 
                      ? 'bg-white/20 ring-2 ring-[#E5A832]' 
                      : 'bg-white/10'
                  }`}
                >
                  <p className="text-3xl font-bold font-display">{aiCount}/6</p>
                  <p className="text-sm opacity-80">{competitor.name}</p>
                  <p className="text-xs opacity-60">{competitor.origin}</p>
                </div>
              );
            })}
          </div>
          <p className="text-center mt-6 text-sm opacity-80">
            IntuitionConcept est la seule solution avec 6 modules IA intégrés
          </p>
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
