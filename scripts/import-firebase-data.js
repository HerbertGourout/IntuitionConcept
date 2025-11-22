/**
 * Script pour importer les données dans le nouveau compte Firebase
 * Usage: node scripts/import-firebase-data.js
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Configuration du NOUVEAU compte définitif
const serviceAccount = {
  // Téléchargez votre service account depuis le NOUVEAU projet Firebase
  // Project Settings > Service Accounts > Generate new private key
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importCollection(collectionName) {
  console.log(`📥 Import de la collection: ${collectionName}...`);
  
  const filePath = path.join(process.cwd(), 'firebase-backup', `${collectionName}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Fichier non trouvé: ${filePath}`);
    return 0;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const batch = db.batch();
  let count = 0;
  
  for (const doc of data) {
    const { id, ...docData } = doc;
    const docRef = db.collection(collectionName).doc(id);
    batch.set(docRef, docData);
    count++;
    
    // Firestore batch limit is 500
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`  ✓ ${count} documents importés...`);
    }
  }
  
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`✅ ${count} documents importés dans ${collectionName}`);
  return count;
}

async function importAllData() {
  console.log('🚀 Début de l\'import des données Firebase...\n');
  
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
      const count = await importCollection(collection);
      totalDocs += count;
    } catch (error) {
      console.error(`❌ Erreur lors de l'import de ${collection}:`, error.message);
    }
  }
  
  console.log(`\n✅ Import terminé ! Total: ${totalDocs} documents`);
}

importAllData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
