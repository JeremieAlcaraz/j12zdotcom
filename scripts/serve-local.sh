#!/usr/bin/env bash
#
# 🌐 Script pour servir le site buildé en local
#
# Ce script sert le site buildé par Nix (dans ./result/) sur http://localhost:8080
#
# Usage:
#   ./scripts/serve-local.sh [port]
#
# Exemples:
#   ./scripts/serve-local.sh        # Servir sur port 8080 (défaut)
#   ./scripts/serve-local.sh 3000   # Servir sur port 3000
#

set -euo pipefail

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Port par défaut
PORT="${1:-8080}"

# Vérifier si result existe
if [ ! -d "result" ] && [ ! -L "result" ]; then
    echo -e "${RED}❌ Le dossier 'result' n'existe pas.${NC}"
    echo -e "${YELLOW}💡 Lancez d'abord : ./scripts/build-nix.sh${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Démarrage du serveur local...${NC}"
echo ""
echo -e "${GREEN}📁 Dossier servi : $(readlink -f result 2>/dev/null || echo './result')${NC}"
echo -e "${GREEN}🌐 URL : http://localhost:$PORT${NC}"
echo ""
echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter${NC}"
echo ""

# Vérifier si serve, Caddy ou Python est disponible
if command -v serve &> /dev/null; then
    # Utiliser serve (Node.js)
    serve result -p "$PORT" -s
elif nix-shell -p caddy --run "caddy version" &> /dev/null; then
    # Utiliser Caddy via nix-shell
    echo -e "${BLUE}📦 Utilisation de Caddy (via nix-shell)...${NC}"
    nix-shell -p caddy --run "caddy file-server --root result --listen :$PORT"
elif command -v python3 &> /dev/null; then
    # Fallback sur Python
    echo -e "${BLUE}🐍 Utilisation de Python HTTP server...${NC}"
    cd result && python3 -m http.server "$PORT"
else
    # Dernier recours : installer serve via nix-shell
    echo -e "${BLUE}📦 Installation temporaire de 'serve' via nix-shell...${NC}"
    nix-shell -p nodePackages.serve --run "serve result -p $PORT -s"
fi
