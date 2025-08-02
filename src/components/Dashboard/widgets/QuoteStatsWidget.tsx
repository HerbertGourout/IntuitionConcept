import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    TrendingUp,
    Euro,
    Clock,
    CheckCircle,
    Send,
    BarChart3,
    PieChart
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface QuoteStats {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
    totalValue: number;
    acceptedValue: number;
    conversionRate: number;
}

const QuoteStatsWidget: React.FC = () => {
    const { resolvedTheme } = useTheme();
    const [stats, setStats] = useState<QuoteStats>({
        total: 0,
        draft: 0,
        sent: 0,
        accepted: 0,
        rejected: 0,
        totalValue: 0,
        acceptedValue: 0,
        conversionRate: 0
    });

    useEffect(() => {
        calculateStats();
    }, []);

    const calculateStats = () => {
        const quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
        
        const stats: QuoteStats = {
            total: quotes.length,
            draft: quotes.filter((q: any) => q.status === 'draft').length,
            sent: quotes.filter((q: any) => q.status === 'sent').length,
            accepted: quotes.filter((q: any) => q.status === 'accepted').length,
            rejected: quotes.filter((q: any) => q.status === 'rejected').length,
            totalValue: quotes.reduce((sum: number, q: any) => sum + (q.totalAmount || 0), 0),
            acceptedValue: quotes
                .filter((q: any) => q.status === 'accepted')
                .reduce((sum: number, q: any) => sum + (q.totalAmount || 0), 0),
            conversionRate: 0
        };

        if (stats.sent > 0) {
            stats.conversionRate = (stats.accepted / stats.sent) * 100;
        }

        setStats(stats);
    };

    const statCards = [
        {
            title: 'Total Devis',
            value: stats.total,
            icon: FileText,
            color: 'blue',
            suffix: ''
        },
        {
            title: 'En Attente',
            value: stats.sent,
            icon: Clock,
            color: 'yellow',
            suffix: ''
        },
        {
            title: 'Acceptés',
            value: stats.accepted,
            icon: CheckCircle,
            color: 'green',
            suffix: ''
        },
        {
            title: 'Taux Conversion',
            value: stats.conversionRate,
            icon: TrendingUp,
            color: 'purple',
            suffix: '%'
        }
    ];

    return (
        <motion.div
            className={`p-6 rounded-xl shadow-lg ${
                resolvedTheme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Statistiques Devis</h3>
                        <p className="text-sm opacity-70">Vue d'ensemble</p>
                    </div>
                </div>
            </div>

            {/* Cartes de statistiques */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        className={`p-4 rounded-lg ${
                            resolvedTheme === 'dark'
                                ? 'bg-gray-700 border border-gray-600'
                                : 'bg-gray-50 border border-gray-200'
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                                card.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                                card.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                card.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                                'bg-purple-100 dark:bg-purple-900/20'
                            }`}>
                                <card.icon className={`w-4 h-4 ${
                                    card.color === 'blue' ? 'text-blue-600' :
                                    card.color === 'yellow' ? 'text-yellow-600' :
                                    card.color === 'green' ? 'text-green-600' :
                                    'text-purple-600'
                                }`} />
                            </div>
                            <div>
                                <p className="text-xs opacity-70">{card.title}</p>
                                <p className="font-bold text-lg">
                                    {card.suffix === '%' ? card.value.toFixed(1) : card.value}{card.suffix}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Valeurs financières */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm opacity-70">Valeur totale:</span>
                    <span className="font-bold text-blue-600">
                        {stats.totalValue.toLocaleString()} FCFA
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm opacity-70">Valeur acceptée:</span>
                    <span className="font-bold text-green-600">
                        {stats.acceptedValue.toLocaleString()} FCFA
                    </span>
                </div>
                {stats.totalValue > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm opacity-70">Taux de réussite:</span>
                        <span className="font-bold text-purple-600">
                            {((stats.acceptedValue / stats.totalValue) * 100).toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Barre de progression */}
            {stats.total > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs opacity-70">Répartition des statuts</span>
                    </div>
                    <div className="flex rounded-full overflow-hidden h-2 bg-gray-200 dark:bg-gray-700">
                        {stats.draft > 0 && (
                            <div 
                                className="bg-gray-400"
                                style={{ width: `${(stats.draft / stats.total) * 100}%` }}
                            />
                        )}
                        {stats.sent > 0 && (
                            <div 
                                className="bg-yellow-400"
                                style={{ width: `${(stats.sent / stats.total) * 100}%` }}
                            />
                        )}
                        {stats.accepted > 0 && (
                            <div 
                                className="bg-green-400"
                                style={{ width: `${(stats.accepted / stats.total) * 100}%` }}
                            />
                        )}
                        {stats.rejected > 0 && (
                            <div 
                                className="bg-red-400"
                                style={{ width: `${(stats.rejected / stats.total) * 100}%` }}
                            />
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default QuoteStatsWidget;
