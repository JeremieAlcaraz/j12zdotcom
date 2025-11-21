#!/usr/bin/env bash
#
# 🚀 Quickstart pour tester sur magnolia
#
# Ce script contient toutes les commandes à exécuter sur magnolia
# pour tester les scripts de build Nix.
#
# Usage depuis magnolia :
#   bash <(curl -fsSL https://raw.githubusercontent.com/JeremieAlcaraz/j12zdotcom/claude/setup-local-build-013sjDQ8tRJxEqEa3mz3KCqq/QUICKSTART_MAGNOLIA.sh)
#
# Ou copier/coller les commandes ci-dessous :
#

set -euo pipefail

echo "🚀 Démarrage du quickstart pour magnolia..."
echo ""

# Vérifier que Nix est installé
if ! command -v nix &> /dev/null; then
    echo "❌ Nix n'est pas installé."
    echo "Installer Nix avec :"
    echo "  sh <(curl -L https://nixos.org/nix/install) --daemon"
    exit 1
fi

echo "✅ Nix est installé : $(nix --version)"
echo ""

# Vérifier les flakes
if ! nix flake show --help &> /dev/null; then
    echo "⚠️  Les flakes ne sont pas activés."
    echo "Activation des flakes..."
    mkdir -p ~/.config/nix
    echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
    echo "✅ Flakes activés"
    echo ""
fi

# Cloner le projet
PROJECT_DIR="$HOME/j12zdotcom-test"

if [ -d "$PROJECT_DIR" ]; then
    echo "⚠️  Le dossier $PROJECT_DIR existe déjà."
    read -p "Voulez-vous le supprimer et recommencer ? [o/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        rm -rf "$PROJECT_DIR"
        echo "✅ Dossier supprimé"
    else
        echo "❌ Annulé. Supprimez manuellement le dossier ou utilisez-le."
        exit 1
    fi
fi

echo "📥 Clonage du projet..."
git clone -b claude/setup-local-build-013sjDQ8tRJxEqEa3mz3KCqq \
    https://github.com/JeremieAlcaraz/j12zdotcom.git \
    "$PROJECT_DIR"

cd "$PROJECT_DIR"
echo "✅ Projet cloné dans $PROJECT_DIR"
echo ""

# Vérifier la branche
CURRENT_BRANCH=$(git branch --show-current)
echo "🌿 Branche actuelle : $CURRENT_BRANCH"
echo ""

# Lancer les tests automatiques
echo "🧪 Lancement de la suite de tests..."
echo ""

./scripts/test-all.sh

echo ""
echo "🎉 Quickstart terminé !"
echo ""
echo "Tu peux maintenant :"
echo "  cd $PROJECT_DIR"
echo "  ./scripts/build-nix.sh"
echo "  ./scripts/serve-local.sh"
echo ""
