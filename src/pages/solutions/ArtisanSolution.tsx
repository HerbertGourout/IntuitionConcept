import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlobalLayout from '../../components/Layout/GlobalLayout';
import { 
  FileText,
  Calculator,
  Smartphone,
  Clock,
  ArrowRight,
  Camera,
  Receipt,
  Wallet
} from 'lucide-react';
import { TerrainCheck, ProblemSolutionBlock } from '../../components/BTPAfrica';

// Images
import heroConstructionTeam from '../../assets/images/homepage/hero-construction-team.jpg';
import intelligentQuoteSystem from '../../assets/images/homepage/intelligent-quote-system.jpg';
import satisfiedCustomer from '../../assets/images/homepage/satisfied-customer.jpg';
import mobileMoneyPayment from '../../assets/images/homepage/mobile-money-payment.jpg';

const ArtisanSolution: React.FC = () => {
  const painPoints = [
    {
      problem: 'Vos devis sont faits sur papier ou Word',
      solution: 'Application mobile pour créer des devis pro en 5 minutes'
    },
    {
      problem: 'Vous oubliez de facturer certains travaux',
      solution: 'Suivi automatique de tous vos chantiers et paiements'
    },
    {
      problem: 'Les clients paient en retard ou en espèces',
      solution: 'Paiement Mobile Money instantané (Orange, MTN, Wave)'
    },
    {
      problem: 'Vous perdez du temps en paperasse',
      solution: 'Tout est automatisé : devis, factures, relances'
    }
  ];

  const features = [
    {
      icon: FileText,
      title: 'Devis en 5 minutes',
      description: 'Créez des devis professionnels depuis votre téléphone, même sur le chantier.'
    },
    {
      icon: Calculator,
      title: 'Calculs automatiques',
      description: 'Plus d\'erreurs de calcul. TVA, remises, totaux calculés automatiquement.'
    },
    {
      icon: Smartphone,
      title: '100% mobile',
      description: 'Tout fonctionne sur votre téléphone. Pas besoin d\'ordinateur.'
    },
    {
      icon: Wallet,
      title: 'Mobile Money',
      description: 'Vos clients paient par Orange Money, MTN, Wave en un clic.'
    },
    {
      icon: Camera,
      title: 'Photos de chantier',
      description: 'Documentez vos travaux avec photos géolocalisées.'
    },
    {
      icon: Receipt,
      title: 'Factures automatiques',
      description: 'Transformez un devis en facture en un clic.'
    }
  ];

  const testimonial = {
    name: 'Jean-Baptiste Ngoma',
    role: 'Artisan plombier',
    company: 'Travailleur indépendant • Pointe-Noire, Congo',
    content: 'Avant, je faisais mes devis sur des bouts de papier. Maintenant, j\'envoie des devis pro par WhatsApp en 5 minutes. Mes clients me prennent plus au sérieux.',
    metric: '3x plus de devis acceptés',
    avatar: satisfiedCustomer
  };

  const pricing = {
    name: 'Plan Artisan',
    price: '9,900',
    currency: 'FCFA',
    period: '/mois',
    features: [
      '1 utilisateur',
      'Devis illimités',
      'Factures illimitées',
      'Mobile Money intégré',
      'Photos de chantier',
      'Envoi par WhatsApp/Email',
      'Support par WhatsApp',
      'Fonctionne hors-ligne'
    ]
  };

  return (
    <GlobalLayout showHero={false}>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroConstructionTeam} 
            alt="Artisan BTP" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/95 to-amber-900/80"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-white"
          >
            <span className="inline-block px-4 py-2 bg-orange-500/30 rounded-full text-sm font-medium mb-6">
              Solution Artisan • Indépendants & TPE
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Artisan du BTP ?
              <span className="text-yellow-400"> Gagnez 10h par semaine.</span>
            </h1>
            <p className="text-xl text-orange-100 mb-8">
              Fini les devis sur papier, les calculs à la main et les clients qui ne paient pas. 
              Une application simple sur votre téléphone pour tout gérer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl font-bold text-lg"
                >
                  Essayer gratuit 14 jours <ArrowRight className="inline w-5 h-5 ml-2" />
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-4 bg-white/10 border border-white/30 rounded-xl font-bold text-lg"
                >
                  Voir une démo
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              On sait ce que c'est, le quotidien d'un artisan
            </h2>
          </motion.div>

          <ProblemSolutionBlock 
            items={painPoints}
            variant="cards"
            className="max-w-4xl mx-auto"
          />
        </div>
      </section>

      {/* Mobile First */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">
                100% Mobile
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Tout depuis votre téléphone
              </h2>
              <p className="text-gray-600 mb-6">
                Pas besoin d'ordinateur. Créez vos devis sur le chantier, 
                envoyez-les par WhatsApp, et recevez les paiements Mobile Money.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <TerrainCheck variant="pencil" color="vegetation" size="sm" />
                  Fonctionne même sans internet
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <TerrainCheck variant="pencil" color="vegetation" size="sm" />
                  Interface simple et rapide
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <TerrainCheck variant="pencil" color="vegetation" size="sm" />
                  Envoi direct par WhatsApp
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <TerrainCheck variant="pencil" color="vegetation" size="sm" />
                  Paiement Mobile Money intégré
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <img 
                src={intelligentQuoteSystem} 
                alt="Application mobile artisan" 
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple et efficace
            </h2>
            <p className="text-xl text-gray-600">
              Juste ce dont vous avez besoin, rien de plus
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mobile Money */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <img 
                src={mobileMoneyPayment} 
                alt="Paiement Mobile Money" 
                className="rounded-2xl shadow-xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Fini les "je te paie demain"
              </h2>
              <p className="text-gray-600 mb-6">
                Vos clients paient directement par Mobile Money. 
                L'argent arrive sur votre compte en quelques secondes.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-medium">
                  Orange Money
                </span>
                <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                  MTN Money
                </span>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                  Wave
                </span>
                <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-medium">
                  Airtel Money
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                Reçu automatique envoyé au client par SMS
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  <p className="text-gray-400 text-sm">{testimonial.company}</p>
                </div>
              </div>

              <div className="flex mb-4 gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500 text-xl">★</span>
                ))}
              </div>

              <p className="text-gray-700 text-lg italic mb-4">
                "{testimonial.content}"
              </p>

              <div className="bg-green-100 text-green-700 text-sm font-medium px-4 py-2 rounded-full inline-block">
                {testimonial.metric}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">{pricing.name}</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">{pricing.price}</span>
                <span className="text-orange-100"> {pricing.currency}{pricing.period}</span>
              </div>

              <ul className="space-y-3 text-left mb-8">
                {pricing.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <TerrainCheck variant="pencil" color="engin" size="sm" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="w-full py-4 bg-white text-orange-600 rounded-xl font-bold text-lg"
                >
                  Commencer gratuitement
                </motion.button>
              </Link>

              <p className="text-orange-100 text-sm mt-4">
                14 jours gratuits • Sans carte bancaire
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Clock className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-3xl font-bold mb-4">
              Gagnez 10h par semaine sur la paperasse
            </h2>
            <p className="text-gray-400 mb-8">
              Rejoignez les 300+ artisans qui utilisent IntuitionConcept
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl font-bold"
              >
                Essayer gratuitement <ArrowRight className="inline w-5 h-5 ml-2" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </GlobalLayout>
  );
};

export default ArtisanSolution;
