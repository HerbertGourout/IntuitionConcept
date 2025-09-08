# Guide de Sécurité - Système d'Authentification Renforcé

## Vue d'ensemble des améliorations

Votre système d'authentification a été considérablement renforcé avec les nouvelles fonctionnalités suivantes :

### 🔐 **Fonctionnalités de sécurité ajoutées**

1. **Validation côté serveur** - `authValidationService.ts`
2. **Gestion de session avancée** - `sessionManager.ts` 
3. **Audit trail complet** - `auditLogger.ts`
4. **Actions sécurisées** - `useSecureAction.ts`
5. **Monitoring de session** - `SessionMonitor.tsx`

## Utilisation pratique

### 1. Actions sécurisées avec audit automatique

```tsx
import { useSecureAction } from '../hooks/useSecureAction';

const MyComponent = () => {
  const { execute: deleteQuote, canExecute } = useSecureAction(
    async (quoteId: string) => {
      // Votre logique de suppression
      await quotesService.delete(quoteId);
    },
    'delete_quote',
    {
      requiredPermissions: ['quotes.delete'],
      requireRecentAuth: true,        // Auth récente requise
      maxAuthAge: 15 * 60 * 1000,    // 15 minutes max
      resource: 'quote',
      resourceId: quoteId,
      logAction: true                 // Audit automatique
    }
  );

  return (
    <Button 
      onClick={() => deleteQuote(quoteId)}
      disabled={!canExecute}
    >
      Supprimer
    </Button>
  );
};
```

### 2. Monitoring de session automatique

```tsx
import SessionMonitor from '../components/Auth/SessionMonitor';

const App = () => {
  return (
    <div>
      {/* Votre application */}
      <SessionMonitor 
        warningThreshold={5 * 60 * 1000} // Alerte 5 min avant expiration
        autoRefresh={true}               // Refresh automatique
      />
    </div>
  );
};
```

### 3. Protection de routes avec validation en temps réel

```tsx
import ProtectedRoute from '../components/Auth/ProtectedRoute';

<ProtectedRoute 
  requiredPermissions={['finances.view']}
  requiredRoles={['admin', 'manager']}
>
  <FinancesPage />
</ProtectedRoute>
```

## Niveaux de sécurité par rôle

### 🔴 **Admin**
- Accès complet (`*` permission)
- Toutes les actions autorisées
- Audit de toutes les actions administratives

### 🟡 **Manager** 
- Gestion complète des projets et équipes
- Actions sensibles avec audit renforcé
- Accès aux rapports financiers

### 🟠 **Supervisor**
- Supervision des projets et tâches
- Actions limitées aux ressources assignées
- Audit des modifications importantes

### 🟢 **Worker**
- Accès en lecture principalement
- Édition des tâches assignées uniquement
- Audit des actions sur les tâches

### 🔵 **Client**
- Accès en lecture seule
- Consultation des devis et projets
- Audit des consultations

## Fonctionnalités d'audit

### Événements automatiquement loggés :
- ✅ Connexions/déconnexions
- ✅ Tentatives d'accès refusées
- ✅ Actions sensibles (création, modification, suppression)
- ✅ Changements de permissions
- ✅ Accès aux données financières

### Alertes de sécurité automatiques :
- 🚨 Tentatives de connexion multiples échouées
- 🚨 Tentatives d'escalade de privilèges
- 🚨 Accès inhabituels ou suspects
- 🚨 Actions bloquées répétées

## Configuration recommandée

### Variables d'environnement à ajouter :

```env
# Sécurité des sessions
VITE_SESSION_WARNING_THRESHOLD=300000    # 5 minutes
VITE_SESSION_MAX_AGE=3600000            # 1 heure
VITE_REQUIRE_RECENT_AUTH_FOR_SENSITIVE=true

# Audit et logging
VITE_ENABLE_AUDIT_LOGGING=true
VITE_AUDIT_RETENTION_DAYS=90
VITE_SECURITY_ALERTS_ENABLED=true

# Validation côté serveur
VITE_ENABLE_SERVER_VALIDATION=true
VITE_FALLBACK_TO_CLIENT_VALIDATION=false
```

### Règles Firestore pour l'audit :

```javascript
// firestore.rules - Collection audit_logs
match /audit_logs/{logId} {
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     hasRole(['admin', 'manager']));
  allow create: if request.auth != null;
  allow update, delete: if false; // Logs immutables
}

// Collection security_alerts  
match /security_alerts/{alertId} {
  allow read, write: if hasRole(['admin']);
}
```

## Bonnes pratiques d'utilisation

### 1. **Toujours utiliser useSecureAction pour les actions sensibles**
```tsx
// ❌ Mauvais
const deleteProject = async () => {
  await projectService.delete(projectId);
};

// ✅ Bon
const { execute: deleteProject } = useSecureAction(
  () => projectService.delete(projectId),
  'delete_project',
  { requiredPermissions: ['projects.delete'], requireRecentAuth: true }
);
```

### 2. **Vérifier les permissions avant d'afficher les UI**
```tsx
const { hasPermission } = useAuth();

return (
  <div>
    {hasPermission('quotes.create') && (
      <Button>Créer un devis</Button>
    )}
  </div>
);
```

### 3. **Utiliser la validation en temps réel**
```tsx
// Le système vérifie automatiquement :
// - Expiration de session
// - Changements de permissions
// - Révocation d'accès
// - Tentatives suspectes
```

## Surveillance et maintenance

### Consulter les logs d'audit :
```tsx
import { auditLogger } from '../services/auditLogger';

// Récupérer les logs d'un utilisateur
const logs = await auditLogger.getUserAuditLogs(userId, 100);

// Récupérer les alertes de sécurité
const alerts = await auditLogger.getSecurityAlerts();
```

### Métriques de sécurité recommandées :
- Nombre de tentatives de connexion échouées par jour
- Actions bloquées par manque de permissions
- Temps moyen de session utilisateur
- Fréquence des alertes de sécurité

## Migration depuis l'ancien système

1. **Remplacer les vérifications manuelles par useSecureAction**
2. **Ajouter SessionMonitor à votre App.tsx**
3. **Mettre à jour les routes avec ProtectedRoute**
4. **Configurer les variables d'environnement**
5. **Déployer les règles Firestore mises à jour**

## Support et dépannage

### Problèmes courants :

**Session expire trop rapidement :**
- Ajuster `VITE_SESSION_MAX_AGE`
- Vérifier la configuration Firebase Auth

**Actions bloquées incorrectement :**
- Vérifier les permissions dans `permissions.ts`
- Consulter les logs d'audit pour identifier la cause

**Alertes de sécurité fausses :**
- Ajuster les seuils dans `auditLogger.ts`
- Examiner les patterns d'utilisation

Ce système fournit une sécurité robuste tout en maintenant une expérience utilisateur fluide. Toutes les actions sont auditées et les permissions sont vérifiées en temps réel.
