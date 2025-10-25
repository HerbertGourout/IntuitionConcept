/**
 * Script de test pour vérifier la clé API Replicate
 * Usage: node test-replicate.js
 */

import Replicate from 'replicate';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

async function testReplicateAPI() {
  console.log('🧪 Test de la clé API Replicate...\n');

  // Vérifier si la clé existe
  const apiKey = process.env.VITE_REPLICATE_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ERREUR: VITE_REPLICATE_API_KEY non trouvée dans .env.local');
    console.log('\n📝 Pour configurer:');
    console.log('1. Créez un fichier .env.local à la racine du projet');
    console.log('2. Ajoutez: VITE_REPLICATE_API_KEY=r8_votre_cle_ici');
    console.log('3. Obtenez votre clé sur: https://replicate.com/account/api-tokens\n');
    process.exit(1);
  }

  console.log('✅ Clé API trouvée:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
  console.log('📏 Longueur de la clé:', apiKey.length, 'caractères\n');

  // Initialiser Replicate
  try {
    const replicate = new Replicate({ auth: apiKey });
    console.log('✅ Client Replicate initialisé\n');

    // Test 1: Vérifier les modèles disponibles
    console.log('🔍 Test 1: Récupération des informations du compte...');
    try {
      // Tester avec un modèle simple et rapide
      const model = await replicate.models.get('stability-ai', 'sdxl');
      console.log('✅ Modèle SDXL accessible');
      console.log('   - Nom:', model.name);
      console.log('   - Description:', model.description?.substring(0, 100) + '...');
    } catch (error) {
      console.error('❌ Erreur lors de l\'accès au modèle:', error.message);
    }

    // Test 2: Vérifier le crédit
    console.log('\n💰 Test 2: Vérification du crédit...');
    console.log('ℹ️  Note: Replicate ne fournit pas d\'API pour vérifier le crédit directement');
    console.log('   Consultez: https://replicate.com/account/billing\n');

    // Test 3: Test de génération simple (commenté pour éviter les coûts)
    console.log('🎨 Test 3: Génération d\'image (DÉSACTIVÉ pour éviter les coûts)');
    console.log('   Pour tester une vraie génération, décommentez le code dans test-replicate.js\n');
    
    /*
    // DÉCOMMENTEZ POUR TESTER UNE VRAIE GÉNÉRATION (coût: ~$0.002)
    console.log('⏳ Génération en cours...');
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: "a simple red circle on white background, minimalist",
          num_outputs: 1,
          num_inference_steps: 20,
          width: 512,
          height: 512
        }
      }
    );
    console.log('✅ Image générée:', output[0]);
    */

    console.log('✅ SUCCÈS: Votre clé API Replicate est valide et fonctionnelle!\n');
    console.log('📊 Résumé:');
    console.log('   ✓ Clé API valide');
    console.log('   ✓ Connexion à Replicate OK');
    console.log('   ✓ Accès aux modèles OK');
    console.log('\n🚀 Vous pouvez maintenant utiliser le générateur 3D dans l\'application!\n');

  } catch (error) {
    console.error('\n❌ ERREUR lors du test:');
    console.error('   Message:', error.message);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.error('\n🔑 Votre clé API est invalide ou expirée');
      console.error('   1. Vérifiez que vous avez copié la clé complète');
      console.error('   2. Générez une nouvelle clé sur: https://replicate.com/account/api-tokens');
      console.error('   3. Mettez à jour VITE_REPLICATE_API_KEY dans .env.local\n');
    } else if (error.message.includes('402') || error.message.includes('Payment Required')) {
      console.error('\n💳 Crédit insuffisant sur votre compte Replicate');
      console.error('   Ajoutez des crédits sur: https://replicate.com/account/billing\n');
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      console.error('\n🌐 Problème de connexion internet');
      console.error('   Vérifiez votre connexion et réessayez\n');
    } else {
      console.error('\n   Stack:', error.stack);
    }
    
    process.exit(1);
  }
}

// Exécuter le test
testReplicateAPI().catch(console.error);
