import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { Sparkles, X, Plus, ChevronDown, ChevronUp, Save, LayoutTemplate, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { Quote } from '../../services/quotesService';
import { Phase, Task, Article, QuoteType, StructuralStudy } from '../../types/StructuredQuote';
import toast from 'react-hot-toast';
import { quoteGenerator, QuoteGenerationRequest } from '../../services/ai/quoteGenerator';
import { AIQuoteGenerator } from './AIQuoteGenerator';
import QuoteTemplates from './QuoteTemplates';
import { useBranding } from '../../contexts/BrandingContext';
import QuotesService from '../../services/quotesService';
import { generateQuotePdf } from '../../services/pdf/quotePdf';
import StructuralStudyManager from './StructuralStudyManager';
import StructuralStudyService from '../../services/structuralStudyService';

interface QuoteCreatorSimpleProps {
  onClose: () => void;
  onQuoteCreated?: (quote: Quote) => void;
  editQuote?: Quote | null;
}

const QuoteCreatorSimple: React.FC<QuoteCreatorSimpleProps> = ({
  onClose,
  onQuoteCreated,
  editQuote
}) => {
  // États principaux
  const { user } = useAuth();
  const brandingCtx = useBranding();
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // États du devis - initialisés vides pour éviter le flash
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [projectType, setProjectType] = useState('');
  const [phases, setPhases] = useState<Phase[]>([]);
  const [notes, setNotes] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Paiement à 30 jours');
  const [validityDays] = useState(30);
  const [taxRate, setTaxRate] = useState(18);

  // États calculés
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // États de validation
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // États pour l'étude structurale
  const [quoteType, setQuoteType] = useState<QuoteType>('preliminary');
  const [structuralStudy, setStructuralStudy] = useState<StructuralStudy>({
    status: 'none'
  });
  const [uncertaintyMargin, setUncertaintyMargin] = useState(35);

  // Fonctions utilitaires
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Suggestions BTP
  const BTP_TYPES = [
    'Gros œuvre',
    'Second œuvre',
    'Maçonnerie',
    'Plomberie',
    'Électricité',
    'Charpente',
    'Couverture',
    'Peinture',
    'Menuiserie',
    'VRD / Voirie',
    'Terrassement',
    'Isolation',
    'Étanchéité',
    'Carrelage',
    'Climatisation',
    'Serrurerie',
    'Aménagement intérieur',
  ];

  const BTP_UNITS = ['u', 'm²', 'ml', 'm³', 'h', 'kg', 'lot'];

  // Export PDF
  const handleExportPdf = () => {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);
    
    const quoteForPdf: Quote = {
      id: editQuote?.id || `DEVIS-${Date.now()}`,
      title,
      clientName,
      companyName: companyName || '',
      clientEmail: clientEmail || '',
      clientPhone: clientPhone || '',
      projectType,
      phases,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      status: (editQuote?.status as Quote['status']) || 'draft',
      validityDays,
      notes,
      paymentTerms,
      validUntil: validUntil.toISOString(),
      createdAt: editQuote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      const branding = {
        companyName: brandingCtx.profile?.companyName,
        companyAddress: brandingCtx.profile?.companyAddress,
        footerContact: brandingCtx.profile?.footerContact,
        logoDataUrl: brandingCtx.logoDataUrl || undefined,
        logoWidthPt: 120,
      };
      generateQuotePdf(quoteForPdf, branding);
    } catch (e) {
      console.error(e);
      toast.error("Échec de l'export PDF");
    }
  };

  // Calcul automatique des totaux
  const calculateTotals = useCallback(() => {
    let newSubtotal = 0;
    
    phases.forEach((phase: Phase) => {
      let phaseTotal = 0;
      if (phase.tasks) {
        phase.tasks.forEach((task: Task) => {
          let taskTotal = 0;
          if (task.articles) {
            task.articles.forEach((article: Article) => {
              const articleTotal = (article.quantity || 0) * (article.unitPrice || 0);
              taskTotal += articleTotal;
            });
          }
          phaseTotal += taskTotal;
        });
      }
      newSubtotal += phaseTotal;
    });

    const newTaxAmount = (newSubtotal * taxRate) / 100;
    const newTotalAmount = newSubtotal + newTaxAmount;

    setSubtotal(newSubtotal);
    setTaxAmount(newTaxAmount);
    setTotalAmount(newTotalAmount);
  }, [phases, taxRate]);

  // Charger les données du devis à éditer (avant le paint pour éviter le flicker)
  useLayoutEffect(() => {
    if (editQuote) {
      // Hydratation synchrone de tous les états
      setTitle(editQuote.title || '');
      setClientName(editQuote.clientName || '');
      setCompanyName(editQuote.companyName || '');
      setClientEmail(editQuote.clientEmail || '');
      setClientPhone(editQuote.clientPhone || '');
      setProjectType(editQuote.projectType || '');
      setPhases(editQuote.phases || []);
      setNotes(editQuote.notes || '');
      setPaymentTerms(editQuote.paymentTerms || 'Paiement à 30 jours');
      setTaxRate(editQuote.taxRate || 18);
      
      // Charger les données d'étude structurale
      const quoteAny = editQuote as any;
      setQuoteType(quoteAny.quoteType || 'preliminary');
      setStructuralStudy(quoteAny.structuralStudy || { status: 'none' });
      const margin = quoteAny.uncertaintyMargin || StructuralStudyService.calculateRecommendedMargin(
        editQuote.projectType || 'construction',
        quoteAny.structuralStudy?.status || 'none'
      );
      setUncertaintyMargin(margin);
      
      // Marquer comme initialisé APRÈS l'hydratation
      setIsInitialized(true);
    } else if (editQuote === null) {
      // Mode création - initialiser avec valeurs par défaut
      setTitle('');
      setClientName('');
      setCompanyName('');
      setClientEmail('');
      setClientPhone('');
      setProjectType('');
      setPhases([]);
      setNotes('');
      setPaymentTerms('Paiement à 30 jours');
      setTaxRate(18);
      setQuoteType('preliminary');
      setStructuralStudy({ status: 'none' });
      setUncertaintyMargin(35);
      setIsInitialized(true);
    }
  }, [editQuote]);

  // Validation des champs
  const validateForm = useCallback((): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!title.trim()) {
      newErrors.title = 'Le titre du devis est obligatoire';
    }
    if (!clientName.trim()) {
      newErrors.clientName = 'Le nom du client est obligatoire';
    }
    if (!clientEmail.trim()) {
      newErrors.clientEmail = 'L\'email du client est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      newErrors.clientEmail = 'Format d\'email invalide';
    }
    if (phases.length === 0) {
      newErrors.phases = 'Au moins une phase est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, clientName, clientEmail, phases]);

  // Recalculer les totaux quand les phases changent
  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  // Sauvegarde automatique (toutes les 2 minutes pour éviter les blocages)
  useEffect(() => {
    if (!editQuote || !isInitialized || phases.length === 0) return;

    const autoSaveInterval = setInterval(async () => {
      if (validateForm() && !isSaving) {
        setIsAutoSaving(true);
        try {
          const validUntil = new Date();
          validUntil.setDate(validUntil.getDate() + validityDays);
          
          const quoteData = {
            title,
            clientName,
            companyName: companyName || '',
            clientEmail: clientEmail || '',
            clientPhone: clientPhone || '',
            projectType,
            phases,
            subtotal,
            taxRate,
            taxAmount,
            totalAmount,
            validUntil: validUntil.toISOString(),
            status: editQuote.status,
            validityDays,
            notes,
            paymentTerms
          };

          await QuotesService.updateQuote(editQuote.id, quoteData);
        } catch (error) {
          console.error('Erreur sauvegarde automatique:', error);
        } finally {
          setIsAutoSaving(false);
        }
      }
    }, 120000); // 2 minutes

    return () => clearInterval(autoSaveInterval);
  }, [editQuote, isInitialized, phases, title, clientName, clientEmail, companyName, clientPhone, projectType, subtotal, taxRate, taxAmount, totalAmount, validityDays, notes, paymentTerms, validateForm, isSaving]);

  // Garde de rendu globale pour éviter tout flash avant initialisation
  if (!isInitialized) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center border border-white/20">
          <div className="flex items-center justify-center text-gray-600">
            <svg className="animate-spin h-5 w-5 mr-3 text-gray-400" viewBox="0 0 24 24" />
            <span>Chargement du devis…</span>
          </div>
        </div>
      </div>
    );
  }

  // TOUT LE CONTENU DU FORMULAIRE DOIT ÊTRE APRÈS CETTE GARDE

  // Fonctions de gestion des phases
  const addPhase = () => {
    const newPhase: Phase = {
      id: generateId(),
      name: `Phase ${phases.length + 1}`,
      description: '',
      tasks: [],
      totalPrice: 0,
      expanded: true
    };
    setPhases([...phases, newPhase]);
  };

  const updatePhase = (phaseId: string, updates: Partial<Phase>) => {
    setPhases(phases.map(phase => 
      phase.id === phaseId ? { ...phase, ...updates } : phase
    ));
  };

  const deletePhase = (phaseId: string) => {
    setPhases(phases.filter(phase => phase.id !== phaseId));
  };

  // Fonctions de gestion des tâches
  const addTask = (phaseId: string) => {
    const newTask: Task = {
      id: generateId(),
      name: 'Nouvelle tâche',
      description: '',
      articles: [],
      totalPrice: 0,
      expanded: true
    };
    
    setPhases(phases.map(phase => 
      phase.id === phaseId 
        ? { ...phase, tasks: [...phase.tasks, newTask] }
        : phase
    ));
  };

  const updateTask = (phaseId: string, taskId: string, updates: Partial<Task>) => {
    setPhases(phases.map((phase: Phase) => 
      phase.id === phaseId 
        ? {
            ...phase,
            tasks: phase.tasks.map((task: Task) => 
              task.id === taskId ? { ...task, ...updates } : task
            )
          }
        : phase
    ));
  };

  const deleteTask = (phaseId: string, taskId: string) => {
    setPhases(phases.map((phase: Phase) => 
      phase.id === phaseId 
        ? { ...phase, tasks: phase.tasks.filter((task: Task) => task.id !== taskId) }
        : phase
    ));
  };

  // Fonctions de gestion des articles
  const addArticle = (phaseId: string, taskId: string) => {
    const newArticle: Article = {
      id: generateId(),
      description: 'Nouvel article',
      quantity: 1,
      unit: 'u',
      unitPrice: 0,
      totalPrice: 0
    };
    
    setPhases(phases.map((phase: Phase) => 
      phase.id === phaseId 
        ? {
            ...phase,
            tasks: phase.tasks.map((task: Task) => 
              task.id === taskId 
                ? { ...task, articles: [...task.articles, newArticle] }
                : task
            )
          }
        : phase
    ));
  };

  const updateArticle = (phaseId: string, taskId: string, articleId: string, updates: Partial<Article>) => {
    setPhases(phases.map((phase: Phase) => 
      phase.id === phaseId 
        ? {
            ...phase,
            tasks: phase.tasks.map((task: Task) => 
              task.id === taskId 
                ? {
                    ...task,
                    articles: task.articles.map((article: Article) => 
                      article.id === articleId 
                        ? { 
                            ...article, 
                            ...updates,
                            totalPrice: (updates.quantity ?? article.quantity) * (updates.unitPrice ?? article.unitPrice)
                          }
                        : article
                    )
                  }
                : task
            )
          }
        : phase
    ));
  };

  const deleteArticle = (phaseId: string, taskId: string, articleId: string) => {
    setPhases(phases.map((phase: Phase) => 
      phase.id === phaseId 
        ? {
            ...phase,
            tasks: phase.tasks.map((task: Task) => 
              task.id === taskId 
                ? { ...task, articles: task.articles.filter((article: Article) => article.id !== articleId) }
                : task
            )
          }
        : phase
    ));
  };

  // Fonction pour appliquer un template
  const handleSelectTemplate = (template: {
    name: string;
    category: string;
    phases?: Phase[];
  }) => {
    setTitle(template.name);
    setProjectType(template.category);
    setPhases(template.phases || []);
    setShowTemplates(false);
    toast.success('Template appliqué avec succès');
  };

  
  const handleGenerateWithAI = async (request: QuoteGenerationRequest) => {
    setIsGeneratingWithAI(true);
    try {
      const generatedQuote = await quoteGenerator.generateQuote(request);
      
      // Convertir les phases générées au format Phase[]
      const convertedPhases: Phase[] = generatedQuote.phases.map((phase) => {
        const tasks: Task[] = phase.items.map((item) => ({
          id: generateId(),
          name: item.description,
          description: item.description,
          totalPrice: item.totalPrice,
          expanded: true,
          articles: [{
            id: generateId(),
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          }],
        }));

        const phaseTotal = tasks.reduce<number>((sum, t) => sum + (t.totalPrice || 0), 0);

        return {
          id: generateId(),
          name: phase.name,
          description: phase.description,
          totalPrice: phaseTotal,
          expanded: true,
          tasks,
        };
      });

      // Appliquer les données générées
      setTitle(generatedQuote.title);
      setProjectType(request.projectType);
      setPhases(convertedPhases);
      setShowAIGenerator(false);
      
      toast.success(`Devis généré avec ${generatedQuote.confidence}% de confiance`);
      
      // Afficher les recommandations
      if (generatedQuote.recommendations.length > 0) {
        setTimeout(() => {
          toast(` ${generatedQuote.recommendations[0]}`);
        }, 2000);
      }
      
    } catch (error) {
      console.error('Erreur Génération:', error);
      toast.error('Erreur lors de la génération du devis IA');
    } finally {
      setIsGeneratingWithAI(false);
    }
  };

  // Fonction de sauvegarde
  const handleSave = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour sauvegarder');
      return;
    }

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsSaving(true);
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validityDays);
      
      const quoteData = {
        title,
        clientName,
        companyName: companyName || '',
        clientEmail: clientEmail || '',
        clientPhone: clientPhone || '',
        projectType,
        phases,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        validUntil: validUntil.toISOString(),
        // Préserver le statut existant en édition, sinon défaut brouillon en création
        status: (editQuote?.status as Quote['status']) ?? 'draft',
        validityDays,
        notes,
        paymentTerms
      };

      if (editQuote) {
        await QuotesService.updateQuote(editQuote.id, quoteData);
        toast.success('Devis modifié avec succès');
        onQuoteCreated?.(editQuote);
      } else {
        const { ...quoteDataForCreate } = quoteData;
        const newQuoteId = await QuotesService.createQuote({
          ...quoteDataForCreate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        const newQuote = { ...quoteData, id: newQuoteId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Quote;
        toast.success('Devis créé avec succès');
        onQuoteCreated?.(newQuote);
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du devis');
    } finally {
      setIsSaving(false);
    }
  };

  // RENDU CONDITIONNEL COMPLET - RIEN NE S'AFFICHE AVANT INITIALISATION
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-white/20">
        {isInitialized ? (
          <>
            {/* En-tête */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editQuote ? 'Modifier le devis' : 'Nouveau devis'}
                  </h2>
                  <p className="text-sm text-gray-500">Créez un devis professionnel</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTemplates(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <LayoutTemplate className="w-4 h-4" />
                  Templates
                </button>
                <button
                  onClick={() => setShowAIGenerator(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="w-4 h-4" />
                  Générer IA
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Informations client */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Titre du devis *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      placeholder="Ex: Rénovation appartement"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type de projet
                    </label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <option value="">Sélectionner...</option>
                      {BTP_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom du client *
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg ${errors.clientName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      placeholder="Nom du client"
                    />
                    {errors.clientName && <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email du client *
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg ${errors.clientEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      placeholder="email@exemple.com"
                    />
                    {errors.clientEmail && <p className="text-red-500 text-sm mt-1">{errors.clientEmail}</p>}
                  </div>
                </div>

                {/* Phases */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Phases du devis</h3>
                    <button
                      onClick={addPhase}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter une phase
                    </button>
                  </div>
                  {errors.phases && <p className="text-red-500 text-sm mb-2">{errors.phases}</p>}
                  
                  {phases.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-500">Aucune phase. Cliquez sur "Ajouter une phase" pour commencer.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {phases.map((phase) => (
                        <div key={phase.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div 
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                            onClick={() => updatePhase(phase.id, { expanded: !phase.expanded })}
                          >
                            <div className="flex items-center gap-2">
                              {phase.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              <input
                                type="text"
                                value={phase.name}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  updatePhase(phase.id, { name: e.target.value });
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="font-medium bg-transparent border-none focus:ring-0"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{formatCurrency(phase.totalPrice || 0)}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deletePhase(phase.id);
                                }}
                                className="p-1 text-red-500 hover:bg-red-100 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          {phase.expanded && (
                            <div className="p-4 space-y-4">
                              <button
                                onClick={() => addTask(phase.id)}
                                className="text-sm text-blue-500 hover:text-blue-600"
                              >
                                + Ajouter une tâche
                              </button>
                              
                              {phase.tasks.map((task) => (
                                <div key={task.id} className="ml-4 border-l-2 border-gray-200 pl-4">
                                  <div className="flex items-center justify-between">
                                    <input
                                      type="text"
                                      value={task.name}
                                      onChange={(e) => updateTask(phase.id, task.id, { name: e.target.value })}
                                      className="font-medium bg-transparent border-none focus:ring-0"
                                    />
                                    <button
                                      onClick={() => deleteTask(phase.id, task.id)}
                                      className="p-1 text-red-500 hover:bg-red-100 rounded"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  
                                  <button
                                    onClick={() => addArticle(phase.id, task.id)}
                                    className="text-xs text-blue-500 hover:text-blue-600 mt-2"
                                  >
                                    + Ajouter un article
                                  </button>
                                  
                                  {task.articles.map((article) => (
                                    <div key={article.id} className="ml-4 mt-2 grid grid-cols-5 gap-2 items-center">
                                      <input
                                        type="text"
                                        value={article.description}
                                        onChange={(e) => updateArticle(phase.id, task.id, article.id, { description: e.target.value })}
                                        className="col-span-2 px-2 py-1 border rounded text-sm"
                                        placeholder="Description"
                                      />
                                      <input
                                        type="number"
                                        value={article.quantity}
                                        onChange={(e) => updateArticle(phase.id, task.id, article.id, { quantity: parseFloat(e.target.value) || 0 })}
                                        className="px-2 py-1 border rounded text-sm text-center"
                                        placeholder="Qté"
                                      />
                                      <input
                                        type="number"
                                        value={article.unitPrice}
                                        onChange={(e) => updateArticle(phase.id, task.id, article.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                                        className="px-2 py-1 border rounded text-sm text-right"
                                        placeholder="Prix"
                                      />
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{formatCurrency(article.totalPrice || 0)}</span>
                                        <button
                                          onClick={() => deleteArticle(phase.id, task.id, article.id)}
                                          className="p-1 text-red-500 hover:bg-red-100 rounded"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totaux */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span>Sous-total HT</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>TVA ({taxRate}%)</span>
                    <span className="font-medium">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total TTC</span>
                    <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {isAutoSaving && <span>Sauvegarde automatique...</span>}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleExportPdf}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Exporter PDF
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p>Chargement...</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showTemplates && (
        <QuoteTemplates
          onSelect={handleSelectTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
      
      {showAIGenerator && (
        <AIQuoteGenerator
          isOpen={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
          onGenerate={handleGenerateWithAI}
          isGenerating={isGeneratingWithAI}
        />
      )}
    </div>
  );
};

export default QuoteCreatorSimple;
