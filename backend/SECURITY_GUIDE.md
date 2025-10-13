# Sécurité & Gestion des Secrets

## Authentification requise
- Le backend exige un **token Firebase ID** valide sur chaque requête (`Authorization: Bearer <token>`).
- Le middleware `authenticate` (`src/middleware/auth.ts`) vérifie l’UID, rafraîchit les claims et expose `req.userId` + `req.claims` pour les contrôles d’accès.
- Penser à révoquer les sessions via Firebase si un compte est compromis.

## Token Firebase côté frontend
- Récupérer via `firebase.auth().currentUser.getIdToken()`.
- Ne jamais exposer les clés backend dans le bundle frontend ; seules les routes proxy doivent être utilisées.

## Gestion des secrets
- Les clés API sont chargées via `.env` et validées par `zod` (`src/config/env.ts`).
- Ne stocker aucun secret en clair dans le code. Utiliser un gestionnaire de secrets (ex : Google Secret Manager) ou un stockage chiffré.
- Régénérer régulièrement les clés et mettre en place des alertes en cas d’usage anormal.

## Sécurité des proxys
- `src/routes/ai.ts` limite l’accès aux providers configurés et journalise les erreurs.
- `src/routes/email.ts` valide le payload, impose l’existence des clés `SENDGRID_API_KEY`, `MAILGUN_API_KEY`, `RESEND_API_KEY` et gère les pièces jointes via proxy serveur (SendGrid/Mailgun/Resend).
- `src/routes/payments.ts` exige `FLUTTERWAVE_SECRET_KEY`, propage les déclinaisons Firebase (`req.claims`) et relaie les statuts d’initiation/vérification depuis Flutterwave.
- Prévoir du logging (Stackdriver/Cloud Logging) pour tracer les requêtes critiques (venant de `req.userId`).

## Bonnes pratiques complémentaires
- **Rate limiting** : ajouter un middleware (ex. `express-rate-limit`) par IP/UID.
- **CORS strict** : limiter `app.use(cors({ origin: [...] }))` aux domaines de confiance.
- **Validation renforcée** : étendre les schémas `zod` pour matcher les formats métier (ex. numéro de téléphone régional).
- **Journalisation** : enregistrer les appels sensibles dans Firestore / BigQuery (utiliser `userId`, `provider`, `payload` réduit).
- **Tests** : mettre en place des tests d’intégration pour couvrir les scénarios d’erreur provider (time-out, 4xx, 5xx).

## Plans de contingence
- **Provider IA indisponible** : la logique `selectProvider` bascule automatiquement vers un autre service configuré.
- **Email provider indisponible** : prévoir un fallback SendGrid → Resend → Mailgun.
- **Paiements** : en cas d’échec Flutterwave, quarantiner la transaction et notifier les admins.
- **Automatisation** : n8n nécessite la clé API `N8N_API_KEY`. Sans clé, les actions n8n sont ignorées pour éviter les appels non authentifiés.
