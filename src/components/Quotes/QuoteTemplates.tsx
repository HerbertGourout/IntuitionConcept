import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Plus,
    Edit,
    Trash2,
    Copy,
    Search,
    X,
    Building,
    Hammer,
    Wrench,
    Home
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Phase } from '../../types/StructuredQuote';
import { useProjectContext } from '../../contexts/ProjectContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';

interface QuoteTemplate {
    id: string;
    name: string;
    description: string;
    category: 'construction' | 'renovation' | 'extension' | 'infrastructure';
    phases: Phase[];
    estimatedDuration: number; // en jours
    basePrice: number;
    createdAt: string;
    updatedAt: string;
    isDefault?: boolean;
}

interface QuoteTemplatesProps {
    onClose: () => void;
    onSelectTemplate: (template: QuoteTemplate) => void;
}

const QuoteTemplates: React.FC<QuoteTemplatesProps> = ({ onClose, onSelectTemplate }) => {
    const { currentProject } = useProjectContext();
    const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [showEditor, setShowEditor] = useState(false);
    const [editing, setEditing] = useState<QuoteTemplate | null>(null);
    const [form, setForm] = useState<Pick<QuoteTemplate, 'name'|'description'|'category'|'estimatedDuration'|'basePrice'|'phases'>>({
        name: '',
        description: '',
        category: 'construction',
        estimatedDuration: 0,
        basePrice: 0,
        phases: []
    });

    // Templates par défaut pour le BTP (mémoïsé pour éviter les changements de référence)
    const defaultTemplates = useMemo<QuoteTemplate[]>(() => ([
        {
            id: 'template-1',
            name: 'Construction Maison Individuelle',
            description: 'Template complet pour construction de maison individuelle avec gros œuvre et second œuvre',
            category: 'construction',
            estimatedDuration: 180,
            basePrice: 150000000, // 150M FCFA
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDefault: true,
            phases: [
                {
                    id: 'phase-1',
                    name: 'Gros Œuvre',
                    description: 'Fondations, murs, charpente, couverture',
                    tasks: [
                        {
                            id: 'task-1',
                            name: 'Fondations',
                            description: 'Terrassement et coulage des fondations',
                            articles: [
                                {
                                    id: 'article-1',
                                    description: 'Terrassement général',
                                    quantity: 200,
                                    unit: 'm³',
                                    unitPrice: 15000,
                                    totalPrice: 3000000
                                },
                                {
                                    id: 'article-2',
                                    description: 'Béton pour fondations',
                                    quantity: 50,
                                    unit: 'm³',
                                    unitPrice: 120000,
                                    totalPrice: 6000000
                                }
                            ],
                            totalPrice: 9000000,
                            expanded: false
                        }
                    ],
                    totalPrice: 9000000,
                    expanded: false
                }
            ]
        },
        {
            id: 'template-2',
            name: 'Rénovation Appartement',
            description: 'Template pour rénovation complète d\'appartement',
            category: 'renovation',
            estimatedDuration: 60,
            basePrice: 25000000, // 25M FCFA
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDefault: true,
            phases: [
                {
                    id: 'phase-1',
                    name: 'Démolition et Préparation',
                    description: 'Démolition des cloisons et préparation des surfaces',
                    tasks: [
                        {
                            id: 'task-1',
                            name: 'Démolition cloisons',
                            description: 'Démolition des cloisons non porteuses',
                            articles: [
                                {
                                    id: 'article-1',
                                    description: 'Démolition cloisons',
                                    quantity: 50,
                                    unit: 'm²',
                                    unitPrice: 8000,
                                    totalPrice: 400000
                                }
                            ],
                            totalPrice: 400000,
                            expanded: false
                        }
                    ],
                    totalPrice: 400000,
                    expanded: false
                }
            ]
        },
        {
            id: 'template-3',
            name: 'Extension Maison',
            description: 'Template pour extension de maison existante',
            category: 'extension',
            estimatedDuration: 90,
            basePrice: 45000000, // 45M FCFA
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDefault: true,
            phases: [
                {
                    id: 'phase-1',
                    name: 'Raccordement',
                    description: 'Raccordement à l\'existant',
                    tasks: [
                        {
                            id: 'task-1',
                            name: 'Ouverture mur existant',
                            description: 'Création d\'ouverture dans le mur existant',
                            articles: [
                                {
                                    id: 'article-1',
                                    description: 'Ouverture mur porteur',
                                    quantity: 1,
                                    unit: 'u',
                                    unitPrice: 500000,
                                    totalPrice: 500000
                                }
                            ],
                            totalPrice: 500000,
                            expanded: false
                        }
                    ],
                    totalPrice: 500000,
                    expanded: false
                }
            ]
        }
    ]), []);

    useEffect(() => {
        // Si pas de projet sélectionné, fallback aux templates par défaut
        if (!currentProject?.id) {
            setTemplates(defaultTemplates);
            return;
        }

        // Abonnement Firestore aux templates du projet courant
        const q = query(
            collection(db, 'quoteTemplates'),
            where('projectId', '==', currentProject.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<QuoteTemplate, 'id'>) }));
            if (items.length === 0) {
                // Fallback: afficher les templates par défaut en mémoire
                setTemplates(defaultTemplates);
            } else {
                setTemplates(items as QuoteTemplate[]);
            }
        }, (error) => {
            console.error('Erreur chargement templates devis:', error);
            setTemplates(defaultTemplates);
        });

        return () => unsubscribe();
    }, [currentProject?.id, defaultTemplates]);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'construction': return <Building className="w-5 h-5 text-blue-500" />;
            case 'renovation': return <Hammer className="w-5 h-5 text-orange-500" />;
            case 'extension': return <Home className="w-5 h-5 text-green-500" />;
            case 'infrastructure': return <Wrench className="w-5 h-5 text-purple-500" />;
            default: return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'construction': return 'Construction';
            case 'renovation': return 'Rénovation';
            case 'extension': return 'Extension';
            case 'infrastructure': return 'Infrastructure';
            default: return category;
        }
    };

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            template.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleDuplicateTemplate = async (template: QuoteTemplate) => {
        try {
            if (!currentProject?.id) {
                toast.error('Aucun projet sélectionné');
                return;
            }
            const payload = {
                name: `${template.name} (Copie)`,
                description: template.description,
                category: template.category,
                phases: template.phases,
                estimatedDuration: template.estimatedDuration,
                basePrice: template.basePrice,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isDefault: false,
                projectId: currentProject.id,
            };
            await addDoc(collection(db, 'quoteTemplates'), payload);
            toast.success('Template dupliqué avec succès');
        } catch (e) {
            console.error('Erreur duplication template:', e);
            toast.error('Erreur lors de la duplication');
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template?.isDefault) {
            toast.error('Impossible de supprimer un template par défaut');
            return;
        }
        if (!currentProject?.id) {
            toast.error('Aucun projet sélectionné');
            return;
        }
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
            try {
                await deleteDoc(doc(db, 'quoteTemplates', templateId));
                toast.success('Template supprimé');
            } catch (e) {
                console.error('Erreur suppression template:', e);
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-white/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Templates de Devis</h2>
                                <p className="text-blue-100">Choisissez un modèle pour créer votre devis rapidement</p>
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

                {/* Filtres et recherche */}
                <div className="p-6 border-b border-gray-200/50">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Rechercher un template..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Toutes catégories</option>
                                <option value="construction">Construction</option>
                                <option value="renovation">Rénovation</option>
                                <option value="extension">Extension</option>
                                <option value="infrastructure">Infrastructure</option>
                            </select>
                            <button
                                onClick={() => {
                                    setEditing(null);
                                    setForm({ name: '', description: '', category: 'construction', estimatedDuration: 0, basePrice: 0, phases: [] });
                                    setShowEditor(true);
                                }}
                                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
                            >
                                <Plus className="w-4 h-4" />
                                Nouveau Template
                            </button>
                        </div>
                    </div>
                </div>

                {/* Liste des templates */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {filteredTemplates.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun template trouvé</h3>
                            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTemplates.map((template) => (
                                <motion.div
                                    key={template.id}
                                    className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    {/* Header de la carte */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {getCategoryIcon(template.category)}
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
                                                    {template.name}
                                                </h3>
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                    {getCategoryLabel(template.category)}
                                                </span>
                                            </div>
                                        </div>
                                        {template.isDefault && (
                                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                                Défaut
                                            </span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {template.description}
                                    </p>

                                    {/* Informations */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Prix de base:</span>
                                            <span className="font-semibold text-green-600">
                                                {formatCurrency(template.basePrice)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Durée estimée:</span>
                                            <span className="font-semibold">
                                                {template.estimatedDuration} jours
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Phases:</span>
                                            <span className="font-semibold">
                                                {template.phases.length} phase{template.phases.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onSelectTemplate(template)}
                                            className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all text-sm font-medium"
                                        >
                                            Utiliser
                                        </button>
                                        <button
                                            onClick={() => handleDuplicateTemplate(template)}
                                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            title="Dupliquer"
                                        >
                                            <Copy className="w-4 h-4 text-gray-600" />
                                        </button>
                                        {!template.isDefault && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setEditing(template);
                                                        setForm({
                                                            name: template.name,
                                                            description: template.description,
                                                            category: template.category,
                                                            estimatedDuration: template.estimatedDuration,
                                                            basePrice: template.basePrice,
                                                            phases: template.phases
                                                        });
                                                        setShowEditor(true);
                                                    }}
                                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTemplate(template.id)}
                                                    className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Editeur simple de template */}
                {showEditor && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
                        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">{editing ? 'Modifier le template' : 'Nouveau template'}</h3>
                                <button onClick={() => setShowEditor(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <input value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} placeholder="Nom" className="w-full px-3 py-2 border rounded-lg" />
                                <textarea value={form.description} onChange={e=>setForm(f=>({...f, description:e.target.value}))} placeholder="Description" className="w-full px-3 py-2 border rounded-lg" rows={3} />
                                <div className="grid grid-cols-2 gap-3">
                                    <select value={form.category} onChange={e=>setForm(f=>({...f, category:e.target.value as QuoteTemplate['category']}))} className="px-3 py-2 border rounded-lg">
                                        <option value="construction">Construction</option>
                                        <option value="renovation">Rénovation</option>
                                        <option value="extension">Extension</option>
                                        <option value="infrastructure">Infrastructure</option>
                                    </select>
                                    <input type="number" value={form.estimatedDuration} onChange={e=>setForm(f=>({...f, estimatedDuration:Number(e.target.value)}))} placeholder="Durée (jours)" className="px-3 py-2 border rounded-lg" />
                                    <input type="number" value={form.basePrice} onChange={e=>setForm(f=>({...f, basePrice:Number(e.target.value)}))} placeholder="Prix de base" className="px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-5">
                                <button onClick={()=>setShowEditor(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
                                <button
                                  onClick={async ()=>{
                                    try{
                                      if(!currentProject?.id){ toast.error('Aucun projet sélectionné'); return; }
                                      if(!form.name.trim()){ toast.error('Nom requis'); return; }
                                      if(editing){
                                        const ref = doc(db,'quoteTemplates', editing.id);
                                        await updateDoc(ref, { 
                                          name: form.name,
                                          description: form.description,
                                          category: form.category,
                                          estimatedDuration: form.estimatedDuration,
                                          basePrice: form.basePrice,
                                          phases: form.phases,
                                          updatedAt: serverTimestamp()
                                        });
                                        toast.success('Template mis à jour');
                                      } else {
                                        await addDoc(collection(db,'quoteTemplates'), {
                                          name: form.name,
                                          description: form.description,
                                          category: form.category,
                                          estimatedDuration: form.estimatedDuration,
                                          basePrice: form.basePrice,
                                          phases: form.phases,
                                          projectId: currentProject.id,
                                          createdAt: serverTimestamp(),
                                          updatedAt: serverTimestamp(),
                                          isDefault: false
                                        });
                                        toast.success('Template créé');
                                      }
                                      setShowEditor(false);
                                    }catch(e){
                                      console.error(e);
                                      toast.error('Erreur lors de l\'enregistrement');
                                    }
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                                >
                                  Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default QuoteTemplates;
