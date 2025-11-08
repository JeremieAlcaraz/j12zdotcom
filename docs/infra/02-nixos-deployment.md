# NixOS - Guide de déploiement

## 🎯 Objectif

Déployer le site **jeremiealcaraz.com** sur un serveur NixOS en utilisant la flake du projet.

---

## 📋 Prérequis

### Sur ton serveur

- **NixOS 24.05+** installé
- **Flakes activés** dans la configuration
- **SSH** configuré
- **Accès root** (ou sudo)

### Sur ta machine de développement

- **Nix** installé avec flakes activés
- **SSH** configuré vers le serveur
- **Git** pour cloner le repo

---

## 🚀 Étape 1 : Préparer le serveur NixOS

### 1.1. Activer les flakes sur le serveur

Si pas déjà fait, ajoute ceci à `/etc/nixos/configuration.nix` :

```nix
{ config, pkgs, ... }:

{
  # Activer les flakes
  nix.settings.experimental-features = [ "nix-command" "flakes" ];

  # Autoriser ton utilisateur à utiliser Nix
  nix.settings.trusted-users = [ "root" "@wheel" ];

  # Autres configs de base...
  networking.hostName = "jeremie-web";  # Nom de l'hôte

  # Activer SSH
  services.openssh = {
    enable = true;
    settings.PermitRootLogin = "prohibit-password";
  };

  # Firewall (sera configuré par le module j12z-webserver)
  networking.firewall.enable = true;
}
```

Applique :
```bash
nixos-rebuild switch
```

---

## 🏗️ Étape 2 : Configuration NixOS avec le module du site

### 2.1. Structure du flake système

Sur le **serveur**, crée un flake système qui importe le module du site :

```bash
# Sur le serveur
mkdir -p /etc/nixos
cd /etc/nixos
```

Crée `/etc/nixos/flake.nix` :

```nix
{
  description = "Configuration NixOS du serveur web";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";

    # Import du site depuis GitHub
    j12z-site = {
      url = "github:JeremieAlcaraz/j12zdotcom";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, j12z-site, ... }:
    {
      nixosConfigurations = {
        # Configuration du serveur web
        jeremie-web = nixpkgs.lib.nixosSystem {
          system = "x86_64-linux";
          modules = [
            # Configuration matérielle (généré à l'install)
            ./hardware-configuration.nix

            # Configuration de base
            ./configuration.nix

            # Module du site
            j12z-site.nixosModules.j12z-webserver

            # Configuration spécifique au site
            {
              services.j12z-webserver = {
                enable = true;
                domain = "jeremiealcaraz.com";
                wwwDomain = "www.jeremiealcaraz.com";
                email = "hello@jeremiealcaraz.com";

                # Activer le tunnel Cloudflare
                enableCloudflaredTunnel = true;
                cloudflaredTokenFile = "/run/secrets/cloudflare-tunnel-token";
              };
            }
          ];
        };
      };
    };
}
```

### 2.2. Créer le fichier secret du tunnel

```bash
# Sur le serveur
sudo mkdir -p /run/secrets
sudo nano /run/secrets/cloudflare-tunnel-token
# Colle ton token : eyJhIjoiYmMxZ...

sudo chmod 600 /run/secrets/cloudflare-tunnel-token
sudo chown root:root /run/secrets/cloudflare-tunnel-token
```

### 2.3. Déployer

```bash
# Sur le serveur
cd /etc/nixos
nixos-rebuild switch --flake .#jeremie-web
```

**Ce qui se passe** :
1. Nix clone le repo `j12zdotcom` depuis GitHub
2. Build le site Astro → `/nix/store/xxx-j12zdotcom/`
3. Configure Caddy avec le site
4. Active le service `cloudflared`
5. Ouvre les ports firewall (80, 443)
6. Démarre les services

---

## 🌐 Étape 3 : Vérification

### 3.1. Vérifier les services

```bash
# Caddy
sudo systemctl status caddy
# Doit afficher : active (running)

# Cloudflared
sudo systemctl status cloudflared
# Doit afficher : active (running)

# Firewall
sudo iptables -L | grep -E '80|443'
# Doit montrer les ports ouverts
```

### 3.2. Tester en local

```bash
# Sur le serveur
curl -I http://localhost
# Doit retourner : HTTP/1.1 200 OK

# Vérifier le contenu
curl http://localhost | head -20
# Doit afficher le HTML du site
```

### 3.3. Vérifier le tunnel Cloudflare

1. Va sur https://one.dash.cloudflare.com
2. **Zero Trust** → **Networks** → **Tunnels**
3. Ton tunnel doit être **HEALTHY** (vert)

### 3.4. Tester depuis Internet

```bash
# Depuis ta machine locale
curl -I https://jeremiealcaraz.com

# Doit retourner :
# HTTP/2 200
# server: cloudflare
# ...
```

---

## 🔄 Étape 4 : Mise à jour du site

### 4.1. Déploiement depuis ta machine locale

Tu peux déployer directement depuis ton laptop sans SSH sur le serveur :

```bash
# Sur ton laptop
cd ~/projects/j12zdotcom

# Modifie le code...
git add .
git commit -m "Update site"
git push

# Déploie sur le serveur
nixos-rebuild switch \
  --flake github:JeremieAlcaraz/j12zdotcom#jeremie-web \
  --target-host root@ton-serveur.com \
  --build-host root@ton-serveur.com
```

**Ce qui se passe** :
1. Nix clone la dernière version depuis GitHub
2. Build le nouveau site
3. Bascule atomiquement vers la nouvelle version
4. Recharge Caddy (sans downtime)

### 4.2. Déploiement depuis le serveur

```bash
# Sur le serveur
cd /etc/nixos
nixos-rebuild switch --flake .#jeremie-web --recreate-lock-file

# --recreate-lock-file force la mise à jour de flake.lock
```

### 4.3. Rollback si problème

```bash
# Sur le serveur
nixos-rebuild switch --rollback

# OU choisir une génération spécifique
nixos-rebuild list-generations
nixos-rebuild switch --switch-generation 42
```

---

## 🔐 Étape 5 : Sécuriser (recommandé)

### 5.1. Utiliser sops-nix pour les secrets

Au lieu de stocker le token en clair, utilise **sops-nix** :

1. Installe sops-nix dans ton flake :

```nix
{
  inputs = {
    # ...
    sops-nix.url = "github:Mic92/sops-nix";
  };

  outputs = { self, nixpkgs, j12z-site, sops-nix, ... }: {
    nixosConfigurations.jeremie-web = nixpkgs.lib.nixosSystem {
      modules = [
        # ...
        sops-nix.nixosModules.sops

        {
          # Configuration sops
          sops.defaultSopsFile = ./secrets.yaml;
          sops.secrets.cloudflare-tunnel-token = {
            owner = "cloudflared";
          };

          # Utilise le secret dans le service
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
# Sur ton laptop
cd /etc/nixos
sops secrets.yaml
```

Ajoute :
```yaml
cloudflare-tunnel-token: eyJhIjoiYmMxZ...
```

---

## 📊 Étape 6 : Monitoring

### 6.1. Logs

```bash
# Logs Caddy en temps réel
journalctl -u caddy -f

# Logs cloudflared
journalctl -u cloudflared -f

# Filtrer les erreurs
journalctl -u caddy -p err -n 50

# Logs depuis boot
journalctl -u caddy -b
```

### 6.2. Statistiques

```bash
# Utilisation des services
systemd-cgtop

# Espace disque /nix/store
du -sh /nix/store

# Nettoyer les anciennes générations
nix-collect-garbage --delete-older-than 30d
```

---

## 🧪 Déploiement de développement (optionnel)

Tu peux avoir un environnement de dev sur le même serveur :

```nix
{
  services.j12z-webserver-dev = {
    enable = true;
    domain = "dev.jeremiealcaraz.com";
    # ...
  };
}
```

Crée un deuxième Public Hostname dans Cloudflare Tunnel pointant vers `dev.jeremiealcaraz.com`.

---

## 🚀 CI/CD avec GitHub Actions

Automatise le déploiement avec GitHub Actions :

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
        run: nix build

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

## 🛠️ Commandes utiles

```bash
# Lister les générations NixOS
nixos-rebuild list-generations

# Nettoyer les anciennes générations
nix-collect-garbage --delete-older-than 7d

# Vérifier la config avant de l'appliquer
nixos-rebuild dry-build --flake .#jeremie-web

# Voir les différences entre générations
nix store diff-closures /nix/var/nix/profiles/system-{41,42}-link

# Reconstruire sans redémarrer les services
nixos-rebuild test --flake .#jeremie-web

# Activer au prochain boot (sans changer maintenant)
nixos-rebuild boot --flake .#jeremie-web
```

---

## 🐛 Troubleshooting

### Le site ne build pas

```bash
# Essayer de builder localement
nix build --show-trace

# Vérifier les logs de build
nix log /nix/store/xxx-j12zdotcom
```

### Caddy ne démarre pas

```bash
# Vérifier la config
caddy validate --config /etc/caddy/Caddyfile

# Voir les erreurs
journalctl -u caddy -n 100

# Tester manuellement
sudo -u caddy caddy run --config /etc/caddy/Caddyfile
```

### Cloudflared ne se connecte pas

```bash
# Vérifier le token
cat /run/secrets/cloudflare-tunnel-token

# Tester manuellement
cloudflared tunnel run --token $(cat /run/secrets/cloudflare-tunnel-token)

# Voir les logs
journalctl -u cloudflared -n 100
```

### Erreur de permissions

```bash
# Vérifier les permissions du token
ls -la /run/secrets/cloudflare-tunnel-token

# Doit être : -rw------- root root
```

---

## 📚 Ressources

- [NixOS Manual - Deployment](https://nixos.org/manual/nixos/stable/#sec-deploying)
- [Nix Flakes](https://nixos.wiki/wiki/Flakes)
- [systemctl cheatsheet](https://www.freedesktop.org/software/systemd/man/systemctl.html)
- [Caddy on NixOS](https://search.nixos.org/options?query=services.caddy)

---

## ✅ Checklist de déploiement

- [ ] NixOS installé avec flakes activés
- [ ] SSH configuré vers le serveur
- [ ] Flake système créé (`/etc/nixos/flake.nix`)
- [ ] Token Cloudflare stocké dans `/run/secrets/`
- [ ] `nixos-rebuild switch` réussi
- [ ] Services `caddy` et `cloudflared` actifs
- [ ] Tunnel Cloudflare HEALTHY
- [ ] Site accessible depuis Internet
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Monitoring configuré
- [ ] CI/CD configuré (optionnel)
- [ ] Backups configurés
