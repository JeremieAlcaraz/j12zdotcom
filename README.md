# Mon Site Personnel

Ce projet est mon site web personnel, servant de portfolio et de blog. Il n'a pas pour vocation d'être cloné et déployé directement sans modifications majeures.

## Stack Technique

- **Framework**: [Astro](https://astro.build/)
- **UI**: [React](https://react.dev/), [Svelte](https://svelte.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) avec [DaisyUI](https://daisyui.com/)
- **Linting**: [ESLint](https://eslint.org/)
- **Formatage**: [Prettier](https://prettier.io/)
- **Gestionnaire de paquets**: [pnpm](https://pnpm.io/)

## Structure du Projet

Voici un aperçu des dossiers et fichiers les plus importants :

```
/
├─── src/
│    ├─── assets/         # Images, polices et autres ressources statiques
│    ├─── components/     # Composants d'UI réutilisables (Astro, React, Svelte)
│    ├─── content/        # Collections de contenu (Markdown, MDX) pour le blog, les pages, etc.
│    ├─── layouts/        # Mises en page de base (ex: BaseLayout.astro)
│    ├─── pages/          # Fichiers Astro qui définissent les routes du site
│    └─── styles/         # Styles globaux CSS
├─── public/             # Fichiers servis directement à la racine du site (ex: robots.txt)
└─── astro.config.mjs   # Fichier de configuration principal d'Astro
```

## Commandes Disponibles

| Commande       | Description                                                            |
| -------------- | ---------------------------------------------------------------------- |
| `pnpm install` | Installe les dépendances du projet.                                    |
| `pnpm dev`     | Démarre le serveur de développement local sur `http://localhost:4321`. |
| `pnpm build`   | Compile le site pour la production dans le dossier `dist/`.            |
| `pnpm preview` | Démarre un serveur local pour prévisualiser le build de production.    |
| `pnpm lint`    | Analyse le code pour détecter les erreurs et problèmes de style.       |
| `pnpm format`  | Formate l'ensemble du code avec Prettier.                              |
| `pnpm check`   | Lance le vérificateur de types de TypeScript sur le projet.            |

