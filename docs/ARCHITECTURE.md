# Architecture du Projet

Ce document offre une vue d'ensemble de l'architecture front-end de ce projet Astro. Pour une explication détaillée des règles, des patterns et de la philosophie, veuillez consulter le `Contrat d'Architecture` complet.

L'objectif de cette architecture est de garantir que le projet soit **clair**, **maintenable** et **scalable**.

## 1. Principes Fondamentaux

Notre organisation du code repose sur trois principes clés :

1. **Séparation des Responsabilités :** Chaque partie du code a un rôle unique et bien défini. Nous séparons la présentation (`ui`), la logique métier (`domain`), le contenu (`content`) et la configuration.
2. **Organisation par Fonctionnalité :** Nous groupons le code par "domaine" ou "fonctionnalité" (ex: tout ce qui concerne le blog est dans `domain/blog/`) plutôt que par type de fichier.
3. **Flux de Dépendances Unidirectionnel :** Les dépendances vont toujours du plus générique au plus spécifique (`ui` -> `domain` -> `pages`), jamais l'inverse, pour éviter les couplages forts.

## 2. Structure des Dossiers `src/`

Voici la structure de référence pour le code source de l'application.

```
src/
│
├── assets/             // Images, icônes, polices, etc.
├── config/             // Fichiers de configuration de l'application.
├── content/            // Contenu éditorial (Markdown/MDX).
├── layouts/            // Gabarits de structure de page.
├── pages/              // Routes et points d'entrée du site.
├── styles/             // Fichiers CSS globaux.
├── types/              // Définitions de types TypeScript.
├── utils/              // Fonctions utilitaires génériques.
│
├── ui/                 // Le Design System.
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
│
├── domain/             // Les fonctionnalités (métier ou support).
│   ├── blog/
│   ├── contact/
│   ├── dev/
│   ├── style-guide/
│   └── shared/
│
└── shortcodes/         // Les adaptateurs pour le contenu MDX.
    ├── generic/
    └── blog/

```

## 3. Description des Couches Principales

L'essentiel de notre code applicatif se trouve dans trois dossiers stratégiques :

### 🎨 `src/ui/` : Le Design System

- **Rôle :** Contient tous les composants visuels génériques et réutilisables.
- **Caractéristique :** Ces composants sont "bêtes" ; ils ne connaissent rien de la logique métier de l'application. Un `Button.astro` ici est juste un bouton, pas un "bouton d'achat".
- **Contenu :** Atomes, molécules, organismes.

### 🚀 `src/domain/` : Les Fonctionnalités

- **Rôle :** Organise le code par fonctionnalité, qu'elle soit destinée à l'utilisateur final (`blog`, `contact`) ou à l'équipe de développement (`style-guide`, `dev`).
- **Caractéristique :** C'est ici que la logique métier réside. Les composants de ce dossier assemblent les briques du `ui/` pour construire des fonctionnalités complètes.
- **Contenu :** Composants spécifiques, services de récupération de données, gestion d'état.

### 🔌 `src/shortcodes/` : Les Adaptateurs de Contenu

- **Rôle :** Sert de pont simple et stable entre les rédacteurs de contenu (qui écrivent en MDX) et notre système de composants.
- **Caractéristique :** Ce sont des "wrappers" légers qui importent des composants plus complexes depuis `ui/` ou `domain/`.
- **Contenu :** Fichiers `.astro` avec une API de `props` simplifiée, pensée pour l'écriture.