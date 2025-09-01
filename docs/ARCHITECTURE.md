# ARCHITECTURE.md

## 🎯 Objectif

Clarifier les règles d’organisation du projet pour éviter les zones d’ambiguïté et garder une structure maintenable.

---

## 🔑 Règles d’or (contrat d’architecture)

### Règle 0 — Dépendances

- `ui` ne dépend de rien.
- `domain` dépend de `ui`.
- `sections` dépend de `ui` et `domain`.
- `pages` ne composent qu’à partir de `sections` (+ `layout`).
- `utils`, `styles`, `config` sont transverses mais **jamais** dépendants de `domain`/`sections`.

### Règle 1 — Niveaux

- **UI** → design system `atoms`/`molecules`/`organisms` basé sur DaisyUI, zéro logique métier.
- **Domain** → composants métier (`BlogCard`, `PricingCard`).
- **Sections** → morceaux de page contextualisés (`HeroSection`, `TestimonialSection`).
- **Pages** → uniquement du routing + assemblage de `sections`.
- **MDX** → les layouts passent `components={{ … }}` pour exposer l'UI; aucun `import` local dans les fichiers `.mdx`.

### Règle 2 — Assets

- `src/assets` → sources transformables (optimisées, importables en modules).
- `public/` → statiques servis tels quels (favicon, robots.txt, OG images).

### Règle 3 — Naming

- `.section.astro` pour les sections.
- UI : noms techniques (`Card.astro`), Domain : noms métier (`BlogCard.astro`).

---

## 📂 Arborescence cible

```
src/
  ui/                        # Design system générique
    atoms/
    molecules/
    organisms/
  components/                # Composants applicatifs
    domain/
      blog/
        BlogCard.astro
      …
    sections/                # Fragments de page
      Hero.section.astro
      …
    layout/                  # Header/Footer
      SiteHeader.astro
      SiteFooter.astro
    playground/              # Démos & galeries
      ComponentGallery.astro
      …
  content/
  pages/
    index.astro
    about.astro
    blog/[slug].astro
  assets/
    img_raw/
    img_opt/
    icons/
    logos/
public/
  robots.txt
  images/    # uniquement si besoin d’URL stable
```

---

## ✅ À faire (nettoyage rapide)

- Déplacer `TestimonialSection.astro` → `sections/Testimonial.section.astro`.
- Renommer tous les fichiers `sections/*` en `.section.astro`.
- Exposer les composants `ui` aux fichiers MDX via `components={{…}}`.
- Documenter la règle `public/` vs `assets/` avec 2 exemples concrets.

---

## 🛡️ Garde-fous

- ESLint :
  - `ui` ne peut pas importer `domain`/`sections`.
  - `pages` n’importent que `sections` (jamais `ui`/`domain`).

- Aliases dans `tsconfig.json` :
  - `@ui/*`, `@domain/*`, `@sections/*`, `@layouts/*`.

---

👉 Avec ces règles et ce schéma de dépendances, la structure devient limpide et robuste.
