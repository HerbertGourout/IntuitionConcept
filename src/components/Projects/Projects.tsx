import React, { useState } from 'react';
import { Plus, Search, Grid, List } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { useProjects } from '../../hooks/useProjects';
import CreateProjectModal from './CreateProjectModal';

import { useToast } from '../../hooks/useToast';
import type { Project } from '../../contexts/projectTypes';


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
    await addProject(newProject);
    // Sélectionner automatiquement le nouveau projet créé
    setCurrentProject(newProject.id);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
          <p className="text-gray-600 mt-1">Gérez tous vos projets BTP</p>
        </div>
        <button
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Nouveau Projet
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <img src="/empty-state.svg" alt="Aucun projet" style={{ width: 180, marginBottom: 24 }} />
          <h2 className="text-xl font-semibold mb-2">Aucun projet enregistré</h2>
          <p className="text-gray-500 mb-4">Ajoutez un projet pour commencer à gérer vos chantiers.</p>
        </div>
      ) : (
        <div className={`${viewMode === 'grid'
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
        <div className="text-center py-12">
          <span className="loader" /> Chargement des projets...
        </div>
      )}

      {!loadingProjects && filteredProjects.length === 0 && projects.length > 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
          <p className="text-gray-600 max-w-xl mx-auto">
            Aucun projet ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou créez un nouveau projet.
          </p>
        </div>
      )}
      {/* Modale de création de projet */}
      <CreateProjectModal
        onCancel={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
        isOpen={isCreateModalOpen}
      />
    </div>
  );
};

export default Projects;