#!/usr/bin/env bash
#
# 🧪 Script de test automatique pour valider tous les scripts de build
#
# Ce script exécute tous les tests dans l'ordre et affiche un résumé final.
#
# Usage:
#   ./scripts/test-all.sh
#

set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables de résultat
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Fonction pour afficher des messages
log_test() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}🧪 Test $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
    ((TESTS_TOTAL++))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
    ((TESTS_TOTAL++))
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# En-tête
echo -e "\n${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  ${MAGENTA}🚀 Test Suite - Scripts de Build Nix${NC}       ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}\n"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test 1 : Vérifier que Nix est installé
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
log_test "1/6 : Vérification de l'environnement Nix"

if command -v nix &> /dev/null; then
    NIX_VERSION=$(nix --version)
    log_success "Nix installé : $NIX_VERSION"
else
    log_error "Nix n'est pas installé"
    exit 1
fi

# Vérifier les flakes
if nix flake show --help &> /dev/null; then
    log_success "Flakes activés"
else
    log_error "Flakes non activés"
    log_info "Activez les flakes avec :"
    echo "  mkdir -p ~/.config/nix"
    echo "  echo 'experimental-features = nix-command flakes' >> ~/.config/nix/nix.conf"
    exit 1
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test 2 : Vérifier que les scripts existent et sont exécutables
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
log_test "2/6 : Vérification des scripts"

SCRIPTS=(
    "scripts/build-nix.sh"
    "scripts/serve-local.sh"
    "scripts/test-caddy-local.sh"
    "scripts/dev-nix.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            log_success "$(basename $script) existe et est exécutable"
        else
            log_error "$(basename $script) n'est pas exécutable"
            log_info "Exécutez : chmod +x $script"
        fi
    else
        log_error "$(basename $script) n'existe pas"
    fi
done

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test 3 : Build Nix
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
log_test "3/6 : Build Nix du site"

log_info "Lancement de ./scripts/build-nix.sh..."
if ./scripts/build-nix.sh; then
    log_success "Build Nix réussi"
else
    log_error "Build Nix échoué"
    exit 1
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test 4 : Vérifier le résultat du build
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
log_test "4/6 : Vérification du résultat"

if [ -L "result" ]; then
    log_success "Lien symbolique 'result' créé"

    STORE_PATH=$(readlink result)
    log_info "Chemin du store : $STORE_PATH"

    if [ -d "result" ]; then
        log_success "Dossier result accessible"

        # Vérifier les fichiers essentiels
        if [ -f "result/index.html" ]; then
            log_success "index.html trouvé"
        else
            log_error "index.html manquant"
        fi

        if [ -d "result/_astro" ] || [ -d "result/assets" ]; then
            log_success "Assets trouvés"
        else
            log_warning "Aucun dossier d'assets trouvé (_astro ou assets)"
        fi
    else
        log_error "result n'est pas un dossier valide"
    fi
else
    log_error "Lien symbolique 'result' non créé"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test 5 : Test du serveur local (rapide)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
log_test "5/6 : Test du serveur local (10 secondes)"

# Trouver un port libre
TEST_PORT=8765

log_info "Démarrage du serveur sur le port $TEST_PORT..."

# Lancer le serveur en arrière-plan
./scripts/serve-local.sh "$TEST_PORT" &> /tmp/serve-test.log &
SERVER_PID=$!

# Attendre que le serveur démarre
sleep 3

# Tester la connexion
if curl -f -s http://localhost:$TEST_PORT > /dev/null; then
    log_success "Serveur accessible sur http://localhost:$TEST_PORT"

    # Vérifier que le HTML est correct
    RESPONSE=$(curl -s http://localhost:$TEST_PORT)
    if echo "$RESPONSE" | grep -q "<html"; then
        log_success "HTML valide retourné"
    else
        log_warning "La réponse ne semble pas être du HTML"
    fi
else
    log_error "Serveur non accessible"
fi

# Arrêter le serveur
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true
log_info "Serveur arrêté"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test 6 : Vérifier la structure du site buildé
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
log_test "6/6 : Vérification de la structure du site"

REQUIRED_FILES=(
    "result/index.html"
    "result/404.html"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(du -h "$file" | cut -f1)
        log_success "$(basename $file) présent ($SIZE)"
    else
        log_warning "$(basename $file) manquant"
    fi
done

# Compter les fichiers
TOTAL_FILES=$(find result -type f | wc -l)
log_info "Nombre total de fichiers : $TOTAL_FILES"

if [ "$TOTAL_FILES" -gt 10 ]; then
    log_success "Le site contient $TOTAL_FILES fichiers"
else
    log_warning "Le site ne contient que $TOTAL_FILES fichiers"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Résumé final
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "\n${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  ${MAGENTA}📊 Résumé des tests${NC}                         ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}✅ Tests réussis  : $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Tests échoués  : $TESTS_FAILED${NC}"
fi
echo -e "${BLUE}📊 Total          : $TESTS_TOTAL${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}  ${GREEN}🎉 Tous les tests sont passés !${NC}             ${GREEN}║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}\n"

    echo -e "${BLUE}Tu peux maintenant :${NC}"
    echo -e "  ${GREEN}✓${NC} Utiliser ${CYAN}./scripts/build-nix.sh${NC} pour builder"
    echo -e "  ${GREEN}✓${NC} Utiliser ${CYAN}./scripts/serve-local.sh${NC} pour tester"
    echo -e "  ${GREEN}✓${NC} Utiliser ${CYAN}./scripts/dev-nix.sh${NC} pour build + serve"
    echo -e "  ${GREEN}✓${NC} Passer aux prochaines phases (Caddy, Cloudflare Tunnel, NixOS)\n"
    exit 0
else
    echo -e "\n${RED}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║${NC}  ${RED}❌ Certains tests ont échoué${NC}                 ${RED}║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════╝${NC}\n"

    echo -e "${YELLOW}Vérifiez les erreurs ci-dessus${NC}\n"
    exit 1
fi
