# Icônes — Guide pour les Agents IA

Ce projet supporte un usage unifié des icônes via un composant `<Icon />` et la résolution par nom au format Iconify.

## Règles d’utilisation

- Utiliser `Icon` ainsi : `<Icon name="collection:icon" />`
- Collections supportées : `heroicons` (v2), `heroicons-outline`, `heroicons-solid`, `lucide`
- Alias : `heroicons:*` utilise le set v2 (pas de redirection vers outline)
- Exemples valides :
  - `heroicons:home`
  - `heroicons-outline:magnifying-glass`
  - `heroicons-solid:user`
  - `lucide:play`

## Résolution

- Registre curaté : certaines icônes fréquentes sont importées via `unplugin-icons` pour la performance.
- Fallback universel : si l’icône n’est pas dans le registre, on passe par `astro-icon` qui résout n’importe quel nom Iconify depuis `@iconify-json/*`.

## Accessibilité et tailles

- Taille par défaut: `24px`. Vous pouvez passer des classes Tailwind (`size-*`, `w-*`, `h-*`) ou la prop `size` (px, rem…).
- Le composant gère l’`aria-label` automatiquement via la prop `title`.

## Exemples

```astro
---
import Icon from '@/ui/atoms/Icon.astro'
---
<div>
  <Icon name="heroicons:home" class="size-6 text-primary" />
  <Icon name="heroicons-solid:user" class="size-6 text-neutral" />
  <Icon name="lucide:search" class="size-5 text-info" />
</div>
```

## Markdown vs shortcodes vs MDX

### Quand utiliser quoi ?

- **Markdown natif** (`==...==`, `**...**`, etc.)
  - Pour les emphases simples et fréquentes.
  - Objectif : garder une fluidité d’écriture.
- **Shortcodes remark** (ex. `:hl[...]` avec options)
  - Pour des variantes inline configurables : soulignés, couleurs, etc.
  - Idéal quand il y a beaucoup d’occurrences mais peu de logique.
  - Reste un span inline : pas de state, pas d’effets.
- **Shortcodes Components MDX** (ex. `<Highlight variant="underline" color="#f1ffe0">`)
  - Pour les éléments sémantiques ou interactifs : callouts, cards, embeds, tabs, figures légendées…
  - À utiliser dès que tu as besoin de props, d’un comportement ou d’un rendu complexe.
  - À réserver pour éviter d’alourdir la rédaction.

### Décision rapide

- Inline + simple ➜ Markdown (`==...==`).
- Inline + options visuelles ➜ Shortcode `:hl[...]`.
- Bloc/structure + logique ➜ Component MDX.
