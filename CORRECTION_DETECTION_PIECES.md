# 🔧 Correction : Détection des pièces

## 🔴 Problème observé

Dans les logs, on voit :
```
✅ DEBUG - Nombre de pièces dans measurements.rooms: 0
✅ DEBUG - Nombre de pièces dans functionalProgram.rooms: 0
✅ DEBUG - Nombre de drawings: 8
🔍 DEBUG - Aucune pièce dans functionalProgram.targets, recherche dans drawings...
✅ DEBUG - Après normalisation - Nombre de pièces: 0
```

**Cause** : Les pièces ne sont dans aucun des emplacements vérifiés.

---

## ✅ Solution : Fallbacks multiples

J'ai ajouté des fallbacks pour chercher les pièces dans **TOUS** les emplacements possibles :

### **Ordre de recherche** :

1. **`measurements.rooms`** (standard)
2. **`functionalProgram.rooms`** (programme fonctionnel)
3. **`functionalProgram.targets`** (cibles du programme)
4. **`drawings[].rooms`** (pièces dans chaque plan)
5. **`drawings[].spaces`** (espaces dans chaque plan)
6. **`drawings[].elements`** (éléments dans chaque plan)

### **Code ajouté** :

```typescript
// FALLBACK 1: functionalProgram.rooms
if (!roomsArray || roomsArray.length === 0) {
  const functionalProgramObj = asObject(dataObj.functionalProgram);
  if (functionalProgramObj) {
    roomsArray = asArray(functionalProgramObj.rooms);
    
    // FALLBACK 1.1: functionalProgram.targets
    if (!roomsArray || roomsArray.length === 0) {
      roomsArray = asArray(functionalProgramObj.targets);
    }
  }
}

// FALLBACK 2: drawings
if (!roomsArray || roomsArray.length === 0) {
  const drawingsArray = asArray(dataObj.drawings);
  if (drawingsArray) {
    for (const drawing of drawingsArray) {
      const drawingObj = asObject(drawing);
      if (drawingObj) {
        // Essayer rooms, spaces, elements
        let drawingRooms = asArray(drawingObj.rooms) 
          || asArray(drawingObj.spaces) 
          || asArray(drawingObj.elements);
        
        if (drawingRooms && drawingRooms.length > 0) {
          roomsArray = drawingRooms;
          break;
        }
      }
    }
  }
}
```

---

## 🧪 Test à relancer

### **Logs attendus** :

```
🔍 DEBUG - Aucune pièce dans measurements.rooms, recherche dans functionalProgram...
🔍 DEBUG - Pièces trouvées dans functionalProgram.rooms: 0
🔍 DEBUG - Aucune pièce dans functionalProgram.rooms, recherche dans functionalProgram.targets...
🔍 DEBUG - Pièces trouvées dans functionalProgram.targets: 22  ← ICI !
✅ DEBUG - Après normalisation - Nombre de pièces: 22
```

ou

```
🔍 DEBUG - Aucune pièce dans functionalProgram, recherche dans drawings...
🔍 DEBUG - Nombre de drawings: 8
🔍 DEBUG - Drawing type: floor_plan - Clés: ['type', 'name', 'spaces', ...]
🔍 DEBUG - Pièces trouvées dans drawing: 22  ← ICI !
✅ DEBUG - Après normalisation - Nombre de pièces: 22
```

---

## 🎯 Prochaine étape

**Relancez le test** et partagez-moi les nouveaux logs !

Les logs vont maintenant nous dire **exactement où** Claude a mis les pièces, et on les trouvera ! 🚀
