# j12zdotcom

Site vitrine et blog personnel de Jérémie Alcaraz - Portfolio, formations et articles sur le développement web, la productivité et le bien-être.

## 🚀 Tech Stack

- **Framework**: [Astro 5.7.8](https://astro.build) (SSG)
- **UI Frameworks**: React 19 + Svelte 5
- **Styling**: Tailwind CSS 4 + DaisyUI
- **Content**: MDX avec plugins remark
- **Icons**: Unplugin Icons + Iconify
- **Deployment**: Cloudflare Tunnel + Caddy
- **Package Manager**: pnpm 10.16.1

## 📁 Structure du projet

```
j12zdotcom/
├── src/
│   ├── assets/          # Images, icons, fonts
│   ├── config/          # Configuration site
│   ├── content/         # Contenu MDX (blog, about, etc.)
│   ├── domain/          # Logique métier par feature
│   ├── layouts/         # Layouts de page
│   ├── pages/           # Routes Astro
│   ├── shortcodes/      # Composants MDX
│   ├── styles/          # Styles globaux
│   ├── ui/              # Design System (Atomic Design)
│   │   ├── atoms/       # Composants de base
│   │   ├── molecules/   # Composants composites
│   │   └── organisms/   # Composants complexes
│   └── utils/           # Fonctions utilitaires
├── public/              # Fichiers statiques
├── docs/                # Documentation
│   ├── ARCHITECTURE.md  # Architecture du code
│   ├── INFRASTRUCTURE.md # Infrastructure de déploiement
│   ├── DEPLOYMENT.md    # Guide de déploiement
│   ├── DIAGRAMS.md      # Diagrammes de séquence
│   ├── MIGRATION.md     # Migration Worker → Tunnel
│   └── AGENTS.md        # Guide pour les agents IA
├── Caddyfile            # Config reverse proxy
├── docker-compose.yml   # Orchestration services
└── astro.config.ts      # Configuration Astro
```

## 🛠️ Installation

### Prérequis

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation locale

```bash
# Cloner le projet
git clone https://github.com/JeremieAlcaraz/j12zdotcom.git
cd j12zdotcom

# Installer les dépendances
pnpm install

# Lancer le serveur de dev
pnpm dev

# Ouvrir http://localhost:4321
```

## 📜 Scripts disponibles

### Développement

```bash
pnpm dev          # Lance le serveur de dev (port 4321)
pnpm start        # Alias de dev
pnpm preview      # Preview du build
```

### Build

```bash
pnpm build        # Build production (avec optimisation images)
pnpm build:prod   # Clean + build
pnpm check        # Vérification TypeScript
```

### Code Quality

```bash
pnpm lint         # Linter ESLint
pnpm lint:fix     # Fix automatique
pnpm format       # Format avec Prettier
pnpm format:check # Vérifier le formatage
pnpm type-check   # Vérification TypeScript
```

### Images

```bash
pnpm img:opt      # Optimise toutes les images (avif, webp, png)
pnpm img:avif     # Convertit en AVIF
pnpm img:webp     # Convertit en WebP
pnpm img:png      # Optimise PNG
```

Place les images brutes dans `src/assets/img_raw/`, les versions optimisées seront dans `src/assets/img_opt/`.

### Utilitaires

```bash
pnpm verify:icons # Vérifie les icônes utilisées
pnpm clean        # Supprime dist/ et .astro/
```

## 🐳 Déploiement avec Docker

### Développement

```bash
# Créer .env depuis le template
cp .env.example .env

# Éditer .env avec votre token Cloudflare Tunnel
nano .env

# Lancer la stack dev
docker compose --profile dev up -d

# Logs
docker compose logs -f
```

### Production

```bash
# Build du site
pnpm build:prod

# Lancer la stack prod
docker compose --profile prod up -d

# Vérifier le status
docker compose ps
```

### Services Docker

- **caddy**: Reverse proxy (ports 80, 443)
- **cloudflared**: Tunnel Cloudflare
- **astro-dev**: Serveur de développement Astro (profil dev)
- **astro-prod**: Serveur statique production (profil prod)

## 🏗️ Architecture

Le projet suit trois principes fondamentaux:

### 1. Séparation des préoccupations
- **Présentation** (`ui/`) - Composants visuels sans logique métier
- **Logique métier** (`domain/`) - Features avec leur logique
- **Contenu** (`content/`) - Contenu éditorial en MDX
- **Configuration** (`config/`) - Paramètres du site

### 2. Organisation par feature
Le code est groupé par domaine fonctionnel:
- `domain/blog/` - Tout ce qui concerne le blog
- `domain/contact/` - Formulaire de contact
- `domain/formation/` - Pages formations
- `domain/shared/` - Code partagé entre features

### 3. Flux de dépendances unidirectionnel
```
ui → domain → pages
```
- Les composants UI ne connaissent pas la logique métier
- Les domaines utilisent les composants UI
- Les pages orchestrent les domaines

## 📚 Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Architecture du code et principes
- **[INFRASTRUCTURE.md](./docs/INFRASTRUCTURE.md)** - Infrastructure de déploiement
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Guide de déploiement pas-à-pas
- **[DIAGRAMS.md](./docs/DIAGRAMS.md)** - Diagrammes de séquence et flux
- **[MIGRATION.md](./docs/MIGRATION.md)** - Migration Cloudflare Worker vers Tunnel
- **[AGENTS.md](./docs/AGENTS.md)** - Guide pour les agents IA

## 🎨 Design System

Composants organisés selon Atomic Design:

### Atoms (20)
Composants de base: Button, Icon, Badge, Typography, Section, etc.

### Molecules (8)
Composants composites: Accordion, Pagination, FeatureCard, etc.

### Organisms (3)
Composants complexes: Card, PodcastPlayer, MusicPlayer

### Shortcodes (10)
Composants auto-importés dans MDX:
- `<Accordion>`, `<Button>`, `<Icon>`, `<Notice>`
- `<Video>`, `<Youtube>`, `<LottiePlayer>`
- `<DotLottiePlayer>`, `<PodcastPlayer>`, `<Kbd>`

## 🔧 Configuration

### Site Config

Éditer `src/config/siteConfig.ts`:

```typescript
export const siteConfig = {
  title: "j12zdotcom - Portfolio Jeremie Alcaraz",
  base_url: "https://jeremiealcaraz.com",
  favicon: "/favicon.png",
  logo: "/images/logo.svg",
  author: "Jérémie Alcaraz",
  pagination_size: 3,
  // ...
}
```

### Navigation

Éditer `src/config/navigation.ts`:

```typescript
export const headerNav = [
  { name: "Accueil", url: "/" },
  { name: "Blog", url: "/blog" },
  { name: "À propos", url: "/about" },
  { name: "Contact", url: "/contact" },
]
```

## 🌐 Déploiement

Le site est déployé avec **Cloudflare Tunnel** + **Caddy** sur un VPS.

### Architecture de production

```
Internet → Cloudflare CDN → Tunnel → Caddy → Site Astro
```

**Avantages**:
- ✅ Gratuit (hors coût VPS ~5€/mois)
- ✅ HTTPS automatique
- ✅ Protection DDoS
- ✅ Cache global
- ✅ Pas d'IP publique nécessaire

Voir [DEPLOYMENT.md](./docs/DEPLOYMENT.md) pour le guide complet.

## 📊 Performance

- **Lighthouse Score**: 95+ sur tous les critères
- **TTFB**: < 200ms (cache CDN)
- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **CLS**: < 0.1

Optimisations:
- Génération statique (SSG)
- Images optimisées (Sharp)
- Code splitting automatique
- CSS/JS minifiés
- Compression gzip/zstd
- Cache CDN Cloudflare

## 🔒 Sécurité

Headers de sécurité configurés dans Caddy:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`

Protection Cloudflare:
- DDoS protection (Layer 3/4/7)
- Web Application Firewall (WAF)
- Bot detection
- Rate limiting

## 🤝 Contribution

Ce projet est personnel mais ouvert aux suggestions:

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'feat: Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Conventions de code

- **ESLint** pour le linting JavaScript/TypeScript
- **Prettier** pour le formatage
- **Conventional Commits** pour les messages de commit
- **Atomic Design** pour l'organisation des composants

## 🐛 Debugging

### Build qui échoue

```bash
# Nettoyer et rebuilder
pnpm clean
pnpm install --frozen-lockfile
pnpm build
```

### Images non optimisées

```bash
# Vérifier que Sharp fonctionne
pnpm exec sharp --version

# Réoptimiser toutes les images
pnpm img:opt
```

### Icônes manquantes

```bash
# Vérifier les icônes utilisées
pnpm verify:icons
```

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/JeremieAlcaraz/j12zdotcom/issues)
- **Site web**: [jeremiealcaraz.com](https://jeremiealcaraz.com)

## 📄 Licence

MIT © Jérémie Alcaraz

## 🙏 Remerciements

- [Astro](https://astro.build) - Framework SSG
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [DaisyUI](https://daisyui.com) - Components
- [Cloudflare](https://cloudflare.com) - CDN & Tunnel
- [Caddy](https://caddyserver.com) - Reverse proxy
- [Iconify](https://iconify.design) - Icons

---

Fait avec ❤️ par [Jérémie Alcaraz](https://jeremiealcaraz.com)
