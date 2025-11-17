import { doc, setDoc, getDoc, updateDoc, collection, query, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface ExternalEngineer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  specialties: string[];
  rating: number;
  projectsCompleted: number;
  avgDelay: number; // jours
  hourlyRate: number;
  certifications: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface EngineerAssignment {
  id: string;
  engineerId: string;
  quoteId: string;
  assignedAt: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  documents: string[];
  notes: string;
}

const ENGINEERS_COLLECTION = 'externalEngineers';
const ASSIGNMENTS_COLLECTION = 'engineerAssignments';

export class ExternalEngineerService {
  /**
   * Ajoute un ingénieur externe
   */
  static async addEngineer(engineer: Omit<ExternalEngineer, 'id' | 'createdAt'>): Promise<ExternalEngineer> {
    const id = `eng_${Date.now()}`;
    const newEngineer: ExternalEngineer = {
      ...engineer,
      id,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, ENGINEERS_COLLECTION, id), {
      ...newEngineer,
      createdAt: Timestamp.now()
    });

    console.log('✅ Ingénieur ajouté:', id);
    return newEngineer;
  }

  /**
   * Récupère tous les ingénieurs
   */
  static async getAllEngineers(): Promise<ExternalEngineer[]> {
    const snapshot = await getDocs(collection(db, ENGINEERS_COLLECTION));
    return snapshot.docs.map(doc => doc.data() as ExternalEngineer);
  }

  /**
   * Assigne un ingénieur à un devis
   */
  static async assignEngineer(
    engineerId: string,
    quoteId: string,
    expectedCompletionDate: string,
    notes: string
  ): Promise<EngineerAssignment> {
    const id = `assign_${Date.now()}`;
    const assignment: EngineerAssignment = {
      id,
      engineerId,
      quoteId,
      assignedAt: new Date().toISOString(),
      expectedCompletionDate,
      status: 'assigned',
      documents: [],
      notes
    };

    await setDoc(doc(db, ASSIGNMENTS_COLLECTION, id), {
      ...assignment,
      createdAt: Timestamp.now()
    });

    console.log('✅ Ingénieur assigné:', id);
    return assignment;
  }

  /**
   * Met à jour le statut d'une mission
   */
  static async updateAssignmentStatus(
    assignmentId: string,
    status: EngineerAssignment['status'],
    actualCompletionDate?: string
  ): Promise<void> {
    const assignmentRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
    await updateDoc(assignmentRef, {
      status,
      actualCompletionDate,
      updatedAt: Timestamp.now()
    });

    console.log('✅ Statut mission mis à jour:', assignmentId);
  }

  /**
   * Calcule les statistiques d'un ingénieur
   */
  static async getEngineerStats(engineerId: string) {
    const q = query(collection(db, ASSIGNMENTS_COLLECTION));
    const snapshot = await getDocs(q);
    
    const assignments = snapshot.docs
      .map(doc => doc.data() as EngineerAssignment)
      .filter(a => a.engineerId === engineerId);

    const completed = assignments.filter(a => a.status === 'completed');
    const avgDelay = completed.reduce((sum, a) => {
      if (a.actualCompletionDate && a.expectedCompletionDate) {
        const expected = new Date(a.expectedCompletionDate).getTime();
        const actual = new Date(a.actualCompletionDate).getTime();
        const delay = (actual - expected) / (1000 * 60 * 60 * 24);
        return sum + delay;
      }
      return sum;
    }, 0) / (completed.length || 1);

    return {
      totalAssignments: assignments.length,
      completed: completed.length,
      inProgress: assignments.filter(a => a.status === 'in_progress').length,
      avgDelay: Math.round(avgDelay)
    };
  }
}

export default ExternalEngineerService;
