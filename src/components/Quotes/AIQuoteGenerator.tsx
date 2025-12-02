import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { QuoteGenerationRequest } from '../../services/ai/quoteGenerator';
import { projectPlanGenerator, ProjectPlan } from '../../services/ai/projectPlanGenerator';

// Interface déplacée vers projectPlanGenerator.ts

interface AIQuoteGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (request: QuoteGenerationRequest) => void;
  isGenerating: boolean;
}

// Supprimé PROJECT_TYPES car plus utilisé avec la nouvelle logique

// Supprimé les fourchettes prédéfinies pour permettre la saisie libre

export const AIQuoteGenerator: React.FC<AIQuoteGeneratorProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating
}) => {
  const [currentStep, setCurrentStep] = useState<'prompt' | 'plan' | 'quote'>('prompt');
  const [projectPrompt, setProjectPrompt] = useState('');
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  
  // Supprimé les anciens champs non utilisés

  const generateProjectPlan = async () => {
    if (!projectPrompt.trim()) return;
    
    setIsGeneratingPlan(true);
    try {
      // Appel à Service pour générer le plan de projet
      const plan = await projectPlanGenerator.generatePlanFromPrompt(projectPrompt);
      setProjectPlan(plan);
      setCurrentStep('plan');
    } catch (error) {
      console.error('Erreur génération plan:', error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };
  
  const generateQuoteFromPlan = () => {
    if (!projectPlan) return;
    
    // Convertir le plan en request pour le générateur de devis
    const request: QuoteGenerationRequest = {
      projectType: 'construction',
      description: projectPrompt,
      budget: {
        min: 0,
        max: 0,
        currency: 'XAF'
      },
      location: extractLocationFromPrompt(projectPrompt),
      timeline: '',
      specialRequirements: [],
      projectPlan: projectPlan // Nouveau champ pour le plan détaillé
    };

    onGenerate(request);
    setCurrentStep('quote');
  };
  
  const extractLocationFromPrompt = (prompt: string): string => {
    // Extraction simple de la localisation du prompt
    const locationMatch = prompt.match(/(?:à|dans|sur)\s+([A-Za-zÀ-ÿ\s]+?)(?:[,.]|$)/i);
    return locationMatch ? locationMatch[1].trim() : '';
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 'prompt') {
      generateProjectPlan();
    } else if (currentStep === 'plan') {
      generateQuoteFromPlan();
    }
  };

  const isFormValid = currentStep === 'prompt' ? projectPrompt.trim().length > 0 : true;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Étapes de progression */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${
                currentStep === 'prompt' ? 'text-purple-600' : 'text-green-600'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'prompt' ? 'bg-purple-100 border-2 border-purple-600' : 'bg-green-100'
                }`}>
                  {currentStep === 'prompt' ? '1' : <CheckCircle className="w-5 h-5" />}
                </div>
                <span className="text-sm font-medium">Description projet</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center space-x-2 ${
                currentStep === 'plan' ? 'text-purple-600' : 
                currentStep === 'quote' ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'plan' ? 'bg-purple-100 border-2 border-purple-600' :
                  currentStep === 'quote' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {currentStep === 'quote' ? <CheckCircle className="w-5 h-5" /> : '2'}
                </div>
                <span className="text-sm font-medium">Plan détaillé</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center space-x-2 ${
                currentStep === 'quote' ? 'text-purple-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'quote' ? 'bg-purple-100 border-2 border-purple-600' : 'bg-gray-100'
                }`}>
                  3
                </div>
                <span className="text-sm font-medium">Devis détaillé</span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 'prompt' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Description détaillée du projet de bâtiment *
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-800 mb-2"> Informations à inclure :</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Type :</strong> Maison, immeuble, bureau, entrepôt...</li>
                    <li>• <strong>Surface :</strong> Surface totale et par niveau</li>
                    <li>• <strong>Étages :</strong> Nombre de niveaux</li>
                    <li>• <strong>Finition :</strong> Standard, haut de gamme, économique</li>
                    <li>• <strong>Infrastructures :</strong> Électricité, plomberie, climatisation...</li>
                    <li>• <strong>Localisation :</strong> Ville, quartier, contraintes du terrain</li>
                  </ul>
                </div>
                <textarea
                  value={projectPrompt}
                  onChange={(e) => setProjectPrompt(e.target.value)}
                  placeholder="Exemple : Construction d'une maison R+1 de 150m² à Dakar, avec 4 chambres, salon, cuisine moderne, 2 salles de bain. Finition haut de gamme avec carrelage, climatisation dans toutes les pièces, cuisine équipée. Terrain de 300m² dans le quartier des Almadies avec accès facile. Prévoir forage et château d'eau."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={8}
                  required
                />
              </div>
            )}

            
            {currentStep === 'plan' && projectPlan && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Plan de projet généré avec succès !</h3>
                  <p className="text-green-700 text-sm">Voici le plan détaillé basé sur votre description. Vérifiez les phases et cliquez sur "Générer le devis" pour continuer.</p>
                </div>
                
                <div className="space-y-4">
                  {projectPlan.phases.map((phase, phaseIndex) => (
                    <div key={phaseIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">{phase.name}</h4>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {phase.duration}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {phase.subTasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="bg-gray-50 p-3 rounded">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{task.name}</span>
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                {task.tradeSkill}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-gray-600 mb-1">
                                  📋 <strong>Livrables:</strong> {task.deliverables.join(', ')}
                                </p>
                                <p className="text-gray-500">⏱️ <strong>Durée:</strong> {task.duration}</p>
                                <p className="text-purple-600">
                                  👥 <strong>Main d'œuvre:</strong> {task.workforce || 'Non spécifié'}
                                </p>
                              </div>
                              <div>
                                <p className="text-green-600 mb-1">
                                  🔧 <strong>Outils:</strong> {task.tools?.join(', ') || 'Non spécifié'}
                                </p>
                                <p className="text-blue-600">
                                   <strong>Activités:</strong> {task.activities?.join(', ') || 'Non spécifié'}
                                </p>
                              </div>
                            </div>
                            
                            {task.materials && task.materials.length > 0 && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-xs font-medium text-yellow-800 mb-1">🧱 Matériaux:</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-xs text-yellow-700">
                                  {task.materials.map((material, matIndex) => (
                                    <span key={matIndex}>
                                      {material.name}: {material.quantity} {material.unit}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {task.risks.length > 0 && (
                              <p className="text-xs text-orange-600 mt-2">
                                ⚠️ <strong>Risques:</strong> {task.risks.join(', ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {phase.risks.length > 0 && (
                        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
                          <p className="text-sm text-orange-700">
                            <strong>⚠️ Points de vigilance :</strong> {phase.risks.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="flex items-center">
                <Sparkles className="w-4 h-4 mr-1" />
                {currentStep === 'prompt' ? 'L\'IA analysera votre description pour créer un plan détaillé' :
                 currentStep === 'plan' ? 'Validez le plan pour générer un devis détaillé' :
                 'L\'IA génère un devis personnalisé basé sur le plan'}
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isGenerating || isGeneratingPlan}
              >
                Annuler
              </button>
              {currentStep === 'plan' && (
                <button
                  type="button"
                  onClick={() => setCurrentStep('prompt')}
                  className="px-6 py-2 text-purple-600 hover:text-purple-800 transition-colors"
                  disabled={isGenerating || isGeneratingPlan}
                >
                  ← Retour
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isGenerating || isGeneratingPlan}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isGeneratingPlan ? 'Génération du plan...' :
                   isGenerating ? 'Génération du devis...' :
                   currentStep === 'prompt' ? 'Générer le plan' :
                   currentStep === 'plan' ? 'Générer le devis' : 'Générer'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
