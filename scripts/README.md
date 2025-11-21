# 🛠️ Scripts de Build Nix

Ce dossier contient des scripts pour faciliter le développement et le build du site avec Nix.

## 📋 Scripts disponibles

### 🚀 `build-nix.sh` - Build automatique avec gestion du hash

Le script principal qui build ton site et **met à jour automatiquement le hash pnpm** si nécessaire.

**Usage :**
```bash
./scripts/build-nix.sh
```

**Fonctionnement :**
1. Tente un build Nix
2. Si le hash pnpm a changé (après `pnpm install`, `pnpm add`, etc.) :
   - Détecte le nouveau hash automatiquement
   - Te demande confirmation (timeout 3s → auto-accept si pas de réponse)
   - Met à jour `flake.nix` automatiquement
   - Relance le build
3. Crée le lien symbolique `./result/` vers le site buildé

**Avantages :**
- ✅ **Zéro édition manuelle** du hash
- ✅ **Rapide** : timeout de 3s seulement
- ✅ **Automatique** : appuie juste sur Entrée (ou attends 3s)
- ✅ **Propre** : logs colorés et clairs

---

### 🌐 `serve-local.sh` - Servir le site en local

Sert le site buildé sur `http://localhost:8080`.

**Usage :**
```bash
./scripts/serve-local.sh        # Port 8080 (défaut)
./scripts/serve-local.sh 3000   # Port 3000
```

**Détection automatique du serveur :**
Le script essaie dans l'ordre :
1. `serve` (Node.js) - si installé
2. `caddy` (via nix-shell) - propre et rapide
3. `python3` - fallback universel
4. Installation temporaire de `serve` via nix-shell

---

### 🔷 `test-caddy-local.sh` - Tester avec Caddy

Sert le site avec **Caddy** (comme en production) avec :
- Gestion des erreurs 404
- Compression (gzip, zstd)
- Headers de sécurité
- Logs propres

**Usage :**
```bash
./scripts/test-caddy-local.sh        # Port 8080
./scripts/test-caddy-local.sh 8443   # Port 8443
```

Parfait pour tester la configuration Caddy **avant de déployer**.

---

### 🚀 `dev-nix.sh` - All-in-one : build + serve

Script "tout-en-un" qui :
1. Build le site avec Nix
2. Sert le résultat immédiatement

**Usage :**
```bash
./scripts/dev-nix.sh        # Build et serve sur port 8080
./scripts/dev-nix.sh 3000   # Build et serve sur port 3000
```

**Parfait pour :**
- Tester rapidement un build complet
- Vérifier le site avant un commit
- Simuler la production localement

---

## 🔄 Workflow de développement recommandé

### 1. Développement avec hot-reload (pnpm)

Pour le développement quotidien avec **hot-reload** :

```bash
# Entrer dans l'environnement Nix
nix develop

# Lancer le serveur de dev Astro
pnpm dev
```

**Quand utiliser :** Développement actif, modifications fréquentes

---

### 2. Test du build Nix (avant commit)

Avant de commit/push, tester que le build Nix fonctionne :

```bash
# Build avec Nix (auto-update du hash si besoin)
./scripts/build-nix.sh

# Servir le résultat
./scripts/serve-local.sh
```

**Quand utiliser :** Avant un commit, avant un merge, avant un deploy

---

### 3. Test complet avec Caddy (avant déploiement)

Pour tester exactement comme en production :

```bash
./scripts/build-nix.sh
./scripts/test-caddy-local.sh
```

**Quand utiliser :** Avant un déploiement en production, pour debug un problème de prod

---

### 4. Build + serve rapide (all-in-one)

Si tu veux juste tout tester d'un coup :

```bash
./scripts/dev-nix.sh
```

**Quand utiliser :** Check rapide du build complet

---

## 🎯 Exemples de cas d'usage

### Cas 1 : J'ai modifié du code Astro

```bash
# Option A : Dev avec hot-reload
nix develop
pnpm dev

# Option B : Tester le build final
./scripts/dev-nix.sh
```

### Cas 2 : J'ai ajouté une dépendance (`pnpm add ...`)

```bash
# Le hash va changer automatiquement
./scripts/build-nix.sh

# Le script va :
# 1. Détecter le nouveau hash
# 2. Te demander confirmation (3s)
# 3. Mettre à jour flake.nix
# 4. Rebuild
```

### Cas 3 : Je veux tester avant de push

```bash
# Build et teste
./scripts/build-nix.sh
./scripts/serve-local.sh

# Ouvre http://localhost:8080
# Vérifie que tout est OK
# → Commit et push
```

### Cas 4 : Problème en prod, je veux reproduire localement

```bash
# Build identique à la prod
./scripts/build-nix.sh

# Serve avec la même config Caddy que la prod
./scripts/test-caddy-local.sh
```

---

## 🔧 Troubleshooting

### Le build échoue avec "hash mismatch"

**Solution :** Le script `build-nix.sh` gère ça automatiquement !

```bash
./scripts/build-nix.sh
# → Appuie sur Entrée (ou attends 3s)
# → Le hash est mis à jour automatiquement
```

### `result/` n'existe pas

**Cause :** Tu n'as pas encore fait de build Nix.

**Solution :**
```bash
./scripts/build-nix.sh
```

### Le serveur ne démarre pas

**Vérifications :**
1. Le port est-il déjà utilisé ?
   ```bash
   lsof -i :8080  # Vérifier si le port est pris
   ```

2. `result/` existe-t-il ?
   ```bash
   ls -la result/
   ```

3. Essayer un autre port :
   ```bash
   ./scripts/serve-local.sh 3000
   ```

---

## 📖 Ressources

- [NIX.md](../NIX.md) - Guide complet Nix/NixOS
- [flake.nix](../flake.nix) - Configuration Nix du projet
- [README.md](../README.md) - Documentation générale du projet

---

## 🎉 C'est tout !

Tu as maintenant des scripts **rapides**, **automatiques** et **sans friction** pour :
- ✅ Builder ton site avec Nix
- ✅ Mettre à jour le hash automatiquement
- ✅ Tester localement
- ✅ Simuler la production

**Plus besoin de toucher manuellement à `flake.nix` !** 🚀
