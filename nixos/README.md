# Module NixOS pour j12zdotcom

Ce dossier contient le module NixOS pour déployer le site j12zdotcom en production.

## Pourquoi séparé ?

Le `flake.nix` à la racine est responsable du **build** du site web (Astro).
Ce module est responsable du **déploiement** sur un serveur NixOS.

Séparation des responsabilités = code plus propre et maintenable.

## Utilisation

### Dans votre configuration NixOS

```nix
# configuration.nix ou flake.nix de votre serveur
{
  imports = [
    /path/to/j12zdotcom/nixos/module.nix
  ];

  services.j12z-webserver = {
    enable = true;
    domain = "jeremiealcaraz.com";
    wwwDomain = "www.jeremiealcaraz.com";
    email = "hello@jeremiealcaraz.com";

    # Pointer vers le site buildé
    siteRoot = (import /path/to/j12zdotcom).packages.x86_64-linux.site;

    # Optionnel : Cloudflare Tunnel
    enableCloudflaredTunnel = false;
    cloudflaredTokenFile = null;
  };
}
```

### Avec une flake infrastructure séparée (recommandé)

```nix
# infra/flake.nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    j12z = {
      url = "github:JeremieAlcaraz/j12zdotcom";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, j12z }: {
    nixosConfigurations.server = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        ./hardware-configuration.nix
        j12z.nixosModules.default  # Si exporté depuis la flake
        # OU directement :
        "${j12z}/nixos/module.nix"

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

## Configuration du module

### Options disponibles

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `enable` | bool | false | Activer le service |
| `domain` | string | "jeremiealcaraz.com" | Domaine principal |
| `wwwDomain` | string | "www.jeremiealcaraz.com" | Alias www |
| `email` | string | "hello@jeremiealcaraz.com" | Email pour SSL |
| `siteRoot` | path | - | Chemin vers le site buildé |
| `enableCloudflaredTunnel` | bool | false | Activer tunnel Cloudflare |
| `cloudflaredTokenFile` | path? | null | Token Cloudflare |

### Ce que le module configure

- ✅ **Caddy** : Serveur web avec HTTPS automatique (Let's Encrypt)
- ✅ **Firewall** : Ports 80, 443 TCP + 443 UDP (HTTP/3)
- ✅ **Headers de sécurité** : CSP, XSS Protection, etc.
- ✅ **Compression** : gzip + zstd
- ✅ **Logs** : JSON, rotation automatique
- ✅ **404 personnalisée** : Redirige vers /404.html
- ✅ **Cloudflare Tunnel** (optionnel) : Pour contourner les NAT/firewalls

## Déploiement

```bash
# Build du site localement
nix build

# Rebuild sur le serveur (si accès SSH)
nixos-rebuild switch --flake .#server --target-host user@server
```

## Migration future

Si vous créez un dépôt infrastructure séparé, vous pouvez :
1. Déplacer ce dossier `nixos/` vers votre dépôt infra
2. Importer la flake j12zdotcom pour obtenir le site buildé
3. Garder séparé : code applicatif vs infrastructure

Exemple d'architecture :
```
j12zdotcom/          # Repo applicatif
└── flake.nix        # Build du site

infra-nixos/         # Repo infrastructure (nouveau)
├── flake.nix        # Importe j12zdotcom
└── modules/
    └── j12z.nix     # Module NixOS (ce fichier)
```
