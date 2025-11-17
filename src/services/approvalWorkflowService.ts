import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  ApprovalWorkflow, 
  ApprovalStep, 
  ApprovalStatus, 
  ApprovalHistoryEntry,
  ApprovalTemplate,
  DEFAULT_APPROVAL_TEMPLATES,
  WorkflowStatus
} from '../types/approval';

const WORKFLOWS_COLLECTION = 'approvalWorkflows';

export class ApprovalWorkflowService {
  /**
   * Crée un nouveau workflow d'approbation
   */
  static async createWorkflow(
    quoteId: string,
    quoteTitle: string,
    quoteAmount: number,
    initiatedBy: string,
    templateId?: string
  ): Promise<ApprovalWorkflow> {
    try {
      // Sélectionner le template approprié
      const template = templateId 
        ? DEFAULT_APPROVAL_TEMPLATES.find(t => t.id === templateId)
        : this.selectTemplateByAmount(quoteAmount);

      if (!template) {
        throw new Error('Aucun template d\'approbation trouvé');
      }

      // Créer les étapes
      const steps: ApprovalStep[] = template.steps.map((step, index) => ({
        id: `step_${Date.now()}_${index}`,
        ...step,
        status: index === 0 ? 'pending' : 'pending'
      }));

      const workflow: ApprovalWorkflow = {
        id: `workflow_${Date.now()}`,
        quoteId,
        quoteTitle,
        quoteAmount,
        initiatedBy,
        initiatedAt: new Date().toISOString(),
        steps,
        currentStepIndex: 0,
        status: 'in_progress',
        history: [{
          timestamp: new Date().toISOString(),
          action: 'created',
          userName: initiatedBy,
          comments: `Workflow créé avec le template "${template.name}"`
        }]
      };

      // Sauvegarder dans Firestore
      await setDoc(doc(db, WORKFLOWS_COLLECTION, workflow.id), {
        ...workflow,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      console.log('✅ Workflow créé:', workflow.id);
      return workflow;
    } catch (error) {
      console.error('❌ Erreur création workflow:', error);
      throw error;
    }
  }

  /**
   * Approuve une étape du workflow
   */
  static async approveStep(
    workflowId: string,
    stepId: string,
    approverName: string,
    approverEmail: string,
    comments?: string,
    signature?: string
  ): Promise<void> {
    try {
      const workflowRef = doc(db, WORKFLOWS_COLLECTION, workflowId);
      const workflowDoc = await getDoc(workflowRef);

      if (!workflowDoc.exists()) {
        throw new Error('Workflow introuvable');
      }

      const workflow = workflowDoc.data() as ApprovalWorkflow;
      const stepIndex = workflow.steps.findIndex(s => s.id === stepId);

      if (stepIndex === -1) {
        throw new Error('Étape introuvable');
      }

      if (stepIndex !== workflow.currentStepIndex) {
        throw new Error('Cette étape n\'est pas l\'étape courante');
      }

      // Mettre à jour l'étape
      workflow.steps[stepIndex] = {
        ...workflow.steps[stepIndex],
        status: 'approved',
        approverName,
        approverEmail,
        comments,
        signature,
        timestamp: new Date().toISOString()
      };

      // Ajouter à l'historique
      const historyEntry: ApprovalHistoryEntry = {
        timestamp: new Date().toISOString(),
        action: 'approved',
        stepId,
        userName: approverName,
        comments
      };
      workflow.history.push(historyEntry);

      // Passer à l'étape suivante ou terminer
      if (stepIndex < workflow.steps.length - 1) {
        workflow.currentStepIndex = stepIndex + 1;
      } else {
        workflow.status = 'approved';
        workflow.completedAt = new Date().toISOString();
        workflow.history.push({
          timestamp: new Date().toISOString(),
          action: 'completed',
          userName: approverName,
          comments: 'Workflow complété avec succès'
        });
      }

      // Sauvegarder
      await updateDoc(workflowRef, {
        steps: workflow.steps,
        currentStepIndex: workflow.currentStepIndex,
        status: workflow.status,
        completedAt: workflow.completedAt,
        history: workflow.history,
        updatedAt: Timestamp.now()
      });

      console.log('✅ Étape approuvée:', stepId);
    } catch (error) {
      console.error('❌ Erreur approbation étape:', error);
      throw error;
    }
  }

  /**
   * Rejette une étape du workflow
   */
  static async rejectStep(
    workflowId: string,
    stepId: string,
    approverName: string,
    approverEmail: string,
    comments: string
  ): Promise<void> {
    try {
      const workflowRef = doc(db, WORKFLOWS_COLLECTION, workflowId);
      const workflowDoc = await getDoc(workflowRef);

      if (!workflowDoc.exists()) {
        throw new Error('Workflow introuvable');
      }

      const workflow = workflowDoc.data() as ApprovalWorkflow;
      const stepIndex = workflow.steps.findIndex(s => s.id === stepId);

      if (stepIndex === -1) {
        throw new Error('Étape introuvable');
      }

      // Mettre à jour l'étape
      workflow.steps[stepIndex] = {
        ...workflow.steps[stepIndex],
        status: 'rejected',
        approverName,
        approverEmail,
        comments,
        timestamp: new Date().toISOString()
      };

      // Marquer le workflow comme rejeté
      workflow.status = 'rejected';
      workflow.completedAt = new Date().toISOString();

      // Ajouter à l'historique
      workflow.history.push({
        timestamp: new Date().toISOString(),
        action: 'rejected',
        stepId,
        userName: approverName,
        comments
      });

      // Sauvegarder
      await updateDoc(workflowRef, {
        steps: workflow.steps,
        status: workflow.status,
        completedAt: workflow.completedAt,
        history: workflow.history,
        updatedAt: Timestamp.now()
      });

      console.log('✅ Étape rejetée:', stepId);
    } catch (error) {
      console.error('❌ Erreur rejet étape:', error);
      throw error;
    }
  }

  /**
   * Demande une révision
   */
  static async requestRevision(
    workflowId: string,
    stepId: string,
    approverName: string,
    approverEmail: string,
    comments: string
  ): Promise<void> {
    try {
      const workflowRef = doc(db, WORKFLOWS_COLLECTION, workflowId);
      const workflowDoc = await getDoc(workflowRef);

      if (!workflowDoc.exists()) {
        throw new Error('Workflow introuvable');
      }

      const workflow = workflowDoc.data() as ApprovalWorkflow;
      const stepIndex = workflow.steps.findIndex(s => s.id === stepId);

      if (stepIndex === -1) {
        throw new Error('Étape introuvable');
      }

      // Mettre à jour l'étape
      workflow.steps[stepIndex] = {
        ...workflow.steps[stepIndex],
        status: 'revision_requested',
        approverName,
        approverEmail,
        comments,
        timestamp: new Date().toISOString()
      };

      // Ajouter à l'historique
      workflow.history.push({
        timestamp: new Date().toISOString(),
        action: 'revision_requested',
        stepId,
        userName: approverName,
        comments
      });

      // Sauvegarder
      await updateDoc(workflowRef, {
        steps: workflow.steps,
        history: workflow.history,
        updatedAt: Timestamp.now()
      });

      console.log('✅ Révision demandée:', stepId);
    } catch (error) {
      console.error('❌ Erreur demande révision:', error);
      throw error;
    }
  }

  /**
   * Récupère un workflow par ID
   */
  static async getWorkflow(workflowId: string): Promise<ApprovalWorkflow | null> {
    try {
      const workflowDoc = await getDoc(doc(db, WORKFLOWS_COLLECTION, workflowId));
      
      if (!workflowDoc.exists()) {
        return null;
      }

      return workflowDoc.data() as ApprovalWorkflow;
    } catch (error) {
      console.error('❌ Erreur récupération workflow:', error);
      throw error;
    }
  }

  /**
   * Récupère le workflow d'un devis
   */
  static async getWorkflowByQuoteId(quoteId: string): Promise<ApprovalWorkflow | null> {
    try {
      const q = query(
        collection(db, WORKFLOWS_COLLECTION),
        where('quoteId', '==', quoteId)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      // Retourner le plus récent
      const workflows = snapshot.docs.map(doc => doc.data() as ApprovalWorkflow);
      workflows.sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime());

      return workflows[0];
    } catch (error) {
      console.error('❌ Erreur récupération workflow par devis:', error);
      throw error;
    }
  }

  /**
   * Récupère les workflows en attente pour un utilisateur
   */
  static async getPendingWorkflowsForUser(userEmail: string): Promise<ApprovalWorkflow[]> {
    try {
      const q = query(
        collection(db, WORKFLOWS_COLLECTION),
        where('status', '==', 'in_progress')
      );

      const snapshot = await getDocs(q);
      const workflows: ApprovalWorkflow[] = [];

      snapshot.forEach(doc => {
        const workflow = doc.data() as ApprovalWorkflow;
        const currentStep = workflow.steps[workflow.currentStepIndex];

        // Vérifier si l'utilisateur est l'approbateur de l'étape courante
        if (currentStep && currentStep.approverEmail === userEmail) {
          workflows.push(workflow);
        }
      });

      return workflows;
    } catch (error) {
      console.error('❌ Erreur récupération workflows en attente:', error);
      throw error;
    }
  }

  /**
   * Annule un workflow
   */
  static async cancelWorkflow(
    workflowId: string,
    userName: string,
    reason: string
  ): Promise<void> {
    try {
      const workflowRef = doc(db, WORKFLOWS_COLLECTION, workflowId);
      const workflowDoc = await getDoc(workflowRef);

      if (!workflowDoc.exists()) {
        throw new Error('Workflow introuvable');
      }

      const workflow = workflowDoc.data() as ApprovalWorkflow;

      workflow.status = 'cancelled';
      workflow.completedAt = new Date().toISOString();
      workflow.history.push({
        timestamp: new Date().toISOString(),
        action: 'cancelled',
        userName,
        comments: reason
      });

      await updateDoc(workflowRef, {
        status: workflow.status,
        completedAt: workflow.completedAt,
        history: workflow.history,
        updatedAt: Timestamp.now()
      });

      console.log('✅ Workflow annulé:', workflowId);
    } catch (error) {
      console.error('❌ Erreur annulation workflow:', error);
      throw error;
    }
  }

  /**
   * Sélectionne le template approprié selon le montant
   */
  private static selectTemplateByAmount(amount: number): ApprovalTemplate | undefined {
    return DEFAULT_APPROVAL_TEMPLATES.find(template => {
      const minOk = !template.minAmount || amount >= template.minAmount;
      const maxOk = !template.maxAmount || amount <= template.maxAmount;
      return minOk && maxOk;
    });
  }

  /**
   * Vérifie si un utilisateur peut approuver une étape
   */
  static canUserApprove(workflow: ApprovalWorkflow, userEmail: string): boolean {
    if (workflow.status !== 'in_progress') {
      return false;
    }

    const currentStep = workflow.steps[workflow.currentStepIndex];
    return currentStep && currentStep.approverEmail === userEmail;
  }

  /**
   * Calcule les statistiques d'un workflow
   */
  static getWorkflowStats(workflow: ApprovalWorkflow) {
    const totalSteps = workflow.steps.length;
    const completedSteps = workflow.steps.filter(s => s.status === 'approved').length;
    const progress = (completedSteps / totalSteps) * 100;

    return {
      totalSteps,
      completedSteps,
      progress,
      currentStep: workflow.currentStepIndex + 1,
      status: workflow.status
    };
  }
}

export default ApprovalWorkflowService;
