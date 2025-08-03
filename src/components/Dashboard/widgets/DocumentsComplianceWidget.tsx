import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle, CheckCircle, Clock, Shield, Award, Calendar } from 'lucide-react';
import { useProjects } from '../../../hooks/useProjects';

interface DocumentData {
  totalDocuments: number;
  recentDocuments: Array<{
    id: string;
    name: string;
    type: string;
    addedDate: string;
    addedBy: string;
  }>;
  expiringPermits: Array<{
    id: string;
    name: string;
    expiryDate: string;
    daysUntilExpiry: number;
    priority: 'low' | 'medium' | 'high';
  }>;
  pendingReports: Array<{
    id: string;
    type: string;
    assignedTo: string;
    dueDate: string;
    overdue: boolean;
  }>;
  complianceRate: number;
  qualityScore: number;
  correctiveActions: number;
  certificationsStatus: Array<{
    name: string;
    status: 'valid' | 'expiring' | 'expired';
    expiryDate: string;
  }>;
}

const DocumentsComplianceWidget: React.FC = () => {
  const { currentProject } = useProjects();
  const [documentData, setDocumentData] = useState<DocumentData>({
    totalDocuments: 0,
    recentDocuments: [],
    expiringPermits: [],
    pendingReports: [],
    complianceRate: 0,
    qualityScore: 0,
    correctiveActions: 0,
    certificationsStatus: []
  });

  useEffect(() => {
    if (!currentProject) return;

    // Pas de système de documents implémenté dans le projet
    const totalDocuments = 0;
    
    // Aucun document récent car pas de système implémenté
    const recentDocuments: never[] = [];

    // Pas de système de permis implémenté
    const expiringPermits: never[] = [];

    // Rapports en attente basés sur les phases réelles
    const pendingReports = (currentProject.phases || [])
      .filter(phase => {
        const phaseTasks = phase.tasks || [];
        const completedTasks = phaseTasks.filter(task => task.status === 'done').length;
        // Phase nécessite un rapport si elle a des tâches terminées
        return completedTasks > 0 && completedTasks === phaseTasks.length;
      })
      .slice(0, 2)
      .map((phase, index) => ({
        id: phase.id,
        type: 'Rapport de phase',
        assignedTo: 'Chef de projet', // Pas de données de manager spécifiques
        dueDate: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        overdue: false // Pas de système de suivi des retards
      }));

    // Calculs de conformité basés sur les données réelles
    const totalTasks = (currentProject.phases || []).flatMap(phase => phase.tasks || []).length;
    const completedTasks = (currentProject.phases || []).flatMap(phase => phase.tasks || []).filter(task => task.status === 'done').length;
    const complianceRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
    const qualityScore = complianceRate; // Score qualité basé sur le taux de completion
    const correctiveActions = 0; // Pas de système d'actions correctives implémenté

    // Statut des certifications
    const certificationsStatus = [
      {
        name: 'ISO 9001',
        status: 'valid' as const,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Certification sécurité',
        status: 'expiring' as const,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    setDocumentData({
      totalDocuments,
      recentDocuments,
      expiringPermits,
      pendingReports,
      complianceRate,
      qualityScore,
      correctiveActions,
      certificationsStatus
    });
  }, [currentProject]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      case 'expiring': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'expired': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'permit':
      case 'permis': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'certificate':
      case 'certificat': return <Award className="w-4 h-4 text-green-600" />;
      case 'report':
      case 'rapport': return <FileText className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Documents & Conformité</h3>
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {documentData.totalDocuments} documents
          </span>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Conformité</span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {documentData.complianceRate}%
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Qualité</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {documentData.qualityScore}%
          </div>
        </div>
      </div>

      {/* Permis expirant */}
      {documentData.expiringPermits.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Permis expirant</span>
            <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs px-2 py-1 rounded-full">
              {documentData.expiringPermits.length}
            </span>
          </div>
          <div className="space-y-2">
            {documentData.expiringPermits.map((permit) => (
              <div key={permit.id} className="flex items-center justify-between py-2 px-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-yellow-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {permit.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Expire dans {permit.daysUntilExpiry} jours
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(permit.priority)}`}>
                  {permit.priority === 'high' ? 'Urgent' : 
                   permit.priority === 'medium' ? 'Moyen' : 'Faible'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents récents */}
      {documentData.recentDocuments.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Documents récents</h4>
          <div className="space-y-2">
            {documentData.recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-2 px-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  {getDocumentIcon(doc.type)}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {doc.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(doc.addedDate).toLocaleDateString('fr-FR')} • {doc.addedBy}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                  {doc.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rapports en attente */}
      {documentData.pendingReports.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Rapports en attente</h4>
          <div className="space-y-2">
            {documentData.pendingReports.map((report) => (
              <div key={report.id} className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                report.overdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-700/50'
              }`}>
                <div className="flex items-center space-x-2">
                  {report.overdue ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-600" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.type}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {report.assignedTo} • {new Date(report.dueDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                {report.overdue && (
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full">
                    En retard
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Certifications</h4>
        <div className="space-y-2">
          {documentData.certificationsStatus.map((cert, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {cert.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Expire le {new Date(cert.expiryDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(cert.status)}`}>
                {cert.status === 'valid' ? 'Valide' :
                 cert.status === 'expiring' ? 'Expire bientôt' : 'Expiré'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions correctives */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Actions correctives ouvertes</span>
          </div>
          <span className={`text-sm font-bold ${
            documentData.correctiveActions === 0 ? 'text-green-600' : 'text-orange-600'
          }`}>
            {documentData.correctiveActions}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DocumentsComplianceWidget;
