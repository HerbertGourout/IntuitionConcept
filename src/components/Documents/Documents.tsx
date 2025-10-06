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
import { useProjectDocuments } from '../../hooks/useProjectData';
import { useProjects } from '../../hooks/useProjects';
import EmptyState from '../UI/EmptyState';
import NoProjectSelected from '../UI/NoProjectSelected';
import PageContainer from '../Layout/PageContainer';
import SectionHeader from '../UI/SectionHeader';

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

  const formatDate = (date: string | Date) => {
    return new Date(date as string | number | Date).toLocaleDateString('fr-FR', {
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
                      setIsDropdownOpen(false);
                      onClick();
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                  >
                    <Eye className="w-4 h-4 text-blue-500" />
                    Visualiser
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(false);
                      console.log('Télécharger:', document.name);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                  >
                    <Download className="w-4 h-4 text-green-500" />
                    Télécharger
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(false);
                      navigator.clipboard.writeText(document.url || '#');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                  >
                    <Copy className="w-4 h-4 text-purple-500" />
                    Copier le lien
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(false);
                      console.log('Partager:', document.name);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                  >
                    <Share2 className="w-4 h-4 text-indigo-500" />
                    Partager
                  </button>
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={onDelete}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {document.name}
        </h3>
        
        {document.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {document.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatFileSize(document.size || 0)}</span>
          <span>{formatDate(document.createdAt)}</span>
        </div>
        
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {document.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {document.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{document.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {viewMode === 'list' && (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Visualiser"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
          
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
  const { currentProject } = useProjects();
  const { documents, loading, addDocument } = useProjectDocuments(currentProject?.id || null);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocument, setSelectedDocument] = useState<ServiceDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Si aucun projet n'est sélectionné
  if (!currentProject) {
    return (
      <PageContainer>
        <NoProjectSelected />
      </PageContainer>
    );
  }

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
    
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer définitivement le document :\n\n"${doc.name}"\n\nCette action est irréversible.`;
    
    try {
      const confirmDelete = window.confirm(confirmMessage);
      console.log('UI: Résultat de la confirmation:', confirmDelete);
      
      if (confirmDelete) {
        console.log('UI: Début de la suppression du document:', doc.id);
        await DocumentService.deleteDocument(doc.id);
        console.log(`UI: Document "${doc.name}" supprimé avec succès`);
        
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

  // Filtrage des documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Statistiques
  const stats = {
    total: documents.length,
    photos: documents.filter(d => d.type === 'photo').length,
    plans: documents.filter(d => d.type === 'plan').length,
    contracts: documents.filter(d => d.type === 'contract').length,
    reports: documents.filter(d => d.type === 'report').length,
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm border border-white/20 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Documents
              </h1>
              <p className="text-gray-600 mt-1">
                Projet: {currentProject.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => console.log('Ajouter document')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Upload className="w-5 h-5" />
            Ajouter Document
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-gray-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Total Documents</h3>
        </div>

        <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Image className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-green-600">{stats.photos}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Photos</h3>
        </div>

        <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileCheck className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-blue-600">{stats.plans}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Plans</h3>
        </div>

        <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-purple-600">{stats.contracts}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Contrats</h3>
        </div>

        <div className="glass-card p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-3xl font-bold text-indigo-600">{stats.reports}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">Rapports</h3>
        </div>
      </div>

      {/* Filtres et contrôles */}
      <div className="glass-card p-6 rounded-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtres et Vue</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
          >
            <option value="all">Tous les types</option>
            <option value="photo">Photos</option>
            <option value="plan">Plans</option>
            <option value="contract">Contrats</option>
            <option value="permit">Permis</option>
            <option value="report">Rapports</option>
            <option value="other">Autres</option>
          </select>
        </div>
      </div>

      {/* Liste des documents */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des documents...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucun document"
            description={`Commencez par ajouter votre premier document au projet "${currentProject.name}"`}
            actionLabel="Ajouter un document"
            onAction={() => console.log('Ajouter document')}
          />
        ) : (
          <EmptyState
            icon={Search}
            title="Aucun résultat"
            description="Aucun document ne correspond à vos critères de recherche"
            actionLabel="Réinitialiser les filtres"
            onAction={() => {
              setSearchTerm('');
              setSelectedType('all');
            }}
          />
        )
      ) : (
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Documents ({filteredDocuments.length})
            </h3>
          </div>
          
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
          }`}>
            <AnimatePresence>
              {filteredDocuments.map((doc) => (
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
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </PageContainer>
  );
};

export default Documents;
