# Guide de déploiement avec repo infrastructure

Ce guide montre comment utiliser ce projet dans un dépôt infrastructure séparé.

## 🏗️ Architecture recommandée

```
j12zdotcom/              # Repo applicatif (ce projet)
├── flake.nix            # Build du site Astro
├── src/                 # Code source du site
└── nixos/
    ├── module.nix       # Module NixOS
    └── example-*.nix    # Exemples

infra-nixos/             # Repo infrastructure (à créer)
├── flake.nix            # Import j12zdotcom + config serveurs
├── hardware/
│   └── webserver.nix    # Hardware config du serveur
└── secrets/
    └── cloudflare-token # Token Cloudflare (si utilisé)
```

## 📦 Étape 1 : Créer le repo infrastructure

```bash
# Créer un nouveau dépôt
mkdir infra-nixos
cd infra-nixos
git init

# Initialiser la flake
nix flake init
```

## 📝 Étape 2 : Configurer la flake

Copie le contenu de `example-infra-flake.nix` dans `flake.nix` :

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    j12z = {
      url = "github:JeremieAlcaraz/j12zdotcom";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, j12z }: {
    nixosConfigurations.webserver = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        ./hardware/webserver.nix
        j12z.nixosModules.default
        {
          services.j12z-webserver = {
            enable = true;
            siteRoot = j12z.packages.x86_64-linux.site;
          };
        }
      ];
    };
  };
}
```

## 🖥️ Étape 3 : Générer la config hardware (sur le serveur)

```bash
# SSH sur le serveur
ssh root@your-server

# Générer la configuration hardware
nixos-generate-config --root /mnt

# Récupérer le fichier
scp root@your-server:/mnt/etc/nixos/hardware-configuration.nix ./hardware/webserver.nix
```

## 🚀 Étape 4 : Déployer

### Option A : Depuis ta machine locale (nixos-rebuild)

```bash
# Build et deploy en une commande
nixos-rebuild switch \
  --flake .#webserver \
  --target-host root@your-server \
  --build-host localhost
```

### Option B : Sur le serveur directement

```bash
# Cloner le repo infra sur le serveur
git clone https://github.com/ton-user/infra-nixos /etc/nixos/config

# Rebuild
cd /etc/nixos/config
nixos-rebuild switch --flake .#webserver
```

### Option C : Avec deploy-rs (recommandé pour la prod)

```bash
# Installer deploy-rs
nix profile install nixpkgs#deploy-rs

# Ajouter à ta flake
outputs = { self, nixpkgs, j12z, deploy-rs }: {
  deploy.nodes.webserver = {
    hostname = "your-server.com";
    profiles.system = {
      user = "root";
      path = deploy-rs.lib.x86_64-linux.activate.nixos
        self.nixosConfigurations.webserver;
    };
  };
};

# Déployer
deploy .#webserver
```

## 🔄 Mettre à jour le site

### Méthode 1 : Via le repo infra

```bash
cd infra-nixos

# Mettre à jour l'input j12z vers la dernière version
nix flake update j12z

# Rebuild
nixos-rebuild switch --flake .#webserver --target-host root@your-server
```

### Méthode 2 : Pin une version spécifique

```nix
# Dans infra-nixos/flake.nix
inputs.j12z = {
  url = "github:JeremieAlcaraz/j12zdotcom?ref=v1.2.3";  # Tag spécifique
  # OU
  url = "github:JeremieAlcaraz/j12zdotcom?rev=abc123";  # Commit spécifique
};
```

## 🔒 Gestion des secrets (Cloudflare Tunnel)

### Avec agenix (recommandé)

```nix
# infra-nixos/flake.nix
inputs.agenix.url = "github:ryantm/agenix";

# Dans la configuration
{
  imports = [ agenix.nixosModules.default ];

  age.secrets.cloudflare-token = {
    file = ./secrets/cloudflare-token.age;
    owner = "cloudflared";
  };

  services.j12z-webserver = {
    enable = true;
    enableCloudflaredTunnel = true;
    cloudflaredTokenFile = config.age.secrets.cloudflare-token.path;
  };
}
```

### Sans gestionnaire de secrets (simple)

```bash
# Sur le serveur
echo "votre-token" > /run/secrets/cloudflare-token
chmod 600 /run/secrets/cloudflare-token
```

```nix
services.j12z-webserver = {
  enableCloudflaredTunnel = true;
  cloudflaredTokenFile = "/run/secrets/cloudflare-token";
};
```

## 📊 Vérification

```bash
# Vérifier que Caddy tourne
systemctl status caddy

# Vérifier les logs
journalctl -u caddy -f

# Tester le site
curl https://jeremiealcaraz.com
```

## 🔧 Développement local du site

Pour développer le site localement (sans infrastructure) :

```bash
cd j12zdotcom
nix develop     # Entre dans le devShell
pnpm dev        # Lance le dev server
```

Le build Nix du site :
```bash
cd j12zdotcom
nix build       # Build dans ./result
firefox ./result/index.html
```

## 📚 Ressources

- [Flakes NixOS](https://nixos.wiki/wiki/Flakes)
- [deploy-rs](https://github.com/serokell/deploy-rs)
- [agenix](https://github.com/ryantm/agenix)
- [NixOS Manual](https://nixos.org/manual/nixos/stable/)
