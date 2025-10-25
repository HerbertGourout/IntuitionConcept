/**
 * Composant partagé pour l'upload de plans architecturaux
 * Supporte PDF et images (PNG, JPG)
 */

import React, { useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface PlanUploaderProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  uploadedFile: File | null;
  acceptedFormats?: string;
  maxSizeMB?: number;
  showPreview?: boolean;
}

const PlanUploader: React.FC<PlanUploaderProps> = ({
  onFileSelect,
  onFileRemove,
  uploadedFile,
  acceptedFormats = '.pdf,.png,.jpg,.jpeg',
  maxSizeMB = 10,
  showPreview = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Le fichier est trop volumineux. Taille maximale : ${maxSizeMB}MB`, { duration: 4000 });
      return;
    }

    // Vérifier le format
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = acceptedFormats.split(',').map(ext => ext.trim().toLowerCase());
    
    if (!acceptedExtensions.includes(fileExtension)) {
      toast.error(`Format non supporté. Formats acceptés : ${acceptedFormats}`, { duration: 4000 });
      return;
    }

    onFileSelect(file);
    toast.success(`✅ Fichier "${file.name}" chargé avec succès`, { duration: 3000 });
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.();
    toast.success('Fichier retiré', { duration: 2000 });
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      // Simuler un changement d'input
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        handleFileChange({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* Zone d'upload */}
      {!uploadedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Glissez-déposez votre plan ici
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            ou cliquez pour sélectionner un fichier
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Formats acceptés : {acceptedFormats} • Taille max : {maxSizeMB}MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        /* Fichier uploadé */
        <div className="border border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{uploadedFile.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Retirer le fichier"
            >
              <X className="w-5 h-5 text-red-600 dark:text-red-400" />
            </button>
          </div>

          {/* Prévisualisation pour les images */}
          {showPreview && uploadedFile.type.startsWith('image/') && (
            <div className="mt-4">
              <img
                src={URL.createObjectURL(uploadedFile)}
                alt="Prévisualisation"
                className="max-h-64 mx-auto rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanUploader;
