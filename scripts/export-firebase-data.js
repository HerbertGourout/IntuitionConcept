/**
 * Script pour exporter les données Firebase avant migration
 * Usage: node scripts/export-firebase-data.js
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Configuration du compte temporaire (à remplacer par vos vraies valeurs)
const serviceAccount = {
  // Téléchargez votre service account depuis Firebase Console
  // Project Settings > Service Accounts > Generate new private key
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportCollection(collectionName) {
  console.log(`📦 Export de la collection: ${collectionName}...`);
  
  const snapshot = await db.collection(collectionName).get();
  const data = [];
  
  snapshot.forEach(doc => {
    data.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  const outputPath = path.join(process.cwd(), 'firebase-backup', `${collectionName}.json`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  console.log(`✅ ${data.length} documents exportés vers ${outputPath}`);
  return data.length;
}

async function exportAllData() {
  console.log('🚀 Début de l\'export des données Firebase...\n');
  
  const collections = [
    'projects',
    'quotes',
    'tasks',
    'team',
    'equipment',
    'purchaseOrders',
    'documents',
    'users',
    'settings'
  ];
  
  let totalDocs = 0;
  
  for (const collection of collections) {
    try {
      const count = await exportCollection(collection);
      totalDocs += count;
    } catch (error) {
      console.error(`❌ Erreur lors de l'export de ${collection}:`, error.message);
    }
  }
  
  console.log(`\n✅ Export terminé ! Total: ${totalDocs} documents`);
  console.log(`📁 Fichiers sauvegardés dans: ./firebase-backup/`);
}

exportAllData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
