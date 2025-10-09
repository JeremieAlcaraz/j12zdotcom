<!-- Sync Impact Report
Version change: 1.0.0 → 1.1.0
Modified principles: All principles updated for website context
Added sections: Development Workflow, Quality Standards
Removed sections: None
Templates requiring updates: ✅ plan-template.md, spec-template.md, tasks-template.md
Follow-up TODOs: Update author name in package.json, Refine component architecture section with detailed atomic design principles
-->

# j12zdotcom Constitution

## Core Principles

### Performance First
Toutes les optimisations de performance sont prioritaires et non négociables.
- Les images doivent être optimisées (WebP/AVIF) avec des tailles responsives
- Le code JavaScript doit être minimisé et chargé de manière asynchrone
- Les animations doivent maintenir 60 FPS et être optimisées pour les appareils mobiles
- Les temps de chargement doivent rester sous 3 secondes sur 3G

### Accessibilité Universelle
L'accessibilité n'est pas optionnelle - c'est une exigence fondamentale.
- Respect strict du WCAG 2.1 AA minimum
- Navigation clavier complète et intuitive
- Support des technologies d'assistance (lecteurs d'écran, agrandisseurs)
- Contraste des couleurs supérieur à 4.5:1 pour le texte normal
- Tests d'accessibilité automatisés et manuels obligatoires

### Modernité Technique
Le code doit refléter les meilleures pratiques actuelles du développement web.
- TypeScript obligatoire pour tous les composants
- Utilisation cohérente de Tailwind CSS avec DaisyUI
- Architecture component-based (atoms/molecules/organisms)
- Support des navigateurs modernes uniquement (2 dernières versions)
- Progressive enhancement pour les fonctionnalités avancées

### Qualité du Contenu
Le contenu prime sur la technologie - le site doit servir son objectif premier.
- Hiérarchie claire de l'information avec des headings logiques
- Contenu scannable avec des listes et des courts paragraphes
- Appels à l'action explicites et bien positionnés
- Mise à jour régulière du contenu pour maintenir la pertinence
- Optimisation SEO de base pour la visibilité

### Maintenabilité Long-terme
Le code doit être facile à maintenir et faire évoluer.
- Architecture modulaire avec séparation claire des responsabilités
- Documentation des composants complexes
- Tests automatisés pour les fonctionnalités critiques
- Gestion rigoureuse des dépendances et des versions
- Révision périodique de la dette technique

## Standards de Développement

### Stack Technologique Obligatoire
- **Framework**: Astro 5.x avec support SSR hybride
- **UI**: React 19.x et Svelte 5.x selon les besoins
- **Styling**: Tailwind CSS 4.x avec DaisyUI 5.x
- **Langage**: TypeScript 5.x avec configuration stricte
- **Linters**: ESLint et Prettier configurés et appliqués

### Architecture des Composants

L'architecture suit une hiérarchie claire allant des briques UI aux orchestrateurs métier :

**Atoms** : Composants UI minimaux (bouton, icône, input). Pures, sans layout ni logique de données.

**Molecules** : Assemblages simples d'Atoms (Input + Label). Pas de logique métier.

**Organisms** : Blocs UI réutilisables (Card, Sidebar, Form). Reçoivent des données prêtes, gèrent des variantes (ex. BlogCard, OfferCard).

**Sections** : Conteneurs de mise en page regroupant des Organisms. Elles orchestrent uniquement la présentation (layout, grille, ancrage). Pas de fetch ni logique métier.

**Domains** : Modules métier.
- Responsables de la logique de données (fetch, adaptation, mapping).
- Orchestrent les Sections avec des données prêtes à l'emploi.
- Peuvent inclure des composants spécialisés liés au domaine (blog, formation, contact).

**Pages Astro** : Points d'entrée routés. Elles délèguent leur logique métier aux Domains et se limitent au contexte global (SEO, routing, meta).

**Layouts Astro** : Charpente globale du site (<html>, <head>, <body>). Intègrent les composants structurels transverses (Header, Footer) et exposent des slots nommés.

➡️ **Règles de responsabilité**

- La logique métier vit exclusivement dans les Domains.
- La présentation est assurée par Sections + Organisms.
- Les Pages restent minimales et délèguent aux Domains.
- Les Layouts ne concernent que la structure globale et transversale.

👉 **Avec cette version, chaque niveau est strictement défini :**

- **UI** → Atoms à Organisms
- **Présentation** → Sections
- **Métier** → Domains
- **Routing / SEO** → Pages
- **Structure globale** → Layouts

> Avantages clés : cohérence, réutilisation, vitesse, évolutivité, meilleure communication design ↔ dev.

## Workflow de Développement

### Processus de Développement
- Développement feature-first avec tests d'intégration
- Révision de code obligatoire pour toute modification
- Tests automatisés avant déploiement
- Déploiement continu avec prévisualisation

### Révision et Qualité
- Checklist d'accessibilité pour chaque nouvelle page
- Tests de performance sur différents appareils
- Révision UX/UI pour les nouvelles fonctionnalités
- Documentation mise à jour pour les changements majeurs

## Governance

La présente constitution prévaut sur toutes les autres pratiques de développement.
- Les amendements nécessitent une justification technique claire
- Les exceptions temporaires doivent être documentées avec plan de résolution
- Révision constitutionnelle annuelle ou lors de changements majeurs de stack
- Formation continue sur les standards web modernes

**Version**: 1.1.0 | **Ratified**: 2024-09-28 | **Last Amended**: 2024-09-28