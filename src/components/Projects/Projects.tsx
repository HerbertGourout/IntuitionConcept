import React, { useState } from 'react';
import { Plus, Search, Grid, List, Building2, Filter, Sparkles, TrendingUp } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header avec design glassmorphism */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                Projets
                <TrendingUp className="w-6 h-6 text-green-500" />
              </h1>
              <p className="text-gray-600 mt-2 ml-14">Gérez et supervisez tous vos projets BTP</p>
            </div>
            <button
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Sparkles className="w-5 h-5" />
              <Plus className="w-4 h-4" />
              Nouveau Projet
            </button>
          </div>
        </div>

        {/* Filtres avec design glassmorphism */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtres et recherche</h3>
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
                  className="pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-300 placeholder-gray-400 w-full sm:w-80"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-300"
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
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 shadow-md'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 shadow-md'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List avec design glassmorphism */}
        {projects.length === 0 ? (
          <div className="glass-card p-12 rounded-xl text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <Building2 className="w-16 h-16 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Aucun projet enregistré</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">Commencez par créer votre premier projet pour gérer efficacement vos chantiers BTP.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              <Plus className="w-4 h-4" />
              Créer mon premier projet
            </button>
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
          <div className="glass-card p-12 rounded-xl text-center">
            <div className="inline-flex items-center gap-3 text-blue-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg font-medium">Chargement des projets...</span>
            </div>
          </div>
        )}

        {!loadingProjects && filteredProjects.length === 0 && projects.length > 0 && (
          <div className="glass-card p-12 rounded-xl text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Aucun projet trouvé</h3>
            <p className="text-gray-600 max-w-xl mx-auto mb-6">
              Aucun projet ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou créez un nouveau projet.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
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
      </div>
    </div>
  );
};

export default Projects;