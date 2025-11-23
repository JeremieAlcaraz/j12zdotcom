#!/usr/bin/env bash
# Script de migration vers le module NixOS j12z-webserver
#
# Usage:
#   ./migrate.sh [--dry-run]
#
# Ce script aide à migrer depuis le script bash deploy-j12zdotcom.sh
# vers le module NixOS déclaratif.

set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    log_warning "Mode dry-run activé (aucune modification)"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Migration vers le module NixOS j12z-webserver"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifications préalables
log_info "Vérifications préalables..."

if [[ ! -d "/etc/nixos" ]]; then
    log_error "/etc/nixos n'existe pas. Es-tu sur un système NixOS ?"
    exit 1
fi

if [[ $EUID -ne 0 && $DRY_RUN == false ]]; then
    log_error "Ce script doit être exécuté avec sudo (sauf en --dry-run)"
    exit 1
fi

log_success "Système NixOS détecté"

# Vérifier que la flake j12zdotcom est accessible
log_info "Vérification de l'accès à la flake j12zdotcom..."
if nix flake metadata github:JeremieAlcaraz/j12zdotcom > /dev/null 2>&1; then
    log_success "Flake j12zdotcom accessible"
else
    log_error "Impossible d'accéder à la flake j12zdotcom"
    exit 1
fi

# Étape 1 : Backup
log_info "📦 Création d'un backup de /etc/nixos..."
BACKUP_DIR="/etc/nixos.backup-$(date +%Y%m%d-%H%M%S)"

if [[ $DRY_RUN == false ]]; then
    cp -r /etc/nixos "$BACKUP_DIR"
    log_success "Backup créé : $BACKUP_DIR"
else
    log_info "[DRY-RUN] Backup serait créé dans : $BACKUP_DIR"
fi

# Étape 2 : Vérifier si flake.nix existe déjà
cd /etc/nixos
if [[ -f "flake.nix" ]]; then
    log_warning "flake.nix existe déjà"
    echo ""
    log_info "Contenu actuel :"
    cat flake.nix
    echo ""
    read -p "Voulez-vous le remplacer ? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Migration annulée. Voici ce que vous devez ajouter manuellement :"
        echo ""
        echo "1. Ajouter l'input j12z :"
        echo "   inputs.j12z = {"
        echo "     url = \"github:JeremieAlcaraz/j12zdotcom\";"
        echo "     inputs.nixpkgs.follows = \"nixpkgs\";"
        echo "   };"
        echo ""
        echo "2. Importer le module :"
        echo "   modules = ["
        echo "     j12z.nixosModules.default"
        echo "     # ..."
        echo "   ];"
        echo ""
        echo "3. Activer le service :"
        echo "   services.j12z-webserver = {"
        echo "     enable = true;"
        echo "     siteRoot = j12z.packages.x86_64-linux.site;"
        echo "   };"
        exit 0
    fi
fi

# Étape 3 : Créer la nouvelle flake
log_info "📝 Création de la nouvelle flake.nix..."

if [[ $DRY_RUN == false ]]; then
    cat > /etc/nixos/flake.nix << 'EOF'
{
  description = "Infrastructure NixOS - Serveur mimosa";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    j12z = {
      url = "github:JeremieAlcaraz/j12zdotcom";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, j12z }: {
    nixosConfigurations.mimosa = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        ./hardware-configuration.nix
        j12z.nixosModules.default
        ./configuration.nix
      ];
    };
  };
}
EOF
    log_success "flake.nix créée"
else
    log_info "[DRY-RUN] flake.nix serait créée"
fi

# Étape 4 : Ajouter la configuration du service
log_info "⚙️  Ajout de la configuration j12z-webserver..."

SERVICE_CONFIG='
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Configuration j12zdotcom (via module NixOS)
# Remplace le script deploy-j12zdotcom.sh
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
services.j12z-webserver = {
  enable = true;
  domain = "jeremiealcaraz.com";
  wwwDomain = "www.jeremiealcaraz.com";
  email = "hello@jeremiealcaraz.com";

  # Le site est buildé automatiquement par Nix
  siteRoot = j12z.packages.x86_64-linux.site;

  # Cloudflare Tunnel
  enableCloudflaredTunnel = true;
  cloudflaredTokenFile = "/run/secrets/cloudflare-token";
};
'

if [[ $DRY_RUN == false ]]; then
    # Vérifier si déjà présent
    if ! grep -q "services.j12z-webserver" configuration.nix 2>/dev/null; then
        echo "$SERVICE_CONFIG" >> /etc/nixos/configuration.nix
        log_success "Configuration j12z-webserver ajoutée à configuration.nix"
    else
        log_warning "Configuration j12z-webserver déjà présente dans configuration.nix"
    fi
else
    log_info "[DRY-RUN] Configuration serait ajoutée à configuration.nix"
fi

# Étape 5 : Vérifier la configuration
log_info "🔍 Vérification de la configuration..."

if [[ $DRY_RUN == false ]]; then
    if nixos-rebuild dry-build --flake /etc/nixos#mimosa; then
        log_success "Configuration valide !"
    else
        log_error "La configuration contient des erreurs"
        log_warning "Restaurer le backup avec : sudo cp -r $BACKUP_DIR/* /etc/nixos/"
        exit 1
    fi
else
    log_info "[DRY-RUN] Vérification serait effectuée"
fi

# Résumé
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "Migration préparée avec succès !"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ $DRY_RUN == false ]]; then
    log_info "📋 Prochaines étapes :"
    echo ""
    echo "1. Vérifier que le token Cloudflare est présent :"
    echo "   cat /run/secrets/cloudflare-token"
    echo ""
    echo "2. Appliquer la nouvelle configuration :"
    echo "   sudo nixos-rebuild switch --flake /etc/nixos#mimosa"
    echo ""
    echo "3. Vérifier que tout fonctionne :"
    echo "   systemctl status caddy"
    echo "   systemctl status cloudflared"
    echo "   curl https://jeremiealcaraz.com"
    echo ""
    echo "4. Si tout fonctionne, supprimer l'ancien workflow :"
    echo "   sudo rm -rf /var/www/j12zdotcom"
    echo "   sudo rm scripts/deploy-j12zdotcom.sh"
    echo ""
    log_info "📦 Backup disponible dans : $BACKUP_DIR"
else
    log_info "Pour appliquer les changements, relancez sans --dry-run"
fi
