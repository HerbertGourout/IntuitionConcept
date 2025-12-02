import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Calculator, Check, ArrowRight } from 'lucide-react';

interface PricingCalculatorProps {
  onSelectPlan?: (plan: string) => void;
}

/**
 * Calculateur de prix interactif
 * Permet d'estimer le coût selon le nombre d'utilisateurs
 */
const PricingCalculator: React.FC<PricingCalculatorProps> = ({ onSelectPlan }) => {
  const [users, setUsers] = useState(5);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Prix de base par utilisateur/mois
  const pricing = {
    starter: { base: 15000, perUser: 5000, maxUsers: 5 },
    pro: { base: 45000, perUser: 8000, maxUsers: 25 },
    enterprise: { base: 150000, perUser: 12000, maxUsers: Infinity },
  };

  const yearlyDiscount = 0.20; // 20% de réduction annuelle

  const calculations = useMemo(() => {
    const getMonthlyPrice = (plan: keyof typeof pricing) => {
      const { base, perUser, maxUsers } = pricing[plan];
      if (users > maxUsers) return null;
      return base + (users - 1) * perUser;
    };

    const starterMonthly = getMonthlyPrice('starter');
    const proMonthly = getMonthlyPrice('pro');
    const enterpriseMonthly = getMonthlyPrice('enterprise');

    const applyDiscount = (price: number | null) => {
      if (price === null) return null;
      return billingCycle === 'yearly' ? price * (1 - yearlyDiscount) : price;
    };

    return {
      starter: {
        monthly: starterMonthly,
        final: applyDiscount(starterMonthly),
        yearly: starterMonthly ? starterMonthly * 12 * (1 - yearlyDiscount) : null,
      },
      pro: {
        monthly: proMonthly,
        final: applyDiscount(proMonthly),
        yearly: proMonthly ? proMonthly * 12 * (1 - yearlyDiscount) : null,
      },
      enterprise: {
        monthly: enterpriseMonthly,
        final: applyDiscount(enterpriseMonthly),
        yearly: enterpriseMonthly ? enterpriseMonthly * 12 * (1 - yearlyDiscount) : null,
      },
    };
  }, [users, billingCycle]);

  const formatPrice = (price: number | null) => {
    if (price === null) return '—';
    return new Intl.NumberFormat('fr-FR').format(Math.round(price)) + ' FCFA';
  };

  const recommendedPlan = useMemo(() => {
    if (users <= 5) return 'starter';
    if (users <= 25) return 'pro';
    return 'enterprise';
  }, [users]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Calculator className="w-4 h-4" />
          Estimez votre coût
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          Calculateur de prix personnalisé
        </h3>
        <p className="text-gray-600 mt-2">
          Ajustez le nombre d'utilisateurs pour voir le prix adapté à votre équipe
        </p>
      </div>

      {/* Slider utilisateurs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 text-gray-700 font-medium">
            <Users className="w-5 h-5 text-blue-600" />
            Nombre d'utilisateurs
          </label>
          <motion.span
            key={users}
            initial={{ scale: 1.2, color: '#2563eb' }}
            animate={{ scale: 1, color: '#1f2937' }}
            className="text-2xl font-bold"
          >
            {users}
          </motion.span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="1"
            max="50"
            value={users}
            onChange={(e) => setUsers(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-6
                       [&::-webkit-slider-thumb]:h-6
                       [&::-webkit-slider-thumb]:bg-blue-600
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:shadow-lg
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:transition-transform
                       [&::-webkit-slider-thumb]:hover:scale-110"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>1</span>
            <span>10</span>
            <span>25</span>
            <span>50+</span>
          </div>
        </div>
      </div>

      {/* Toggle facturation */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
          Mensuel
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <motion.div
            className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
            animate={{ left: billingCycle === 'yearly' ? '32px' : '4px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
          Annuel
          <span className="ml-1 text-green-600 font-semibold">-20%</span>
        </span>
      </div>

      {/* Résultats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Starter */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`relative p-6 rounded-2xl border-2 transition-all ${
            recommendedPlan === 'starter'
              ? 'border-blue-500 bg-white shadow-lg'
              : calculations.starter.final === null
              ? 'border-gray-200 bg-gray-50 opacity-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          {recommendedPlan === 'starter' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Recommandé
            </div>
          )}
          <h4 className="font-bold text-gray-900 mb-2">Starter</h4>
          <p className="text-xs text-gray-500 mb-4">Jusqu'à 5 utilisateurs</p>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPrice(calculations.starter.final)}
          </div>
          <p className="text-xs text-gray-500">
            {billingCycle === 'monthly' ? '/mois' : '/mois (facturé annuellement)'}
          </p>
          {calculations.starter.final !== null && (
            <button
              onClick={() => onSelectPlan?.('starter')}
              className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Choisir <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Pro */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`relative p-6 rounded-2xl border-2 transition-all ${
            recommendedPlan === 'pro'
              ? 'border-blue-500 bg-white shadow-lg'
              : calculations.pro.final === null
              ? 'border-gray-200 bg-gray-50 opacity-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          {recommendedPlan === 'pro' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Recommandé
            </div>
          )}
          <h4 className="font-bold text-gray-900 mb-2">Pro BTP + IA</h4>
          <p className="text-xs text-gray-500 mb-4">Jusqu'à 25 utilisateurs</p>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPrice(calculations.pro.final)}
          </div>
          <p className="text-xs text-gray-500">
            {billingCycle === 'monthly' ? '/mois' : '/mois (facturé annuellement)'}
          </p>
          {calculations.pro.final !== null && (
            <button
              onClick={() => onSelectPlan?.('pro')}
              className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Choisir <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Enterprise */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`relative p-6 rounded-2xl border-2 transition-all ${
            recommendedPlan === 'enterprise'
              ? 'border-blue-500 bg-white shadow-lg'
              : 'border-gray-200 bg-white'
          }`}
        >
          {recommendedPlan === 'enterprise' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Recommandé
            </div>
          )}
          <h4 className="font-bold text-gray-900 mb-2">Enterprise</h4>
          <p className="text-xs text-gray-500 mb-4">Utilisateurs illimités</p>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPrice(calculations.enterprise.final)}
          </div>
          <p className="text-xs text-gray-500">
            {billingCycle === 'monthly' ? '/mois' : '/mois (facturé annuellement)'}
          </p>
          <button
            onClick={() => onSelectPlan?.('enterprise')}
            className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Choisir <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Économies annuelles */}
      {billingCycle === 'yearly' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center"
        >
          <Check className="w-5 h-5 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 font-medium">
            Vous économisez{' '}
            <span className="font-bold">
              {formatPrice(
                (calculations[recommendedPlan].monthly || 0) * 12 * yearlyDiscount
              )}
            </span>{' '}
            par an avec la facturation annuelle !
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PricingCalculator;
