# Guide de déploiement

Ce guide vous explique comment déployer j12zdotcom avec Cloudflare Tunnel et Caddy.

## Prérequis

- Un serveur Linux (VPS, machine locale, Raspberry Pi, etc.)
- Docker et Docker Compose installés
- Un compte Cloudflare (gratuit)
- Domaine `jeremiealcaraz.com` configuré sur Cloudflare
- Git installé

## Installation rapide (5 minutes)

### 1. Cloner le projet

```bash
# SSH dans votre serveur
ssh user@your-server.com

# Cloner le dépôt
git clone https://github.com/JeremieAlcaraz/j12zdotcom.git
cd j12zdotcom
```

### 2. Créer le tunnel Cloudflare

#### Option A: Via Dashboard Cloudflare (recommandé)

1. Aller sur https://one.dash.cloudflare.com/
2. **Zero Trust** → **Access** → **Tunnels**
3. Cliquer **Create a tunnel**
4. Nom: `j12z-production`
5. Choisir **Cloudflared**
6. Copier le **token** affiché
7. Dans **Public Hostname**:
   - Subdomain: *(laisser vide)*
   - Domain: `jeremiealcaraz.com`
   - Type: `HTTP`
   - URL: `caddy:80` (si Docker) ou `localhost:80`
8. Ajouter un second hostname pour `www`:
   - Subdomain: `www`
   - Domain: `jeremiealcaraz.com`
   - Type: `HTTP`
   - URL: `caddy:80`

#### Option B: Via CLI (avancé)

```bash
# Installer cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Authentification
cloudflared tunnel login

# Créer le tunnel
cloudflared tunnel create j12z-production

# Noter l'ID du tunnel
cloudflared tunnel list

# Créer la configuration
cat > cloudflared/config.yml <<EOF
tunnel: <TUNNEL_ID>
credentials-file: /etc/cloudflared/cert.pem

ingress:
  - hostname: jeremiealcaraz.com
    service: http://localhost:80
  - hostname: www.jeremiealcaraz.com
    service: http://localhost:80
  - service: http_status:404
EOF

# Créer l'enregistrement DNS
cloudflared tunnel route dns j12z-production jeremiealcaraz.com
cloudflared tunnel route dns j12z-production www.jeremiealcaraz.com
```

### 3. Configurer les variables d'environnement

```bash
# Copier le template
cp .env.example .env

# Éditer avec votre token
nano .env
```

Remplir:
```env
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoiYmMxZ...(token depuis dashboard)
LETSENCRYPT_EMAIL=contact@jeremiealcaraz.com
NODE_ENV=production
```

### 4. Créer les dossiers nécessaires

```bash
# Dossier pour les logs
mkdir -p logs/caddy

# Permissions
chmod 755 logs/caddy
```

### 5. Builder le site

```bash
# Installer les dépendances
pnpm install

# Build production
pnpm build:prod
```

Vérifier que `/dist` contient les fichiers générés:
```bash
ls -la dist/
```

### 6. Lancer les services

#### En développement (avec Hot Reload)

```bash
# Lancer avec le profil dev
docker compose --profile dev up -d

# Vérifier les logs
docker compose logs -f
```

Le site sera accessible sur:
- Local: http://localhost:4321
- Public: https://jeremiealcaraz.com (via tunnel)

#### En production (serveur statique)

```bash
# Lancer avec le profil prod
docker compose --profile prod up -d

# Vérifier les logs
docker compose logs -f
```

### 7. Vérifier le déploiement

```bash
# Status des containers
docker compose ps

# Doit afficher:
# NAME               STATUS              PORTS
# j12z_caddy         Up 30 seconds       0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
# j12z_cloudflared   Up 30 seconds
# j12z_astro_prod    Up 30 seconds       (ou j12z_astro_dev)
```

```bash
# Test en local
curl -I http://localhost:80

# Doit retourner 200 OK
```

```bash
# Test depuis Internet
curl -I https://jeremiealcaraz.com

# Doit retourner 200 OK avec headers Cloudflare
```

### 8. Vérifier le tunnel Cloudflare

1. Dashboard Cloudflare → Zero Trust → Access → Tunnels
2. Le tunnel `j12z-production` doit être **HEALTHY** (vert)
3. Cliquer pour voir les connexions actives

## Configuration avancée

### Optimiser Caddy pour la production

Éditer `Caddyfile`:

```caddy
jeremiealcaraz.com, www.jeremiealcaraz.com {
    # Si vous servez les fichiers statiques directement
    root * /srv/dist
    file_server

    # Cache headers pour les assets
    @static {
        path *.js *.css *.png *.jpg *.jpeg *.gif *.svg *.woff *.woff2
    }
    header @static Cache-Control "public, max-age=31536000, immutable"

    # Compression maximale
    encode gzip zstd

    # Headers sécurité (déjà présents)
    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    }

    # Try files (pour SPA routing si besoin)
    try_files {path} {path}/ /index.html
}
```

Puis recharger:
```bash
docker compose restart caddy
```

### Configurer le cache Cloudflare

1. Dashboard Cloudflare → Caching → Configuration
2. **Browser Cache TTL**: 4 heures
3. **Caching Level**: Standard
4. **Page Rules** (optionnel):
   - `jeremiealcaraz.com/blog/*` → Cache Everything, Edge TTL 1 heure
   - `jeremiealcaraz.com/assets/*` → Cache Everything, Edge TTL 1 mois

### Monitoring avec Uptime Robot

```bash
# Créer un monitor HTTP(S)
URL: https://jeremiealcaraz.com
Interval: 5 minutes
Alert: email si down
```

### SSL/TLS Cloudflare

1. Dashboard → SSL/TLS → Overview
2. Mode: **Full (strict)** recommandé
3. Edge Certificates → Always Use HTTPS: **ON**
4. Minimum TLS Version: **1.2**
5. Opportunistic Encryption: **ON**

## Mise à jour du site

### Déploiement automatique

1. Pousser les changements sur Git:
```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```

2. Sur le serveur:
```bash
cd /path/to/j12zdotcom

# Pull les changements
git pull origin main

# Rebuild
pnpm install
pnpm build:prod

# Restart
docker compose restart astro-prod
# OU pour dev: docker compose restart astro-dev
```

3. Purger le cache Cloudflare:
```bash
# Via Dashboard: Caching → Purge Everything
# OU via API (voir script ci-dessous)
```

### Script de déploiement automatique

Créer `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Déploiement j12zdotcom..."

# Pull code
echo "📦 Récupération du code..."
git pull origin main

# Install deps (si package.json a changé)
echo "📚 Installation des dépendances..."
pnpm install --frozen-lockfile

# Build
echo "🔨 Build du site..."
pnpm build:prod

# Restart
echo "🔄 Redémarrage des services..."
docker compose --profile prod restart astro-prod

# Purge cache Cloudflare
echo "🗑️  Purge du cache Cloudflare..."
if [ ! -z "$CLOUDFLARE_ZONE_ID" ] && [ ! -z "$CLOUDFLARE_API_TOKEN" ]; then
    curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
      -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
      -H "Content-Type: application/json" \
      --data '{"purge_everything":true}'
fi

echo "✅ Déploiement terminé!"
echo "🌐 Site disponible sur https://jeremiealcaraz.com"
```

Rendre exécutable:
```bash
chmod +x deploy.sh
```

Utiliser:
```bash
./deploy.sh
```

### Déploiement avec GitHub Actions (CI/CD)

Créer `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10.16.1

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build:prod

      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /path/to/j12zdotcom
            git pull origin main
            pnpm install --frozen-lockfile
            pnpm build:prod
            docker compose --profile prod restart astro-prod

      - name: Purge Cloudflare Cache
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CLOUDFLARE_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            --data '{"purge_everything":true}'
```

Secrets GitHub à configurer:
- `SSH_HOST`: IP du serveur
- `SSH_USER`: Utilisateur SSH
- `SSH_PRIVATE_KEY`: Clé privée SSH
- `CLOUDFLARE_ZONE_ID`: ID de zone CF
- `CLOUDFLARE_API_TOKEN`: Token API CF

## Maintenance

### Vérifier les logs

```bash
# Logs en temps réel
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f caddy
docker compose logs -f cloudflared

# Logs Caddy formatés (JSON)
cat logs/caddy/jeremiealcaraz.log | jq
```

### Vérifier l'état des services

```bash
# Status
docker compose ps

# Stats ressources
docker stats

# Healthcheck
docker compose exec caddy wget --spider http://localhost:80
```

### Mises à jour de sécurité

```bash
# Mise à jour des images Docker
docker compose pull

# Redémarrer avec les nouvelles images
docker compose up -d

# Nettoyer les anciennes images
docker image prune -a
```

### Rotation des logs

Ajouter à la crontab du serveur:

```bash
# Éditer crontab
crontab -e

# Ajouter
0 0 * * 0 find /path/to/j12zdotcom/logs -name "*.log" -mtime +30 -delete
```

## Rollback en cas de problème

```bash
# Revenir au commit précédent
git log --oneline  # Noter le hash du dernier commit stable
git checkout <commit-hash>

# Rebuild
pnpm build:prod

# Restart
docker compose restart astro-prod
```

## Performance benchmarks

### Test de charge basique

```bash
# Installer Apache Bench
sudo apt install apache2-utils

# Test 1000 requêtes, 10 concurrentes
ab -n 1000 -c 10 https://jeremiealcaraz.com/

# Analyser:
# - Requests per second
# - Time per request
# - Failed requests (doit être 0)
```

### Lighthouse CI

```bash
# Installer Lighthouse
npm install -g @lhci/cli

# Audit
lhci autorun --url=https://jeremiealcaraz.com

# Objectifs:
# Performance: > 90
# Accessibility: > 95
# Best Practices: > 90
# SEO: > 90
```

## Troubleshooting

### Le site est lent

1. Vérifier Cloudflare Analytics → Performance
2. Vérifier cache hit ratio (doit être > 80%)
3. Activer HTTP/3 (Dashboard → Network)
4. Optimiser les images (convertir en WebP/AVIF)
5. Activer Brotli compression dans Caddy

### Erreur 522 (Connection timed out)

- Le tunnel Cloudflare ne peut pas joindre le serveur
- Vérifier que cloudflared tourne: `docker compose ps cloudflared`
- Vérifier les logs: `docker compose logs cloudflared`
- Vérifier le firewall du serveur

### Erreur 502 (Bad Gateway)

- Caddy ne peut pas joindre le site Astro
- Vérifier le port dans Caddyfile correspond au service
- Dev: `reverse_proxy localhost:4321`
- Prod: `reverse_proxy localhost:8080`

### Le cache ne se vide pas

```bash
# Purge via API
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### Docker out of disk space

```bash
# Nettoyer Docker
docker system prune -a --volumes

# Vérifier l'espace
df -h
```

## Support

- Documentation Cloudflare: https://developers.cloudflare.com/
- Documentation Caddy: https://caddyserver.com/docs/
- Issues GitHub: https://github.com/JeremieAlcaraz/j12zdotcom/issues
