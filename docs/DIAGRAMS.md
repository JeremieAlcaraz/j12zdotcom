# Diagrammes d'architecture

Ce document contient les diagrammes de séquence et d'architecture pour comprendre le fonctionnement de l'infrastructure.

## Table des matières

- [Flux de requête HTTP](#flux-de-requête-http)
- [Déploiement d'une mise à jour](#déploiement-dune-mise-à-jour)
- [Connexion du tunnel Cloudflare](#connexion-du-tunnel-cloudflare)
- [Gestion du cache](#gestion-du-cache)
- [Gestion des erreurs](#gestion-des-erreurs)
- [Initialisation au démarrage](#initialisation-au-démarrage)

---

## Flux de requête HTTP

### Requête réussie avec cache CDN

```mermaid
sequenceDiagram
    actor User as 👤 Visiteur
    participant DNS as Cloudflare DNS
    participant CDN as Cloudflare CDN<br/>(Edge Network)
    participant Tunnel as cloudflared<br/>(Tunnel Daemon)
    participant Caddy as Caddy<br/>(Reverse Proxy)
    participant Astro as Site Astro<br/>(SSG)

    User->>DNS: Résolution DNS<br/>jeremiealcaraz.com
    activate DNS
    DNS-->>User: IP Cloudflare Edge<br/>(104.xxx.xxx.xxx)
    deactivate DNS

    User->>CDN: GET /blog/article-slug<br/>Headers: Accept, User-Agent
    activate CDN

    alt ✅ Ressource en cache
        Note over CDN: Cache HIT<br/>TTL non expiré
        CDN-->>User: 200 OK<br/>Headers: CF-Cache-Status: HIT<br/>Body: HTML compressé
        Note over User: Temps: ~50ms<br/>(depuis Edge)
    else ❌ Cache MISS ou expiré
        Note over CDN: Cache MISS<br/>Forward à l'origine

        CDN->>Tunnel: GET /blog/article-slug<br/>via tunnel TLS
        activate Tunnel

        Tunnel->>Caddy: HTTP/1.1 GET<br/>Host: jeremiealcaraz.com<br/>localhost:80
        activate Caddy

        Note over Caddy: Ajout headers sécurité<br/>Compression gzip/zstd

        Caddy->>Astro: Reverse proxy<br/>localhost:4321 (dev)<br/>ou localhost:8080 (prod)
        activate Astro

        Astro-->>Caddy: 200 OK<br/>Content-Type: text/html<br/>Body: HTML
        deactivate Astro

        Note over Caddy: Headers ajoutés:<br/>X-Frame-Options<br/>X-Content-Type-Options<br/>CSP, etc.

        Caddy-->>Tunnel: 200 OK<br/>+ Headers sécurité<br/>+ Compression
        deactivate Caddy

        Tunnel-->>CDN: 200 OK<br/>via tunnel chiffré
        deactivate Tunnel

        Note over CDN: Mise en cache<br/>selon Cache-Control<br/>et règles CF

        CDN-->>User: 200 OK<br/>Headers: CF-Cache-Status: MISS<br/>Body: HTML compressé
        Note over User: Temps: ~300ms<br/>(première requête)
    end

    deactivate CDN
```

### Requête d'asset statique (CSS/JS/Image)

```mermaid
sequenceDiagram
    actor User as 👤 Visiteur
    participant CDN as Cloudflare CDN
    participant Tunnel as cloudflared
    participant Caddy as Caddy
    participant Astro as Site Astro

    User->>CDN: GET /assets/main.js
    activate CDN

    alt Cache HIT (99% du temps)
        Note over CDN: Asset statique<br/>Cache TTL: 1 mois
        CDN-->>User: 200 OK<br/>CF-Cache-Status: HIT<br/>Cache-Control: max-age=31536000
        Note over User: ⚡ ~20ms
    else Cache MISS (rare)
        CDN->>Tunnel: Forward requête
        Tunnel->>Caddy: GET /assets/main.js
        Caddy->>Astro: Reverse proxy
        Astro-->>Caddy: File from /dist
        Note over Caddy: Cache-Control:<br/>max-age=31536000, immutable
        Caddy-->>Tunnel: 200 OK + headers
        Tunnel-->>CDN: 200 OK
        Note over CDN: Cache pour 1 mois
        CDN-->>User: 200 OK<br/>CF-Cache-Status: MISS
    end

    deactivate CDN
```

---

## Déploiement d'une mise à jour

### Pipeline de déploiement complet

```mermaid
sequenceDiagram
    actor Dev as 👨‍💻 Développeur
    participant Git as GitHub
    participant Actions as GitHub Actions<br/>(CI/CD)
    participant Server as Serveur VPS
    participant Docker as Docker Compose
    participant Astro as Process Astro
    participant Caddy as Caddy
    participant Tunnel as cloudflared
    participant CF as Cloudflare API

    Dev->>Dev: Modifications code
    Dev->>Git: git commit & push<br/>branch: main
    activate Git

    Git->>Actions: Trigger workflow<br/>(on push)
    activate Actions

    Note over Actions: Install deps<br/>pnpm install
    Note over Actions: Build<br/>pnpm build:prod
    Note over Actions: Tests (si configurés)

    Actions->>Server: SSH Deploy<br/>rsync ou git pull
    activate Server

    Server->>Server: cd /app/j12zdotcom
    Server->>Git: git pull origin main
    Git-->>Server: Latest code

    Server->>Server: pnpm install<br/>--frozen-lockfile
    Server->>Astro: pnpm build:prod
    activate Astro

    Note over Astro: Génération /dist<br/>- Optimisation images<br/>- Minification<br/>- Code splitting

    Astro-->>Server: ✅ Build réussi<br/>dist/ généré
    deactivate Astro

    Server->>Docker: docker compose<br/>--profile prod<br/>restart astro-prod
    activate Docker

    Docker->>Docker: Stop old container
    Docker->>Docker: Start new container<br/>avec dist/ à jour

    Docker-->>Server: ✅ Container restarted
    deactivate Docker

    Note over Caddy,Tunnel: Pas de changement<br/>Continuent de tourner

    Server->>CF: Purge cache API<br/>POST /purge_cache
    activate CF
    CF-->>Server: ✅ Cache purgé
    deactivate CF

    Server-->>Actions: ✅ Déploiement réussi
    deactivate Server

    Actions-->>Git: Update status<br/>✅ Success
    deactivate Actions

    Git-->>Dev: 🎉 Deployed!<br/>Notification
    deactivate Git

    Note over Dev: Temps total:<br/>~2-5 minutes
```

### Rollback en cas d'erreur

```mermaid
sequenceDiagram
    actor Dev as 👨‍💻 Développeur
    participant Server as Serveur
    participant Git as Git
    participant Docker as Docker
    participant Astro as Astro Build
    participant Monitor as Monitoring<br/>(Uptime Robot)

    Monitor->>Monitor: Détecte erreur 500
    Monitor-->>Dev: ⚠️ Alert email/SMS

    Dev->>Server: SSH connexion
    activate Server

    Server->>Server: Vérifier logs<br/>docker compose logs

    alt Problème dans le code
        Dev->>Git: git log --oneline
        Git-->>Dev: Liste commits

        Dev->>Git: git checkout <hash-stable>
        Note over Server: Revenir au dernier<br/>commit stable

        Server->>Astro: pnpm build:prod
        Astro-->>Server: ✅ Build OK

        Server->>Docker: docker compose restart
        Docker-->>Server: ✅ Service UP

    else Problème de config
        Dev->>Server: Éditer Caddyfile<br/>ou docker-compose.yml
        Server->>Docker: docker compose restart
        Docker-->>Server: ✅ Service UP
    end

    Server-->>Dev: ✅ Site restauré
    deactivate Server

    Dev->>Monitor: Vérifier status
    Monitor-->>Dev: ✅ All systems OK
```

---

## Connexion du tunnel Cloudflare

### Établissement initial du tunnel

```mermaid
sequenceDiagram
    participant Docker as Docker Compose
    participant Daemon as cloudflared<br/>daemon
    participant CF_API as Cloudflare API<br/>(Edge)
    participant DNS as Cloudflare DNS
    participant Caddy as Caddy

    Docker->>Daemon: docker compose up<br/>cloudflared
    activate Daemon

    Note over Daemon: Lecture config:<br/>CLOUDFLARE_TUNNEL_TOKEN<br/>ou config.yml

    Daemon->>CF_API: Connexion initiale<br/>WebSocket/QUIC<br/>+ Auth token
    activate CF_API

    CF_API->>CF_API: Vérifier token<br/>Identifier tunnel ID

    alt ✅ Token valide
        CF_API-->>Daemon: ✅ Tunnel accepté<br/>Tunnel ID: abc123
        Note over CF_API,Daemon: Connexion persistante<br/>établie (TLS 1.3)

        CF_API->>DNS: Activer route<br/>jeremiealcaraz.com<br/>→ tunnel abc123

        Daemon->>Caddy: Test connexion<br/>HTTP localhost:80
        activate Caddy
        Caddy-->>Daemon: 200 OK (ou 404 si pas de route)
        deactivate Caddy

        Daemon-->>Docker: ✅ HEALTHY<br/>Tunnel connecté

    else ❌ Token invalide
        CF_API-->>Daemon: ❌ Auth failed
        Daemon-->>Docker: ❌ Exit code 1
        Note over Daemon: Container restart<br/>(restart policy)
    end

    deactivate CF_API

    loop Heartbeat (toutes les 5s)
        Daemon->>CF_API: Ping
        CF_API-->>Daemon: Pong
        Note over Daemon: Connexion maintenue
    end

    deactivate Daemon
```

### Reconnexion automatique après coupure

```mermaid
sequenceDiagram
    participant Daemon as cloudflared
    participant CF as Cloudflare Edge
    participant Caddy as Caddy

    Note over Daemon,CF: Connexion établie

    CF--xDaemon: ❌ Connexion perdue<br/>(réseau, redémarrage CF)

    activate Daemon
    Note over Daemon: Détecte déconnexion<br/>Tentative reconnexion

    loop Retry avec backoff exponentiel
        Daemon->>CF: Tentative reconnexion
        alt Succès
            CF-->>Daemon: ✅ Reconnecté
            Note over Daemon: Tunnel restauré<br/>Trafic reprend
            Daemon->>Caddy: Test santé
            Caddy-->>Daemon: 200 OK
        else Échec
            CF--xDaemon: Timeout/Refused
            Note over Daemon: Attente 2s, 4s, 8s...<br/>Max 30s entre tentatives
        end
    end

    deactivate Daemon
```

---

## Gestion du cache

### Décision de mise en cache

```mermaid
flowchart TD
    Start([Requête arrive<br/>sur Cloudflare CDN]) --> CheckBypass{Bypass cache?<br/>Cookie, Query param}

    CheckBypass -->|Oui| Origin[Forward à l'origine<br/>sans cache]
    CheckBypass -->|Non| CheckMethod{Méthode HTTP?}

    CheckMethod -->|GET/HEAD| CheckCacheable{Ressource<br/>cacheable?}
    CheckMethod -->|POST/PUT/DELETE| Origin

    CheckCacheable -->|Oui| CheckExisting{Existe en<br/>cache?}
    CheckCacheable -->|Non| Origin

    CheckExisting -->|Oui| CheckTTL{TTL expiré?}
    CheckExisting -->|Non| Origin

    CheckTTL -->|Non| ServeCache[✅ Cache HIT<br/>Servir depuis Edge]
    CheckTTL -->|Oui| Revalidate[Revalidation<br/>If-Modified-Since]

    Revalidate --> Origin
    Origin --> OriginResponse[Réponse origine]

    OriginResponse --> CheckCacheControl{Cache-Control<br/>présent?}

    CheckCacheControl -->|public| StoreCache[Stocker en cache<br/>selon TTL]
    CheckCacheControl -->|private/no-cache| NoStore[Ne pas cacher]
    CheckCacheControl -->|Absent| DefaultCache[Cache selon<br/>règles CF]

    StoreCache --> ServeUser[Servir au client<br/>CF-Cache-Status: MISS]
    NoStore --> ServeUser
    DefaultCache --> StoreCache
    ServeCache --> ServeUser2[Servir au client<br/>CF-Cache-Status: HIT]

    ServeUser --> End([Fin])
    ServeUser2 --> End

    style ServeCache fill:#90EE90
    style ServeUser fill:#FFB6C1
    style ServeUser2 fill:#90EE90
```

### Purge du cache après déploiement

```mermaid
sequenceDiagram
    actor Dev as Développeur
    participant API as Cloudflare API
    participant Edge as Cloudflare Edge<br/>(200+ datacenters)
    participant User as Utilisateur

    Dev->>API: POST /purge_cache<br/>purge_everything: true<br/>+ Auth token
    activate API

    API->>API: Valider token<br/>Vérifier zone_id

    API->>Edge: Broadcast purge<br/>à tous les Edge
    activate Edge

    Note over Edge: Invalidation<br/>asynchrone du cache<br/>sur tous les datacenters

    Edge-->>API: ✅ Purge en cours
    deactivate Edge

    API-->>Dev: 200 OK<br/>{success: true}
    deactivate API

    Note over Edge: Purge complète<br/>en ~30 secondes

    User->>Edge: GET /page
    Note over Edge: Cache vide<br/>Force MISS
    Edge->>Edge: Forward à l'origine
    Edge-->>User: Nouveau contenu<br/>CF-Cache-Status: MISS
```

---

## Gestion des erreurs

### Cascade d'erreurs et fallbacks

```mermaid
sequenceDiagram
    actor User as Utilisateur
    participant CDN as Cloudflare CDN
    participant Tunnel as cloudflared
    participant Caddy as Caddy
    participant Astro as Site Astro

    User->>CDN: GET /blog/article
    CDN->>Tunnel: Forward

    alt 🟢 Tout fonctionne
        Tunnel->>Caddy: HTTP Request
        Caddy->>Astro: Reverse proxy
        Astro-->>Caddy: 200 OK
        Caddy-->>Tunnel: 200 OK
        Tunnel-->>CDN: 200 OK
        CDN-->>User: 200 OK

    else 🔴 Astro down (port fermé)
        Tunnel->>Caddy: HTTP Request
        Caddy->>Astro: Connection...
        Astro--xCaddy: Connection refused
        Caddy-->>Tunnel: 502 Bad Gateway
        Tunnel-->>CDN: 502 Bad Gateway

        alt Cache disponible
            Note over CDN: Serve stale<br/>(Always Online)
            CDN-->>User: 200 OK<br/>Version cachée
        else Pas de cache
            CDN-->>User: 502 Bad Gateway<br/>Page d'erreur CF
        end

    else 🔴 Caddy down
        Tunnel->>Caddy: HTTP Request...
        Caddy--xTunnel: Connection refused
        Tunnel-->>CDN: 502 Bad Gateway
        CDN-->>User: 502 Bad Gateway

    else 🔴 Tunnel disconnecté
        CDN->>Tunnel: Forward...
        Tunnel--xCDN: No tunnel available

        alt Always Online activé
            Note over CDN: Serve from<br/>Internet Archive
            CDN-->>User: 200 OK<br/>Version archivée
        else Always Online off
            CDN-->>User: 521 Web Server Down
        end

    else 🔴 Page 404
        Tunnel->>Caddy: GET /invalid-page
        Caddy->>Astro: Reverse proxy
        Astro-->>Caddy: 404 Not Found
        Note over Caddy: handle_errors<br/>Rewrite → /404.html
        Caddy->>Astro: GET /404.html
        Astro-->>Caddy: 200 OK (page 404)
        Caddy-->>Tunnel: 404 + HTML page
        Tunnel-->>CDN: 404 + HTML
        CDN-->>User: 404 Not Found<br/>Jolie page d'erreur
    end
```

---

## Initialisation au démarrage

### Séquence de boot complète

```mermaid
sequenceDiagram
    participant Docker as Docker Engine
    participant Network as Docker Network<br/>webnet
    participant Caddy as Caddy Container
    participant Astro as Astro Container
    participant Tunnel as cloudflared Container

    Note over Docker: docker compose up -d

    Docker->>Network: Créer réseau<br/>webnet (bridge)
    activate Network

    Docker->>Caddy: Start container
    activate Caddy
    Note over Caddy: Lecture Caddyfile<br/>Validation config
    Caddy->>Caddy: Génération certificats<br/>Let's Encrypt (si besoin)
    Caddy->>Caddy: Bind ports<br/>:80, :443
    Note over Caddy: ✅ Ready to serve<br/>Healthcheck: OK

    par Démarrage parallèle
        Docker->>Astro: Start container<br/>(astro-dev ou astro-prod)
        activate Astro
        Note over Astro: Install deps (dev)<br/>OU serve dist (prod)
        Astro->>Astro: Bind port :4321 ou :8080
        Note over Astro: ✅ Server listening

    and
        Docker->>Tunnel: Start container<br/>(depends_on: caddy)
        activate Tunnel
        Note over Tunnel: Lecture token env<br/>CLOUDFLARE_TUNNEL_TOKEN
        Tunnel->>Tunnel: Établir connexion CF
        Note over Tunnel: Tunnel connecté<br/>Healthcheck: OK
    end

    Tunnel->>Caddy: Test connexion<br/>HTTP localhost:80
    Caddy-->>Tunnel: 200 OK

    Caddy->>Astro: Test reverse proxy<br/>localhost:4321
    Astro-->>Caddy: 200 OK

    Note over Docker,Tunnel: ✅ Stack complète UP<br/>Prêt à servir du trafic

    deactivate Caddy
    deactivate Astro
    deactivate Tunnel
    deactivate Network
```

---

## Notes sur les diagrammes

### Légende

- 🟢 **Succès**: Flux nominal sans erreur
- 🔴 **Erreur**: Cas d'échec avec gestion
- ⚡ **Performance**: Métrique de temps de réponse
- ✅ **Validation**: Check de santé ou validation

### Temps de réponse typiques

| Scénario | Temps moyen | Notes |
|----------|-------------|-------|
| Cache HIT (CDN) | 20-50ms | Depuis Edge le plus proche |
| Cache MISS (première requête) | 200-400ms | Dépend de la latence serveur |
| Asset statique (cache) | 15-30ms | Très cacheable |
| Page dynamique | N/A | Site 100% statique (SSG) |

### Points de défaillance

1. **Tunnel Cloudflare**
   - Reconnexion auto en ~5-10s
   - Fallback: Always Online (cache)

2. **Caddy**
   - Restart Docker en ~2-3s
   - Impact: 502 si pas de cache

3. **Site Astro**
   - Restart en ~5-10s (selon mode)
   - Impact: 502 temporaire

### Améliorations futures possibles

- Load balancing entre plusieurs serveurs
- Failover automatique multi-région
- Health checks plus sophistiqués
- Métriques Prometheus/Grafana
- Alerting avancé (PagerDuty, Slack)
