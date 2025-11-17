import React, { useState } from 'react';
import { FileText, Calendar, User, AlertTriangle, CheckCircle, Layers } from 'lucide-react';
import { StructuralStudy, StructuralStudyStatus, QuoteType, StructuralProvisions } from '../../types/StructuredQuote';
import StructuralStudyService from '../../services/structuralStudyService';
import StructuralStudyBadge from './StructuralStudyBadge';
import DocumentUploader from './DocumentUploader';
import ProvisionTemplateSelector from './ProvisionTemplateSelector';

interface StructuralStudyManagerProps {
  quoteId: string;
  quoteType: QuoteType;
  structuralStudy: StructuralStudy;
  uncertaintyMargin: number;
  onUpdate: () => void;
}

const StructuralStudyManager: React.FC<StructuralStudyManagerProps> = ({
  quoteId,
  quoteType,
  structuralStudy,
  uncertaintyMargin,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [formData, setFormData] = useState<Partial<StructuralStudy>>({
    engineerName: structuralStudy.engineerName || '',
    engineerContact: structuralStudy.engineerContact || '',
    notes: structuralStudy.notes || '',
    completionDate: structuralStudy.completionDate || ''
  });

  const handleStatusChange = async (newStatus: StructuralStudyStatus) => {
    setLoading(true);
    try {
      await StructuralStudyService.updateStudyStatus(quoteId, newStatus, formData);
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToDefinitive = async () => {
    if (!window.confirm('Convertir ce devis en devis définitif ? Cette action nécessite une étude structurale complète.')) {
      return;
    }

    setLoading(true);
    try {
      const validation = await StructuralStudyService.canConvertToDefinitive(quoteId);
      
      if (!validation.canConvert) {
        alert('Impossible de convertir:\n' + validation.reasons.join('\n'));
        return;
      }

      await StructuralStudyService.convertToDefinitive(quoteId, true);
      onUpdate();
    } catch (error) {
      console.error('Erreur conversion:', error);
      alert('Erreur lors de la conversion');
    } finally {
      setLoading(false);
    }
  };

  const getStatusOptions = (): { value: StructuralStudyStatus; label: string; color: string }[] => [
    { value: 'none', label: 'Aucune étude', color: 'bg-gray-100 text-gray-800' },
    { value: 'pending', label: 'Étude prévue', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'in_progress', label: 'En cours', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Complétée', color: 'bg-green-100 text-green-800' }
  ];

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Étude Structurale</h3>
            <p className="text-sm text-gray-600">Gestion de l'étude béton armé</p>
          </div>
        </div>
        <StructuralStudyBadge
          quoteType={quoteType}
          studyStatus={structuralStudy.status}
          uncertaintyMargin={uncertaintyMargin}
          size="md"
        />
      </div>

      {/* Warning pour devis estimatif */}
      {quoteType === 'preliminary' && structuralStudy.status === 'none' && (
        <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-2">⚠️ Devis Estimatif - Attention</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Aucune étude structurale réalisée</li>
                <li>• Les quantités de béton armé et ferraillage sont estimatives</li>
                <li>• Le type de fondations n'est pas déterminé</li>
                <li>• Marge d'incertitude: ±{uncertaintyMargin}%</li>
                <li>• Un devis définitif sera établi après étude béton armé complète</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Statut actuel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Statut de l'étude</label>
          <select
            value={structuralStudy.status}
            onChange={(e) => handleStatusChange(e.target.value as StructuralStudyStatus)}
            disabled={loading}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {getStatusOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Marge d'incertitude</label>
          <div className="px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
            <span className="text-lg font-bold text-gray-900">±{uncertaintyMargin}%</span>
          </div>
        </div>
      </div>

      {/* Détails de l'étude */}
      {isEditing ? (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" />
                Ingénieur structure
              </label>
              <input
                type="text"
                value={formData.engineerName || ''}
                onChange={(e) => setFormData({ ...formData, engineerName: e.target.value })}
                placeholder="Nom de l'ingénieur"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                Contact
              </label>
              <input
                type="text"
                value={formData.engineerContact || ''}
                onChange={(e) => setFormData({ ...formData, engineerContact: e.target.value })}
                placeholder="Email ou téléphone"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes sur l'étude structurale..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange(structuralStudy.status)}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {structuralStudy.engineerName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Ingénieur:</span>
              <span>{structuralStudy.engineerName}</span>
            </div>
          )}

          {structuralStudy.startDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Début:</span>
              <span>{new Date(structuralStudy.startDate).toLocaleDateString('fr-FR')}</span>
            </div>
          )}

          {structuralStudy.completionDate && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium">Complétée le:</span>
              <span>{new Date(structuralStudy.completionDate).toLocaleDateString('fr-FR')}</span>
            </div>
          )}

          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Modifier les détails →
          </button>
        </div>
      )}

      {/* Section Documents */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Documents d'étude
        </h4>
        <DocumentUploader
          quoteId={quoteId}
          documents={(structuralStudy as any).documents}
          onUpdate={onUpdate}
        />
      </div>

      {/* Bouton Templates de provisions */}
      {quoteType === 'preliminary' && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2"
          >
            <Layers className="w-5 h-5" />
            Appliquer un template de provisions
          </button>
          <p className="text-xs text-gray-600 mt-2 text-center">
            Pré-remplir les provisions avec un modèle standard
          </p>
        </div>
      )}

      {/* Actions */}
      {quoteType === 'preliminary' && structuralStudy.status === 'completed' && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleConvertToDefinitive}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {loading ? 'Conversion...' : 'Convertir en Devis Définitif'}
          </button>
          <p className="text-xs text-gray-600 mt-2 text-center">
            Réduit la marge d'incertitude à ±10% et supprime les provisions
          </p>
        </div>
      )}

      {/* Modal Template Selector */}
      {showTemplateSelector && (
        <ProvisionTemplateSelector
          projectType="construction"
          onSelect={(provisions: StructuralProvisions) => {
            console.log('Provisions sélectionnées:', provisions);
            // TODO: Appliquer les provisions au devis
            onUpdate();
          }}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
};

export default StructuralStudyManager;
