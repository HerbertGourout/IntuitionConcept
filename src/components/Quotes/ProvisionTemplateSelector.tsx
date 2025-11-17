import React, { useState } from 'react';
import { X, Check, FileText, DollarSign, Info } from 'lucide-react';
import { PROVISION_TEMPLATES, ProvisionTemplate, generateTemplateDisclaimer } from '../../data/provisionTemplates';
import { StructuralProvisions } from '../../types/StructuredQuote';

interface ProvisionTemplateSelectorProps {
  projectType: string;
  onSelect: (provisions: StructuralProvisions) => void;
  onClose: () => void;
}

const ProvisionTemplateSelector: React.FC<ProvisionTemplateSelectorProps> = ({
  projectType,
  onSelect,
  onClose
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ProvisionTemplate | null>(null);

  // Filtrer les templates par type de projet
  const templates = PROVISION_TEMPLATES.filter(t => 
    !projectType || t.projectType === projectType
  );

  const handleSelect = () => {
    if (!selectedTemplate) return;

    const provisions: StructuralProvisions = {
      ...selectedTemplate.provisions,
      disclaimer: generateTemplateDisclaimer(selectedTemplate)
    };

    onSelect(provisions);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalProvisions = (template: ProvisionTemplate) => {
    return template.provisions.foundations + 
           template.provisions.structure + 
           template.provisions.reinforcement;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                Templates de Provisions
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Sélectionnez un template pour pré-remplir les provisions structurelles
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Aucun template disponible pour ce type de projet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                const total = getTotalProvisions(template);

                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`
                      relative p-5 rounded-xl border-2 cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                      }
                    `}
                  >
                    {/* Badge sélectionné */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 p-1 bg-purple-500 rounded-full">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Nom du template */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 pr-8">
                      {template.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4">
                      {template.description}
                    </p>

                    {/* Total */}
                    <div className="flex items-center gap-2 mb-4 p-3 bg-white rounded-lg border border-gray-200">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Total provisions</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(total)}
                        </p>
                      </div>
                    </div>

                    {/* Détails */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fondations:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(template.provisions.foundations)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Structure:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(template.provisions.structure)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ferraillage:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(template.provisions.reinforcement)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Preview du template sélectionné */}
          {selectedTemplate && (
            <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Aperçu du disclaimer
                  </h4>
                  <pre className="text-sm text-blue-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-blue-200">
                    {generateTemplateDisclaimer(selectedTemplate)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedTemplate ? (
              <span className="font-medium text-purple-600">
                Template sélectionné: {selectedTemplate.name}
              </span>
            ) : (
              <span>Sélectionnez un template pour continuer</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedTemplate}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Appliquer ce template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvisionTemplateSelector;
