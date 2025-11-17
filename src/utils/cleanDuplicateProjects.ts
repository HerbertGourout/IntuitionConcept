/**
 * Script utilitaire pour nettoyer les projets dupliqués dans Firebase
 * 
 * ATTENTION: Ce script supprime définitivement les doublons.
 * Utilisez-le avec précaution !
 */

import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface ProjectData {
  id: string;
  name: string;
  createdAt: string;
  description?: string;
  client?: string;
}

/**
 * Nettoie les projets dupliqués en gardant le plus récent de chaque groupe
 */
export async function cleanDuplicateProjects(): Promise<{
  total: number;
  duplicates: number;
  deleted: string[];
}> {
  console.log('🧹 Début du nettoyage des projets dupliqués...');
  
  try {
    // Récupérer tous les projets
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);
    
    const projects: ProjectData[] = [];
    snapshot.forEach((doc) => {
      projects.push({
        id: doc.id,
        name: doc.data().name || '',
        createdAt: doc.data().createdAt || '',
        description: doc.data().description || '',
        client: doc.data().client || ''
      });
    });
    
    console.log(`📊 Total de projets trouvés: ${projects.length}`);
    
    // Grouper les projets par nom
    const projectsByName = new Map<string, ProjectData[]>();
    projects.forEach(project => {
      const key = project.name.toLowerCase().trim();
      if (!projectsByName.has(key)) {
        projectsByName.set(key, []);
      }
      projectsByName.get(key)!.push(project);
    });
    
    // Identifier les doublons
    const duplicateGroups: ProjectData[][] = [];
    projectsByName.forEach((group) => {
      if (group.length > 1) {
        duplicateGroups.push(group);
      }
    });
    
    console.log(`🔍 Groupes de doublons trouvés: ${duplicateGroups.length}`);
    
    // Pour chaque groupe, garder le plus récent et supprimer les autres
    const deletedIds: string[] = [];
    
    for (const group of duplicateGroups) {
      console.log(`\n📋 Groupe: "${group[0].name}" (${group.length} copies)`);
      
      // Trier par date de création (plus récent en premier)
      group.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      // Garder le premier (plus récent), supprimer les autres
      const toKeep = group[0];
      const toDelete = group.slice(1);
      
      console.log(`  ✅ Garder: ${toKeep.id} (créé le ${toKeep.createdAt})`);
      
      for (const project of toDelete) {
        console.log(`  ❌ Supprimer: ${project.id} (créé le ${project.createdAt})`);
        
        try {
          await deleteDoc(doc(db, 'projects', project.id));
          deletedIds.push(project.id);
          console.log(`  🗑️ Supprimé avec succès: ${project.id}`);
        } catch (error) {
          console.error(`  ⚠️ Erreur lors de la suppression de ${project.id}:`, error);
        }
      }
    }
    
    const result = {
      total: projects.length,
      duplicates: duplicateGroups.reduce((sum, group) => sum + group.length - 1, 0),
      deleted: deletedIds
    };
    
    console.log('\n✅ Nettoyage terminé !');
    console.log(`📊 Résumé:`);
    console.log(`   - Total projets: ${result.total}`);
    console.log(`   - Doublons trouvés: ${result.duplicates}`);
    console.log(`   - Projets supprimés: ${result.deleted.length}`);
    console.log(`   - Projets restants: ${result.total - result.deleted.length}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
}

/**
 * Affiche un aperçu des doublons sans les supprimer
 */
export async function previewDuplicates(): Promise<void> {
  console.log('🔍 Aperçu des projets dupliqués...');
  
  try {
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);
    
    const projects: ProjectData[] = [];
    snapshot.forEach((doc) => {
      projects.push({
        id: doc.id,
        name: doc.data().name || '',
        createdAt: doc.data().createdAt || '',
        description: doc.data().description || '',
        client: doc.data().client || ''
      });
    });
    
    console.log(`📊 Total de projets: ${projects.length}`);
    
    // Grouper par nom
    const projectsByName = new Map<string, ProjectData[]>();
    projects.forEach(project => {
      const key = project.name.toLowerCase().trim();
      if (!projectsByName.has(key)) {
        projectsByName.set(key, []);
      }
      projectsByName.get(key)!.push(project);
    });
    
    // Afficher les doublons
    let duplicateCount = 0;
    projectsByName.forEach((group, name) => {
      if (group.length > 1) {
        console.log(`\n📋 "${name}" - ${group.length} copies:`);
        group.forEach((project, index) => {
          console.log(`   ${index + 1}. ID: ${project.id} | Créé: ${project.createdAt}`);
        });
        duplicateCount += group.length - 1;
      }
    });
    
    if (duplicateCount === 0) {
      console.log('\n✅ Aucun doublon trouvé !');
    } else {
      console.log(`\n⚠️ ${duplicateCount} doublons trouvés`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'aperçu:', error);
    throw error;
  }
}
