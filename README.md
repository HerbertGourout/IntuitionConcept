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
