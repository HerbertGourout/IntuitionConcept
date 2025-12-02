import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlobalLayout from '../components/Layout/GlobalLayout';
import { 
  Users, 
  Target, 
  Heart, 
  Globe, 
  Award,
  MapPin,
  Briefcase,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

// Images
import heroConstructionTeam from '../assets/images/homepage/hero-construction-team.jpg';
import collaborativeProjectManagement from '../assets/images/homepage/collaborative-project-management.jpg';
import satisfiedCustomer from '../assets/images/homepage/satisfied-customer.jpg';

const AboutPage: React.FC = () => {
  const values = [
    {
      icon: Target,
      title: 'Pragmatisme terrain',
      description: 'Chaque fonctionnalité est pensée pour résoudre un problème réel du chantier, pas pour impressionner.'
    },
    {
      icon: Heart,
      title: 'Proximité client',
      description: 'Notre équipe support est présente à Dakar, Abidjan, Douala et Paris. Nous parlons votre langue.'
    },
    {
      icon: Globe,
      title: 'Adapté à l\'Afrique',
      description: 'Paiements Mobile Money, mode hors-ligne, devises locales. Conçu pour vos réalités.'
    },
    {
      icon: TrendingUp,
      title: 'Amélioration continue',
      description: 'Nous écoutons vos retours et améliorons la plateforme chaque semaine.'
    }
  ];

  const team = [
    {
      name: 'Ousmane Diallo',
      role: 'Fondateur & CEO',
      bio: '15 ans d\'expérience dans le BTP en Afrique de l\'Ouest. Ancien directeur de chantier chez Bouygues.',
      location: 'Dakar, Sénégal'
    },
    {
      name: 'Aminata Koné',
      role: 'Directrice Produit',
      bio: 'Ex-consultante McKinsey, spécialisée dans la digitalisation des PME africaines.',
      location: 'Abidjan, Côte d\'Ivoire'
    },
    {
      name: 'Jean-Pierre Mbarga',
      role: 'Directeur Technique',
      bio: '12 ans en développement logiciel. Passionné par les solutions qui fonctionnent hors-ligne.',
      location: 'Douala, Cameroun'
    }
  ];

  const milestones = [
    { year: '2021', event: 'Création d\'IntuitionConcept à Dakar' },
    { year: '2022', event: 'Premiers clients PME au Sénégal et Côte d\'Ivoire' },
    { year: '2023', event: 'Expansion au Cameroun, Maroc et Tunisie' },
    { year: '2024', event: 'Lancement des modules IA et Mobile Money' },
    { year: '2025', event: '+850 entreprises utilisatrices dans 12 pays' }
  ];

  const offices = [
    { city: 'Dakar', country: 'Sénégal', type: 'Siège social' },
    { city: 'Abidjan', country: 'Côte d\'Ivoire', type: 'Bureau régional' },
    { city: 'Douala', country: 'Cameroun', type: 'Bureau régional' },
    { city: 'Paris', country: 'France', type: 'Partenariats Europe' }
  ];

  return (
    <GlobalLayout showHero={false}>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroConstructionTeam} 
            alt="Notre équipe" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 to-purple-900/80"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-white"
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Construits par des pros du BTP,
              <span className="text-yellow-400"> pour des pros du BTP</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Après 15 ans sur les chantiers d'Afrique, nous avons créé l'outil que nous aurions aimé avoir. 
              Simple, adapté au terrain, et qui fonctionne même sans connexion.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Notre histoire
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>En 2021</strong>, après avoir géré des dizaines de chantiers au Sénégal, 
                  en Côte d'Ivoire et au Cameroun, Ousmane Diallo fait un constat simple : 
                  les outils de gestion BTP existants ne sont pas adaptés aux réalités africaines.
                </p>
                <p>
                  Connexion internet instable, équipes sur le terrain sans accès aux bureaux, 
                  paiements en espèces ou Mobile Money, documents perdus entre les allers-retours...
                </p>
                <p>
                  <strong>IntuitionConcept</strong> est né de cette frustration. Une plateforme pensée 
                  pour le terrain, pas pour les salles de réunion climatisées.
                </p>
                <p className="font-medium text-gray-900">
                  Aujourd'hui, plus de 850 entreprises dans 12 pays nous font confiance pour 
                  piloter leurs chantiers au quotidien.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src={collaborativeProjectManagement} 
                alt="Équipe en réunion" 
                className="rounded-2xl shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Notre parcours
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-6 mb-8"
              >
                <div className="flex-shrink-0 w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {milestone.year}
                </div>
                <div className="pt-5">
                  <p className="text-lg text-gray-700">{milestone.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nos valeurs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ce qui guide chacune de nos décisions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* L'Équipe */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              L'équipe dirigeante
            </h2>
            <p className="text-xl text-gray-600">
              Des professionnels du BTP et de la tech, unis par une mission commune
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-3">{member.bio}</p>
                <div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  {member.location}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos Bureaux */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Présents sur le terrain
            </h2>
            <p className="text-xl text-gray-600">
              Une équipe locale pour vous accompagner
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {offices.map((office, index) => (
              <motion.div
                key={office.city}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 text-center"
              >
                <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900">{office.city}</h3>
                <p className="text-gray-600 text-sm">{office.country}</p>
                <p className="text-blue-600 text-xs mt-1">{office.type}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Award className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Rejoignez les 850+ entreprises qui nous font confiance
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Découvrez comment IntuitionConcept peut simplifier votre quotidien sur les chantiers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl font-bold text-lg"
                >
                  Essayer gratuitement <ArrowRight className="inline w-5 h-5 ml-2" />
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-white/10 border border-white/30 rounded-xl font-bold text-lg"
                >
                  Parler à un conseiller
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </GlobalLayout>
  );
};

export default AboutPage;
