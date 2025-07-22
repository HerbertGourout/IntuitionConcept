/**
 * Script d'exécution de la migration Firebase
 * À exécuter une seule fois pour migrer complètement vers Firebase
 */

import { MigrationService } from '../services/migrationService';

/**
 * Exécuter la migration complète
 */
export const executeMigration = async (): Promise<void> => {
  console.log('🚀 Démarrage de la migration complète vers Firebase...');
  
  try {
    // 1. Vérifier l'état actuel
    console.log('📊 Vérification de l\'état actuel...');
    const currentStatus = MigrationService.getMigrationStatus();
    console.log('État actuel:', currentStatus);

    if (currentStatus.isComplete) {
      console.log('✅ Migration déjà terminée !');
      
      // Vérifier la santé quand même
      const health = await MigrationService.checkMigrationHealth();
      if (!health.isHealthy) {
        console.warn('⚠️ Problèmes détectés malgré la migration terminée:', health.issues);
        console.log('💡 Recommandations:', health.recommendations);
      }
      
      return;
    }

    // 2. Effectuer la migration
    console.log('🔄 Exécution de la migration...');
    const migrationResult = await MigrationService.performFullMigration();
    
    // 3. Afficher les résultats
    console.log('📋 Résultats de la migration:');
    console.log('- Modules complétés:', migrationResult.completedModules);
    console.log('- Modules en attente:', migrationResult.pendingModules);
    console.log('- Erreurs:', migrationResult.errors);
    console.log('- Migration complète:', migrationResult.isComplete ? '✅' : '❌');

    // 4. Vérifier la santé après migration
    console.log('🏥 Vérification de la santé post-migration...');
    const healthCheck = await MigrationService.checkMigrationHealth();
    
    if (healthCheck.isHealthy) {
      console.log('✅ Migration réussie ! L\'application utilise maintenant Firebase exclusivement.');
    } else {
      console.warn('⚠️ Migration terminée avec des problèmes:');
      console.log('- Problèmes:', healthCheck.issues);
      console.log('- Recommandations:', healthCheck.recommendations);
    }

    // 5. Générer un rapport détaillé
    console.log('📊 Génération du rapport détaillé...');
    const report = await MigrationService.getMigrationReport();
    
    console.log('📈 Rapport de migration détaillé:');
    console.table(report.moduleDetails);
    
    console.log('🎉 Migration terminée !');
    
  } catch (error) {
    console.error('💥 Erreur critique lors de la migration:', error);
    throw error;
  }
};

/**
 * Réinitialiser complètement et recommencer la migration
 */
export const resetAndMigrate = async (): Promise<void> => {
  console.log('🔄 Réinitialisation complète et nouvelle migration...');
  
  try {
    // 1. Forcer la réinitialisation
    await MigrationService.forceReset();
    
    // 2. Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Exécuter la migration
    await executeMigration();
    
  } catch (error) {
    console.error('💥 Erreur lors de la réinitialisation:', error);
    throw error;
  }
};

/**
 * Vérifier uniquement l'état sans migrer
 */
export const checkMigrationStatus = async (): Promise<void> => {
  console.log('🔍 Vérification de l\'état de la migration...');
  
  try {
    const report = await MigrationService.getMigrationReport();
    
    console.log('📊 État de la migration:');
    console.log('- Complète:', report.status.isComplete ? '✅' : '❌');
    console.log('- Modules complétés:', report.status.completedModules);
    console.log('- Modules en attente:', report.status.pendingModules);
    console.log('- Erreurs:', report.status.errors);
    
    console.log('🏥 Santé de la migration:');
    console.log('- Saine:', report.health.isHealthy ? '✅' : '❌');
    console.log('- Problèmes:', report.health.issues);
    console.log('- Recommandations:', report.health.recommendations);
    
    console.log('📈 Détails des modules:');
    console.table(report.moduleDetails);
    
  } catch (error) {
    console.error('💥 Erreur lors de la vérification:', error);
    throw error;
  }
};

// Exporter les fonctions pour utilisation dans la console du navigateur
if (typeof window !== 'undefined') {
  (window as any).executeMigration = executeMigration;
  (window as any).resetAndMigrate = resetAndMigrate;
  (window as any).checkMigrationStatus = checkMigrationStatus;
  
  console.log('🔧 Fonctions de migration disponibles dans la console:');
  console.log('- executeMigration() : Exécuter la migration complète');
  console.log('- resetAndMigrate() : Réinitialiser et migrer');
  console.log('- checkMigrationStatus() : Vérifier l\'état de la migration');
}
