import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  country: string;
  quote: string;
  rating: number;
  videoUrl?: string;
  avatar: string;
}

const VideoTestimonials: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Patrick Moungali',
      role: 'Directeur Général',
      company: 'BTP Brazzaville',
      country: 'Congo 🇨🇬',
      quote: 'IntuitionConcept a transformé notre façon de gérer les chantiers. Les devis automatiques nous font gagner des heures chaque semaine.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Clément Makosso',
      role: 'Chef de Projet',
      company: 'Construction Kinshasa',
      country: 'RDC 🇨🇩',
      quote: 'Le suivi GPS de nos équipes et le mode hors-ligne sont parfaits pour nos chantiers en zone rurale.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Jean-Pierre Mbarga',
      role: 'Architecte',
      company: 'Studio Archi Douala',
      country: 'Cameroun 🇨🇲',
      quote: 'L\'analyse de plans par IA est révolutionnaire. Je génère des devis précis en quelques minutes.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Témoignages de nos <span className="text-blue-600">Clients</span>
          </h2>
          <p className="text-xl text-gray-600">
            Découvrez ce que disent les professionnels du BTP
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </div>

              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <div className="relative mb-4">
                <Quote className="w-8 h-8 text-blue-100 absolute -top-2 -left-2" />
                <p className="text-gray-600 italic pl-6">
                  "{testimonial.quote}"
                </p>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">{testimonial.country}</span>
                {testimonial.videoUrl && (
                  <button
                    onClick={() => setActiveVideo(testimonial.id)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Play className="w-4 h-4" />
                    Voir la vidéo
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoTestimonials;
