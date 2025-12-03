import React from 'react';
import { motion } from 'framer-motion';
import { CheckCheck } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  time: string;
  isOwn?: boolean;
  hasImage?: boolean;
  imageUrl?: string;
}

interface WhatsAppTestimonialProps {
  contactName: string;
  contactRole: string;
  contactPhoto?: string;
  messages: Message[];
  className?: string;
}

/**
 * Composant témoignage style conversation WhatsApp
 * Authentique, humain, "preuve terrain"
 */
const WhatsAppTestimonial: React.FC<WhatsAppTestimonialProps> = ({
  contactName,
  contactRole,
  contactPhoto,
  messages,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`max-w-sm mx-auto ${className}`}
    >
      {/* Phone frame */}
      <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
        <div className="bg-[#0B141A] rounded-[2rem] overflow-hidden">
          {/* WhatsApp header */}
          <div className="bg-[#1F2C34] px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden flex-shrink-0">
              {contactPhoto ? (
                <img src={contactPhoto} alt={contactName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#00A884] to-[#25D366] flex items-center justify-center text-white font-bold">
                  {contactName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{contactName}</p>
              <p className="text-gray-400 text-xs truncate">{contactRole}</p>
            </div>
            <div className="flex gap-4 text-gray-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.9 14.3H15l-.3-.3c1-1.1 1.6-2.7 1.6-4.3 0-3.7-3-6.7-6.7-6.7S3 6 3 9.7s3 6.7 6.7 6.7c1.6 0 3.2-.6 4.3-1.6l.3.3v.8l5.1 5.1 1.5-1.5-5-5.2zm-6.2 0c-2.6 0-4.6-2.1-4.6-4.6s2.1-4.6 4.6-4.6 4.6 2.1 4.6 4.6-2 4.6-4.6 4.6z"/>
              </svg>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/>
              </svg>
            </div>
          </div>

          {/* Chat background with pattern */}
          <div 
            className="min-h-[300px] p-4 space-y-3"
            style={{
              backgroundColor: '#0B141A',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: message.isOwn ? 20 : -20, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 relative ${
                    message.isOwn
                      ? 'bg-[#005C4B] text-white rounded-tr-none'
                      : 'bg-[#1F2C34] text-white rounded-tl-none'
                  }`}
                >
                  {/* Bubble tail */}
                  <div
                    className={`absolute top-0 w-3 h-3 ${
                      message.isOwn
                        ? 'right-[-6px] bg-[#005C4B]'
                        : 'left-[-6px] bg-[#1F2C34]'
                    }`}
                    style={{
                      clipPath: message.isOwn
                        ? 'polygon(0 0, 100% 0, 0 100%)'
                        : 'polygon(100% 0, 0 0, 100% 100%)',
                    }}
                  />
                  
                  {message.hasImage && message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Photo chantier"
                      className="rounded-lg mb-2 max-w-full"
                    />
                  )}
                  
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-gray-400">{message.time}</span>
                    {message.isOwn && (
                      <CheckCheck className="w-4 h-4 text-[#53BDEB]" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input bar */}
          <div className="bg-[#1F2C34] px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-[#2A3942] rounded-full px-4 py-2 flex items-center">
              <span className="text-gray-400 text-sm">Message</span>
            </div>
            <div className="w-10 h-10 bg-[#00A884] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14.5c-3.04 0-5.5 1.73-5.5 3.5v1h11v-1c0-1.77-2.46-3.5-5.5-3.5zm0-1c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Caption sous le téléphone */}
      <p className="text-center text-sm text-gray-500 mt-4 font-medium">
        Conversation réelle avec {contactName}
      </p>
    </motion.div>
  );
};

export default WhatsAppTestimonial;
