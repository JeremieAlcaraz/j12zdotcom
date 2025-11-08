# 🔷 Guide Nix/NixOS - j12zdotcom

Ce document explique comment utiliser la configuration Nix de ce projet pour :
- **Développer** le site localement avec un environnement reproductible
- **Builder** le site avec Nix
- **Déployer** sur un serveur NixOS

---

## 🚀 Quick Start

### Développement local

```bash
# Entrer dans le shell de développement
nix develop

# Lancer le serveur de dev Astro
pnpm dev

# Ou directement via Nix
nix run .#dev
```

### Build du site

```bash
# Builder le site avec Nix
nix build

# Le résultat est dans ./result/
ls -la result/

# Voir où c'est vraiment stocké
readlink result
# → /nix/store/abc123-j12zdotcom/
```

### Déploiement sur NixOS

```bash
# Déployer sur un serveur NixOS
nixos-rebuild switch \
  --flake .#jeremie-web \
  --target-host root@ton-serveur.com \
  --build-host root@ton-serveur.com
```

---

## 📦 Structure de la flake

### Outputs disponibles

#### 1. `packages.default` - Site buildé

```bash
nix build
# → ./result/ contient le site statique (dist/)
```

#### 2. `devShells.default` - Environnement de développement

```bash
nix develop
# Fournit : Node.js 20, pnpm, sharp, git, docker
```

#### 3. `apps.dev` - Lancer le serveur de dev

```bash
nix run .#dev
# Équivalent à : pnpm dev
```

#### 4. `apps.build` - Builder le site

```bash
nix run .#build
# Équivalent à : pnpm build
```

#### 5. `nixosModules.j12z-webserver` - Module NixOS

Import dans ta configuration NixOS :

```nix
{
  inputs.j12z-site.url = "github:JeremieAlcaraz/j12zdotcom";

  outputs = { nixpkgs, j12z-site, ... }: {
    nixosConfigurations.jeremie-web = nixpkgs.lib.nixosSystem {
      modules = [
        j12z-site.nixosModules.j12z-webserver
        {
          services.j12z-webserver.enable = true;
        }
      ];
    };
  };
}
```

---

## 🛠️ Options du module NixOS

### Configuration minimale

```nix
{
  services.j12z-webserver = {
    enable = true;
  };
}
```

Cela active :
- Caddy sur ports 80/443
- Serveur du site statique
- Headers de sécurité
- Compression (gzip, zstd)
- Logs JSON

### Configuration complète

```nix
{
  services.j12z-webserver = {
    enable = true;

    # Domaines
    domain = "jeremiealcaraz.com";          # Domaine principal
    wwwDomain = "www.jeremiealcaraz.com";   # Alias (redirige vers domain)

    # Email pour Let's Encrypt
    email = "hello@jeremiealcaraz.com";

    # Cloudflare Tunnel (optionnel)
    enableCloudflaredTunnel = true;
    cloudflaredTokenFile = "/run/secrets/cloudflare-tunnel-token";

    # Chemin custom du site (optionnel)
    # siteRoot = /path/to/custom/build;
  };
}
```

---

## 🌐 Déploiement NixOS

### Configuration serveur

Sur ton serveur NixOS, crée `/etc/nixos/flake.nix` :

```nix
{
  description = "Configuration NixOS du serveur web";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    j12z-site = {
      url = "github:JeremieAlcaraz/j12zdotcom";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, j12z-site, ... }: {
    nixosConfigurations.jeremie-web = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        ./hardware-configuration.nix
        ./configuration.nix

        # Import du module du site
        j12z-site.nixosModules.j12z-webserver

        # Configuration du site
        {
          services.j12z-webserver = {
            enable = true;
            domain = "jeremiealcaraz.com";
            wwwDomain = "www.jeremiealcaraz.com";
            email = "hello@jeremiealcaraz.com";

            enableCloudflaredTunnel = true;
            cloudflaredTokenFile = "/run/secrets/cloudflare-tunnel-token";
          };

          # Activer flakes
          nix.settings.experimental-features = [ "nix-command" "flakes" ];

          # SSH
          services.openssh.enable = true;

          # Firewall géré par le module
        }
      ];
    };
  };
}
```

### Déployer

```bash
# Depuis le serveur
cd /etc/nixos
sudo nixos-rebuild switch --flake .#jeremie-web

# Ou depuis ton laptop
nixos-rebuild switch \
  --flake /etc/nixos#jeremie-web \
  --target-host root@ton-serveur.com \
  --build-host root@ton-serveur.com
```

---

## 🔐 Gestion du token Cloudflare

### Méthode simple (fichier)

```bash
# Sur le serveur
sudo mkdir -p /run/secrets
echo "eyJhIjoiYmMxZ..." | sudo tee /run/secrets/cloudflare-tunnel-token
sudo chmod 600 /run/secrets/cloudflare-tunnel-token
```

### Méthode sécurisée (sops-nix)

1. Ajoute sops-nix à ton flake :

```nix
{
  inputs.sops-nix.url = "github:Mic92/sops-nix";

  outputs = { sops-nix, ... }: {
    nixosConfigurations.jeremie-web = {
      modules = [
        sops-nix.nixosModules.sops
        {
          sops.defaultSopsFile = ./secrets.yaml;
          sops.secrets.cloudflare-tunnel-token = { };

          services.j12z-webserver = {
            cloudflaredTokenFile = config.sops.secrets.cloudflare-tunnel-token.path;
          };
        }
      ];
    };
  };
}
```

2. Crée `secrets.yaml` chiffré :

```bash
sops secrets.yaml
```

---

## 🔄 Workflow de développement

### 1. Développer localement

```bash
# Entrer dans l'environnement Nix
nix develop

# Ou avec direnv (si configuré)
# cd j12zdotcom/  → auto-charge l'environnement

# Lancer le serveur de dev
pnpm dev
```

### 2. Tester le build Nix

```bash
# Builder avec Nix
nix build

# Vérifier le résultat
ls -la result/
```

### 3. Pousser sur Git

```bash
git add .
git commit -m "feat: nouvelle feature"
git push
```

### 4. Déployer sur le serveur

```bash
# Option 1 : Depuis le serveur
ssh root@ton-serveur.com
cd /etc/nixos
nixos-rebuild switch --flake .#jeremie-web --recreate-lock-file

# Option 2 : Depuis ton laptop
nixos-rebuild switch \
  --flake github:JeremieAlcaraz/j12zdotcom#jeremie-web \
  --target-host root@ton-serveur.com
```

### 5. Rollback si problème

```bash
# Sur le serveur
nixos-rebuild switch --rollback

# Ou choisir une génération spécifique
nixos-rebuild list-generations
nixos-rebuild switch --switch-generation 42
```

---

## 🐛 Debugging

### Build ne passe pas

```bash
# Voir les erreurs détaillées
nix build --show-trace

# Voir les logs d'un build précédent
nix log /nix/store/xxx-j12zdotcom
```

### Service ne démarre pas sur NixOS

```bash
# Voir les logs Caddy
journalctl -u caddy -n 100 -f

# Voir les logs cloudflared
journalctl -u cloudflared -n 100 -f

# Vérifier la config générée
systemctl cat caddy
systemctl cat cloudflared

# Tester la config Caddy
caddy validate --config /etc/caddy/Caddyfile
```

### Environnement de dev ne marche pas

```bash
# Vérifier les inputs de la flake
nix flake show

# Mettre à jour les inputs
nix flake update

# Recréer l'environnement
nix develop --recreate-lock-file
```

---

## 📚 Commandes utiles

### Flake

```bash
# Afficher les outputs
nix flake show

# Mettre à jour les inputs
nix flake update

# Verrouiller un input spécifique
nix flake lock --update-input nixpkgs

# Vérifier la flake
nix flake check
```

### Build

```bash
# Builder
nix build

# Builder avec logs
nix build -L

# Forcer un rebuild
nix build --rebuild
```

### Nettoyage

```bash
# Nettoyer les anciennes générations
nix-collect-garbage --delete-older-than 7d

# Nettoyer agressivement (garde seulement la génération actuelle)
nix-collect-garbage -d

# Voir l'espace pris par le store
du -sh /nix/store
```

---

## 🌍 Environnements multiples

Tu peux définir plusieurs configurations NixOS dans la même flake :

```nix
{
  outputs = { ... }: {
    nixosConfigurations = {
      # Production
      jeremie-web-prod = nixpkgs.lib.nixosSystem {
        modules = [
          j12z-site.nixosModules.j12z-webserver
          {
            services.j12z-webserver.domain = "jeremiealcaraz.com";
          }
        ];
      };

      # Staging
      jeremie-web-staging = nixpkgs.lib.nixosSystem {
        modules = [
          j12z-site.nixosModules.j12z-webserver
          {
            services.j12z-webserver.domain = "staging.jeremiealcaraz.com";
          }
        ];
      };
    };
  };
}
```

Déployer :

```bash
# Prod
nixos-rebuild switch --flake .#jeremie-web-prod --target-host root@prod.com

# Staging
nixos-rebuild switch --flake .#jeremie-web-staging --target-host root@staging.com
```

---

## 🔗 Intégration CI/CD

### GitHub Actions

`.github/workflows/deploy.yml` :

```yaml
name: Deploy to NixOS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: cachix/install-nix-action@v24
        with:
          extra_nix_config: |
            experimental-features = nix-command flakes

      - name: Build site
        run: nix build -L

      - name: Deploy to server
        env:
          SSH_KEY: ${{ secrets.SSH_DEPLOY_KEY }}
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519

          nixos-rebuild switch \
            --flake .#jeremie-web \
            --target-host root@ton-serveur.com \
            --build-host localhost
```

---

## 📖 Documentation complète

Voir les guides détaillés dans `/docs/infra/` :

- **[01-nixos-overview.md](./docs/infra/01-nixos-overview.md)** - Vue d'ensemble et architecture
- **[02-nixos-deployment.md](./docs/infra/02-nixos-deployment.md)** - Guide de déploiement pas à pas
- **[03-nixos-vs-docker.md](./docs/infra/03-nixos-vs-docker.md)** - Comparaison Docker vs NixOS

---

## 🆘 Support

### Problèmes courants

**"error: experimental feature 'flakes' is disabled"**
```bash
# Activer les flakes globalement
mkdir -p ~/.config/nix
echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
```

**"error: getting status of '/nix/store/...': No such file or directory"**
```bash
# Nettoyer et rebuild
nix-collect-garbage -d
nix build --rebuild
```

**"error: access to URI 'github:...' is forbidden in restricted mode"**
```bash
# Builder sans sandbox (développement uniquement)
nix build --impure
```

### Ressources

- [Nix Manual](https://nixos.org/manual/nix/stable/)
- [NixOS Manual](https://nixos.org/manual/nixos/stable/)
- [Nix Flakes](https://nixos.wiki/wiki/Flakes)
- [NixOS Discourse](https://discourse.nixos.org/)

---

## 🎉 C'est tout !

Tu as maintenant :
- ✅ Une flake pour builder ton site
- ✅ Un module NixOS pour le déployer
- ✅ Un environnement de dev reproductible
- ✅ Une configuration déclarative et versionnée
- ✅ Un système de rollback natif

**Bienvenue dans le monde Nix ! 🔷**
