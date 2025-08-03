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
import { QuotesService } from '../../services/quotesService';

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
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
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



    const startNewQuote = () => {
        // Créer une première phase par défaut pour structurer le devis
        const firstPhase: Phase = {
            id: `phase-${Date.now()}`,
            name: 'Phase 1 - Préparation',
            description: 'Première phase du projet',
            tasks: [],
            totalPrice: 0,
            expanded: true
        };

        const newQuote: Quote = {
            id: `DEVIS-${Date.now()}`,
            title: 'Nouveau Devis',
            clientName: '',
            clientEmail: '',
            clientPhone: '',
            projectType: 'construction',
            phases: [firstPhase], // Devis structuré avec une phase par défaut
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
        };
        setQuote(newQuote);
        setIsDirty(true); // Marquer comme modifié car on a créé une structure
    };

    const handleSave = async () => {
        try {
            // Validation basique
            if (!quote.clientName.trim()) {
                alert('⚠️ Veuillez saisir le nom du client');
                return;
            }
            
            if (quote.phases.length === 0) {
                alert('⚠️ Veuillez ajouter au moins une phase au devis');
                return;
            }
            
            // Sauvegarder dans Firebase
            const quoteData = {
                title: quote.title,
                clientName: quote.clientName,
                clientEmail: quote.clientEmail,
                clientPhone: quote.clientPhone,
                projectType: quote.projectType,
                phases: quote.phases,
                subtotal: quote.subtotal,
                taxRate: quote.taxRate,
                taxAmount: quote.taxAmount,
                totalAmount: quote.totalAmount,
                status: quote.status,
                validityDays: quote.validityDays,
                notes: quote.notes,
                paymentTerms: quote.paymentTerms,
                createdAt: quote.createdAt,
                updatedAt: new Date().toISOString()
            };
            
            const quoteId = await QuotesService.createQuote(quoteData);
            
            // Confirmation
            alert(`✅ Devis "${quote.title}" sauvegardé avec succès dans Firebase !\n🆔 ID: ${quoteId}\n💰 Montant total: ${formatCurrency(quote.totalAmount)}`);
            
            // Réinitialiser le formulaire pour un nouveau devis
            startNewQuote();
            
            console.log('Devis sauvegardé dans Firebase:', quoteId);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            alert('❌ Erreur lors de la sauvegarde du devis dans Firebase');
        }
    };
    
    const viewSavedQuotes = async () => {
        try {
            const savedQuotes = await QuotesService.getAllQuotes();
            if (savedQuotes.length === 0) {
                alert('📝 Aucun devis sauvegardé pour le moment dans Firebase');
            } else {
                const quotesInfo = savedQuotes.map((q: Quote, index: number) => 
                    `${index + 1}. ${q.title} - ${q.clientName} (${formatCurrency(q.totalAmount)}) - ${q.status}`
                ).join('\n');
                alert(`📋 Devis sauvegardés dans Firebase (${savedQuotes.length}):\n\n${quotesInfo}`);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des devis:', error);
            alert('❌ Erreur lors de la récupération des devis depuis Firebase');
        }
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
                            onClick={startNewQuote}
                            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
                        >
                            <FileText className="w-6 h-6" />
                            <span className="font-semibold">Commencer un nouveau devis structuré</span>
                        </button>
                    </div>
                    <div className="mt-3 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            📋 Un devis structuré avec une première phase sera créé automatiquement
                        </p>
                    </div>
                </div>

                {/* Affichage et édition des phases */}
                {quote.phases.length > 0 && (
                    <div className="space-y-4 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Phases du devis</h3>
                        {quote.phases.map((phase, phaseIndex) => (
                            <div key={phase.id} className={`p-4 rounded-xl border ${
                                resolvedTheme === 'dark'
                                    ? 'bg-gray-800 border-gray-700'
                                    : 'bg-white border-gray-200'
                            }`}>
                                <div className="flex items-center justify-between mb-3">
                                    <input
                                        type="text"
                                        value={phase.name}
                                        onChange={(e) => {
                                            const updatedPhases = [...quote.phases];
                                            updatedPhases[phaseIndex].name = e.target.value;
                                            updateQuote({ phases: updatedPhases });
                                        }}
                                        className={`text-lg font-bold bg-transparent border-none outline-none ${
                                            resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}
                                        placeholder="Nom de la phase"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                const newTask = {
                                                    id: `task-${Date.now()}`,
                                                    name: `Tâche ${phase.tasks.length + 1}`,
                                                    description: '',
                                                    articles: [],
                                                    totalPrice: 0,
                                                    expanded: true
                                                };
                                                const updatedPhases = [...quote.phases];
                                                updatedPhases[phaseIndex].tasks.push(newTask);
                                                updateQuote({ phases: updatedPhases });
                                            }}
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                        >
                                            + Tâche
                                        </button>
                                        <button
                                            onClick={() => {
                                                const updatedPhases = quote.phases.filter((_, i) => i !== phaseIndex);
                                                updateQuote({ phases: updatedPhases });
                                            }}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                                
                                <textarea
                                    value={phase.description}
                                    onChange={(e) => {
                                        const updatedPhases = [...quote.phases];
                                        updatedPhases[phaseIndex].description = e.target.value;
                                        updateQuote({ phases: updatedPhases });
                                    }}
                                    className={`w-full p-2 rounded border mb-3 ${
                                        resolvedTheme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-gray-50 border-gray-300 text-gray-900'
                                    }`}
                                    placeholder="Description de la phase"
                                    rows={2}
                                />

                                {/* Tâches de la phase */}
                                {phase.tasks.map((task, taskIndex) => (
                                    <div key={task.id} className={`ml-4 p-3 rounded-lg border mb-2 ${
                                        resolvedTheme === 'dark'
                                            ? 'bg-gray-700 border-gray-600'
                                            : 'bg-gray-50 border-gray-300'
                                    }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <input
                                                type="text"
                                                value={task.name}
                                                onChange={(e) => {
                                                    const updatedPhases = [...quote.phases];
                                                    updatedPhases[phaseIndex].tasks[taskIndex].name = e.target.value;
                                                    updateQuote({ phases: updatedPhases });
                                                }}
                                                className={`font-medium bg-transparent border-none outline-none ${
                                                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                                                }`}
                                                placeholder="Nom de la tâche"
                                            />
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        const newArticle = {
                                                            id: `article-${Date.now()}`,
                                                            description: 'Nouvel article',
                                                            quantity: 1,
                                                            unit: 'unité',
                                                            unitPrice: 0,
                                                            totalPrice: 0
                                                        };
                                                        const updatedPhases = [...quote.phases];
                                                        updatedPhases[phaseIndex].tasks[taskIndex].articles.push(newArticle);
                                                        updateQuote({ phases: updatedPhases });
                                                    }}
                                                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                                                >
                                                    + Article
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const updatedPhases = [...quote.phases];
                                                        updatedPhases[phaseIndex].tasks = updatedPhases[phaseIndex].tasks.filter((_, i) => i !== taskIndex);
                                                        updateQuote({ phases: updatedPhases });
                                                    }}
                                                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Articles de la tâche */}
                                        {task.articles.map((article, articleIndex) => (
                                            <div key={article.id} className={`ml-4 p-2 rounded border mb-1 ${
                                                resolvedTheme === 'dark'
                                                    ? 'bg-gray-600 border-gray-500'
                                                    : 'bg-white border-gray-200'
                                            }`}>
                                                <div className="grid grid-cols-5 gap-2 text-sm">
                                                    <input
                                                        type="text"
                                                        value={article.description}
                                                        onChange={(e) => {
                                                            const updatedPhases = [...quote.phases];
                                                            updatedPhases[phaseIndex].tasks[taskIndex].articles[articleIndex].description = e.target.value;
                                                            updateQuote({ phases: updatedPhases });
                                                        }}
                                                        className={`p-1 rounded border ${
                                                            resolvedTheme === 'dark'
                                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                                : 'bg-white border-gray-300 text-gray-900'
                                                        }`}
                                                        placeholder="Description"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={article.quantity}
                                                        onChange={(e) => {
                                                            const updatedPhases = [...quote.phases];
                                                            updatedPhases[phaseIndex].tasks[taskIndex].articles[articleIndex].quantity = Number(e.target.value);
                                                            updateQuote({ phases: updatedPhases });
                                                        }}
                                                        className={`p-1 rounded border ${
                                                            resolvedTheme === 'dark'
                                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                                : 'bg-white border-gray-300 text-gray-900'
                                                        }`}
                                                        placeholder="Qté"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={article.unit}
                                                        onChange={(e) => {
                                                            const updatedPhases = [...quote.phases];
                                                            updatedPhases[phaseIndex].tasks[taskIndex].articles[articleIndex].unit = e.target.value;
                                                            updateQuote({ phases: updatedPhases });
                                                        }}
                                                        className={`p-1 rounded border ${
                                                            resolvedTheme === 'dark'
                                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                                : 'bg-white border-gray-300 text-gray-900'
                                                        }`}
                                                        placeholder="Unité"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={article.unitPrice}
                                                        onChange={(e) => {
                                                            const updatedPhases = [...quote.phases];
                                                            updatedPhases[phaseIndex].tasks[taskIndex].articles[articleIndex].unitPrice = Number(e.target.value);
                                                            updateQuote({ phases: updatedPhases });
                                                        }}
                                                        className={`p-1 rounded border ${
                                                            resolvedTheme === 'dark'
                                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                                : 'bg-white border-gray-300 text-gray-900'
                                                        }`}
                                                        placeholder="Prix unitaire"
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <span className={`font-medium ${
                                                            resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                                                        }`}>
                                                            {formatCurrency(article.quantity * article.unitPrice)}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                const updatedPhases = [...quote.phases];
                                                                updatedPhases[phaseIndex].tasks[taskIndex].articles = 
                                                                    updatedPhases[phaseIndex].tasks[taskIndex].articles.filter((_, i) => i !== articleIndex);
                                                                updateQuote({ phases: updatedPhases });
                                                            }}
                                                            className="text-red-500 hover:text-red-700 text-xs"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {task.articles.length === 0 && (
                                            <div className="ml-4 text-sm text-gray-500 italic">
                                                Aucun article. Cliquez sur "+ Article" pour en ajouter.
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                {phase.tasks.length === 0 && (
                                    <div className="ml-4 text-sm text-gray-500 italic">
                                        Aucune tâche. Cliquez sur "+ Tâche" pour en ajouter.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Message si aucune phase */}
                {quote.phases.length === 0 && (
                    <div className={`p-8 rounded-xl border-2 border-dashed mb-6 text-center ${
                        resolvedTheme === 'dark'
                            ? 'border-gray-600 bg-gray-800/50'
                            : 'border-gray-300 bg-gray-50'
                    }`}>
                        <FileText className={`w-16 h-16 mx-auto mb-4 ${
                            resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                        }`} />
                        <h3 className={`text-xl font-bold mb-3 ${
                            resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                            Prêt à créer votre devis structuré ?
                        </h3>
                        <div className={`text-sm space-y-2 mb-6 ${
                            resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                            <p>📋 <strong>Étape 1</strong> : Cliquez sur "Commencer un nouveau devis structuré"</p>
                            <p>🏗️ <strong>Étape 2</strong> : Une première phase sera créée automatiquement</p>
                            <p>✅ <strong>Étape 3</strong> : Ajoutez des tâches et articles à vos phases</p>
                            <p>💾 <strong>Étape 4</strong> : Sauvegardez votre devis dans Firebase</p>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                            resolvedTheme === 'dark' 
                                ? 'bg-blue-900/30 text-blue-300 border border-blue-700'
                                : 'bg-blue-50 text-blue-600 border border-blue-200'
                        }`}>
                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-medium">Structure : Devis → Phases → Tâches → Articles</span>
                        </div>
                    </div>
                )}

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

                    <div className="mt-6 flex flex-wrap gap-2">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Sauvegarder
                        </button>
                        <button
                            onClick={viewSavedQuotes}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                            Voir mes devis
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
