#!/usr/bin/env bash
set -e

# Cible directe
FILE="flake.nix"

# 1. Mettre un faux hash pour forcer le calcul
echo "🔨 Invalidation du hash dans $FILE..."
sed -i 's/pnpmDepsHash = ".*"/pnpmDepsHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="/' "$FILE"

# 2. Lancer le build et capturer l'erreur (le '|| true' empêche le script de s'arrêter sur l'erreur)
echo "🏗️  Calcul du nouveau hash via nix build..."
OUTPUT=$(nix build . 2>&1 || true)

# 3. Extraire le hash (cherche la ligne 'got:')
NEW_HASH=$(echo "$OUTPUT" | grep "got:" | awk '{print $2}')

if [ -z "$NEW_HASH" ]; then
    echo "❌ Erreur: Impossible de trouver le hash dans les logs."
    echo "Logs:"
    echo "$OUTPUT" | tail -n 5
    exit 1
fi

echo "🎯 Nouveau hash trouvé : $NEW_HASH"

# 4. Appliquer le nouveau hash
sed -i "s|pnpmDepsHash = \".*\"|pnpmDepsHash = \"$NEW_HASH\"|" "$FILE"
echo "✅ $FILE mis à jour."

# 5. Commit et Push
read -p "Voulez-vous commit et push maintenant ? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add "$FILE" pnpm-lock.yaml package.json
    git commit -m "chore: update dependencies hash"
    git push
    echo "🚀 Poussé !"
else
    echo "Fait, mais non poussé."
fi
