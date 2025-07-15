import React, { useState, useContext, useMemo } from 'react';
import { Plus, Search, Filter, Grid, List, X, ChevronDown, ChevronUp } from 'lucide-react';
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
    <div className="p-6 space-y-8">
      {/* Header glassmorphism */}
      <div className="glass-card flex items-center justify-between mb-8 p-8 bg-gradient-to-r from-blue-50/90 to-purple-50/90 shadow-2xl">
        <div className="flex items-center gap-3">
          <Grid className="text-blue-500 w-8 h-8 drop-shadow" />
          <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Documents du projet</h1>
        </div>
        <button
          className="btn-glass bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-105 transition px-6 py-2 rounded-full text-white font-semibold shadow-xl flex items-center gap-2"
          onClick={() => setIsUploadOpen(true)}
        >
          <Plus className="w-5 h-5" /> Ajouter un document
        </button>
      </div>

      {/* Filtres glassmorphism */}
      <div className="glass-card p-6 mb-8 flex flex-wrap gap-4 items-center shadow-lg">
        {/* Champs de recherche, tags, sélecteurs, tous stylisés glassmorphism */}
        <div className="flex flex-wrap gap-4 items-center w-full">
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border-2 border-blue-100 rounded-full px-4 py-2">
            <Search className="w-5 h-5 text-blue-400" />
            <input
              type="text"
              className="bg-transparent outline-none text-blue-900 placeholder:text-blue-300"
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
            {isFiltersOpen ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </button>

          <div className="flex items-center border-l border-gray-200 dark:border-gray-700 ml-2 pl-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="Vue en grille"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="Vue en liste"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Nouveau
          </button>
        </div>
      </div>

      {/* Filtres avancés */}
      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de document</label>
                <select
                  value={filterType}
                  onChange={(e) => handleTypeFilter(e.target.value as 'all' | Document['type'])}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Étiquettes</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 dark:hover:bg-blue-800"
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
                      className="text-sm border-0 focus:ring-0 focus:outline-none bg-transparent text-gray-500 dark:text-gray-400"
                    >
                      <option value="">Ajouter une étiquette</option>
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
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Étiquettes actives */}
      {(selectedTags.length > 0 || searchTerm || filterType !== 'all' || selectedFolder !== 'root') && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Filtres actifs :</span>

          {searchTerm && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              Recherche: "{searchTerm}"
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500 dark:hover:bg-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filterType !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              Type: {documentTypes.find(t => t.value === filterType)?.label}
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500 dark:hover:bg-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {selectedTags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 dark:hover:bg-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div
          className={`grid gap-4 ${
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
          className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucun document trouvé</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || filterType !== 'all' || selectedTags.length > 0
              ? 'Essayez de modifier vos critères de recherche.'
              : 'Commencez par ajouter votre premier document.'}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="-ml-1 mr-2 h-4 w-4" />
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