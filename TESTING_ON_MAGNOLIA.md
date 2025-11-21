# 🧪 Guide de test sur la VM magnolia

Ce guide te permet de tester tous les scripts de build Nix sur ta VM **magnolia**.

## 📋 Prérequis

- VM magnolia accessible (SSH configuré)
- Nix installé sur magnolia
- Git installé sur magnolia

---

## 🔌 Étape 1 : Se connecter à magnolia

```bash
# Depuis ton laptop/machine locale
ssh magnolia

# Ou avec user@host si nécessaire
# ssh user@magnolia
# ssh root@magnolia.local
```

---

## 📥 Étape 2 : Cloner le projet sur la bonne branche

```bash
# Se placer dans un dossier de travail (ex: ~/ ou ~/projects)
cd ~

# Cloner le repo directement sur la branche de test
git clone -b claude/setup-local-build-013sjDQ8tRJxEqEa3mz3KCqq \
  https://github.com/JeremieAlcaraz/j12zdotcom.git

# Entrer dans le projet
cd j12zdotcom

# Vérifier qu'on est sur la bonne branche
git branch --show-current
# Doit afficher : claude/setup-local-build-013sjDQ8tRJxEqEa3mz3KCqq
```

**Alternative si le repo est déjà cloné :**

```bash
cd ~/j12zdotcom

# Fetch les dernières branches
git fetch origin

# Checkout la branche de test
git checkout claude/setup-local-build-013sjDQ8tRJxEqEa3mz3KCqq

# Pull les derniers changements
git pull origin claude/setup-local-build-013sjDQ8tRJxEqEa3mz3KCqq
```

---

## ✅ Étape 3 : Vérifier la configuration Nix

```bash
# Vérifier que Nix est bien installé
nix --version

# Vérifier que les flakes sont activés
nix flake show
# Si erreur "experimental feature 'flakes' is disabled", activer les flakes :
# mkdir -p ~/.config/nix
# echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
```

---

## 🧪 Étape 4 : Tester les scripts un par un

### Test 1️⃣ : Build automatique avec gestion du hash

```bash
# Lancer le script de build
./scripts/build-nix.sh
```

**Résultat attendu :**
```
ℹ️  Tentative de build Nix (.#default)...
✅ Build réussi, aucun hash à mettre à jour.
ℹ️  Résultat disponible dans ./result/
ℹ️  Pour servir le site : ./scripts/serve-local.sh
```

**Vérification :**
```bash
# Vérifier que le lien result existe
ls -la result

# Vérifier le contenu du site buildé
ls -la result/
# Doit afficher : index.html, _astro/, assets/, etc.

# Voir le chemin du store Nix
readlink result
# Doit afficher : /nix/store/xxxxx-j12zdotcom
```

---

### Test 2️⃣ : Serveur local simple

```bash
# Lancer le serveur local
./scripts/serve-local.sh
```

**Résultat attendu :**
```
🚀 Démarrage du serveur local...

📁 Dossier servi : /nix/store/xxxxx-j12zdotcom
🌐 URL : http://localhost:8080

Appuyez sur Ctrl+C pour arrêter
```

**Vérification :**

Depuis un autre terminal (ou depuis ton laptop si magnolia a un IP accessible) :

```bash
# Test avec curl
curl http://localhost:8080

# Ou depuis ton laptop (si magnolia a l'IP 192.168.1.100 par exemple)
curl http://192.168.1.100:8080
```

Tu dois voir le HTML de ta page d'accueil.

**Arrêter le serveur :**
```bash
# Appuyer sur Ctrl+C dans le terminal du serveur
```

---

### Test 3️⃣ : Serveur Caddy (comme en production)

```bash
# Lancer Caddy avec la config de production
./scripts/test-caddy-local.sh
```

**Résultat attendu :**
```
🔷 Démarrage de Caddy...
📁 Dossier servi : /nix/store/xxxxx-j12zdotcom
🌐 URL : http://localhost:8080

Appuyez sur Ctrl+C pour arrêter
```

**Vérification :**

```bash
# Test avec curl (avec headers)
curl -I http://localhost:8080

# Tu dois voir :
# - HTTP/1.1 200 OK
# - Content-Encoding: gzip (ou zstd)
# - X-Content-Type-Options: nosniff
# - etc.
```

**Arrêter Caddy :**
```bash
# Ctrl+C
```

---

### Test 4️⃣ : Script all-in-one (build + serve)

```bash
# Build et serve en une commande
./scripts/dev-nix.sh
```

**Résultat attendu :**
```
🔨 Build du site...
ℹ️  Tentative de build Nix (.#default)...
✅ Build réussi, aucun hash à mettre à jour.

🌐 Démarrage du serveur...
🚀 Démarrage du serveur local...
📁 Dossier servi : /nix/store/xxxxx-j12zdotcom
🌐 URL : http://localhost:8080
```

**Vérification :**
```bash
curl http://localhost:8080
```

---

## 🔄 Étape 5 : Tester le changement de hash (simulation)

Ce test simule ce qui se passe quand tu ajoutes une dépendance.

### 5.1 : Modifier le pnpm-lock.yaml

```bash
# Entrer dans le devShell Nix
nix develop

# Installer une nouvelle dépendance (exemple)
pnpm add -D prettier-plugin-organize-imports

# Sortir du devShell
exit
```

### 5.2 : Relancer le build

```bash
# Le hash va changer, le script doit le détecter
./scripts/build-nix.sh
```

**Résultat attendu :**
```
ℹ️  Tentative de build Nix (.#default)...
⚠️  Nouveau hash pnpm détecté : sha256-XXXXXXXXXXXXXXXXX

Mettre à jour le hash dans flake.nix ? [O/n] (auto O dans 3s) :
```

**Options :**

1. **Laisser faire automatiquement** (attendre 3s)
   ```
   ℹ️  Timeout atteint, mise à jour automatique...
   ✏️  Mise à jour du hash dans flake.nix...
   ✅ Hash mis à jour dans flake.nix

   🚀 Relance du build Nix...
   ✅ Build terminé avec succès ! 🎉
   ```

2. **Accepter manuellement** (appuyer sur `Entrée` ou `O`)
   ```
   ✏️  Mise à jour du hash dans flake.nix...
   ✅ Hash mis à jour dans flake.nix

   🚀 Relance du build Nix...
   ✅ Build terminé avec succès ! 🎉
   ```

3. **Refuser** (appuyer sur `n`)
   ```
   ⛔ Hash non mis à jour. Arrêt.
   ```

### 5.3 : Vérifier que le hash a été mis à jour

```bash
# Voir le changement dans flake.nix
git diff flake.nix

# Tu dois voir :
# -  hash = "sha256-ANCIENNEHASH...";
# +  hash = "sha256-NOUVEAUHASH...";
```

---

## 📊 Étape 6 : Récapitulatif des tests

### ✅ Checklist de validation

- [ ] `./scripts/build-nix.sh` → Build réussi
- [ ] `result/` existe et contient le site buildé
- [ ] `./scripts/serve-local.sh` → Serveur démarre sur port 8080
- [ ] `curl http://localhost:8080` → Retourne du HTML
- [ ] `./scripts/test-caddy-local.sh` → Caddy démarre avec headers de sécurité
- [ ] `./scripts/dev-nix.sh` → Build + serve fonctionne
- [ ] Changement de hash détecté et mis à jour automatiquement

---

## 🧹 Étape 7 : Nettoyage (optionnel)

```bash
# Annuler les modifications de test
git restore flake.nix
git restore pnpm-lock.yaml
git restore package.json

# Ou tout annuler d'un coup
git reset --hard origin/claude/setup-local-build-013sjDQ8tRJxEqEa3mz3KCqq

# Nettoyer le store Nix (optionnel)
nix-collect-garbage

# Supprimer le lien result
rm result
```

---

## 🐛 Troubleshooting

### Problème : "nix: command not found"

**Solution :** Installer Nix sur magnolia
```bash
sh <(curl -L https://nixos.org/nix/install) --daemon
```

### Problème : "experimental feature 'flakes' is disabled"

**Solution :** Activer les flakes
```bash
mkdir -p ~/.config/nix
echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
```

### Problème : "Permission denied" sur les scripts

**Solution :** Rendre les scripts exécutables
```bash
chmod +x scripts/*.sh
```

### Problème : "Port 8080 already in use"

**Solution :** Utiliser un autre port
```bash
./scripts/serve-local.sh 3000
./scripts/test-caddy-local.sh 8443
```

### Problème : Le build échoue avec des erreurs pnpm

**Solution :** Vider le cache pnpm et rebuild
```bash
nix develop
pnpm store prune
exit
./scripts/build-nix.sh
```

---

## 🎉 Résultat attendu

Si tous les tests passent, tu auras validé :

✅ Le build Nix fonctionne sur magnolia
✅ Les scripts automatiques fonctionnent
✅ La gestion automatique du hash fonctionne
✅ Le serveur local fonctionne
✅ La config Caddy fonctionne

**Tu es prêt pour les prochaines phases :**
- Phase 4 : Tester Cloudflare Tunnel
- Phase 5 : Intégrer au serveur NixOS
- Phase 6 : Déploiement automatique

---

## 📝 Commandes rapides (copier/coller)

```bash
# Se connecter à magnolia
ssh magnolia

# Cloner le projet
cd ~ && git clone -b claude/setup-local-build-013sjDQ8tRJxEqEa3mz3KCqq \
  https://github.com/JeremieAlcaraz/j12zdotcom.git && cd j12zdotcom

# Test 1 : Build
./scripts/build-nix.sh

# Test 2 : Serve
./scripts/serve-local.sh
# Ctrl+C pour arrêter

# Test 3 : Caddy
./scripts/test-caddy-local.sh
# Ctrl+C pour arrêter

# Test 4 : All-in-one
./scripts/dev-nix.sh
# Ctrl+C pour arrêter

# Test 5 : Changement de hash
nix develop
pnpm add -D prettier-plugin-organize-imports
exit
./scripts/build-nix.sh
# Attendre 3s ou appuyer sur Entrée

# Vérifier
git diff flake.nix
```

---

Bon test ! 🚀
