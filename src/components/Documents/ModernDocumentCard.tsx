import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, File, Download, Share2, MoreVertical } from 'lucide-react';
import { Document } from '../../types';

interface ModernDocumentCardProps {
  document: Document;
  onClick: () => void;
  onDownload: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  viewMode?: 'grid' | 'list';
}

const getFileIcon = (type: string) => {
  switch (type) {
    case 'photo':
      return <Image className="w-5 h-5 text-blue-500" />;
    case 'plan':
      return <FileText className="w-5 h-5 text-green-500" />;
    case 'contract':
      return <FileText className="w-5 h-5 text-purple-500" />;
    case 'report':
      return <FileText className="w-5 h-5 text-yellow-500" />;
    case 'permit':
      return <FileText className="w-5 h-5 text-red-500" />;
    default:
      return <File className="w-5 h-5 text-gray-500" />;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ModernDocumentCard: React.FC<ModernDocumentCardProps> = ({
  document,
  onClick,
  onDownload,
  onShare,
  viewMode = 'grid'
}) => {
  const isGrid = viewMode === 'grid';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      whileHover={{ 
        scale: isGrid ? 1.02 : 1.01,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
      className={`
        ${isGrid ? 'max-w-xs' : 'w-full'}
        bg-white dark:bg-gray-800 rounded-xl overflow-hidden
        border border-gray-200 dark:border-gray-700
        transition-all duration-200 ease-in-out
        flex ${isGrid ? 'flex-col' : 'flex-row items-center'}
        group relative
      `}
      onClick={onClick}
    >
      {/* Document Preview */}
      <div 
        className={`
          ${isGrid ? 'h-40' : 'h-24 w-24 flex-shrink-0'}
          bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30
          flex items-center justify-center
          relative overflow-hidden
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 p-2 bg-white/80 dark:bg-gray-900/50 rounded-full">
          {getFileIcon(document.type)}
        </div>
        
        {/* Badge de type */}
        <span className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 text-xs px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">
          {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
        </span>
      </div>
      
      {/* Document Info */}
      <div className={`p-4 ${isGrid ? '' : 'flex-1 ml-4'}`}>
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
            {document.name}
          </h3>
          <button 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 -mr-2"
            onClick={(e) => {
              e.stopPropagation();
              // Menu déroulant des actions
            }}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span>{formatFileSize(document.size)}</span>
          <span className="mx-2">•</span>
          <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
        </div>
        
        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {document.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
              >
                {tag}
              </span>
            ))}
            {document.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{document.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className={`
        ${isGrid ? 'p-4 border-t border-gray-100 dark:border-gray-700' : 'pr-4'}
        flex items-center justify-end space-x-2 bg-gray-50 dark:bg-gray-800/50
        ${isGrid ? 'w-full' : 'h-full'}
      `}>
        <button 
          className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(e);
          }}
          title="Télécharger"
        >
          <Download className="w-4 h-4" />
        </button>
        <button 
          className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onShare(e);
          }}
          title="Partager"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default ModernDocumentCard;
