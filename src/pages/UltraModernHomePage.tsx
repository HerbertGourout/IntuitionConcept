import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlobalLayout from '../components/Layout/GlobalLayout';
import PageMeta from '../components/SEO/PageMeta';
import ROICalculator from '../components/Homepage/ROICalculator';
import UseCases from '../components/Homepage/UseCases';
import CompetitorComparison from '../components/Homepage/CompetitorComparison';
import VideoTestimonials from '../components/Homepage/VideoTestimonials';
import VideoDemo from '../components/Homepage/VideoDemo';

// Composants BTP Afrique - Design authentique
import { 
  SplitHeroSection, 
  WhatsAppTestimonial, 
  FieldTestimonial,
  TerrainCard,
  AfricanPatternDivider,
  ProblemSolutionBlock
} from '../components/BTPAfrica';

// Images
import heroConstructionTeam from '../assets/images/homepage/hero-construction-team.jpg';
import dashboardInterface from '../assets/images/homepage/dashboard-interface.jpg';
import collaborativeProjectManagement from '../assets/images/homepage/collaborative-project-management.jpg';
import intelligentQuoteSystem from '../assets/images/homepage/intelligent-quote-system.jpg';
import teamGpsTracking from '../assets/images/homepage/team-gps-tracking.jpg';
import mobileMoneyPayment from '../assets/images/homepage/mobile-money-payment.jpg';
import satisfiedCustomer from '../assets/images/homepage/satisfied-customer.jpg';
import digitalConstructionTeam from '../assets/images/homepage/digital-construction-team.jpg';
import performanceMetric from '../assets/images/homepage/performance-metric.jpg';
import africanUrbanConstruction from '../assets/images/homepage/african-urban-construction.jpg';
import infrastructureProject from '../assets/images/homepage/infrastructure-project.jpg';

import {
  ArrowRight,
  Users,
  BarChart3,
  Calendar,
  FileText,
  Award,
  MapPin,
  DollarSign,
  Truck,
  PieChart,
  ClipboardList,
  Clock
} from 'lucide-react';

const UltraModernHomePage: React.FC = () => {
  // Features avec images - wording métier, pas tech
  const features = [
    {
      icon: BarChart3,
      title: 'Pilotez tous vos chantiers',
      description: 'Un tableau de bord clair pour suivre l\'avancement, les budgets et les équipes en un coup d\'œil.',
      color: 'from-blue-500 to-cyan-500',
      image: dashboardInterface
    },
    {
      icon: FileText,
      title: 'Devis en 3 clics',
      description: 'Créez des devis professionnels rapidement avec votre bibliothèque de prix intégrée.',
      color: 'from-green-500 to-emerald-500',
      image: intelligentQuoteSystem
    },
    {
      icon: Calendar,
      title: 'Planning visuel',
      description: 'Planifiez vos chantiers avec des diagrammes Gantt simples et intuitifs.',
      color: 'from-indigo-500 to-blue-500',
      image: collaborativeProjectManagement
    },
    {
      icon: MapPin,
      title: 'Équipes sur le terrain',
      description: 'Localisez vos équipes en temps réel et optimisez les déplacements.',
      color: 'from-teal-500 to-cyan-500',
      image: teamGpsTracking
    },
    {
      icon: DollarSign,
      title: 'Paiements Mobile Money',
      description: 'Acceptez Orange Money, MTN, Wave directement dans l\'application.',
      color: 'from-yellow-500 to-orange-500',
      image: mobileMoneyPayment
    },
    {
      icon: ClipboardList,
      title: 'Rapports de chantier',
      description: 'Générez des rapports quotidiens avec photos et suivi d\'avancement.',
      color: 'from-cyan-500 to-blue-500',
      image: africanUrbanConstruction
    },
    {
      icon: Truck,
      title: 'Gestion du matériel',
      description: 'Suivez vos équipements, planifiez la maintenance, évitez les pannes.',
      color: 'from-gray-500 to-slate-500',
      image: infrastructureProject
    },
    {
      icon: PieChart,
      title: 'Suivi financier',
      description: 'Analysez la rentabilité par projet et anticipez les dépassements.',
      color: 'from-emerald-500 to-green-500',
      image: performanceMetric
    },
    {
      icon: Users,
      title: 'Gestion d\'équipe',
      description: 'Assignez les tâches, suivez les présences, communiquez facilement.',
      color: 'from-pink-500 to-rose-500',
      image: collaborativeProjectManagement
    }
  ];

  // Chiffres réalistes
  const stats = [
    { number: '850+', label: 'Entreprises utilisatrices', icon: Users },
    { number: '12', label: 'Pays en Afrique', icon: MapPin },
    { number: '15,000+', label: 'Projets gérés', icon: BarChart3 },
    { number: '24h', label: 'Réponse support', icon: Clock }
  ];

  // Problématiques terrain
  const challenges = [
    { problem: 'Retards de chantier', solution: 'Planning visuel et alertes automatiques' },
    { problem: 'Dépassements de budget', solution: 'Suivi financier temps réel' },
    { problem: 'Documents perdus', solution: 'Tout centralisé dans l\'application' },
    { problem: 'Équipes non joignables', solution: 'Suivi GPS et chat intégré' }
  ];

  return (
    <GlobalLayout showHero={false}>
      <PageMeta 
        title="Gestion BTP pour l'Afrique Francophone"
        description="IntuitionConcept - Logiciel de gestion BTP tout-en-un. Devis, factures, suivi chantier, paiements Mobile Money. Essai gratuit 14 jours."
        keywords="BTP, gestion chantier, devis, facture, Congo, RDC, Afrique centrale, construction, artisan, PME, Mobile Money"
      />
      {/* Hero Section - Split Screen BTP Afrique */}
      <SplitHeroSection
        title="Ce logiciel, on l'a codé parce qu'on n'en trouvait pas sur nos chantiers à"
        highlightText="Brazzaville"
        subtitle="PME de 15 personnes à Pointe-Noire. Avant IntuitionConcept : retards, budgets dépassés, documents perdus. Aujourd'hui : tout est sous contrôle."
        annotation="→ Témoignage de Patrick, gérant BTP Pointe-Noire"
        ctaText="Essayer gratuitement 14 jours"
        ctaLink="/register"
        secondaryCta={{ text: "Demander une démo", link: "/contact" }}
        imageSrc={heroConstructionTeam}
        imageAlt="Équipe de construction sur chantier africain"
        badge="850+ entreprises"
      />

      {/* Séparateur africain */}
      <AfricanPatternDivider variant="wax" height="md" />

      {/* Stats avec style terrain */}
      <section className="py-12 bg-[#F5F0E8]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20, rotate: -2 }}
                  whileInView={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -1 : 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-5 bg-white rounded-xl shadow-md border-2 border-gray-100"
                  style={{ transform: `rotate(${index % 2 === 0 ? -1 : 1}deg)` }}
                >
                  <Icon className="w-8 h-8 mx-auto mb-3 text-[#C45C3E]" />
                  <div className="text-3xl font-bold text-gray-900 font-['Bebas_Neue',sans-serif] tracking-wide">{stat.number}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Problématiques terrain - Sans icônes stock */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <p className="font-['Caveat',cursive] text-xl text-[#C45C3E] mb-2" style={{ transform: 'rotate(-1deg)' }}>
              → 15 ans sur les chantiers
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Les défis du BTP en Afrique, on connaît
            </h2>
            <p className="text-xl text-gray-600">
              On a créé l'outil qu'on aurait aimé avoir
            </p>
          </motion.div>

          <ProblemSolutionBlock 
            items={challenges}
            variant="default"
            className="max-w-5xl mx-auto"
          />
        </div>
      </section>

      {/* Video Demo */}
      <VideoDemo />

      {/* Features Section - wording métier */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              La suite d'outils pensée pour vos réalités
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Devis, suivi terrain, finance, équipes, Mobile Money... 
              Tout ce dont vous avez besoin pour piloter vos chantiers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${feature.color} opacity-40`}></div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/features">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Voir toutes les fonctionnalités <ArrowRight className="inline w-5 h-5 ml-2" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Différenciateurs - Style épuré sans icônes */}
      <section className="py-16 bg-[#F5F0E8]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center p-6 bg-white rounded-xl shadow-sm"
            >
              <h3 className="text-xl font-bold text-[#1E4B6E] mb-3">Mobile Money natif</h3>
              <p className="text-gray-600">
                Orange Money, MTN, Wave, Airtel... Paiements intégrés sans configuration.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-6 bg-white rounded-xl shadow-sm"
            >
              <h3 className="text-xl font-bold text-[#1E4B6E] mb-3">Mode hors-ligne</h3>
              <p className="text-gray-600">
                Travaillez sans internet, synchronisation automatique au retour.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-6 bg-white rounded-xl shadow-sm"
            >
              <h3 className="text-xl font-bold text-[#1E4B6E] mb-3">Support local</h3>
              <p className="text-gray-600">
                Équipe francophone à Brazzaville, Kinshasa, Douala. Réponse sous 24h.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <UseCases />

      {/* ROI Calculator */}
      <ROICalculator />

      {/* Competitor Comparison */}
      <CompetitorComparison />

      {/* Séparateur */}
      <AfricanPatternDivider variant="gradient" height="sm" />

      {/* Témoignages terrain - Style authentique */}
      <section className="py-20 bg-[#F5F0E8] relative overflow-hidden">
        {/* Pattern background subtil */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #C45C3E 0px, #C45C3E 2px, transparent 2px, transparent 20px)`
        }} />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <p className="font-['Caveat',cursive] text-2xl text-[#C45C3E] mb-4" style={{ transform: 'rotate(-1deg)' }}>
              → Conversations réelles avec nos clients
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-['Bebas_Neue',sans-serif] tracking-wide uppercase">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-gray-600">
              Des professionnels du BTP comme vous, sur le terrain
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-start">
            {/* WhatsApp Testimonial */}
            <WhatsAppTestimonial
              contactName="Patrick Moungali"
              contactRole="Gérant, BTP Pointe-Noire 🇨🇬"
              messages={[
                { id: '1', text: "Bonjour ! Je voulais vous remercier pour l'application", time: '09:32', isOwn: false },
                { id: '2', text: "Avant je perdais des heures à chercher mes documents. Maintenant tout est là 📱", time: '09:33', isOwn: false },
                { id: '3', text: "Merci Patrick ! Comment ça se passe sur vos chantiers ?", time: '09:45', isOwn: true },
                { id: '4', text: "Je gère 8 chantiers sans stress. Le mode hors-ligne c'est top pour Pointe-Noire 💪", time: '09:47', isOwn: false },
              ]}
            />

            {/* Field Testimonials */}
            <div className="space-y-6">
              <FieldTestimonial
                quote="Les devis automatiques me font gagner 10h par semaine. Je peux enfin me concentrer sur mes chantiers."
                authorName="Clément Makosso"
                authorRole="Directeur"
                authorCompany="Makosso BTP"
                authorLocation="Kinshasa, RDC"
                authorPhoto={satisfiedCustomer}
                rating={5}
              />
              
              <TerrainCard
                title="Le mode hors-ligne est parfait"
                description="Pour nos chantiers en zone rurale au Congo, c'est indispensable. Synchronisation automatique au retour."
                annotation="Jean-Claude Ngoma, Chef de projet"
                variant="postit"
                rotation={2}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <VideoTestimonials />

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
              Notre mission : digitaliser le BTP en Afrique
            </h2>
            <p className="text-gray-600 mb-6">
              Créé par des professionnels du BTP, pour des professionnels du BTP. 
              Notre équipe est présente à Brazzaville, Kinshasa, Douala et Paris pour vous accompagner.
            </p>
            <Link to="/about">
              <span className="text-blue-600 font-medium hover:underline">
                En savoir plus sur notre histoire →
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={digitalConstructionTeam} 
            alt="Équipe digitale" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 to-purple-900/95"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Award className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Prêt à simplifier votre quotidien ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez les 850+ entreprises qui utilisent IntuitionConcept 
              pour piloter leurs chantiers sereinement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-10 py-5 bg-yellow-400 text-gray-900 rounded-xl font-bold text-lg shadow-xl"
                >
                  Essayer gratuitement <ArrowRight className="inline w-6 h-6 ml-2" />
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-10 py-5 bg-white/10 border border-white/30 rounded-xl font-bold text-lg"
                >
                  Parler à un conseiller
                </motion.button>
              </Link>
            </div>
            <p className="mt-6 text-blue-200 text-center">
              14 jours gratuits • Sans engagement • Support en français
            </p>
          </motion.div>
        </div>
      </section>
    </GlobalLayout>
  );
};

export default UltraModernHomePage;
