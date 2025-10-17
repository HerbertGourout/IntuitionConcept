import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Quote, Star, ChevronLeft, ChevronRight, Award } from 'lucide-react';

interface VideoTestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  country: string;
  flag: string;
  videoUrl?: string; // URL YouTube/Vimeo (optionnel pour l'instant)
  thumbnail: string;
  quote: string;
  results: {
    metric: string;
    value: string;
  }[];
  aiFeature: string;
  avatar: string;
  rating: number;
}

const testimonials: VideoTestimonial[] = [
  {
    id: '1',
    name: 'Amadou Diallo',
    role: 'Directeur Général',
    company: 'BTP Solutions Dakar',
    country: 'Sénégal',
    flag: '🇸🇳',
    videoUrl: '', // À remplir plus tard
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=450&fit=crop',
    quote: 'Le générateur de devis IA m\'a fait économiser 30 heures par mois. Je peux maintenant traiter 3× plus de clients avec la même équipe !',
    results: [
      { metric: 'Temps économisé', value: '30h/mois' },
      { metric: 'Clients traités', value: '+200%' },
      { metric: 'Chiffre d\'affaires', value: '+150%' }
    ],
    aiFeature: 'Générateur Devis IA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5
  },
  {
    id: '2',
    name: 'Aminata Touré',
    role: 'Chef de Projet',
    company: 'Construct Ivory',
    country: 'Côte d\'Ivoire',
    flag: '🇨🇮',
    videoUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=450&fit=crop',
    quote: 'La détection d\'anomalies IA nous a permis d\'éviter 15 millions FCFA de dépassements budgétaires en seulement 6 mois. C\'est incroyable !',
    results: [
      { metric: 'Dépassements évités', value: '15M FCFA' },
      { metric: 'Projets à temps', value: '95%' },
      { metric: 'Satisfaction client', value: '+40%' }
    ],
    aiFeature: 'Détection Anomalies IA',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    rating: 5
  },
  {
    id: '3',
    name: 'Jean-Baptiste Kouamé',
    role: 'Directeur Technique',
    company: 'Groupe BTP Cameroun',
    country: 'Cameroun',
    flag: '🇨🇲',
    videoUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop',
    quote: 'L\'analyse automatique de plans architecturaux nous fait gagner 2 jours par projet. Plus besoin de mesurer manuellement, l\'IA extrait tout !',
    results: [
      { metric: 'Temps analyse', value: '-80%' },
      { metric: 'Erreurs métrés', value: '-95%' },
      { metric: 'Projets/mois', value: '+60%' }
    ],
    aiFeature: 'Analyse Plans IA',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5
  },
  {
    id: '4',
    name: 'Fatima El Mansouri',
    role: 'Gérante',
    company: 'Rénov\'Maroc',
    country: 'Maroc',
    flag: '🇲🇦',
    videoUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=450&fit=crop',
    quote: 'Le scanner OCR IA traite 50 factures en 10 minutes au lieu de 2 jours. Mon équipe peut se concentrer sur le terrain au lieu de la paperasse.',
    results: [
      { metric: 'Traitement factures', value: '-95%' },
      { metric: 'Erreurs saisie', value: '-99%' },
      { metric: 'Productivité', value: '+180%' }
    ],
    aiFeature: 'Scanner OCR IA',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5
  }
];

const VideoTestimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeTestimonial = testimonials[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    setIsPlaying(false);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsPlaying(false);
  };

  const handlePlayVideo = () => {
    // Pour l'instant, juste un placeholder
    // Plus tard, ouvrir le player vidéo YouTube/Vimeo
    setIsPlaying(true);
    alert('🎬 Vidéo à venir ! Pour l\'instant, lisez le témoignage ci-dessous.');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Award className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Ils Ont Transformé Leur
            <span className="bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent"> Business avec l'IA</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez comment nos clients utilisent l'IA pour économiser du temps et de l'argent
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Video Player */}
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Video Thumbnail */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
                <img
                  src={activeTestimonial.thumbnail}
                  alt={activeTestimonial.name}
                  className="w-full h-[400px] object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Play Button */}
                {!isPlaying && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePlayVideo}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-orange-500 transition-all duration-300"
                  >
                    <Play className="w-10 h-10 text-gray-900 group-hover:text-white ml-1" />
                  </motion.button>
                )}

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center space-x-3 mb-2">
                    <img
                      src={activeTestimonial.avatar}
                      alt={activeTestimonial.name}
                      className="w-12 h-12 rounded-full border-2 border-white"
                    />
                    <div>
                      <div className="font-bold text-lg">{activeTestimonial.name}</div>
                      <div className="text-sm text-gray-200">
                        {activeTestimonial.role} • {activeTestimonial.company}
                      </div>
                    </div>
                  </div>
                  <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                    {activeTestimonial.flag} {activeTestimonial.country}
                  </div>
                </div>

                {/* AI Feature Badge */}
                <div className="absolute top-6 right-6 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-sm font-bold shadow-lg">
                  🤖 {activeTestimonial.aiFeature}
                </div>
              </div>

              {/* Navigation Arrows */}
              <div className="flex justify-center space-x-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePrev}
                  className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-pink-500 hover:to-orange-500 hover:text-white transition-all duration-300"
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleNext}
                  className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-pink-500 hover:to-orange-500 hover:text-white transition-all duration-300"
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center space-x-2 mt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveIndex(index);
                      setIsPlaying(false);
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? 'bg-gradient-to-r from-pink-500 to-orange-500 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Right: Testimonial Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Quote */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 relative">
                  <Quote className="absolute top-6 right-6 w-12 h-12 text-pink-200" />
                  <div className="flex mb-4">
                    {[...Array(activeTestimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-xl text-gray-700 leading-relaxed italic mb-6">
                    "{activeTestimonial.quote}"
                  </p>
                  <div className="flex items-center space-x-4">
                    <img
                      src={activeTestimonial.avatar}
                      alt={activeTestimonial.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{activeTestimonial.name}</div>
                      <div className="text-gray-600">{activeTestimonial.role}</div>
                      <div className="text-gray-500 text-sm">
                        {activeTestimonial.company} • {activeTestimonial.flag} {activeTestimonial.country}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="bg-gradient-to-br from-pink-500 to-orange-600 rounded-3xl shadow-2xl p-8 text-white">
                  <h4 className="text-2xl font-bold mb-6 flex items-center">
                    <Award className="w-6 h-6 mr-3" />
                    Résultats Obtenus
                  </h4>
                  <div className="space-y-4">
                    {activeTestimonial.results.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex justify-between items-center"
                      >
                        <span className="text-pink-100">{result.metric}</span>
                        <span className="text-3xl font-extrabold">{result.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
                  <p className="text-gray-700 mb-4 font-semibold">
                    Vous aussi, transformez votre business avec l'IA
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-2xl py-4 px-6 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    Essayer Gratuitement 14 Jours 🎁
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* All Testimonials Grid (Small Cards) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
        >
          {testimonials.map((testimonial, index) => (
            <motion.button
              key={testimonial.id}
              onClick={() => {
                setActiveIndex(index);
                setIsPlaying(false);
              }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`text-left bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 ${
                index === activeIndex ? 'ring-4 ring-pink-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-sm">{testimonial.name}</div>
                  <div className="text-xs text-gray-600">{testimonial.flag} {testimonial.country}</div>
                </div>
              </div>
              <div className="text-xs text-gray-700 line-clamp-2 mb-2">
                {testimonial.quote}
              </div>
              <div className="inline-block px-3 py-1 bg-gradient-to-r from-pink-100 to-orange-100 rounded-full text-xs font-semibold text-pink-700">
                {testimonial.aiFeature}
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default VideoTestimonials;
