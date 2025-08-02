import React, { useState } from 'react';
import {
    Save,
    Download,
    Send,
    Plus,
    AlertTriangle,
    FileText
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useOfflineReports } from '../../hooks/useOfflineData';

// Types pour le module de devis structuré
interface Article {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
}

interface Task {
    id: string;
    name: string;
    description: string;
    articles: Article[];
    totalPrice: number;
    expanded: boolean;
}

interface Phase {
    id: string;
    name: string;
    description: string;
    tasks: Task[];
    totalPrice: number;
    expanded: boolean;
}

interface Quote {
    id: string;
    title: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    projectType: string;
    phases: Phase[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    validityDays: number;
    notes: string;
    paymentTerms: string;
    createdAt: string;
    updatedAt: string;
}

const QuoteCreatorSimple: React.FC = () => {
    const { resolvedTheme } = useTheme();
    const { isOnline } = useOfflineReports();
    
    const [quote, setQuote] = useState<Quote>({
        id: `DEVIS-${Date.now()}`,
        title: 'Nouveau Devis',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        projectType: 'construction',
        phases: [],
        subtotal: 0,
        taxRate: 18,
        taxAmount: 0,
        totalAmount: 0,
        status: 'draft',
        validityDays: 30,
        notes: '',
        paymentTerms: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    const [isDirty, setIsDirty] = useState(false);
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount).replace('XOF', 'FCFA');
    };

    const calculateTotals = (updatedQuote: Quote) => {
        // Calculer totaux des articles pour chaque tâche
        const phasesWithTaskTotals = updatedQuote.phases.map(phase => ({
            ...phase,
            tasks: phase.tasks.map(task => ({
                ...task,
                totalPrice: task.articles.reduce((sum, article) => {
                    article.totalPrice = article.quantity * article.unitPrice;
                    return sum + article.totalPrice;
                }, 0)
            }))
        }));

        // Calculer totaux des tâches pour chaque phase
        const phasesWithTotals = phasesWithTaskTotals.map(phase => ({
            ...phase,
            totalPrice: phase.tasks.reduce((sum, task) => sum + task.totalPrice, 0)
        }));

        // Calculer sous-total global
        const subtotal = phasesWithTotals.reduce((sum, phase) => sum + phase.totalPrice, 0);
        const taxAmount = (subtotal * updatedQuote.taxRate) / 100;
        const totalAmount = subtotal + taxAmount;

        return {
            ...updatedQuote,
            phases: phasesWithTotals,
            subtotal,
            taxAmount,
            totalAmount,
            updatedAt: new Date().toISOString()
        };
    };

    const updateQuote = (updates: Partial<Quote>) => {
        const updatedQuote = { ...quote, ...updates };
        const recalculatedQuote = calculateTotals(updatedQuote);
        setQuote(recalculatedQuote);
        setIsDirty(true);
    };

    const addPhase = () => {
        const newPhase: Phase = {
            id: `phase-${Date.now()}`,
            name: `Phase ${quote.phases.length + 1}`,
            description: '',
            tasks: [],
            totalPrice: 0,
            expanded: true
        };
        updateQuote({ phases: [...quote.phases, newPhase] });
    };

    const handleSave = () => {
        console.log('Sauvegarde du devis:', quote);
                setIsDirty(false);
    };

    const handleExport = () => {
        alert('🚀 Export PDF - Fonctionnalité à venir !');
    };

    const handleSend = () => {
        alert('📧 Envoi par email - Fonctionnalité à venir !');
    };

    const getStats = () => {
        const totalPhases = quote.phases.length;
        const totalTasks = quote.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
        const totalArticles = quote.phases.reduce((sum, phase) => 
            sum + phase.tasks.reduce((taskSum, task) => taskSum + task.articles.length, 0), 0
        );
        const completionRate = totalArticles > 0 ? 
            Math.round((quote.phases.filter(p => p.tasks.some(t => t.articles.length > 0)).length / Math.max(totalPhases, 1)) * 100) : 0;
        
        return { totalPhases, totalTasks, totalArticles, completionRate };
    };

    const stats = getStats();

    return (
        <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* En-tête du devis */}
            <div className={`border-b ${
                resolvedTheme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
            }`}>
                <div className="max-w-7xl mx-auto p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold">Créateur de Devis Structuré</h1>
                                    {isDirty && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                                            <AlertTriangle className="w-3 h-3 text-orange-600" />
                                            <span className="text-xs text-orange-600 font-medium">Non sauvegardé</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm opacity-70">
                                    Phases → Tâches → Articles • ID: {quote.id}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {!isOnline && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                                    <span className="text-sm text-orange-600 font-medium">Hors ligne</span>
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-sm opacity-70">
                                <div className="text-center">
                                    <div className="font-bold text-lg text-blue-600">{stats.totalPhases}</div>
                                    <div>Phases</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-lg text-purple-600">{stats.totalTasks}</div>
                                    <div>Tâches</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-lg text-green-600">{stats.totalArticles}</div>
                                    <div>Articles</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informations client */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            value={quote.clientName}
                            onChange={(e) => updateQuote({ clientName: e.target.value })}
                            className={`w-full p-3 rounded-lg border transition-colors ${
                                resolvedTheme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            placeholder="Nom du client"
                        />
                        <input
                            type="email"
                            value={quote.clientEmail}
                            onChange={(e) => updateQuote({ clientEmail: e.target.value })}
                            className={`w-full p-3 rounded-lg border transition-colors ${
                                resolvedTheme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            placeholder="Email du client"
                        />
                        <input
                            type="text"
                            value={quote.title}
                            onChange={(e) => updateQuote({ title: e.target.value })}
                            className={`w-full p-3 rounded-lg border transition-colors ${
                                resolvedTheme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            placeholder="Titre du devis"
                        />
                    </div>
                </div>
            </div>

            {/* Message de démonstration */}
            <div className="max-w-7xl mx-auto p-6">
                <div className={`p-6 rounded-xl shadow-sm border mb-6 ${
                    resolvedTheme === 'dark'
                        ? 'bg-blue-900/20 border-blue-700'
                        : 'bg-blue-50 border-blue-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <div>
                            <h2 className="text-lg font-bold text-blue-600">Module de Devis Structuré</h2>
                            <p className="text-sm text-blue-600/80">
                                Structure hiérarchique : Phases → Tâches → Articles avec calculs automatiques
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="font-bold text-2xl text-blue-600">{stats.totalPhases}</div>
                            <div className="text-sm text-blue-600/80">Phases créées</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-2xl text-purple-600">{stats.totalTasks}</div>
                            <div className="text-sm text-purple-600/80">Tâches ajoutées</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-2xl text-green-600">{stats.totalArticles}</div>
                            <div className="text-sm text-green-600/80">Articles détaillés</div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-center">
                        <button
                            onClick={addPhase}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Commencer un nouveau devis
                        </button>
                    </div>
                </div>

                {/* Résumé financier */}
                <div className={`p-6 rounded-xl shadow-sm border ${
                    resolvedTheme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                }`}>
                    <h3 className="text-lg font-bold mb-4">💰 Résumé Financier</h3>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span>Sous-total HT:</span>
                            <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>TVA ({quote.taxRate}%):</span>
                            <span className="font-medium">{formatCurrency(quote.taxAmount)}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between text-lg font-bold">
                            <span>TOTAL TTC:</span>
                            <span className="text-green-600">{formatCurrency(quote.totalAmount)}</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                        <h4 className="font-medium mb-2">Informations</h4>
                        <div className="text-sm space-y-1 opacity-70">
                            <p>• Phases: {quote.phases.length}</p>
                            <p>• Statut: {quote.status}</p>
                            <p>• Créé: {new Date(quote.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Sauvegarder
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                        <button
                            onClick={handleSend}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                            Envoyer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteCreatorSimple;
