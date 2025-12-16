# Secrets Management avec SOPS

Ce dossier contient les secrets chiffrés pour l'environnement de **développement local** uniquement.

## 📁 Structure

- `dev.enc.env` - Secrets de développement (chiffrés avec SOPS + age)

## 🔐 Principe

- **Dev (ce repo)**: Secrets de développement (clés API sandbox, tokens de test)
- **Prod (infra NixOS)**: Secrets de production (gérés dans votre config NixOS avec sops-nix)

## 🛠️ Utilisation

### Chargement automatique avec direnv (Recommandé)

Les secrets sont **automatiquement déchiffrés et chargés** quand vous entrez dans le projet grâce à `.envrc`.

```bash
cd ~/Dev/.../j12zdotcom  # ✨ Secrets chargés automatiquement
pnpm dev                  # ✅ Variables déjà disponibles
```

**Première fois uniquement :**
```bash
direnv allow
```

### Déchiffrer manuellement (si besoin)

```bash
# Voir les secrets en clair (sans modifier le fichier)
sops -d secrets/dev.enc.env

# Exporter dans votre shell
export $(sops -d secrets/dev.enc.env | xargs)
```

### Éditer les secrets

```bash
# Ouvrir l'éditeur pour modifier les secrets
sops secrets/dev.enc.env
```

SOPS déchiffrera automatiquement, ouvrira votre éditeur, puis rechiffrera à la sauvegarde.

### Ajouter un nouveau secret

```bash
sops secrets/dev.enc.env
# Ajoutez votre ligne: NEW_SECRET=valeur
# Sauvegardez et quittez
```

## 🔑 Clé de chiffrement

Les secrets sont chiffrés avec votre clé age personnelle située dans `~/.config/sops/age/keys.txt` (spec XDG).

**Clé publique**: `age1nt3ly627s6eqcv97zyw3n489gh7nt2jlrq6mfhucct8wq4lgku6saynhhw`

## ⚠️ Important

- ✅ **Versionnez** les fichiers `.enc.env` (ils sont chiffrés)
- ❌ **Ne versionnez JAMAIS** les fichiers déchiffrés (`.env`, `dev.env`, etc.)
- 🔒 Gardez votre clé privée age en sécurité (`~/.config/sops/age/keys.txt`)
- 🚫 Les secrets de production ne sont PAS dans ce repo

## 📚 Documentation

- [SOPS](https://github.com/getsops/sops)
- [age](https://github.com/FiloSottile/age)
