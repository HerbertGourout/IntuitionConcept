import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Image, 
  FileCheck, 
  Receipt, 
  BarChart3, 
  File, 
  Search, 
  Filter, 
  Upload, 
  MoreVertical,
  Eye,
  Download,
  Copy,
  Share2,
  Trash2,
  Grid,
  List,
  X,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Package,
  Activity
} 
from 'lucide-react';
import DocumentViewer from './DocumentViewer';
import { DocumentService, Document as ServiceDocument } from '../../services/documentService';

// Composant DocumentCard moderne
interface ModernDocumentCardProps {
  document: ServiceDocument;
  viewMode: 'grid' | 'list';
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ModernDocumentCard: React.FC<ModernDocumentCardProps> = ({ 
  document, 
  viewMode, 
  onClick, 
  onDelete 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: Event) => {
      const target = event.target as Element;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    // Utiliser window.document avec le bon typage
    if (typeof window !== 'undefined' && window.document) {
      window.document.addEventListener('mousedown', handleClickOutside);
      return () => {
        window.document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  const getDocumentIcon = (type: ServiceDocument['type']) => {
    switch (type) {
      case 'photo': return <Image className="w-6 h-6" />;
      case 'plan': return <FileCheck className="w-6 h-6" />;
      case 'contract': return <FileText className="w-6 h-6" />;
      case 'permit': return <Receipt className="w-6 h-6" />;
      case 'report': return <BarChart3 className="w-6 h-6" />;
      default: return <File className="w-6 h-6" />;
    }
  };

  const getDocumentColor = (type: ServiceDocument['type']) => {
    switch (type) {
      case 'photo': return 'from-green-500 to-emerald-500';
      case 'plan': return 'from-blue-500 to-cyan-500';
      case 'contract': return 'from-purple-500 to-pink-500';
      case 'permit': return 'from-orange-500 to-red-500';
      case 'report': return 'from-indigo-500 to-purple-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`glass-card p-6 cursor-pointer hover:shadow-xl transition-all duration-300 ${
        viewMode === 'list' ? 'flex items-center space-x-4' : 'space-y-4'
      }`}
      onClick={onClick}
    >
      <div className={`flex items-center ${viewMode === 'list' ? 'space-x-4' : 'justify-between'}`}>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${getDocumentColor(document.type)} text-white`}>
          {getDocumentIcon(document.type)}
        </div>
        
        {viewMode === 'grid' && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Plus d'options"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Visualiser</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Télécharger:', document.name);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(document.url);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copier le lien</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Partager:', document.name);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Partager</span>
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={(e) => {
                      onDelete(e);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      <div className={viewMode === 'list' ? 'flex-1' : ''}>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{document.name}</h3>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <span>{formatFileSize(document.size)}</span>
          <span>•</span>
          <span>{formatDate(document.uploadDate)}</span>
        </div>
        
        {document.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{document.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2">
          {document.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {document.tags && document.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{document.tags.length - 3}
            </span>
          )}
        </div>
      </div>
      
      {viewMode === 'list' && (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Télécharger:', document.name);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Télécharger"
          >
            <Download className="w-4 h-4 text-gray-500" />
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-200"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocument, setSelectedDocument] = useState<ServiceDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger les documents depuis Firebase
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        
        // Charger les documents
        const docs = await DocumentService.getAllDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error('Erreur lors du chargement des documents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();

    // Écouter les changements en temps réel
    const unsubscribe = DocumentService.subscribeToDocuments((docs) => {
      setDocuments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDocumentClick = (doc: ServiceDocument) => {
    setSelectedDocument(doc);
  };

  const handleDelete = async (e: React.MouseEvent, doc: ServiceDocument) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('UI: Tentative de suppression du document:', {
      id: doc.id,
      name: doc.name,
      type: doc.type
    });
    
    // Utiliser une confirmation personnalisée pour éviter les problèmes de popup
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer définitivement le document :\n\n"${doc.name}"\n\nCette action est irréversible.`;
    
    try {
      const confirmDelete = window.confirm(confirmMessage);
      console.log('UI: Résultat de la confirmation:', confirmDelete);
      
      if (confirmDelete) {
        console.log('UI: Début de la suppression du document:', doc.id);
        await DocumentService.deleteDocument(doc.id);
        console.log(`UI: Document "${doc.name}" supprimé avec succès`);
        
        // Notification de succès
        alert(`Document "${doc.name}" supprimé avec succès.`);
      } else {
        console.log('UI: Suppression annulée par l\'utilisateur');
      }
    } catch (error) {
      console.error('UI: Erreur lors de la suppression du document:', {
        documentId: doc.id,
        documentName: doc.name,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`Erreur lors de la suppression du document: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="glass-card p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
              <p className="text-gray-600 mt-1">Gérez vos documents de projet ({documents.length} documents)</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>Télécharger</span>
          </motion.button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="glass-card p-6 mb-6 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Recherche */}
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 min-w-80">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              className="bg-transparent outline-none text-gray-700 placeholder:text-gray-400 flex-1"
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Bouton Filtres */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-100/80 to-gray-200/80 backdrop-blur-sm text-gray-700 rounded-xl font-medium hover:from-gray-200/80 hover:to-gray-300/80 hover:scale-105 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              Filtres
              {isDropdownOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Sélecteur de vue */}
            <div className="flex items-center bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                    : 'text-gray-500 hover:bg-white/50'
                }`}
                title="Vue en grille"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                    : 'text-gray-500 hover:bg-white/50'
                }`}
                title="Vue en liste"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres avancés */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6 glass-card p-6 shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de document</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                >
                  <option value="all">Tous les types</option>
                  <option value="plan">Plans</option>
                  <option value="contract">Contrats</option>
                  <option value="permit">Permis</option>
                  <option value="report">Rapports</option>
                  <option value="photo">Photos</option>
                  <option value="other">Autres</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Étiquettes</label>
                <div className="flex flex-wrap gap-2">
                  {/* Étiquettes */}
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-500/10 to-pink-500/10 text-red-600 rounded-lg font-medium hover:from-red-500/20 hover:to-pink-500/20 hover:scale-105 transition-all duration-200"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="glass-card p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-800">{documents.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Plans</p>
              <p className="text-2xl font-bold text-gray-800">{documents.filter(d => d.type === 'plan').length}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Contrats</p>
              <p className="text-2xl font-bold text-gray-800">{documents.filter(d => d.type === 'contract').length}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Rapports</p>
              <p className="text-2xl font-bold text-gray-800">{documents.filter(d => d.type === 'report').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres actifs */}
      {(searchTerm || selectedType !== 'all') && (
        <div className="glass-card p-4 mb-6 shadow-lg">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtres actifs :
            </span>

            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-700 border border-gray-200 backdrop-blur-sm">
                Recherche: "{searchTerm}"
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full text-gray-500 hover:bg-gray-500/20 transition-colors duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 border border-purple-200 backdrop-blur-sm">
                Type: {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                <button
                  type="button"
                  onClick={() => setSelectedType('all')}
                  className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full text-purple-500 hover:bg-purple-500/20 transition-colors duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {documents.length > 0 ? (
        <div
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
        >
          <AnimatePresence>
            {documents
              .filter(doc => {
                const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesType = selectedType === 'all' || doc.type === selectedType;

                return matchesSearch && matchesType;
              })
              .map((doc) => (
                <ModernDocumentCard
                  key={doc.id}
                  document={doc}
                  viewMode={viewMode}
                  onClick={() => handleDocumentClick(doc)}
                  onDelete={(e) => handleDelete(e, doc)}
                />
              ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-16 text-center shadow-xl"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="p-6 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100">
              <Grid className="w-16 h-16 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {searchTerm || selectedType !== 'all'
                  ? 'Aucun document trouvé'
                  : 'Aucun document'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedType !== 'all'
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par ajouter votre premier document au projet.'}
              </p>
            </div>
            <button
              onClick={() => {
                // Télécharger un document
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Upload className="w-5 h-5" />
              <span>Télécharger</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onShare={() => {
            // Fonction de partage à implémenter
            console.log('Partage du document:', selectedDocument.name);
          }}
        />
      )}
    </div>
  );
};



export default Documents;