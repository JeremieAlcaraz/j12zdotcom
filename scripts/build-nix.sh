#!/usr/bin/env bash
#
# 🚀 Script de build Nix automatique pour j12zdotcom
#
# Ce script :
# - Détecte automatiquement si le hash pnpm a changé
# - Propose de le mettre à jour (auto-accept dans 3s)
# - Relance le build si nécessaire
#
# Usage:
#   ./scripts/build-nix.sh
#

set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher des messages colorés
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Target Nix par défaut
TARGET="${1:-.#default}"

log_info "Tentative de build Nix ($TARGET)..."
echo ""

# On tente un build avec logs visibles en temps réel
# Ne pas utiliser set -e ici car on veut gérer l'erreur nous-mêmes
set +e
nix build "$TARGET" -L
BUILD_EXIT_CODE=$?
set -e

# Si le build a réussi, on s'arrête là
if [ $BUILD_EXIT_CODE -eq 0 ]; then
    log_success "Build réussi, aucun hash à mettre à jour."
    log_info "Résultat disponible dans ./result/"
    log_info "Pour servir le site : ./scripts/serve-local.sh"
    exit 0
fi

# Le build a échoué, on relance pour capturer l'erreur (sans -L pour éviter le bruit)
echo ""
log_warning "Le build a échoué, analyse de l'erreur..."

BUILD_OUTPUT=$(nix build "$TARGET" --no-link 2>&1 || true)

# On cherche le message 'got: sha256-...'
if ! echo "$BUILD_OUTPUT" | grep -q "got:.*sha256-"; then
    log_error "Build échoué, mais pas à cause du hash pnpm."
    echo ""
    echo "---- Erreur Nix ----"
    echo "$BUILD_OUTPUT"
    exit 1
fi

# On récupère le nouveau hash proposé par Nix
NEW_HASH=$(echo "$BUILD_OUTPUT" | grep -oP 'got:\s+\K(sha256-[A-Za-z0-9+/=]+)' | head -n1)

if [ -z "$NEW_HASH" ]; then
    log_error "Impossible d'extraire le nouveau hash."
    echo "$BUILD_OUTPUT"
    exit 1
fi

log_warning "Nouveau hash pnpm détecté : $NEW_HASH"
echo ""

# Prompt interactif avec timeout 3 secondes
echo -ne "${YELLOW}Mettre à jour le hash dans flake.nix ? [O/n] (auto O dans 3s) : ${NC}"

# Utiliser read avec timeout
if read -r -t 3 ANSWER; then
    # L'utilisateur a répondu
    if [[ "$ANSWER" =~ ^[Nn]$ ]]; then
        log_error "Hash non mis à jour. Arrêt."
        exit 1
    fi
else
    # Timeout atteint, on continue automatiquement
    echo ""
    log_info "Timeout atteint, mise à jour automatique..."
fi

log_info "Mise à jour du hash dans flake.nix..."

# Remplacement de la ligne 'hash = "...";' de manière portable
# On utilise sed pour remplacer n'importe quel hash sha256
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS (BSD sed)
    sed -i '' "s|hash = \"sha256-[A-Za-z0-9+/=]*\";|hash = \"$NEW_HASH\";|g" flake.nix
else
    # Linux (GNU sed)
    sed -i "s|hash = \"sha256-[A-Za-z0-9+/=]*\";|hash = \"$NEW_HASH\";|g" flake.nix
fi

log_success "Hash mis à jour dans flake.nix"
echo ""

log_info "Relance du build Nix..."
echo ""

# Relancer le build avec affichage des logs
if nix build "$TARGET" -L; then
    log_success "Build terminé avec succès ! 🎉"
    echo ""
    log_info "Résultat disponible dans ./result/"
    log_info "Pour servir le site : ./scripts/serve-local.sh"
else
    log_error "Le build a échoué."
    exit 1
fi
