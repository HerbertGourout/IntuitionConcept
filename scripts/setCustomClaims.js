// Script Node.js pour attribuer un rôle à un utilisateur Firebase
// Usage : node setCustomClaims.js <uid> <role> [projectId1,projectId2,...]

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Télécharge ta clé depuis la console Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const [,, uid, role, projects] = process.argv;

if (!uid || !role) {
  console.error('Usage: node setCustomClaims.js <uid> <role> [projectId1,projectId2,...]');
  process.exit(1);
}

const claims = { role };
if (projects) {
  claims.projects = projects.split(',');
}

admin.auth().setCustomUserClaims(uid, claims)
  .then(() => {
    console.log(`Custom claims set for user ${uid}:`, claims);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting custom claims:', error);
    process.exit(1);
  });
