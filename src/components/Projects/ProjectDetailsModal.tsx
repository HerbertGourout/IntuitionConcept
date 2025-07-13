import React from 'react';
import { Modal } from 'antd';
import { Project } from '../../contexts/projectTypes';
import BudgetSection from './BudgetSection';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ isOpen, onClose, project }) => {
  if (!project) return null;
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title={`Détails du projet : ${project.name}`}
      width={700}
    >
      <div className="space-y-4">
        <div>
          <strong>Description :</strong>
          <p>{project.description || 'Aucune description'}</p>
        </div>
        <div>
          <strong>Statut :</strong> {project.status}
        </div>
        <div>
          <strong>Localisation :</strong> {project.location}
        </div>
        <div>
          <strong>Budget :</strong> {project.budget.toLocaleString('fr-FR')} FCFA
        </div>
        <div>
          <strong>Dépenses :</strong> {project.spent?.toLocaleString('fr-FR') || 0} FCFA
        </div>
        <div>
          <strong>Date de début :</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString('fr-FR') : 'Non définie'}
        </div>
        <div>
          <strong>Date de fin :</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString('fr-FR') : 'Non définie'}
        </div>
        <div>
          <strong>Responsable :</strong> {project.manager || 'Non assigné'}
        </div>
        <div>
          <strong>Client :</strong> {project.client || 'Non renseigné'}
        </div>
        <div>
          <strong>Équipe :</strong> {project.team && project.team.length > 0 ? project.team.join(', ') : 'Aucun membre'}
        </div>
        {/* Ajoutez ici d'autres infos spécifiques */}
      </div>
      {/* Suivi d'avancement des tâches (lecture seule) */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Suivi des tâches</h3>
        <ul className="list-disc list-inside space-y-1">
          {project.phases && project.phases.length > 0 ? (
            project.phases.flatMap(phase =>
              (phase.tasks || []).map(task => (
                <li key={task.id}>
                  <span className="font-medium">{task.name}</span> — <span className="capitalize">{task.status}</span>
                </li>
              ))
            )
          ) : (
            <li>Aucune tâche définie pour ce projet.</li>
          )}
        </ul>
        <div className="mt-2">
          <span className="font-semibold">Progression globale :</span> {' '}
          {(() => {
            const allTasks = project.phases ? project.phases.flatMap(phase => phase.tasks || []) : [];
            const doneTasks = allTasks.filter(t => t.status === 'done' || t.status === 'completed').length;
            return allTasks.length > 0 ? `${Math.round((doneTasks / allTasks.length) * 100)}%` : '0%';
          })()}
        </div>
      </div>
      <div className="mt-8">
        {/* Section budget détaillée avec graphiques */}
        <React.Suspense fallback={<div>Chargement du budget...</div>}>
          {project && <BudgetSection project={project} />}
        </React.Suspense>
      </div>
    </Modal>
  );
};

export default ProjectDetailsModal;
