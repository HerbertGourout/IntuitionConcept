import React, { useState } from 'react';
import {
    Save,
    Download,
    Send,
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
    
    // États pour l'interface moderne
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showQuotesModal, setShowQuotesModal] = useState(false);
    const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
    const [showExportModal, setShowExportModal] = useState(false);
    
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



    const showToast = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        if (type === 'success') {
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 4000);
        } else {
            setShowErrorToast(true);
            setTimeout(() => setShowErrorToast(false), 4000);
        }
    };

    // Charger les devis sauvegardés depuis Firebase
    const loadSavedQuotes = async () => {
        try {
            setIsLoading(true);
            const quotes = await QuotesService.getAllQuotes();
            setSavedQuotes(quotes);
        } catch (error) {
            console.error('Erreur lors du chargement des devis:', error);
            showToast('❌ Erreur lors du chargement des devis', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Charger un devis pour édition
    const loadQuoteForEdit = (quoteToEdit: Quote) => {
        setQuote(quoteToEdit);
        setIsDirty(true);
        setShowQuotesModal(false);
        showToast(`📝 Devis "${quoteToEdit.title}" chargé pour édition`, 'success');
    };

    // Supprimer un devis
    const deleteQuote = async (quoteId: string, quoteTitle: string) => {
        if (!window.confirm(`⚠️ Êtes-vous sûr de vouloir supprimer le devis "${quoteTitle}" ?\n\nCette action est irréversible.`)) {
            return;
        }

        try {
            setIsLoading(true);
            await QuotesService.deleteQuote(quoteId);
            showToast(`✅ Devis "${quoteTitle}" supprimé avec succès`, 'success');
            // Recharger la liste
            await loadSavedQuotes();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            showToast('❌ Erreur lors de la suppression du devis', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Dupliquer un devis
    const duplicateQuote = (originalQuote: Quote) => {
        const duplicatedQuote: Quote = {
            ...originalQuote,
            id: `DEVIS-${Date.now()}`,
            title: `${originalQuote.title} (Copie)`,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setQuote(duplicatedQuote);
        setIsDirty(true);
        setShowQuotesModal(false);
        showToast(`📋 Devis dupliqué : "${duplicatedQuote.title}"`, 'success');
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
            setIsLoading(true);
            
            // Validation basique
            if (!quote.clientName.trim()) {
                showToast('⚠️ Veuillez saisir le nom du client', 'error');
                return;
            }
            
            if (quote.phases.length === 0) {
                showToast('⚠️ Veuillez ajouter au moins une phase au devis', 'error');
                return;
            }
            
            // Calculer les totaux avant sauvegarde
            const updatedQuote = calculateTotals({
                ...quote,
                updatedAt: new Date().toISOString()
            });
            
            // Sauvegarder dans Firebase
            const quoteId = await QuotesService.createQuote(updatedQuote);
            
            showToast(`✅ Devis "${updatedQuote.title}" sauvegardé avec succès !\n💰 Montant: ${formatCurrency(updatedQuote.totalAmount)}`, 'success');
            
            // Marquer comme sauvegardé (ne pas réinitialiser automatiquement)
            setIsDirty(false);
            
            console.log('Devis sauvegardé dans Firebase:', quoteId);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            showToast('❌ Erreur lors de la sauvegarde du devis dans Firebase', 'error');
        } finally {
            // Toujours arrêter le loading, même en cas d'erreur
            setIsLoading(false);
        }
    };
    


    const handleSend = async () => {
        try {
            setIsLoading(true);
            
            // Validation avant envoi
            if (!quote.clientName.trim()) {
                showToast('⚠️ Veuillez saisir le nom du client avant l\'envoi', 'error');
                return;
            }
            
            if (!quote.clientEmail.trim()) {
                showToast('⚠️ Veuillez saisir l\'email du client avant l\'envoi', 'error');
                return;
            }
            
            if (quote.phases.length === 0) {
                showToast('⚠️ Veuillez ajouter au moins une phase avant l\'envoi', 'error');
                return;
            }
            
            // Calculer les totaux pour l'envoi
            const sendQuote = calculateTotals(quote);
            
            // Générer le contenu email
            const emailSubject = `Devis ${sendQuote.id} - ${sendQuote.title}`;
            const emailBody = generateEmailBody(sendQuote);
            
            // Créer le lien mailto
            const mailtoLink = `mailto:${sendQuote.clientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            
            // Ouvrir le client email
            window.open(mailtoLink);
            
            showToast(`📧 Email préparé pour ${sendQuote.clientName}\nVérifiez votre client email`, 'success');
            
        } catch (error) {
            console.error('Erreur lors de l\'envoi:', error);
            showToast('❌ Erreur lors de la préparation de l\'email', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Fonction pour générer le HTML du devis
    const generateQuoteHTML = (exportQuote: Quote) => {
        return `
            <div class="header">
                <h1>DEVIS</h1>
                <h2>${exportQuote.title}</h2>
                <p><strong>N° ${exportQuote.id}</strong></p>
                <p>Date: ${new Date(exportQuote.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
            
            <div class="client-info">
                <h3>Informations Client</h3>
                <p><strong>Nom:</strong> ${exportQuote.clientName}</p>
                <p><strong>Email:</strong> ${exportQuote.clientEmail}</p>
                <p><strong>Téléphone:</strong> ${exportQuote.clientPhone || 'Non renseigné'}</p>
                <p><strong>Type de projet:</strong> ${exportQuote.projectType}</p>
            </div>
            
            <div class="phases">
                <h3>Détail des Prestations</h3>
                ${exportQuote.phases.map(phase => `
                    <div class="phase">
                        <h4>${phase.name}</h4>
                        <p>${phase.description}</p>
                        ${phase.tasks.map(task => `
                            <div class="task">
                                <h5>${task.name}</h5>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Quantité</th>
                                            <th>Unité</th>
                                            <th>Prix unitaire</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${task.articles.map(article => `
                                            <tr>
                                                <td>${article.description}</td>
                                                <td>${article.quantity}</td>
                                                <td>${article.unit}</td>
                                                <td>${formatCurrency(article.unitPrice)}</td>
                                                <td>${formatCurrency(article.totalPrice)}</td>
                                            </tr>
                                        `).join('')}
                                        <tr class="total">
                                            <td colspan="4"><strong>Total ${task.name}</strong></td>
                                            <td><strong>${formatCurrency(task.totalPrice)}</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        `).join('')}
                        <p><strong>Total ${phase.name}: ${formatCurrency(phase.totalPrice)}</strong></p>
                    </div>
                `).join('')}
            </div>
            
            <div class="totals">
                <table>
                    <tr>
                        <td><strong>Sous-total HT:</strong></td>
                        <td><strong>${formatCurrency(exportQuote.subtotal)}</strong></td>
                    </tr>
                    <tr>
                        <td><strong>TVA (${exportQuote.taxRate}%):</strong></td>
                        <td><strong>${formatCurrency(exportQuote.taxAmount)}</strong></td>
                    </tr>
                    <tr class="total">
                        <td><strong>TOTAL TTC:</strong></td>
                        <td><strong>${formatCurrency(exportQuote.totalAmount)}</strong></td>
                    </tr>
                </table>
            </div>
            
            ${exportQuote.notes ? `
                <div class="notes">
                    <h3>Notes</h3>
                    <p>${exportQuote.notes}</p>
                </div>
            ` : ''}
            
            ${exportQuote.paymentTerms ? `
                <div class="payment-terms">
                    <h3>Conditions de paiement</h3>
                    <p>${exportQuote.paymentTerms}</p>
                </div>
            ` : ''}
            
            <div class="validity">
                <p><em>Devis valable ${exportQuote.validityDays} jours à compter de la date d'émission.</em></p>
            </div>
        `;
    };
    
    // Fonction pour générer le corps de l'email
    const generateEmailBody = (sendQuote: Quote) => {
        return `Bonjour ${sendQuote.clientName},\n\nVeuillez trouver ci-joint votre devis:\n\n` +
               `Devis N° ${sendQuote.id}\n` +
               `Titre: ${sendQuote.title}\n` +
               `Montant total: ${formatCurrency(sendQuote.totalAmount)}\n\n` +
               `Détail des prestations:\n` +
               sendQuote.phases.map(phase => 
                   `- ${phase.name}: ${formatCurrency(phase.totalPrice)}`
               ).join('\n') +
               `\n\nCe devis est valable ${sendQuote.validityDays} jours.\n\n` +
               `Cordialement,\n[Votre nom]`;
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
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={article.quantity || ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            // Permettre les nombres décimaux et vides
                                                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                                const updatedPhases = [...quote.phases];
                                                                updatedPhases[phaseIndex].tasks[taskIndex].articles[articleIndex].quantity = value === '' ? 0 : Number(value);
                                                                updateQuote({ phases: updatedPhases });
                                                            }
                                                        }}
                                                        onFocus={(e) => {
                                                            // Sélectionner tout le texte au focus pour faciliter la saisie
                                                            e.target.select();
                                                        }}
                                                        className={`p-1 rounded border text-center ${
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
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={article.unitPrice || ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            // Permettre les nombres décimaux et vides
                                                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                                const updatedPhases = [...quote.phases];
                                                                updatedPhases[phaseIndex].tasks[taskIndex].articles[articleIndex].unitPrice = value === '' ? 0 : Number(value);
                                                                updateQuote({ phases: updatedPhases });
                                                            }
                                                        }}
                                                        onFocus={(e) => {
                                                            // Sélectionner tout le texte au focus pour faciliter la saisie
                                                            e.target.select();
                                                        }}
                                                        className={`p-1 rounded border text-right ${
                                                            resolvedTheme === 'dark'
                                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                                : 'bg-white border-gray-300 text-gray-900'
                                                        }`}
                                                        placeholder="0.00"
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

                    <div className="mt-6 flex gap-4 flex-wrap">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all transform hover:scale-105 ${
                                isLoading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg'
                            } text-white font-semibold`}
                        >
                            <Save className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                        <button
                            onClick={() => {
                                setShowQuotesModal(true);
                                loadSavedQuotes();
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg font-semibold"
                        >
                            <Download className="w-4 h-4" />
                            Mes devis ({savedQuotes.length})
                        </button>
                        <button 
                            onClick={() => setShowExportModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg font-semibold"
                        >
                            <Send className="w-4 h-4" />
                            Export & Envoi
                        </button>
                    </div>
                </div>
            </div>

            {/* Toast de succès */}
            {showSuccessToast && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm whitespace-pre-line">{toastMessage}</p>
                            </div>
                            <button 
                                onClick={() => setShowSuccessToast(false)}
                                className="flex-shrink-0 text-green-200 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast d'erreur */}
            {showErrorToast && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
                    <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-red-200" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm whitespace-pre-line">{toastMessage}</p>
                            </div>
                            <button 
                                onClick={() => setShowErrorToast(false)}
                                className="flex-shrink-0 text-red-200 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal des devis sauvegardés */}
            {showQuotesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className={`w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${
                        resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className="flex flex-col h-full">
                            {/* En-tête */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div>
                                    <h2 className={`text-2xl font-bold ${
                                        resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        📋 Mes Devis Sauvegardés
                                    </h2>
                                    <p className={`text-sm mt-1 ${
                                        resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                        {savedQuotes.length} devis trouvé{savedQuotes.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowQuotesModal(false)}
                                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>

                            {/* Contenu */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des devis...</span>
                                    </div>
                                ) : savedQuotes.length === 0 ? (
                                    <div className={`text-center py-12 ${
                                        resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                                        </svg>
                                        <h3 className="text-lg font-medium mb-2">Aucun devis sauvegardé</h3>
                                        <p className="text-sm">Créez votre premier devis pour le voir apparaître ici</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {savedQuotes.map((savedQuote) => (
                                            <div key={savedQuote.id} className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                                                resolvedTheme === 'dark' 
                                                    ? 'border-gray-600 bg-gray-700 hover:bg-gray-650' 
                                                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                            }`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className={`font-semibold text-lg ${
                                                                resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                                                            }`}>
                                                                {savedQuote.title}
                                                            </h3>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                savedQuote.status === 'draft' 
                                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                    : savedQuote.status === 'sent'
                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            }`}>
                                                                {savedQuote.status === 'draft' ? 'Brouillon' : 
                                                                 savedQuote.status === 'sent' ? 'Envoyé' : 'Accepté'}
                                                            </span>
                                                        </div>
                                                        <div className={`text-sm space-y-1 ${
                                                            resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                                        }`}>
                                                            <p><strong>Client :</strong> {savedQuote.clientName || 'Non spécifié'}</p>
                                                            <p><strong>Montant :</strong> {formatCurrency(savedQuote.totalAmount)}</p>
                                                            <p><strong>Phases :</strong> {savedQuote.phases.length}</p>
                                                            <p><strong>Créé le :</strong> {new Date(savedQuote.createdAt).toLocaleDateString('fr-FR')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 ml-4">
                                                        <button
                                                            onClick={() => loadQuoteForEdit(savedQuote)}
                                                            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                                        >
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                            </svg>
                                                            Éditer
                                                        </button>
                                                        <button
                                                            onClick={() => duplicateQuote(savedQuote)}
                                                            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                                                        >
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                                                                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L14.586 13H19v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586V9a1 1 0 00-1-1H9.414l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 10H14a1 1 0 001 1v.586z" />
                                                            </svg>
                                                            Dupliquer
                                                        </button>
                                                        <button
                                                            onClick={() => deleteQuote(savedQuote.id, savedQuote.title)}
                                                            className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                                        >
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 112 0v4a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v4a1 1 0 11-2 0V9z" clipRule="evenodd" />
                                                            </svg>
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pied de page */}
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={loadSavedQuotes}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                                    >
                                        <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                        </svg>
                                        Actualiser
                                    </button>
                                    <button
                                        onClick={() => setShowQuotesModal(false)}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'export et envoi */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className={`w-full max-w-md rounded-xl shadow-2xl ${
                        resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-xl font-bold ${
                                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    📤 Export & Envoi
                                </h2>
                                <button 
                                    onClick={() => setShowExportModal(false)}
                                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => {
                                        handleExport();
                                        setShowExportModal(false);
                                    }}
                                    disabled={isLoading}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                        isLoading 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-red-500 text-white hover:bg-red-600'
                                    }`}
                                >
                                    <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                    </svg>
                                    <span>{isLoading ? 'Génération...' : 'Télécharger PDF'}</span>
                                </button>
                                <button 
                                    onClick={() => {
                                        handleSend();
                                        setShowExportModal(false);
                                    }}
                                    disabled={isLoading}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                        isLoading 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                    }`}
                                >
                                    <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    <span>{isLoading ? 'Préparation...' : 'Envoyer par email'}</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                    </svg>
                                    <span>Partager le lien</span>
                                </button>
                            </div>
                            <p className={`mt-4 text-sm text-center ${
                                resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                                Export PDF et envoi par email maintenant fonctionnels !
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuoteCreatorSimple;
