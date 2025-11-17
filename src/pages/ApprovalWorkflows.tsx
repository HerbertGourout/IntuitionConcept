import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle, User, FileText } from 'lucide-react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import ApprovalWorkflowService from '../services/approvalWorkflowService';
import { ApprovalWorkflow, ROLE_LABELS, STATUS_LABELS, WORKFLOW_STATUS_LABELS } from '../types/approval';
import PageContainer from '../components/Layout/PageContainer';
import SectionHeader from '../components/UI/SectionHeader';
import { GlassCard } from '../components/UI/VisualEffects';

const ApprovalWorkflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadWorkflows();
  }, [filter]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      let q;
      
      if (filter === 'all') {
        q = query(collection(db, 'approvalWorkflows'));
      } else {
        q = query(
          collection(db, 'approvalWorkflows'),
          where('status', '==', filter)
        );
      }

      const snapshot = await getDocs(q);
      const workflowsData: ApprovalWorkflow[] = [];
      
      snapshot.forEach(doc => {
        workflowsData.push(doc.data() as ApprovalWorkflow);
      });

      // Sort by date (most recent first)
      workflowsData.sort((a, b) => 
        new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime()
      );

      setWorkflows(workflowsData);
    } catch (error) {
      console.error('Erreur chargement workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ApprovalWorkflow['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: ApprovalWorkflow['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'revision_requested':
        return 'bg-orange-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <PageContainer className="py-8 space-y-8">
      {/* Header */}
      <GlassCard className="bg-gradient-to-r from-blue-50 via-white to-purple-50">
        <SectionHeader
          icon={<CheckCircle className="w-8 h-8 text-blue-600" />}
          title="Workflows d'Approbation"
          subtitle="Gérez les approbations de devis"
          actions={
            <button
              onClick={() => window.history.back()}
              className="btn-glass bg-gray-100 hover:bg-gray-200 px-4 py-2 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
          }
        />
      </GlassCard>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filtrer:</span>
          <div className="flex gap-2">
            {(['all', 'in_progress', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Tous' : WORKFLOW_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Workflows List */}
      {loading ? (
        <GlassCard className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des workflows...</p>
        </GlassCard>
      ) : workflows.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun workflow trouvé
          </h3>
          <p className="text-gray-600">
            Les workflows d'approbation apparaîtront ici
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {workflows.map((workflow) => {
            const stats = ApprovalWorkflowService.getWorkflowStats(workflow);
            
            return (
              <GlassCard key={workflow.id} className="p-6 hover:shadow-lg transition-all">
                {/* Workflow Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">
                        {workflow.quoteTitle}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(workflow.status)}`}>
                        {getStatusIcon(workflow.status)}
                        <span className="ml-1">{WORKFLOW_STATUS_LABELS[workflow.status]}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>ID: {workflow.quoteId}</span>
                      <span>•</span>
                      <span>Montant: {workflow.quoteAmount.toLocaleString('fr-FR')} FCFA</span>
                      <span>•</span>
                      <span>Initié par: {workflow.initiatedBy}</span>
                      <span>•</span>
                      <span>{new Date(workflow.initiatedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">
                      Progression: {stats.completedSteps}/{stats.totalSteps} étapes
                    </span>
                    <span className="font-medium text-blue-600">
                      {Math.round(stats.progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${stats.progress}%` }}
                    />
                  </div>
                </div>

                {/* Approval Steps */}
                <div className="space-y-3">
                  {workflow.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border-2 ${
                        index === workflow.currentStepIndex
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {/* Step Number */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getStepStatusColor(step.status)}`}>
                        {index + 1}
                      </div>

                      {/* Step Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">
                            {ROLE_LABELS[step.role]}
                          </span>
                          {step.approverName && (
                            <>
                              <span className="text-gray-400">-</span>
                              <span className="text-sm text-gray-600">{step.approverName}</span>
                            </>
                          )}
                        </div>
                        {step.comments && (
                          <p className="text-sm text-gray-600 italic">"{step.comments}"</p>
                        )}
                      </div>

                      {/* Step Status */}
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          step.status === 'approved' ? 'bg-green-100 text-green-800' :
                          step.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          step.status === 'revision_requested' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {STATUS_LABELS[step.status]}
                        </span>
                        {step.timestamp && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(step.timestamp).toLocaleString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* History */}
                {workflow.history.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Historique</h4>
                    <div className="space-y-2">
                      {workflow.history.slice(-3).map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-gray-400">•</span>
                          <span>{new Date(entry.timestamp).toLocaleString('fr-FR')}</span>
                          <span>-</span>
                          <span className="font-medium">{entry.userName}</span>
                          <span>-</span>
                          <span>{entry.action}</span>
                          {entry.comments && <span className="italic">: "{entry.comments}"</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {!loading && workflows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflows.filter(w => w.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approuvés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflows.filter(w => w.status === 'approved').length}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejetés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflows.filter(w => w.status === 'rejected').length}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{workflows.length}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </PageContainer>
  );
};

export default ApprovalWorkflows;
