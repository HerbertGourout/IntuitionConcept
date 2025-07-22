import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface ProjectPhase {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  budget?: number;
  actualCost?: number;
  tasks: ProjectTask[];
}

export interface ProjectTask {
  id: string;
  name: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string[];
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  spent?: number;
  phaseId?: string;
  updatedAt?: Date;
}

export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  category: 'materials' | 'labor' | 'equipment' | 'permits' | 'other';
  amount: number;
  description: string;
  date: string;
  approved: boolean;
  invoiceNumber?: string;
  supplier?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  budget: number;
  actualCost: number;
  progress: number;
  location: string;
  phases: ProjectPhase[];
  tasks: ProjectTask[];
  team: string[];
  financialRecords: FinancialRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'projects';

export class ProjectService {
  /**
   * Récupérer tous les projets
   */
  static async getAllProjects(): Promise<Project[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate() 
            : new Date(data.createdAt || Date.now()),
          updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' 
            ? data.updatedAt.toDate() 
            : new Date(data.updatedAt || Date.now())
        };
      }) as Project[];
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      throw error;
    }
  }

  /**
   * Récupérer un projet par ID
   */
  static async getProjectById(id: string): Promise<Project | null> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('__name__', '==', id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
          ? data.createdAt.toDate() 
          : new Date(data.createdAt || Date.now()),
        updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' 
          ? data.updatedAt.toDate() 
          : new Date(data.updatedAt || Date.now())
      } as Project;
    } catch (error) {
      console.error('Erreur lors de la récupération du projet:', error);
      throw error;
    }
  }

  /**
   * Récupérer les projets par statut
   */
  static async getProjectsByStatus(status: Project['status']): Promise<Project[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate() 
            : new Date(data.createdAt || Date.now()),
          updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' 
            ? data.updatedAt.toDate() 
            : new Date(data.updatedAt || Date.now())
        };
      }) as Project[];
    } catch (error) {
      console.error('Erreur lors de la récupération des projets par statut:', error);
      throw error;
    }
  }

  /**
   * Ajouter un nouveau projet
   */
  static async addProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...projectData,
        createdAt: now,
        updatedAt: now
      });
      console.log('Projet ajouté avec ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du projet:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un projet
   */
  static async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const projectRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      console.log('Projet mis à jour:', id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      throw error;
    }
  }

  /**
   * Supprimer un projet
   */
  static async deleteProject(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      console.log('Projet supprimé:', id);
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'un projet
   */
  static async updateProjectStatus(id: string, status: Project['status']): Promise<void> {
    try {
      const projectRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(projectRef, {
        status,
        updatedAt: Timestamp.now()
      });
      console.log('Statut projet mis à jour:', id, status);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  /**
   * Ajouter une phase à un projet
   */
  static async addPhaseToProject(projectId: string, phase: Omit<ProjectPhase, 'id'>): Promise<void> {
    try {
      const project = await this.getProjectById(projectId);
      if (!project) {
        throw new Error('Projet non trouvé');
      }

      const newPhase: ProjectPhase = {
        ...phase,
        id: `phase-${Date.now()}`
      };

      const updatedPhases = [...project.phases, newPhase];
      await this.updateProject(projectId, { phases: updatedPhases });
      console.log('Phase ajoutée au projet:', projectId);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la phase:', error);
      throw error;
    }
  }

  /**
   * Ajouter une tâche à un projet
   */
  static async addTaskToProject(projectId: string, task: Omit<ProjectTask, 'id'>): Promise<void> {
    try {
      const project = await this.getProjectById(projectId);
      if (!project) {
        throw new Error('Projet non trouvé');
      }

      const newTask: ProjectTask = {
        ...task,
        id: `task-${Date.now()}`,
        updatedAt: new Date()
      };

      const updatedTasks = [...project.tasks, newTask];
      await this.updateProject(projectId, { tasks: updatedTasks });
      console.log('Tâche ajoutée au projet:', projectId);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la tâche:', error);
      throw error;
    }
  }

  /**
   * Ajouter un enregistrement financier
   */
  static async addFinancialRecord(projectId: string, record: Omit<FinancialRecord, 'id'>): Promise<void> {
    try {
      const project = await this.getProjectById(projectId);
      if (!project) {
        throw new Error('Projet non trouvé');
      }

      const newRecord: FinancialRecord = {
        ...record,
        id: `fin-${Date.now()}`
      };

      const updatedRecords = [...project.financialRecords, newRecord];
      
      // Recalculer le coût actuel
      const newActualCost = updatedRecords
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0);

      await this.updateProject(projectId, { 
        financialRecords: updatedRecords,
        actualCost: newActualCost
      });
      console.log('Enregistrement financier ajouté au projet:', projectId);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'enregistrement financier:', error);
      throw error;
    }
  }

  /**
   * Écouter les changements en temps réel
   */
  static subscribeToProjects(callback: (projects: Project[]) => void): () => void {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const projects = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate() 
            : new Date(data.createdAt || Date.now()),
          updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' 
            ? data.updatedAt.toDate() 
            : new Date(data.updatedAt || Date.now())
        };
      }) as Project[];
      
      callback(projects);
    }, (error) => {
      console.error('Erreur lors de l\'écoute des projets:', error);
    });
  }

  /**
   * Initialiser avec des données de test (à utiliser une seule fois)
   */
  static async initializeTestData(): Promise<void> {
    try {
      const existingProjects = await this.getAllProjects();
      if (existingProjects.length > 0) {
        console.log('Les projets existent déjà, pas d\'initialisation nécessaire');
        return;
      }

      const testProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Résidence Les Jardins',
        description: 'Construction d\'une résidence de 12 logements avec espaces verts',
        client: 'SCI Les Jardins',
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-06-30',
        budget: 850000,
        actualCost: 245000,
        progress: 35,
        location: 'Lyon, France',
        team: ['Pierre Leroy', 'Marie Martin', 'Jean Dupont', 'Sophie Leroy'],
        phases: [
          {
            id: 'phase-1',
            name: 'Fondations et gros œuvre',
            description: 'Préparation du terrain et réalisation des fondations',
            startDate: '2024-01-15',
            endDate: '2024-03-15',
            status: 'in_progress',
            progress: 75,
            budget: 250000,
            actualCost: 185000,
            tasks: []
          },
          {
            id: 'phase-2',
            name: 'Structure et charpente',
            description: 'Montage de la structure porteuse',
            startDate: '2024-03-01',
            endDate: '2024-04-15',
            status: 'planned',
            progress: 0,
            budget: 200000,
            actualCost: 0,
            tasks: []
          },
          {
            id: 'phase-3',
            name: 'Second œuvre',
            description: 'Électricité, plomberie, isolation',
            startDate: '2024-04-01',
            endDate: '2024-05-30',
            status: 'planned',
            progress: 0,
            budget: 250000,
            actualCost: 0,
            tasks: []
          },
          {
            id: 'phase-4',
            name: 'Finitions',
            description: 'Revêtements, peinture, aménagements',
            startDate: '2024-05-15',
            endDate: '2024-06-30',
            status: 'planned',
            progress: 0,
            budget: 150000,
            actualCost: 0,
            tasks: []
          }
        ],
        tasks: [
          {
            id: 'task-1',
            name: 'Préparation du terrain',
            description: 'Nettoyage et préparation du terrain',
            status: 'done',
            priority: 'high',
            assignedTo: ['Pierre Leroy', 'Marie Martin'],
            dueDate: '2024-02-15',
            startDate: '2024-01-15',
            estimatedHours: 40,
            actualHours: 38,
            spent: 15000,
            phaseId: 'phase-1',
            updatedAt: new Date()
          },
          {
            id: 'task-2',
            name: 'Coulage des fondations',
            description: 'Réalisation des fondations en béton',
            status: 'in_progress',
            priority: 'high',
            assignedTo: ['Jean Dupont', 'Sophie Leroy'],
            dueDate: '2024-03-01',
            startDate: '2024-02-15',
            estimatedHours: 60,
            actualHours: 35,
            spent: 45000,
            phaseId: 'phase-1',
            updatedAt: new Date()
          }
        ],
        financialRecords: [
          {
            id: 'fin-1',
            type: 'expense',
            category: 'materials',
            amount: 85000,
            description: 'Béton et armatures pour fondations',
            date: '2024-02-01',
            approved: true,
            supplier: 'Béton Express'
          },
          {
            id: 'fin-2',
            type: 'expense',
            category: 'labor',
            amount: 45000,
            description: 'Main d\'œuvre phase 1',
            date: '2024-02-15',
            approved: true
          },
          {
            id: 'fin-3',
            type: 'expense',
            category: 'equipment',
            amount: 25000,
            description: 'Location pelleteuse et grue',
            date: '2024-02-10',
            approved: true,
            supplier: 'LocaTP'
          },
          {
            id: 'fin-4',
            type: 'income',
            category: 'other',
            amount: 200000,
            description: 'Acompte client - Phase 1',
            date: '2024-01-20',
            approved: true,
            invoiceNumber: 'INV-2024-001'
          }
        ]
      };

      await this.addProject(testProject);
      console.log('✅ Données de test du projet initialisées');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des données de test:', error);
      throw error;
    }
  }
}
