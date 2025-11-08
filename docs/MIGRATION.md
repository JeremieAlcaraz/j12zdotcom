# Guide de migration - Cloudflare Worker vers Cloudflare Tunnel

Ce document explique la migration de Cloudflare Worker vers Cloudflare Tunnel + Caddy.

## Résumé de la migration

### Avant (Cloudflare Worker)

```
Internet → Cloudflare CDN → Cloudflare Worker → Site Astro (SSG)
                             (Edge Computing)
```

**Problèmes**:
- ❌ Vendor lock-in (Workers API propriétaire)
- ❌ Limites CPU/mémoire strictes (10ms CPU, 128MB RAM)
- ❌ Débogage difficile (logs limités)
- ❌ Coût potentiel élevé si trafic élevé
- ❌ Complexité pour un site statique simple
- ❌ Pas de contrôle total sur l'infrastructure

### Après (Cloudflare Tunnel + Caddy)

```
Internet → Cloudflare CDN → Cloudflare Tunnel → Caddy → Site Astro
                             (connexion chiffré)   (Reverse Proxy)
```

**Avantages**:
- ✅ **Flexibilité**: Serveur sous votre contrôle
- ✅ **Simplicité**: Architecture standard (reverse proxy)
- ✅ **Portabilité**: Migration facile vers autre CDN (Fastly, BunnyCDN)
- ✅ **Pas de limites**: CPU/RAM/temps d'exécution illimités
- ✅ **Debugging facile**: Logs complets, accès SSH
- ✅ **Gratuit**: Tunnel gratuit, coût = uniquement VPS
- ✅ **Open source**: Caddy, Astro, cloudflared sont tous open source

## Changements apportés

### Fichiers supprimés

```diff
- wrangler.jsonc              # Configuration Cloudflare Worker
```

### Fichiers modifiés

#### package.json

```diff
  "dependencies": {
    "@astrojs/check": "0.9.4",
-   "@astrojs/cloudflare": "^12.6.4",
    "@astrojs/react": "4.2.5",
    ...
  },
  "devDependencies": {
    ...
-   "wrangler": "^4.31.0"
  },
  "scripts": {
    ...
    "build:prod": "pnpm run clean && pnpm run build",
-   "preview:static": "pnpm dlx serve dist",
-   "cf:preview": "pnpm build && pnpm dlx wrangler dev",
-   "cf:deploy": "pnpm build && pnpm dlx wrangler deploy"
+   "preview:static": "pnpm dlx serve dist"
  }
```

#### astro.config.ts

```diff
  import { defineConfig } from 'astro/config'
  import react from '@astrojs/react'
  import svelte from '@astrojs/svelte'
  import mdx from '@astrojs/mdx'
  import sitemap from '@astrojs/sitemap'
- import cloudflare from '@astrojs/cloudflare'
  ...

  export default defineConfig({
+   site: 'https://jeremiealcaraz.com',

    integrations: [...],

    // Sortie statique uniquement (SSG)
    output: 'static',

-   // Adapter Cloudflare
-   adapter: cloudflare({
-     imageService: 'compile',
-   }),

    // Service d'images : Sharp (optimisation au build)
    image: {
      service: {
        entrypoint: 'astro/assets/services/sharp',
      },
    },
  })
```

### Fichiers ajoutés

```diff
+ Caddyfile                    # Configuration reverse proxy
+ docker-compose.yml           # Orchestration des services
+ Dockerfile.dev               # Image Docker pour dev
+ .dockerignore                # Exclusions Docker
+ .env.example                 # Template variables d'env
+ docs/INFRASTRUCTURE.md       # Architecture détaillée
+ docs/DEPLOYMENT.md           # Guide de déploiement
+ docs/DIAGRAMS.md             # Diagrammes de séquence
+ docs/MIGRATION.md            # Ce fichier
```

## Étapes de migration

### 1. Désactivation Cloudflare Worker

#### Sur Cloudflare Dashboard

1. Aller sur https://dash.cloudflare.com/
2. Sélectionner le domaine `jeremiealcaraz.com`
3. **Workers Routes** → Supprimer toutes les routes
4. **Workers** → Supprimer le worker `j12zdotcom` (si existant)

#### Dans le code (déjà fait)

```bash
# Supprimer les dépendances
pnpm remove @astrojs/cloudflare wrangler

# Supprimer le fichier
rm wrangler.jsonc
```

### 2. Installation du serveur

#### Prérequis serveur

```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installation Docker Compose
sudo apt install docker-compose-plugin -y

# Vérification
docker --version
docker compose version
```

#### Cloner le projet

```bash
# SSH dans le serveur
ssh user@your-server.com

# Cloner
git clone https://github.com/JeremieAlcaraz/j12zdotcom.git
cd j12zdotcom

# Installer pnpm (si vous voulez builder manuellement)
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### 3. Configuration Cloudflare Tunnel

#### Créer le tunnel

**Via Dashboard** (recommandé):

1. https://one.dash.cloudflare.com/
2. **Zero Trust** → **Access** → **Tunnels**
3. **Create a tunnel**
4. Nom: `j12z-production`
5. Environnement: **Cloudflared**
6. Copier le **token** généré

**Public Hostname Configuration**:

| Subdomain | Domain | Type | URL |
|-----------|--------|------|-----|
| *(vide)* | jeremiealcaraz.com | HTTP | caddy:80 |
| www | jeremiealcaraz.com | HTTP | caddy:80 |

**Note**: Utiliser `caddy:80` (nom du service Docker) au lieu de `localhost:80` si vous utilisez docker-compose.

#### Configurer les variables d'environnement

```bash
cd /path/to/j12zdotcom

# Copier le template
cp .env.example .env

# Éditer
nano .env
```

Remplir:
```env
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoiYmMxZ... (votre token)
LETSENCRYPT_EMAIL=contact@jeremiealcaraz.com
NODE_ENV=production
```

### 4. Build du site

```bash
# Installer les dépendances
pnpm install --frozen-lockfile

# Build
pnpm build:prod

# Vérifier que /dist existe
ls -la dist/
```

### 5. Lancer la stack Docker

```bash
# Créer le dossier de logs
mkdir -p logs/caddy

# Lancer en mode production
docker compose --profile prod up -d

# Vérifier les logs
docker compose logs -f

# Vérifier le status
docker compose ps
```

Expected output:
```
NAME               STATUS              PORTS
j12z_caddy         Up 30 seconds       0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
j12z_cloudflared   Up 30 seconds
j12z_astro_prod    Up 30 seconds       0.0.0.0:8080->8080/tcp
```

### 6. Vérification

#### Test en local

```bash
# Test Caddy
curl -I http://localhost:80
# Doit retourner 200 OK

# Test Astro
curl -I http://localhost:8080
# Doit retourner 200 OK
```

#### Test tunnel Cloudflare

1. Dashboard Cloudflare → Zero Trust → Access → Tunnels
2. Le tunnel `j12z-production` doit être **HEALTHY** (vert)
3. Cliquer dessus pour voir les connexions actives

#### Test depuis Internet

```bash
# Depuis votre machine locale
curl -I https://jeremiealcaraz.com

# Doit retourner:
# HTTP/2 200
# server: cloudflare
# ...
```

### 7. Configuration DNS (si nécessaire)

Si vous aviez des enregistrements DNS pointant vers Workers:

1. Dashboard Cloudflare → DNS → Records
2. Vérifier que `jeremiealcaraz.com` et `www` pointent vers le tunnel:
   - Type: `CNAME`
   - Name: `@` ou `www`
   - Target: `<tunnel-id>.cfargotunnel.com`
   - Proxy status: **Proxied** (orange)

**Note**: Le dashboard Cloudflare Tunnel configure automatiquement le DNS lors de la création du Public Hostname.

### 8. Purger le cache Cloudflare

Après migration:

```bash
# Via Dashboard
# Caching → Configuration → Purge Everything

# OU via API
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

## Comparaison des coûts

### Avant (Cloudflare Worker)

| Service | Coût |
|---------|------|
| Cloudflare Free | 0€ |
| Worker (100k req/jour) | 0€ (dans le tier gratuit) |
| Worker (1M req/jour) | ~5$/mois (dépassement) |
| **Total** | **0-5€/mois** |

**Limites gratuites**:
- 100,000 requêtes/jour
- 10ms CPU time/requête
- 128MB RAM

### Après (Cloudflare Tunnel + VPS)

| Service | Coût |
|---------|------|
| Cloudflare Free | 0€ |
| Cloudflare Tunnel | 0€ (gratuit illimité) |
| VPS (2GB RAM, 1 vCPU) | 5-10€/mois |
| **Total** | **5-10€/mois fixe** |

**Avantages**:
- Pas de limite de requêtes
- Pas de limite CPU/RAM
- Contrôle total

**VPS recommandés**:
- **Hetzner CX11**: 4,15€/mois (20TB trafic)
- **DigitalOcean Basic**: 6$/mois (1TB trafic)
- **OVH VPS Starter**: 3,50€/mois (250Mbps)
- **Scaleway DEV1-S**: 7,99€/mois (200Mbps)

## Migration DNS (détails)

### Configuration DNS recommandée

```
jeremiealcaraz.com
  Type: CNAME
  Name: @
  Target: <tunnel-id>.cfargotunnel.com
  Proxy: ✅ Enabled (orange cloud)
  TTL: Auto

www.jeremiealcaraz.com
  Type: CNAME
  Name: www
  Target: <tunnel-id>.cfargotunnel.com
  Proxy: ✅ Enabled (orange cloud)
  TTL: Auto
```

### Propagation DNS

- **Temps**: 5-30 minutes généralement
- **Vérification**: `dig jeremiealcaraz.com` ou `nslookup jeremiealcaraz.com`

### Rollback rapide

Si problème, revert vers l'ancien Worker:

1. Recréer une route Worker dans Cloudflare Dashboard
2. Redéployer le worker: `pnpm cf:deploy` (après avoir restauré les dépendances)
3. Désactiver le tunnel Cloudflare

**Temps de rollback**: ~5 minutes

## Performance avant/après

### Cloudflare Worker (avant)

| Métrique | Valeur |
|----------|--------|
| TTFB (cache hit) | 30-50ms |
| TTFB (cache miss) | 50-100ms |
| Cold start | ~100ms |
| Processing time | ~5ms |

**Limitations**:
- Pas de contrôle sur le cache
- CPU time limité
- Pas de logs détaillés

### Cloudflare Tunnel + Caddy (après)

| Métrique | Valeur |
|----------|--------|
| TTFB (cache hit) | 20-50ms (équivalent) |
| TTFB (cache miss) | 200-400ms (dépend latence serveur) |
| Cold start | N/A (serveur toujours up) |
| Processing time | ~5-20ms |

**Avantages**:
- Contrôle total sur les headers cache
- Logs complets (Caddy + Cloudflare)
- Metrics détaillées
- Pas de cold start

### Optimisations possibles

Pour réduire le TTFB en cache MISS:

1. **Serveur plus proche**: Choisir datacenter proche de vos utilisateurs
2. **HTTP/3**: Activé par défaut sur Cloudflare + Caddy
3. **Early Hints**: Configurable sur Cloudflare
4. **Argo Smart Routing**: 5$/mois (routing optimisé)

## Monitoring post-migration

### Dashboards à surveiller

1. **Cloudflare Analytics**
   - Requests/jour
   - Cache hit ratio
   - Bandwidth

2. **Cloudflare Zero Trust → Tunnels**
   - Tunnel health
   - Connexions actives
   - Throughput

3. **Serveur (via SSH)**
   ```bash
   # CPU/RAM
   htop

   # Docker stats
   docker stats

   # Logs Caddy
   tail -f logs/caddy/jeremiealcaraz.log | jq
   ```

### Alertes recommandées

1. **Uptime Robot** (gratuit)
   - Monitor: https://jeremiealcaraz.com
   - Interval: 5 min
   - Alert: Email si down

2. **Cloudflare Notifications**
   - Health checks failed
   - DDoS attack detected
   - SSL certificate expiring

3. **Serveur**
   ```bash
   # Cron pour vérifier santé
   */5 * * * * curl -f http://localhost:80 || systemctl restart docker-compose
   ```

## Troubleshooting post-migration

### Site inaccessible (522 error)

**Causes possibles**:
1. Tunnel Cloudflare déconnecté
2. Caddy down
3. Firewall bloquant

**Solution**:
```bash
# Vérifier tunnel
docker compose logs cloudflared

# Vérifier Caddy
docker compose logs caddy

# Restart
docker compose restart
```

### Performance dégradée

**Diagnostics**:
```bash
# Test latence serveur
ping your-server.com

# Test depuis plusieurs régions
# Utiliser: https://tools.keycdn.com/performance

# Analyser logs Caddy
cat logs/caddy/jeremiealcaraz.log | jq '.duration' | sort -n
```

**Solutions**:
1. Activer Argo Smart Routing (5$/mois)
2. Augmenter cache TTL dans Cloudflare
3. Upgrader VPS (plus de RAM/CPU)

### Cache ne fonctionne pas

**Vérification**:
```bash
curl -I https://jeremiealcaraz.com
# Chercher: CF-Cache-Status: HIT
```

Si toujours MISS:
1. Vérifier headers `Cache-Control` dans Caddy
2. Configurer Page Rules Cloudflare
3. Vérifier pas de cookie qui bypass le cache

## Checklist de migration

- [ ] Désactivé Cloudflare Worker routes
- [ ] Supprimé dépendances Worker du code
- [ ] Configuré serveur (Docker installé)
- [ ] Créé Cloudflare Tunnel
- [ ] Configuré variables d'environnement (.env)
- [ ] Build du site réussi (dist/ généré)
- [ ] Lancé docker-compose
- [ ] Vérifié tunnel HEALTHY
- [ ] DNS configuré (CNAME vers tunnel)
- [ ] Site accessible depuis Internet
- [ ] Purgé cache Cloudflare
- [ ] Configuré monitoring (Uptime Robot)
- [ ] Documenté token tunnel (backup)
- [ ] Testé performance (Lighthouse)
- [ ] Configuré backups serveur

## Prochaines étapes recommandées

1. **CI/CD**: Configurer GitHub Actions pour déploiement auto
2. **Backups**: Script de backup automatique
3. **Monitoring**: Prometheus + Grafana (optionnel)
4. **Sécurité**:
   - Fail2ban sur le serveur
   - Cloudflare WAF rules
   - Rate limiting
5. **Performance**:
   - Activer HTTP/3
   - Configurer cache headers optimaux
   - Image optimization (déjà fait avec Sharp)

## Support

En cas de problème:

1. Vérifier les logs: `docker compose logs -f`
2. Consulter la doc: [docs/DEPLOYMENT.md](./DEPLOYMENT.md)
3. Tester en local d'abord: `docker compose --profile dev up`
4. Issues GitHub: https://github.com/JeremieAlcaraz/j12zdotcom/issues

## Rollback complet

Si vous devez revenir à Cloudflare Worker:

```bash
# 1. Restaurer les dépendances
git checkout main  # Avant migration
pnpm install

# 2. Restaurer wrangler.jsonc
git checkout <commit-avant-migration> -- wrangler.jsonc

# 3. Redéployer Worker
pnpm cf:deploy

# 4. Désactiver le tunnel (garder pour basculer plus tard)
# Dashboard CF → Tunnels → Disable
```

**Temps total**: ~10 minutes
