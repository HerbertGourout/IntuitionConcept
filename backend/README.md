# Construction BTP – Backend API

## Vue d’ensemble

Ce backend Express agit comme proxy sécurisé entre l’application BTP Manager et les services externes (IA, email, paiements, automatisation). Il applique:
- Validation stricte des entrées (`zod`).
- Authentification via Firebase (Bearer ID token).
- Vérifications de configuration avant chaque appel fournisseur.

La configuration se fait uniquement via variables d’environnement et ne stocke aucune clé côté client.

## Installation

```bash
npm install --prefix backend
npm run build --prefix backend
npm run start --prefix backend
```

Le serveur écoute par défaut sur `http://localhost:4000` (configurable avec `PORT`).

## Variables d’environnement

Copier `.env.example` en `.env` puis renseigner les valeurs de production.

| Variable | Description |
| --- | --- |
| `PORT` | Port HTTP (défaut `4000`). |
| `FIREBASE_PROJECT_ID` | Identifiant Firebase. |
| `FIREBASE_CLIENT_EMAIL` | Service Account email. |
| `FIREBASE_PRIVATE_KEY` | Service Account private key (remplacer `\n` par retours à la ligne). |
| `OPENAI_API_KEY` | Clé OpenAI. |
| `ANTHROPIC_API_KEY` | Clé Anthropic Claude. |
| `GROQ_API_KEY` | Clé Groq. |
| `GROK_API_KEY` | Clé xAI Grok. |
| `GOOGLE_VISION_API_KEY` | Clé Google Document AI (optionnel). |
| `SENDGRID_API_KEY` | Clé SendGrid. |
| `SENDGRID_FROM_EMAIL` | Adresse expéditrice SendGrid. |
| `SENDGRID_FROM_NAME` | Nom expéditeur SendGrid. |
| `MAILGUN_API_KEY` | Clé Mailgun. |
| `MAILGUN_DOMAIN` | Domaine Mailgun. |
| `RESEND_API_KEY` | Clé Resend. |
| `RESEND_FROM_EMAIL` | Adresse expéditrice Resend. |
| `FLUTTERWAVE_SECRET_KEY` | Clé secrète Flutterwave. |
| `N8N_API_KEY` | Clé API n8n. |
| `N8N_BASE_URL` | URL n8n (ex `https://n8n.mycompany.com`). |

> **Tip** : Ne pas commiter `.env`. Utiliser un coffre-fort (Azure Key Vault, GCP Secret Manager…).

## Endpoints

Chaque endpoint nécessite `Authorization: Bearer <Firebase ID token>`.

### Santé
- **GET** `/health`
  - Vérifie la connexion Firebase et retourne `firebaseProjectId`.

### IA
- **POST** `/ai/generate`
  - Corps :
    ```json
    {
      "type": "complex_analysis",
      "content": "Analyse du budget phase terrassement",
      "priority": "high",
      "context": {
        "projectId": "abc123"
      }
    }
    ```
  - Routage dynamique vers OpenAI, Anthropic, Groq ou Grok selon disponibilité et type de requête.
  - Réponse : `{"provider": "openai", "content": "…", "usage": {…}}`

### Email
- **POST** `/email/send`
  - Corps :
    ```json
    {
      "to": "client@example.com",
      "subject": "Compte-rendu de chantier",
      "message": "Bonjour …",
      "provider": "sendgrid"
    }
    ```
  - Les pièces jointes se passent via `attachments` (base64).
  - Retourne succès si la clé API est configurée ; sinon `503`.

### Paiements
- **POST** `/payments/initiate`
  - Corps :
    ```json
    {
      "amount": 250000,
      "currency": "XOF",
      "phoneNumber": "+2250700000000",
      "description": "Acompte terrassement",
      "projectId": "abc123"
    }
    ```
  - Vérifie `FLUTTERWAVE_SECRET_KEY` avant d’appeler l’API Flutterwave.

- **POST** `/payments/verify`
  - Corps : `{ "transactionId": "FLW123" }`
  - Confirme le statut auprès de Flutterwave.

## Scripts utiles

```bash
npm run dev --prefix backend     # nodemon + ts-node (dev)
npm run build --prefix backend   # transpilation TypeScript
npm run start --prefix backend   # exécution Node sur dist/
npm run lint --prefix backend    # ESLint
```

## Tests manuels

1. Obtenir un ID token Firebase (à partir du frontend connecté).
2. Lancer le backend `npm run dev --prefix backend`.
3. Tester avec curl :
   ```bash
   curl -X POST http://localhost:4000/ai/generate \
     -H "Authorization: Bearer $ID_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"type":"simple_generation","content":"Bonjour"}'
   ```

## Architecture des dossiers

```
backend/
├── src/
│   ├── config/       # env + Firebase
│   ├── middleware/   # auth Firebase
│   ├── routes/       # ai, email, payments
│   └── index.ts      # initialisation Express
├── .env.example
├── package.json
└── tsconfig.json
```

## Prochaines étapes

- Journalisation détaillée (Firestore / BigQuery).
- Persistance des transactions et historique IA.
- Webhooks entrants (Flutterwave, n8n).
- Tests d’intégration automatisés.
