# 📧 Configuration EmailJS - Guide complet

## ✅ Package installé

```bash
✓ @emailjs/browser installé avec succès
```

---

## 🔧 Configuration en 5 minutes

### Étape 1: Créer un compte EmailJS

1. Aller sur https://www.emailjs.com/
2. Cliquer "Sign Up" (gratuit jusqu'à 200 emails/mois)
3. Confirmer votre email

### Étape 2: Créer un service email

1. Dashboard → "Email Services"
2. Cliquer "Add New Service"
3. Choisir votre fournisseur:
   - **Gmail** (recommandé pour test)
   - Outlook
   - Yahoo
   - Autre
4. Connecter votre compte email
5. Copier le **Service ID** (ex: `service_abc123`)

### Étape 3: Créer des templates

#### Template 1: Étude complétée
1. Dashboard → "Email Templates"
2. Cliquer "Create New Template"
3. **Template Name**: `study_completed_template`
4. **Template ID**: Copier l'ID (ex: `template_xyz789`)

**Contenu du template:**
```
Subject: Étude structurale complétée - {{quote_title}}

Bonjour {{to_name}},

Nous avons le plaisir de vous informer que l'étude structurale pour votre projet "{{quote_title}}" est maintenant complétée.

Un devis définitif est disponible et vous sera transmis dans les plus brefs délais.

Référence: {{quote_id}}

Cordialement,
L'équipe IntuitionConcept
```

#### Template 2: Étude en retard
1. Créer un nouveau template
2. **Template Name**: `study_overdue_template`
3. **Template ID**: Copier l'ID

**Contenu:**
```
Subject: Rappel - Étude structurale en retard

Bonjour,

L'étude structurale pour le projet "{{quote_title}}" ({{quote_id}}) est en retard de {{days_overdue}} jours.

Date prévue: {{expected_date}}
Statut actuel: {{status}}

Merci de faire le nécessaire.

Cordialement
```

### Étape 4: Récupérer la clé publique

1. Dashboard → "Account"
2. Section "API Keys"
3. Copier la **Public Key** (ex: `abc123XYZ`)

---

## 📝 Configuration dans le code

### Fichier à modifier
`src/services/structuralNotificationService.ts`

### Remplacer les valeurs

```typescript
// LIGNE 19-23 environ
await emailjs.send(
  'YOUR_SERVICE_ID',           // ← Remplacer par votre Service ID
  'study_completed_template',  // ← Remplacer par votre Template ID
  templateParams,
  'YOUR_PUBLIC_KEY'            // ← Remplacer par votre Public Key
);
```

### Exemple avec vraies valeurs
```typescript
await emailjs.send(
  'service_abc123',              // Service ID
  'template_xyz789',             // Template ID
  templateParams,
  'abc123XYZ'                    // Public Key
);
```

---

## 🧪 Tester les notifications

### Test 1: Notification étude complétée

```typescript
import StructuralNotificationService from './services/structuralNotificationService';

// Dans votre code
await StructuralNotificationService.notifyStudyCompleted(
  'DEVIS-123',
  'client@example.com',
  'Jean Dupont',
  'Construction Villa R+2'
);
```

**Résultat attendu:**
- ✅ Email envoyé à `client@example.com`
- ✅ Console log: "✅ Email envoyé: étude complétée"

### Test 2: Vérification études en retard

```typescript
// Exécuter manuellement
await StructuralNotificationService.checkOverdueStudies();
```

**Résultat attendu:**
- ✅ Console log des études en retard
- ✅ Emails envoyés si retards > 30 jours

---

## 🔄 Automatisation (Optionnel)

### Option 1: Cron job manuel

Dans votre composant principal:

```typescript
useEffect(() => {
  // Vérifier tous les jours à minuit
  const interval = setInterval(() => {
    StructuralNotificationService.checkOverdueStudies();
  }, 24 * 60 * 60 * 1000); // 24 heures

  return () => clearInterval(interval);
}, []);
```

### Option 2: Firebase Functions (Recommandé)

Créer une Cloud Function qui s'exécute quotidiennement:

```typescript
// functions/index.ts
import * as functions from 'firebase-functions';
import { StructuralNotificationService } from './structuralNotificationService';

export const checkOverdueStudiesDaily = functions.pubsub
  .schedule('0 0 * * *') // Tous les jours à minuit
  .onRun(async (context) => {
    await StructuralNotificationService.checkOverdueStudies();
    return null;
  });
```

---

## 📊 Limites du plan gratuit

| Plan | Emails/mois | Prix |
|------|-------------|------|
| Free | 200 | 0€ |
| Personal | 1,000 | 7€/mois |
| Professional | 10,000 | 35€/mois |

**Recommandation:** Commencer avec le plan gratuit pour tester.

---

## 🐛 Dépannage

### Erreur: "Service ID not found"
**Solution:** Vérifier que le Service ID est correct dans le code.

### Erreur: "Template not found"
**Solution:** Vérifier que le Template ID correspond au template créé.

### Erreur: "Public key invalid"
**Solution:** Copier-coller la Public Key depuis le dashboard.

### Emails non reçus
**Solutions:**
1. Vérifier le dossier spam
2. Vérifier que l'email du service est vérifié
3. Tester avec un autre email

### Erreur CORS
**Solution:** EmailJS gère automatiquement CORS, pas de configuration nécessaire.

---

## ✅ Checklist de configuration

- [ ] Compte EmailJS créé
- [ ] Service email configuré (Gmail/Outlook)
- [ ] Template "study_completed" créé
- [ ] Template "study_overdue" créé
- [ ] Public Key récupérée
- [ ] Service ID copié
- [ ] Template IDs copiés
- [ ] Code mis à jour avec les vraies valeurs
- [ ] Test envoi email réussi

---

## 📧 Variables disponibles dans les templates

### Pour `notifyStudyCompleted`
- `{{to_email}}` - Email du client
- `{{to_name}}` - Nom du client
- `{{quote_title}}` - Titre du devis
- `{{quote_id}}` - ID du devis
- `{{message}}` - Message personnalisé

### Pour `notifyOverdueStudy`
- `{{quote_title}}` - Titre du devis
- `{{quote_id}}` - ID du devis
- `{{days_overdue}}` - Nombre de jours de retard
- `{{expected_date}}` - Date prévue
- `{{status}}` - Statut actuel

---

## 🎯 Prochaines étapes

1. ✅ Configurer EmailJS (5 min)
2. ✅ Tester envoi email (2 min)
3. ⏳ Intégrer dans workflow (10 min)
4. ⏳ Automatiser vérifications (optionnel)

---

**Configuration EmailJS prête ! 📧✅**
