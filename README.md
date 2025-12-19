# j12zdotcom

Site personnel de Jérémie Alcaraz - Portfolio et blog sur la productivité et l'organisation douce 🫶🌸

## 🚀 Tech Stack

- **Framework**: Astro 5.7.8 (SSG)
- **UI**: React 19 + Svelte 5 + Tailwind CSS 4
- **Content**: MDX
- **Deployment**: Cloudflare Tunnel + Caddy + Serveur Maison

## 🛠️ Installation

```bash
# Installer les dépendances
pnpm install

# Lancer le serveur de dev
pnpm dev

# Builder pour la production
pnpm build
```

## 📜 Scripts principaux

```bash
pnpm dev          # Serveur de développement (port 4321)
pnpm build        # Build production
pnpm lint         # Linter ESLint
pnpm format       # Format avec Prettier
pnpm img:opt      # Optimiser les images
```

## 🚀 Déploiement

Déploiement avec NixOS :

```bash
nix build
sudo nixos-rebuild switch --flake .#jeremie-web
```

Voir [DEPLOYMENT.md](./docs/DEPLOYMENT.md) et [INFRASTRUCTURE.md](./docs/INFRASTRUCTURE.md) pour les détails.

## 📚 Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Architecture et principes du code
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Guide de déploiement NixOS
- **[INFRASTRUCTURE.md](./docs/INFRASTRUCTURE.md)** - Infrastructure et stack technique
- **[AGENTS.md](./docs/AGENTS.md)** - Guide pour les agents IA

## 📄 Licence

MIT © Jérémie Alcaraz
