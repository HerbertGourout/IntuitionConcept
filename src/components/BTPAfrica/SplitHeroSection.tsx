import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SplitHeroSectionProps {
  title: string;
  subtitle: string;
  highlightText?: string;
  ctaText: string;
  ctaLink: string;
  secondaryCta?: {
    text: string;
    link: string;
  };
  imageSrc: string;
  imageAlt: string;
  badge?: string;
  annotation?: string;
  reversed?: boolean;
  className?: string;
}

/**
 * Section Hero split-screen avec rupture visuelle
 * Image pleine hauteur + texte avec overlaps
 */
const SplitHeroSection: React.FC<SplitHeroSectionProps> = ({
  title,
  subtitle,
  highlightText,
  ctaText,
  ctaLink,
  secondaryCta,
  imageSrc,
  imageAlt,
  badge,
  annotation,
  reversed = false,
  className = '',
}) => {
  return (
    <section className={`relative min-h-screen overflow-hidden ${className}`}>
      <div className={`flex flex-col lg:flex-row ${reversed ? 'lg:flex-row-reverse' : ''}`}>
        {/* Image side - 55% width with diagonal cut */}
        <motion.div
          initial={{ opacity: 0, x: reversed ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative lg:w-[55%] h-[50vh] lg:h-screen"
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay gradient */}
          <div className={`absolute inset-0 bg-gradient-to-${reversed ? 'l' : 'r'} from-transparent via-transparent to-white/90 lg:to-white`} />
          
          {/* Diagonal cut overlay */}
          <div 
            className="hidden lg:block absolute inset-y-0 right-0 w-32 bg-white"
            style={{
              clipPath: reversed 
                ? 'polygon(100% 0, 0 0, 100% 100%)' 
                : 'polygon(0 0, 100% 0, 100% 100%)',
            }}
          />
          
          {/* Dust/texture overlay */}
          <div className="absolute inset-0 mix-blend-overlay opacity-20 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Badge terrain */}
          {badge && (
            <motion.div
              initial={{ opacity: 0, rotate: -5, scale: 0.8 }}
              animate={{ opacity: 1, rotate: -3, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-8 left-8 bg-[#C45C3E] text-white px-4 py-2 font-bold text-sm uppercase tracking-wide shadow-lg"
              style={{ transform: 'rotate(-3deg)' }}
            >
              {badge}
            </motion.div>
          )}
        </motion.div>

        {/* Content side - 45% width */}
        <motion.div
          initial={{ opacity: 0, x: reversed ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative lg:w-[45%] flex items-center px-8 lg:px-16 py-16 lg:py-0 bg-white"
        >
          {/* Pattern background subtil */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                #C45C3E 0px,
                #C45C3E 2px,
                transparent 2px,
                transparent 20px
              )`,
            }}
          />
          
          <div className="relative z-10 max-w-xl">
            {/* Annotation manuscrite */}
            {annotation && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-handwritten text-2xl text-[#C45C3E] mb-4 transform -rotate-2"
              >
                {annotation}
              </motion.p>
            )}
            
            {/* Titre principal */}
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              {title}
              {highlightText && (
                <span className="relative inline-block ml-2">
                  <span className="relative z-10 text-[#1E4B6E]">{highlightText}</span>
                  {/* Underline manuscrit */}
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-4"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <motion.path
                      d="M0,5 Q25,0 50,5 T100,5"
                      stroke="#E5A832"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                    />
                  </svg>
                </span>
              )}
            </h1>
            
            {/* Sous-titre */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {subtitle}
            </p>
            
            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={ctaLink}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#C45C3E] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                  {ctaText}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              
              {secondaryCta && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={secondaryCta.link}
                    className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-900 text-gray-900 font-bold rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
                  >
                    {secondaryCta.text}
                  </Link>
                </motion.div>
              )}
            </div>
            
            {/* Trust badges */}
            <div className="mt-12 flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>850+ entreprises</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🇸🇳</span>
                <span>12 pays africains</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Séparateur pattern africain en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#C45C3E] via-[#E5A832] to-[#1E4B6E]" />
    </section>
  );
};

export default SplitHeroSection;
