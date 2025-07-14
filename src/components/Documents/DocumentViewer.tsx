import React, { useState } from 'react';
import { X, Download, Share2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import Modal from '../UI/Modal';
import { Document } from '../../types';

interface DocumentViewerProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  document, 
  isOpen, 
  onClose, 
  onShare 
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const isImageFile = (name: string) => {
    return name.match(/\.(jpg|jpeg|png|gif|bmp|svg)$/i);
  };

  const isPdfFile = (name: string) => {
    return name.match(/\.(pdf)$/i);
  };

  const isTextFile = (name: string) => {
    return name.match(/\.(txt|md)$/i);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetView = () => {
    setZoom(100);
    setRotation(0);
  };

  const renderDocumentContent = () => {
    if (isImageFile(document.name)) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <img
            src={document.url}
            alt={document.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`
            }}
          />
        </div>
      );
    }

    if (isPdfFile(document.name)) {
      return (
        <div className="h-full">
          <iframe
            src={document.url}
            className="w-full h-full border-0"
            title={document.name}
          />
        </div>
      );
    }

    if (isTextFile(document.name)) {
      return (
        <div className="h-full p-6 bg-white overflow-auto">
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            {/* Contenu du fichier texte serait chargé ici */}
            Contenu du fichier texte...
          </pre>
        </div>
      );
    }

    // Fichier non prévisualisable
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-500">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-lg font-medium mb-2">Aperçu non disponible</h3>
        <p className="text-sm mb-4">Ce type de fichier ne peut pas être prévisualisé</p>
        <a
          href={document.url}
          download={document.name}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Télécharger le fichier
        </a>
      </div>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={document.name} 
      size="xl"
      showCloseButton={false}
    >
      <div className="h-[80vh] flex flex-col">
        {/* Header with controls */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-gray-900 truncate max-w-xl">
              {document.name}
            </h3>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              v{document.version}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls for images */}
            {isImageFile(document.name) && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Zoom arrière"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Zoom avant"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Rotation"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2" />
              </>
            )}

            <button
              onClick={onShare}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Partager"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a
              href={document.url}
              download={document.name}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Télécharger"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document content */}
        <div className="flex-1 overflow-hidden">
          {renderDocumentContent()}
        </div>

        {/* Footer with document info */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Taille: {(document.size / (1024 * 1024)).toFixed(1)} MB</span>
              <span>Modifié: {new Date(document.uploadDate).toLocaleDateString('fr-FR')}</span>
              <span>Par: {document.uploadedBy}</span>
            </div>
            {isImageFile(document.name) && (
              <button
                onClick={resetView}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Réinitialiser la vue
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentViewer;