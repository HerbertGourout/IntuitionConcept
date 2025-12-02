import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Clock, Shield, CreditCard, Users } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ElementType;
}

/**
 * Mini-FAQ contextuelle pour la page Contact
 * Questions fréquentes avant de contacter le support
 */
const ContactFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'Quel est le délai de réponse du support ?',
      answer: 'Notre équipe répond sous 24h maximum en jours ouvrés. Pour les clients Enterprise, le support prioritaire garantit une réponse sous 4h. En cas d\'urgence, utilisez WhatsApp pour une réponse immédiate.',
      icon: Clock,
    },
    {
      question: 'Comment fonctionne l\'essai gratuit ?',
      answer: 'L\'essai gratuit de 14 jours vous donne accès à toutes les fonctionnalités Pro sans engagement. Aucune carte bancaire n\'est requise. À la fin de l\'essai, vous choisissez le plan qui vous convient ou continuez gratuitement avec des fonctionnalités limitées.',
      icon: Shield,
    },
    {
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons les paiements par Mobile Money (Orange Money, Wave, MTN Money, Moov Money), carte bancaire (Visa, Mastercard), et virement bancaire pour les entreprises. Les paiements sont sécurisés et conformes aux normes PCI-DSS.',
      icon: CreditCard,
    },
    {
      question: 'Proposez-vous des formations ?',
      answer: 'Oui ! Chaque nouveau client bénéficie d\'une session de formation gratuite (1h en visio). Pour les équipes plus grandes, nous proposons des formations sur site dans nos bureaux de Dakar, Abidjan, Douala et Paris. Des tutoriels vidéo sont également disponibles 24/7.',
      icon: Users,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Questions fréquentes</h3>
          <p className="text-sm text-gray-500">Avant de nous contacter</p>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-100 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <faq.icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="font-medium text-gray-900">{faq.question}</span>
              </div>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-gray-600 text-sm leading-relaxed pl-8">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>Vous ne trouvez pas la réponse ?</strong> Notre équipe est disponible du lundi au vendredi, 8h-18h (GMT). Contactez-nous via le formulaire ou WhatsApp.
        </p>
      </div>
    </motion.div>
  );
};

export default ContactFAQ;
