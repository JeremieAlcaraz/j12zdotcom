# Architecture Astro × Atomic Design — j12zdotcom

_Version_ : **1.2** • _Mise à jour_ : **24 août 2025** • _Auteur_ : **Jérémie** (avec IA)

---

## 0) TL;DR

- **Pattern** : Atomic Design étendu → `atoms → molecules → organisms → sections`, complété par `layout` (composants structurels) + `layouts` (fichiers Astro) + `shortcodes` (MDX) + `dev`.
- **Règle d’or** : _fetch uniquement dans `src/pages/`_ (et **éventuellement** dans un `layout` Astro pour **données globales**). Tous les composants reçoivent **des props déjà prêtes**.
- **Frontières** :
  - `atoms` : UI unitaire, aucun import au-dessus.
  - `molecules` : assemblages locaux d’atoms, aucun import depuis organisms/sections/layout.
  - `organisms` : blocs riches, **layout interne seulement** (pas de container de page / fond / ancre), **pas de fetch**.
  - `sections` : **orchestrent** la page (container/grid, fond, id/ancre) ; contiennent **organisms** et **peuvent** inclure **molecules/atoms** si nécessaire.
  - `layout/` (composants) : Header/Footer globaux ; importent atoms/molecules (pas d’organisms/sections).
  - `layouts` Astro (`src/layouts/*.astro`) : charpente `<html>/<head>` + **slots nommés** ; **n’importent pas de sections** → ce sont **les pages** qui injectent les sections dans les slots.
  - `shortcodes` : composants React pour MDX ; **aucune logique globale** (pas de fetch, pas de state global), uniquement **interactivité locale** du contenu.

- **Style Guide** : `/style-guide` affiche tous les niveaux ; lien visible **uniquement en dev**.

---

## 1) Objectifs & principes

1. **Lisibilité & réutilisation** : composants petits, typés, avec API claire.
2. **Évolutivité** : frontières d’import **strictes** (ESLint), alias `@/*`, naming stable.
3. **Performance** : hydrater le strict nécessaire (`client:visible`), images optimisées (`ImageMod`).
4. **DX** : structure prévisible, vérifications automatiques (`astro check`, `tsc --noEmit`, lint, tests fumée).

---

## 2) Arborescence (réelle et de référence)

```
src/
  assets/
    icons/                 # SVG/logo…
    img_opt/               # Images optimisées (prod)
    img_raw/               # Sources brutes (non importées directement)
    logos/
  components/
    atoms/
      Halo.astro
      ImageMod.astro
      icons/
        MoonIcon.astro
        SunIcon.astro
    molecules/
      Pagination.astro
      NavMenu.astro        # Molecule (Option stricte)
      FeatureList.astro    # (proposé)
      PriceInfo.astro      # (proposé)
    organisms/
      Card.astro           # gère les variantes DaisyUI (bordered, compact, side, glass, image-full) + variantes métier (blog, pricing)
      ContactForm.astro
      PostSidebar.astro
      TestimonialCard.astro
    sections/
      AboutSection.astro
      HeroSection.astro
      TestimonialSection.astro
    layout/                # Composants structurels globaux
      SiteHeader.astro
      SiteFooter.astro
    dev/
      TwSizeIndicator.astro
    shortcodes/            # Composants React pour MDX
      Accordion.tsx
      Button.tsx
      Notice.tsx
      Tabs.tsx
      Tab.tsx
      Video.tsx
      Youtube.tsx
  config/
    navigation.ts
    siteConfig.ts
  content/
    about/index.mdx
    blog/
      post-1.md … post-7.md
      elements.mdx
    homepage/index.md
    sections/testimonial.md
    config.ts              # Zod schemas (Astro Content Collections)
  layouts/
    BaseLayout.astro
    PostSingle.astro
    StyleGuideLayout.astro # Layout dédié au style guide
  pages/
    index.astro
    about.astro
    contact.astro
    blog/[slug].astro
    blog/index.astro
    blog/page/[page].astro
    categories/[category].astro
    categories/index.astro
    style-guide/
      index.astro          # Hub du style guide
      atoms.astro
      molecules.astro
      organisms.astro
      sections.astro
      shortcodes.mdx
  styles/
    base.css
    components.css
    theme.css              # (ou themes/douceur.css)
    index.css
    typography.css
  types/
    global.d.ts
    index.d.ts
  utils/
    contentParser.ts       # (converti depuis .astro)
    taxonomyParser.ts      # (converti depuis .astro)
    dateFormat.ts
    sortFunctions.ts
    textConverter.ts
    toggleDark.ts
    toggleTheme.ts
```

> **Note** : `contentParser.ts` / `taxonomyParser.ts` sont des utilitaires purs (zéro rendu).

---

## 3) Configuration — Astro, Vite, Tailwind, MDX

### 3.1 `astro.config.ts`

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
  vite: { plugins: [tsconfigPaths(), tailwindcss()] },
  output: 'static',
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  markdown: {
    remarkPlugins: ['remark-toc', ['remark-collapse', { test: 'Table of contents' }]],
  },
})
```

### 3.2 Alias TypeScript

```jsonc
// tsconfig.json (extrait)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
  },
}
```

> L’alias `@/*` est aussi résolu côté Vite via `vite-tsconfig-paths`.

### 3.3 Tailwind / DaisyUI (tokens & thèmes)

- **Source de vérité tokens** : Tailwind (et overrides DaisyUI si utilisé).
- Les thèmes exposent des **variables CSS** dans `styles/theme.css` (ou `styles/themes/douceur.css`).

```css
/* styles/theme.css (extrait) */
:root {
  --color-primary: 35 97% 55%;
  --color-base-100: 0 0% 100%;
}
[data-theme='dark'] {
  --color-primary: 35 97% 60%;
  --color-base-100: 222 47% 11%;
}
```

---

## 4) Niveaux & frontières (définitions opérationnelles)

### 4.1 Atoms

- **Quoi** : éléments UI unitaires (icône, bouton, image optimisée, halo décoratif…).
- **Règles** : pas de container de page, pas de fetch, API minimale.

**Exemple** — `Halo.astro`

```astro
---

---

<div class="halo-effect"><!-- gradients / SVG --></div>
```

**Exemple** — `ImageMod.astro` (normalise lazy/decoding/alt)

```astro
---
interface Props {
  src: string
  alt: string
  class?: string
}
const { src, alt, class: cls } = Astro.props
---

<img src={src} alt={alt} loading="lazy" decoding="async" class={cls} />
```

### 4.2 Molecules

- **Quoi** : petits assemblages d’atoms, layout **local** (flex, gap…).
- **Règles** : pas d’import depuis organisms/sections/layout ; pas de fetch.

**Exemple** — `Pagination.astro`

```astro
---
const { section, currentPage = 1, totalPages = 1 } = Astro.props
---

<nav class="join" aria-label="Pagination">
  <!-- boutons précédent/suivant + numéros -->
</nav>
```

**Exemple** — `NavMenu.astro`

```astro
---
interface Link {
  href: string
  label: string
}
const { links }: { links: Link[] } = Astro.props
---

<nav aria-label="Navigation principale">
  <ul class="flex items-center gap-6">
    {
      links.map(l => (
        <li>
          <a class="hover:underline" href={l.href}>
            {l.label}
          </a>
        </li>
      ))
    }
  </ul>
</nav>
```

### 4.3 Organisms

- **Quoi** : blocs riches réutilisables.
- **Règles** : **layout interne seulement** (pas de container de page / fond / ancre), pas de fetch.

**Exemples** — `Card.astro`

- Variante **blog**

  ```astro
  ---
  import Card from '@/components/organisms/Card.astro'
  const { post } = Astro.props
  ---

  <Card variant="blog" data={post} />
  ```

- Variante **pricing**

  ```astro
  ---
  import Card from '@/components/organisms/Card.astro'
  const plan = {
    title: 'Pro',
    price: '29€',
    period: 'mois',
    features: ['Support prioritaire'],
    cta: { label: 'Choisir', href: '#' },
  }
  ---

  <Card variant="pricing" data={plan} />
  ```

### 4.4 Sections (orchestration)

- **Quoi** : conteneurs de page ; **orchestrent** la composition et la mise en page de haut niveau.
- **Règles** : gèrent `container/grid`, fond, ID/ancre, mapping de listes ; **peuvent contenir organisms, et aussi molecules/atoms** si nécessaire ; pas de fetch.

**Exemple** — `HeroSection.astro`

```astro
---
import Halo from '@/components/atoms/Halo.astro'
import ImageMod from '@/components/atoms/ImageMod.astro'
interface Props {
  title: string
  subtitle?: string
}
const { title, subtitle } = Astro.props
---

<section id="hero" class="flex min-h-[max(85vh,500px)] items-center justify-center">
  <div class="container grid gap-8 lg:grid-cols-2">
    <header>
      <h1 class="mb-2 text-4xl font-bold">{title}</h1>
      {subtitle && <p class="opacity-80">{subtitle}</p>}
    </header>
    <div class="flex items-center justify-center">
      <ImageMod src="/images/logo.png" alt="Logo" class="max-w-xs" />
      <Halo />
    </div>
  </div>
</section>
```

**Exemple** — `TestimonialSection.astro` (+ `TestimonialCard.astro`)

```astro
---
import TestimonialCard from '@/components/organisms/TestimonialCard.astro'
interface T {
  quote: string
  authorName: string
  authorTitle?: string
  avatarUrl?: string
}
const { items, title = 'Ils nous font confiance' }: { items: T[]; title?: string } = Astro.props
---

<section id="testimonials" class="bg-base-200/50 py-16">
  <div class="container">
    <h2 class="mb-8 text-center text-3xl font-bold">{title}</h2>
    {
      items?.length ? (
        <div class="grid gap-6 md:grid-cols-3">
          {items.map(t => (
            <TestimonialCard {...t} />
          ))}
        </div>
      ) : (
        <p class="text-center opacity-70">Aucun témoignage pour le moment.</p>
      )
    }
  </div>
</section>
```

### 4.5 Composants de layout (`components/layout`)

- **Quoi** : Header/Footer globaux.
- **Règles** : importent **atoms/molecules** (pas d’organisms/sections) ; pas de fetch métier.

**Exemple** — `SiteHeader.astro`

```astro
---
import NavMenu from '@/components/molecules/NavMenu.astro'
const links = [
  { href: '/', label: 'Accueil' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]
---

<header class="bg-background/80 sticky top-0 z-50 backdrop-blur">
  <div class="container flex h-16 items-center justify-between">
    <a href="/" class="font-semibold">j12zdotcom</a>
    <NavMenu {links} />
  </div>
</header>
```

### 4.6 Layouts Astro (`src/layouts/*.astro`)

- **Quoi** : charpente `<html>`, `<head>` + **slots nommés**.
- **Règle clé** : **un layout n’importe pas de sections**. Il expose des slots ; **les pages importent les sections** et les injectent dans ces slots.
- **Fetch** : seulement pour **données globales** (ex. navigation depuis `config/navigation.ts`).

**Exemple** — `BaseLayout.astro`

```astro
---
import SiteHeader from '@/components/layout/SiteHeader.astro'
import SiteFooter from '@/components/layout/SiteFooter.astro'
import { ClientRouter } from 'astro:transitions'
interface Props {
  title?: string
}
const { title = 'j12zdotcom' } = Astro.props
---

<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <ClientRouter />
    <slot name="head" />
  </head>
  <body class="min-h-dvh">
    <SiteHeader />
    <main class="overflow-x-hidden pt-16">
      <slot />
    </main>
    <SiteFooter />
  </body>
</html>
```

**Exemple** — `PostSingle.astro` (layout d’article)

```astro
---
import BaseLayout from './BaseLayout.astro'
export interface Props {
  title: string
}
const { title } = Astro.props
---

<BaseLayout title={title}>
  <slot name="hero" />
  <main class="container grid gap-8 lg:grid-cols-[1fr_320px]">
    <section><slot /></section>
    <aside><slot name="sidebar" /></aside>
  </main>
</BaseLayout>
```

---

## 5) Pages, pipeline de données & Content Collections

### 5.1 Pipeline **data-down** (de la page vers l’UI)

```
Page (fetch)    → prépare les données (Content Collections, CMS, API)
  ↓ props prêtes
Section (container + orchestration + mapping)
  ↓
Organism (bloc riche, sans fetch)
  ↓
Molecule (assemblage local)
  ↓
Atom (UI pure)
```

### 5.2 Exemple page réelle — `pages/blog/[slug].astro`

```astro
---
import PostSingle from '@/layouts/PostSingle.astro'
import HeroSection from '@/components/sections/HeroSection.astro'
import PostSidebar from '@/components/organisms/PostSidebar.astro'
import { getCollection } from 'astro:content'

const posts = await getCollection('blog')
const post = posts.find(p => p.slug === Astro.params.slug)!
const { data, body } = post
---

<PostSingle title={data.title}>
  <HeroSection slot="hero" title={data.title} subtitle={data.description} />
  <article class="prose mx-auto">{body}</article>
  <PostSidebar slot="sidebar" tags={data.tags} />
</PostSingle>
```

### 5.3 Content Collections — `src/content/config.ts` (exemple)

```ts
import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
  }),
})

export const collections = { blog }
```

---

## 6) Shortcodes MDX — règles & exemples

- **But** : enrichir le **contenu MD/MDX** avec un peu d’interactivité UI.
- **Interdit** : logique globale (state global), **fetch**, side‑effects hors contenu.
- **Autorisé** : interactivité **locale** (toggle, tabs, accordéon, lecteur vidéo simple…).

**Correct** — `Accordion.tsx`

```tsx
import { useState } from 'react'
const Accordion = ({ title, children, className }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className={`collapse-arrow collapse ${open ? 'collapse-open' : ''} ${className ?? ''}`}>
      <button className="collapse-title text-left" onClick={() => setOpen(!open)}>
        {title}
      </button>
      <div className="collapse-content">{children}</div>
    </div>
  )
}
export default Accordion
```

**Correct** — `Notice.tsx`

```tsx
const Notice = ({ type = 'info', children }) => (
  <div className={`notice notice-${type}`}>{children}</div>
)
export default Notice
```

**Correct** — `Video.tsx`

```tsx
function Video({ title, width = 500, height = 'auto', src, ...rest }) {
  return (
    <video width={width} height={height} controls {...rest}>
      <source src={src.match(/^http/) ? src : `/videos/${src}`} type="video/mp4" />
      {title}
    </video>
  )
}
export default Video
```

**Incorrect** — (à **ne pas** faire)

```tsx
// ❌ Fait un fetch vers Content Collections ou une API pour charger des posts
// ❌ Met/enlit un state global (contexte app) depuis un shortcode
```

**Usage MDX**

````mdx
import Notice from '@/components/shortcodes/Notice'
import Tabs from '@/components/shortcodes/Tabs'
import Tab from '@/components/shortcodes/Tab'

# Titre

<Notice type="tip">Astro + MDX = ❤️</Notice>

<Tabs>
  <Tab title="Code">```js\nconsole.log('hello')\n```</Tab>
  <Tab title="Vidéo">
    <Video src="https://www.w3schools.com/html/mov_bbb.mp4" width="100%" />
  </Tab>
</Tabs>
````

---

## 7) Style Guide — `/style-guide`

- **Objectif** : visualiser chaque niveau dans un environnement isolé.
- **Layout dédié** : `StyleGuideLayout.astro` (header/pied de page de dev).
- **Navigation** : 5 entrées — Atoms, Molecules, Organisms, Sections, Shortcodes.
- **Lien** : visible dans le footer principal **uniquement en dev** :

```astro
{
  import.meta.env.DEV && (
    <a class="link" href="/style-guide">
      UI
    </a>
  )
}
```

**Exemple** — `pages/style-guide/index.astro`

```astro
---
import StyleGuideLayout from '@/layouts/StyleGuideLayout.astro'
---

<StyleGuideLayout>
  <ul class="list-disc space-y-2 pl-6">
    <li><a href="/style-guide/atoms">Atoms</a></li>
    <li><a href="/style-guide/molecules">Molecules</a></li>
    <li><a href="/style-guide/organisms">Organisms</a></li>
    <li><a href="/style-guide/sections">Sections</a></li>
    <li><a href="/style-guide/shortcodes">Shortcodes MDX</a></li>
  </ul>
</StyleGuideLayout>
```

---

## 8) Interactivité (îlots Astro) & performance

- **Hydratation par défaut** : `client:visible` (hydrate quand le composant devient visible).
- **Autres modes** : `client:idle`, `client:media` (cas spécifiques), `client:load` (rare).
- **Images** : utiliser l’atom `ImageMod` (lazy, decoding async) pour uniformiser.

**Gating DEV**

```astro
{
  import.meta.env.DEV && (
    <div class="fixed right-2 bottom-2 z-[9999]">
      <TwSizeIndicator />
    </div>
  )
}
```

---

## 9) Qualité : Lint, Prettier, Tests

### 9.1 ESLint — frontières d’import

```ts
// eslint.config.ts (extrait)
import pluginImport from 'eslint-plugin-import'
export default [
  {
    plugins: { import: pluginImport },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // ATOMS: ne peuvent rien importer d'au-dessus
            { target: 'src/components/atoms', from: 'src/components/molecules' },
            { target: 'src/components/atoms', from: 'src/components/organisms' },
            { target: 'src/components/atoms', from: 'src/components/sections' },
            { target: 'src/components/atoms', from: 'src/components/layout' },

            // MOLECULES: pas d’import vers organisms/sections/layout
            { target: 'src/components/molecules', from: 'src/components/organisms' },
            { target: 'src/components/molecules', from: 'src/components/sections' },
            { target: 'src/components/molecules', from: 'src/components/layout' },

            // ORGANISMS: pas d’import depuis sections/layout
            { target: 'src/components/organisms', from: 'src/components/sections' },
            { target: 'src/components/organisms', from: 'src/components/layout' },

            // SECTIONS: pas d’import depuis layout
            { target: 'src/components/sections', from: 'src/components/layout' },

            // LAYOUT components: peuvent importer atoms/molecules, pas organisms/sections
            { target: 'src/components/layout', from: 'src/components/organisms' },
            { target: 'src/components/layout', from: 'src/components/sections' },

            // DEV: ne doit pas fuiter vers le reste
            { target: 'src/components/**/*', from: 'src/components/dev' },
          ],
        },
      ],
    },
  },
]
```

### 9.2 Prettier

- Plugins recommandés : `prettier-plugin-astro`, `prettier-plugin-tailwindcss`.

### 9.3 Tests & CI

- **Typecheck** : `pnpm astro check && pnpm tsc --noEmit` (CI et local).
- **Fumée** (Playwright) :
  - vérifie que la page charge,
  - landmarks présents (`header`, `main`, `footer`),
  - au moins 1 scénario de navigation (ex: blog listing → post).

- **A11y** : axe devtools, focus visible, `alt` sur images, `aria-label` sur liens icône.

---

## 10) FAQ — Layouts & Sections (clarification importante)

- **Qui importe les sections ?** → **les pages**. Un layout expose des **slots** ; la page **injecte** les sections dans ces slots.
- **Un layout peut-il importer des sections ?** → **Non (recommandé)**. Il doit rester générique et réutilisable. Il peut toutefois importer **des composants de layout** (Header/Footer) et **atoms/molecules** pour sa structure.
- **Les sections peuvent-elles contenir des atoms/molecules directement ?** → **Oui**. Elles orchestrent le rendu et peuvent injecter des atoms/molecules si besoin, tout en composant principalement des organisms.

---

## 11) Checklist PR (rappel)

- [ ] Fetch uniquement dans `pages/` (ou layout pour **global**).
- [ ] Props typées & JSDoc.
- [ ] Pas de texte dur dans atoms/organisms (passez via props, i18n‑ready).
- [ ] Respect des niveaux & frontières (ESLint OK).
- [ ] DEV components protégés (gating `import.meta.env.DEV`).
- [ ] Images via `ImageMod` par défaut.
- [ ] Tests fumée + `astro check` + `tsc --noEmit` verts.
- [ ] Style Guide mis à jour si un nouveau composant est ajouté.

---

## 12) Décision

> On verrouille cette architecture : **Pages** = _fetch & orchestration globale_, **Sections** = _container/grid & orchestration locale (peuvent inclure organisms, molecules, atoms)_, **Organisms** = _blocs riches sans fetch_, **Molecules** = _assemblages locaux_, **Atoms** = _UI pure_. **Layouts** = _charpente + slots (n’importent pas les sections)_ ; **Shortcodes** = _interactivité locale MDX, sans logique globale_.

_Fin du document (v1.2)._
