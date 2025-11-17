# 🔧 Problèmes Identifiés - Planning

## 1. 🎯 Bouton "Ajuster aux Tâches"

### Problème
Le bouton fonctionne **partiellement** mais ne prend en compte que les tâches, pas les phases.

### Code Actuel
```typescript
// RobustGanttChart.tsx - lignes 249-269
const fitToTasks = () => {
  if (processedTasks.length === 0) return;
  
  let earliestStart: Date | null = null;
  let latestEnd: Date | null = null;
  
  // ❌ Ne regarde que processedTasks
  processedTasks.forEach(task => {
    if (task.validation.startDate && task.validation.endDate) {
      if (!earliestStart || task.validation.startDate < earliestStart) {
        earliestStart = task.validation.startDate;
      }
      if (!latestEnd || task.validation.endDate > latestEnd) {
        latestEnd = task.validation.endDate;
      }
    }
  });
  
  if (earliestStart) {
    setVisibleStartDate(DateUtils.addDays(earliestStart, -2));
    // ❌ Ne met pas à jour daysToShow pour afficher jusqu'à latestEnd
  }
};
```

### Problèmes Identifiés
1. ❌ Ne prend pas en compte les **phases**
2. ❌ Ne calcule pas le nombre de jours à afficher (`daysToShow`)
3. ❌ Utilise seulement `earliestStart` mais ignore `latestEnd`

### Solution
```typescript
const fitToTasks = () => {
  if (processedTasks.length === 0 && processedPhases.length === 0) return;
  
  let earliestStart: Date | null = null;
  let latestEnd: Date | null = null;
  
  // ✅ Prendre en compte les tâches
  processedTasks.forEach(task => {
    if (task.validation.startDate && task.validation.endDate) {
      if (!earliestStart || task.validation.startDate < earliestStart) {
        earliestStart = task.validation.startDate;
      }
      if (!latestEnd || task.validation.endDate > latestEnd) {
        latestEnd = task.validation.endDate;
      }
    }
  });
  
  // ✅ Prendre en compte les phases
  processedPhases.forEach(phase => {
    if (phase.validation.startDate && phase.validation.endDate) {
      if (!earliestStart || phase.validation.startDate < earliestStart) {
        earliestStart = phase.validation.startDate;
      }
      if (!latestEnd || phase.validation.endDate > latestEnd) {
        latestEnd = phase.validation.endDate;
      }
    }
  });
  
  // ✅ Calculer la période complète
  if (earliestStart && latestEnd) {
    const daysDiff = Math.ceil((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24));
    const newDaysToShow = Math.max(daysDiff + 4, 30); // Minimum 30 jours
    
    setVisibleStartDate(DateUtils.addDays(earliestStart, -2));
    setDaysToShow(newDaysToShow);
  }
};
```

---

## 2. 📊 Synchronisation Kanban ↔ Gantt

### Problème
Le **Kanban** et le **Gantt** ne sont **pas synchronisés** en temps réel.

### Architecture Actuelle

#### Gantt (RobustGanttChart.tsx)
- Reçoit `tasks` et `phases` en **props** depuis `Planning.tsx`
- Affiche les tâches et phases sur une timeline
- Modifications via modal de tâche

#### Kanban (DragDropPlanningBoard.tsx)
- Charge les tâches depuis `currentProject.phases` via `useEffect`
- État local `columns` pour gérer le drag & drop
- Modifications via `updateTask` du contexte

### Flux de Données

```
Planning.tsx
    ↓
    ├─→ Gantt (props: tasks, phases)
    │   └─→ Modifications → updateTask → ProjectContext
    │
    └─→ Kanban (useEffect: currentProject)
        └─→ Modifications → updateTask → ProjectContext
```

### Problème Identifié

1. **Gantt** utilise les props `tasks` de `Planning.tsx`
2. **Kanban** utilise `currentProject` du contexte
3. Quand on modifie dans **Gantt** :
   - ✅ `updateTask` met à jour le contexte
   - ✅ `Planning.tsx` reçoit les nouvelles tâches
   - ✅ Gantt se met à jour
   - ❌ Kanban ne se met PAS à jour car il dépend de `currentProject`

4. Quand on modifie dans **Kanban** :
   - ✅ `updateTask` met à jour le contexte
   - ✅ Kanban se met à jour via `useEffect`
   - ❌ Gantt ne se met PAS à jour immédiatement

### Solution

#### Option A : Kanban utilise les mêmes props que Gantt
```typescript
// Planning.tsx
{viewType === 'kanban' && (
  <DragDropPlanningBoard 
    tasks={tasks}  // ✅ Passer les tâches en props
    phases={phases}
    onTaskUpdate={handleTaskUpdate}
  />
)}
```

#### Option B : Forcer le re-render du Kanban
```typescript
// DragDropPlanningBoard.tsx
useEffect(() => {
  if (currentProject && currentProject.phases) {
    // Recharger les tâches à chaque changement de currentProject
    loadTasksFromProject();
  }
}, [currentProject, currentProject?.phases]); // ✅ Dépendance sur phases
```

#### Option C : Utiliser un état partagé dans Planning.tsx
```typescript
// Planning.tsx
const [kanbanTasks, setKanbanTasks] = useState<Task[]>([]);

useEffect(() => {
  // Synchroniser kanbanTasks avec tasks
  setKanbanTasks(tasks);
}, [tasks]);

{viewType === 'kanban' && (
  <DragDropPlanningBoard 
    tasks={kanbanTasks}
    onTaskUpdate={(updatedTask) => {
      handleTaskUpdate(updatedTask);
      // Mettre à jour kanbanTasks immédiatement
      setKanbanTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    }}
  />
)}
```

---

## 🎯 Recommandations

### Priorité 1 : Corriger "Ajuster aux Tâches"
- ✅ Inclure les phases dans le calcul
- ✅ Calculer et appliquer `daysToShow`
- ✅ Centrer la vue sur la période complète

### Priorité 2 : Synchroniser Kanban ↔ Gantt
- ✅ **Option B recommandée** : Ajouter `currentProject.phases` aux dépendances du `useEffect`
- ✅ Ajouter un log pour vérifier les mises à jour
- ✅ Tester les modifications dans les deux vues

### Tests à Effectuer

#### Test 1 : Bouton "Ajuster aux Tâches"
1. Créer des tâches avec des dates variées
2. Créer des phases avec des dates variées
3. Cliquer sur "Ajuster aux tâches"
4. ✅ Vérifier que **toutes** les tâches et phases sont visibles
5. ✅ Vérifier que la vue est centrée sur la période complète

#### Test 2 : Synchronisation Gantt → Kanban
1. Ouvrir la vue **Gantt**
2. Modifier une tâche (statut, dates, etc.)
3. Basculer vers la vue **Kanban**
4. ✅ Vérifier que la modification est visible

#### Test 3 : Synchronisation Kanban → Gantt
1. Ouvrir la vue **Kanban**
2. Déplacer une tâche d'une colonne à l'autre
3. Basculer vers la vue **Gantt**
4. ✅ Vérifier que le statut est mis à jour

---

## 📝 Fichiers à Modifier

1. ✅ `src/components/Planning/RobustGanttChart.tsx`
   - Corriger la fonction `fitToTasks`
   - Ajouter le calcul de `daysToShow`

2. ✅ `src/components/DragDrop/DragDropPlanningBoard.tsx`
   - Ajouter `currentProject.phases` aux dépendances du `useEffect`
   - Ajouter des logs de débogage

3. ⚠️ `src/components/Planning/Planning.tsx`
   - Optionnel : Ajouter un état partagé si Option C

---

**Date** : 30 octobre 2025, 00h25 UTC+01:00
**Statut** : ⚠️ Problèmes identifiés - Corrections à appliquer
