}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Fonctionnalités Advanced</h1>
              </div>
              <p className="text-purple-100">
                Propulsé par Gemini 3 - Économisez jusqu'à 90% avec une qualité supérieure
              </p>
            </div>
            {isAdvancedAvailable ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-sm font-semibold">✅ Configuré</div>
                <div className="text-xs text-purple-100">Prêt à utiliser</div>
              </div>
            ) : (
              <div className="bg-orange-500/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-sm font-semibold">⚠️ Configuration requise</div>
                <div className="text-xs text-orange-100">Clé API manquante</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto py-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'overview'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Vue d'ensemble
            </button>
            {services.map(service => (
              <button
                key={service.id}
                onClick={() => setActiveTab(service.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === service.id
                    ? `bg-${service.color}-100 text-${service.color}-700`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <service.icon className="w-4 h-4 inline mr-2" />
                {service.name}
              </button>
            ))}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'settings'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Paramètres
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Mode Selector Demo */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Sélecteur de Mode
              </h2>
              <AdvancedModeSelector
                currentMode={demoMode}
                onModeChange={setDemoMode}
                serviceName="Démonstration"
                estimatedCost={{
                  standard: 3000,
                  advanced: 300
                }}
                estimatedTime={{
                  standard: 15,
                  advanced: 5
                }}
              />
            </div>

            {/* Services Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Services Disponibles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => setActiveTab(service.id)}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
                  >
                    <div className={`inline-flex p-3 rounded-lg bg-${service.color}-100 mb-4`}>
                      <service.icon className={`w-6 h-6 text-${service.color}-600`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        Économie: {service.savings}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
                <div className="text-3xl font-bold text-green-700 mb-2">90%</div>
                <div className="text-sm text-green-600">Économies moyennes</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-6">
                <div className="text-3xl font-bold text-blue-700 mb-2">3-10x</div>
                <div className="text-sm text-blue-600">Plus rapide</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
                <div className="text-3xl font-bold text-purple-700 mb-2">+35%</div>
                <div className="text-sm text-purple-600">Qualité améliorée</div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                 Pour Commencer
              </h3>
              <ol className="space-y-3 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Obtenez une clé API Gemini 3 sur <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Configurez votre fichier <code className="bg-blue-100 px-2 py-0.5 rounded">.env.local</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Activez les fonctionnalités dans l'onglet Paramètres</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">4.</span>
                  <span>Explorez chaque service via les onglets ci-dessus</span>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Service Tabs */}
        {services.map(service => (
          activeTab === service.id && (
            <div key={service.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-lg bg-${service.color}-100`}>
                  <service.icon className={`w-6 h-6 text-${service.color}-600`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{service.name}</h2>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3>Fonctionnalités</h3>
                <p>
                  Ce service utilise Gemini 3 pour fournir des résultats de qualité supérieure
                  avec des économies significatives par rapport aux solutions standard.
                </p>
                
                <h3>Exemple d'utilisation</h3>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  <code>{`import { ${service.name.replace(/\s+/g, '')}Advanced } from '@/services/ai/...';

const service = new ${service.name.replace(/\s+/g, '')}Advanced();
const result = await service.process(data);

console.log(result.data);
console.log('Coût:', result.metadata.cost, 'FCFA');`}</code>
                </pre>

                <h3>Avantages</h3>
                <ul>
                  <li>Économie de coûts: <strong>{service.savings}</strong></li>
                  <li>Qualité supérieure grâce à Gemini 3</li>
                  <li>Résultats plus rapides</li>
                  <li>Fonctionnalités avancées uniques</li>
                </ul>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-purple-800 mb-0">
                    📚 <strong>Documentation:</strong> Consultez <code>INTEGRATION_GUIDE.md</code> pour des exemples complets d'intégration.
                  </p>
                </div>
              </div>
            </div>
          )
        ))}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <AdvancedAnalyticsDashboard />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <AdvancedFeaturesSettings />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFeaturesDemo;
