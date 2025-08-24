# Architecture du projet

## Aperçu général
Ce dépôt utilise [Astro](https://astro.build) avec une approche _Atomic Design_ pour organiser l’interface utilisateur. Le code est réparti en plusieurs niveaux clairement délimités : **shortcodes**, **atoms**, **molecules**, **organisms**, **sections**, **layouts** et **pages**. Une interface dédiée `/style-guide` permet de visualiser chaque niveau en développement.

## Configuration Astro
La configuration centrale se trouve dans `astro.config.ts`. Elle active React, Svelte, MDX, l’auto‑import de shortcodes et Tailwind CSS via Vite :

```ts
// astro.config.ts
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import AutoImport from 'astro-auto-import'

export default defineConfig({
  integrations: [
    react(),
    svelte(),
    sitemap(),
    AutoImport({
      imports: [
        '@/components/shortcodes/Button',
        '@/components/shortcodes/Accordion',
        '@/components/shortcodes/Notice',
        '@/components/shortcodes/Video',
        '@/components/shortcodes/Youtube',
        '@/components/shortcodes/Tabs',
        '@/components/shortcodes/Tab',
      ],
    }),
    mdx(),
  ],
  vite: {
    plugins: [tsconfigPaths(), tailwindcss()],
  },
  output: 'static',
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  markdown: {
    remarkPlugins: [
      'remark-toc',
      ['remark-collapse', { test: 'Table of contents' }],
    ],
  },
})
```

## Hiérarchie des composants
### Shortcodes (MDX)
Les shortcodes sont des composants React utilisables directement dans les fichiers MDX grâce à l’auto‑import. Exemple :

```tsx
// src/components/shortcodes/Accordion.tsx
const Accordion = ({ title, children, className }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className={`collapse collapse-arrow ${open ? 'collapse-open' : ''} ${className ?? ''}`}>
      <button className="collapse-title text-left" onClick={() => setOpen(!open)}>
        {title}
      </button>
      <div className="collapse-content">{children}</div>
    </div>
  )
}
export default Accordion
```

### Atoms
Les _atoms_ sont les plus petits éléments graphiques, sans dépendance métier. Exemple :

```astro
---
// src/components/atoms/Halo.astro
---
<div class="halo-effect">
  <!-- gradients et animations SVG -->
</div>
```

### Molecules
Les _molecules_ combinent plusieurs atoms. Exemple de pagination :

```astro
---
// src/components/molecules/Pagination.astro
const { section, currentPage = 1, totalPages = 1 } = Astro.props
---
<div class="join" role="navigation" aria-label="Pagination">
  <!-- boutons Précédent / Suivant et numéros de page -->
</div>
```

### Organisms
Les _organisms_ assemblent atoms et molecules pour créer des blocs autonomes. Exemple :

```astro
---
// src/components/organisms/BlogCard.astro
import ImageMod from '@/components/atoms/ImageMod.astro'
const { data } = Astro.props
---
<div class="card bg-base-100 flex h-full flex-col shadow-sm">
  <!-- image, métadonnées et bouton "Lire la suite" -->
</div>
```

### Sections
Les sections structurent une page en rassemblant plusieurs organisms. Exemple :

```astro
---
// src/components/sections/HeroSection.astro
import Halo from '@/components/atoms/Halo.astro'
import ImageMod from '@/components/atoms/ImageMod.astro'
---
<section class="flex min-h-[max(85vh,500px)] items-center justify-center">
  <!-- contenu du hero -->
</section>
```

Le style guide inclut aussi l’intégration d’un calendrier [Luma](https://lu.ma) via une balise `iframe` pour illustrer l’ajout de services externes.

### Layouts
Les layouts définissent la structure HTML globale et gèrent les transitions de vue. Exemple de layout principal :

```astro
---
// src/layouts/BaseLayout.astro
import Header from '@/components/layout/SiteHeader.astro'
import Footer from '@/components/layout/SiteFooter.astro'
import { ClientRouter } from 'astro:transitions'
---
<html lang="fr">
  <head>
    <ClientRouter />
  </head>
  <body class="min-h-screen">
    <Header />
    <main class="overflow-x-hidden pt-16">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

Un layout spécifique `StyleGuideLayout.astro` sert à la visualisation des composants avec un en‑tête et un pied de page de développement.

### Pages
Les pages résident dans `src/pages`. Chaque fichier combine un layout et une ou plusieurs sections pour produire une route statique (`about.astro`, `index.astro`, etc.).

## Interface de style guide
Le dossier `/style-guide` expose les différents niveaux de composants dans un environnement isolé. L’en‑tête de développement propose cinq boutons menant aux pages _Atoms_, _Molecules_, _Organisms_, _Sections_ et _Shortcodes MDX_. Le pied de page de cette interface contient un bouton pour revenir à la racine du site. De plus, le footer principal du site affiche un lien **UI** pointant vers cette interface uniquement en mode développement.

## Frontières et bonnes pratiques
- **Shortcodes** : limités aux contenus MDX, sans logique métier globale.
- **Atoms** : éléments graphiques simples, réutilisables partout.
- **Molecules** : composition légère d’atoms.
- **Organisms** : blocs fonctionnels complets, réutilisables dans plusieurs sections.
- **Sections** : regroupent plusieurs organisms pour structurer une page.
- **Layouts** : gèrent le squelette HTML, les imports globaux et les transitions.
- **Pages** : orchestrent layout + sections pour chaque route.

Cette séparation claire facilite la maintenance, le test et la réutilisation des composants tout en offrant une vue d’ensemble grâce au style guide.
