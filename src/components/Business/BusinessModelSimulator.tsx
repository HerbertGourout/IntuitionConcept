import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Zap,
  Building,
  Crown,
  AlertCircle,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';

interface BusinessScenario {
  name: string;
  description: string;
  customers: {
    starter: number;
    pro: number;
    enterprise: number;
  };
  churnRate: number; // Taux de désabonnement mensuel
  acquisitionCost: number; // Coût d'acquisition par client (FCFA)
  growthRate: number; // Taux de croissance mensuel
}

interface CostStructure {
  infrastructure: {
    firebase: number;
    hosting: number;
    cdn: number;
  };
  aiServices: {
    groq: number;
    Modèle: number;
    googleVision: number;
  };
  communication: {
    sendgrid: number;
    sms: number;
  };
  development: {
    salaries: number;
    tools: number;
  };
  marketing: {
    advertising: number;
    content: number;
  };
  operations: {
    support: number;
    legal: number;
    accounting: number;
  };
}

interface MonthlyResult {
  month: number;
  customers: {
    starter: number;
    pro: number;
    enterprise: number;
  };
  totalCustomers: number;
  newCustomers: number;
  churnLoss: number;
  revenue: number;
  costs: number;
  netProfit: number;
  cumulativeProfit: number;
}

const BusinessModelSimulator: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('conservative');
  const [timeHorizon, setTimeHorizon] = useState<number>(12); // mois
  const [results, setResults] = useState<MonthlyResult[] | null>(null);

  // Prix des plans (FCFA)
  const pricing = {
    starter: 9000,
    pro: 24400,
    enterprise: 61500
  };

  // Scénarios de business
  const scenarios: Record<string, BusinessScenario> = {
    conservative: {
      name: 'Conservateur',
      description: 'Croissance lente et stable',
      customers: { starter: 50, pro: 15, enterprise: 2 },
      churnRate: 0.05, // 5% par mois
      acquisitionCost: 15000, // 15k FCFA par client
      growthRate: 0.15 // 15% par mois
    },
    realistic: {
      name: 'Réaliste',
      description: 'Croissance modérée avec marketing',
      customers: { starter: 120, pro: 40, enterprise: 8 },
      churnRate: 0.08,
      acquisitionCost: 25000,
      growthRate: 0.25
    },
    optimistic: {
      name: 'Optimiste',
      description: 'Forte croissance avec investissement',
      customers: { starter: 300, pro: 100, enterprise: 25 },
      churnRate: 0.12,
      acquisitionCost: 35000,
      growthRate: 0.40
    }
  };

  // Structure des coûts mensuels (FCFA)
  const costs: CostStructure = {
    infrastructure: {
      firebase: 45000, // Firebase Blaze plan
      hosting: 15000, // Hébergement supplémentaire
      cdn: 8000 // CDN et sécurité
    },
    aiServices: {
      groq: 120000, // API Groq (très abordable)
      Modèle: 200000, // Anthropic Modèle
      googleVision: 80000 // Google Vision API
    },
    communication: {
      sendgrid: 25000, // Emails transactionnels
      sms: 40000 // SMS notifications
    },
    development: {
      salaries: 800000, // 2 développeurs (400k chacun)
      tools: 50000 // Outils dev et licences
    },
    marketing: {
      advertising: 300000, // Publicité digitale
      content: 100000 // Création de contenu
    },
    operations: {
      support: 200000, // Support client
      legal: 50000, // Juridique
      accounting: 75000 // Comptabilité
    }
  };

  const calculateBusinessModel = (): MonthlyResult[] => {
    const scenario = scenarios[selectedScenario];
    const monthlyResults: MonthlyResult[] = [];
    
    const currentCustomers = { ...scenario.customers };
    
    for (let month = 1; month <= timeHorizon; month++) {
      // Calcul des revenus
      const monthlyRevenue = 
        (currentCustomers.starter * pricing.starter) +
        (currentCustomers.pro * pricing.pro) +
        (currentCustomers.enterprise * pricing.enterprise);

      // Calcul des coûts totaux
      const totalCosts = Object.values(costs).reduce((total: number, category) => {
        return total + Object.values(category as Record<string, number>).reduce((sum: number, cost: number) => sum + cost, 0);
      }, 0);

      // Coûts d'acquisition pour nouveaux clients
      const totalCustomers = currentCustomers.starter + currentCustomers.pro + currentCustomers.enterprise;
      const newCustomers = Math.floor(totalCustomers * scenario.growthRate);
      const acquisitionCosts = newCustomers * scenario.acquisitionCost;

      // Churn (perte de clients)
      const churnLoss = Math.floor(totalCustomers * scenario.churnRate);
      
      // Profit net
      const netProfit = monthlyRevenue - totalCosts - acquisitionCosts;

      monthlyResults.push({
        month,
        customers: { ...currentCustomers },
        totalCustomers,
        newCustomers,
        churnLoss,
        revenue: monthlyRevenue,
        costs: totalCosts + acquisitionCosts,
        netProfit,
        cumulativeProfit: month === 1 ? netProfit : monthlyResults[month - 2].cumulativeProfit + netProfit
      });

      // Mise à jour pour le mois suivant
      const growth = Math.floor(totalCustomers * scenario.growthRate);
      const churn = Math.floor(totalCustomers * scenario.churnRate);
      
      // Répartition de la croissance (60% starter, 30% pro, 10% enterprise)
      const starterGrowth = Math.floor(growth * 0.6);
      const proGrowth = Math.floor(growth * 0.3);
      const enterpriseGrowth = Math.floor(growth * 0.1);

      currentCustomers.starter += starterGrowth - Math.floor(churn * 0.6);
      currentCustomers.pro += proGrowth - Math.floor(churn * 0.3);
      currentCustomers.enterprise += enterpriseGrowth - Math.floor(churn * 0.1);

      // Éviter les nombres négatifs
      currentCustomers.starter = Math.max(0, currentCustomers.starter);
      currentCustomers.pro = Math.max(0, currentCustomers.pro);
      currentCustomers.enterprise = Math.max(0, currentCustomers.enterprise);
    }

    return monthlyResults;
  };

  useEffect(() => {
    setResults(calculateBusinessModel());
  }, [selectedScenario, timeHorizon]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const lastMonth = results?.[results.length - 1];
  const totalRevenue = results?.reduce((sum: number, month: MonthlyResult) => sum + month.revenue, 0) || 0;
  const totalCosts = results?.reduce((sum: number, month: MonthlyResult) => sum + month.costs, 0) || 0;
  const totalProfit = results?.reduce((sum: number, month: MonthlyResult) => sum + month.netProfit, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Calculator className="w-10 h-10 text-blue-600" />
            Simulateur Business Model
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Projection des revenus nets IntuitionConcept BTP
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scénario</h3>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(scenarios).map(([key, scenario]) => (
                <option key={key} value={key}>
                  {scenario.name} - {scenario.description}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Horizon temporel: {timeHorizon} mois
            </h3>
            <input
              type="range"
              min="6"
              max="36"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Revenus Totaux</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Coûts Totaux</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCosts)}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Profit Net</p>
                <p className="text-2xl font-bold">{formatCurrency(totalProfit)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Clients Finaux</p>
                <p className="text-2xl font-bold">{lastMonth?.totalCustomers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-blue-600" />
              Répartition des Revenus (Mois {timeHorizon})
            </h3>
            {lastMonth && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Starter ({lastMonth.customers.starter} clients)</span>
                  </div>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(lastMonth.customers.starter * pricing.starter)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Pro ({lastMonth.customers.pro} clients)</span>
                  </div>
                  <span className="font-bold text-purple-600">
                    {formatCurrency(lastMonth.customers.pro * pricing.pro)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-amber-600" />
                    <span className="font-medium">Enterprise ({lastMonth.customers.enterprise} clients)</span>
                  </div>
                  <span className="font-bold text-amber-600">
                    {formatCurrency(lastMonth.customers.enterprise * pricing.enterprise)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-red-600" />
              Structure des Coûts Mensuels
            </h3>
            <div className="space-y-3">
              {Object.entries(costs).map(([category, categoryCosts]) => {
                const total = Object.values(categoryCosts as Record<string, number>).reduce((sum: number, cost: number) => sum + cost, 0);
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium capitalize text-gray-700 dark:text-gray-300">
                      {category.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(total)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Profitability Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-green-600" />
            Analyse de Rentabilité
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
              <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Marge Nette
              </h4>
              <p className="text-3xl font-bold text-green-600">
                {totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}%
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Revenus Mensuels Moyens
              </h4>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(Math.round(totalRevenue / timeHorizon))}
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl">
              <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                Profit Mensuel Moyen
              </h4>
              <p className="text-3xl font-bold text-purple-600">
                {formatCurrency(Math.round(totalProfit / timeHorizon))}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Points Clés</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                  <li>• Les coûts d'acquisition représentent un investissement initial important</li>
                  <li>• La rentabilité s'améliore avec l'échelle (plus de clients = meilleure marge)</li>
                  <li>• Le taux de churn impact directement la profitabilité long terme</li>
                  <li>• Les coûts IA sont optimisés (Groq 90% moins cher qu'Service)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessModelSimulator;
