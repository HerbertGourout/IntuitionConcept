# 🚧 IntuitionConcept — Construction BTP Management App

**Plateforme moderne de gestion de projets de construction**, conçue pour les équipes, chefs de chantier et développeurs. Visualisez, suivez et pilotez tous vos chantiers et tâches sans aucune restriction d'accès (mode développement).

---

## ✨ Fonctionnalités principales

- **Gestion multi-projets** : création, duplication, modification, suppression, archivage
- **Suivi des tâches** : planification, avancement, priorités, budget et dépenses
- **Gestion documentaire** : stockage et organisation de plans, contrats, rapports, photos
- **Suivi financier** : revenus, dépenses, fournisseurs, graphiques
- **Équipements** : parc matériel, états, disponibilité, maintenance
- **Planning Gantt** : visualisation des tâches et jalons
- **Dashboard** : synthèse des KPIs, avancement global, alertes

---

## 🚀 Démarrage rapide

### 1. Cloner le dépôt

```bash
git clone https://github.com/HerbertGourout/IntuitionConcept.git
cd IntuitionConcept
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

L’application sera accessible sur [http://localhost:5176](http://localhost:5176).

---

## 🛠️ Stack technique

- **React 18 + TypeScript**
- **Vite** (développement ultra-rapide)
- **Ant Design** (UI/UX moderne)
- **Firebase Firestore** (base de données cloud)
- **Framer Motion** (animations)
- **Recharts** (graphiques)
- **Tailwind CSS** (styles utilitaires)
- **ESLint** (qualité de code)

---

## ⚠️ Mode développement

> **Important** : Toutes les restrictions d’authentification et de droits ont été désactivées pour faciliter le développement et la démonstration.  
> **Remettez les contrôles d’accès** avant toute mise en production !

---

## 📂 Structure du projet

```
src/
  components/      # Composants React (UI, pages, modals)
  contexts/        # Contexts React (projets, utilisateurs)
  firebase.ts      # Config Firebase
  hooks/           # Hooks personnalisés
  pages/           # Pages principales
  types/           # Types TypeScript
  utils/           # Fonctions utilitaires
public/            # Assets statiques
```

---

## 🤝 Contribution

1. Forkez le repo
2. Créez une branche (`git checkout -b feature/ma-nouvelle-fonction`)
3. Commitez vos modifications (`git commit -am 'Ajout d'une nouvelle fonction'`)
4. Pushez la branche (`git push origin feature/ma-nouvelle-fonction`)
5. Ouvrez une Pull Request

---

## 📝 Licence

Projet open-source sous licence MIT.

---

**Développé avec ❤️ pour le secteur BTP.**

---

## ✅ Tests (Vitest + RTL)

### Lancer les tests

```bash
npm test           # exécution complète (mode non watch)
npm run test:watch # mode interactif
npm run test:ci    # CI avec reporter verbose + coverage
npm run test:ci:stable # CI stable (isolation forks) pour réduire la mémoire
```

### Configuration clé

- Fichier: `vitest.config.ts`
  - Environnement: `jsdom`
  - Setup global: `src/setupTests.ts`
  - Pool: `forks` avec un seul worker (évite les OOM sur machines modestes)

- Fichier: `src/setupTests.ts`
  - Mocks Firebase v9 centralisés via `src/__tests__/utils/firebaseMocks.ts`
  - Mock global du générateur PDF: `services/pdf/quotePdf` → renvoie un `Blob` léger
  - `matchMedia` mocké pour jsdom
  - `console.log`/`console.error` silencés pour des sorties propres

### Bonnes pratiques appliquées

- Firebase v9 (modular): on mocke les fonctions standalone (`signInWithEmailAndPassword`, etc.) et non des méthodes d’instance
- Auth listener `onAuthStateChanged` renvoie toujours une fonction d’unsubscribe
- Sélecteurs RTL robustes: `getByRole('button', { name: /Envoyer l'Email/i })` au lieu de `getByText`
- Temps figés/déterministes dans les tests sensibles (via data d’entrée ou mocks)

### Dépannage rapide

- OOM (Out Of Memory) pendant les tests: utiliser `npm run test:ci:stable` (pool forks, 1 worker)
- Tests d’email avec PDF: couverts par le mock global PDF dans `setupTests.ts`
- Tests Firestore: utilisent les mocks centralisés (`Timestamp`, `collection`, `query`, etc.)
