# j12zdotcom

Site personnel de Jérémie Alcaraz - Portfolio et blog sur le développement web et la productivité douce.

## 🚀 Tech Stack

- **Framework**: Astro 5.7.8 (SSG)
- **UI**: React 19 + Svelte 5 + Tailwind CSS 4
- **Content**: MDX
- **Deployment**: Cloudflare Tunnel + Caddy

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
nixos-rebuild switch --flake .#jeremie-web
```

Voir [NIX.md](./NIX.md) pour les détails.

## 📚 Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Architecture et principes du code
- **[NIX.md](./NIX.md)** - Guide NixOS et déploiement
- **[AGENTS.md](./docs/AGENTS.md)** - Guide pour les agents IA

## 📄 Licence

MIT © Jérémie Alcaraz
