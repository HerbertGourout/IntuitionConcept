# 📘 Guide de Migration - Isolation des Données par Projet

## 🎯 Objectif
Assurer que chaque projet a ses propres données isolées (équipements, documents, transactions, etc.) et éliminer toutes les données mockées.

## 🔧 Nouveaux Outils Créés

### 1. ProjectDataService (`src/services/projectDataService.ts`)
Service centralisé pour gérer toutes les données liées à un projet spécifique.

### 2. useProjectData Hook (`src/hooks/useProjectData.ts`)
Hooks personnalisés pour faciliter l'utilisation dans les composants React.

## 📝 Comment Migrer Chaque Composant

### ✅ Équipements (Equipment.tsx)

**AVANT** (avec données mockées):
```typescript
const [equipment, setEquipment] = useState<Equipment[]>([]);

useEffect(() => {
  const loadEquipment = async () => {
    const equipmentList = await EquipmentService.getAllEquipment();
    setEquipment(equipmentList);
  };
  loadEquipment();
}, []);
```

**APRÈS** (isolé par projet):
```typescript
import { useProjectEquipment } from '../../hooks/useProjectData';
import { useProjects } from '../../hooks/useProjects';

const Equipment: React.FC = () => {
  const { currentProject } = useProjects();
  const { equipment, loading, addEquipment } = useProjectEquipment(currentProject?.id || null);

  // Si pas de projet sélectionné
  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Veuillez sélectionner un projet</p>
      </div>
    );
  }

  // Si pas d'équipements
  if (equipment.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun équipement pour ce projet</p>
        <button onClick={() => {/* Ouvrir modal ajout */}}>
          Ajouter un équipement
        </button>
      </div>
    );
  }

  return (
    // Afficher les équipements
  );
};
```

### ✅ Documents (Documents.tsx)

**MIGRATION**:
```typescript
import { useProjectDocuments } from '../../hooks/useProjectData';
import { useProjects } from '../../hooks/useProjects';

const Documents: React.FC = () => {
  const { currentProject } = useProjects();
  const { documents, loading, addDocument } = useProjectDocuments(currentProject?.id || null);

  // Même logique que pour Equipment
};
```

### ✅ Finances (Finances.tsx)

**MIGRATION**:
```typescript
import { useProjectTransactions } from '../../hooks/useProjectData';
import { useProjects } from '../../hooks/useProjects';

const Finances: React.FC = () => {
  const { currentProject } = useProjects();
  const { transactions, loading, addTransaction } = useProjectTransactions(currentProject?.id || null);

  // Calculer les statistiques depuis les vraies données
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    // Afficher les finances réelles
  );
};
```

### ✅ Devis (QuotesList.tsx)

**MIGRATION**:
```typescript
import { useProjectQuotes } from '../../hooks/useProjectData';
import { useProjects } from '../../hooks/useProjects';

const QuotesList: React.FC = () => {
  const { currentProject } = useProjects();
  const { quotes, loading, addQuote } = useProjectQuotes(currentProject?.id || null);

  // Afficher uniquement les devis du projet actuel
};
```

### ✅ Bons d'Achat (PurchaseOrders.tsx)

**MIGRATION**:
```typescript
import { useProjectPurchaseOrders } from '../../hooks/useProjectData';
import { useProjects } from '../../hooks/useProjects';

const PurchaseOrders: React.FC = () => {
  const { currentProject } = useProjects();
  const { purchaseOrders, loading, addPurchaseOrder } = useProjectPurchaseOrders(currentProject?.id || null);

  // Afficher uniquement les bons d'achat du projet actuel
};
```

### ✅ Localisations (Locations.tsx)

**MIGRATION**:
```typescript
import { useProjectLocations } from '../../hooks/useProjectData';
import { useProjects } from '../../hooks/useProjects';

const Locations: React.FC = () => {
  const { currentProject } = useProjects();
  const { locations, loading, addLocation } = useProjectLocations(currentProject?.id || null);

  // Afficher uniquement les localisations du projet actuel
};
```

### ✅ Dashboard (Dashboard.tsx)

**MIGRATION**:
```typescript
import { useProjectStats } from '../../hooks/useProjectData';
import { useProjects } from '../../hooks/useProjects';

const Dashboard: React.FC = () => {
  const { currentProject } = useProjects();
  const { stats, loading } = useProjectStats(currentProject?.id || null);

  // Afficher les statistiques réelles du projet
  return (
    <div>
      <h2>Statistiques du Projet: {currentProject?.name}</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>Équipements: {stats.equipmentCount}</div>
        <div>Documents: {stats.documentCount}</div>
        <div>Transactions: {stats.transactionCount}</div>
        <div>Devis: {stats.quoteCount}</div>
        <div>Bons d'achat: {stats.purchaseOrderCount}</div>
        <div>Localisations: {stats.locationCount}</div>
      </div>
    </div>
  );
};
```

### ✅ Équipe (Team.tsx)

**MIGRATION**:
```typescript
import { useProjects } from '../../hooks/useProjects';

const Team: React.FC = () => {
  const { currentProject, updateProject } = useProjects();

  // Utiliser currentProject.team directement
  const teamMembers = currentProject?.team || [];

  const addTeamMember = async (member: TeamMember) => {
    if (!currentProject) return;
    
    await updateProject(currentProject.id, {
      team: [...teamMembers, member]
    });
  };

  // Pas de données mockées, uniquement les membres réels du projet
};
```

## 🔄 Synchronisation du Nom du Client

**Dans TOUS les composants qui affichent le nom du client**:

```typescript
import { useProjects } from '../../hooks/useProjects';

const MonComposant: React.FC = () => {
  const { currentProject } = useProjects();
  
  // Toujours utiliser currentProject.client
  const clientName = currentProject?.client || 'Non défini';

  return (
    <div>
      <p>Client: {clientName}</p>
    </div>
  );
};
```

## 🗑️ Suppression de Projet

**Pour corriger le bug de réapparition**, utiliser cette approche:

```typescript
const handleDeleteProject = async (projectId: string) => {
  try {
    // 1. Supprimer toutes les données liées au projet
    await ProjectDataService.deleteAllProjectData(projectId);
    
    // 2. Supprimer le projet lui-même
    await deleteProject(projectId);
    
    console.log('✅ Projet et toutes ses données supprimés');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  }
};
```

## 📋 Checklist de Migration

### Composants à Migrer
- [ ] Equipment.tsx
- [ ] Documents.tsx
- [ ] Finances.tsx
- [ ] QuotesList.tsx
- [ ] PurchaseOrders.tsx
- [ ] Locations.tsx
- [ ] Team.tsx
- [ ] Dashboard.tsx
- [ ] Reports.tsx

### Vérifications
- [ ] Aucune donnée mockée n'apparaît
- [ ] Chaque projet a ses propres données
- [ ] Le nom du client est synchronisé partout
- [ ] La suppression de projet fonctionne correctement
- [ ] Les états vides sont élégants et informatifs

## 🎨 États Vides Recommandés

```typescript
const EmptyState: React.FC<{ 
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}> = ({ icon, title, description, actionLabel, onAction }) => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6">{description}</p>
    <button
      onClick={onAction}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      {actionLabel}
    </button>
  </div>
);

// Utilisation
<EmptyState
  icon={<Wrench className="w-8 h-8 text-gray-400" />}
  title="Aucun équipement"
  description="Commencez par ajouter votre premier équipement à ce projet"
  actionLabel="Ajouter un équipement"
  onAction={() => setShowAddModal(true)}
/>
```

## 🚀 Prochaines Étapes

1. **Migrer tous les composants** selon ce guide
2. **Tester l'isolation** en créant plusieurs projets
3. **Vérifier la suppression** de projets
4. **Valider la synchronisation** du nom client
5. **Optimiser l'UI** du Dashboard

## 📞 Support

Si vous rencontrez des problèmes lors de la migration, référez-vous à:
- `src/services/projectDataService.ts` - Service principal
- `src/hooks/useProjectData.ts` - Hooks personnalisés
- `CORRECTIONS_PROJET.md` - Liste complète des problèmes
