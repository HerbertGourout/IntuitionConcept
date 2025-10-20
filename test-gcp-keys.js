// Script de test pour vérifier les clés API Google Cloud Platform
// Usage: node test-gcp-keys.js

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement depuis .env.local
const envPath = join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
  console.log('✅ Fichier .env.local chargé\n');
} else {
  console.error('❌ Fichier .env.local non trouvé');
  process.exit(1);
}

// Récupérer les clés
const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY;
const GOOGLE_CLOUD_KEY = process.env.VITE_GOOGLE_CLOUD_API_KEY;
const GOOGLE_VISION_KEY = process.env.VITE_GOOGLE_VISION_API_KEY;
const PROJECT_ID = process.env.VITE_GOOGLE_CLOUD_PROJECT_ID;

console.log('🔍 Vérification des clés API Google Cloud\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Vérifier la présence des clés
console.log('📋 Clés configurées:');
console.log(`  VITE_GEMINI_API_KEY: ${GEMINI_KEY ? '✅ Présente' : '❌ Manquante'}`);
console.log(`  VITE_GOOGLE_CLOUD_API_KEY: ${GOOGLE_CLOUD_KEY ? '✅ Présente' : '❌ Manquante'}`);
console.log(`  VITE_GOOGLE_VISION_API_KEY: ${GOOGLE_VISION_KEY ? '✅ Présente' : '❌ Manquante'}`);
console.log(`  VITE_GOOGLE_CLOUD_PROJECT_ID: ${PROJECT_ID ? '✅ Présent' : '❌ Manquant'}\n`);

if (!GEMINI_KEY && !GOOGLE_CLOUD_KEY && !GOOGLE_VISION_KEY) {
  console.error('❌ Aucune clé API Google configurée');
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Google Gemini API
async function testGeminiAPI() {
  if (!GEMINI_KEY) {
    console.log('⏭️  Test Gemini API ignoré (clé manquante)\n');
    return;
  }

  console.log('🧪 Test 1: Google Gemini API');
  console.log('   Endpoint: https://generativelanguage.googleapis.com/v1beta/models');
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Gemini API fonctionne !');
      console.log(`   📊 Modèles disponibles: ${data.models?.length || 0}`);
      if (data.models && data.models.length > 0) {
        console.log(`   🤖 Exemple: ${data.models[0].name}`);
      }
    } else {
      const error = await response.text();
      console.log(`   ❌ Erreur ${response.status}: ${response.statusText}`);
      console.log(`   💡 Détails: ${error.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur de connexion: ${error.message}`);
  }
  console.log('');
}

// Test 2: Google Vision API
async function testVisionAPI() {
  if (!GOOGLE_VISION_KEY) {
    console.log('⏭️  Test Vision API ignoré (clé manquante)\n');
    return;
  }

  console.log('🧪 Test 2: Google Vision API');
  console.log('   Endpoint: https://vision.googleapis.com/v1/images:annotate');
  
  try {
    // Test avec une image base64 simple (1x1 pixel blanc)
    const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: testImage },
            features: [{ type: 'LABEL_DETECTION', maxResults: 1 }]
          }]
        })
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Vision API fonctionne !');
      if (data.responses && data.responses[0]) {
        console.log('   📸 API répond correctement aux requêtes d\'analyse d\'image');
      }
    } else {
      const error = await response.text();
      console.log(`   ❌ Erreur ${response.status}: ${response.statusText}`);
      console.log(`   💡 Détails: ${error.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur de connexion: ${error.message}`);
  }
  console.log('');
}

// Test 3: Google Cloud Project
async function testProjectAccess() {
  if (!GOOGLE_CLOUD_KEY || !PROJECT_ID) {
    console.log('⏭️  Test Project Access ignoré (clé ou project ID manquant)\n');
    return;
  }

  console.log('🧪 Test 3: Google Cloud Project Access');
  console.log(`   Project ID: ${PROJECT_ID}`);
  
  try {
    // Tester l'accès au projet via Cloud Resource Manager API
    const response = await fetch(
      `https://cloudresourcemanager.googleapis.com/v1/projects/${PROJECT_ID}?key=${GOOGLE_CLOUD_KEY}`
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Accès au projet confirmé !');
      console.log(`   📁 Nom du projet: ${data.name || 'N/A'}`);
      console.log(`   🆔 Project ID: ${data.projectId || PROJECT_ID}`);
    } else {
      const error = await response.text();
      console.log(`   ⚠️  Statut ${response.status}: ${response.statusText}`);
      console.log(`   💡 Note: L'API Cloud Resource Manager peut ne pas être activée`);
      console.log(`   💡 Cela n'empêche pas les autres APIs de fonctionner`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur de connexion: ${error.message}`);
  }
  console.log('');
}

// Test 4: Vérifier les APIs activées
async function checkEnabledAPIs() {
  if (!GOOGLE_CLOUD_KEY || !PROJECT_ID) {
    console.log('⏭️  Vérification des APIs ignorée (clé ou project ID manquant)\n');
    return;
  }

  console.log('🧪 Test 4: APIs activées sur le projet');
  
  const apisToCheck = [
    { name: 'Generative Language API', service: 'generativelanguage.googleapis.com' },
    { name: 'Cloud Vision API', service: 'vision.googleapis.com' },
    { name: 'Document AI API', service: 'documentai.googleapis.com' }
  ];

  for (const api of apisToCheck) {
    try {
      const response = await fetch(
        `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/${api.service}?key=${GOOGLE_CLOUD_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const isEnabled = data.state === 'ENABLED';
        console.log(`   ${isEnabled ? '✅' : '❌'} ${api.name}: ${isEnabled ? 'Activée' : 'Désactivée'}`);
      } else {
        console.log(`   ⚠️  ${api.name}: Impossible de vérifier (API Service Usage peut ne pas être activée)`);
      }
    } catch (error) {
      console.log(`   ⚠️  ${api.name}: Erreur de vérification`);
    }
  }
  console.log('');
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests...\n');
  
  await testGeminiAPI();
  await testVisionAPI();
  await testProjectAccess();
  await checkEnabledAPIs();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Tests terminés !');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('💡 Recommandations:');
  console.log('   - Si une API ne fonctionne pas, vérifiez qu\'elle est activée dans Google Cloud Console');
  console.log('   - Allez sur: https://console.cloud.google.com/apis/library');
  console.log('   - Recherchez et activez les APIs nécessaires\n');
}

// Lancer les tests
runAllTests().catch(console.error);
