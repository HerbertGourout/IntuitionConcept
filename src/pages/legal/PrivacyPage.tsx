import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlobalLayout from '../../components/Layout/GlobalLayout';
import { Shield, Mail, MapPin } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  return (
    <GlobalLayout showHero={false}>
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Politique de Confidentialité</h1>
                <p className="text-gray-500">Dernière mise à jour : Décembre 2024</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  IntuitionConcept SAS ("nous", "notre", "nos") s'engage à protéger la vie privée 
                  de ses utilisateurs. Cette politique de confidentialité explique comment nous 
                  collectons, utilisons, stockons et protégeons vos données personnelles lorsque 
                  vous utilisez notre plateforme de gestion BTP.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. Données collectées</h2>
                <p className="text-gray-600 mb-4">Nous collectons les types de données suivants :</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Données d'identification :</strong> nom, prénom, email, téléphone</li>
                  <li><strong>Données professionnelles :</strong> entreprise, fonction, pays</li>
                  <li><strong>Données d'utilisation :</strong> projets, devis, factures créés</li>
                  <li><strong>Données techniques :</strong> adresse IP, type de navigateur, appareil</li>
                  <li><strong>Données de paiement :</strong> transactions Mobile Money (via nos partenaires)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. Utilisation des données</h2>
                <p className="text-gray-600 mb-4">Vos données sont utilisées pour :</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Fournir et améliorer nos services</li>
                  <li>Gérer votre compte et vos abonnements</li>
                  <li>Traiter vos paiements</li>
                  <li>Vous envoyer des communications importantes</li>
                  <li>Assurer la sécurité de la plateforme</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. Partage des données</h2>
                <p className="text-gray-600 leading-relaxed">
                  Nous ne vendons jamais vos données. Nous pouvons les partager avec :
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4">
                  <li>Nos sous-traitants techniques (hébergement, paiement)</li>
                  <li>Les autorités si requis par la loi</li>
                  <li>Vos collaborateurs au sein de votre organisation</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. Vos droits (RGPD)</h2>
                <p className="text-gray-600 mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                  <li><strong>Droit de rectification :</strong> corriger vos données</li>
                  <li><strong>Droit à l'effacement :</strong> supprimer vos données</li>
                  <li><strong>Droit à la portabilité :</strong> exporter vos données</li>
                  <li><strong>Droit d'opposition :</strong> refuser certains traitements</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  Pour exercer ces droits, contactez-nous à{' '}
                  <a href="mailto:privacy@intuitionconcept.com" className="text-blue-600 hover:underline">
                    privacy@intuitionconcept.com
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">6. Sécurité</h2>
                <p className="text-gray-600 leading-relaxed">
                  Nous mettons en œuvre des mesures de sécurité appropriées : chiffrement SSL/TLS, 
                  authentification à deux facteurs, sauvegardes régulières, et accès restreint aux données.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">7. Conservation</h2>
                <p className="text-gray-600 leading-relaxed">
                  Vos données sont conservées pendant la durée de votre abonnement, puis 3 ans 
                  après la fin de la relation commerciale, sauf obligation légale contraire.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">8. Contact</h2>
                <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span>privacy@intuitionconcept.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span>IntuitionConcept SAS, Dakar, Sénégal</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-8 text-center">
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

export default PrivacyPage;
