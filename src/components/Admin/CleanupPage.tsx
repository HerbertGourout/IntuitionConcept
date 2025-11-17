import React, { useState, useEffect } from 'react';
import { Trash2, Eye, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

interface ProjectData {
  id: string;
  name: string;
  createdAt: string;
  description?: string;
}

interface DuplicateGroup {
  name: string;
  projects: ProjectData[];
}

const CleanupPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [cleaned, setCleaned] = useState(false);

  const scanDuplicates = async () => {
    setLoading(true);
    setCleaned(false);
    
    try {
      const projectsRef = collection(db, 'projects');
      const snapshot = await getDocs(projectsRef);
      
      const projects: ProjectData[] = [];
      snapshot.forEach((docSnap) => {
        projects.push({
          id: docSnap.id,
          name: docSnap.data().name || '',
          createdAt: docSnap.data().createdAt || new Date().toISOString(),
          description: docSnap.data().description || ''
        });
      });
      
      setTotalProjects(projects.length);
      
      // Grouper par nom
      const projectsByName = new Map<string, ProjectData[]>();
      projects.forEach(project => {
        const key = project.name.toLowerCase().trim();
        if (!projectsByName.has(key)) {
          projectsByName.set(key, []);
        }
        projectsByName.get(key)!.push(project);
      });
      
      // Identifier les doublons
      const duplicateGroups: DuplicateGroup[] = [];
      projectsByName.forEach((group, name) => {
        if (group.length > 1) {
          // Trier par date (plus récent en premier)
          group.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
          
          duplicateGroups.push({
            name,
            projects: group
          });
        }
      });
      
      setDuplicates(duplicateGroups);
      
    } catch (error) {
      console.error('Erreur lors du scan:', error);
      alert('❌ Erreur lors du scan. Consultez la console.');
    } finally {
      setLoading(false);
    }
  };

  const cleanDuplicates = async () => {
    if (!window.confirm(`⚠️ Êtes-vous sûr de vouloir supprimer les doublons ?\n\nCette action est irréversible !`)) {
      return;
    }
    
    setLoading(true);
    
    try {
      let deletedCount = 0;
      
      for (const group of duplicates) {
        // Garder le premier (plus récent), supprimer les autres
        const toDelete = group.projects.slice(1);
        
        for (const project of toDelete) {
          await deleteDoc(doc(db, 'projects', project.id));
          deletedCount++;
        }
      }
      
      alert(`✅ Nettoyage terminé !\n\n${deletedCount} doublons supprimés`);
      setCleaned(true);
      
      // Rescanner après nettoyage
      await scanDuplicates();
      
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      alert('❌ Erreur lors du nettoyage. Consultez la console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scanDuplicates();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Trash2 className="w-8 h-8 text-red-500" />
                Nettoyage des Doublons
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Supprimez les projets dupliqués en gardant le plus récent de chaque groupe
              </p>
            </div>
            
            <button
              onClick={scanDuplicates}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Rescanner
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Projets</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {totalProjects}
                </p>
              </div>
              <Eye className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Groupes de Doublons</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {duplicates.length}
                </p>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Doublons à Supprimer</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {duplicates.reduce((sum, group) => sum + group.projects.length - 1, 0)}
                </p>
              </div>
              <Trash2 className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Liste des doublons */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Scan en cours...</p>
          </div>
        ) : duplicates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Aucun doublon trouvé !
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tous vos projets sont uniques.
            </p>
          </div>
        ) : (
          <>
            {/* Bouton de nettoyage */}
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <div>
                    <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
                      {duplicates.reduce((sum, group) => sum + group.projects.length - 1, 0)} doublons détectés
                    </h3>
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      Le projet le plus récent de chaque groupe sera conservé
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={cleanDuplicates}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  <Trash2 className="w-5 h-5" />
                  Nettoyer Maintenant
                </button>
              </div>
            </div>

            {/* Groupes de doublons */}
            <div className="space-y-4">
              {duplicates.map((group, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    📋 {group.name}
                    <span className="ml-3 text-sm font-normal text-orange-600">
                      ({group.projects.length} copies)
                    </span>
                  </h3>
                  
                  <div className="space-y-3">
                    {group.projects.map((project, idx) => (
                      <div
                        key={project.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                          idx === 0
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {idx === 0 ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <Trash2 className="w-6 h-6 text-red-600" />
                          )}
                          
                          <div>
                            <p className={`font-semibold ${
                              idx === 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                            }`}>
                              {idx === 0 ? '✅ À GARDER' : '❌ À SUPPRIMER'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ID: {project.id}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Créé le: {new Date(project.createdAt).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Message de succès */}
        {cleaned && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">Nettoyage réussi !</p>
              <p className="text-sm">Rechargez la page pour voir les changements</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CleanupPage;
