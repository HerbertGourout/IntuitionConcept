import React, { useState } from 'react';
import { Folder, Edit2, Trash2, Check, X, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import Modal from '../UI/Modal';

interface FolderNode {
  id: string;
  name: string;
  parentId: string | null;
  children: FolderNode[];
  documentCount: number;
}

interface FolderManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onFolderSelect: (folderId: string) => void;
  selectedFolder: string;
}

const FolderManager: React.FC<FolderManagerProps> = ({ 
  isOpen, 
  onClose, 
  onFolderSelect, 
  selectedFolder 
}) => {
  const [folders, setFolders] = useState<FolderNode[]>([
    {
      id: 'root',
      name: 'Racine',
      parentId: null,
      children: [
        {
          id: 'plans',
          name: 'Plans',
          parentId: 'root',
          children: [
            { id: 'plans-archi', name: 'Architecturaux', parentId: 'plans', children: [], documentCount: 5 },
            { id: 'plans-struct', name: 'Structurels', parentId: 'plans', children: [], documentCount: 3 }
          ],
          documentCount: 8
        },
        {
          id: 'contracts',
          name: 'Contrats',
          parentId: 'root',
          children: [],
          documentCount: 12
        },
        {
          id: 'reports',
          name: 'Rapports',
          parentId: 'root',
          children: [
            { id: 'reports-daily', name: 'Quotidiens', parentId: 'reports', children: [], documentCount: 25 },
            { id: 'reports-monthly', name: 'Mensuels', parentId: 'reports', children: [], documentCount: 6 }
          ],
          documentCount: 31
        },
        {
          id: 'photos',
          name: 'Photos',
          parentId: 'root',
          children: [],
          documentCount: 156
        }
      ],
      documentCount: 207
    }
  ]);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root', 'plans', 'reports']));
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [parentForNewFolder, setParentForNewFolder] = useState<string>('root');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FolderNode = {
        id: Math.random().toString(36).substr(2, 9),
        name: newFolderName.trim(),
        parentId: parentForNewFolder,
        children: [],
        documentCount: 0
      };

      // Add folder to the tree structure
      const addFolderToTree = (nodes: FolderNode[]): FolderNode[] => {
        return nodes.map(node => {
          if (node.id === parentForNewFolder) {
            return { ...node, children: [...node.children, newFolder] };
          }
          return { ...node, children: addFolderToTree(node.children) };
        });
      };

      setFolders(addFolderToTree(folders));
      setNewFolderName('');
      setIsCreatingFolder(false);
      setParentForNewFolder('root');
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      const removeFolderFromTree = (nodes: FolderNode[]): FolderNode[] => {
        return nodes
          .filter(node => node.id !== folderId)
          .map(node => ({ ...node, children: removeFolderFromTree(node.children) }));
      };

      setFolders(removeFolderFromTree(folders));
    }
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    if (newName.trim()) {
      const renameFolderInTree = (nodes: FolderNode[]): FolderNode[] => {
        return nodes.map(node => {
          if (node.id === folderId) {
            return { ...node, name: newName.trim() };
          }
          return { ...node, children: renameFolderInTree(node.children) };
        });
      };

      setFolders(renameFolderInTree(folders));
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };

  const startRenaming = (folderId: string, currentName: string) => {
    setEditingFolderId(folderId);
    setEditingFolderName(currentName);
  };

  const cancelRenaming = () => {
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const renderFolderTree = (nodes: FolderNode[], level: number = 0) => {
    return nodes.map(folder => (
      <div key={folder.id} className="select-none">
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors ${
            selectedFolder === folder.id 
              ? 'bg-orange-100 text-orange-700' 
              : 'hover:bg-gray-100'
          }`}
          style={{ marginLeft: level * 20 }}
          onClick={() => onFolderSelect(folder.id)}
        >
          {folder.children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {expandedFolders.has(folder.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          
          {folder.children.length === 0 && (
            <div className="w-5" /> // Spacer for alignment
          )}

          <Folder className="w-4 h-4 text-blue-500" />
          
          {editingFolderId === folder.id ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editingFolderName}
                onChange={(e) => setEditingFolderName(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameFolder(folder.id, editingFolderName);
                  } else if (e.key === 'Escape') {
                    cancelRenaming();
                  }
                }}
                autoFocus
              />
              <button
                onClick={() => handleRenameFolder(folder.id, editingFolderName)}
                className="p-1 hover:bg-green-100 text-green-600 rounded"
                title="Confirmer"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={cancelRenaming}
                className="p-1 hover:bg-red-100 text-red-600 rounded"
                title="Annuler"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="flex-1 text-sm font-medium">{folder.name}</span>
          )}
          
          <span className="text-xs text-gray-500">
            {folder.documentCount}
          </span>

          {folder.id !== 'root' && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startRenaming(folder.id, folder.name);
                }}
                className="p-1 hover:bg-gray-200 rounded"
                title="Renommer"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder.id);
                }}
                className="p-1 hover:bg-red-100 text-red-600 rounded"
                title="Supprimer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {expandedFolders.has(folder.id) && folder.children.length > 0 && (
          <div>
            {renderFolderTree(folder.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Gestionnaire de Dossiers" 
      size="md"
    >
      <div className="space-y-4">
        {/* Create Folder Button */}
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-700">Structure des dossiers</h4>
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nouveau dossier
          </button>
        </div>

        {/* Create Folder Form */}
        {isCreatingFolder && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du dossier
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Nom du nouveau dossier"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dossier parent
                </label>
                <select
                  value={parentForNewFolder}
                  onChange={(e) => setParentForNewFolder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="root">Racine</option>
                  {/* Add other folder options here */}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateFolder}
                  className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  Créer
                </button>
                <button
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderName('');
                    setParentForNewFolder('root');
                  }}
                  className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Folder Tree */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2">
          <div className="group">
            {renderFolderTree(folders)}
          </div>
        </div>

        {/* Selected Folder Info */}
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Dossier sélectionné:</strong> {
              selectedFolder === 'root' ? 'Racine' : 
              folders.find(f => f.id === selectedFolder)?.name || 'Dossier inconnu'
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FolderManager;