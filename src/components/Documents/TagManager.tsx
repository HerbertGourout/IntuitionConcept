import React, { useState } from 'react';
import { Plus, X, Hash } from 'lucide-react';
import Modal from '../UI/Modal';

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagManager: React.FC<TagManagerProps> = ({ 
  isOpen, 
  onClose, 
  selectedTags, 
  onTagsChange 
}) => {
  const [availableTags] = useState([
    'urgent', 'approuvé', 'en-cours', 'final', 'brouillon',
    'confidentiel', 'public', 'technique', 'administratif',
    'sécurité', 'qualité', 'environnement', 'budget',
    'planning', 'ressources', 'client', 'fournisseur'
  ]);

  const [newTag, setNewTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleAddNewTag = () => {
    if (newTag.trim() && !availableTags.includes(newTag.trim().toLowerCase())) {
      const tagToAdd = newTag.trim().toLowerCase();
      // In a real app, you would save this to the backend
      onTagsChange([...selectedTags, tagToAdd]);
      setNewTag('');
    }
  };

  const getTagColor = (tag: string) => {
    const colors = {
      'urgent': 'bg-red-100 text-red-800 border-red-200',
      'approuvé': 'bg-green-100 text-green-800 border-green-200',
      'en-cours': 'bg-blue-100 text-blue-800 border-blue-200',
      'final': 'bg-purple-100 text-purple-800 border-purple-200',
      'brouillon': 'bg-gray-100 text-gray-800 border-gray-200',
      'confidentiel': 'bg-red-100 text-red-800 border-red-200',
      'public': 'bg-green-100 text-green-800 border-green-200',
      'technique': 'bg-blue-100 text-blue-800 border-blue-200',
      'administratif': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'sécurité': 'bg-red-100 text-red-800 border-red-200',
      'qualité': 'bg-green-100 text-green-800 border-green-200',
      'environnement': 'bg-green-100 text-green-800 border-green-200',
      'budget': 'bg-orange-100 text-orange-800 border-orange-200',
      'planning': 'bg-blue-100 text-blue-800 border-blue-200',
      'ressources': 'bg-purple-100 text-purple-800 border-purple-200',
      'client': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'fournisseur': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[tag as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Gestionnaire de Tags" 
      size="md"
    >
      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rechercher des tags
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Rechercher un tag..."
            />
          </div>
        </div>

        {/* Add New Tag */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Créer un nouveau tag
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Nom du nouveau tag..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddNewTag()}
            />
            <button
              onClick={handleAddNewTag}
              disabled={!newTag.trim()}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags sélectionnés ({selectedTags.length})
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${getTagColor(tag)}`}
                >
                  <Hash className="w-3 h-3" />
                  {tag}
                  <button
                    onClick={() => handleTagToggle(tag)}
                    className="hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Available Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags disponibles
          </label>
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
            <div className="flex flex-wrap gap-2">
              {filteredTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-all ${
                    selectedTags.includes(tag)
                      ? getTagColor(tag) + ' ring-2 ring-orange-500 ring-opacity-50'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  <Hash className="w-3 h-3" />
                  {tag}
                  {selectedTags.includes(tag) && (
                    <X className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
            
            {filteredTags.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                Aucun tag trouvé pour "{searchTerm}"
              </p>
            )}
          </div>
        </div>

        {/* Tag Statistics */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{availableTags.length}</div>
              <div className="text-xs text-gray-600">Tags disponibles</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">{selectedTags.length}</div>
              <div className="text-xs text-gray-600">Tags sélectionnés</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{filteredTags.length}</div>
              <div className="text-xs text-gray-600">Résultats filtrés</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => onTagsChange([])}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tout désélectionner
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Appliquer les filtres
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TagManager;