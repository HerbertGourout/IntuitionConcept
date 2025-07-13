import React, { useState, useEffect, useRef, useContext } from 'react';
import { Search, Filter, X, FolderOpen, Truck, ClipboardList, Euro, User } from 'lucide-react';
import ProjectContext from '../../contexts/ProjectContext';
import { ProjectTask } from '../../contexts/projectTypes';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'project' | 'task' | 'equipment' | 'finance' | 'document' | 'user';
  data?: Record<string, unknown>;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string, id?: string) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filters, setFilters] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const projectContext = useContext(ProjectContext);

  const searchTypes = [
    { id: 'project', label: 'Projets', icon: FolderOpen, color: 'text-blue-600' },
    { id: 'equipment', label: 'Équipements', icon: Truck, color: 'text-green-600' },
    { id: 'task', label: 'Tâches', icon: ClipboardList, color: 'text-orange-600' },
    { id: 'finance', label: 'Finances', icon: Euro, color: 'text-purple-600' },
    { id: 'user', label: 'Utilisateurs', icon: User, color: 'text-gray-600' }
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length >= 2) {
      const performSearch = (searchTerm: string) => {
        const searchResults: SearchResult[] = [];

        // Search projects
        if (filters.length === 0 || filters.includes('project')) {
          projectContext?.projects.forEach(project => {
            if (project.name.toLowerCase().includes(searchTerm) || 
                project.description.toLowerCase().includes(searchTerm)) {
              searchResults.push({
                id: project.id,
                title: project.name,
                subtitle: `${project.status} - ${project.location}`,
                type: 'project',
                data: project as unknown as Record<string, unknown>
              });
            }
          });
        }

        // Search equipment - Désactivé car nous n'avons pas encore de vraies données d'équipement
        // Sera réactivé lorsque les vraies données d'équipement seront disponibles dans le contexte
        /*
        if (filters.length === 0 || filters.includes('equipment')) {
          // Utiliser les vrais équipements du contexte quand ils seront disponibles
        }
        */

        // Search tasks
        if (filters.length === 0 || filters.includes('task')) {
          if (projectContext?.currentProject) {
            projectContext.currentProject.phases.forEach(phase => {
              phase.tasks.forEach(task => {
                if (task.name.toLowerCase().includes(searchTerm) || 
                    (task.description && task.description.toLowerCase().includes(searchTerm))) {
                  searchResults.push({
                    id: task.id,
                    title: task.name,
                    subtitle: `${task.status} - Due: ${task.endDate}`,
                    type: 'task',
                    data: task as unknown as Record<string, unknown>
                  });
                }
                
                // Search in subtasks too
                if (task.subtasks) {
                  const searchSubtasksRecursively = (subtasks: ProjectTask[], results: SearchResult[], term: string) => {
                    subtasks.forEach(subtask => {
                      if (
                        (subtask.name.toLowerCase().includes(term) ||
                        (subtask.description && subtask.description.toLowerCase().includes(term)))
                      ) {
                        results.push({
                          id: subtask.id,
                          title: subtask.name,
                          subtitle: `${subtask.status} - Due: ${subtask.endDate}`,
                          type: 'task',
                          data: subtask as unknown as Record<string, unknown>
                        });
                      }
                      
                      if (subtask.subtasks) {
                        searchSubtasksRecursively(subtask.subtasks, results, term);
                      }
                    });
                  };
                  searchSubtasksRecursively(task.subtasks, searchResults, searchTerm);
                }
              });
            });
          }
        }

        // Search finances
        if (filters.length === 0 || filters.includes('finance')) {
          // Utiliser les vraies données financières du contexte quand elles seront disponibles
        }

        // Search users
        if (filters.length === 0 || filters.includes('user')) {
          // Utiliser les vrais utilisateurs du contexte quand ils seront disponibles
        }
        
        setResults(searchResults.slice(0, 10));
        setSelectedIndex(0);
      };

      performSearch(query.toLowerCase());
    } else {
      setResults([]);
    }
  }, [query, filters, projectContext?.currentProject, projectContext?.projects]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      handleResultClick(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const sectionMap: Record<string, string> = {
      project: 'projects',
      equipment: 'equipment',
      task: 'tasks',
      finance: 'finances',
      user: 'team'
    };
    
    onNavigate(sectionMap[result.type], result.id);
    onClose();
  };
  
  // Labels utilisés pour l'affichage des types de résultats
  const searchTypeLabels: Record<string, string> = {
    project: 'Projet',
    equipment: 'Équipement',
    task: 'Tâche',
    finance: 'Finance',
    document: 'Document',
    user: 'Utilisateur'
  };

  const toggleFilter = (type: string) => {
    setFilters(prev => 
      prev.includes(type) 
        ? prev.filter(f => f !== type)
        : [...prev, type]
    );
  };

  const getResultIcon = (type: string) => {
    const typeConfig = searchTypes.find(t => t.id === type);
    if (!typeConfig) return <Search className="w-4 h-4" />;
    const Icon = typeConfig.icon;
    return <Icon className="w-4 h-4" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-4 pt-16">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Search Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl transform transition-all">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher projets, équipements, tâches..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-3 border-0 focus:ring-0 text-lg placeholder-gray-500"
              />
              <button
                onClick={onClose}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 mr-2">Filtres:</span>
              {searchTypes.map(type => {
                const Icon = type.icon;
                const isActive = filters.includes(type.id);
                return (
                  <button
                    key={type.id}
                    onClick={() => toggleFilter(type.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      isActive 
                        ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      index === selectedIndex ? 'bg-orange-50 border-r-2 border-orange-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mr-1">
                            {searchTypeLabels[result.type as keyof typeof searchTypeLabels]}
                          </span>
                          {result.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{result.subtitle}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="py-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Aucun résultat trouvé pour "{query}"</p>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Commencez à taper pour rechercher...</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>↑↓ Naviguer</span>
                <span>↵ Sélectionner</span>
                <span>Esc Fermer</span>
              </div>
              <span>{results.length} résultat{results.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;