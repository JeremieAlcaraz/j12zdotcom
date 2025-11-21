#!/usr/bin/env bash
#
# 🔷 Script pour tester Caddy en local avec le site buildé
#
# Ce script crée un Caddyfile temporaire et lance Caddy pour servir
# le site sur http://localhost:8080
#
# Usage:
#   ./scripts/test-caddy-local.sh [port]
#

set -euo pipefail

PORT="${1:-8080}"

# Vérifier si result existe
if [ ! -d "result" ] && [ ! -L "result" ]; then
    echo "❌ Le dossier 'result' n'existe pas."
    echo "💡 Lancez d'abord : ./scripts/build-nix.sh"
    exit 1
fi

# Créer un Caddyfile temporaire
CADDYFILE=$(mktemp)
RESULT_PATH=$(readlink -f result)

cat > "$CADDYFILE" <<EOF
:$PORT {
    root * $RESULT_PATH
    file_server

    # Gestion des erreurs 404
    handle_errors {
        @404 {
            expression {http.error.status_code} == 404
        }
        rewrite @404 /404.html
        file_server
    }

    # Compression
    encode gzip zstd

    # Headers de sécurité
    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
        -Server
    }

    # Logs
    log {
        output stdout
        format console
    }
}
EOF

echo "🔷 Démarrage de Caddy..."
echo "📁 Dossier servi : $RESULT_PATH"
echo "🌐 URL : http://localhost:$PORT"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter"
echo ""

# Lancer Caddy via nix-shell avec l'adapter Caddyfile
nix shell nixpkgs#caddy --command caddy run --config "$CADDYFILE" --adapter caddyfile

# Nettoyer le Caddyfile temporaire à la sortie
rm -f "$CADDYFILE"
