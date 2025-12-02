import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlobalLayout from '../../components/Layout/GlobalLayout';
import { Cookie, Mail } from 'lucide-react';

const CookiesPage: React.FC = () => {
  return (
    <GlobalLayout showHero={false}>
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                <Cookie className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Politique de Cookies</h1>
                <p className="text-gray-500">Dernière mise à jour : Décembre 2024</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. Qu'est-ce qu'un cookie ?</h2>
                <p className="text-gray-600 leading-relaxed">
                  Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous 
                  visitez un site web. Les cookies permettent au site de mémoriser vos actions 
                  et préférences pendant une période donnée.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. Cookies que nous utilisons</h2>
                
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="font-semibold text-green-800 mb-2">Cookies essentiels</h3>
                    <p className="text-green-700 text-sm">
                      Nécessaires au fonctionnement du site. Ils permettent la navigation, 
                      l'authentification et la sécurité. Ils ne peuvent pas être désactivés.
                    </p>
                    <ul className="text-green-700 text-sm mt-2 list-disc list-inside">
                      <li>Session utilisateur</li>
                      <li>Token d'authentification</li>
                      <li>Préférences de sécurité</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Cookies de performance</h3>
                    <p className="text-blue-700 text-sm">
                      Nous aident à comprendre comment les visiteurs utilisent notre site 
                      pour l'améliorer.
                    </p>
                    <ul className="text-blue-700 text-sm mt-2 list-disc list-inside">
                      <li>Google Analytics (anonymisé)</li>
                      <li>Mesure de performance</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <h3 className="font-semibold text-purple-800 mb-2">Cookies de fonctionnalité</h3>
                    <p className="text-purple-700 text-sm">
                      Mémorisent vos préférences pour personnaliser votre expérience.
                    </p>
                    <ul className="text-purple-700 text-sm mt-2 list-disc list-inside">
                      <li>Langue préférée</li>
                      <li>Thème (clair/sombre)</li>
                      <li>Paramètres d'affichage</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. Durée de conservation</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 text-gray-700">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr className="border-b">
                        <td className="py-3 px-4">Session</td>
                        <td className="py-3 px-4">Jusqu'à fermeture du navigateur</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Authentification</td>
                        <td className="py-3 px-4">30 jours</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Préférences</td>
                        <td className="py-3 px-4">1 an</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Analytics</td>
                        <td className="py-3 px-4">13 mois</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. Gérer vos cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Vous pouvez contrôler et supprimer les cookies via les paramètres de votre 
                  navigateur. Notez que la désactivation de certains cookies peut affecter 
                  le fonctionnement du site.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <a 
                    href="https://support.google.com/chrome/answer/95647" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-600">Chrome</span>
                  </a>
                  <a 
                    href="https://support.mozilla.org/fr/kb/cookies" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-600">Firefox</span>
                  </a>
                  <a 
                    href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-600">Safari</span>
                  </a>
                  <a 
                    href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-600">Edge</span>
                  </a>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. Contact</h2>
                <p className="text-gray-600 mb-4">
                  Pour toute question concernant notre utilisation des cookies :
                </p>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5 text-amber-600" />
                    <span>privacy@intuitionconcept.com</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-8 flex justify-center gap-6">
              <Link to="/privacy" className="text-blue-600 hover:underline">
                Politique de confidentialité
              </Link>
              <Link to="/" className="text-blue-600 hover:underline">
                ← Retour à l'accueil
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default CookiesPage;
