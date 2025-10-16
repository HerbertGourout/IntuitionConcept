import React, { useState, useCallback } from 'react';
import {
  Upload,
  CheckCircle,
  DollarSign,
  AlertTriangle,
  Download,
  Play,
  RefreshCw,
  Loader2,
  Edit2,
  FileImage,
  Zap,
  Home,
  Building
} from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { ClaudeServiceDirect, initializeClaudeServiceDirect } from '../../services/ai/claudeServiceDirect';
import { PDFSplitter, extractPDFMetadata, getPDFFileStats } from '../../utils/pdfSplitter';
import { convertClaudeQuoteToAppQuote, extractPlanMetadata } from '../../utils/claudeQuoteConverter';
import { generateArticlesForPhase } from '../../utils/quoteArticlesGenerator';
import { BTP_STANDARD_PHASES } from '../../constants/btpPhases';
import QuoteCreatorSimple from '../Quotes/QuoteCreatorSimple';
import type { Quote } from '../../services/quotesService';
import jsPDF from 'jspdf';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import autoTable from 'jspdf-autotable'; // Étend automatiquement jsPDF avec la méthode autoTable

// Extension des types jsPDF pour jspdf-autotable
// Note: jspdf-autotable n'a pas de types TypeScript complets
type jsPDFWithAutoTable = jsPDF & {
  autoTable: (options: any) => jsPDF; // eslint-disable-line @typescript-eslint/no-explicit-any
  lastAutoTable: {
    finalY: number;
  };
};

// import { qwenService } from '../../services/ai/qwenService'; // Désactivé - Claude fait tout le travail

// Types pour l'analyse architecturale
interface Wall {
  type: string;
  material?: string;
}

interface Room {
  name: string;
  area?: number;
  dimensions?: string | { length: number; width: number; height?: number };
  floor?: number;
  purpose?: string;
}

interface AnalysisStep {
  id: string;
  title: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
}

interface ArchitecturalPlanAnalysis {
  extractedMeasurements: {
    rooms?: Room[];
    totalArea?: number;
  };
  constructionElements?: {
    walls?: Wall[];
  };
  estimatedComplexity?: 'low' | 'moderate' | 'high' | 'very_high';
  planType?: string;
}

interface ClaudeQuoteItem {
  designation?: string;
  description?: string;  // Alias pour designation
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  prixUnitaire?: number;
  totalPrice?: number;
  prixTotal?: number;
  note?: string;
}

interface ClaudeQuotePhase {
  name?: string;
  poste?: string;
  description?: string;
  items?: ClaudeQuoteItem[];
}

interface ClaudeDetailedQuote {
  phases?: ClaudeQuotePhase[];
}

interface GeneratedQuote {
  totalCost?: number;
  totalDuration?: number;
  title?: string;
  phases?: Array<{
    name?: string;
    description?: string;
    totalCost?: number;
    duration?: number;
    lignes?: ClaudeQuoteItem[];
  }>;
}

const ArchitecturalPlanAnalyzer: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ArchitecturalPlanAnalysis | null>(null);
  const [generatedQuote, setGeneratedQuote] = useState<GeneratedQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showQuoteEditor, setShowQuoteEditor] = useState(false);
  const [convertedQuote, setConvertedQuote] = useState<Omit<Quote, 'id'> | null>(null);
  const { formatAmount } = useCurrency();

  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    {
      id: 'ocr',
      title: 'Extraction OCR du plan',
      status: 'waiting',
      progress: 0
    },
    {
      id: 'analysis',
      title: 'Analyse architecturale IA',
      status: 'waiting',
      progress: 0
    },
    {
      id: 'quote',
      title: 'Génération du devis',
      status: 'waiting',
      progress: 0
    }
  ]);

  const updateStepStatus = (stepId: string, status: AnalysisStep['status'], progress: number = 0) => {
    setAnalysisSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, progress } : step
    ));
  };

  const handleFileUpload = useCallback(async (file: File) => {
    // Vérifier la taille du fichier
    const fileSizeMB = file.size / (1024 * 1024);
    
    console.log(`📄 Fichier uploadé: ${file.name} (${fileSizeMB.toFixed(2)} MB)`);
    
    // Validation du fichier
    if (!file.type.includes('pdf')) {
      setError('⚠️ Seuls les fichiers PDF sont supportés pour une analyse sans perte de qualité.');
      return;
    }

    try {
      // Extraire les métadonnées sans modifier le fichier
      const metadata = await extractPDFMetadata(file);
      console.log('📊 Métadonnées PDF:', metadata);
      
      // Obtenir les statistiques
      const stats = await getPDFFileStats(file);
      console.log('📈 Statistiques PDF:', stats);
      
      setUploadedFile(file);
      setError(null);
      setAnalysis(null);
      setGeneratedQuote(null);
      
      // Reset analysis steps
      setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'waiting', progress: 0 })));
      
      console.log(`✅ Fichier prêt pour analyse (${stats.pageCount} pages, qualité préservée à 100%)`);
      
    } catch (err) {
      console.error('❌ Erreur validation PDF:', err);
      setError('Erreur lors de la validation du PDF. Assurez-vous que le fichier est valide.');
    }
    
    return false; // Prevent default upload
  }, []);

  const startAnalysis = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const fileSizeMB = uploadedFile.size / (1024 * 1024);
      console.log(`🚀 Démarrage analyse sans perte - Fichier: ${fileSizeMB.toFixed(2)} MB`);

      // Step 1: Découpe PDF sans compression
      updateStepStatus('ocr', 'processing', 10);
      console.log('✂️ Découpe PDF par page (qualité 100% préservée)...');
      
      const splitResult = await PDFSplitter.splitPDF(uploadedFile, {
        preserveMetadata: true,
        preserveQuality: true,
        extractImages: true,
        includeAnnotations: true
      });
      
      console.log(`📑 ${splitResult.pages.length} pages extraites sans perte`);
      console.log(`📊 Taille totale: ${(splitResult.totalSize / 1024 / 1024).toFixed(2)} MB`);
      updateStepStatus('ocr', 'completed', 100);

      // Step 2: Initialiser Claude Service Direct
      updateStepStatus('analysis', 'processing', 10);
      
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('❌ Clé API Anthropic manquante. Configurez VITE_ANTHROPIC_API_KEY dans .env.local');
      }
      
      const claudeService = initializeClaudeServiceDirect(apiKey, ClaudeServiceDirect.getAvailableModels().SONNET);
      
      // Vérifier la santé du service
      const isHealthy = await claudeService.healthCheck();
      if (!isHealthy) {
        throw new Error('❌ Service Claude non disponible. Vérifiez votre clé API.');
      }
      
      console.log('✅ Service Claude initialisé et opérationnel');
      updateStepStatus('analysis', 'processing', 30);

      // Step 3: Analyser le PDF avec Claude (sans perte)
      console.log('🔍 Analyse architecturale avec Claude (PDF natif)...');
      
      const analysisResult = await claudeService.analyzePDFArchitecturalPlan(uploadedFile, {
        preserveQuality: true,
        splitByPage: true,
        extractMetadata: true,
        maxPagesPerRequest: 5,
        includeImages: true
      });
      
      console.log('✅ Analyse Claude terminée:', analysisResult);
      console.log(`💰 Coût: ${analysisResult.metadata.cost.toFixed(2)} FCFA`);
      console.log(`⏱️ Durée: ${(analysisResult.metadata.processingTime / 1000).toFixed(2)}s`);
      
      // Convertir au format attendu par l'interface
      const detectedRooms = (analysisResult.architecturalData.measurements.rooms || []).map(room => {
        const safeRoom: Room = {
          name: room.name || 'Espace non nommé',
          area: typeof room.area === 'number' && !Number.isNaN(room.area) ? room.area : undefined,
          floor: typeof room.floor === 'number' && !Number.isNaN(room.floor) ? room.floor : undefined,
          purpose: room.purpose
        };

        if (typeof room.dimensions === 'string') {
          safeRoom.dimensions = room.dimensions;
        } else if (room.dimensions && typeof room.dimensions === 'object') {
          safeRoom.dimensions = {
            length: room.dimensions.length ?? 0,
            width: room.dimensions.width ?? 0,
            height: room.dimensions.height
          };
        }

        return safeRoom;
      });
      const totalAreaFromRooms = detectedRooms.reduce((sum, room) => sum + (room.area || 0), 0);
      const computedTotalArea = analysisResult.architecturalData.measurements.totalArea || totalAreaFromRooms || 120;

      const convertedAnalysis: ArchitecturalPlanAnalysis = {
        extractedMeasurements: {
          rooms: detectedRooms,
          totalArea: computedTotalArea
        },
        constructionElements: {
          walls: analysisResult.architecturalData.measurements.walls?.map(w => ({
            type: w.type || 'Mur',
            material: w.material || 'Inconnu'
          })) || []
        },
        estimatedComplexity: analysisResult.architecturalData.estimatedComplexity,
        planType: analysisResult.architecturalData.planType
      };
      
      setAnalysis(convertedAnalysis);
      updateStepStatus('analysis', 'completed', 100);

      // Step 4: Génération du devis détaillé avec IA métreur-expert
      updateStepStatus('quote', 'processing', 30);
      console.log('📝 Génération du devis détaillé avec IA métreur-expert...');
      
      const totalArea = computedTotalArea;
      const rooms = detectedRooms;
      const roomCount = rooms.length || 3;
      const complexity = analysisResult.architecturalData.estimatedComplexity;

      const floorSet = new Set<number>();
      rooms.forEach(room => {
        if (typeof room.floor === 'number' && !Number.isNaN(room.floor)) {
          floorSet.add(room.floor);
        }
      });
      const floorCount = Math.max(1, floorSet.size);

      // Génération du devis : Utiliser les données de Claude directement
      let generatedQuote: GeneratedQuote;
      let usedAIQuote = false;

      // NOUVEAU: Vérifier si Claude a déjà généré un devis détaillé
      const claudeDetailedQuote = (analysisResult.architecturalData as { detailedQuote?: ClaudeDetailedQuote }).detailedQuote;
      
      if (claudeDetailedQuote && claudeDetailedQuote.phases && claudeDetailedQuote.phases.length > 0) {
        console.log('✅ Utilisation du devis détaillé généré par Claude');
        updateStepStatus('quote', 'processing', 70);
        
        // Convertir le format Claude vers GeneratedQuote
        generatedQuote = {
          totalCost: claudeDetailedQuote.phases.reduce((sum: number, phase: ClaudeQuotePhase) => {
            const phaseTotal = phase.items?.reduce((itemSum: number, item: ClaudeQuoteItem) => itemSum + (item.totalPrice || item.prixTotal || 0), 0) || 0;
            return sum + phaseTotal;
          }, 0),
          totalDuration: Math.ceil((totalArea * floorCount) / 12),
          title: `Devis détaillé - ${splitResult.originalMetadata.title || uploadedFile.name}`,
          phases: claudeDetailedQuote.phases.map((phase: ClaudeQuotePhase) => ({
            name: phase.name || phase.poste || 'Phase',
            description: phase.description || '',
            totalCost: phase.items?.reduce((sum: number, item: ClaudeQuoteItem) => sum + (item.totalPrice || item.prixTotal || 0), 0) || 0,
            duration: 0,
            lignes: phase.items || [] // Garder les items détaillés
          }))
        };
        
        usedAIQuote = true;
        console.log('✅ Devis Claude converti avec succès - Total:', generatedQuote.totalCost, 'FCFA');
      } else {
        // FALLBACK: Génération devis détaillé avec 13 phases standard BTP
        console.log('ℹ️ Claude n\'a pas généré de devis détaillé, utilisation du fallback avec 13 phases...');
        updateStepStatus('quote', 'processing', 60);
        
        // Multiplicateur de complexité pour ajuster les prix
        const complexityMultiplier = {
          'low': 0.85,
          'moderate': 1.0,
          'high': 1.25,
          'very_high': 1.6
        }[complexity] || 1.0;
        
        console.log(`📊 Complexité détectée: ${complexity} (multiplicateur: ${complexityMultiplier})`);
        
        // Générer les 13 phases avec articles détaillés
        const phases = BTP_STANDARD_PHASES.map((phaseTemplate) => {
          // Générer articles avec quantités calculées
          const articles = generateArticlesForPhase(
            phaseTemplate.name,
            totalArea,
            roomCount,
            floorCount
          );
          
          // Appliquer le multiplicateur de complexité aux prix
          const adjustedArticles = articles.map(article => ({
            ...article,
            unitPrice: Math.round(article.unitPrice * complexityMultiplier),
            totalPrice: Math.round(article.totalPrice * complexityMultiplier)
          }));
          
          const phaseTotal = adjustedArticles.reduce((sum, art) => sum + art.totalPrice, 0);
          
          return {
            name: phaseTemplate.name,
            description: phaseTemplate.description,
            totalCost: phaseTotal,
            duration: Math.ceil(totalArea / 20), // Estimation durée par phase
            lignes: adjustedArticles
          };
        });
        
        const totalCost = phases.reduce((sum, p) => sum + p.totalCost, 0);
        const totalDuration = Math.ceil((totalArea * floorCount) / 12);
        
        generatedQuote = {
          totalCost,
          totalDuration,
          title: `Devis détaillé - ${splitResult.originalMetadata.title || uploadedFile.name}`,
          phases
        };
        
        console.log(`✅ Devis détaillé généré : ${phases.length} phases, ${phases.reduce((sum, p) => sum + (p.lignes?.length || 0), 0)} articles`);
        console.log(`💰 Total ajusté selon complexité (${complexity}): ${formatAmount(totalCost)}`);
      }
      
      setGeneratedQuote(generatedQuote);
      updateStepStatus('quote', 'completed', 100);
      
      if (usedAIQuote) {
        console.log('🎉 Devis détaillé IA généré avec succès (métreur-expert)!');
      } else {
        console.log('🎉 Devis estimatif standard généré avec succès!');
      }
      
      // Convertir le devis au format de l'application
      const planMetadata = extractPlanMetadata(analysisResult);
      const appQuote = convertClaudeQuoteToAppQuote(analysisResult.architecturalData, planMetadata);
      setConvertedQuote(appQuote);
      console.log('✅ Devis converti au format de l\'application');
      
      console.log('🎉 Analyse complète terminée avec succès!');

    } catch (err) {
      console.error('❌ Analysis failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Erreur lors de l'analyse: ${errorMessage}`);
      
      // Mark current step as error
      const currentStep = analysisSteps.find(step => step.status === 'processing');
      if (currentStep) {
        updateStepStatus(currentStep.id, 'error');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setUploadedFile(null);
    setAnalysis(null);
    setGeneratedQuote(null);
    setError(null);
    setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'waiting', progress: 0 })));
  };

  const downloadQuote = () => {
    if (!generatedQuote) return;
    
    try {
      // Générer un PDF professionnel avec jsPDF
      const doc = new jsPDF() as jsPDFWithAutoTable;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;
      
      // En-tête du document
      doc.setFillColor(139, 92, 246); // Purple
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('DEVIS DÉTAILLÉ', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(generatedQuote.title || 'Analyse Plan Architectural', pageWidth / 2, 30, { align: 'center' });
      
      yPosition = 50;
      
      // Informations générales
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, yPosition);
      doc.text(`Fichier: ${uploadedFile?.name || 'Plan architectural'}`, 14, yPosition + 6);
      
      yPosition += 20;
      
      // Résumé
      doc.setFillColor(243, 244, 246);
      doc.rect(14, yPosition, pageWidth - 28, 30, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RÉSUMÉ', 20, yPosition + 10);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Montant Total: ${formatAmount(generatedQuote.totalCost ?? 0)}`, 20, yPosition + 18);
      doc.text(`Durée Estimée: ${generatedQuote.totalDuration ?? 0} jours`, 20, yPosition + 24);
      doc.text(`Nombre de Phases: ${generatedQuote.phases?.length ?? 0}`, pageWidth / 2 + 10, yPosition + 18);
      
      yPosition += 40;
      
      // Détail des phases
      generatedQuote.phases?.forEach((phase) => {
        // Vérifier si on a besoin d'une nouvelle page
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }
        
        // En-tête phase
        doc.setFillColor(237, 233, 254);
        doc.rect(14, yPosition, pageWidth - 28, 12, 'F');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(109, 40, 217);
        doc.text(`${phase.name ?? ''}`, 20, yPosition + 8);
        doc.text(`${formatAmount(phase.totalCost ?? 0)}`, pageWidth - 20, yPosition + 8, { align: 'right' });
        
        yPosition += 14;
        
        // Description
        if (phase.description) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 100, 100);
          doc.text(phase.description, 20, yPosition);
          yPosition += 6;
        }
        
        // Tableau des articles
        if (phase.lignes && phase.lignes.length > 0) {
          const tableData = phase.lignes.map((item: ClaudeQuoteItem) => [
            item.designation || item.description || '',
            item.unit || 'u',
            (item.quantity || 0).toString(),
            formatAmount(item.unitPrice || item.prixUnitaire || 0),
            formatAmount(item.totalPrice || item.prixTotal || 0)
          ]);
          
          doc.autoTable({
            startY: yPosition,
            head: [['Désignation', 'Unité', 'Qté', 'P.U.', 'Total']],
            body: tableData,
            theme: 'striped',
            headStyles: {
              fillColor: [139, 92, 246],
              textColor: 255,
              fontSize: 9,
              fontStyle: 'bold'
            },
            bodyStyles: {
              fontSize: 8,
              textColor: 50
            },
            columnStyles: {
              0: { cellWidth: 'auto' },
              1: { cellWidth: 20, halign: 'center' },
              2: { cellWidth: 20, halign: 'right' },
              3: { cellWidth: 35, halign: 'right' },
              4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: 14, right: 14 }
          });
          
          yPosition = doc.lastAutoTable.finalY + 10;
        } else {
          yPosition += 4;
        }
      });
      
      // Pied de page sur toutes les pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `IntuitionConcept BTP Platform - Page ${i}/${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
      
      // Télécharger le PDF
      const filename = `devis_${uploadedFile?.name.replace('.pdf', '') || 'plan'}_${Date.now()}.pdf`;
      doc.save(filename);
      
      console.log('✅ PDF exporté avec succès:', filename);
    } catch (error) {
      console.error('❌ Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de la génération du PDF. Vérifiez que jsPDF est installé.');
    }
  };

  const getPlanTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'residential': 'Résidentiel',
      'commercial': 'Commercial',
      'industrial': 'Industriel',
      'mixed': 'Mixte'
    };
    return labels[type] || type;
  };

  const getComplexityLabel = (complexity: string) => {
    const labels: Record<string, string> = {
      'simple': 'Simple',
      'moderate': 'Modéré',
      'complex': 'Complexe',
      'very_complex': 'Très complexe'
    };
    return labels[complexity] || complexity;
  };


  return (
    <div className="p-8 space-y-10">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Analyseur de Plans Architecturaux IA
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Uploadez vos plans d'architecture et obtenez automatiquement une analyse détaillée avec devis
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">1. Télécharger le Plan</h2>
              <p className="text-blue-100 text-base">Glissez-déposez ou sélectionnez votre fichier</p>
            </div>
          </div>
        </div>
          
          <div className="p-8">
            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
            >
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
                id="plan-upload"
              />
              <label htmlFor="plan-upload" className="cursor-pointer block">
                <div className="flex flex-col items-center space-y-8">
                  <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <FileImage className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="text-center space-y-4">
                    <p className="text-2xl font-medium text-gray-900 dark:text-white">
                      Glissez-déposez votre plan ici
                    </p>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                      ou cliquez pour sélectionner un fichier
                    </p>
                    <p className="text-base text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-6 py-3 rounded-lg inline-block">
                      📁 Format supporté: PDF uniquement
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg inline-block">
                      ✨ Qualité 100% préservée - Aucune compression - Analyse page par page
                    </p>
                  </div>
                </div>
              </label>
            </div>
            
            {uploadedFile && (
          <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-green-800 dark:text-green-200">
                    ✅ Fichier téléchargé: {uploadedFile.name}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Taille: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB — Analyse requise
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Analyser</span>
                </button>
                <button
                  onClick={resetAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
          </div>
      </div>

      {/* Analysis Steps */}
      {isAnalyzing && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Analyse en cours</h2>
              <p className="text-gray-600 dark:text-gray-300 text-base">Notre IA analyse votre plan architectural</p>
            </div>
          </div>
            
          <div className="space-y-6">
            {analysisSteps.map((step) => (
              <div key={step.id} className="flex items-center space-x-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex-shrink-0">
                  {step.status === 'processing' && (
                    <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                  )}
                  {step.status === 'completed' && (
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  )}
                  {step.status === 'waiting' && (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  )}
                  {step.status === 'error' && (
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{step.title}</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-blue-600 dark:bg-blue-400 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Erreur d'Analyse
              </h3>
            </div>
            <p className="text-base text-red-700 dark:text-red-300 mt-3">
              {error}
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-4 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">3. Résultats de l'Analyse</h2>
                  <p className="text-green-100 text-sm">Plan analysé avec succès</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Main Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <FileImage className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Type de Plan</h3>
                      <p className="text-xl font-bold text-blue-900 dark:text-blue-200">{getPlanTypeLabel(analysis.planType || 'unknown')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Home className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300">Pièces Détectées</h3>
                      <p className="text-xl font-bold text-purple-900 dark:text-purple-200">{analysis.extractedMeasurements.rooms?.length || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">Complexité</h3>
                      <p className="text-xl font-bold text-green-900 dark:text-green-200">{getComplexityLabel(analysis.estimatedComplexity || 'moderate')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Home className="w-5 h-5" />
                    <span>Pièces Détectées</span>
                  </h3>
                  <div className="space-y-2">
                    {analysis.extractedMeasurements.rooms?.map((room, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{room.name}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{room.area || 0} m²</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Building className="w-5 h-5" />
                    <span>Éléments de Construction</span>
                  </h3>
                  <div className="space-y-2">
                    {analysis.constructionElements?.walls?.map((wall: Wall, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-600 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{wall.type}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{wall.material || 'Non spécifié'}</span>
                      </div>
                    )) || (
                      <div className="p-3 bg-white dark:bg-gray-600 rounded-lg text-center text-gray-500 dark:text-gray-400">
                        Aucun élément de construction détecté
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quote Generation */}
        {generatedQuote && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">4. Devis Généré</h2>
                    <p className="text-yellow-100 text-sm">Estimation automatique des coûts</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {convertedQuote && (
                    <button
                      onClick={() => setShowQuoteEditor(true)}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Edit2 className="w-5 h-5" />
                      <span>Éditer</span>
                    </button>
                  )}
                  <button
                    onClick={downloadQuote}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Télécharger</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                  <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">Total Estimé</h3>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                    {formatAmount(generatedQuote?.totalCost || 0)}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Délai Estimé</h3>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{generatedQuote?.totalDuration || 0} jours</p>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                  <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300">Phases</h3>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">{generatedQuote?.phases?.length || 0}</p>
                </div>
              </div>

              {/* Détail des phases avec articles */}
              <div className="space-y-6">
                {generatedQuote?.phases?.map((phase, phaseIndex) => (
                  <div key={phaseIndex} className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                    {/* En-tête phase */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white">{phase?.name || 'Phase sans nom'}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{phase?.description || 'Aucune description'}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Phase</div>
                          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            {formatAmount(phase?.totalCost || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tableau articles */}
                    {phase?.lignes && phase.lignes.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Désignation
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Unité
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Quantité
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Prix Unit.
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Prix Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {phase.lignes.map((item, itemIndex) => (
                              <tr key={itemIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                  {item.designation || item.description || 'Article sans nom'}
                                </td>
                                <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                                  {item.unit || 'u'}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                                  {item.quantity || 0}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                                  {formatAmount(item.unitPrice || item.prixUnitaire || 0)}
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">
                                  {formatAmount(item.totalPrice || item.prixTotal || 0)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                        <p className="text-sm">Aucun article détaillé pour cette phase</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {(!generatedQuote?.phases || generatedQuote.phases.length === 0) && (
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <p>Aucune phase disponible</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* Modal d'édition du devis avec QuoteCreatorSimple */}
        {showQuoteEditor && convertedQuote && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
              <QuoteCreatorSimple
                onClose={() => setShowQuoteEditor(false)}
                editQuote={convertedQuote as Quote}
                onQuoteCreated={() => {
                  setShowQuoteEditor(false);
                  console.log('✅ Devis sauvegardé avec succès !');
                }}
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default ArchitecturalPlanAnalyzer;
