import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash, Archive } from 'lucide-react';
import { Project } from '../../contexts/projectTypes';

interface ProjectActionsProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onArchive: (project: Project) => void;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({ project, onEdit, onDelete, onArchive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la propagation pour éviter d'ouvrir la carte
    setIsOpen(!isOpen);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Empêcher la propagation pour éviter d'ouvrir la carte
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggleMenu}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Options du projet"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100">
          <div className="py-1">
            <button
              onClick={(e) => handleAction(e, () => onEdit(project))}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </button>
            <button
              onClick={(e) => handleAction(e, () => onArchive(project))}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archiver
            </button>
            <button
              onClick={(e) => handleAction(e, () => onDelete(project))}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash className="w-4 h-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectActions;
