import React, { useState, useContext, useMemo } from 'react';
import { Plus, Search, Filter, Grid, List, X, ChevronDown, ChevronUp, CheckCircle, Package, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document } from '../../types';
import { Project } from '../../contexts/projectTypes';
import ProjectContext from '../../contexts/ProjectContext';
import DocumentUpload from './DocumentUpload';
import DocumentViewer from './DocumentViewer';
import FolderManager from './FolderManager';
import TagManager from './TagManager';
import ShareModal from './ShareModal';
import ModernDocumentCard from './ModernDocumentCard';

const Documents: React.FC = () => {
  const projectContext = useContext(ProjectContext);

  // Générer des documents temporaires basés sur le projet actuel
  const initialDocuments = projectContext?.currentProject ? generateDocumentsFromProject(projectContext.currentProject) : [];

  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | Document['type']>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('root');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // État de chargement (à utiliser pour les opérations asynchrones futures)
  const [isLoading] = useState(false);

  type DocumentType = Document['type'];
  
  const documentTypes: { value: DocumentType | 'all'; label: string }[] = [
    { value: 'all', label: 'Tous les types' },
    { value: 'plan', label: 'Plans' },
    { value: 'contract', label: 'Contrats' },
    { value: 'permit', label: 'Permis' },
    { value: 'report', label: 'Rapports' },
    { value: 'photo', label: 'Photos' },
    { value: 'other', label: 'Autres' }
  ];

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || doc.type === filterType;
      const matchesProject = filterProject === 'all' || doc.projectId === filterProject;
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => doc.tags?.includes(tag));
      const matchesFolder = selectedFolder === 'root' || doc.folderId === selectedFolder;

      return matchesSearch && matchesType && matchesProject && matchesTags && matchesFolder;
    });
  }, [documents, searchTerm, filterType, filterProject, selectedTags, selectedFolder]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    documents.forEach(doc => {
      doc.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [documents]);

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleDownload = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    // Implémentation du téléchargement
    console.log('Télécharger le document:', doc.name);
  };

  const handleShare = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    setSelectedDocument(doc);
    setIsShareModalOpen(true);
  };



  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const handleTypeFilter = (type: 'all' | Document['type']) => {
    setFilterType(type);
  };



  const handleUpload = (files: File[], metadata: { tags?: string[]; description?: string } = {}) => {
    const newDocuments: Document[] = files.map(file => {
      const fileType = file.type.split('/')[1];
      const docType = (['plan', 'contract', 'permit', 'report', 'photo'].includes(fileType) 
        ? fileType 
        : 'other') as Document['type'];
      
      return {
        id: `doc-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: docType,
        size: file.size,
        uploadDate: new Date().toISOString(),
        projectId: projectContext?.currentProject?.id || '',
        uploadedBy: 'Utilisateur actuel',
        version: '1.0',
        url: '#',
        folderId: selectedFolder,
        tags: metadata.tags || [],
        description: metadata.description || ''
      };
    });

    setDocuments(prev => [...prev, ...newDocuments]);
    setIsUploadOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header principal */}
      <div className="glass-card p-6 mb-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
              <Grid className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Documents
              </h1>
              <p className="text-gray-600 mt-1">Gestion des documents et fichiers du projet</p>
            </div>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Nouveau Document
          </button>
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
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-100/80 to-gray-200/80 backdrop-blur-sm text-gray-700 rounded-xl font-medium hover:from-gray-200/80 hover:to-gray-300/80 hover:scale-105 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              Filtres
              {isFiltersOpen ? (
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
        {isFiltersOpen && (
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
                  value={filterType}
                  onChange={(e) => handleTypeFilter(e.target.value as 'all' | Document['type'])}
                  className="w-full bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                >
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Étiquettes</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 border border-blue-200 backdrop-blur-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-500 hover:bg-blue-500/20 transition-colors duration-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}

                  {availableTags.filter(tag => !selectedTags.includes(tag)).length > 0 && (
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value && !selectedTags.includes(e.target.value)) {
                          setSelectedTags([...selectedTags, e.target.value]);
                        }
                      }}
                      className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">+ Ajouter étiquette</option>
                      {availableTags
                        .filter(tag => !selectedTags.includes(tag))
                        .map(tag => (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        ))
                      }
                    </select>
                  )}
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setFilterProject('all');
                    setSelectedTags([]);
                    setSelectedFolder('root');
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
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
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
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
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
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
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
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white">
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
      {(selectedTags.length > 0 || searchTerm || filterType !== 'all' || selectedFolder !== 'root') && (
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

            {filterType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 border border-purple-200 backdrop-blur-sm">
                Type: {documentTypes.find(t => t.value === filterType)?.label}
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full text-purple-500 hover:bg-purple-500/20 transition-colors duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 border border-blue-200 backdrop-blur-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-500 hover:bg-blue-500/20 transition-colors duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="glass-card p-12 text-center shadow-xl">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-gray-600 font-medium">Chargement des documents...</p>
          </div>
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
        >
          <AnimatePresence>
            {filteredDocuments.map((doc) => (
              <ModernDocumentCard
                key={doc.id}
                document={doc}
                viewMode={viewMode}
                onClick={() => handleDocumentClick(doc)}
                onDownload={(e) => handleDownload(e, doc)}
                onShare={(e) => handleShare(e, doc)}
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
                {searchTerm || filterType !== 'all' || selectedTags.length > 0
                  ? 'Aucun document trouvé'
                  : 'Aucun document'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterType !== 'all' || selectedTags.length > 0
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par ajouter votre premier document au projet.'}
              </p>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Téléverser un document
            </button>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <DocumentUpload 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
        currentFolder={selectedFolder}
      />
      
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onShare={() => setIsShareModalOpen(true)}
        />
      )}
      
      <FolderManager 
        isOpen={isFolderManagerOpen} 
        onClose={() => setIsFolderManagerOpen(false)}
        selectedFolder={selectedFolder}
        onFolderSelect={(folderId: string) => setSelectedFolder(folderId)}
      />
      
      <TagManager 
        isOpen={isTagManagerOpen} 
        onClose={() => setIsTagManagerOpen(false)}
        selectedTags={selectedTags}
        onTagsChange={(tags: string[]) => setSelectedTags(tags)}
      />
      
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        document={selectedDocument!}
      />
    </div>
  );
};

// Fonction utilitaire pour générer des documents temporaires basés sur le projet
const generateDocumentsFromProject = (project: Project): Document[] => {
  const documentTypes: Document['type'][] = ['plan', 'contract', 'permit', 'report', 'photo', 'other'];
  const documents: Document[] = [];

  // Documents de base pour le projet
  documents.push({
    id: `doc-plan-${project.id}`,
    name: `Plan d'exécution - ${project.name}`,
    type: 'plan',
    size: 2500000, // 2.5 MB
    uploadDate: project.startDate,
    projectId: project.id,
    uploadedBy: 'Pierre Dubois',
    version: '1.0',
    url: '#', // URL fictive
    folderId: 'root',
    tags: ['plan', 'exécution'],
    description: `Plan d'exécution pour le projet ${project.name}`
  });

  documents.push({
    id: `doc-contract-${project.id}`,
    name: `Contrat - ${project.name}`,
    type: 'contract',
    size: 1200000, // 1.2 MB
    uploadDate: project.startDate,
    projectId: project.id,
    uploadedBy: 'Pierre Dubois',
    version: '1.0',
    url: '#', // URL fictive
    folderId: 'root',
    tags: ['contrat', 'client'],
    description: `Contrat signé pour le projet ${project.name}`
  });

  // Générer des documents pour chaque phase
  project.phases.forEach((phase, phaseIndex) => {
    // Document pour la phase
    documents.push({
      id: `doc-phase-${phase.id}`,
      name: `Documentation - ${phase.name}`,
      type: 'report',
      size: 800000 + Math.random() * 1000000, // 0.8-1.8 MB
      uploadDate: phase.startDate,
      projectId: project.id,
      uploadedBy: 'Pierre Dubois',
      version: '1.0',
      url: '#', // URL fictive
      folderId: 'phases',
      tags: ['phase', 'documentation'],
      description: `Documentation technique pour la phase ${phase.name}`
    });

    // Documents pour certaines tâches importantes
    phase.tasks.forEach((task, taskIndex) => {
      // Ne pas créer un document pour chaque tâche (trop de documents)
      if (taskIndex % 3 === 0) { // Une tâche sur trois
        const typeIndex = (phaseIndex + taskIndex) % documentTypes.length;
        documents.push({
          id: `doc-task-${task.id}`,
          name: `${documentTypes[typeIndex].charAt(0).toUpperCase() + documentTypes[typeIndex].slice(1)} - ${task.name}`,
          type: documentTypes[typeIndex] as Document['type'],
          size: 500000 + Math.random() * 1500000, // 0.5-2 MB
          uploadDate: task.dueDate || new Date().toISOString().split('T')[0],
          projectId: project.id,
          uploadedBy: 'Pierre Dubois',
          version: '1.0',
          url: '#', // URL fictive
          folderId: 'tasks',
          tags: [documentTypes[typeIndex], 'tâche'],
          description: `Document relatif à la tâche ${task.name}`
        });
      }
    });
  });

  return documents;
};

export default Documents;