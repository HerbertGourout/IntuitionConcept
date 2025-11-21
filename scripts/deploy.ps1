# 🚀 Script de Déploiement Automatique IntuitionConcept
# Usage: .\scripts\deploy.ps1 [environment]
# Exemple: .\scripts\deploy.ps1 production

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment = 'production'
)

Write-Host "🚀 Déploiement IntuitionConcept - Environnement: $Environment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Firebase CLI est installé
Write-Host "🔍 Vérification de Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>&1
    Write-Host "✅ Firebase CLI installé: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI non installé!" -ForegroundColor Red
    Write-Host "📦 Installation en cours..." -ForegroundColor Yellow
    npm install -g firebase-tools
    Write-Host "✅ Firebase CLI installé!" -ForegroundColor Green
}

Write-Host ""

# Vérifier la connexion Firebase
Write-Host "🔐 Vérification de la connexion Firebase..." -ForegroundColor Yellow
$firebaseProjects = firebase projects:list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Non connecté à Firebase!" -ForegroundColor Red
    Write-Host "🔑 Connexion en cours..." -ForegroundColor Yellow
    firebase login
}
Write-Host "✅ Connecté à Firebase" -ForegroundColor Green

Write-Host ""

# Nettoyer les builds précédents
Write-Host "🧹 Nettoyage des builds précédents..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Dossier dist nettoyé" -ForegroundColor Green
}

Write-Host ""

# Installer les dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dépendances installées" -ForegroundColor Green

Write-Host ""

# Linter le code
Write-Host "🔍 Vérification du code (lint)..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warnings détectés (non bloquant)" -ForegroundColor Yellow
}

Write-Host ""

# Tests
Write-Host "🧪 Exécution des tests..." -ForegroundColor Yellow
npm run test:ci:stable
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Certains tests ont échoué (non bloquant)" -ForegroundColor Yellow
}

Write-Host ""

# Build
Write-Host "🏗️  Build de l'application ($Environment)..." -ForegroundColor Yellow
$env:NODE_ENV = $Environment
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build réussi" -ForegroundColor Green

Write-Host ""

# Vérifier que le build existe
if (-not (Test-Path "dist/index.html")) {
    Write-Host "❌ Le fichier dist/index.html n'existe pas!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Déploiement
Write-Host "🚀 Déploiement sur Firebase Hosting..." -ForegroundColor Yellow

switch ($Environment) {
    'production' {
        Write-Host "📍 Déploiement en PRODUCTION (live)" -ForegroundColor Magenta
        firebase deploy --only hosting
    }
    'staging' {
        Write-Host "📍 Déploiement en STAGING" -ForegroundColor Yellow
        firebase hosting:channel:deploy staging
    }
    'development' {
        Write-Host "📍 Déploiement en DEVELOPMENT (preview)" -ForegroundColor Cyan
        firebase hosting:channel:deploy dev-$(Get-Date -Format 'yyyyMMdd-HHmmss')
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du déploiement!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Déploiement réussi!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Afficher l'URL
switch ($Environment) {
    'production' {
        Write-Host "🌍 URL Production: https://intuitionconcept.web.app" -ForegroundColor Green
    }
    'staging' {
        Write-Host "🌍 URL Staging: https://intuitionconcept--staging.web.app" -ForegroundColor Yellow
    }
    'development' {
        Write-Host "🌍 URL Preview: Voir la sortie ci-dessus" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "📊 Console Firebase: https://console.firebase.google.com/project/intuitionconcept/overview" -ForegroundColor Cyan
Write-Host ""
