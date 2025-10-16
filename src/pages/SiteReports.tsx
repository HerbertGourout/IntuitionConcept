/**
 * Page de Gestion des Rapports de Chantier
 * 
 * Permet de:
 * - Générer des rapports automatiques avec IA
 * - Consulter l'historique des rapports
 * - Exporter et partager les rapports
 */

import React, { useState } from 'react';
import { useProjectContext } from '../contexts/ProjectContext';
import SiteReportGenerator from '../components/Reports/SiteReportGenerator';
import { FileText, Plus } from 'lucide-react';
import type { Project } from '../contexts/projectTypes';

const SiteReports: React.FC = () => {
  const { projects } = useProjectContext();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );
  const [showGenerator, setShowGenerator] = useState(false);
  
  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Aucun projet disponible</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Créez un projet pour générer des rapports de chantier
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!showGenerator ? (
        // Vue liste des projets
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">📋 Rapports de Chantier</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Générez des rapports professionnels automatiquement avec l'IA
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: Project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setShowGenerator(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {project.location || 'Emplacement non spécifié'}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Avancement</span>
                    <span className="font-semibold">
                      {Math.round(
                        project.phases.reduce((acc: number, p) => acc + (p.progress || 0), 0) / 
                        (project.phases.length || 1)
                      )}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.round(
                          project.phases.reduce((acc: number, p) => acc + (p.progress || 0), 0) / 
                          (project.phases.length || 1)
                        )}%`
                      }}
                    />
                  </div>
                </div>
                
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProjectId(project.id);
                    setShowGenerator(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Générer un rapport
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Vue générateur de rapport
        <div>
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <button
              onClick={() => setShowGenerator(false)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              ← Retour aux projets
            </button>
          </div>
          
          {selectedProjectId && (
            <SiteReportGenerator
              projectId={selectedProjectId}
              onReportGenerated={(report) => {
                console.log('Rapport généré:', report);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SiteReports;
