# MIGRATION_ATOMIC.md

_But : guider l’IA (et l’humain) dans la migration de l’architecture du site Astro vers une structure Atomic Design révisée._

---

## 1. Décision

Adopter une architecture **Atomic Design** claire :

- **atoms → molecules → organisms → sections**
- - deux dossiers spécifiques : **layout/** (Header/Footer) et **dev/** (outils internes).
- Orchestration via **Layouts Astro** (slots nommés).
- **Pas de dossier `templates/`.**

---

## 2. Règles par niveau

- **Atom** : brique UI minimale, **pas de container/fond**, API réduite, pas de fetch.
- **Molecule** : assemble quelques atoms, petit layout local (flex/gap), pas de fetch.
- **Organism** : compose molecules/atoms, layout interne **seulement** (jamais container/fond/ancre). Reçoit des props, pas de fetch.
- **Section** : compose 1+ organisms, gère **container/grid de page, fond, ID/ancre**, mappe des listes de données. Pas de fetch.
- **Layout component** (`layout/`) : Header/Footer globaux, consomment seulement atoms/molecules.
- **Layout Astro** : squelette `<html>/<head>` + slots nommés. Fetch seulement pour données globales (nav, footer).
- **Dev** : composants utilisés uniquement en développement (protégés par `import.meta.env.DEV`).

---

## 3. Arborescence cible

```bash
src/components/
  atoms/
    Avatar.astro
    Badge.astro
    Button.astro
    Heading.astro
    Halo.astro
    ImageMod.astro
    PriceValue.astro
    Unit.astro
    DiscountBadge.astro
    Icon.astro
    icons/
      MoonIcon.astro
      SunIcon.astro

  molecules/
    Card.astro
    FeatureList.astro
    PriceTag.astro
    PriceInfo.astro
    Pagination.astro
    NavMenu.astro

  organisms/
    PriceCard.astro
    BlogCard.astro
    TestimonialCard.astro
    PostSidebar.astro
    ContactForm.astro

  sections/
    AboutSection.astro
    HeroSection.astro
    TestimonialSection.astro

  layout/
    SiteHeader.astro
    SiteFooter.astro

  dev/
    DevOnly.astro
    TwSizeIndicator.astro
```

---

## 4. Script de migration

```bash
#!/bin/bash
set -e

git checkout -b chore/atomic-structure-revised

mkdir -p src/components/{atoms,atoms/icons,molecules,organisms,sections,layout,dev}

# Blog
git mv src/components/blog/BlogCard.astro src/components/organisms/BlogCard.astro
git mv src/components/blog/Pagination.astro src/components/molecules/Pagination.astro
git mv src/components/blog/PostSidebar.astro src/components/organisms/PostSidebar.astro

# Common
git mv src/components/common/ImageMod/ImageMod.astro src/components/atoms/ImageMod.astro
git mv src/components/common/Header/Header.astro src/components/layout/SiteHeader.astro
git mv src/components/common/Header/Header.test.ts src/components/layout/SiteHeader.test.ts
git mv src/components/common/Header/Header.types.ts src/components/layout/SiteHeader.types.ts
git mv src/components/common/Footer/Footer.astro src/components/layout/SiteFooter.astro

# Forms
git mv src/components/forms/ContactForm.astro src/components/organisms/ContactForm.astro

# UI
git mv src/components/ui/AboutMe.astro src/components/sections/AboutSection.astro
git mv src/components/ui/Halo.astro src/components/atoms/Halo.astro
git mv src/components/ui/Hero.astro src/components/sections/HeroSection.astro
git mv src/components/ui/Testimonial.astro src/components/sections/TestimonialSection.astro
touch src/components/organisms/TestimonialCard.astro
git mv src/components/ui/TwSizeIndicator.astro src/components/dev/TwSizeIndicator.astro

# Icons
git mv src/components/ui/icons/MoonIcon.astro src/components/atoms/icons/MoonIcon.astro
git mv src/components/ui/icons/SunIcon.astro  src/components/atoms/icons/SunIcon.astro

# Cleanup
git rm -r src/components/{ui,blog,common,forms} || true
git rm src/components/index.ts || true
git rm src/components/atoms/icons/index.ts 2>/dev/null || true

echo "✅ Migration terminée — pensez à mettre à jour les imports"
```

---

## 5. Mise à jour des imports

Utiliser `@/…` partout. Exemple :

```bash
pnpm dlx replace-in-file --from "'components/blog/BlogCard'" \
  --to "'@/components/organisms/BlogCard'" "src/**/*.{astro,ts,tsx,md,mdx}"
```

Répéter pour chaque composant migré.

Config :

- `tsconfig.json` → `paths: { "@/*": ["src/*"] }`
- `astro.config.mjs` :

```js
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'

export default defineConfig({
  vite: {
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  },
})
```

---

## 6. ESLint garde-fous (strict)

```js
// eslint.config.js
import pluginImport from 'eslint-plugin-import'

export default [
  {
    plugins: { import: pluginImport },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: 'src/components/atoms',
              from: 'src/components/{molecules,organisms,sections,layout}',
            },
            {
              target: 'src/components/molecules',
              from: 'src/components/{organisms,sections,layout}',
            },
            { target: 'src/components/organisms', from: 'src/components/{sections,layout}' },
            { target: 'src/components/sections', from: 'src/components/layout' },
            { target: 'src/components/layout', from: 'src/components/{organisms,sections}' },
            { target: 'src/components/**/*', from: 'src/components/dev' },
          ],
        },
      ],
    },
  },
]
```

---

## 7. Checklist PR

- [ ] Niveau correct (Atom/Molecule/Organism/Section/Layout/Dev)
- [ ] Dépendances respectées (ESLint OK)
- [ ] Imports alias `@/`
- [ ] Props typées/documentées
- [ ] Pas de fetch hors pages/layouts
- [ ] Accessibilité (aria/alt/focus)
- [ ] Pas de texte dur → props (pré-i18n)
- [ ] Tests basiques (snapshot/visuels)
- [ ] Build & typecheck OK

---

## 8. Exemples mini

### Molecule — NavMenu.astro

```tsx
---
interface Link { href: string; label: string }
interface Props { links: Link[] }
const { links } = Astro.props;
---
<nav aria-label="Navigation principale">
  <ul class="flex gap-6">
    {links.map((l) => <li><a href={l.href}>{l.label}</a></li>)}
  </ul>
</nav>
```

### Layout — SiteHeader.astro

```tsx
---
import NavMenu from '@/components/molecules/NavMenu.astro';
import Icon from '@/components/atoms/Icon.astro';
const links = [{ href: '/', label: 'Accueil' }, { href: '/blog', label: 'Blog' }];
---
<header class="sticky top-0 z-50 bg-background/80 backdrop-blur">
  <div class="container flex h-16 items-center justify-between">
    <a href="/"><Icon name="logo" /></a>
    <NavMenu {links} />
  </div>
</header>
```

### Dev-only usage

```tsx
{
  import.meta.env.DEV && (
    <DevOnly>
      <TwSizeIndicator client:only="astro" />
    </DevOnly>
  )
}
```

---

## 9. Post-migration

1. `pnpm astro check && pnpm tsc --noEmit`
2. Corriger les imports cassés
3. CI : lint, build, tests
4. Supprimer dossiers vides restants

---

## 10. Rappel final

- **Fetch seulement dans les pages** (ou layouts pour données globales).
- **Sections** = conteneurs de page.
- **Organisms** = blocs riches sans container global.
- **Layout components** = Header/Footer, importent uniquement atoms/molecules.
- **Dev** = jamais en prod.

---

✅ Fin du document — prêt pour l’IA & les devs.

---
