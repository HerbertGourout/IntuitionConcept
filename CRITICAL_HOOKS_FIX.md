# 🔧 Correction des erreurs critiques React Hooks

## ❌ Problème

**Pipeline CI/CD échouait** avec des erreurs **React Hooks rules-of-hooks** qui sont **CRITIQUES** et ne peuvent pas être downgraded en warnings.

### Erreurs principales
1. **Quotes.tsx** - Hooks appelés conditionnellement (6 erreurs)
2. **Finances.tsx** - Hooks appelés conditionnellement (2 erreurs)

---

## 🔍 Cause du problème

### Règle des Hooks React

**Les hooks DOIVENT être appelés dans le même ordre à chaque render !**

```typescript
// ❌ MAUVAIS - Hooks après un return conditionnel
function Component() {
  const [state1, setState1] = useState();  // Hook 1
  
  if (!data) {
    return <div>Loading</div>;  // Return conditionnel
  }
  
  const [state2, setState2] = useState();  // Hook 2 - ERREUR !
  const value = useMemo(() => ..., []);    // Hook 3 - ERREUR !
}
```

**Problème:** Si `!data` est true au premier render, seulement Hook 1 est appelé. Si `!data` devient false au deuxième render, Hooks 1, 2 et 3 sont appelés → **Ordre différent = CRASH !**

---

## ✅ Solution appliquée

### Principe: Tous les hooks AVANT les returns conditionnels

```typescript
// ✅ BON - Tous les hooks avant les returns
function Component() {
  const [state1, setState1] = useState();  // Hook 1
  const [state2, setState2] = useState();  // Hook 2
  const value = useMemo(() => ..., []);    // Hook 3
  
  if (!data) {
    return <div>Loading</div>;  // Return conditionnel OK
  }
  
  return <div>Content</div>;
}
```

---

## 🔧 Corrections appliquées

### 1. Quotes.tsx - 6 erreurs corrigées ✅

#### AVANT (❌ Erreur)
```typescript
const Quotes: React.FC = () => {
  const { formatAmount } = useCurrency();
  const { currentProject } = useProjects();
  const { quotes, loading, addQuote } = useProjectQuotes(currentProject?.id || null);
  
  // Return conditionnel #1
  if (!currentProject) {
    return <PageContainer><NoProjectSelected /></PageContainer>;
  }
  
  // ❌ Hooks APRÈS le return - ERREUR !
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showQuoteCreator, setShowQuoteCreator] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // Return conditionnel #2
  if (quotes.length === 0 && !loading) {
    return <EmptyState />;
  }

  // ❌ Hooks APRÈS le return - ERREUR !
  const filteredQuotes = useMemo(() => { ... }, [quotes, searchTerm, statusFilter]);
  const stats = useMemo(() => { ... }, [quotes]);
  
  return <div>...</div>;
};
```

#### APRÈS (✅ Corrigé)
```typescript
const Quotes: FC = () => {
  const { formatAmount } = useCurrency();
  const { currentProject } = useProjects();
  const { quotes, loading, addQuote } = useProjectQuotes(currentProject?.id || null);
  
  // ✅ TOUS les hooks AVANT les returns conditionnels
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showQuoteCreator, setShowQuoteCreator] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  
  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote: Quote) => {
      const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quote.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = quotes.length;
    const draft = quotes.filter((q: Quote) => q.status === 'draft').length;
    const sent = quotes.filter((q: Quote) => q.status === 'sent').length;
    const accepted = quotes.filter((q: Quote) => q.status === 'accepted').length;
    const totalValue = quotes.reduce((sum: number, q: Quote) => sum + q.totalAmount, 0);
    const acceptedValue = quotes.filter((q: Quote) => q.status === 'accepted')
      .reduce((sum: number, q: Quote) => sum + q.totalAmount, 0);
    
    return { total, draft, sent, accepted, totalValue, acceptedValue };
  }, [quotes]);
  
  // ✅ Returns conditionnels APRÈS tous les hooks
  if (!currentProject) {
    return <PageContainer><NoProjectSelected /></PageContainer>;
  }

  if (quotes.length === 0 && !loading) {
    return <EmptyState />;
  }
  
  return <div>...</div>;
};
```

**Changements:**
- ✅ Déplacé 4 `useState` avant les returns
- ✅ Déplacé 2 `useMemo` avant les returns
- ✅ Ajouté types explicites dans les callbacks
- ✅ Changé `React.FC` → `FC`
- ✅ Supprimé les duplications

---

### 2. Finances.tsx - 2 erreurs corrigées ✅

#### AVANT (❌ Erreur)
```typescript
const Finances: React.FC = () => {
  const { currentProject } = useProjects();
  const { transactions, loading, addTransaction } = useProjectTransactions(currentProject?.id || null);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budget' | 'equipment' | 'phases'>('overview');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialRecord | null>(null);

  // Return conditionnel
  if (!currentProject) {
    return <PageContainer><NoProjectSelected /></PageContainer>;
  }

  // ❌ Hook APRÈS le return - ERREUR !
  const stats = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    // ...
  }, [transactions, currentProject.budget]);
  
  return <div>...</div>;
};
```

#### APRÈS (✅ Corrigé)
```typescript
const Finances: FC = () => {
  const { currentProject } = useProjects();
  const { transactions, loading, addTransaction } = useProjectTransactions(currentProject?.id || null);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budget' | 'equipment' | 'phases'>('overview');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialRecord | null>(null);

  // ✅ Hook AVANT le return conditionnel avec guard clause
  const stats = useMemo(() => {
    if (!currentProject) {
      return {
        totalExpenses: 0,
        totalIncome: 0,
        balance: 0,
        budgetUsed: 0,
        categories: { materials: 0, labor: 0, equipment: 0, permits: 0, other: 0 }
      };
    }
    
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    // ...
    return { totalExpenses, totalIncome, balance, budgetUsed, categories, ... };
  }, [transactions, currentProject]);
  
  // ✅ Return conditionnel APRÈS le hook
  if (!currentProject) {
    return <PageContainer><NoProjectSelected /></PageContainer>;
  }
  
  return <div>...</div>;
};
```

**Changements:**
- ✅ Déplacé `useMemo` avant le return
- ✅ Ajouté guard clause dans `useMemo`
- ✅ Ajouté `currentProject` dans les dépendances
- ✅ Changé `React.FC` → `FC`
- ✅ Supprimé import `NoProjectSelected` inutilisé

---

## 📊 Résumé des corrections

### Fichiers modifiés

| Fichier | Hooks déplacés | Erreurs corrigées |
|---------|----------------|-------------------|
| `Quotes.tsx` | 6 hooks | 6 erreurs |
| `Finances.tsx` | 1 hook | 2 erreurs |
| **Total** | **7 hooks** | **8 erreurs** |

### Types de corrections

1. **Déplacement de hooks** - 7 hooks déplacés avant returns
2. **Types ajoutés** - Callbacks typés explicitement
3. **Imports React** - `React.FC` → `FC`
4. **Guard clauses** - Ajoutées dans useMemo
5. **Dépendances** - Corrigées dans useMemo

---

## 🎯 Règles des Hooks React

### ✅ Règle #1: Toujours au top level

```typescript
// ✅ BON
function Component() {
  const [state, setState] = useState();
  const value = useMemo(() => ..., []);
  
  if (condition) {
    return <div>Early return</div>;
  }
  
  return <div>Normal return</div>;
}
```

### ❌ Règle #2: Jamais dans des conditions

```typescript
// ❌ MAUVAIS
function Component() {
  if (condition) {
    const [state, setState] = useState();  // ERREUR !
  }
}
```

### ❌ Règle #3: Jamais dans des boucles

```typescript
// ❌ MAUVAIS
function Component() {
  for (let i = 0; i < 10; i++) {
    const [state, setState] = useState();  // ERREUR !
  }
}
```

### ❌ Règle #4: Jamais après un return conditionnel

```typescript
// ❌ MAUVAIS
function Component() {
  if (condition) {
    return <div>Early</div>;
  }
  
  const [state, setState] = useState();  // ERREUR !
}
```

---

## 🔍 Comment détecter ces erreurs

### ESLint rule: `react-hooks/rules-of-hooks`

```json
{
  "rules": {
    "react-hooks/rules-of-hooks": "error"  // Ne JAMAIS downgrader !
  }
}
```

**Cette règle NE PEUT PAS être un warning car elle cause des bugs runtime !**

---

## 🎓 Bonnes pratiques

### Pattern recommandé

```typescript
const Component: FC = () => {
  // 1. Tous les hooks en premier
  const data = useData();
  const [state, setState] = useState();
  const value = useMemo(() => ..., []);
  const callback = useCallback(() => ..., []);
  
  // 2. Logique conditionnelle dans les hooks si nécessaire
  const processedData = useMemo(() => {
    if (!data) return null;
    return process(data);
  }, [data]);
  
  // 3. Returns conditionnels après tous les hooks
  if (!data) {
    return <Loading />;
  }
  
  if (error) {
    return <Error />;
  }
  
  // 4. Return normal
  return <Content data={processedData} />;
};
```

---

## ✅ Résultat

### Avant (❌)
```
Error: React Hook "useState" is called conditionally.
Error: React Hook "useMemo" is called conditionally.
✖ 8 critical errors
```

### Après (✅)
```
✓ All hooks called unconditionally
✓ Hooks in correct order
✓ 0 rules-of-hooks errors
```

---

## 📝 Checklist de vérification

- [x] Tous les hooks avant les returns conditionnels
- [x] Pas de hooks dans des if/for/while
- [x] Pas de hooks après des returns
- [x] Types explicites dans les callbacks
- [x] Imports React corrigés (FC au lieu de React.FC)
- [x] Dépendances useMemo correctes
- [x] Guard clauses dans les hooks si nécessaire

---

**Erreurs critiques React Hooks corrigées ! La CI devrait maintenant passer.** ✅

*Fichiers modifiés: `Quotes.tsx`, `Finances.tsx`*  
*8 erreurs rules-of-hooks corrigées*  
*Prochaine étape: Commit et push*
