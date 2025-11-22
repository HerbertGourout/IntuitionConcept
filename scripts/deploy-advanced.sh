#!/bin/bash

# Script de déploiement automatisé pour Gemini 3 Advanced
# Usage: ./scripts/deploy-advanced.sh [environment]
# Environments: staging, production

set -e

ENVIRONMENT=${1:-staging}
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BOLD}🚀 Déploiement Gemini 3 Advanced - ${ENVIRONMENT}${NC}\n"

# Vérifications pré-déploiement
echo -e "${BOLD}📋 Vérifications pré-déploiement...${NC}"

# 1. Vérifier que les variables d'environnement sont définies
if [ -z "$VITE_GEMINI_3_API_KEY" ]; then
    echo -e "${RED}❌ VITE_GEMINI_3_API_KEY n'est pas définie${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Variables d'environnement OK${NC}"

# 2. Vérifier les dépendances
echo -e "\n${BOLD}📦 Vérification des dépendances...${NC}"
npm ci
echo -e "${GREEN}✅ Dépendances installées${NC}"

# 3. Linter
echo -e "\n${BOLD}🔍 Vérification du code...${NC}"
npm run lint || {
    echo -e "${YELLOW}⚠️  Warnings ESLint détectés (non bloquant)${NC}"
}

# 4. Tests
echo -e "\n${BOLD}🧪 Exécution des tests...${NC}"
npm run test || {
    echo -e "${RED}❌ Tests échoués${NC}"
    exit 1
}
echo -e "${GREEN}✅ Tests réussis${NC}"

# 5. Build
echo -e "\n${BOLD}🔨 Build de production...${NC}"
npm run build || {
    echo -e "${RED}❌ Build échoué${NC}"
    exit 1
}
echo -e "${GREEN}✅ Build réussi${NC}"

# 6. Vérification de la taille du bundle
echo -e "\n${BOLD}📊 Analyse de la taille du bundle...${NC}"
du -sh dist/

# 7. Déploiement selon l'environnement
echo -e "\n${BOLD}🚀 Déploiement vers ${ENVIRONMENT}...${NC}"

if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}⚠️  Déploiement en PRODUCTION${NC}"
    read -p "Êtes-vous sûr? (yes/no) " -n 3 -r
    echo
    if [[ ! $REPLY =~ ^yes$ ]]; then
        echo -e "${RED}Déploiement annulé${NC}"
        exit 1
    fi
    
    # Déploiement production (adapter selon votre plateforme)
    if command -v vercel &> /dev/null; then
        vercel --prod
    elif command -v netlify &> /dev/null; then
        netlify deploy --prod
    else
        echo -e "${YELLOW}⚠️  Aucune plateforme de déploiement détectée${NC}"
        echo "Veuillez déployer manuellement"
    fi
else
    # Déploiement staging
    if command -v vercel &> /dev/null; then
        vercel
    elif command -v netlify &> /dev/null; then
        netlify deploy
    else
        echo -e "${YELLOW}⚠️  Aucune plateforme de déploiement détectée${NC}"
        echo "Veuillez déployer manuellement"
    fi
fi

echo -e "\n${GREEN}${BOLD}✅ Déploiement terminé avec succès!${NC}"
echo -e "\n${BOLD}📊 Prochaines étapes:${NC}"
echo "1. Vérifier le déploiement sur la plateforme"
echo "2. Tester les fonctionnalités Advanced"
echo "3. Surveiller les métriques et les coûts"
echo "4. Consulter le dashboard analytics"
echo -e "\n${BOLD}📚 Documentation:${NC}"
echo "- PRODUCTION_CHECKLIST.md"
echo "- INTEGRATION_GUIDE.md"
echo "- GEMINI3_COMPLETE.md"
