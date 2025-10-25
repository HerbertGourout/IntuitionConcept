# Configuration du Générateur de Rendus 3D

## 🎨 Vue d'ensemble

Le générateur de rendus 3D utilise l'API **Replicate** avec les modèles **Stable Diffusion XL** et **ControlNet** pour transformer vos plans architecturaux en visualisations photoréalistes.

## 🔑 Configuration de la clé API

### Étape 1 : Créer un compte Replicate

1. Allez sur [https://replicate.com](https://replicate.com)
2. Créez un compte gratuit
3. Accédez à votre dashboard : [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
4. Copiez votre clé API (format : `r8_...`)

### Étape 2 : Configurer la clé dans le projet

Créez ou modifiez le fichier `.env.local` à la racine du projet :

```bash
# API Replicate pour génération 3D
VITE_REPLICATE_API_KEY=r8_votre_cle_api_ici
```

⚠️ **Important** : Ne committez JAMAIS ce fichier dans Git !

### Étape 3 : Redémarrer le serveur de développement

```bash
npm run dev
```

## 💰 Tarification

### Mode Standard (SDXL)
- **Brouillon** : ~$0.001 par image (512x512, 20 steps)
- **Standard** : ~$0.002 par image (768x768, 30 steps)
- **HD** : ~$0.004 par image (1024x1024, 50 steps)

### Mode Précis (ControlNet) 🆕
- **Brouillon** : ~$0.0015 par image
- **Standard** : ~$0.003 par image
- **HD** : ~$0.006 par image

**Fidélité au plan** :
- Mode Standard : 70-85%
- Mode Précis : 95%+ ✨

## 🚀 Fonctionnalités

### Styles Architecturaux
- **Moderne** : Design contemporain épuré
- **Traditionnel** : Architecture classique
- **Industriel** : Style urbain brut
- **Minimaliste** : Simplicité zen
- **Africain** : Architecture locale adaptée

### Angles de Vue
- **Façade** : Vue de face
- **Aérienne** : Vue du dessus
- **Perspective 3D** : Vue en 3 dimensions
- **Intérieur** : Vue intérieure

### Éclairage
- **Jour** : Lumière naturelle
- **Coucher de soleil** : Golden hour
- **Nuit** : Éclairage artificiel

### Qualités
- **Brouillon** : Rapide, basse résolution
- **Standard** : Équilibre qualité/vitesse
- **HD** : Haute définition

## 🎯 Mode de Précision

### Standard (70-85% fidélité)
- Utilise SDXL standard
- Génération rapide (~30-45s)
- Bon pour les concepts généraux
- Coût réduit

### Précis - ControlNet (95% fidélité) 🆕
- Utilise ControlNet pour respecter exactement les contours
- Génération plus longue (~60-90s)
- Parfait pour les présentations clients
- Coût +50%

## 🔧 Dépannage

### Erreur "Service 3D non configuré"
➡️ Vérifiez que `VITE_REPLICATE_API_KEY` est bien définie dans `.env.local`

### Erreur "Insufficient credits"
➡️ Ajoutez des crédits sur votre compte Replicate : [https://replicate.com/account/billing](https://replicate.com/account/billing)

### Génération très lente
➡️ Normal pour le mode HD ou ControlNet. Utilisez le mode Standard pour plus de rapidité.

### Image floue ou de mauvaise qualité
➡️ Augmentez la qualité à "HD" ou utilisez le mode "Précis"

## 📊 Estimation des coûts

Pour un projet typique avec 10 plans :

| Configuration | Coût total |
|--------------|-----------|
| Standard + 1 variation | ~$0.02 |
| Standard + 4 variations | ~$0.08 |
| HD + 1 variation | ~$0.04 |
| Précis HD + 2 variations | ~$0.12 |

**Crédit gratuit Replicate** : $0.10 à l'inscription (environ 50 images standard)

## 🎨 Conseils d'utilisation

1. **Testez d'abord en mode Brouillon** pour valider le style
2. **Utilisez le mode Précis** uniquement pour les rendus finaux
3. **Générez 2-3 variations** pour avoir le choix
4. **Privilégiez la vue Perspective 3D** pour un rendu impressionnant
5. **Ajustez l'éclairage** selon le contexte (jour pour bureaux, sunset pour résidentiel)

## 🔗 Ressources

- [Documentation Replicate](https://replicate.com/docs)
- [Modèle SDXL](https://replicate.com/stability-ai/sdxl)
- [Modèle ControlNet](https://replicate.com/jagilley/controlnet-canny)
- [Tarification Replicate](https://replicate.com/pricing)

## 📝 Support

En cas de problème, vérifiez :
1. La clé API est correcte
2. Vous avez des crédits suffisants
3. Le plan uploadé est valide (PDF uniquement)
4. La connexion internet est stable

---

**Développé avec ❤️ pour IntuitionConcept BTP**
