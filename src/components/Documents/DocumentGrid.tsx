import React from 'react';
import { FileText, Image, File, Download, Share2, Eye, Calendar, User } from 'lucide-react';
import { Document } from '../../types';

interface DocumentGridProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  onDocumentShare: (document: Document) => void;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({ 
  documents, 
  onDocumentSelect, 
  onDocumentShare 
}) => {
  const getDocumentIcon = (type: string, name: string) => {
    if (type === 'photo' || name.match(/\.(jpg|jpeg|png|gif|bmp|svg)$/i)) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    if (name.match(/\.(pdf)$/i)) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    if (name.match(/\.(doc|docx)$/i)) {
      return <FileText className="w-8 h-8 text-blue-600" />;
    }
    if (name.match(/\.(dwg|dxf|rvt)$/i)) {
      return <File className="w-8 h-8 text-green-600" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      plan: 'Plan',
      contract: 'Contrat',
      permit: 'Permis',
      report: 'Rapport',
      photo: 'Photo',
      other: 'Autre'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isImageFile = (name: string) => {
    return name.match(/\.(jpg|jpeg|png|gif|bmp|svg)$/i);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {documents.map((document) => (
        <div
          key={document.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 group"
        >
          {/* Document Preview */}
          <div className="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
            {isImageFile(document.name) ? (
              <img
                src={document.url}
                alt={document.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`flex items-center justify-center ${isImageFile(document.name) ? 'hidden' : ''}`}>
              {getDocumentIcon(document.type, document.name)}
            </div>
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <button
                onClick={() => onDocumentSelect(document)}
                className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                title="Voir le document"
              >
                <Eye className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={() => onDocumentShare(document)}
                className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                title="Partager"
              >
                <Share2 className="w-4 h-4 text-gray-700" />
              </button>
              <a
                href={document.url}
                download={document.name}
                className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                title="Télécharger"
              >
                <Download className="w-4 h-4 text-gray-700" />
              </a>
            </div>

            {/* Type Badge */}
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-white bg-opacity-90 text-xs font-medium text-gray-700 rounded-full">
                {getTypeLabel(document.type)}
              </span>
            </div>

            {/* Version Badge */}
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                v{document.version}
              </span>
            </div>
          </div>

          {/* Document Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 truncate" title={document.name}>
              {document.name}
            </h3>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(document.uploadDate).toLocaleDateString('fr-FR')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="truncate">{document.uploadedBy}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500">{formatFileSize(document.size)}</span>
                {document.shared && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Partagé
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {document.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {document.tags.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    +{document.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentGrid;