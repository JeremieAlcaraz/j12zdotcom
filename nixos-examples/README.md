# Exemples de configuration NixOS

Ce dossier contient des exemples de configuration pour déployer le site sur NixOS.

## 📁 Fichiers

### `server-flake.nix`

Exemple complet de configuration NixOS pour déployer le site en production.

**Où l'utiliser** : `/etc/nixos/flake.nix` sur votre serveur

**Contient** :
- Configuration système de base
- Import du module `j12z-webserver`
- Configuration SSH
- Garbage collection automatique
- Mises à jour automatiques

## 🚀 Guide d'utilisation

### 1. Préparer le serveur

```bash
# Se connecter au serveur
ssh root@ton-serveur.com

# Activer les flakes (si pas déjà fait)
mkdir -p ~/.config/nix
echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
```

### 2. Copier la configuration

```bash
# Sur le serveur
cd /etc/nixos

# Sauvegarder l'ancienne config (si elle existe)
cp configuration.nix configuration.nix.backup

# Copier l'exemple
curl -o flake.nix https://raw.githubusercontent.com/JeremieAlcaraz/j12zdotcom/main/nixos-examples/server-flake.nix

# OU copier manuellement depuis ce repo
```

### 3. Adapter la configuration

Éditer `/etc/nixos/flake.nix` et modifier :

```nix
{
  # Votre nom d'hôte
  networking.hostName = "jeremie-web";

  # Votre timezone
  time.timeZone = "Europe/Paris";

  # Vos clés SSH
  users.users.jeremie.openssh.authorizedKeys.keys = [
    "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxxx... votre-cle"
  ];

  # Votre domaine
  services.j12z-webserver = {
    domain = "jeremiealcaraz.com";
    email = "hello@jeremiealcaraz.com";
  };
}
```

### 4. Créer le token Cloudflare Tunnel

```bash
# Sur le serveur
sudo mkdir -p /run/secrets

# Créer le fichier avec votre token
sudo nano /run/secrets/cloudflare-tunnel-token
# Collez votre token : eyJhIjoiYmMxZ...

# Sécuriser le fichier
sudo chmod 600 /run/secrets/cloudflare-tunnel-token
sudo chown root:root /run/secrets/cloudflare-tunnel-token
```

### 5. Déployer

```bash
# Sur le serveur
cd /etc/nixos
sudo nixos-rebuild switch --flake .#jeremie-web
```

### 6. Vérifier

```bash
# Vérifier les services
systemctl status caddy
systemctl status cloudflared

# Vérifier les logs
journalctl -u caddy -n 50
journalctl -u cloudflared -n 50

# Tester en local
curl -I http://localhost
```

## 🔄 Mises à jour

### Mettre à jour le site

```bash
# Option 1 : Depuis le serveur
cd /etc/nixos
sudo nixos-rebuild switch --flake .#jeremie-web --recreate-lock-file

# Option 2 : Depuis votre laptop
nixos-rebuild switch \
  --flake github:JeremieAlcaraz/j12zdotcom#jeremie-web \
  --target-host root@ton-serveur.com
```

### Rollback

```bash
# Sur le serveur
sudo nixos-rebuild switch --rollback

# Ou choisir une génération spécifique
sudo nixos-rebuild list-generations
sudo nixos-rebuild switch --switch-generation 42
```

## 🔐 Gestion des secrets avec sops-nix

Pour une gestion plus sécurisée du token Cloudflare :

### 1. Installer sops

```bash
# Sur votre laptop
nix-shell -p sops age
```

### 2. Générer une clé age

```bash
# Sur le serveur
mkdir -p /var/lib/sops-nix
age-keygen -o /var/lib/sops-nix/key.txt
chmod 600 /var/lib/sops-nix/key.txt

# Récupérer la clé publique
age-keygen -y /var/lib/sops-nix/key.txt
# Sortie : age1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Créer le fichier de secrets

```bash
# Sur votre laptop (dans le repo)
cd /etc/nixos

# Créer .sops.yaml
cat > .sops.yaml <<EOF
keys:
  - &server age1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
creation_rules:
  - path_regex: secrets.yaml$
    key_groups:
      - age:
          - *server
EOF

# Créer le fichier de secrets chiffré
sops secrets.yaml
```

Ajouter dans `secrets.yaml` :

```yaml
cloudflare-tunnel-token: eyJhIjoiYmMxZ...
```

### 4. Activer sops-nix dans la flake

Décommenter les sections `sops-nix` dans `server-flake.nix`.

### 5. Redéployer

```bash
sudo nixos-rebuild switch --flake .#jeremie-web
```

## 📚 Documentation

Pour plus d'informations, voir :

- [NIX.md](../NIX.md) - Guide principal Nix
- [docs/infra/01-nixos-overview.md](../docs/infra/01-nixos-overview.md) - Vue d'ensemble
- [docs/infra/02-nixos-deployment.md](../docs/infra/02-nixos-deployment.md) - Déploiement détaillé

## 🆘 Support

En cas de problème, vérifiez :

1. Les logs : `journalctl -u caddy -u cloudflared -f`
2. La configuration générée : `systemctl cat caddy cloudflared`
3. Les issues GitHub : https://github.com/JeremieAlcaraz/j12zdotcom/issues
