import React from 'react';
import { 
  DollarSign, 
  Zap, 
  Database, 
  Mail, 
  Eye, 
  Brain, 
  Cloud, 
  Shield,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface ServiceCost {
  name: string;
  icon: React.ReactNode;
  category: 'ai' | 'infrastructure' | 'communication' | 'storage';
  monthlyBase: number; // Coût fixe mensuel
  variableCost: number; // Coût par utilisation
  unit: string;
  description: string;
  provider: string;
  estimatedUsage: {
    starter: number;
    professional: number;
    enterprise: number;
  };
}

const CostAnalysis: React.FC = () => {
  const serviceCosts: ServiceCost[] = [
    {
      name: 'Firebase Hosting & Auth',
      icon: <Cloud className="w-5 h-5" />,
      category: 'infrastructure',
      monthlyBase: 0,
      variableCost: 0.026,
      unit: 'par GB stockage',
      description: 'Hébergement, authentification, base de données temps réel',
      provider: 'Google Firebase',
      estimatedUsage: { starter: 2, professional: 10, enterprise: 50 }
    },
    {
      name: 'Firestore Database',
      icon: <Database className="w-5 h-5" />,
      category: 'storage',
      monthlyBase: 0,
      variableCost: 0.18,
      unit: 'par 100k lectures',
      description: 'Base de données NoSQL pour projets, devis, documents',
      provider: 'Google Firebase',
      estimatedUsage: { starter: 50, professional: 200, enterprise: 1000 }
    },
    {
      name: 'Groq AI (LLM)',
      icon: <Zap className="w-5 h-5" />,
      category: 'ai',
      monthlyBase: 0,
      variableCost: 0.27,
      unit: 'par 1M tokens',
      description: 'IA rapide pour génération de devis, analyses de projets',
      provider: 'Groq',
      estimatedUsage: { starter: 2, professional: 8, enterprise: 25 }
    },
    {
      name: 'Claude AI (Anthropic)',
      icon: <Brain className="w-5 h-5" />,
      category: 'ai',
      monthlyBase: 0,
      variableCost: 3.00,
      unit: 'par 1M tokens',
      description: 'IA avancée pour analyses complexes, conformité',
      provider: 'Anthropic',
      estimatedUsage: { starter: 0.5, professional: 2, enterprise: 8 }
    },
    {
      name: 'Google Vision API',
      icon: <Eye className="w-5 h-5" />,
      category: 'ai',
      monthlyBase: 0,
      variableCost: 1.50,
      unit: 'par 1000 images',
      description: 'OCR intelligent pour plans, factures, documents',
      provider: 'Google Cloud',
      estimatedUsage: { starter: 100, professional: 500, enterprise: 2000 }
    },
    {
      name: 'SendGrid Email',
      icon: <Mail className="w-5 h-5" />,
      category: 'communication',
      monthlyBase: 0,
      variableCost: 0.0006,
      unit: 'par email',
      description: 'Envoi emails automatiques, notifications, devis',
      provider: 'SendGrid',
      estimatedUsage: { starter: 1000, professional: 5000, enterprise: 20000 }
    },
    {
      name: 'Firebase Storage',
      icon: <Shield className="w-5 h-5" />,
      category: 'storage',
      monthlyBase: 0,
      variableCost: 0.026,
      unit: 'par GB',
      description: 'Stockage fichiers, photos, plans, documents PDF',
      provider: 'Google Firebase',
      estimatedUsage: { starter: 5, professional: 25, enterprise: 100 }
    },
    {
      name: 'Tesseract.js (Local OCR)',
      icon: <Eye className="w-5 h-5" />,
      category: 'ai',
      monthlyBase: 0,
      variableCost: 0,
      unit: 'gratuit',
      description: 'OCR local pour réduire les coûts Google Vision',
      provider: 'Open Source',
      estimatedUsage: { starter: 0, professional: 0, enterprise: 0 }
    }
  ];

  const calculateMonthlyCost = (service: ServiceCost, plan: 'starter' | 'professional' | 'enterprise'): number => {
    const usage = service.estimatedUsage[plan];
    return service.monthlyBase + (service.variableCost * usage);
  };

  const getTotalCostByPlan = (plan: 'starter' | 'professional' | 'enterprise'): number => {
    return serviceCosts.reduce((total, service) => total + calculateMonthlyCost(service, plan), 0);
  };

  const getCategoryColor = (category: string): string => {
    const colors = {
      ai: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
      infrastructure: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      communication: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      storage: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
    };
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const plans = [
    { id: 'starter', name: 'Starter', color: 'blue' },
    { id: 'professional', name: 'Professional', color: 'purple' },
    { id: 'enterprise', name: 'Enterprise', color: 'amber' }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          <DollarSign className="w-4 h-4" />
          <span>Analyse des Coûts Techniques</span>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Coûts des Services Externes
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Détail des technologies payantes utilisées et impact sur les tarifs par plan
        </p>
      </div>

      {/* Cost Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const totalCost = getTotalCostByPlan(plan.id);
          const margin = plan.id === 'starter' ? 2.85 : plan.id === 'professional' ? 7.77 : 19.57; // Prix CFA divisé par 1000
          const profitMargin = ((margin - totalCost) / margin) * 100;
          
          return (
            <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center space-x-2 bg-gradient-to-r from-${plan.color}-500 to-${plan.color}-600 text-white px-3 py-1 rounded-full text-sm font-medium`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>{plan.name}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${totalCost.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Coût technique mensuel
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Prix de vente (CFA):</span>
                      <span className="font-medium">{(margin * 1000).toLocaleString()} CFA</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600 dark:text-gray-400">Marge bénéficiaire:</span>
                      <span className={`font-medium ${profitMargin > 80 ? 'text-green-600' : profitMargin > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {profitMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Cost Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Détail des Coûts par Service</h2>
              <p className="text-gray-200 text-sm">Analyse complète des dépenses techniques</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Service</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Catégorie</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Coût Unitaire</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Starter</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Professional</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {serviceCosts.map((service, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(service.category)}`}>
                          {service.icon}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{service.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{service.provider}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                        {service.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          ${service.variableCost.toFixed(3)}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">{service.unit}</div>
                      </div>
                    </td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="py-4 px-4 text-center">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">
                            ${calculateMonthlyCost(service, plan.id).toFixed(2)}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {service.estimatedUsage[plan.id]} {service.unit.split(' ').pop()}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 dark:bg-gray-700/50 font-semibold">
                  <td colSpan={3} className="py-4 px-4 text-gray-900 dark:text-white">
                    TOTAL MENSUEL
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="py-4 px-4 text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ${getTotalCostByPlan(plan.id).toFixed(2)}
                      </div>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Cost Optimization Tips */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Optimisations Mises en Place
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Groq vs OpenAI</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                90% moins cher que GPT-4 pour la génération de texte
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">OCR Hybride</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tesseract.js local + Google Vision pour optimiser les coûts
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Cache Intelligent</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Réduction des appels API répétitifs via mise en cache
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Tarification Régionale</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Prix adaptés maintiennent 85%+ de marge bénéficiaire
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostAnalysis;
