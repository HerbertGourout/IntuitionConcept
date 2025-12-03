import React from 'react';
import { motion } from 'framer-motion';
import { Quote, MapPin } from 'lucide-react';

interface FieldTestimonialProps {
  quote: string;
  authorName: string;
  authorRole: string;
  authorCompany: string;
  authorLocation: string;
  authorPhoto?: string;
  projectPhoto?: string;
  rating?: number;
  variant?: 'default' | 'polaroid' | 'card';
  className?: string;
}

/**
 * Témoignage terrain avec photos réelles
 * Style authentique, pas de stock photo
 */
const FieldTestimonial: React.FC<FieldTestimonialProps> = ({
  quote,
  authorName,
  authorRole,
  authorCompany,
  authorLocation,
  authorPhoto,
  projectPhoto,
  rating = 5,
  variant = 'default',
  className = '',
}) => {
  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-[#E5A832]' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (variant === 'polaroid') {
    return (
      <motion.div
        initial={{ opacity: 0, rotate: -3, y: 20 }}
        whileInView={{ opacity: 1, rotate: -2, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ rotate: 0, scale: 1.02 }}
        className={`bg-white p-4 pb-16 shadow-xl max-w-sm ${className}`}
      >
        {/* Scotch tape effect */}
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-7 bg-yellow-100/80 shadow-sm z-10"
          style={{ transform: 'translateX(-50%) rotate(1deg)' }}
        />
        
        {/* Photo projet */}
        {projectPhoto && (
          <img 
            src={projectPhoto} 
            alt="Photo chantier"
            className="w-full h-48 object-cover mb-4"
          />
        )}
        
        {/* Citation */}
        <p className="text-gray-800 font-['Caveat',cursive] text-xl leading-relaxed mb-4">
          "{quote}"
        </p>
        
        {/* Auteur */}
        <div className="flex items-center gap-3">
          {authorPhoto ? (
            <img 
              src={authorPhoto} 
              alt={authorName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#C45C3E] flex items-center justify-center text-white font-bold text-lg">
              {authorName.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-bold text-gray-900">{authorName}</p>
            <p className="text-sm text-gray-600">{authorRole}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative bg-white rounded-2xl overflow-hidden shadow-xl ${className}`}
    >
      {/* Photo projet en background */}
      {projectPhoto && (
        <div className="relative h-48">
          <img 
            src={projectPhoto} 
            alt="Photo chantier"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Location badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white text-sm">
            <MapPin className="w-4 h-4" />
            <span>{authorLocation}</span>
          </div>
        </div>
      )}
      
      <div className="p-6">
        {/* Quote icon */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-[#C45C3E]/10 rounded-full flex items-center justify-center">
          <Quote className="w-6 h-6 text-[#C45C3E]" />
        </div>
        
        {/* Rating */}
        <div className="mb-4">
          {renderStars()}
        </div>
        
        {/* Citation */}
        <blockquote className="text-gray-800 text-lg leading-relaxed mb-6">
          "{quote}"
        </blockquote>
        
        {/* Auteur */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          {authorPhoto ? (
            <img 
              src={authorPhoto} 
              alt={authorName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#C45C3E]/20"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C45C3E] to-[#E5A832] flex items-center justify-center text-white font-bold text-xl">
              {authorName.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-bold text-gray-900">{authorName}</p>
            <p className="text-sm text-gray-600">{authorRole}</p>
            <p className="text-sm text-[#1E4B6E] font-medium">{authorCompany}</p>
          </div>
        </div>
      </div>
      
      {/* Accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#C45C3E] via-[#E5A832] to-[#1E4B6E]" />
    </motion.div>
  );
};

export default FieldTestimonial;
