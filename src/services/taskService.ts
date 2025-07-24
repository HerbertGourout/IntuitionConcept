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

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string[];
  dueDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  dependencies?: string[];
  phaseId?: string;
  projectId?: string;
  subtasks?: {
    id: string;
    name: string;
    completed: boolean;
    assignedTo?: string;
  }[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  comments?: {
    id: string;
    author: string;
    content: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'tasks';

export class TaskService {
  /**
   * Récupérer toutes les tâches
   */
  static async getAllTasks(): Promise<Task[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate() || undefined,
        startDate: doc.data().startDate?.toDate() || undefined,
        completedDate: doc.data().completedDate?.toDate() || undefined,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        comments: doc.data().comments?.map((comment: any) => ({
          ...comment,
          createdAt: comment.createdAt?.toDate() || new Date()
        })) || []
      })) as Task[];
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      throw error;
    }
  }

  /**
   * Récupérer les tâches par statut
   */
  static async getTasksByStatus(status: Task['status']): Promise<Task[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate() || undefined,
        startDate: doc.data().startDate?.toDate() || undefined,
        completedDate: doc.data().completedDate?.toDate() || undefined,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        comments: doc.data().comments?.map((comment: any) => ({
          ...comment,
          createdAt: comment.createdAt?.toDate() || new Date()
        })) || []
      })) as Task[];
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches par statut:', error);
      throw error;
    }
  }

  /**
   * Récupérer les tâches par projet
   */
  static async getTasksByProject(projectId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate() || undefined,
        startDate: doc.data().startDate?.toDate() || undefined,
        completedDate: doc.data().completedDate?.toDate() || undefined,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        comments: doc.data().comments?.map((comment: any) => ({
          ...comment,
          createdAt: comment.createdAt?.toDate() || new Date()
        })) || []
      })) as Task[];
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches par projet:', error);
      throw error;
    }
  }

  /**
   * Récupérer les tâches par phase
   */
  static async getTasksByPhase(phaseId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('phaseId', '==', phaseId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate() || undefined,
        startDate: doc.data().startDate?.toDate() || undefined,
        completedDate: doc.data().completedDate?.toDate() || undefined,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        comments: doc.data().comments?.map((comment: any) => ({
          ...comment,
          createdAt: comment.createdAt?.toDate() || new Date()
        })) || []
      })) as Task[];
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches par phase:', error);
      throw error;
    }
  }

  /**
   * Ajouter une nouvelle tâche
   */
  static async addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...taskData,
        dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null,
        startDate: taskData.startDate ? Timestamp.fromDate(taskData.startDate) : null,
        completedDate: taskData.completedDate ? Timestamp.fromDate(taskData.completedDate) : null,
        comments: taskData.comments?.map(comment => ({
          ...comment,
          createdAt: Timestamp.fromDate(comment.createdAt)
        })) || [],
        createdAt: now,
        updatedAt: now
      });
      console.log('Tâche ajoutée avec ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la tâche:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une tâche
   */
  static async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const taskRef = doc(db, COLLECTION_NAME, id);
      const updateData: any = { ...updates };
      
      if (updateData.dueDate) {
        updateData.dueDate = Timestamp.fromDate(updateData.dueDate);
      }
      if (updateData.startDate) {
        updateData.startDate = Timestamp.fromDate(updateData.startDate);
      }
      if (updateData.completedDate) {
        updateData.completedDate = Timestamp.fromDate(updateData.completedDate);
      }
      if (updateData.comments) {
        updateData.comments = updateData.comments.map((comment: any) => ({
          ...comment,
          createdAt: comment.createdAt instanceof Date ? Timestamp.fromDate(comment.createdAt) : comment.createdAt
        }));
      }
      
      await updateDoc(taskRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });
      console.log('Tâche mise à jour:', id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      throw error;
    }
  }

  /**
   * Supprimer une tâche
   */
  static async deleteTask(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      console.log('Tâche supprimée:', id);
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'une tâche
   */
  static async updateTaskStatus(id: string, status: Task['status']): Promise<void> {
    try {
      const taskRef = doc(db, COLLECTION_NAME, id);
      const updateData: any = { 
        status,
        updatedAt: Timestamp.now()
      };
      
      // Si la tâche est marquée comme terminée, ajouter la date de completion
      if (status === 'done') {
        updateData.completedDate = Timestamp.now();
      } else if (status === 'in_progress') {
        // Si la tâche passe en cours, ajouter la date de début si pas déjà définie
        const taskDoc = await getDocs(query(collection(db, COLLECTION_NAME), where('__name__', '==', id)));
        if (!taskDoc.empty && !taskDoc.docs[0].data().startDate) {
          updateData.startDate = Timestamp.now();
        }
      }
      
      await updateDoc(taskRef, updateData);
      console.log('Statut tâche mis à jour:', id, status);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  /**
   * Assigner une tâche à des utilisateurs
   */
  static async assignTask(id: string, assignedTo: string[]): Promise<void> {
    try {
      const taskRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(taskRef, {
        assignedTo,
        updatedAt: Timestamp.now()
      });
      console.log('Tâche assignée:', id, assignedTo);
    } catch (error) {
      console.error('Erreur lors de l\'assignation de la tâche:', error);
      throw error;
    }
  }

  /**
   * Ajouter un commentaire à une tâche
   */
  static async addComment(id: string, comment: { author: string; content: string }): Promise<void> {
    try {
      const taskRef = doc(db, COLLECTION_NAME, id);
      const taskDoc = await getDocs(query(collection(db, COLLECTION_NAME), where('__name__', '==', id)));
      
      if (!taskDoc.empty) {
        const currentComments = taskDoc.docs[0].data().comments || [];
        const newComment = {
          id: `comment-${Date.now()}`,
          ...comment,
          createdAt: Timestamp.now()
        };
        
        await updateDoc(taskRef, {
          comments: [...currentComments, newComment],
          updatedAt: Timestamp.now()
        });
        console.log('Commentaire ajouté à la tâche:', id);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      throw error;
    }
  }

  /**
   * Écouter les changements en temps réel
   */
  static subscribeToTasks(callback: (tasks: Task[]) => void): () => void {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate() || undefined,
        startDate: doc.data().startDate?.toDate() || undefined,
        completedDate: doc.data().completedDate?.toDate() || undefined,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        comments: doc.data().comments?.map((comment: any) => ({
          ...comment,
          createdAt: comment.createdAt?.toDate() || new Date()
        })) || []
      })) as Task[];
      
      callback(tasks);
    }, (error) => {
      console.error('Erreur lors de l\'écoute des tâches:', error);
    });
  }

  /**
   * Initialiser avec des données de test (à utiliser une seule fois)
   */
  static async initializeTestData(): Promise<void> {
    try {
      const existingTasks = await this.getAllTasks();
      if (existingTasks.length > 0) {
        console.log('Les tâches existent déjà, pas d\'initialisation nécessaire');
        return;
      }

      const testTasks = [
        {
          name: 'Préparation du terrain',
          description: 'Nettoyage et préparation du terrain pour les fondations',
          status: 'done' as const,
          priority: 'high' as const,
          assignedTo: ['Pierre Leroy', 'Marie Martin'],
          dueDate: new Date('2024-02-15'),
          startDate: new Date('2024-02-01'),
          completedDate: new Date('2024-02-14'),
          estimatedHours: 40,
          actualHours: 38,
          tags: ['terrain', 'préparation', 'fondations'],
          phaseId: 'phase-1',
          projectId: 'project-1',
          subtasks: [
            { id: 'sub-1', name: 'Débroussaillage', completed: true, assignedTo: 'Pierre Leroy' },
            { id: 'sub-2', name: 'Nivellement', completed: true, assignedTo: 'Marie Martin' }
          ],
          comments: [
            {
              id: 'comment-1',
              author: 'Pierre Leroy',
              content: 'Terrain préparé selon les spécifications',
              createdAt: new Date('2024-02-14')
            }
          ]
        },
        {
          name: 'Coulage des fondations',
          description: 'Réalisation des fondations en béton armé',
          status: 'in_progress' as const,
          priority: 'high' as const,
          assignedTo: ['Jean Dupont', 'Sophie Leroy'],
          dueDate: new Date('2024-03-01'),
          startDate: new Date('2024-02-15'),
          estimatedHours: 60,
          actualHours: 35,
          tags: ['fondations', 'béton', 'armature'],
          phaseId: 'phase-1',
          projectId: 'project-1',
          subtasks: [
            { id: 'sub-3', name: 'Pose des armatures', completed: true, assignedTo: 'Jean Dupont' },
            { id: 'sub-4', name: 'Coulage béton', completed: false, assignedTo: 'Sophie Leroy' }
          ],
          comments: [
            {
              id: 'comment-2',
              author: 'Jean Dupont',
              content: 'Armatures posées, prêt pour le coulage',
              createdAt: new Date('2024-02-20')
            }
          ]
        },
        {
          name: 'Montage de la structure',
          description: 'Assemblage de la structure porteuse',
          status: 'todo' as const,
          priority: 'medium' as const,
          assignedTo: ['Pierre Leroy'],
          dueDate: new Date('2024-03-15'),
          estimatedHours: 80,
          tags: ['structure', 'assemblage', 'charpente'],
          dependencies: ['task-2'],
          phaseId: 'phase-2',
          projectId: 'project-1',
          subtasks: [
            { id: 'sub-5', name: 'Préparation des éléments', completed: false },
            { id: 'sub-6', name: 'Assemblage principal', completed: false }
          ]
        },
        {
          name: 'Installation électrique',
          description: 'Mise en place du réseau électrique',
          status: 'todo' as const,
          priority: 'medium' as const,
          assignedTo: ['Marie Martin'],
          dueDate: new Date('2024-03-30'),
          estimatedHours: 50,
          tags: ['électricité', 'installation', 'réseau'],
          phaseId: 'phase-3',
          projectId: 'project-1',
          subtasks: [
            { id: 'sub-7', name: 'Passage des gaines', completed: false },
            { id: 'sub-8', name: 'Câblage', completed: false },
            { id: 'sub-9', name: 'Tests de conformité', completed: false }
          ]
        },
        {
          name: 'Finitions intérieures',
          description: 'Travaux de finition et décoration intérieure',
          status: 'todo' as const,
          priority: 'low' as const,
          assignedTo: ['Sophie Leroy'],
          dueDate: new Date('2024-04-15'),
          estimatedHours: 70,
          tags: ['finitions', 'décoration', 'intérieur'],
          phaseId: 'phase-4',
          projectId: 'project-1',
          subtasks: [
            { id: 'sub-10', name: 'Peinture', completed: false },
            { id: 'sub-11', name: 'Revêtements sols', completed: false },
            { id: 'sub-12', name: 'Menuiseries', completed: false }
          ]
        }
      ];

      for (const task of testTasks) {
        await this.addTask(task);
      }

      console.log('✅ Données de test des tâches initialisées');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des données de test:', error);
      throw error;
    }
  }
}
