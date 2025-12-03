import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Images
import satisfiedCustomer from '../../assets/images/homepage/satisfied-customer.jpg';
import heroConstructionTeam from '../../assets/images/homepage/hero-construction-team.jpg';
import digitalConstructionTeam from '../../assets/images/homepage/digital-construction-team.jpg';

interface CaseStudy {
  id: string;
  company: string;
  sector: string;
  location: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    value: string;
    description: string;
  }[];
  quote: string;
  author: {
    name: string;
    role: string;
    photo: string;
  };
  coverImage: string;
  duration: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: 'btp-congo',
    company: 'BTP Solutions Congo',
    sector: 'Construction résidentielle',
    location: 'Brazzaville, Congo',
    challenge: 'Gestion de 12 chantiers simultanés avec des équipes dispersées et aucune visibilité sur les coûts réels.',
    solution: 'Déploiement d\'IntuitionConcept avec suivi GPS des équipes, tableau de bord financier et rapports automatiques.',
    results: [
      { metric: 'Temps gagné', value: '15h', description: 'par semaine sur l\'administratif' },
      { metric: 'Dépassements', value: '-45%', description: 'de réduction des dépassements budget' },
      { metric: 'Paiements', value: '3x', description: 'plus rapides via Mobile Money' },
    ],
    quote: 'Avant, je passais mes week-ends à consolider les rapports. Maintenant tout est automatique.',
    author: {
      name: 'Patrick Moungali',
      role: 'Directeur Général',
      photo: satisfiedCustomer
    },
    coverImage: heroConstructionTeam,
    duration: '3 mois de déploiement'
  },
  {
    id: 'constructions-kinshasa',
    company: 'Constructions Modernes RDC',
    sector: 'Bâtiments commerciaux',
    location: 'Kinshasa, RDC',
    challenge: 'Devis manuels chronophages, erreurs fréquentes et difficultés à suivre la rentabilité par projet.',
    solution: 'Utilisation du module IA pour génération automatique de devis et analyse des plans architecturaux.',
    results: [
      { metric: 'Devis', value: '10min', description: 'au lieu de 2h par devis' },
      { metric: 'Précision', value: '+30%', description: 'd\'amélioration sur les estimations' },
      { metric: 'Contrats', value: '+25%', description: 'de taux de conversion' },
    ],
    quote: 'L\'IA analyse nos plans et génère des devis précis en quelques minutes. C\'est révolutionnaire.',
    author: {
      name: 'Clément Makosso',
      role: 'Directeur Commercial',
      photo: satisfiedCustomer
    },
    coverImage: digitalConstructionTeam,
    duration: '6 semaines de déploiement'
  },
  {
    id: 'artisan-douala',
    company: 'Électricité Pro Douala',
    sector: 'Électricité bâtiment',
    location: 'Douala, Cameroun',
    challenge: 'Artisan solo gérant 20+ interventions/mois sans outil de suivi, factures papier, paiements en retard.',
    solution: 'Application mobile IntuitionConcept avec facturation instantanée et paiement Mobile Money intégré.',
    results: [
      { metric: 'Impayés', value: '-80%', description: 'grâce au paiement immédiat' },
      { metric: 'Facturation', value: '2min', description: 'par facture sur mobile' },
      { metric: 'Revenus', value: '+35%', description: 'd\'augmentation en 6 mois' },
    ],
    quote: 'Je facture directement sur le chantier et le client paie par Orange Money. Fini les impayés !',
    author: {
      name: 'Jean-Pierre Nkodo',
      role: 'Artisan Électricien',
      photo: satisfiedCustomer
    },
    coverImage: heroConstructionTeam,
    duration: '1 semaine de prise en main'
  }
];

const CaseStudies: React.FC = () => {
  const [activeStudy, setActiveStudy] = useState<string>(caseStudies[0].id);
  const currentStudy = caseStudies.find(s => s.id === activeStudy) || caseStudies[0];

  return (
    <section className="py-20 bg-[#F5F0E8]">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="font-handwritten text-xl text-[#C45C3E] mb-2" style={{ transform: 'rotate(-1deg)' }}>
            → Des résultats concrets sur le terrain
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Études de cas clients
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez comment des entreprises BTP comme la vôtre ont transformé leur gestion
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {caseStudies.map((study) => (
            <button
              key={study.id}
              onClick={() => setActiveStudy(study.id)}
              className={`px-5 py-3 rounded-xl font-medium transition-all ${
                activeStudy === study.id
                  ? 'bg-[#1E4B6E] text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="block text-sm">{study.company}</span>
              <span className="block text-xs opacity-70">{study.location}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStudy}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto"
          >
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left - Image & Quote */}
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src={currentStudy.coverImage} 
                    alt={currentStudy.company}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="font-bold text-lg">{currentStudy.company}</p>
                    <p className="text-sm opacity-80">{currentStudy.sector} • {currentStudy.location}</p>
                  </div>
                </div>

                {/* Quote */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <p className="text-gray-700 text-lg italic mb-4">
                    "{currentStudy.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img 
                      src={currentStudy.author.photo} 
                      alt={currentStudy.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-gray-900">{currentStudy.author.name}</p>
                      <p className="text-sm text-gray-500">{currentStudy.author.role}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Details */}
              <div className="space-y-6">
                {/* Challenge */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#C45C3E]">
                  <h4 className="font-bold text-[#8B3D2A] mb-2">Le défi</h4>
                  <p className="text-gray-700">{currentStudy.challenge}</p>
                </div>

                {/* Solution */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#1E4B6E]">
                  <h4 className="font-bold text-[#1E4B6E] mb-2">La solution</h4>
                  <p className="text-gray-700">{currentStudy.solution}</p>
                  <p className="text-sm text-gray-500 mt-2">{currentStudy.duration}</p>
                </div>

                {/* Results */}
                <div className="bg-[#4A7C59] rounded-2xl p-6 text-white">
                  <h4 className="font-bold mb-4">Résultats obtenus</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {currentStudy.results.map((result, idx) => (
                      <div key={idx} className="text-center">
                        <p className="text-3xl font-bold font-display">{result.value}</p>
                        <p className="text-xs opacity-80">{result.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link to="/contact">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full bg-[#1E4B6E] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    Obtenir les mêmes résultats
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default CaseStudies;
