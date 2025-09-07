# 📧 Guide de Configuration du Service d'Email - BTP Manager

## Vue d'ensemble

L'application BTP Manager supporte trois fournisseurs d'email principaux :
- **SendGrid** (Recommandé pour la production)
- **Mailgun** (Alternative robuste)
- **Resend** (Moderne et simple)

## 🔧 Configuration Rapide

### 1. Choisir un Fournisseur

#### SendGrid (Recommandé)
- ✅ Interface simple et intuitive
- ✅ 100 emails gratuits par jour
- ✅ Excellent support des templates
- ✅ Analytics détaillées

#### Mailgun
- ✅ Très fiable pour les gros volumes
- ✅ 5000 emails gratuits les 3 premiers mois
- ✅ API puissante
- ✅ Bon pour les applications transactionnelles

#### Resend
- ✅ Interface moderne
- ✅ 3000 emails gratuits par mois
- ✅ Excellent pour les développeurs
- ✅ Support React Email

### 2. Obtenir les Clés API

#### SendGrid
1. Créer un compte sur [sendgrid.com](https://sendgrid.com)
2. Aller dans **Settings** > **API Keys**
3. Créer une nouvelle clé avec permissions **Mail Send**
4. Copier la clé (format: `SG.xxxxx`)

#### Mailgun
1. Créer un compte sur [mailgun.com](https://mailgun.com)
2. Aller dans **Settings** > **API Keys**
3. Copier la **Private API Key**
4. Noter votre domaine (ex: `sandbox-xxx.mailgun.org`)

#### Resend
1. Créer un compte sur [resend.com](https://resend.com)
2. Aller dans **API Keys**
3. Créer une nouvelle clé
4. Copier la clé (format: `re_xxxxx`)

### 3. Configuration des Variables d'Environnement

Créer un fichier `.env` à la racine du projet :

```bash
# Configuration Firebase (déjà configuré)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Configuration Email - Choisir UN seul fournisseur
VITE_EMAIL_PROVIDER=sendgrid
# OU
# VITE_EMAIL_PROVIDER=mailgun
# OU  
# VITE_EMAIL_PROVIDER=resend

# SendGrid Configuration
VITE_SENDGRID_API_KEY=SG.your_sendgrid_api_key
VITE_SENDGRID_FROM_EMAIL=noreply@votredomaine.com
VITE_SENDGRID_FROM_NAME=BTP Manager

# Mailgun Configuration (si utilisé)
VITE_MAILGUN_API_KEY=your_mailgun_private_key
VITE_MAILGUN_DOMAIN=sandbox-xxx.mailgun.org
VITE_MAILGUN_FROM_EMAIL=noreply@sandbox-xxx.mailgun.org
VITE_MAILGUN_FROM_NAME=BTP Manager

# Resend Configuration (si utilisé)
VITE_RESEND_API_KEY=re_your_resend_api_key
VITE_RESEND_FROM_EMAIL=noreply@votredomaine.com
VITE_RESEND_FROM_NAME=BTP Manager
```

## 🧪 Test de Configuration

### 1. Test Automatique dans l'Application

L'application inclut une page de test d'email accessible via :
- URL : `http://localhost:5173` puis naviguer vers "auth-test"
- Ou directement dans le code : section `auth-test`

### 2. Test Manuel avec SendGrid

```javascript
// Test rapide dans la console du navigateur
const testEmail = {
  to: 'votre-email@example.com',
  subject: 'Test BTP Manager',
  html: '<h1>Email de test</h1><p>Si vous recevez ceci, la configuration fonctionne !</p>'
};

// Utiliser le service d'email de l'app
emailService.sendEmail(testEmail).then(
  () => console.log('✅ Email envoyé avec succès !'),
  (error) => console.error('❌ Erreur:', error)
);
```

## 🔒 Sécurité et Bonnes Pratiques

### Variables d'Environnement
- ❌ **JAMAIS** commiter les clés API dans Git
- ✅ Utiliser des variables d'environnement
- ✅ Différentes clés pour dev/staging/production
- ✅ Rotation régulière des clés

### Validation des Emails
- ✅ Validation côté client ET serveur
- ✅ Sanitisation du contenu HTML
- ✅ Limitation du taux d'envoi
- ✅ Liste de blocage pour les spams

### Monitoring
- ✅ Logs des envois d'emails
- ✅ Tracking des erreurs
- ✅ Métriques de délivrabilité
- ✅ Alertes en cas de problème

## 🚀 Déploiement en Production

### Netlify
```bash
# Ajouter les variables d'environnement dans Netlify
netlify env:set VITE_EMAIL_PROVIDER sendgrid
netlify env:set VITE_SENDGRID_API_KEY SG.your_production_key
netlify env:set VITE_SENDGRID_FROM_EMAIL noreply@votredomaine.com
```

### Vercel
```bash
# Ajouter les variables d'environnement dans Vercel
vercel env add VITE_EMAIL_PROVIDER
vercel env add VITE_SENDGRID_API_KEY
vercel env add VITE_SENDGRID_FROM_EMAIL
```

### Autres Plateformes
Consulter la documentation de votre plateforme pour ajouter les variables d'environnement.

## 🐛 Dépannage

### Erreurs Courantes

#### "API Key Invalid"
- ✅ Vérifier que la clé est correcte
- ✅ Vérifier les permissions de la clé
- ✅ Régénérer la clé si nécessaire

#### "Domain Not Verified" (Mailgun)
- ✅ Vérifier la configuration DNS
- ✅ Utiliser le domaine sandbox pour les tests
- ✅ Attendre la propagation DNS (24-48h)

#### "Rate Limit Exceeded"
- ✅ Respecter les limites du plan gratuit
- ✅ Implémenter un système de queue
- ✅ Upgrader vers un plan payant

#### "Email Not Delivered"
- ✅ Vérifier les spams/promotions
- ✅ Utiliser un domaine vérifié
- ✅ Configurer SPF/DKIM/DMARC

## 📊 Monitoring et Analytics

### SendGrid Analytics
- Dashboard complet dans l'interface SendGrid
- Métriques : delivered, opens, clicks, bounces
- Webhooks pour les événements en temps réel

### Logs Application
```javascript
// Les logs sont automatiquement générés
console.log('Email envoyé:', { to, subject, provider: 'sendgrid' });
console.error('Erreur email:', { error, to, subject });
```

## 🔄 Migration entre Fournisseurs

Pour changer de fournisseur :
1. Modifier `VITE_EMAIL_PROVIDER` dans `.env`
2. Ajouter les nouvelles variables du fournisseur
3. Redémarrer l'application
4. Tester l'envoi d'emails

Le service s'adapte automatiquement au fournisseur configuré.

## 📞 Support

En cas de problème :
1. Vérifier ce guide de dépannage
2. Consulter la documentation du fournisseur
3. Tester avec le fichier `test-firebase.html`
4. Vérifier les logs de la console navigateur

---

**Note :** Ce guide couvre la configuration pour un environnement de développement et de production. Adaptez les configurations selon vos besoins spécifiques.
