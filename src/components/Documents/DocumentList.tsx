import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image, File, Search, Filter, ChevronDown, ChevronUp, ChevronsLeft, ChevronsRight, FileUp, Grid, List, ChevronLeft, ChevronRight, X, Download, Share2, Eye, Calendar, User, Trash2 } from 'lucide-react';
import { Document } from '../../types';
import ModernButton from '../UI/ModernButton';

interface DocumentListProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  onDocumentShare: (document: Document) => void;
  onDocumentUpload: () => void;
  onDocumentDelete?: (document: Document) => void;
  onDocumentEdit?: (document: Document) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  onDocumentSelect, 
  onDocumentShare,
  onDocumentUpload,
  onDocumentDelete,
  onDocumentEdit
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<{field: string, direction: 'asc' | 'desc'}>({
    field: 'uploadDate', 
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  // Types de documents avec icônes et couleurs
  const documentTypes = useMemo(() => [
    { id: 'all', label: 'Tous les types', icon: <File className="w-4 h-4" /> },
    { id: 'plan', label: 'Plans', icon: <FileText className="w-4 h-4 text-blue-500" /> },
    { id: 'contract', label: 'Contrats', icon: <FileText className="w-4 h-4 text-purple-500" /> },
    { id: 'permit', label: 'Permis', icon: <FileText className="w-4 h-4 text-green-500" /> },
    { id: 'report', label: 'Rapports', icon: <FileText className="w-4 h-4 text-yellow-500" /> },
    { id: 'photo', label: 'Photos', icon: <Image className="w-4 h-4 text-pink-500" /> },
    { id: 'other', label: 'Autres', icon: <File className="w-4 h-4 text-gray-500" /> },
  ], []);

  // Récupération des tags uniques depuis les documents
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    documents.forEach(doc => {
      if (doc.tags) {
        doc.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [documents]);

  // Filtrage et tri des documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Filtre par recherche
      const matchesSearch = searchQuery === '' || 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filtre par type
      const matchesType = selectedType === 'all' || doc.type === selectedType;
      
      // Filtre par tags
      const matchesTags = selectedTags.length === 0 || 
        (doc.tags && selectedTags.every(tag => doc.tags?.includes(tag)));
      
      return matchesSearch && matchesType && matchesTags;
    }).sort((a, b) => {
      // Tri
      if (sortBy.field === 'name') {
        return sortBy.direction === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy.field === 'uploadDate') {
        const dateA = new Date(a.uploadDate).getTime();
        const dateB = new Date(b.uploadDate).getTime();
        return sortBy.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy.field === 'size') {
        return sortBy.direction === 'asc' 
          ? (a.size || 0) - (b.size || 0)
          : (b.size || 0) - (a.size || 0);
      }
      return 0;
    });
  }, [documents, searchQuery, selectedType, selectedTags, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

  // Gestion de la sélection des documents
  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  // Gestion des tags sélectionnés
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Gestion du tri
  const handleSort = (field: string) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Fonction utilitaire pour formater la taille d'un fichier de manière lisible
  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Formatage de la date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (isNaN(diffInDays)) return dateString;
      
      if (diffInDays === 0) return "Aujourd'hui";
      if (diffInDays === 1) return 'Hier';
      if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
      
      const options: Intl.DateTimeFormatOptions = {
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        month: 'short',
        day: 'numeric'
      };
      
      return date.toLocaleDateString('fr-FR', options);
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return dateString;
    }
  };

  // Fonction utilitaire pour obtenir une icône en fonction du type de document
  const getDocumentIcon = (type: string, name: string, className = 'w-5 h-5'): JSX.Element => {
    const extension = name.split('.').pop()?.toLowerCase() || '';
    const iconClass = `${className} `;
    
    // Mappage des extensions aux icônes et couleurs
    const iconMap: Record<string, { icon: JSX.Element; color: string }> = {
      // Images
      jpg: { icon: <Image className={iconClass} />, color: 'text-blue-400' },
      jpeg: { icon: <Image className={iconClass} />, color: 'text-blue-400' },
      png: { icon: <Image className={iconClass} />, color: 'text-blue-400' },
      gif: { icon: <Image className={iconClass} />, color: 'text-blue-400' },
      svg: { icon: <Image className={iconClass} />, color: 'text-blue-400' },
      webp: { icon: <Image className={iconClass} />, color: 'text-blue-400' },
      
      // Documents
      pdf: { icon: <FileText className={iconClass} />, color: 'text-red-500' },
      doc: { icon: <FileText className={iconClass} />, color: 'text-blue-600' },
      docx: { icon: <FileText className={iconClass} />, color: 'text-blue-600' },
      odt: { icon: <FileText className={iconClass} />, color: 'text-blue-600' },
      
      // Feuilles de calcul
      xls: { icon: <FileText className={iconClass} />, color: 'text-green-600' },
      xlsx: { icon: <FileText className={iconClass} />, color: 'text-green-600' },
      ods: { icon: <FileText className={iconClass} />, color: 'text-green-600' },
      csv: { icon: <FileText className={iconClass} />, color: 'text-green-600' },
      
      // Présentations
      ppt: { icon: <File className={iconClass} />, color: 'text-orange-500' },
      pptx: { icon: <File className={iconClass} />, color: 'text-orange-500' },
      odp: { icon: <File className={iconClass} />, color: 'text-orange-500' },
      
      // Archives
      zip: { icon: <File className={iconClass} />, color: 'text-yellow-500' },
      rar: { icon: <File className={iconClass} />, color: 'text-yellow-500' },
      '7z': { icon: <File className={iconClass} />, color: 'text-yellow-500' },
      tar: { icon: <File className={iconClass} />, color: 'text-yellow-500' },
      gz: { icon: <File className={iconClass} />, color: 'text-yellow-500' },
      
      // Médias
      mp4: { icon: <File className={iconClass} />, color: 'text-purple-500' },
      avi: { icon: <File className={iconClass} />, color: 'text-purple-500' },
      mov: { icon: <File className={iconClass} />, color: 'text-purple-500' },
      wmv: { icon: <File className={iconClass} />, color: 'text-purple-500' },
      mkv: { icon: <File className={iconClass} />, color: 'text-purple-500' },
      mp3: { icon: <File className={iconClass} />, color: 'text-pink-500' },
      wav: { icon: <File className={iconClass} />, color: 'text-pink-500' },
      ogg: { icon: <File className={iconClass} />, color: 'text-pink-500' },
      flac: { icon: <File className={iconClass} />, color: 'text-pink-500' },
    };
    
    // Vérifier d'abord l'extension
    if (extension && iconMap[extension]) {
      const { icon, color } = iconMap[extension];
      return <span className={color}>{icon}</span>;
    }
    
    // Vérifier le type
    const typeLower = type.toLowerCase();
    if (typeLower && iconMap[typeLower]) {
      const { icon, color } = iconMap[typeLower];
      return <span className={color}>{icon}</span>;
    }
    
    // Type/extension inconnu(e)
    return <File className={`${iconClass} text-gray-400`} />;
  };

  // Fonction utilitaire pour obtenir le libellé d'un type de document
  const getTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      // Images
      jpg: 'Image',
      jpeg: 'Image',
      png: 'Image',
      gif: 'Image',
      svg: 'Image vectorielle',
      webp: 'Image WebP',
      
      // Documents
      pdf: 'Document PDF',
      doc: 'Document Word',
      docx: 'Document Word',
      odt: 'Document OpenDocument',
      
      // Feuilles de calcul
      xls: 'Feuille de calcul Excel',
      xlsx: 'Feuille de calcul Excel',
      ods: 'Feuille de calcul OpenDocument',
      csv: 'Fichier CSV',
      
      // Présentations
      ppt: 'Présentation PowerPoint',
      pptx: 'Présentation PowerPoint',
      odp: 'Présentation OpenDocument',
      
      // Archives
      zip: 'Archive ZIP',
      rar: 'Archive RAR',
      '7z': 'Archive 7-Zip',
      tar: 'Archive TAR',
      gz: 'Archive GZIP',
      
      // Médias
      mp4: 'Vidéo MP4',
      avi: 'Vidéo AVI',
      mov: 'Vidéo QuickTime',
      wmv: 'Vidéo Windows Media',
      mkv: 'Vidéo Matroska',
      mp3: 'Fichier audio MP3',
      wav: 'Fichier audio WAV',
      ogg: 'Fichier audio OGG',
      flac: 'Fichier audio FLAC',
      
      // Autres
      txt: 'Fichier texte',
      rtf: 'Document texte formaté',
      json: 'Fichier JSON',
      xml: 'Fichier XML',
      html: 'Document HTML',
      css: 'Feuille de style CSS',
      js: 'Fichier JavaScript',
      ts: 'Fichier TypeScript',
      py: 'Script Python',
      java: 'Fichier Java',
      c: 'Fichier C',
      cpp: 'Fichier C++',
      cs: 'Fichier C#',
      php: 'Script PHP',
      sql: 'Fichier SQL',
      md: 'Document Markdown'
    };
    
    const typeLower = type.toLowerCase();
    return typeMap[typeLower] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Composant pour l'icône de tri
  const SortIcon = ({ 
    field, 
    currentField, 
    currentDirection 
  }: { 
    field: string; 
    currentField: string | null; 
    currentDirection: 'asc' | 'desc';
  }) => {
    if (field !== currentField) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    
    return currentDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-500" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-500" />
    );
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* En-tête avec recherche et filtres */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher des documents..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <ModernButton
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </ModernButton>
            
            <div className="hidden md:flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                title="Vue grille"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                title="Vue liste"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            <ModernButton
              onClick={onDocumentUpload}
              variant="primary"
              size="sm"
              className="whitespace-nowrap"
            >
              <FileUp className="h-4 w-4 mr-1" />
              Ajouter
            </ModernButton>
          </div>
        </div>
        
        {/* Filtres avancés */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filtrer par :</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de document</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-1">
                      {documentTypes.map(type => (
                        <label key={type.id} className="flex items-center space-x-2 text-sm">
                          <input
                            type="radio"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            checked={selectedType === type.id}
                            onChange={() => setSelectedType(type.id)}
                          />
                          <span className="text-gray-700 dark:text-gray-300">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Étiquettes</label>
                    <div className="max-h-40 overflow-y-auto p-1 border border-gray-200 dark:border-gray-700 rounded-md">
                      {allTags.length > 0 ? (
                        allTags.map(tag => (
                          <div key={tag} className="flex items-center">
                            <input
                              id={`tag-${tag}`}
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={selectedTags.includes(tag)}
                              onChange={() => toggleTag(tag)}
                            />
                            <label htmlFor={`tag-${tag}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              {tag}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">Aucune étiquette disponible</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trier par</label>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleSort('name')}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between ${sortBy.field === 'name' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      >
                        <span>Nom</span>
                        <SortIcon field="name" currentField={sortBy.field} currentDirection={sortBy.direction} />
                      </button>
                      <button
                        onClick={() => handleSort('uploadDate')}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between ${sortBy.field === 'uploadDate' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      >
                        <span>Date d'ajout</span>
                        <SortIcon field="uploadDate" currentField={sortBy.field} currentDirection={sortBy.direction} />
                      </button>
                      <button
                        onClick={() => handleSort('size')}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between ${sortBy.field === 'size' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      >
                        <span>Taille</span>
                        <SortIcon field="size" currentField={sortBy.field} currentDirection={sortBy.direction} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {(selectedType !== 'all' || selectedTags.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedType('all');
                        setSelectedTags([]);
                      }}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Réinitialiser les filtres
                    </button>
                    {selectedType !== 'all' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {documentTypes.find(t => t.id === selectedType)?.label || selectedType}
                        <button
                          onClick={() => setSelectedType('all')}
                          className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 dark:hover:bg-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedTags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {tag}
                        <button
                          onClick={() => toggleTag(tag)}
                          className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 dark:hover:bg-indigo-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* En-tête de la liste avec actions groupées */}
      {selectedDocuments.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 border-b border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedDocuments.length} {selectedDocuments.length > 1 ? 'documents sélectionnés' : 'document sélectionné'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  // Implémenter l'action de téléchargement groupé
                  console.log('Télécharger les documents sélectionnés:', selectedDocuments);
                }}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-blue-300 dark:hover:bg-gray-600"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Télécharger
              </button>
              <button
                onClick={() => {
                  // Implémenter l'action de partage groupé
                  console.log('Partager les documents sélectionnés:', selectedDocuments);
                }}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-blue-300 dark:hover:bg-gray-600"
              >
                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                Partager
              </button>
              <button
                onClick={() => setSelectedDocuments([])}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des documents */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={selectedDocuments.length > 0 && selectedDocuments.length === paginatedDocuments.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDocuments(paginatedDocuments.map(doc => doc.id));
                    } else {
                      setSelectedDocuments([]);
                    }
                  }}
                />
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  <span>Nom</span>
                  <SortIcon field="name" currentField={sortBy.field} currentDirection={sortBy.direction} />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => handleSort('size')}
              >
                <div className="flex items-center">
                  <span>Taille</span>
                  <SortIcon field="size" currentField={sortBy.field} currentDirection={sortBy.direction} />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => handleSort('uploadDate')}
              >
                <div className="flex items-center">
                  <span>Modifié</span>
                  <SortIcon field="uploadDate" currentField={sortBy.field} currentDirection={sortBy.direction} />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Par
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tags
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedDocuments.length > 0 ? (
              paginatedDocuments.map((document) => (
                <motion.tr 
                  key={document.id} 
                className={`group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  selectedDocuments.includes(document.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedDocuments.includes(document.id)}
                      onChange={() => toggleDocumentSelection(document.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap cursor-pointer"
                  onClick={() => onDocumentSelect(document)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 mr-3">
                      {getDocumentIcon(document.type, document.name, 'w-5 h-5')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {document.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Version {document.version}
                      </p>
                    </div>
                    {document.shared && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Partagé
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {getTypeLabel(document.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {formatFileSize(document.size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1.5" />
                    {formatDate(document.uploadDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-1.5" />
                    <span className="truncate max-w-[120px]">{document.uploadedBy}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {document.tags && document.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {document.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full dark:bg-indigo-900/30 dark:text-indigo-200"
                        >
                          {tag}
                        </span>
                      ))}
                      {document.tags.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full dark:bg-gray-700 dark:text-gray-300">
                          +{document.tags.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1">
                    <div className="relative group">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDocumentSelect(document);
                        }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-700"
                        title="Aperçu"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <div className="hidden group-hover:flex flex-col absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-10 border border-gray-200 dark:border-gray-700">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDocumentShare(document);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Partager</span>
                        </button>
                        <a
                          href={document.url}
                          download={document.name}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="w-4 h-4" />
                          <span>Télécharger</span>
                        </a>
                        {onDocumentEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDocumentEdit(document);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Modifier</span>
                          </button>
                        )}
                        {onDocumentDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
                                onDocumentDelete(document);
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Supprimer</span>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <a
                      href={document.url}
                      download={document.name}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-700"
                      title="Télécharger"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <FileText className="h-12 w-12 mb-2 opacity-40" />
                    <p className="text-sm font-medium">Aucun document trouvé</p>
                    <p className="text-xs mt-1">Essayez de modifier vos filtres de recherche</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredDocuments.length)}
                </span>{' '}
                sur <span className="font-medium">{filteredDocuments.length}</span> documents
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Première page</span>
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Précédent</span>
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Pages */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Afficher les pages autour de la page actuelle
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  // Ne pas dépasser le nombre total de pages
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Suivant</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Dernière page</span>
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DocumentList;