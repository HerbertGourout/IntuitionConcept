import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { Plus, FileText, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import { Quote, QuotesService } from '../../services/quotesService';
import type { Phase, Task, Article } from '../../types/StructuredQuote';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { generateQuotePdf } from '../../services/pdf/quotePdf';
import { useBranding } from '../../contexts/BrandingContext';

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
    const quoteForPdf: Quote = {
      id: editQuote?.id || `DEVIS-${Date.now()}`,
      title,
      clientName,
      companyName,
      clientEmail,
      clientPhone,
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
    
    phases.forEach(phase => {
      let phaseTotal = 0;
      if (phase.tasks) {
        phase.tasks.forEach(task => {
          let taskTotal = 0;
          if (task.articles) {
            task.articles.forEach(article => {
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
      setIsInitialized(true);
    }
  }, [editQuote]);

  // Recalculer les totaux quand les phases changent
  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

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
    setPhases(phases.map(phase => 
      phase.id === phaseId 
        ? {
            ...phase,
            tasks: phase.tasks.map(task => 
              task.id === taskId ? { ...task, ...updates } : task
            )
          }
        : phase
    ));
  };

  const deleteTask = (phaseId: string, taskId: string) => {
    setPhases(phases.map(phase => 
      phase.id === phaseId 
        ? { ...phase, tasks: phase.tasks.filter(task => task.id !== taskId) }
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
    
    setPhases(phases.map(phase => 
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
    ));
  };

  const updateArticle = (phaseId: string, taskId: string, articleId: string, updates: Partial<Article>) => {
    setPhases(phases.map(phase => 
      phase.id === phaseId 
        ? {
            ...phase,
            tasks: phase.tasks.map(task => 
              task.id === taskId 
                ? {
                    ...task,
                    articles: task.articles.map(article => 
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
    setPhases(phases.map(phase => 
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
    ));
  };

  // Fonction de sauvegarde
  const handleSave = async () => {
    if (!user || !title || !clientName || !clientEmail) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSaving(true);
    try {
      const quoteData = {
        title,
        clientName,
        companyName,
        clientEmail,
        clientPhone,
        projectType,
        phases,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {editQuote ? 'Modifier le devis' : 'Nouveau devis'}
                    </h2>
                    <p className="text-blue-100">Créez un devis professionnel en quelques clics</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

        {/* Contenu principal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-8">
            {/* Section informations client */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Informations client
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du devis *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ex: Développement site web e-commerce"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de projet
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionner un type</option>
                    {BTP_TYPES.map((t) => (
                      <option value={t} key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du client *
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nom complet du client"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nom de l'entreprise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="email@exemple.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>
            </div>

            {/* Section contenu du devis */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Contenu du devis
                </h3>
                <button
                  onClick={addPhase}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une phase</span>
                </button>
              </div>

              {isInitialized && phases.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">Aucune phase ajoutée</p>
                  <p className="text-sm">Commencez par ajouter une phase pour structurer votre devis</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {phases.map((phase) => (
                    <div key={phase.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50 overflow-hidden">
                      {/* En-tête de phase */}
                      <div className="p-4 bg-gradient-to-r from-blue-100/50 to-purple-100/50 border-b border-blue-200/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <button
                              onClick={() => updatePhase(phase.id, { expanded: !phase.expanded })}
                              className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                            >
                              {phase.expanded ? (
                                <ChevronDown className="w-5 h-5 text-blue-600" />
                              ) : (
                                <ChevronUp className="w-5 h-5 text-blue-600" />
                              )}
                            </button>
                            <input
                              type="text"
                              value={phase.name}
                              onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                              className="text-lg font-semibold bg-transparent border-none outline-none text-gray-800 flex-1"
                              placeholder="Nom de la phase"
                            />
                            {(() => {
                              const phaseTotal = phase.tasks?.reduce((sum, task) => 
                                sum + (task.articles?.reduce((taskSum, article) => 
                                  taskSum + ((article.quantity || 0) * (article.unitPrice || 0)), 0) || 0), 0) || 0;
                              return phaseTotal > 0 ? (
                                <div className="text-sm font-medium text-blue-600">
                                  {formatCurrency(phaseTotal)}
                                </div>
                              ) : null;
                            })()}
                          </div>
                          <div className="flex items-center space-x-3 ml-4">
                            <button
                              onClick={() => addTask(phase.id)}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
                              title="Ajouter une tâche"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Tâche</span>
                            </button>
                            <button
                              onClick={() => deletePhase(phase.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-500"
                              title="Supprimer la phase"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {phase.expanded && (
                          <div className="mt-3">
                            <textarea
                              value={phase.description}
                              onChange={(e) => updatePhase(phase.id, { description: e.target.value })}
                              className="w-full px-3 py-2 bg-white/70 border border-blue-200/50 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Description de la phase..."
                              rows={2}
                            />
                          </div>
                        )}
                      </div>

                      {/* Tâches de la phase */}
                      {phase.expanded && (
                        <div className="p-4 space-y-3">
                          {phase.tasks.map((task) => (
                            <div key={task.id} className="bg-white/70 rounded-lg border border-gray-200/50 overflow-hidden">
                              {/* En-tête de tâche */}
                              <div className="p-3 bg-gray-50/50 border-b border-gray-200/30">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1">
                                    <button
                                      onClick={() => updateTask(phase.id, task.id, { expanded: !task.expanded })}
                                      className="p-1 hover:bg-white/50 rounded transition-colors"
                                    >
                                      {task.expanded ? (
                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                      ) : (
                                        <ChevronUp className="w-4 h-4 text-gray-600" />
                                      )}
                                    </button>
                                    <input
                                      type="text"
                                      value={task.name}
                                      onChange={(e) => updateTask(phase.id, task.id, { name: e.target.value })}
                                      className="font-medium bg-transparent border-none outline-none text-gray-700 flex-1"
                                      placeholder="Nom de la tâche"
                                    />
                                    {(() => {
                                      const taskTotal = task.articles?.reduce((sum, article) => 
                                        sum + ((article.quantity || 0) * (article.unitPrice || 0)), 0) || 0;
                                      return taskTotal > 0 ? (
                                        <div className="text-sm text-gray-600">
                                          {formatCurrency(taskTotal)}
                                        </div>
                                      ) : null;
                                    })()}
                                  </div>
                                  <div className="flex items-center space-x-3 ml-4">
                                    <button
                                      onClick={() => addArticle(phase.id, task.id)}
                                      className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors text-xs font-medium flex items-center space-x-1"
                                      title="Ajouter un article"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Article</span>
                                    </button>
                                    <button
                                      onClick={() => deleteTask(phase.id, task.id)}
                                      className="p-1 hover:bg-red-100 rounded transition-colors text-red-500"
                                      title="Supprimer la tâche"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                
                                {task.expanded && task.description !== undefined && (
                                  <div className="mt-2">
                                    <textarea
                                      value={task.description}
                                      onChange={(e) => updateTask(phase.id, task.id, { description: e.target.value })}
                                      className="w-full px-3 py-2 bg-white/70 border border-gray-200/50 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                      placeholder="Description de la tâche..."
                                      rows={1}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Articles de la tâche */}
                              {task.expanded && (
                                <div className="p-3">
                                  {task.articles.length === 0 ? (
                                    <div className="text-center py-4 text-gray-400 text-sm">
                                      Aucun article. Cliquez sur + pour en ajouter.
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="grid grid-cols-12 gap-3 items-center px-3 pt-1 pb-2 text-xs font-medium text-gray-500">
                                        <div className="col-span-6">Description</div>
                                        <div className="col-span-1 text-center">Quantité</div>
                                        <div className="col-span-1 text-center">Unité</div>
                                        <div className="col-span-2 text-right">Prix unitaire</div>
                                        <div className="col-span-1 text-right">Total</div>
                                        <div className="col-span-1 text-center"></div>
                                      </div>
                                      {task.articles.map((article) => (
                                        <div key={article.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-white/80 rounded-lg border border-gray-100">
                                          <div className="col-span-6">
                                            <input
                                              type="text"
                                              value={article.description}
                                              onChange={(e) => updateArticle(phase.id, task.id, article.id, { description: e.target.value })}
                                              className="w-full px-2 py-1 text-sm bg-transparent border-none outline-none"
                                              placeholder="Description"
                                            />
                                          </div>
                                          <div className="col-span-1">
                                            <input
                                              type="number"
                                              value={article.quantity || ''}
                                              onChange={(e) => updateArticle(phase.id, task.id, article.id, { quantity: Number(e.target.value) || 0 })}
                                              className="w-full px-2 py-1 text-sm text-center bg-transparent border-none outline-none"
                                              placeholder="Quantité"
                                              min="0"
                                            />
                                          </div>
                                          <div className="col-span-1">
                                            <select
                                              value={article.unit}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '__custom') {
                                                  const input = window.prompt("Entrez une unité personnalisée (ex: sac, l, pcs)", article.unit || '');
                                                  const custom = (input || '').trim();
                                                  updateArticle(phase.id, task.id, article.id, { unit: custom || 'u' });
                                                } else {
                                                  updateArticle(phase.id, task.id, article.id, { unit: val });
                                                }
                                              }}
                                              className="w-full px-2 py-1 text-sm text-center bg-transparent border border-gray-200 rounded"
                                            >
                                              {[...BTP_UNITS, ...(article.unit && !BTP_UNITS.includes(article.unit) ? [article.unit] : [])].map(u => (
                                                <option value={u} key={u}>{u}</option>
                                              ))}
                                              <option value="__custom">Autre…</option>
                                            </select>
                                          </div>
                                          <div className="col-span-2">
                                            <input
                                              type="number"
                                              value={article.unitPrice || ''}
                                              onChange={(e) => updateArticle(phase.id, task.id, article.id, { unitPrice: Number(e.target.value) || 0 })}
                                              className="w-full px-2 py-1 text-sm text-right bg-transparent border-none outline-none"
                                              placeholder="Prix unitaire"
                                              min="0"
                                            />
                                          </div>
                                          <div className="col-span-1 text-sm text-right font-medium text-gray-700">
                                            {formatCurrency((article.quantity || 0) * (article.unitPrice || 0))}
                                          </div>
                                          <div className="col-span-1 text-center">
                                            <button
                                              onClick={() => deleteArticle(phase.id, task.id, article.id)}
                                              className="p-1 hover:bg-red-100 rounded transition-colors text-red-500"
                                              title="Supprimer l'article"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {phase.tasks.length === 0 && (
                            <div className="text-center py-6 text-gray-400">
                              <p className="text-sm">Aucune tâche dans cette phase</p>
                              <p className="text-xs">Cliquez sur + pour ajouter une tâche</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            
            {phases.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Récapitulatif financier
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/70 rounded-xl p-4 border border-green-200/30">
                    <div className="text-sm text-gray-600 mb-1">Sous-total HT</div>
                    <div className="text-2xl font-bold text-gray-800">{formatCurrency(subtotal)}</div>
                  </div>
                  
                  <div className="bg-white/70 rounded-xl p-4 border border-green-200/30">
                    <div className="text-sm text-gray-600 mb-1 flex items-center justify-between">
                      <span>TVA</span>
                      <input
                        type="number"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-xs bg-transparent border border-gray-300 rounded text-center"
                        min="0"
                        max="100"
                      />
                      <span className="text-xs">%</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{formatCurrency(taxAmount)}</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 border border-green-300/50">
                    <div className="text-sm text-gray-700 mb-1 font-medium">Total TTC</div>
                    <div className="text-3xl font-bold text-green-700">{formatCurrency(totalAmount)}</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes et conditions
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      placeholder="Notes, conditions particulières..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conditions de paiement
                    </label>
                    <textarea
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      placeholder="Conditions de paiement..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pied de page */}
        <div className="bg-gray-50/80 backdrop-blur-sm p-6 border-t border-gray-200/50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              * Champs obligatoires
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleExportPdf}
                className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2"
                title="Exporter en PDF"
              >
                <FileText className="w-5 h-5" />
                <span>Exporter PDF</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!title || !clientName || !clientEmail || isSaving}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
              </button>
            </div>
          </div>
        </div>
        </>
        ) : (
          <div className="flex items-center justify-center py-16 text-gray-600">
            <svg className="animate-spin h-5 w-5 mr-3 text-gray-400" viewBox="0 0 24 24" />
            <span>Chargement du devis…</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteCreatorSimple;
