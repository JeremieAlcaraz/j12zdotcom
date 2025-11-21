#!/usr/bin/env bash
#
# 🚀 Script de développement Nix all-in-one
#
# Ce script :
# - Build le site avec Nix (avec auto-update du hash)
# - Sert le résultat sur http://localhost:8080
#
# Usage:
#   ./scripts/dev-nix.sh [port]
#

set -euo pipefail

PORT="${1:-8080}"

echo "🔨 Build du site..."
./scripts/build-nix.sh

echo ""
echo "🌐 Démarrage du serveur..."
./scripts/serve-local.sh "$PORT"
