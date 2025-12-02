import React, { useState } from 'react';
import { Plus, Search, Grid, List, Building2, Filter, TrendingUp } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { useProjects } from '../../hooks/useProjects';
import CreateProjectModal from './CreateProjectModal';
import CleanDuplicatesButton from '../Admin/CleanDuplicatesButton';

import { useToast } from '../../hooks/useToast';
import type { Project } from '../../contexts/projectTypes';
import PageContainer from '../Layout/PageContainer';
import SectionHeader from '../UI/SectionHeader';

const Projects: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { projects, loadingProjects, addProject, setCurrentProject } = useProjects();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { success } = useToast();

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'phases' | 'spent'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(), // Génération d'un ID temporaire
      phases: [],
      spent: 0,
      // DÉVELOPPEMENT: Valeurs par défaut simples
      manager: projectData.manager || 'Développeur',
      team: projectData.team || []
    };
    const newProjectId = await addProject(newProject);
    // Sélectionner automatiquement le nouveau projet créé
    setCurrentProject(newProjectId);
    success('Projet créé', 'Le nouveau projet a été créé avec succès');
    setIsCreateModalOpen(false);
  };

  // Fonction utilitaire pour convertir le statut au format attendu par le filtre
  const getFilterStatus = (status: string): string => {
    switch (status) {
      case 'in_progress': return 'in-progress';
      case 'on_hold': return 'on-hold';
      default: return status;
    }
  };

  const filteredProjects = (projects || []).filter((project) => {
    if (project?.status === 'archived') return false;
    if (!project) return false;
    // DÉVELOPPEMENT: Pas de filtrage d'authentification
    const statusToFilter = getFilterStatus(project.status || '');
    const matchesStatus = filterStatus === 'all' || statusToFilter === filterStatus;
    const matchesSearch = (project.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusOptions = [
    { value: 'all', label: 'Tous les projets' },
    { value: 'planning', label: 'Planification' },
    { value: 'in-progress', label: 'En cours' },
    { value: 'completed', label: 'Terminés' },
    { value: 'on-hold', label: 'En attente' },
    { value: 'cancelled', label: 'Annulés' }
  ];

  return (
    <PageContainer className="space-y-6">
        {/* Header avec design moderne */}
        <div className="card-gradient p-6 rounded-xl animate-slideInUp">
          <SectionHeader
            icon={<Building2 className="w-8 h-8 text-glow" />}
            title={(
              <span className="heading-2 text-shimmer flex items-center gap-2">
                Projets <TrendingUp className="w-6 h-6 text-success animate-pulse" />
              </span>
            )}
            subtitle="Gérez et supervisez tous vos projets BTP"
            actions={(
              <button
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Nouveau Projet
              </button>
            )}
          />
        </div>

        {/* Filtres avec design moderne */}
        <div className="card-glass p-6 rounded-xl animate-slideInUp" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-glow" />
            <h3 className="heading-4 text-shimmer">Filtres et recherche</h3>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input form-input-gradient pl-12 pr-4 py-3 w-full sm:w-80"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select form-input-gradient px-4 py-3"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'text-muted hover:text-primary hover:bg-glass'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'text-muted hover:text-primary hover:bg-glass'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List avec design moderne */}
        {projects.length === 0 ? (
          <div className="card-glass p-12 rounded-xl text-center animate-slideInUp" style={{animationDelay: '0.2s'}}>
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-secondary rounded-full flex items-center justify-center animate-glow">
              <Building2 className="w-16 h-16 text-white" />
            </div>
            <h2 className="heading-2 text-shimmer mb-3">Aucun projet enregistré</h2>
            <p className="text-secondary mb-6 max-w-md mx-auto">Commencez par créer votre premier projet pour gérer efficacement vos chantiers BTP.</p>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-4'
          }`}>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => console.log('Ouvrir projet', project.id)}
              />
            ))}
          </div>
        )}

        {loadingProjects && (
          <div className="card-glass p-12 rounded-xl text-center animate-slideInUp">
            <div className="inline-flex items-center gap-3 text-primary">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-lg font-medium text-shimmer">Chargement des projets...</span>
            </div>
          </div>
        )}

        {!loadingProjects && filteredProjects.length === 0 && projects.length > 0 && (
          <div className="card-glass p-12 rounded-xl text-center animate-slideInUp">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-neutral rounded-full flex items-center justify-center animate-pulse">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="heading-3 text-shimmer mb-3">Aucun projet trouvé</h3>
            <p className="text-secondary max-w-xl mx-auto mb-6">
              Aucun projet ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou créez un nouveau projet.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="btn-outline btn-morph"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
        
        {/* Modale de création de projet */}
        <CreateProjectModal
          onCancel={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateProject}
          isOpen={isCreateModalOpen}
        />
        
        {/* Bouton de nettoyage des doublons (temporaire) */}
        <CleanDuplicatesButton />
    </PageContainer>
  );
};

export default Projects;