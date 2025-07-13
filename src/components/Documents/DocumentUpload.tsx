import React, { useState, useContext } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Modal from '../UI/Modal';
import DragDropZone from '../UI/DragDropZone';
import ProjectContext from '../../contexts/ProjectContext';

interface DocumentMetadata {
  type: string;
  projectId: string;
  description: string;
  tags: string[];
  folderId: string;
}

interface DocumentUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], metadata: DocumentMetadata) => void;
  currentFolder: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  isOpen, 
  onClose, 
  onUpload, 
  currentFolder 
}) => {
  const projectContext = useContext(ProjectContext);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState({
    type: 'other',
    projectId: projectContext?.currentProject?.id || '',
    description: '',
    tags: [] as string[],
    folderId: currentFolder
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const documentTypes = [
    { value: 'plan', label: 'Plan' },
    { value: 'contract', label: 'Contrat' },
    { value: 'permit', label: 'Permis' },
    { value: 'report', label: 'Rapport' },
    { value: 'photo', label: 'Photo' },
    { value: 'other', label: 'Autre' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (selectedFiles.length === 0) {
      newErrors.files = 'Veuillez sélectionner au moins un fichier';
    }

    if (!metadata.type) {
      newErrors.type = 'Veuillez sélectionner un type de document';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onUpload(selectedFiles, metadata);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setMetadata({
      type: 'other',
      projectId: '',
      description: '',
      tags: [],
      folderId: currentFolder
    });
    setTagInput('');
    setErrors({});
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Importer des Documents" 
      size="lg"
    >
      <div className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Fichiers à importer
          </label>
          <DragDropZone
            onFilesSelected={setSelectedFiles}
            acceptedTypes={['image/*', 'application/pdf', '.doc', '.docx', '.dwg', '.dxf', '.rvt']}
            maxFiles={10}
            maxSize={50}
          />
          {errors.files && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {errors.files}
            </p>
          )}
        </div>

        {/* Metadata Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de Document *
            </label>
            <select
              value={metadata.type}
              onChange={(e) => setMetadata(prev => ({ ...prev, type: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Projet Associé
            </label>
            <select
              value={metadata.projectId}
              onChange={(e) => setMetadata(prev => ({ ...prev, projectId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Aucun projet spécifique</option>
              {projectContext?.projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={metadata.description}
            onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Description optionnelle du document..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ajouter un tag..."
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Ajouter
            </button>
          </div>
          
          {metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {metadata.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedFiles.length === 0}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Importer {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentUpload;