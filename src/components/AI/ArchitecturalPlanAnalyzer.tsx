import React, { useState, useCallback } from 'react';
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileText,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import QuoteCreatorSimple from '../Quotes/QuoteCreatorSimple';
import type { Quote } from '../../services/quotesService';
import Render3DGenerator from './Render3DGenerator';

// Types pour l'analyse architecturale
interface AnalysisStep {
  id: string;
  title: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
}

interface GeneratedQuote {
  totalCost?: number;
  title?: string;
  phases?: Array<{
    name?: string;
    description?: string;
    totalCost?: number;
    lignes?: Array<{
      designation?: string;
      description?: string;
      unit?: string;
      quantity?: number;
      unitPrice?: number;
      totalPrice?: number;
    }>;
  }>;
}

const ArchitecturalPlanAnalyzer: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [planPreview, setPlanPreview] = useState<string | null>(null);
  const [generatedQuote, setGeneratedQuote] = useState<GeneratedQuote | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showQuoteEditor, setShowQuoteEditor] = useState(false);
  const [editQuote, setEditQuote] = useState<Quote | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [show3DGenerator, setShow3DGenerator] = useState(false);
  const [planImageBase64, setPlanImageBase64] = useState<string | null>(null);
  const { formatAmount } = useCurrency();
  const { currentProject } = useProjectContext();

  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    { id: 'ocr', title: 'Extraction OCR du plan', status: 'waiting', progress: 0 },
    { id: 'analysis', title: 'Analyse architecturale', status: 'waiting', progress: 0 },
    { id: 'quote', title: 'Génération du devis', status: 'waiting', progress: 0 },
  ]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPlanPreview(result);
      setPlanImageBase64(result);
    };
    reader.readAsDataURL(file);
    
    toast.success(`Plan "${file.name}" chargé avec succès`);
  }, []);

  const startAnalysis = useCallback(async () => {
    if (!uploadedFile) {
      toast.error('Veuillez d\'abord charger un plan');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis steps
    for (let i = 0; i < analysisSteps.length; i++) {
      setAnalysisSteps(prev => prev.map((step, idx) => 
        idx === i ? { ...step, status: 'processing', progress: 50 } : step
      ));
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnalysisSteps(prev => prev.map((step, idx) => 
        idx === i ? { ...step, status: 'completed', progress: 100 } : step
      ));
    }

    // Generate mock quote
    setGeneratedQuote({
      title: 'Devis - Analyse de plan',
      totalCost: 15000000,
      phases: [
        {
          name: 'Gros œuvre',
          description: 'Travaux de structure',
          totalCost: 8000000,
          lignes: [
            { designation: 'Fondations', quantity: 1, unit: 'forfait', unitPrice: 3000000, totalPrice: 3000000 },
            { designation: 'Murs porteurs', quantity: 50, unit: 'm²', unitPrice: 50000, totalPrice: 2500000 },
            { designation: 'Dalle béton', quantity: 50, unit: 'm²', unitPrice: 50000, totalPrice: 2500000 },
          ],
        },
        {
          name: 'Second œuvre',
          description: 'Finitions',
          totalCost: 7000000,
          lignes: [
            { designation: 'Électricité', quantity: 1, unit: 'forfait', unitPrice: 2500000, totalPrice: 2500000 },
            { designation: 'Plomberie', quantity: 1, unit: 'forfait', unitPrice: 2000000, totalPrice: 2000000 },
            { designation: 'Peinture', quantity: 100, unit: 'm²', unitPrice: 15000, totalPrice: 1500000 },
            { designation: 'Carrelage', quantity: 50, unit: 'm²', unitPrice: 20000, totalPrice: 1000000 },
          ],
        },
      ],
    });

    setIsAnalyzing(false);
    toast.success('Analyse terminée avec succès !');
  }, [uploadedFile, analysisSteps.length]);

  const resetAnalysis = useCallback(() => {
    setUploadedFile(null);
    setPlanPreview(null);
    setGeneratedQuote(null);
    setPlanImageBase64(null);
    setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'waiting', progress: 0 })));
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Analyseur de Plans Architecturaux</h1>
            <p className="text-indigo-100">Générez automatiquement un devis à partir de votre plan</p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      {!planPreview && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Charger votre plan</h2>
              <p className="text-gray-600 dark:text-gray-300">Importez un plan architectural (image ou PDF)</p>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-indigo-400 transition-colors">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="plan-upload"
            />
            <label htmlFor="plan-upload" className="cursor-pointer flex flex-col items-center">
              <Upload className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Cliquez ou glissez votre plan ici
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Formats acceptés: PNG, JPG, PDF
              </p>
            </label>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {planPreview && !isAnalyzing && !generatedQuote && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Aperçu du plan</h3>
            <div className="flex gap-2">
              <button
                onClick={resetAnalysis}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
              >
                Changer de plan
              </button>
              <button
                onClick={startAnalysis}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Analyser le plan
              </button>
            </div>
          </div>
          <img src={planPreview} alt="Plan" className="max-h-96 mx-auto rounded-lg" />
        </div>
      )}

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analyse en cours</h2>
              <p className="text-gray-600 dark:text-gray-300">Notre IA analyse votre plan architectural</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {analysisSteps.map((step) => (
              <div key={step.id} className="flex items-center space-x-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex-shrink-0">
                  {step.status === 'processing' && (
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  )}
                  {step.status === 'completed' && (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  )}
                  {step.status === 'waiting' && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                  )}
                  {step.status === 'error' && (
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{step.title}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Quote */}
      {generatedQuote && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Devis généré</h3>
            <div className="text-2xl font-bold text-indigo-600">
              {formatAmount(generatedQuote.totalCost || 0)}
            </div>
          </div>
          
          <div className="space-y-4">
            {generatedQuote.phases?.map((phase, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">{phase.name}</h4>
                    <p className="text-sm text-gray-500">{phase.description}</p>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    {formatAmount(phase.totalCost || 0)}
                  </div>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm">Désignation</th>
                      <th className="px-4 py-2 text-center text-sm">Qté</th>
                      <th className="px-4 py-2 text-center text-sm">Unité</th>
                      <th className="px-4 py-2 text-right text-sm">Prix Unit.</th>
                      <th className="px-4 py-2 text-right text-sm">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phase.lignes?.map((item, itemIndex) => (
                      <tr key={itemIndex} className="border-t border-gray-200 dark:border-gray-600">
                        <td className="px-4 py-2">{item.designation}</td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-center">{item.unit}</td>
                        <td className="px-4 py-2 text-right">{formatAmount(item.unitPrice || 0)}</td>
                        <td className="px-4 py-2 text-right font-medium">{formatAmount(item.totalPrice || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Client Info Form */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-bold mb-4">Informations client</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nom du client"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Email du client"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={resetAnalysis}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Nouvelle analyse
            </button>
            <button
              onClick={() => setShow3DGenerator(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Générer rendu 3D
            </button>
            <button
              onClick={() => toast.success('Devis enregistré !')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Enregistrer le devis
            </button>
          </div>
        </div>
      )}

      {/* Quote Editor Modal */}
      {showQuoteEditor && editQuote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
            <QuoteCreatorSimple
              onClose={() => setShowQuoteEditor(false)}
              editQuote={editQuote}
              onQuoteCreated={() => {
                setShowQuoteEditor(false);
                toast.success('Devis sauvegardé !');
              }}
            />
          </div>
        </div>
      )}

      {/* 3D Generator Modal */}
      {show3DGenerator && planImageBase64 && (
        <Render3DGenerator
          planImage={planImageBase64}
          onClose={() => setShow3DGenerator(false)}
        />
      )}
    </div>
  );
};

export default ArchitecturalPlanAnalyzer;
