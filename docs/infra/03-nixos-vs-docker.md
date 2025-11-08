# NixOS vs Docker Compose - Comparaison détaillée

## 📊 Vue d'ensemble

Ce document compare les deux approches pour déployer **jeremiealcaraz.com** :
- **Phase 1** : Docker Compose + Caddy + Cloudflare Tunnel
- **Phase 2** : NixOS natif avec services systemd

---

## 🏗️ Architecture

### Docker Compose (Phase 1)

```
┌─────────────────────────────────────────┐
│  Système d'exploitation (Ubuntu, etc.)  │
│  ┌───────────────────────────────────┐  │
│  │  Docker Engine                    │  │
│  │  ┌─────────────┬─────────────┐   │  │
│  │  │ Container   │ Container   │   │  │
│  │  │ Caddy       │ Astro       │   │  │
│  │  └─────────────┴─────────────┘   │  │
│  │  ┌─────────────┐                 │  │
│  │  │ Container   │                 │  │
│  │  │ cloudflared │                 │  │
│  │  └─────────────┘                 │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Fichiers** :
- `docker-compose.yml` : Orchestration
- `Caddyfile` : Config Caddy
- `.env` : Variables d'environnement

### NixOS (Phase 2)

```
┌─────────────────────────────────────────┐
│  NixOS                                  │
│  ┌───────────────────────────────────┐  │
│  │  systemd                          │  │
│  │  ┌──────────┬──────────────────┐ │  │
│  │  │ Service  │ Service          │ │  │
│  │  │ caddy    │ cloudflared      │ │  │
│  │  └──────────┴──────────────────┘ │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  /nix/store/xxx-j12zdotcom/       │  │
│  │  (site statique immuable)         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Fichiers** :
- `flake.nix` : Configuration déclarative
- `/etc/nixos/configuration.nix` : Config système

---

## 🔍 Comparaison détaillée

### 1. Reproductibilité

#### Docker Compose

```yaml
# docker-compose.yml
services:
  caddy:
    image: caddy:2-alpine  # ⚠️ Tag peut changer
```

**Problèmes** :
- `caddy:2-alpine` peut pointer vers différentes versions
- Cache layers peut différer entre machines
- `pnpm install` peut installer des versions différentes
- Build context dépend de l'état local

**Reproductibilité** : ~80%

#### NixOS

```nix
# flake.lock (généré automatiquement)
{
  "nodes": {
    "nixpkgs": {
      "locked": {
        "narHash": "sha256-abc123...",  # Hash exact
        "rev": "def456..."               # Commit exact
      }
    }
  }
}
```

**Avantages** :
- Chaque dépendance est hashée (content-addressed)
- Même `flake.lock` = même build partout
- `/nix/store/abc123-caddy-2.7.5/` est immuable
- Pas de "works on my machine"

**Reproductibilité** : 100%

---

### 2. Gestion des services

#### Docker Compose

```bash
# Démarrer
docker compose up -d

# Logs
docker compose logs -f caddy

# Redémarrer
docker compose restart caddy

# Stats
docker stats
```

**Avantages** :
- Logs isolés par conteneur
- Restart facile
- Stats CPU/RAM par conteneur

**Inconvénients** :
- Pas d'intégration avec systemd
- Logs pas dans journald
- Dépendances entre services moins robustes

#### NixOS

```bash
# Démarrer (automatique au boot)
systemctl start caddy

# Logs
journalctl -u caddy -f

# Redémarrer
systemctl restart caddy

# Stats
systemd-cgtop
```

**Avantages** :
- Intégration native avec systemd
- Tous les logs dans journald (unifié)
- Gestion des dépendances robuste (`After=`, `Requires=`)
- Hardening de sécurité intégré

**Inconvénients** :
- Moins familier pour devs habitués à Docker

---

### 3. Sécurité

#### Docker Compose

```yaml
# docker-compose.yml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    # ⚠️ Tourne en root dans le conteneur par défaut
```

**Sécurité** :
- Isolation par namespaces (user, network, mount, etc.)
- Mais souvent root dans le conteneur
- Pas de hardening systemd
- Dépend de la config Docker (seccomp, apparmor)

#### NixOS

```nix
# flake.nix
systemd.services.cloudflared = {
  serviceConfig = {
    DynamicUser = true;              # User éphémère
    ProtectSystem = "strict";         # /usr, /boot en lecture seule
    ProtectHome = true;               # Pas d'accès à /home
    NoNewPrivileges = true;           # Pas d'escalade de privilèges
    PrivateTmp = true;                # /tmp isolé
    ProtectKernelTunables = true;     # /sys en lecture seule
    RestrictAddressFamilies = [ "AF_INET" "AF_INET6" ];
    MemoryDenyWriteExecute = true;    # Pas de code auto-modifiable
    # ... 20+ autres options de hardening
  };
};
```

**Sécurité** :
- Hardening systemd très granulaire
- Chaque service avec user dédié
- Politiques SELinux-like natives
- Moins de surface d'attaque (pas de Docker daemon)

**Gagnant** : NixOS (sécurité plus fine)

---

### 4. Ressources système

#### Docker Compose

| Service | CPU (idle) | RAM |
|---------|------------|-----|
| Docker daemon | ~1% | ~150MB |
| Caddy (conteneur) | ~0.1% | ~50MB |
| Astro (conteneur) | ~0.5% | ~200MB |
| cloudflared (conteneur) | ~0.2% | ~30MB |
| **Total** | **~2%** | **~430MB** |

**Overhead** :
- Docker daemon toujours actif
- Chaque conteneur = namespace + cgroups
- Volumes Docker = layer FS supplémentaire

#### NixOS

| Service | CPU (idle) | RAM |
|---------|------------|-----|
| systemd | ~0.1% | ~10MB |
| caddy (natif) | ~0.1% | ~30MB |
| cloudflared (natif) | ~0.2% | ~20MB |
| **Total** | **~0.4%** | **~60MB** |

**Avantages** :
- Pas de daemon Docker
- Binaires natifs (pas de conteneur)
- Moins de layers

**Économie** : ~300MB RAM, ~1.5% CPU

---

### 5. Rollback

#### Docker Compose

```bash
# Rollback... comment ?
# ❌ Pas de rollback natif

# Solutions manuelles :
# 1. Garder l'ancienne image
docker tag j12z_astro_dev:latest j12z_astro_dev:backup

# 2. Revenir à l'ancienne image
docker compose down
docker compose up -d --force-recreate

# 3. Utiliser Git pour revenir en arrière
git checkout <commit-ancien>
docker compose up -d --build
```

**Problèmes** :
- Pas de rollback atomique
- Downtime pendant `docker compose down/up`
- État intermédiaire possible

#### NixOS

```bash
# Rollback instantané
nixos-rebuild switch --rollback

# OU choisir une génération
nixos-rebuild list-generations
nixos-rebuild switch --switch-generation 42

# OU au boot (GRUB)
# Sélectionner "NixOS - Configuration 42 (2024-01-15)"
```

**Avantages** :
- Rollback atomique
- Pas de downtime (génération précédente déjà buildée)
- Visible dans le menu GRUB au boot

**Gagnant** : NixOS (rollback natif)

---

### 6. Mise à jour

#### Docker Compose

```bash
# Mettre à jour le code
git pull

# Rebuild les images
docker compose build

# Redémarrer (⚠️ downtime)
docker compose down && docker compose up -d

# OU avec --build (évite down)
docker compose up -d --build
```

**Durée** : ~30s de downtime

#### NixOS

```bash
# Mettre à jour
nixos-rebuild switch --flake .#jeremie-web

# Ou depuis remote
nixos-rebuild switch \
  --flake github:JeremieAlcaraz/j12zdotcom#jeremie-web \
  --target-host root@serveur
```

**Durée** : 0s de downtime (switch atomique)

**Gagnant** : NixOS (zero downtime)

---

### 7. Debugging

#### Docker Compose

```bash
# Logs
docker compose logs -f caddy

# Entrer dans le conteneur
docker exec -it j12z_caddy sh

# Inspecter
docker inspect j12z_caddy

# Network
docker network inspect j12zdotcom_webnet
```

**Avantages** :
- Isolation facile (un conteneur = un service)
- Logs séparés
- Facile d'entrer dans le conteneur

#### NixOS

```bash
# Logs unifiés
journalctl -u caddy -f
journalctl -u cloudflared -f

# Logs combinés
journalctl -u caddy -u cloudflared -f

# Filtrer par niveau
journalctl -u caddy -p err

# Voir la config générée
systemctl cat caddy
```

**Avantages** :
- Tous les logs au même endroit (journald)
- Filtrage avancé (niveau, time range, etc.)
- Corrélation entre services facile

**Gagnant** : Égalité (différent mais équivalent)

---

### 8. Portabilité

#### Docker Compose

**Où ça marche ?**
- ✅ Linux (Ubuntu, Debian, Arch, etc.)
- ✅ macOS (Docker Desktop)
- ✅ Windows (Docker Desktop, WSL2)
- ✅ Cloud (AWS, GCP, Azure, etc.)

**Portabilité** : ★★★★★ (5/5)

#### NixOS

**Où ça marche ?**
- ✅ NixOS uniquement
- ⚠️ Peut tourner sur autres Linux avec Nix (mais pas les services systemd)
- ❌ Pas de macOS natif (Nix marche, mais pas NixOS)
- ❌ Pas de Windows

**Portabilité** : ★★☆☆☆ (2/5)

**Gagnant** : Docker Compose (beaucoup plus portable)

---

### 9. Courbe d'apprentissage

#### Docker Compose

**Concepts à apprendre** :
- Docker (images, conteneurs, volumes)
- docker-compose.yml
- Networking Docker
- Dockerfile

**Temps d'apprentissage** : 1-2 semaines

**Communauté** : Très large

#### NixOS

**Concepts à apprendre** :
- Langage Nix
- Flakes
- `/nix/store`
- Modules NixOS
- systemd

**Temps d'apprentissage** : 1-2 mois

**Communauté** : Plus petite mais très active

**Gagnant** : Docker Compose (plus accessible)

---

### 10. Coûts

#### Docker Compose

| Ressource | Coût |
|-----------|------|
| VPS (2GB RAM, 1 vCPU) | 5-10€/mois |
| Cloudflare Tunnel | Gratuit |
| **Total** | **5-10€/mois** |

**Mais** : Besoin de 2GB RAM minimum (Docker overhead)

#### NixOS

| Ressource | Coût |
|-----------|------|
| VPS (1GB RAM, 1 vCPU) | 3-5€/mois |
| Cloudflare Tunnel | Gratuit |
| **Total** | **3-5€/mois** |

**Avantage** : 1GB RAM suffit (moins d'overhead)

**Économie** : ~5€/mois (~40% moins cher)

---

## 🏆 Verdict

### Utilise Docker Compose si :

- ✅ Tu veux setup rapide (5 minutes)
- ✅ Tu es déjà à l'aise avec Docker
- ✅ Tu veux de la portabilité (macOS, Windows, etc.)
- ✅ Tu as besoin de multi-cloud (AWS, GCP, etc.)
- ✅ Tu veux tester rapidement
- ✅ Tu as un serveur Ubuntu/Debian existant

### Utilise NixOS si :

- ✅ Tu veux une config 100% déclarative
- ✅ Tu veux rollback natif
- ✅ Tu veux optimiser les ressources (RAM, CPU)
- ✅ Tu veux zéro downtime sur les updates
- ✅ Tu veux sécurité maximale (systemd hardening)
- ✅ Tu veux apprendre Nix
- ✅ Tu as déjà NixOS ou tu prévois de l'utiliser

---

## 🎯 Recommandation pour ce projet

### Phase 1 : Docker Compose (Validation rapide)

**Utilité** :
- Tester l'architecture Cloudflare Tunnel
- Valider Caddy + Astro
- Déployer en production rapidement

**Durée** : 1-2 semaines

### Phase 2 : Migration vers NixOS (Long terme)

**Utilité** :
- Infrastructure as Code à 100%
- Aligné avec ta philosophie Nix
- Économies de ressources
- Meilleure sécurité

**Durée** : Déjà prêt (flake.nix créée) !

### Hybride : Docker Compose (dev) + NixOS (prod)

**Best of both worlds** :
```bash
# En local (macOS/Windows)
docker compose up -d

# Sur le serveur (NixOS)
nixos-rebuild switch --flake .#jeremie-web
```

**Avantages** :
- Dev facile sur n'importe quel OS
- Prod optimisée sur NixOS

---

## 📊 Tableau récapitulatif

| Critère | Docker Compose | NixOS | Gagnant |
|---------|----------------|-------|---------|
| **Reproductibilité** | ~80% | 100% | NixOS |
| **Rollback** | Manuel | Natif | NixOS |
| **Sécurité** | Bonne | Excellente | NixOS |
| **Ressources** | ~430MB RAM | ~60MB RAM | NixOS |
| **Portabilité** | ★★★★★ | ★★☆☆☆ | Docker |
| **Courbe d'apprentissage** | Facile | Difficile | Docker |
| **Downtime sur update** | ~30s | 0s | NixOS |
| **Coût VPS** | 5-10€ | 3-5€ | NixOS |
| **Setup initial** | 5 min | 30 min | Docker |
| **Logs** | Isolés | Unifiés | Égalité |
| **Debugging** | Facile | Moyen | Docker |
| **Communauté** | Large | Petite | Docker |

**Score** : Docker Compose 5/12, NixOS 7/12

---

## 🔮 Évolution future

### Aujourd'hui

```
Docker Compose (Phase 1) → NixOS (Phase 2)
```

### Demain (avec ton infra personnelle)

```
NixOS (laptop) → Flake partagée → NixOS (serveur web)
                                → NixOS (serveur backup)
                                → NixOS (serveur CI)
```

**Vision** : Tous tes serveurs gérés depuis une seule flake, avec modules réutilisables.

---

## 🚀 Prochaines étapes

1. ✅ Valider Docker Compose (Phase 1)
2. ✅ Créer flake.nix (Phase 2)
3. ⏳ Tester NixOS en local (VM)
4. ⏳ Déployer NixOS en prod
5. ⏳ Documenter les learnings
6. ⏳ Créer modules réutilisables pour d'autres projets

---

## 📚 Ressources

- [Docker vs NixOS](https://nixos.wiki/wiki/Docker)
- [Why NixOS?](https://nixos.org/guides/how-nix-works.html)
- [systemd security](https://www.freedesktop.org/software/systemd/man/systemd.exec.html#Security)
