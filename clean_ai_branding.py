#!/usr/bin/env python3
"""
Script de nettoyage complet des éléments "AI-generated" 
Supprime tous les marqueurs visuels et textuels qui font "showcase IA"
"""

import os
import re
from pathlib import Path

# Répertoires à traiter
SRC_DIR = Path("src")

# Extensions de fichiers à traiter
EXTENSIONS = {".tsx", ".ts", ".jsx", ".js", ".css", ".scss"}

# Patterns à supprimer ou remplacer
REPLACEMENTS = {
    # Emojis IA
    r'✨': '',
    r'🤖': '',
    r'🧠': '',
    r'🔮': '',
    r'⚡': '',
    r'🎯': '',
    r'🎨': '',
    r'💡': '',
    r'🚀': '',
    
    # Textes explicites IA (à remplacer par des termes professionnels)
    r'\bAssistant IA\b': 'Assistant',
    r'\bIntelligence Artificielle\b': 'Système automatisé',
    r'\bGénéré par IA\b': 'Généré automatiquement',
    r'\bGénéré par l\'IA\b': 'Généré automatiquement',
    r'\bPowered by AI\b': 'Automatisé',
    r'\bIA avancée\b': 'Système avancé',
    r'\bModèle IA\b': 'Modèle',
    r'\bAlgorithme IA\b': 'Algorithme',
    
    # Phrases de chargement IA
    r'L\'IA analyse': 'Analyse en cours',
    r'L\'IA génère': 'Génération en cours',
    r'L\'IA traite': 'Traitement en cours',
    r'L\'IA prépare': 'Préparation en cours',
    r'Analyse IA en cours': 'Analyse en cours',
    r'Génération IA': 'Génération',
    r'Traitement IA': 'Traitement',
    
    # Badges et labels
    r'badge.*?IA': 'badge',
    r'label.*?IA': 'label',
    r'tag.*?IA': 'tag',
    
    # Prompts et placeholders
    r'Posez votre question à l\'IA': 'Posez votre question',
    r'Demandez à l\'IA': 'Rechercher',
    r'Décrivez ce que vous souhaitez générer': 'Description',
    r'Générer avec l\'IA': 'Générer',
    r'Créer avec l\'IA': 'Créer',
    
    # Indicateurs de confiance/score IA
    r'Confiance du modèle': 'Fiabilité',
    r'Score IA': 'Score',
    r'Précision IA': 'Précision',
    
    # Termes marketing IA
    r'Intelligence augmentée': 'Système intelligent',
    r'Machine Learning': 'Apprentissage automatique',
    r'Deep Learning': 'Analyse avancée',
    r'Neural Network': 'Réseau',
    r'GPT': 'Modèle',
    r'Claude': 'Modèle',
    r'OpenAI': 'Service',
}

# Patterns de classes CSS à nettoyer
CSS_PATTERNS = [
    r'ai-badge',
    r'ai-indicator',
    r'ai-generated',
    r'ai-powered',
    r'ai-typing',
    r'ai-shimmer',
    r'ai-pulse',
    r'ai-glow',
    r'magic-',
    r'sparkle-',
    r'robot-',
]

def clean_file(file_path: Path) -> tuple[int, int]:
    """
    Nettoie un fichier des éléments AI-generated
    Retourne (nombre de remplacements, nombre de lignes modifiées)
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        replacements_count = 0
        
        # Appliquer tous les remplacements
        for pattern, replacement in REPLACEMENTS.items():
            new_content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
            if new_content != content:
                replacements_count += 1
                content = new_content
        
        # Nettoyer les classes CSS AI
        for css_pattern in CSS_PATTERNS:
            content = re.sub(
                rf'className="[^"]*{css_pattern}[^"]*"',
                lambda m: m.group(0).replace(css_pattern, ''),
                content
            )
        
        # Supprimer les lignes de commentaires mentionnant l'IA
        content = re.sub(r'//.*?\bIA\b.*?\n', '\n', content)
        content = re.sub(r'/\*.*?\bIA\b.*?\*/', '', content, flags=re.DOTALL)
        
        # Nettoyer les espaces multiples
        content = re.sub(r'\n\n\n+', '\n\n', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            lines_changed = len([
                line for line in content.split('\n') 
                if line not in original_content.split('\n')
            ])
            
            return (replacements_count, lines_changed)
        
        return (0, 0)
    
    except Exception as e:
        print(f"❌ Erreur sur {file_path}: {e}")
        return (0, 0)

def main():
    """Fonction principale"""
    print("🧹 NETTOYAGE COMPLET DES ÉLÉMENTS AI-GENERATED")
    print("=" * 60)
    
    total_files = 0
    total_replacements = 0
    total_lines = 0
    modified_files = []
    
    # Parcourir tous les fichiers
    for ext in EXTENSIONS:
        for file_path in SRC_DIR.rglob(f"*{ext}"):
            # Ignorer node_modules et autres
            if 'node_modules' in str(file_path) or '__pycache__' in str(file_path):
                continue
            
            replacements, lines = clean_file(file_path)
            
            if replacements > 0:
                total_files += 1
                total_replacements += replacements
                total_lines += lines
                modified_files.append(str(file_path))
                print(f"✅ {file_path.name}: {replacements} remplacements, {lines} lignes")
    
    print("\n" + "=" * 60)
    print(f"📊 RÉSUMÉ:")
    print(f"   Fichiers modifiés: {total_files}")
    print(f"   Remplacements: {total_replacements}")
    print(f"   Lignes modifiées: {total_lines}")
    print("=" * 60)
    
    # Sauvegarder la liste des fichiers modifiés
    with open('NETTOYAGE_IA_RAPPORT.txt', 'w', encoding='utf-8') as f:
        f.write("RAPPORT DE NETTOYAGE DES ÉLÉMENTS AI-GENERATED\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Fichiers modifiés: {total_files}\n")
        f.write(f"Remplacements: {total_replacements}\n")
        f.write(f"Lignes modifiées: {total_lines}\n\n")
        f.write("FICHIERS MODIFIÉS:\n")
        f.write("-" * 60 + "\n")
        for file in modified_files:
            f.write(f"{file}\n")
    
    print("\n✅ Rapport sauvegardé: NETTOYAGE_IA_RAPPORT.txt")

if __name__ == "__main__":
    main()
