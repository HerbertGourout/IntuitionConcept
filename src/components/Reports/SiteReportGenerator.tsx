/**
 * Composant de Génération Automatique de Rapports de Chantier
 * 
 * Fonctionnalités:
 * - Collecte automatique des données du projet
 * - Génération de rapports avec IA (Claude)
 * - Prévisualisation du rapport
 * - Export PDF professionnel
 * - Envoi automatique par email
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Package,
  AlertTriangle,
  CloudRain,
  Download,
  Mail,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Zap
} from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import {
  initializeSiteReportGenerator,
  type SiteReportData,
  type GeneratedReport
} from '../../services/ai/siteReportGenerator';
import { pdfExportService } from '../../services/pdfExportService';

interface SiteReportGeneratorProps {
  projectId: string;
  onReportGenerated?: (report: GeneratedReport) => void;
}

const SiteReportGenerator: React.FC<SiteReportGeneratorProps> = ({
  projectId,
  onReportGenerated
}) => {
  const { projects } = useProjectContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Données du formulaire
  const [formData, setFormData] = useState<Partial<SiteReportData>>({
    observations: [],
    incidents: [],
    completedTasks: [],
    materialsUsed: [],
    materialsDelivered: [],
    equipmentUsed: [],
    photos: []
  });
  
  const project = projects.find((p) => p.id === projectId);
  
  useEffect(() => {
    if (project) {
      // Pré-remplir les données du projet
      autoFillProjectData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);
  
  /**
   * Pré-remplit automatiquement les données depuis le projet
   */
  const autoFillProjectData = () => {
    if (!project) return;
    
    // Calculer l'avancement global
    const overallProgress = project.phases.reduce((acc: number, phase) => 
      acc + (phase.progress || 0), 0) / (project.phases.length || 1);
    
    // Extraire les phases avec leur progression
    const phaseProgress = project.phases.map((phase) => ({
      phaseName: phase.name,
      progress: phase.progress || 0,
      status: phase.progress === 100 ? 'completed' as const : 
              phase.progress > 0 ? 'in_progress' as const : 'not_started' as const
    }));
    
    // Extraire les tâches complétées aujourd'hui
    const completedTasks = project.phases.flatMap((phase) =>
      phase.tasks
        .filter((task) => task.status === 'done')
        .map((task) => ({
          taskName: task.title,
          description: task.description || 'Tâche complétée',
          progress: 100,
          assignedTo: task.assignedTo || 'Équipe',
          photos: []
        }))
    );
    
    setFormData(prev => ({
      ...prev,
      projectId: project.id,
      projectName: project.name,
      projectAddress: project.location || 'Adresse non spécifiée',
      reportDate,
      reportType,
      overallProgress: Math.round(overallProgress),
      phaseProgress,
      completedTasks: completedTasks.slice(0, 10), // Limiter à 10 tâches
      teamPresence: {
        totalWorkers: 12,
        present: 10,
        absent: 2,
        absentees: []
      },
      weather: {
        condition: 'Ensoleillé',
        temperature: 28,
        impact: 'none' as const
      },
      nextDayPlan: {
        plannedTasks: ['Continuer les travaux en cours'],
        expectedDeliveries: [],
        requiredWorkers: 10
      },
      reportedBy: {
        name: 'Chef de chantier',
        role: 'Superviseur'
      }
    }));
  };
  
  /**
   * Génère le rapport avec IA
   */
  const handleGenerateReport = async () => {
    if (!formData.projectId || !formData.projectName) {
      setError('Données du projet manquantes');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const reportGenerator = initializeSiteReportGenerator();
      
      // Construire les données complètes du rapport
      const reportData: SiteReportData = {
        projectId: formData.projectId,
        projectName: formData.projectName,
        projectAddress: formData.projectAddress || '',
        reportDate,
        reportType,
        overallProgress: formData.overallProgress || 0,
        phaseProgress: formData.phaseProgress || [],
        teamPresence: formData.teamPresence || {
          totalWorkers: 0,
          present: 0,
          absent: 0,
          absentees: []
        },
        completedTasks: formData.completedTasks || [],
        materialsUsed: formData.materialsUsed || [],
        materialsDelivered: formData.materialsDelivered || [],
        equipmentUsed: formData.equipmentUsed || [],
        incidents: formData.incidents || [],
        weather: formData.weather || {
          condition: 'Non spécifié',
          temperature: 25,
          impact: 'none'
        },
        observations: formData.observations || [],
        nextDayPlan: formData.nextDayPlan || {
          plannedTasks: [],
          expectedDeliveries: [],
          requiredWorkers: 0
        },
        photos: formData.photos || [],
        reportedBy: formData.reportedBy || {
          name: 'Utilisateur',
          role: 'Chef de chantier'
        }
      };
      
      // Générer le rapport
      const report = await reportGenerator.generateReport(reportData);
      
      setGeneratedReport(report);
      if (onReportGenerated) {
        onReportGenerated(report);
      }
      
    } catch (err) {
      console.error('Erreur génération rapport:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };
  
  /**
   * Génère un rapport rapide (sans IA) pour tests
   */
  const handleQuickGenerate = () => {
    if (!formData.projectId || !formData.projectName) {
      setError('Données du projet manquantes');
      return;
    }
    
    const reportGenerator = initializeSiteReportGenerator();
    
    const reportData: SiteReportData = {
      projectId: formData.projectId,
      projectName: formData.projectName,
      projectAddress: formData.projectAddress || '',
      reportDate,
      reportType,
      overallProgress: formData.overallProgress || 0,
      phaseProgress: formData.phaseProgress || [],
      teamPresence: formData.teamPresence || {
        totalWorkers: 0,
        present: 0,
        absent: 0,
        absentees: []
      },
      completedTasks: formData.completedTasks || [],
      materialsUsed: formData.materialsUsed || [],
      materialsDelivered: formData.materialsDelivered || [],
      equipmentUsed: formData.equipmentUsed || [],
      incidents: formData.incidents || [],
      weather: formData.weather || {
        condition: 'Non spécifié',
        temperature: 25,
        impact: 'none'
      },
      observations: formData.observations || [],
      nextDayPlan: formData.nextDayPlan || {
        plannedTasks: [],
        expectedDeliveries: [],
        requiredWorkers: 0
      },
      photos: formData.photos || [],
      reportedBy: formData.reportedBy || {
        name: 'Utilisateur',
        role: 'Chef de chantier'
      }
    };
    
    const report = reportGenerator.generateQuickReport(reportData);
    setGeneratedReport(report);
    if (onReportGenerated) {
      onReportGenerated(report);
    }
  };
  
  /**
   * Exporte le rapport en PDF
   */
  const handleExportPDF = () => {
    if (!generatedReport || !formData.projectName) return;
    
    try {
      const pdfBlob = pdfExportService.exportSiteReport(generatedReport, {
        title: 'Rapport de Chantier',
        subtitle: formData.projectName,
        author: formData.reportedBy?.name || 'Chef de chantier',
        footer: 'IntuitionConcept BTP Platform - Rapport généré automatiquement'
      });
      
      const filename = `rapport_${formData.projectName.replace(/\s+/g, '_')}_${reportDate}.pdf`;
      pdfExportService.downloadPDF(pdfBlob, filename);
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF');
    }
  };
  
  /**
   * Envoie le rapport par email
   */
  const handleSendEmail = () => {
    if (!generatedReport) return;
    
    // TODO: Implémenter l'envoi par email
    alert('Envoi email en cours de développement');
  };
  
  if (!project) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
        <p className="text-gray-600 dark:text-gray-400">Projet non trouvé</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">📋 Génération Automatique de Rapports</h1>
            <p className="text-blue-100">
              Rapport de chantier professionnel généré par IA en 30 secondes
            </p>
          </div>
          <FileText className="w-16 h-16 opacity-50" />
        </div>
      </div>
      
      {/* Configuration du rapport */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Configuration du Rapport
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Type de rapport */}
          <div>
            <label className="block text-sm font-medium mb-2">Type de rapport</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="daily">Journalier</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuel</option>
            </select>
          </div>
          
          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Date du rapport</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          {/* Projet */}
          <div>
            <label className="block text-sm font-medium mb-2">Projet</label>
            <input
              type="text"
              value={formData.projectName || ''}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
      </div>
      
      {/* Résumé des données collectées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Avancement */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              {formData.overallProgress || 0}%
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Avancement global</p>
        </div>
        
        {/* Équipe */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">
              {formData.teamPresence?.present || 0}/{formData.teamPresence?.totalWorkers || 0}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ouvriers présents</p>
        </div>
        
        {/* Tâches */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">
              {formData.completedTasks?.length || 0}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tâches complétées</p>
        </div>
        
        {/* Météo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <CloudRain className="w-5 h-5 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">
              {formData.weather?.temperature || 25}°C
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{formData.weather?.condition || 'Ensoleillé'}</p>
        </div>
      </div>
      
      {/* Boutons d'action */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Générer avec IA (Claude)
            </>
          )}
        </button>
        
        <button
          onClick={handleQuickGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <Clock className="w-5 h-5" />
          Génération Rapide (Test)
        </button>
        
        {generatedReport && (
          <>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              <Download className="w-5 h-5" />
              Exporter PDF
            </button>
            
            <button
              onClick={handleSendEmail}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              <Mail className="w-5 h-5" />
              Envoyer par Email
            </button>
          </>
        )}
      </div>
      
      {/* Erreur */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200">Erreur</h3>
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}
      
      {/* Rapport généré */}
      {generatedReport && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Rapport Généré
            </h2>
            <span className="text-sm text-gray-500">
              {new Date(generatedReport.generatedAt).toLocaleString('fr-FR')}
            </span>
          </div>
          
          {/* Résumé exécutif */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">📊 Résumé Exécutif</h3>
            <p className="text-gray-700 dark:text-gray-300">{generatedReport.executiveSummary}</p>
          </div>
          
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">Progression</span>
              </div>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">
                {generatedReport.statistics.progressChange}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Productivité</span>
              </div>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {generatedReport.statistics.workersProductivity}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Matériaux</span>
              </div>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                {generatedReport.statistics.materialsConsumption}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Budget</span>
              </div>
              <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                {generatedReport.statistics.budgetStatus}
              </p>
            </div>
          </div>
          
          {/* Alertes */}
          {generatedReport.alerts.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Alertes & Points d'Attention
              </h3>
              {generatedReport.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.type === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                    alert.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                    'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      alert.priority === 'high' ? 'bg-red-600 text-white' :
                      alert.priority === 'medium' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {alert.priority.toUpperCase()}
                    </span>
                    <p className="text-sm flex-1">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Sections détaillées */}
          <div className="space-y-4">
            {generatedReport.detailedSections.map((section, index) => (
              <div key={index} className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">{section.title}</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{section.content}</p>
                  
                  {section.subsections && section.subsections.map((sub, subIndex) => (
                    <div key={subIndex} className="mt-3 ml-4">
                      <h4 className="font-semibold text-md mb-2">{sub.subtitle}</h4>
                      <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">{sub.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Recommandations */}
          {generatedReport.recommendations.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="font-bold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recommandations
              </h3>
              <ul className="space-y-2">
                {generatedReport.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-green-600 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SiteReportGenerator;
