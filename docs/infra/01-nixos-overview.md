# NixOS - Vue d'ensemble de la configuration

## 🎯 Objectif

Déployer le site **jeremiealcaraz.com** sur NixOS de manière **déclarative, reproductible et versionnée** en utilisant Nix Flakes.

---

## 🏗️ Architecture NixOS

```
┌─────────────────────────────────────────────────────────────┐
│  Internet (jeremiealcaraz.com)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare DNS + CDN                                       │
│  - Gestion DNS                                              │
│  - Cache global                                             │
│  - Protection DDoS                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Tunnel chiffré (cloudflared)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  NixOS Server                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  systemd.services.cloudflared                          │ │
│  │  - Connexion sortante sécurisée                        │ │
│  │  - Géré par NixOS                                      │ │
│  │  - Pas de Docker                                       │ │
│  └───────────────────┬────────────────────────────────────┘ │
│                      │                                       │
│                      ▼                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  services.caddy - :80/:443                             │ │
│  │  - Configuration déclarative                           │ │
│  │  - HTTPS auto (Let's Encrypt)                          │ │
│  │  - Géré par NixOS                                      │ │
│  └───────────────────┬────────────────────────────────────┘ │
│                      │                                       │
│                      ▼                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Site Astro statique (buildé par Nix)                 │ │
│  │  - /nix/store/xxx-j12zdotcom/                          │ │
│  │  - Immuable                                            │ │
│  │  - Rollback possible                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Composants

### 1. Nix Flake (`flake.nix`)

**Rôle** : Point d'entrée déclaratif pour tout le projet

**Contenu** :
- **`packages`** : Build du site Astro (Node.js + pnpm)
- **`nixosModules`** : Module NixOS réutilisable pour déployer le site
- **`devShells`** : Environnement de développement
- **`apps`** : Raccourcis pour `dev` et `build`

**Avantages** :
- ✅ Reproductible : même build partout
- ✅ Versionné : comme le code source
- ✅ Déclaratif : pas de "installer Node.js" manuel
- ✅ Rollback : retour arrière facile

### 2. Module NixOS (`j12z-webserver`)

**Rôle** : Configuration système pour servir le site

**Options exposées** :
```nix
services.j12z-webserver = {
  enable = true;
  domain = "jeremiealcaraz.com";
  wwwDomain = "www.jeremiealcaraz.com";
  email = "hello@jeremiealcaraz.com";

  # Cloudflare Tunnel
  enableCloudflaredTunnel = true;
  cloudflaredTokenFile = "/run/secrets/cloudflare-tunnel-token";
};
```

**Ce qu'il fait** :
- Configure Caddy avec le site buildé
- Active le tunnel Cloudflare (si demandé)
- Ouvre les ports firewall (80, 443)
- Crée les services systemd
- Configure les headers de sécurité

### 3. Service Caddy (NixOS)

**Rôle** : Reverse proxy géré par NixOS

**Configuration** :
```nix
services.caddy = {
  enable = true;
  email = "hello@jeremiealcaraz.com";
  virtualHosts."jeremiealcaraz.com" = {
    # Voir flake.nix pour config complète
  };
};
```

**Avantages vs Docker** :
- ✅ Intégré à systemd : `systemctl status caddy`
- ✅ Logs unifiés : `journalctl -u caddy`
- ✅ Rechargement sans downtime : `systemctl reload caddy`
- ✅ Pas de conteneur, moins de layers

### 4. Service cloudflared (systemd)

**Rôle** : Tunnel Cloudflare en service natif

**Configuration** :
```nix
systemd.services.cloudflared = {
  description = "Cloudflare Tunnel";
  after = [ "network.target" ];
  wantedBy = [ "multi-user.target" ];

  serviceConfig = {
    ExecStart = "${pkgs.cloudflared}/bin/cloudflared tunnel run --token $(cat /run/secrets/cloudflare-tunnel-token)";
    Restart = "always";
    # Hardening de sécurité...
  };
};
```

**Avantages vs Docker** :
- ✅ Sécurité renforcée (DynamicUser, ProtectSystem, etc.)
- ✅ Intégration systemd native
- ✅ Moins de ressources

---

## 🔄 Flux de déploiement

### Développement local

```bash
# 1. Entrer dans le shell de dev
nix develop

# 2. Lancer le serveur de dev
pnpm dev

# 3. Builder le site
nix build
# → Résultat dans ./result/
```

### Déploiement sur serveur NixOS

```bash
# Sur ton laptop
nixos-rebuild switch \
  --flake .#jeremie-web \
  --target-host root@ton-serveur.com \
  --build-host root@ton-serveur.com
```

**Ce que ça fait** :
1. Build le site Astro → `/nix/store/xxx-j12zdotcom/`
2. Copie vers le serveur
3. Active le module NixOS
4. Configure Caddy avec le nouveau site
5. Active cloudflared
6. Recharge les services (sans downtime)

---

## 🌟 Avantages de NixOS vs Docker

| Aspect | Docker Compose | NixOS |
|--------|----------------|-------|
| **Déclaratif** | Oui (docker-compose.yml) | Oui (flake.nix) |
| **Reproductible** | Partiel (cache layers) | Total (hash content-addressed) |
| **Rollback** | Non (sauf volumes) | Oui (générations NixOS) |
| **Isolation** | Conteneurs | Services systemd |
| **Ressources** | Overhead Docker | Natif (moins de RAM/CPU) |
| **Logs** | `docker logs` | `journalctl` (unifié) |
| **Sécurité** | Namespaces | systemd hardening |
| **Complexité** | 3 outils (Docker, Compose, Host) | 1 outil (NixOS) |
| **Portabilité** | Très portable (Linux/Mac/Win) | NixOS uniquement |

---

## 🗂️ Structure du projet

```
j12zdotcom/
├── flake.nix                    # Configuration Nix principale
├── flake.lock                   # Verrouillage des versions
├── package.json                 # Projet Node.js/Astro
├── pnpm-lock.yaml
├── src/                         # Code source Astro
├── public/
├── docs/
│   ├── INFRASTRUCTURE.md        # Doc Docker Compose (Phase 1)
│   ├── MIGRATION.md
│   └── infra/                   # Doc NixOS (Phase 2)
│       ├── 01-nixos-overview.md         (ce fichier)
│       ├── 02-nixos-deployment.md
│       └── 03-nixos-vs-docker.md
└── docker-compose.yml           # Conservé pour dev/test rapide
```

---

## 🔐 Gestion des secrets

### Token Cloudflare Tunnel

**❌ Ne JAMAIS commiter le token dans Git**

**✅ Solutions recommandées :**

1. **Fichier secret hors repo** :
```bash
# Sur le serveur
echo "eyJhIjoiYmMxZ..." > /run/secrets/cloudflare-tunnel-token
chmod 600 /run/secrets/cloudflare-tunnel-token
```

2. **sops-nix** (recommandé) :
```nix
# Dans ta config NixOS
sops.secrets.cloudflare-tunnel-token = {
  sopsFile = ./secrets.yaml;
  owner = "cloudflared";
};
```

3. **agenix** :
```nix
age.secrets.cloudflare-tunnel-token.file = ./secrets/cloudflare-tunnel.age;
```

---

## 🧪 Tester localement (NixOS VM)

Tu peux tester sans serveur dédié :

```bash
# Créer une VM NixOS pour tester
nixos-rebuild build-vm --flake .#jeremie-web

# Lancer la VM
./result/bin/run-jeremie-web-vm

# Tester dans la VM
curl http://localhost
```

---

## 📊 Comparaison des phases

### Phase 1 : Docker Compose

**Avantages** :
- Setup rapide (5 minutes)
- Familier pour la plupart des devs
- Test facile en local

**Inconvénients** :
- Configuration système séparée du code
- Pas de rollback natif
- Overhead Docker

### Phase 2 : NixOS (actuelle)

**Avantages** :
- Configuration unifiée (infra = code)
- Rollback natif (`nixos-rebuild switch --rollback`)
- Pas de Docker (moins de ressources)
- Reproductible à 100%

**Inconvénients** :
- Courbe d'apprentissage Nix
- NixOS uniquement (pas de Ubuntu/Debian)
- Build times plus longs (première fois)

---

## 🎓 Philosophie Nix

> **"Configuration as Code, done right"**

**Principes** :
1. **Déclaratif** : Tu décris le résultat, pas les étapes
2. **Reproductible** : Même input = même output
3. **Atomique** : Changements all-or-nothing
4. **Rollback** : Retour arrière toujours possible
5. **Isolé** : Pas de conflits entre versions

**En pratique** :
```bash
# Build le site
nix build

# Entre dans le résultat
cd result/
ls
# → index.html, _astro/, etc.

# Voir où c'est vraiment
readlink result
# → /nix/store/abc123-j12zdotcom/
```

**Le `/nix/store` est immuable** : une fois buildé, jamais modifié.

---

## 🚀 Prochaines étapes

1. **Ajouter CI/CD** : GitHub Actions qui build et déploie via Nix
2. **Secrets management** : Intégrer sops-nix ou agenix
3. **Monitoring** : Prometheus + Grafana en modules NixOS
4. **Backup** : Script Nix pour backup automatique
5. **Multi-environnements** : `dev`, `staging`, `prod` dans la flake

---

## 📚 Ressources

- [Nix Flakes](https://nixos.wiki/wiki/Flakes)
- [NixOS Manual](https://nixos.org/manual/nixos/stable/)
- [Caddy on NixOS](https://search.nixos.org/options?query=services.caddy)
- [systemd hardening](https://www.freedesktop.org/software/systemd/man/systemd.exec.html)

---

## 💡 FAQ NixOS

**Q: Dois-je supprimer Docker Compose ?**
R: Non ! Garde-le pour dev/test rapide. NixOS pour la prod.

**Q: Comment débugger si ça marche pas ?**
R: `journalctl -u caddy -f` et `journalctl -u cloudflared -f`

**Q: Rollback comment ?**
R: `nixos-rebuild switch --rollback` ou boot sur ancienne génération

**Q: Le build est lent, normal ?**
R: Première fois oui. Après c'est caché. Utilise un cache binaire.

**Q: Puis-je utiliser cette flake sur ma machine perso ?**
R: Oui ! Mais le module webserver sera inactif (sauf si tu actives `services.j12z-webserver.enable = true`)
