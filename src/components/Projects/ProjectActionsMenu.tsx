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

      {/* Modal de confirmation de suppression */}
      <Modal
        title="Confirmer la suppression"
        open={isDeleteModalOpen}
        onCancel={() => !isDeleting && setIsDeleteModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
            Annuler
          </Button>,
          <Button 
            key="delete" 
            danger 
            type="primary" 
            onClick={confirmDelete}
            loading={isDeleting}
            disabled={isDeleting}
          >
            Supprimer
          </Button>
        ]}
        maskClosable={!isDeleting}
        closable={!isDeleting}
      >
        <p>Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.</p>
      </Modal>

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
