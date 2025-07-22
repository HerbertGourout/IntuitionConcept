import { 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION_NAME = 'userSettings';

export interface UserSettings {
  id: string;
  userId: string;
  currentProjectId?: string;
  theme?: 'light' | 'dark' | 'system';
  language?: 'fr' | 'en';
  notifications?: {
    email: boolean;
    push: boolean;
    taskReminders: boolean;
    budgetAlerts: boolean;
  };
  preferences?: {
    defaultView: 'dashboard' | 'projects' | 'tasks';
    autoSave: boolean;
    compactMode: boolean;
    defaultCurrency?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  company?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export class UserSettingsService {
  // Obtenir les paramètres utilisateur
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as UserSettings;
      }
      
      // Créer des paramètres par défaut si ils n'existent pas
      const defaultSettings: Omit<UserSettings, 'id'> = {
        userId,
        theme: 'system',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          taskReminders: true,
          budgetAlerts: true
        },
        preferences: {
          defaultView: 'dashboard',
          autoSave: true,
          compactMode: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(docRef, defaultSettings);
      return { id: userId, ...defaultSettings };
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      throw error;
    }
  }

  // Mettre à jour les paramètres utilisateur
  static async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      await updateDoc(docRef, {
        ...settings,
        updatedAt: new Date().toISOString()
      });
      
      console.log('Paramètres utilisateur mis à jour:', userId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      throw error;
    }
  }

  // Définir le projet courant
  static async setCurrentProject(userId: string, projectId: string | null): Promise<void> {
    try {
      await this.updateUserSettings(userId, { currentProjectId: projectId || undefined });
    } catch (error) {
      console.error('Erreur lors de la définition du projet courant:', error);
      throw error;
    }
  }

  // Écouter les changements en temps réel
  static subscribeToUserSettings(userId: string, callback: (settings: UserSettings | null) => void): () => void {
    const docRef = doc(db, COLLECTION_NAME, userId);
    
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const settings = { id: docSnap.id, ...docSnap.data() } as UserSettings;
        callback(settings);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Erreur lors de l\'écoute des paramètres:', error);
    });
  }

  // Gestion du profil utilisateur
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'userProfiles', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  }

  // Mettre à jour le profil utilisateur
  static async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, 'userProfiles', userId);
      await updateDoc(docRef, {
        ...profile,
        updatedAt: new Date().toISOString()
      });
      
      console.log('Profil utilisateur mis à jour:', userId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }
}

export default UserSettingsService;
