import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';

const VideoDemo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Découvrez IntuitionConcept en Action
          </h2>
          <p className="text-xl text-blue-200">
            Une démonstration complète de notre plateforme
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            {!isPlaying ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPlaying(true)}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mb-4 mx-auto"
                  >
                    <Play className="w-8 h-8 text-blue-600 ml-1" />
                  </motion.button>
                  <p className="text-white text-lg font-medium">
                    Regarder la démo (3 min)
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <button
                  onClick={() => setIsPlaying(false)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Demo Video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-blue-200">
            Plus de 10,000 entreprises utilisent déjà IntuitionConcept
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoDemo;
