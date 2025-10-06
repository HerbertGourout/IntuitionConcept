import React, { useState } from 'react';
import { MoreVertical, Edit, Archive, Trash2, Info, Copy, Users, Clock } from 'lucide-react';
import { Modal, Button } from 'antd';
import { useProjectContext } from '../../contexts/ProjectContext';
import { Project } from '../../contexts/projectTypes';
import EditProjectModal from './EditProjectModal';
import ProjectDetailsModal from './ProjectDetailsModal';
import ProjectTeamModal from './ProjectTeamModal';
import ProjectHistoryModal from './ProjectHistoryModal';


// Type partiel pour les propriétés du projet nécessaires au menu d'actions
type ProjectForActions = Pick<Project, 'id' | 'name' | 'description' | 'status' | 'budget' | 'spent' | 'startDate' | 'endDate' | 'location' | 'manager' | 'client'> & {
  // Propriétés optionnelles spécifiques utilisées dans les modaux
  status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'archived';
  manager?: string;
  client?: string;
  description?: string;
  location?: string;
};

interface ProjectActionsMenuProps {
  projectId: string;
  project: ProjectForActions;
}

const ProjectActionsMenu: React.FC<ProjectActionsMenuProps> = ({ projectId, project }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dupliquer le projet
  const handleDuplicate = async () => {
    setIsMenuOpen(false);
    if (!project) return;
    // On s'assure de fournir tous les champs requis
    const newProject = {
      name: `${project.name} (Copie)`,
      description: project.description,
      location: project.location,
      startDate: project.startDate,
      endDate: project.endDate,
      status: 'planning' as const,
      budget: project.budget,
      spent: project.spent || 0,
      manager: project.manager || 'Développeur',
      client: project.client || '',
      progress: 0,
      priority: 'medium',
      team: (project as { team?: string[] }).team || [],
      phases: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      // Duplication du projet (les propriétés étendues comme history et team ne sont pas dans l'interface Project de base)
      await projectContext.addProject(newProject);
      // @ts-expect-error - antd message is dynamically loaded
      if (window?.antd?.message) window.antd.message.success('Projet dupliqué !');
    } catch (error) {
      console.error('Erreur lors de la duplication du projet:', error);
    }
  };

  
  const projectContext = useProjectContext();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEdit = () => {
    setIsMenuOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    setIsMenuOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleArchive = async () => {
    setIsMenuOpen(false);
    setIsArchiveModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await projectContext.deleteProject(projectId);
      setIsDeleteModalOpen(false);
      setIsDeleting(false);
      // @ts-expect-error - antd message is dynamically loaded
      if (window?.antd?.message) window.antd.message.success('Projet supprimé !');
    } catch (error) {
      setIsDeleting(false);
      console.error('Erreur lors de la suppression du projet:', error);
      // @ts-expect-error - antd message is dynamically loaded
      if (window?.antd?.message) window.antd.message.error('Erreur lors de la suppression du projet');
    }
  };

  const confirmArchive = async () => {
    try {
      await projectContext.archiveProject(projectId);
      setIsArchiveModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'archivage du projet:', error);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleMenu}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
          <button
            onClick={() => { setIsMenuOpen(false); setIsDetailsModalOpen(true); }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Info className="w-4 h-4 mr-2" />
            Détails
          </button>
          <button
            onClick={() => { setIsMenuOpen(false); setIsHistoryModalOpen(true); }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Clock className="w-4 h-4 mr-2" />
            Historique
          </button>
          <button
            onClick={() => { setIsMenuOpen(false); setIsTeamModalOpen(true); }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Users className="w-4 h-4 mr-2" />
            Gérer l'équipe
          </button>
          <button
            onClick={handleDuplicate}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Copy className="w-4 h-4 mr-2" />
            Dupliquer
          </button>
          <button
            onClick={handleEdit}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </button>
          <button
            onClick={handleArchive}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Archive className="w-4 h-4 mr-2" />
            Archiver
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </button>
        </div>
      )}

      {/* Modal de confirmation de suppression - Version Modernisée */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={(e) => !isDeleting && e.target === e.currentTarget && setIsDeleteModalOpen(false)}
        >
          <div className="glass-card w-full max-w-xl transform transition-all duration-300 animate-slideUp" onClick={(e) => e.stopPropagation()}>
            {/* Header avec gradient rouge */}
            <div className="relative bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">Confirmer la suppression</h2>
                  <p className="text-white/90 text-sm mt-1">Cette action est irréversible</p>
                </div>
                {!isDeleting && (
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                    title="Fermer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Message principal */}
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-red-100 to-orange-100 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Supprimer définitivement ce projet ?
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Vous êtes sur le point de supprimer le projet{' '}
                    <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                      {project.name}
                    </span>
                  </p>
                </div>
              </div>
              
              {/* Zone d'avertissement */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-900">
                      ⚠️ Attention : Toutes les données seront perdues
                    </p>
                    <ul className="text-sm text-red-800 space-y-1 ml-4 list-disc">
                      <li>Tâches et sous-tâches</li>
                      <li>Phases et plannings</li>
                      <li>Budgets et dépenses</li>
                      <li>Documents et fichiers</li>
                      <li>Équipements assignés</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="px-6 py-2.5 bg-white/70 backdrop-blur-sm border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 hover:scale-105 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 hover:scale-105 hover:shadow-xl transition-all duration-200 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Supprimer définitivement
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation d'archivage */}
      <Modal
        title="Confirmer l'archivage"
        open={isArchiveModalOpen}
        onCancel={() => setIsArchiveModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsArchiveModalOpen(false)}>
            Annuler
          </Button>,
          <Button 
            key="archive" 
            type="primary" 
            onClick={confirmArchive}
          >
            Archiver
          </Button>
        ]}
      >
        <p>Êtes-vous sûr de vouloir archiver ce projet ? Il sera déplacé dans les archives mais pourra être restauré ultérieurement.</p>
      </Modal>

      {/* Modal d'édition */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
      />
      {/* Modal de détails */}
      <ProjectDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        project={project as Project}
      />
      {/* Modal de gestion d'équipe */}
      <ProjectTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        team={(project as { team?: string[] }).team ?? []}
        onSave={async (newTeam) => {
          try {
            await projectContext.updateProject(
              project.id,
              { team: newTeam },
              "Modification de l'équipe",
              'Développeur'
            );
            // @ts-expect-error - antd message is dynamically loaded
            if (window?.antd?.message) window.antd.message.success("Équipe mise à jour !");
          } catch (error) {
            console.error('Team update error:', error);
            // @ts-expect-error - antd message is dynamically loaded
            if (window?.antd?.message) window.antd.message.error("Erreur lors de la mise à jour de l'équipe");
          }
        }}
      />
      {/* Modal historique */}
      <ProjectHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={(project as { history?: Array<{ date: string; action: string; user?: string; details: string }> }).history ?? []}
      />
    </div>
  );
};

export default ProjectActionsMenu;
