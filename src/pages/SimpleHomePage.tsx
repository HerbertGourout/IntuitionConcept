import React from 'react';

const SimpleHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation simple */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span className="text-xl font-bold text-gray-900">IntuitionBTP</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/pricing" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Tarifs
              </a>
              <a href="/login" className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium">
                Connexion
              </a>
              <a href="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium">
                Inscription
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Gérez vos Projets
              <br />
              <span className="text-orange-400">en Afrique</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              La plateforme SaaS de gestion de projets conçue spécialement pour l'Afrique francophone. 
              Avec paiements Mobile Money intégrés.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/pricing"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
              >
                Commencer Gratuitement
              </a>
              <a
                href="/app/dashboard"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
              >
                Voir la Démo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-900 mb-2">500+</div>
              <div className="text-gray-600">Projets Gérés</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-900 mb-2">50+</div>
              <div className="text-gray-600">Entreprises Clientes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-900 mb-2">15</div>
              <div className="text-gray-600">Pays Couverts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-900 mb-2">99.9%</div>
              <div className="text-gray-600">Disponibilité</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Toutes les Fonctionnalités dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une suite complète d'outils pour gérer efficacement vos projets de construction
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 text-xl">🏗️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestion de Projets</h3>
              <p className="text-gray-600 mb-4">Planifiez, suivez et gérez vos projets de construction avec des outils avancés.</p>
              <a href="/app/projects" className="text-blue-600 hover:text-blue-700 font-medium">
                En savoir plus →
              </a>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestion d'Équipe</h3>
              <p className="text-gray-600 mb-4">Coordonnez vos équipes, assignez des tâches et suivez les performances.</p>
              <a href="/app/team" className="text-blue-600 hover:text-blue-700 font-medium">
                En savoir plus →
              </a>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Planning & Gantt</h3>
              <p className="text-gray-600 mb-4">Visualisez vos projets avec des diagrammes de Gantt interactifs.</p>
              <a href="/app/planning" className="text-blue-600 hover:text-blue-700 font-medium">
                En savoir plus →
              </a>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 text-xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestion Financière</h3>
              <p className="text-gray-600 mb-4">Suivez les budgets, dépenses et rentabilité de vos projets.</p>
              <a href="/app/finances" className="text-blue-600 hover:text-blue-700 font-medium">
                En savoir plus →
              </a>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 text-xl">📄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Documents & Rapports</h3>
              <p className="text-gray-600 mb-4">Centralisez tous vos documents et générez des rapports détaillés.</p>
              <a href="/app/documents" className="text-blue-600 hover:text-blue-700 font-medium">
                En savoir plus →
              </a>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 text-xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile Money</h3>
              <p className="text-gray-600 mb-4">Paiements intégrés avec Orange Money, MTN Money et autres.</p>
              <a href="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">
                En savoir plus →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-gray-600">
              Rejoignez des centaines d'entreprises qui nous font confiance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex mb-4">
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-600 mb-4">"Cette plateforme a révolutionné notre gestion de projets. Nous avons gagné 40% d'efficacité."</p>
              <div>
                <div className="font-semibold text-gray-900">Amadou Diallo</div>
                <div className="text-gray-500 text-sm">BTP Sénégal</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex mb-4">
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-600 mb-4">"L'intégration Mobile Money nous permet de gérer les paiements facilement avec nos équipes."</p>
              <div>
                <div className="font-semibold text-gray-900">Fatima Benali</div>
                <div className="text-gray-500 text-sm">Construction Maroc</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex mb-4">
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-600 mb-4">"Interface intuitive et fonctionnalités adaptées au marché africain. Excellent !"</p>
              <div>
                <div className="font-semibold text-gray-900">Jean-Claude Mbarga</div>
                <div className="text-gray-500 text-sm">Cameroun BTP</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à transformer votre gestion de projets ?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez des milliers d'entreprises qui utilisent déjà notre plateforme
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/pricing"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
            >
              Voir les Tarifs
            </a>
            <a
              href="/app/dashboard"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
            >
              Essayer Gratuitement
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">I</span>
                </div>
                <span className="text-xl font-bold">IntuitionBTP</span>
              </div>
              <p className="text-gray-400">
                La plateforme de gestion de projets conçue pour l'Afrique francophone.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Fonctionnalités</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/app/projects" className="hover:text-white">Gestion de Projets</a></li>
                <li><a href="/app/team" className="hover:text-white">Gestion d'Équipe</a></li>
                <li><a href="/app/finances" className="hover:text-white">Finances</a></li>
                <li><a href="/app/planning" className="hover:text-white">Planning</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">À propos</a></li>
                <li><a href="/pricing" className="hover:text-white">Tarifs</a></li>
                <li><a href="#" className="hover:text-white">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white">Conditions</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 IntuitionBTP. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleHomePage;
