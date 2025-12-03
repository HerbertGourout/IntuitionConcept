import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  position?: 'bottom-right' | 'bottom-left';
}

/**
 * Bouton WhatsApp flottant
 * - Toujours visible sur toutes les pages
 * - Ouvre une conversation WhatsApp pré-remplie
 * - Animation d'attention périodique
 */
const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '242065000000', // Congo Brazzaville
  message = 'Bonjour, je souhaite en savoir plus sur IntuitionConcept pour mon entreprise BTP.',
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const positionClasses = position === 'bottom-right' 
    ? 'right-6 bottom-6' 
    : 'left-6 bottom-6';

  const quickMessages = [
    { text: 'Je veux une démo', emoji: '🎯' },
    { text: 'Question sur les tarifs', emoji: '💰' },
    { text: 'Support technique', emoji: '🔧' },
    { text: 'Parler à un conseiller', emoji: '👋' },
  ];

  const handleQuickMessage = (msg: string) => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#25D366] p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-sm">IntuitionConcept</p>
                    <p className="text-xs text-white/80">Répond en moins de 24h</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-4">
                Besoin d'aide ? Notre équipe est disponible sur WhatsApp.
              </p>

              {/* Quick messages */}
              <div className="space-y-2 mb-4">
                {quickMessages.map((msg, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickMessage(msg.text)}
                    className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors flex items-center gap-2"
                  >
                    <span>{msg.emoji}</span>
                    <span>{msg.text}</span>
                  </button>
                ))}
              </div>

              {/* Main CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#25D366] text-white text-center py-3 rounded-xl font-semibold hover:bg-[#20BD5A] transition-colors"
              >
                Démarrer une conversation
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasInteracted(true);
        }}
        className="w-16 h-16 bg-[#25D366] rounded-full shadow-lg flex items-center justify-center text-white hover:bg-[#20BD5A] transition-colors relative"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={!hasInteracted ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: hasInteracted ? 0 : Infinity,
          repeatDelay: 3
        }}
      >
        {/* WhatsApp Icon */}
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>

        {/* Notification badge */}
        {!hasInteracted && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold"
          >
            1
          </motion.span>
        )}
      </motion.button>
    </div>
  );
};

export default WhatsAppButton;
