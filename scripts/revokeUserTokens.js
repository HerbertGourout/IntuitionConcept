// Script Node.js pour révoquer tous les refresh tokens d'un utilisateur Firebase (logout partout)
// Usage : node revokeUserTokens.js <uid>

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Assurez-vous que ce fichier existe

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function main() {
  const [, , uid] = process.argv;
  if (!uid) {
    console.error('Usage: node revokeUserTokens.js <uid>');
    process.exit(1);
  }

  try {
    await admin.auth().revokeRefreshTokens(uid);
    const user = await admin.auth().getUser(uid);
    console.log(`Refresh tokens révoqués pour l'utilisateur ${uid} (${user.email || 'email inconnu'}).`);
    console.log('Les utilisateurs devront se reconnecter.');
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la révocation des tokens:', err);
    process.exit(1);
  }
}

main();
