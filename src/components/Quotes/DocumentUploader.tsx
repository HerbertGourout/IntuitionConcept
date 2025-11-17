import React, { useState } from 'react';
import { Upload, File, X, FileText, Calculator, MapPin, Camera, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import StructuralDocumentService, { StructuralDocument } from '../../services/structuralDocumentService';
import toast from 'react-hot-toast';

interface DocumentUploaderProps {
  quoteId: string;
  documents?: Record<string, StructuralDocument>;
  onUpdate: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  quoteId,
  documents = {},
  onUpdate
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const documentTypes = [
    { value: 'plan', label: 'Plan de structure', icon: FileText, color: 'blue' },
    { value: 'calculation', label: 'Note de calcul', icon: Calculator, color: 'purple' },
    { value: 'geotechnical', label: 'Rapport géotechnique', icon: MapPin, color: 'green' },
    { value: 'photo', label: 'Photo', icon: Camera, color: 'orange' },
    { value: 'other', label: 'Autre', icon: File, color: 'gray' }
  ] as const;

  const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'dwg', 'dxf'];

  const handleFileSelect = async (files: FileList | null, type: StructuralDocument['type']) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validation
    if (!StructuralDocumentService.validateFileType(file, allowedExtensions)) {
      toast.error(`Type de fichier non autorisé. Extensions acceptées: ${allowedExtensions.join(', ')}`);
      return;
    }

    if (!StructuralDocumentService.validateFileSize(file, 10)) {
      toast.error('Fichier trop volumineux (max 10MB)');
      return;
    }

    setUploading(true);
    try {
      await StructuralDocumentService.uploadDocument(
        quoteId,
        file,
        type,
        user?.email || 'Utilisateur'
      );
      toast.success('Document uploadé avec succès');
      onUpdate();
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors de l\'upload du document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string, docUrl: string, docName: string) => {
    if (!window.confirm(`Supprimer le document "${docName}" ?`)) return;

    try {
      await StructuralDocumentService.deleteDocument(quoteId, docId, docUrl);
      toast.success('Document supprimé');
      onUpdate();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: StructuralDocument['type']) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files, type);
    }
  };

  const getTypeConfig = (type: StructuralDocument['type']) => {
    return documentTypes.find(t => t.value === type) || documentTypes[4];
  };

  const docsByType = StructuralDocumentService.getDocumentsByType(documents);

  return (
    <div className="space-y-4">
      {/* Upload sections par type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentTypes.map(({ value, label, icon: Icon, color }) => {
          const typeDocs = StructuralDocumentService.getDocumentsByType(documents, value);

          return (
            <div key={value} className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Icon className={`w-4 h-4 text-${color}-600`} />
                {label}
              </label>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, value)}
                className={`
                  relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                  transition-all hover:border-${color}-400 hover:bg-${color}-50/50
                  ${dragActive ? `border-${color}-500 bg-${color}-50` : 'border-gray-300'}
                  ${uploading ? 'opacity-50 pointer-events-none' : ''}
                `}
              >
                <input
                  type="file"
                  onChange={(e) => handleFileSelect(e.target.files, value)}
                  accept={allowedExtensions.map(ext => `.${ext}`).join(',')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Upload className={`w-6 h-6 mx-auto mb-2 text-${color}-500`} />
                <p className="text-xs text-gray-600">
                  Cliquez ou glissez un fichier
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, DOC, IMG, DWG (max 10MB)
                </p>
              </div>

              {/* Liste des documents de ce type */}
              {typeDocs.length > 0 && (
                <div className="space-y-1">
                  {typeDocs.map(doc => {
                    const config = getTypeConfig(doc.type);
                    const DocIcon = config.icon;

                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <DocIcon className={`w-4 h-4 text-${config.color}-600 flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline truncate block"
                            >
                              {doc.name}
                            </a>
                            <p className="text-xs text-gray-500">
                              {StructuralDocumentService.formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(doc.id, doc.url, doc.name)}
                          className="p-1 hover:bg-red-100 rounded transition-colors text-red-500 flex-shrink-0"
                          title="Supprimer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info */}
      {docsByType.length === 0 && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Aucun document uploadé</p>
            <p className="text-xs mt-1">
              Ajoutez les plans de structure, notes de calcul et rapports géotechniques pour compléter le dossier.
            </p>
          </div>
        </div>
      )}

      {/* Résumé */}
      {docsByType.length > 0 && (
        <div className="text-xs text-gray-600 text-center">
          {docsByType.length} document{docsByType.length > 1 ? 's' : ''} • Total: {' '}
          {StructuralDocumentService.formatFileSize(
            docsByType.reduce((sum, doc) => sum + doc.size, 0)
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
