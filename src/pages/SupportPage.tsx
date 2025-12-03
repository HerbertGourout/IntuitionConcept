import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlobalLayout from '../components/Layout/GlobalLayout';
import { 
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Book,
  Video,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  CheckCircle
} from 'lucide-react';

const SupportPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const faqs = [
    {
      id: 'start',
      category: 'Démarrage',
      question: 'Comment créer mon premier projet ?',
      answer: 'Après connexion, cliquez sur "Nouveau projet" dans le dashboard. Renseignez le nom du projet, le client et les dates prévisionnelles. Vous pouvez ensuite ajouter des tâches, des équipes et un budget.'
    },
    {
      id: 'team',
      category: 'Équipes',
      question: 'Comment ajouter des membres à mon équipe ?',
      answer: 'Allez dans Paramètres > Équipe > Inviter un membre. Entrez l\'email ou le numéro de téléphone. Le membre recevra un lien d\'invitation par email ou SMS.'
    },
    {
      id: 'offline',
      category: 'Technique',
      question: 'L\'application fonctionne-t-elle hors-ligne ?',
      answer: 'Oui ! IntuitionConcept fonctionne sans connexion internet. Vos modifications sont enregistrées localement et synchronisées automatiquement dès que vous retrouvez une connexion.'
    },
    {
      id: 'payment',
      category: 'Paiements',
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons Orange Money, MTN Money, Airtel Money, Wave, ainsi que les cartes bancaires Visa et Mastercard. Les virements bancaires sont possibles pour les abonnements annuels.'
    },
    {
      id: 'invoice',
      category: 'Facturation',
      question: 'Comment générer une facture ?',
      answer: 'Dans le module Devis & Factures, sélectionnez un devis validé et cliquez sur "Convertir en facture". Vous pouvez personnaliser le modèle et l\'envoyer directement par email ou WhatsApp.'
    },
    {
      id: 'export',
      category: 'Données',
      question: 'Puis-je exporter mes données ?',
      answer: 'Oui, vous pouvez exporter vos projets, devis, factures et rapports en PDF, Excel ou CSV. Allez dans Paramètres > Export de données pour un export complet.'
    },
    {
      id: 'security',
      category: 'Sécurité',
      question: 'Mes données sont-elles sécurisées ?',
      answer: 'Absolument. Nous utilisons un chiffrement SSL 256 bits, l\'authentification à deux facteurs (2FA), et des sauvegardes automatiques quotidiennes. Nous sommes conformes RGPD.'
    },
    {
      id: 'cancel',
      category: 'Abonnement',
      question: 'Comment annuler mon abonnement ?',
      answer: 'Vous pouvez annuler à tout moment depuis Paramètres > Abonnement > Annuler. Votre accès reste actif jusqu\'à la fin de la période payée. Aucun frais d\'annulation.'
    }
  ];

  const resources = [
    {
      icon: Book,
      title: 'Documentation',
      description: 'Guides complets pour chaque fonctionnalité',
      link: '/docs',
      color: 'bg-[#1E4B6E]'
    },
    {
      icon: Video,
      title: 'Tutoriels vidéo',
      description: 'Apprenez en regardant nos démos',
      link: '/tutorials',
      color: 'bg-[#C45C3E]'
    },
    {
      icon: MessageCircle,
      title: 'Chat en direct',
      description: 'Parlez à un conseiller maintenant',
      link: '#chat',
      color: 'bg-[#4A7C59]'
    },
    {
      icon: Mail,
      title: 'Email support',
      description: 'Réponse sous 24h garantie',
      link: 'mailto:support@intuitionconcept.com',
      color: 'bg-[#E5A832]'
    }
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <GlobalLayout showHero={false}>
      {/* Hero */}
      <section className="py-20 bg-[#1E4B6E] text-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <HelpCircle className="w-16 h-16 mx-auto mb-6 text-[#E5A832]" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Comment pouvons-nous vous aider ?
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Trouvez des réponses rapides ou contactez notre équipe support
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans l'aide..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#E5A832] focus:outline-none"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <motion.a
                  key={resource.title}
                  href={resource.link}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all block"
                >
                  <div className={`w-12 h-12 ${resource.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{resource.title}</h3>
                  <p className="text-gray-500 text-sm">{resource.description}</p>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#F5F0E8]">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-gray-600">
              Les réponses aux questions les plus posées
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {filteredFaqs.map((faq) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-[#1E4B6E]/10 text-[#1E4B6E] px-2 py-1 rounded-full">
                      {faq.category}
                    </span>
                    <span className="font-medium text-gray-900">{faq.question}</span>
                  </div>
                  {openFaq === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {openFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-gray-600 pl-20">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun résultat pour "{searchQuery}"</p>
                <p className="text-gray-400 text-sm mt-2">
                  Essayez d'autres termes ou contactez-nous directement
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-[#1E4B6E] rounded-2xl p-8 md:p-12 text-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                    Besoin d'aide personnalisée ?
                  </h2>
                  <p className="text-gray-200 mb-6">
                    Notre équipe support est disponible du lundi au vendredi, 8h-18h (GMT).
                    Réponse garantie sous 24h.
                  </p>
                  <ul className="space-y-2 text-gray-200">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#E5A832]" />
                      Support en français
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#E5A832]" />
                      Équipe basée en Afrique
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#E5A832]" />
                      WhatsApp disponible
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <a
                    href="https://wa.me/221771234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-[#4A7C59] rounded-xl font-bold hover:bg-[#3d6549] transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href="mailto:support@intuitionconcept.com"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-white/20 rounded-xl font-bold hover:bg-white/30 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    support@intuitionconcept.com
                  </a>
                  <a
                    href="tel:+221331234567"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-white/20 rounded-xl font-bold hover:bg-white/30 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    +221 33 123 45 67
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </GlobalLayout>
  );
};

export default SupportPage;
