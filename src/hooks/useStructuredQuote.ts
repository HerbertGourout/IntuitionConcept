import { useState, useEffect, useCallback } from 'react';
import { StructuredQuote, Phase, Task, Article, QuoteTemplate } from '../types/StructuredQuote';
import { useGeolocation } from '../contexts/GeolocationContext';
import { useOfflineReports } from './useOfflineData';
import { QuotesService, Quote as FirebaseQuote } from '../services/quotesService';

export const useStructuredQuote = (initialQuote?: Partial<StructuredQuote>) => {
    const { currentLocation } = useGeolocation();
    const { createReport } = useOfflineReports();

    const [quote, setQuote] = useState<StructuredQuote>({
        id: `DEVIS-${Date.now()}`,
        reference: undefined,
        title: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        projectType: 'construction',
        phases: [],
        subtotal: 0,
        taxRate: 18,
        taxAmount: 0,
        discountRate: 0,
        discountAmount: 0,
        totalAmount: 0,
        validityDays: 30,
        paymentTerms: '50% à la commande, 50% à la livraison',
        notes: '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        location: currentLocation ? {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            address: currentLocation.address
        } : undefined,
        ...initialQuote
    });

    const [isCalculating, setIsCalculating] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Calcul automatique des totaux
    const calculateTotals = useCallback(() => {
        setIsCalculating(true);
        
        // Calculer les totaux des articles pour chaque tâche
        const updatedPhases = quote.phases.map(phase => ({
            ...phase,
            tasks: phase.tasks.map(task => ({
                ...task,
                totalPrice: task.articles.reduce((sum, article) => sum + article.totalPrice, 0)
            }))
        }));

        // Calculer les totaux des tâches pour chaque phase
        const phasesWithTotals = updatedPhases.map(phase => ({
            ...phase,
            totalPrice: phase.tasks.reduce((sum, task) => sum + task.totalPrice, 0)
        }));

        // Calculer le sous-total global
        const subtotal = phasesWithTotals.reduce((sum, phase) => sum + phase.totalPrice, 0);
        const discountAmount = (subtotal * quote.discountRate) / 100;
        const discountedSubtotal = subtotal - discountAmount;
        const taxAmount = (discountedSubtotal * quote.taxRate) / 100;
        const totalAmount = discountedSubtotal + taxAmount;

        setQuote(prev => ({
            ...prev,
            phases: phasesWithTotals,
            subtotal,
            discountAmount,
            taxAmount,
            totalAmount,
            updatedAt: new Date().toISOString()
        }));

        setIsCalculating(false);
        setIsDirty(true);
    }, [quote.phases, quote.taxRate, quote.discountRate]);

    // Recalculer automatiquement quand les données changent
    useEffect(() => {
        calculateTotals();
    }, [quote.phases, quote.taxRate, quote.discountRate, calculateTotals]);

    // Gestion des phases
    const addPhase = useCallback((template?: Partial<Phase>) => {
        const newPhase: Phase = {
            id: `phase-${Date.now()}`,
            name: template?.name || '',
            description: template?.description || '',
            tasks: template?.tasks || [],
            totalPrice: 0,
            expanded: true
        };

        setQuote(prev => ({
            ...prev,
            phases: [...prev.phases, newPhase],
            updatedAt: new Date().toISOString()
        }));
        setIsDirty(true);
    }, []);

    const updatePhase = useCallback((phaseId: string, updates: Partial<Phase>) => {
        setQuote(prev => ({
            ...prev,
            phases: prev.phases.map(phase =>
                phase.id === phaseId ? { ...phase, ...updates } : phase
            ),
            updatedAt: new Date().toISOString()
        }));
        setIsDirty(true);
    }, []);

    const removePhase = useCallback((phaseId: string) => {
        setQuote(prev => ({
            ...prev,
            phases: prev.phases.filter(phase => phase.id !== phaseId),
            updatedAt: new Date().toISOString()
        }));
        setIsDirty(true);
    }, []);

    const duplicatePhase = useCallback((phaseId: string) => {
        const phaseToClone = quote.phases.find(p => p.id === phaseId);
        if (phaseToClone) {
            const clonedPhase: Phase = {
                ...phaseToClone,
                id: `phase-${Date.now()}`,
                name: `${phaseToClone.name} (Copie)`,
                tasks: phaseToClone.tasks.map(task => ({
                    ...task,
                    id: `task-${Date.now()}-${Math.random()}`,
                    articles: task.articles.map(article => ({
                        ...article,
                        id: `article-${Date.now()}-${Math.random()}`
                    }))
                }))
            };
            
            setQuote(prev => ({
                ...prev,
                phases: [...prev.phases, clonedPhase],
                updatedAt: new Date().toISOString()
            }));
            setIsDirty(true);
        }
    }, [quote.phases]);

    // Gestion des tâches
    const addTask = useCallback((phaseId: string, template?: Partial<Task>) => {
        const newTask: Task = {
            id: `task-${Date.now()}`,
            name: template?.name || '',
            description: template?.description || '',
            articles: template?.articles || [],
            totalPrice: 0,
            expanded: true
        };

        setQuote(prev => ({
            ...prev,
            phases: prev.phases.map(phase =>
                phase.id === phaseId
                    ? { ...phase, tasks: [...phase.tasks, newTask] }
                    : phase
            ),
            updatedAt: new Date().toISOString()
        }));
        setIsDirty(true);
    }, []);

    const updateTask = useCallback((phaseId: string, taskId: string, updates: Partial<Task>) => {
        setQuote(prev => ({
            ...prev,
            phases: prev.phases.map(phase =>
                phase.id === phaseId
                    ? {
                        ...phase,
                        tasks: phase.tasks.map(task =>
                            task.id === taskId ? { ...task, ...updates } : task
                        )
                    }
                    : phase
            ),
            updatedAt: new Date().toISOString()
        }));
        setIsDirty(true);
    }, []);

    const removeTask = useCallback((phaseId: string, taskId: string) => {
        setQuote(prev => ({
            ...prev,
            phases: prev.phases.map(phase =>
                phase.id === phaseId
                    ? { ...phase, tasks: phase.tasks.filter(task => task.id !== taskId) }
                    : phase
            ),
            updatedAt: new Date().toISOString()
        }));
        setIsDirty(true);
    }, []);

    const duplicateTask = useCallback((phaseId: string, taskId: string) => {
        const phase = quote.phases.find(p => p.id === phaseId);
        const taskToClone = phase?.tasks.find(t => t.id === taskId);
        
        if (taskToClone) {
            const clonedTask: Task = {
                ...taskToClone,
                id: `task-${Date.now()}`,
                name: `${taskToClone.name} (Copie)`,
                articles: taskToClone.articles.map(article => ({
                    ...article,
                    id: `article-${Date.now()}-${Math.random()}`
                }))
            };
            
            setQuote(prev => ({
                ...prev,
                phases: prev.phases.map(phase =>
                    phase.id === phaseId
                        ? { ...phase, tasks: [...phase.tasks, clonedTask] }
                        : phase
                ),
                updatedAt: new Date().toISOString()
            }));
            setIsDirty(true);
        }
    }, [quote.phases]);

    // Gestion des articles
    const addArticle = useCallback((phaseId: string, taskId: string, template?: Partial<Article>) => {
        const newArticle: Article = {
            id: `article-${Date.now()}`,
            description: template?.description || '',
            quantity: template?.quantity || 1,
            unit: template?.unit || 'unité',
            unitPrice: template?.unitPrice || 0,
            totalPrice: template?.totalPrice || 0,
            notes: template?.notes || ''
        };

        setQuote(prev => ({
            ...prev,
            phases: prev.phases.map(phase =>
                phase.id === phaseId
                    ? {
                        ...phase,
                        tasks: phase.tasks.map(task =>
                            task.id === taskId
                                ? { ...task, articles: [...task.articles, newArticle] }
                                : task
                        )
                    }
                    : phase
            ),
            updatedAt: new Date().toISOString()
        }));
        setIsDirty(true);
    }, []);

    const updateArticle = useCallback((phaseId: string, taskId: string, articleId: string, updates: Partial<Article>) => {
        setQuote(prev => ({
            ...prev,
            phases: prev.phases.map(phase =>
                phase.id === phaseId
                    ? {
                        ...phase,
                        tasks: phase.tasks.map(task =>
                            task.id === taskId
                                ? {
                                    ...task,
                                    articles: task.articles.map(article => {
                                        if (article.id === articleId) {
                                            const updatedArticle = { ...article, ...updates };
                                            // Recalculer le prix total si quantité ou prix unitaire change
                                            if ('quantity' in updates || 'unitPrice' in updates) {
                                                updatedArticle.totalPrice = updatedArticle.quantity * updatedArticle.unitPrice;
                                            }
                                            return updatedArticle;
                                        }
                                        return article;
                                    })
                                }
                                : task
                        )
                    }
                    : phase
            ),
            updatedAt: new Date().toISOString()
        }));
        setIsDirty(true);
    }, []);

    const removeArticle = useCallback((phaseId: string, taskId: string, articleId: string) => {
        setQuote(prev => ({
            ...prev,
            phases: prev.phases.map(phase =>
                phase.id === phaseId
                    ? {
                        ...phase,
                        tasks: phase.tasks.map(task =>
                            task.id === taskId
                                ? { ...task, articles: task.articles.filter(article => article.id !== articleId) }
                                : task
                        )
                    }
                    : phase
            ),
            updatedAt: new Date().toISOString()
        }));
        setIsDirty(true);
    }, []);

    const duplicateArticle = useCallback((phaseId: string, taskId: string, articleId: string) => {
        const phase = quote.phases.find(p => p.id === phaseId);
        const task = phase?.tasks.find(t => t.id === taskId);
        const articleToClone = task?.articles.find(a => a.id === articleId);
        
        if (articleToClone) {
            const clonedArticle: Article = {
                ...articleToClone,
                id: `article-${Date.now()}`,
                description: `${articleToClone.description} (Copie)`
            };
            
            addArticle(phaseId, taskId, clonedArticle);
        }
    }, [quote.phases, addArticle]);

    // Gestion des templates
    const applyTemplate = useCallback((template: QuoteTemplate) => {
        const newPhases: Phase[] = template.phases.map((phaseTemplate, index) => ({
            id: `phase-${Date.now()}-${index}`,
            name: phaseTemplate.name,
            description: phaseTemplate.description,
            tasks: phaseTemplate.tasks.map((taskTemplate, taskIndex) => ({
                id: `task-${Date.now()}-${index}-${taskIndex}`,
                name: taskTemplate.name,
                description: taskTemplate.description,
                articles: [],
                totalPrice: 0,
                expanded: false
            })),
            totalPrice: 0,
            expanded: true
        }));

        setQuote(prev => ({
            ...prev,
            projectType: template.projectType,
            phases: [...prev.phases, ...newPhases],
            updatedAt: new Date().toISOString()
        }));
        setIsDirty(true);
    }, []);

    // Sauvegarde
    const saveQuote = useCallback(async () => {
        try {
            setIsCalculating(true);

            // Convertir StructuredQuote vers Quote pour Firebase
            const firebaseQuote: FirebaseQuote = {
                id: quote.id,
                reference: quote.reference,
                title: quote.title,
                clientName: quote.clientName,
                clientEmail: quote.clientEmail,
                clientPhone: quote.clientPhone,
                companyName: '', // Champ requis par Quote mais absent de StructuredQuote
                projectType: quote.projectType,
                phases: quote.phases,
                subtotal: quote.subtotal,
                taxRate: quote.taxRate,
                taxAmount: quote.taxAmount,
                totalAmount: quote.totalAmount,
                status: quote.status as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired',
                validityDays: quote.validityDays,
                notes: quote.notes,
                paymentTerms: quote.paymentTerms,
                createdAt: quote.createdAt,
                updatedAt: quote.updatedAt
            };

            // Déléguer la logique create/update au service (garantit la cohérence d'ID)
            const savedId = await QuotesService.saveQuote(firebaseQuote);

            // S'assurer que l'état local porte l'ID Firestore
            if (savedId && savedId !== quote.id) {
                setQuote(prev => ({ ...prev, id: savedId }));
            }

            // Récupérer la référence générée côté Firestore si absente localement
            try {
                const saved = await QuotesService.getQuoteById(savedId || quote.id);
                if (saved && saved.reference && saved.reference !== quote.reference) {
                    setQuote(prev => ({ ...prev, reference: saved.reference }));
                }
            } catch {
                // silencieux: non bloquant si récupération échoue
            }

            // Sauvegarder hors-ligne si nécessaire
            if (currentLocation) {
                await createReport({
                    type: 'structured_quote',
                    data: { ...quote, id: savedId || quote.id },
                    location: currentLocation,
                    timestamp: new Date().toISOString()
                });
            }

            setIsDirty(false);
            return { success: true, message: '✅ Devis sauvegardé avec succès !' };
        } catch (error) {
            console.error('Erreur de sauvegarde:', error);
            return { success: false, message: '❌ Erreur lors de la sauvegarde' };
        } finally {
            setIsCalculating(false);
        }
    }, [quote, currentLocation, createReport]);

    // Mise à jour des informations générales
    const updateQuoteInfo = useCallback((updates: Partial<StructuredQuote>) => {
        setQuote(prev => ({
            ...prev,
            ...updates,
            updatedAt: new Date().toISOString()
        }));
        setIsDirty(true);
    }, []);

    // Statistiques
    const getQuoteStats = useCallback(() => {
        const totalPhases = quote.phases.length;
        const totalTasks = quote.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
        const totalArticles = quote.phases.reduce((sum, phase) => 
            sum + phase.tasks.reduce((taskSum, task) => taskSum + task.articles.length, 0), 0
        );

        return {
            totalPhases,
            totalTasks,
            totalArticles,
            completionRate: totalArticles > 0 ? Math.round((totalArticles / (totalTasks || 1)) * 100) : 0,
            averageTasksPerPhase: totalPhases > 0 ? Math.round(totalTasks / totalPhases) : 0,
            averageArticlesPerTask: totalTasks > 0 ? Math.round(totalArticles / totalTasks) : 0
        };
    }, [quote.phases]);

    return {
        // État
        quote,
        isCalculating,
        isDirty,
        
        // Actions phases
        addPhase,
        updatePhase,
        removePhase,
        duplicatePhase,
        
        // Actions tâches
        addTask,
        updateTask,
        removeTask,
        duplicateTask,
        
        // Actions articles
        addArticle,
        updateArticle,
        removeArticle,
        duplicateArticle,
        
        // Templates
        applyTemplate,
        
        // Général
        updateQuoteInfo,
        saveQuote,
        calculateTotals,
        getQuoteStats
    };
};
