# Migration : Du script bash vers le module NixOS

## 🔴 Ancienne méthode (ton script actuel)

```bash
./scripts/deploy-j12zdotcom.sh
# 1. Clone le repo dans /tmp
# 2. Build avec pnpm (200+ lignes de logs)
# 3. Copie manuelle vers /var/www/j12zdotcom
# 4. Gestion des permissions
# 5. nixos-rebuild switch
```

**Problèmes :**
- ❌ Build hors de Nix (pas reproductible)
- ❌ Copie manuelle des fichiers (risque d'erreur)
- ❌ Gestion manuelle des permissions
- ❌ Pas de rollback automatique
- ❌ Script complexe à maintenir (250+ lignes)

## 🟢 Nouvelle méthode (avec le module NixOS)

```bash
# C'est tout !
nixos-rebuild switch --flake github:ton-user/infra-nixos#mimosa
```

**Avantages :**
- ✅ Build Nix (reproductible, cachable)
- ✅ Déploiement déclaratif (pas de copie manuelle)
- ✅ Rollback automatique avec `nixos-rebuild switch --rollback`
- ✅ Permissions gérées par Nix
- ✅ Une seule commande

---

## 📋 Comment migrer

### Étape 1 : Créer le repo infrastructure

Dans ton repo `/etc/nixos` (ou créer un nouveau dépôt) :

```nix
# /etc/nixos/flake.nix
{
  description = "Infrastructure NixOS - Serveur mimosa";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";

    # Import de la flake j12zdotcom
    j12z = {
      url = "github:JeremieAlcaraz/j12zdotcom";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, j12z }: {
    nixosConfigurations.mimosa = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        ./hardware-configuration.nix  # Config hardware existante

        # Import du module NixOS depuis j12z
        j12z.nixosModules.default

        # Configuration
        {
          # Hostname
          networking.hostName = "mimosa";

          # Configuration du site (remplace tout ton script !)
          services.j12z-webserver = {
            enable = true;
            domain = "jeremiealcaraz.com";
            wwwDomain = "www.jeremiealcaraz.com";
            email = "hello@jeremiealcaraz.com";

            # Le site buildé vient directement de la flake
            # Nix gère automatiquement le build et le déploiement
            siteRoot = j12z.packages.x86_64-linux.site;

            # Cloudflare Tunnel
            enableCloudflaredTunnel = true;
            cloudflaredTokenFile = "/run/secrets/cloudflare-token";
          };

          # Reste de ta config existante...
          # users, SSH, firewall, etc.
        }
      ];
    };
  };
}
```

### Étape 2 : Supprimer l'ancien workflow

```bash
# Sur mimosa
sudo rm -rf /var/www/j12zdotcom  # Plus besoin, Nix gère ça
sudo rm scripts/deploy-j12zdotcom.sh  # Le script est obsolète
```

**Pourquoi ?** Le module NixOS pointe `siteRoot` vers le résultat du build Nix (dans `/nix/store/...`), pas vers `/var/www/`.

### Étape 3 : Déployer

#### Option A : Depuis mimosa (local)

```bash
cd /etc/nixos
sudo nixos-rebuild switch --flake .#mimosa
```

#### Option B : Depuis magnolia (distant)

```bash
# Build local, deploy sur mimosa
nixos-rebuild switch \
  --flake /etc/nixos#mimosa \
  --target-host mimosa \
  --build-host localhost
```

#### Option C : Utiliser un dépôt Git (recommandé)

```bash
# Sur mimosa ou magnolia
nixos-rebuild switch \
  --flake github:JeremieAlcaraz/infra-nixos#mimosa
```

---

## 🔄 Workflow de mise à jour

### Mettre à jour le site

```bash
# 1. Mettre à jour l'input j12z vers la dernière version
cd /etc/nixos
nix flake update j12z

# 2. Rebuild
sudo nixos-rebuild switch --flake .#mimosa
```

**Ce que Nix fait automatiquement :**
1. ✅ Fetch la dernière version de j12zdotcom
2. ✅ Build le site en mode production
3. ✅ Crée un nouveau lien symbolique dans /nix/store
4. ✅ Recharge Caddy avec le nouveau site
5. ✅ Rollback automatique si ça plante

### Rollback en cas de problème

```bash
# Retour à la version précédente (instantané !)
sudo nixos-rebuild switch --rollback
```

### Pin une version spécifique

```nix
# Dans flake.nix
inputs.j12z = {
  url = "github:JeremieAlcaraz/j12zdotcom?rev=abc123";  # Commit spécifique
};
```

---

## 📊 Comparaison

| Fonctionnalité | Script Bash | Module NixOS |
|----------------|-------------|--------------|
| Build du site | `pnpm build` (non reproductible) | Nix build (reproductible) |
| Déploiement | `rsync` + `sudo cp` | Automatique via Caddy config |
| Permissions | `sudo chown` manuel | Géré par Nix |
| Rollback | ❌ Backup manuel | ✅ Automatique |
| Health checks | Script custom | ✅ systemd + Nix |
| Complexité | 250 lignes bash | 20 lignes Nix |
| Erreurs possibles | Beaucoup (copie, perms, etc.) | Très peu |

---

## 🎯 Script de migration complet

Voici un script pour migrer facilement :

```bash
#!/usr/bin/env bash
# migrate-to-nix-module.sh

set -euo pipefail

echo "🔄 Migration vers le module NixOS j12z-webserver"
echo ""

# 1. Backup de l'ancienne config
echo "📦 Backup de l'ancienne configuration..."
sudo cp -r /etc/nixos /etc/nixos.backup-$(date +%Y%m%d-%H%M%S)

# 2. Ajouter l'input j12z à la flake
echo "📝 Ajout de l'input j12z à la flake..."
cd /etc/nixos

# Créer ou mettre à jour flake.nix
cat > flake.nix.new << 'EOF'
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
        ./configuration.nix  # Ta config existante
      ];
    };
  };
}
EOF

# 3. Ajouter la config du service
cat >> configuration.nix << 'EOF'

# Configuration j12zdotcom (via module NixOS)
services.j12z-webserver = {
  enable = true;
  domain = "jeremiealcaraz.com";
  wwwDomain = "www.jeremiealcaraz.com";
  email = "hello@jeremiealcaraz.com";
  siteRoot = inputs.j12z.packages.x86_64-linux.site;
  enableCloudflaredTunnel = true;
  cloudflaredTokenFile = "/run/secrets/cloudflare-token";
};
EOF

echo "✅ Configuration mise à jour"
echo ""
echo "🚀 Prêt à déployer avec:"
echo "   sudo nixos-rebuild switch --flake .#mimosa"
echo ""
echo "⚠️  Après vérification, vous pourrez supprimer:"
echo "   - /var/www/j12zdotcom"
echo "   - scripts/deploy-j12zdotcom.sh"
```

---

## 🧪 Tester avant de migrer

Si tu veux tester sans casser l'ancien système :

1. **Garde l'ancien script** pour l'instant
2. **Ajoute le module NixOS** avec un domaine de test
3. **Vérifie que tout fonctionne**
4. **Ensuite supprime l'ancien script**

```nix
# Test avec un sous-domaine
services.j12z-webserver = {
  enable = true;
  domain = "test.jeremiealcaraz.com";  # Domaine de test
  siteRoot = j12z.packages.x86_64-linux.site;
};
```

---

## ❓ Questions fréquentes

**Q: Où sont les fichiers du site ?**
R: Dans `/nix/store/xxx-j12zdotcom/`. Caddy lit directement depuis là.

**Q: Comment je nettoie les anciennes versions ?**
R: `nix-collect-garbage -d` (garde uniquement la version actuelle)

**Q: Et si le build plante ?**
R: `nixos-rebuild` n'applique rien et garde l'ancien système actif.

**Q: Je peux garder mon script pour tester en local ?**
R: Oui, mais utilise `nix build` au lieu de `pnpm build` pour la cohérence.

---

## 🎉 Résultat final

Ton workflow de déploiement devient :

```bash
# Avant (250 lignes de bash)
./scripts/deploy-j12zdotcom.sh

# Après (une commande)
nixos-rebuild switch --flake .#mimosa
```

C'est ça la puissance de NixOS ! 🚀
