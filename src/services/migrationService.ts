/**
 * Service de migration complète vers Firebase
 * Gère la transition de toutes les données locales vers Firebase
 */

import { TaskService } from './taskService';
import { DocumentService } from './documentService';
import { EquipmentService } from './equipmentService';
import { ProjectService } from './projectService';
import { LocationService } from './locationService';
import { clearAllLocalData, initializeAllFirebaseTestData } from '../utils/clearAllData';

export interface MigrationStatus {
  isComplete: boolean;
  completedModules: string[];
  pendingModules: string[];
  errors: string[];
  lastMigrationDate?: Date;
}

export class MigrationService {
  private static readonly MIGRATION_KEY = 'firebase_migration_status';
  
  /**
   * Vérifier l'état de la migration
   */
  static getMigrationStatus(): MigrationStatus {
    try {
      const stored = localStorage.getItem(this.MIGRATION_KEY);
      if (stored) {
        const status = JSON.parse(stored);
        return {
          ...status,
          lastMigrationDate: status.lastMigrationDate ? new Date(status.lastMigrationDate) : undefined
        };
      }
    } catch (error) {
      console.warn('Erreur lors de la lecture du statut de migration:', error);
    }

    return {
      isComplete: false,
      completedModules: [],
      pendingModules: ['Tasks', 'Documents', 'Equipment', 'Projects', 'Locations'],
      errors: []
    };
  }

  /**
   * Sauvegarder l'état de la migration
   */
  private static saveMigrationStatus(status: MigrationStatus): void {
    try {
      localStorage.setItem(this.MIGRATION_KEY, JSON.stringify({
        ...status,
        lastMigrationDate: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du statut de migration:', error);
    }
  }

  /**
   * Initialiser les données de test pour un module spécifique
   */
  static async initializeModuleData(moduleName: string): Promise<boolean> {
    try {
      console.log(`🚀 Initialisation des données ${moduleName}...`);
      
      switch (moduleName.toLowerCase()) {
        case 'tasks':
          await TaskService.initializeTestData();
          break;
        case 'documents':
          await DocumentService.initializeTestData();
          break;
        case 'equipment':
          await EquipmentService.initializeTestData();
          break;
        case 'projects':
          await ProjectService.initializeTestData();
          break;
        case 'locations':
          await LocationService.initializeTestData();
          break;
        default:
          throw new Error(`Module inconnu: ${moduleName}`);
      }

      console.log(`✅ Données ${moduleName} initialisées avec succès`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'initialisation de ${moduleName}:`, error);
      return false;
    }
  }

  /**
   * Vérifier si un module a des données
   */
  static async checkModuleData(moduleName: string): Promise<boolean> {
    try {
      switch (moduleName.toLowerCase()) {
        case 'tasks':
          const tasks = await TaskService.getAllTasks();
          return tasks.length > 0;
        case 'documents':
          const documents = await DocumentService.getAllDocuments();
          return documents.length > 0;
        case 'equipment':
          const equipment = await EquipmentService.getAllEquipment();
          return equipment.length > 0;
        case 'projects':
          const projects = await ProjectService.getAllProjects();
          return projects.length > 0;
        case 'locations':
          const locations = await LocationService.getAllLocations();
          return locations.length > 0;
        default:
          return false;
      }
    } catch (error) {
      console.error(`Erreur lors de la vérification de ${moduleName}:`, error);
      return false;
    }
  }

  /**
   * Effectuer la migration complète
   */
  static async performFullMigration(): Promise<MigrationStatus> {
    console.log('🔄 Début de la migration complète vers Firebase...');
    
    const status: MigrationStatus = {
      isComplete: false,
      completedModules: [],
      pendingModules: ['Tasks', 'Documents', 'Equipment', 'Projects', 'Locations'],
      errors: []
    };

    try {
      // 1. Nettoyer toutes les données locales
      console.log('🧹 Nettoyage des données locales...');
      await clearAllLocalData();

      // 2. Initialiser chaque module
      for (const moduleName of status.pendingModules) {
        try {
          // Vérifier si le module a déjà des données
          const hasData = await this.checkModuleData(moduleName);
          
          if (!hasData) {
            console.log(`📦 Initialisation du module ${moduleName}...`);
            const success = await this.initializeModuleData(moduleName);
            
            if (success) {
              status.completedModules.push(moduleName);
            } else {
              status.errors.push(`Échec de l'initialisation de ${moduleName}`);
            }
          } else {
            console.log(`✅ Module ${moduleName} déjà initialisé`);
            status.completedModules.push(moduleName);
          }
        } catch (error) {
          const errorMsg = `Erreur lors de la migration de ${moduleName}: ${error}`;
          console.error(errorMsg);
          status.errors.push(errorMsg);
        }
      }

      // 3. Mettre à jour le statut
      status.pendingModules = status.pendingModules.filter(
        module => !status.completedModules.includes(module)
      );
      status.isComplete = status.pendingModules.length === 0 && status.errors.length === 0;

      // 4. Sauvegarder le statut
      this.saveMigrationStatus(status);

      if (status.isComplete) {
        console.log('🎉 Migration complète terminée avec succès !');
        console.log('📱 L\'application utilise maintenant exclusivement Firebase');
      } else {
        console.warn('⚠️ Migration partiellement terminée avec des erreurs:', status.errors);
      }

    } catch (error) {
      const errorMsg = `Erreur critique lors de la migration: ${error}`;
      console.error(errorMsg);
      status.errors.push(errorMsg);
    }

    return status;
  }

  /**
   * Forcer la réinitialisation complète
   */
  static async forceReset(): Promise<void> {
    console.log('🔄 Réinitialisation complète forcée...');
    
    try {
      // Supprimer le statut de migration
      localStorage.removeItem(this.MIGRATION_KEY);
      
      // Nettoyer toutes les données
      await clearAllLocalData();
      
      console.log('✅ Réinitialisation terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation:', error);
      throw error;
    }
  }

  /**
   * Vérifier la santé de la migration
   */
  static async checkMigrationHealth(): Promise<{
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Vérifier chaque module
      const modules = ['Tasks', 'Documents', 'Equipment', 'Projects', 'Locations'];
      
      for (const module of modules) {
        const hasData = await this.checkModuleData(module);
        if (!hasData) {
          issues.push(`Module ${module} n'a pas de données`);
          recommendations.push(`Initialiser les données de test pour ${module}`);
        }
      }

      // Vérifier les données locales
      const hasLocalStorage = localStorage.length > 0;
      const hasSessionStorage = sessionStorage.length > 0;
      
      if (hasLocalStorage) {
        issues.push('Des données localStorage sont encore présentes');
        recommendations.push('Exécuter clearAllLocalData()');
      }
      
      if (hasSessionStorage) {
        issues.push('Des données sessionStorage sont encore présentes');
        recommendations.push('Exécuter clearAllLocalData()');
      }

    } catch (error) {
      issues.push(`Erreur lors de la vérification: ${error}`);
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Obtenir un rapport détaillé de la migration
   */
  static async getMigrationReport(): Promise<{
    status: MigrationStatus;
    health: Awaited<ReturnType<typeof MigrationService.checkMigrationHealth>>;
    moduleDetails: Array<{
      name: string;
      hasData: boolean;
      dataCount: number;
    }>;
  }> {
    const status = this.getMigrationStatus();
    const health = await this.checkMigrationHealth();
    
    const moduleDetails = await Promise.all([
      'Tasks', 'Documents', 'Equipment', 'Projects', 'Locations'
    ].map(async (moduleName) => {
      const hasData = await this.checkModuleData(moduleName);
      let dataCount = 0;
      
      try {
        switch (moduleName.toLowerCase()) {
          case 'tasks':
            dataCount = (await TaskService.getAllTasks()).length;
            break;
          case 'documents':
            dataCount = (await DocumentService.getAllDocuments()).length;
            break;
          case 'equipment':
            dataCount = (await EquipmentService.getAllEquipment()).length;
            break;
          case 'projects':
            dataCount = (await ProjectService.getAllProjects()).length;
            break;
          case 'locations':
            dataCount = (await LocationService.getAllLocations()).length;
            break;
        }
      } catch (error) {
        console.warn(`Erreur lors du comptage pour ${moduleName}:`, error);
      }

      return {
        name: moduleName,
        hasData,
        dataCount
      };
    }));

    return {
      status,
      health,
      moduleDetails
    };
  }
}
