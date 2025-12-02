

import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Users,
  Package,
  Wrench,
  AlertTriangle,
  Download,
  Loader2,
  CheckCircle,
  Clock,
  Zap,
  ChevronDown,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { projectPlanGenerator, type ProjectPlan } from '../../services/ai/projectPlanGenerator';
import { pdfExportService } from '../../services/pdfExportService';

interface ProjectPlanGeneratorProps {
  onPlanGenerated?: (plan: ProjectPlan) => void;
  initialPrompt?: string;
}

const ProjectPlanGenerator: React.FC<ProjectPlanGeneratorProps> = ({
  onPlanGenerated,
  initialPrompt = ''
}) => {
  const [projectPrompt, setProjectPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<ProjectPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  
  const handleGeneratePlan = async () => {
    if (!projectPrompt.trim()) {
      setError('Veuillez décrire votre projet');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const plan = await projectPlanGenerator.generatePlanFromPrompt(projectPrompt);
      setGeneratedPlan(plan);
      
      // Expand first phase by default
      setExpandedPhases(new Set([0]));
      
      if (onPlanGenerated) {
        onPlanGenerated(plan);
      }
    } catch (err) {
      console.error('Erreur génération plan:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePhase = (phaseIndex: number) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phaseIndex)) {
        newSet.delete(phaseIndex);
      } else {
        newSet.add(phaseIndex);
      }
      return newSet;
    });
  };

  const toggleTask = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const calculateTotalDuration = () => {
    if (!generatedPlan) return '0 jours';
    const totalDays = generatedPlan.phases.reduce((sum, phase) => {
      // Extraire le nombre de la chaîne "X jours"
      const days = parseInt(phase.duration) || 0;
      return sum + days;
    }, 0);
    return `${totalDays} jours`;
  };

  const handleExportPDF = async () => {
    if (!generatedPlan) return;
    
    try {
      const pdfBlob = pdfExportService.exportProjectPlan(generatedPlan, {
        title: 'Plan de Projet Généré',
        subtitle: `${generatedPlan.phases.length} phases - ${calculateTotalDuration()}`,
        author: 'IntuitionConcept'
      });
      
      // Télécharger le PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plan-projet-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur export PDF:', err);
      setError('Erreur lors de l\'export PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          Description du Projet
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Décrivez votre projet en détail
            </label>
            <textarea
              value={projectPrompt}
              onChange={(e) => setProjectPrompt(e.target.value)}
              placeholder="Exemple: Construction d'une villa R+1 de 150m² à Brazzaville, avec 4 chambres, 2 salles de bain, salon, cuisine, terrasse. Terrain de 500m². Budget: 50M FCFA. Délai: 6 mois."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 min-h-[120px]"
              disabled={isGenerating}
            />
            <p className="text-sm text-gray-500 mt-2">
               Plus votre description est détaillée, plus le plan sera précis
            </p>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating || !projectPrompt.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Générer le Plan avec IA
              </>
            )}
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200">Erreur</h3>
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Plan généré */}
      {generatedPlan && (
        <div className="space-y-6">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Durée Totale</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {calculateTotalDuration()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Phases</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {generatedPlan.phases.length}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Tâches</span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {generatedPlan.phases.reduce((acc, p) => acc + p.subTasks.length, 0)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Risques</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {generatedPlan.phases.reduce((acc, p) => acc + p.risks.length, 0)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              <Download className="w-5 h-5" />
              Exporter en PDF
            </button>
          </div>

          {/* Phases détaillées */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Plan Détaillé du Projet
            </h2>

            <div className="space-y-4">
              {generatedPlan.phases.map((phase, phaseIndex) => (
                <div
                  key={phaseIndex}
                  className="border dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  {/* Phase header */}
                  <div
                    className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 cursor-pointer hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30 transition-colors"
                    onClick={() => togglePhase(phaseIndex)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedPhases.has(phaseIndex) ? (
                          <ChevronDown className="w-5 h-5 text-purple-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-purple-600" />
                        )}
                        <div>
                          <h3 className="font-bold text-lg">
                            Phase {phaseIndex + 1}: {phase.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {phase.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              {phase.subTasks.length} tâches
                            </span>
                            {phase.risks.length > 0 && (
                              <span className="flex items-center gap-1 text-orange-600">
                                <AlertTriangle className="w-4 h-4" />
                                {phase.risks.length} risques
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phase content */}
                  {expandedPhases.has(phaseIndex) && (
                    <div className="p-4 space-y-4">
                      {/* Risques de la phase */}
                      {phase.risks.length > 0 && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                          <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Risques de la Phase
                          </h4>
                          <ul className="space-y-1">
                            {phase.risks.map((risk, idx) => (
                              <li key={idx} className="text-sm text-orange-700 dark:text-orange-300 flex items-start gap-2">
                                <span className="text-orange-600">•</span>
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Sous-tâches */}
                      <div className="space-y-3">
                        {phase.subTasks.map((task, taskIndex) => {
                          const taskId = `${phaseIndex}-${taskIndex}`;
                          const isExpanded = expandedTasks.has(taskId);

                          return (
                            <div
                              key={taskIndex}
                              className="border dark:border-gray-700 rounded-lg overflow-hidden"
                            >
                              {/* Task header */}
                              <div
                                className="bg-gray-50 dark:bg-gray-900/50 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors"
                                onClick={() => toggleTask(taskId)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-gray-600" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-gray-600" />
                                    )}
                                    <div>
                                      <h4 className="font-semibold">{task.name}</h4>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          {task.tradeSkill}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {task.duration}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Task details */}
                              {isExpanded && (
                                <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
                                  {/* Livrables */}
                                  {task.deliverables.length > 0 && (
                                    <div>
                                      <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        Livrables
                                      </h5>
                                      <ul className="space-y-1">
                                        {task.deliverables.map((deliverable, idx) => (
                                          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                            <span className="text-green-600">✓</span>
                                            <span>{deliverable}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Matériaux */}
                                  {task.materials.length > 0 && (
                                    <div>
                                      <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                        <Package className="w-4 h-4 text-blue-600" />
                                        Matériaux
                                      </h5>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {task.materials.map((material, idx) => (
                                          <div key={idx} className="text-sm bg-blue-50 dark:bg-blue-900/20 rounded px-3 py-2">
                                            <span className="font-medium">{material.name}</span>
                                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                                              {material.quantity} {material.unit}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Outils */}
                                  {task.tools.length > 0 && (
                                    <div>
                                      <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-purple-600" />
                                        Outils
                                      </h5>
                                      <div className="flex flex-wrap gap-2">
                                        {task.tools.map((tool, idx) => (
                                          <span key={idx} className="text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded px-3 py-1">
                                            {tool}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Main d'œuvre */}
                                  <div>
                                    <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                      <Users className="w-4 h-4 text-indigo-600" />
                                      Main d'œuvre
                                    </h5>
                                    <p className="text-sm bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded px-3 py-2">
                                      {task.workforce}
                                    </p>
                                  </div>

                                  {/* Activités */}
                                  {task.activities.length > 0 && (
                                    <div>
                                      <h5 className="font-semibold text-sm mb-2">Activités</h5>
                                      <ul className="space-y-1">
                                        {task.activities.map((activity, idx) => (
                                          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                            <span className="text-gray-400">→</span>
                                            <span>{activity}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Risques */}
                                  {task.risks.length > 0 && (
                                    <div>
                                      <h5 className="font-semibold text-sm mb-2 flex items-center gap-2 text-orange-700 dark:text-orange-300">
                                        <AlertTriangle className="w-4 h-4" />
                                        Risques
                                      </h5>
                                      <ul className="space-y-1">
                                        {task.risks.map((risk, idx) => (
                                          <li key={idx} className="text-sm text-orange-600 dark:text-orange-400 flex items-start gap-2">
                                            <span>⚠️</span>
                                            <span>{risk}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPlanGenerator;
