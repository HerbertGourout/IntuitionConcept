import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlobalLayout from '../../components/Layout/GlobalLayout';
import { FileText, Mail, MapPin } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <GlobalLayout showHero={false}>
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Conditions Générales d'Utilisation</h1>
                <p className="text-gray-500">Dernière mise à jour : Décembre 2024</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. Objet</h2>
                <p className="text-gray-600 leading-relaxed">
                  Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et 
                  l'utilisation de la plateforme IntuitionConcept, un service SaaS de gestion 
                  de projets BTP édité par IntuitionConcept SAS.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. Acceptation</h2>
                <p className="text-gray-600 leading-relaxed">
                  En créant un compte ou en utilisant nos services, vous acceptez sans réserve 
                  les présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas 
                  utiliser notre plateforme.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. Description du service</h2>
                <p className="text-gray-600 mb-4">IntuitionConcept propose :</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Gestion de projets et chantiers BTP</li>
                  <li>Création de devis et factures</li>
                  <li>Suivi des équipes et ressources</li>
                  <li>Paiements via Mobile Money</li>
                  <li>Tableaux de bord et reporting</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. Inscription et compte</h2>
                <p className="text-gray-600 leading-relaxed">
                  Pour utiliser nos services, vous devez créer un compte avec des informations 
                  exactes et à jour. Vous êtes responsable de la confidentialité de vos 
                  identifiants et de toutes les activités effectuées sous votre compte.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. Abonnements et paiements</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Nos services sont proposés sous forme d'abonnements mensuels ou annuels. 
                  Les tarifs sont indiqués sur notre page de tarification et peuvent être 
                  modifiés avec un préavis de 30 jours.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Les paiements sont traités via nos partenaires de paiement sécurisés 
                  (Mobile Money, carte bancaire). Aucun remboursement n'est accordé pour 
                  les périodes partiellement utilisées.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">6. Utilisation acceptable</h2>
                <p className="text-gray-600 mb-4">Vous vous engagez à ne pas :</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Utiliser le service à des fins illégales</li>
                  <li>Tenter de contourner les mesures de sécurité</li>
                  <li>Partager vos identifiants avec des tiers non autorisés</li>
                  <li>Surcharger intentionnellement nos serveurs</li>
                  <li>Copier ou reproduire notre logiciel</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">7. Propriété intellectuelle</h2>
                <p className="text-gray-600 leading-relaxed">
                  IntuitionConcept et tous ses composants (code, design, marques) sont la 
                  propriété exclusive d'IntuitionConcept SAS. Vos données vous appartiennent 
                  et vous pouvez les exporter à tout moment.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">8. Disponibilité</h2>
                <p className="text-gray-600 leading-relaxed">
                  Nous nous efforçons de maintenir une disponibilité de 99,9%. Des interruptions 
                  peuvent survenir pour maintenance. Nous vous informerons à l'avance des 
                  maintenances programmées.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">9. Limitation de responsabilité</h2>
                <p className="text-gray-600 leading-relaxed">
                  IntuitionConcept ne saurait être tenu responsable des dommages indirects, 
                  pertes de données ou manque à gagner résultant de l'utilisation de nos services, 
                  dans les limites autorisées par la loi.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">10. Résiliation</h2>
                <p className="text-gray-600 leading-relaxed">
                  Vous pouvez résilier votre abonnement à tout moment depuis votre espace client. 
                  Nous nous réservons le droit de suspendre ou résilier votre compte en cas de 
                  violation des présentes CGU.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">11. Droit applicable</h2>
                <p className="text-gray-600 leading-relaxed">
                  Les présentes CGU sont régies par le droit sénégalais. Tout litige sera soumis 
                  aux tribunaux compétents de Dakar, Sénégal.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">12. Contact</h2>
                <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <span>legal@intuitionconcept.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5 text-purple-600" />
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

export default TermsPage;
