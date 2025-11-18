# 🔧 Correction de l'erreur - Module has no default export

## ❌ Problème

**Erreur:** `Module '@types/react/index' has no default export`  
**Ligne:** 1 dans `Planning.tsx`

**Cause:** Import incorrect de React avec la nouvelle syntaxe JSX Transform (React 17+)

---

## 🔍 Explication du problème

### Configuration TypeScript
```json
// tsconfig.app.json
{
  "compilerOptions": {
    "jsx": "react-jsx"  // ← Nouvelle syntaxe JSX Transform
  }
}
```

### Avec `"jsx": "react-jsx"` (React 17+)

**Avant (React 16 et avant):**
```typescript
import React from 'react';  // ✅ Nécessaire

function Component() {
  return <div>Hello</div>;  // Compilé en: React.createElement('div', ...)
}
```

**Maintenant (React 17+):**
```typescript
import React from 'react';  // ❌ PLUS NÉCESSAIRE !

function Component() {
  return <div>Hello</div>;  // Compilé en: jsx('div', ...)
}
```

---

## ✅ Solution appliquée

### AVANT (❌ Erreur)
```typescript
import React, { useState, useEffect, useCallback, useRef } from 'react';

export const Planning: React.FC = () => {
  const phasesToShow = React.useMemo(() => {
    // ...
  }, []);
  
  return <div>...</div>;
};
```

### APRÈS (✅ Corrigé)
```typescript
import { useState, useEffect, useCallback, useRef, useMemo, FC } from 'react';

export const Planning: FC = () => {
  const phasesToShow = useMemo(() => {
    // ...
  }, []);
  
  return <div>...</div>;
};
```

---

## 🔧 Changements appliqués

### 1. Import React supprimé ✅
```typescript
// AVANT
import React, { useState, ... } from 'react';

// APRÈS
import { useState, ... } from 'react';
```

### 2. Imports nommés ajoutés ✅
```typescript
// AVANT
import { useState, useEffect, useCallback, useRef } from 'react';

// APRÈS
import { useState, useEffect, useCallback, useRef, useMemo, FC } from 'react';
//                                                    ^^^^^^  ^^
//                                                    Ajoutés
```

### 3. React.FC → FC ✅
```typescript
// AVANT
export const Planning: React.FC = () => {

// APRÈS
export const Planning: FC = () => {
```

### 4. React.useMemo → useMemo ✅
```typescript
// AVANT
const phasesToShow = React.useMemo(() => {

// APRÈS
const phasesToShow = useMemo(() => {
```

---

## 📊 Comparaison des syntaxes JSX

### Ancienne syntaxe: `"jsx": "react"`

```typescript
// Nécessite l'import de React
import React from 'react';

function App() {
  return <div>Hello</div>;
}

// Compilé en:
function App() {
  return React.createElement('div', null, 'Hello');
}
```

### Nouvelle syntaxe: `"jsx": "react-jsx"`

```typescript
// React n'est PLUS nécessaire
import { useState } from 'react';

function App() {
  return <div>Hello</div>;
}

// Compilé en:
import { jsx as _jsx } from 'react/jsx-runtime';

function App() {
  return _jsx('div', { children: 'Hello' });
}
```

---

## 🎯 Règles d'import avec React 17+

### ✅ À FAIRE

```typescript
// Import nommé uniquement
import { useState, useEffect, FC } from 'react';

// Utilisation directe
export const Component: FC = () => {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
};
```

### ❌ À ÉVITER

```typescript
// Import par défaut (erreur !)
import React from 'react';

// Utilisation avec React.
export const Component: React.FC = () => {
  const value = React.useMemo(() => 42, []);
  return <div>{value}</div>;
};
```

---

## 📋 Liste des imports React courants

### Hooks
```typescript
import {
  useState,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
  useDebugValue
} from 'react';
```

### Types
```typescript
import {
  FC,                    // Function Component
  ReactNode,             // Type pour children
  ReactElement,          // Type pour éléments JSX
  ComponentProps,        // Props d'un composant
  CSSProperties,         // Styles inline
  MouseEvent,            // Événements souris
  ChangeEvent,           // Événements input
  FormEvent              // Événements form
} from 'react';
```

### Autres
```typescript
import {
  createContext,
  forwardRef,
  memo,
  lazy,
  Suspense,
  Fragment
} from 'react';
```

---

## 🔍 Vérification des autres fichiers

### Commande pour trouver les imports incorrects

```bash
# Chercher tous les imports React par défaut
grep -r "import React from 'react'" src/

# Chercher les utilisations de React.
grep -r "React\." src/
```

### Pattern de remplacement

```bash
# Remplacer dans tous les fichiers
# AVANT: import React, { ... } from 'react';
# APRÈS: import { ... } from 'react';

# AVANT: React.FC
# APRÈS: FC (et ajouter FC dans les imports)

# AVANT: React.useMemo
# APRÈS: useMemo (et ajouter useMemo dans les imports)
```

---

## 🎓 Pourquoi ce changement ?

### Avantages de la nouvelle syntaxe

1. **Bundle plus petit** ✅
   - Pas besoin d'importer tout React
   - Seulement les fonctions utilisées

2. **Meilleur tree-shaking** ✅
   - Les imports non utilisés sont supprimés
   - Bundle final plus optimisé

3. **Performance améliorée** ✅
   - Moins de code à parser
   - Démarrage plus rapide

4. **Syntaxe plus claire** ✅
   - Imports explicites
   - Pas de "magic" avec React global

---

## 📝 Migration complète

### Étape 1: Vérifier tsconfig.json
```json
{
  "compilerOptions": {
    "jsx": "react-jsx"  // ✅ Doit être "react-jsx"
  }
}
```

### Étape 2: Mettre à jour les imports
```typescript
// AVANT
import React, { useState } from 'react';

// APRÈS
import { useState } from 'react';
```

### Étape 3: Remplacer React.X
```typescript
// AVANT
React.FC
React.useMemo
React.useCallback
React.memo

// APRÈS
FC          // import { FC } from 'react';
useMemo     // import { useMemo } from 'react';
useCallback // import { useCallback } from 'react';
memo        // import { memo } from 'react';
```

---

## ✅ Résultat final

### Avant (❌ Erreur)
```typescript
import React, { useState, useEffect, useCallback, useRef } from 'react';

export const Planning: React.FC = () => {
  const phasesToShow = React.useMemo(() => { ... }, []);
  return <div>...</div>;
};
```

### Après (✅ Correct)
```typescript
import { useState, useEffect, useCallback, useRef, useMemo, FC } from 'react';

export const Planning: FC = () => {
  const phasesToShow = useMemo(() => { ... }, []);
  return <div>...</div>;
};
```

---

## 🔧 Autres fichiers à vérifier

Si vous avez d'autres fichiers avec le même problème :

### Rechercher
```bash
# Trouver tous les fichiers avec import React
grep -r "import React" src/ --include="*.tsx" --include="*.ts"
```

### Corriger automatiquement (avec précaution)
```bash
# Remplacer import React, { ... }
# par import { ... }
# (Vérifier manuellement après !)
```

---

## 📚 Ressources

### Documentation officielle
- [React 17 - New JSX Transform](https://react.dev/blog/2020/09/22/introducing-the-new-jsx-transform)
- [TypeScript - JSX](https://www.typescriptlang.org/docs/handbook/jsx.html)

### Migration guide
- [Migrating to React 17](https://react.dev/blog/2020/10/20/react-v17)

---

## ✅ Checklist de vérification

- [x] Import React par défaut supprimé
- [x] Imports nommés ajoutés (useMemo, FC)
- [x] React.FC remplacé par FC
- [x] React.useMemo remplacé par useMemo
- [x] Configuration tsconfig correcte
- [x] Code compile sans erreur

---

**Erreur "Module has no default export" corrigée ! React 17+ JSX Transform configuré correctement.** ✅

*Fichier modifié: `Planning.tsx`*  
*Imports: React → { useState, useEffect, useMemo, FC }*
