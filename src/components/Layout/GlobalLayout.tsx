import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import ModernHeader from './ModernHeader';
import ModernFooter from './ModernFooter';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface GlobalLayoutProps {
  children: React.ReactNode;
  showHero?: boolean;
  heroTitle?: string;
  heroSubtitle?: string;
  heroBackground?: string;
}

const GlobalLayout: React.FC<GlobalLayoutProps> = ({
  children,
  showHero = false,
  heroTitle,
  heroSubtitle,
  heroBackground = 'bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900'
}) => {
  const { firebaseUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Rediriger automatiquement vers l'app (Launchpad) si déjà connecté depuis certaines pages publiques
  useEffect(() => {
    if (!firebaseUser) return;
    // Laisser la page de tarification ET la home publique accessibles même connecté
    const publicPaths = new Set(['/subscription', '/login', '/register']);
    if (publicPaths.has(location.pathname)) {
      navigate('/app/launchpad', { replace: true });
    }
  }, [firebaseUser, location.pathname, navigate]);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header moderne global */}
      <ModernHeader forceSolid={!!firebaseUser} />
      
      {/* Hero section optionnelle */}
      {showHero && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`relative ${heroBackground} text-white py-20 overflow-hidden`}
        >
          {/* Animations de fond */}
          <div className="absolute inset-0">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -top-10 -right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.1, 1, 1.1],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -bottom-10 -left-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"
            />
          </div>

          <div className="relative container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Contenu textuel */}
              <div className="text-center lg:text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent"
                >
                  {heroTitle || 'Votre SaaS Moderne'}
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8"
                >
                  {heroSubtitle || 'La plateforme de gestion de projets moderne et intuitive'}
                </motion.p>
              </div>

              {/* Image illustrative */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="relative"
              >
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                  {/* Simulation d'un dashboard */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    {/* Header du dashboard */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg"></div>
                        <div className="text-gray-800 font-semibold">IntuitionConcept</div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Contenu du dashboard */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <div className="flex-1 h-2 bg-gray-200 rounded">
                          <div className="w-3/4 h-full bg-blue-500 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <div className="flex-1 h-2 bg-gray-200 rounded">
                          <div className="w-1/2 h-full bg-green-500 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        <div className="flex-1 h-2 bg-gray-200 rounded">
                          <div className="w-5/6 h-full bg-purple-500 rounded"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Graphique simulé */}
                    <div className="mt-6 h-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-end justify-around p-2">
                      <div className="w-4 bg-blue-500 rounded-t" style={{height: '60%'}}></div>
                      <div className="w-4 bg-green-500 rounded-t" style={{height: '80%'}}></div>
                      <div className="w-4 bg-purple-500 rounded-t" style={{height: '40%'}}></div>
                      <div className="w-4 bg-yellow-500 rounded-t" style={{height: '90%'}}></div>
                      <div className="w-4 bg-red-500 rounded-t" style={{height: '70%'}}></div>
                    </div>
                  </div>
                  
                  {/* Éléments flottants animés */}
                  <motion.div
                    animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <span className="text-white text-xl">📊</span>
                  </motion.div>
                  
                  <motion.div
                    animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center shadow-lg"
                  >
                    <span className="text-white text-lg">✅</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Particules animées */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * 400,
                    opacity: 0
                  }}
                  animate={{
                    y: [null, -100, -200],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                  className="absolute w-2 h-2 bg-white/20 rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Contenu principal */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex-1"
      >
        {children}
      </motion.main>

      {/* Footer moderne global */}
      <ModernFooter />
    </div>
  );
};

export default GlobalLayout;
