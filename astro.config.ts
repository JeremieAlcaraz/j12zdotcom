// astro.config.mjs
// @ts-check                             // Active la vérification de type dans ce fichier JS
import { defineConfig } from 'astro/config' // ✅ Fonction pour définir la config d’Astro
import react from '@astrojs/react' // 🚀 Intégration React (JSX/TSX)
import svelte from '@astrojs/svelte' // 🌱 Intégration Svelte (.svelte)
import mdx from '@astrojs/mdx' // 📄 Intégration MDX (Markdown + JSX/TSX)
import sitemap from '@astrojs/sitemap' // 🗺️ Génération automatique de sitemap.xml
import tailwindcss from '@tailwindcss/vite' // 🎨 Plugin Vite pour Tailwind CSS v4
import tsconfigPaths from 'vite-tsconfig-paths' // 🔗 Plugin Vite pour utiliser les alias TS

import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  // ────────────────────────────────
  // 1️⃣  Integrations Astro
  //    On y liste tous les outils qui étendent Astro
  integrations: [
    react(), // → Permet d’importer et de rendre des composants React
    svelte(), // → Permet d’importer et de rendre des composants Svelte
    mdx(), // → Supporte les fichiers .mdx dans pages ou components
    sitemap(), // → Génère le sitemap.xml pour le SEO
  ],

  // ────────────────────────────────
  // 2️⃣  Configuration Vite
  //    Personnalise Vite (module bundler sous-jacent)
  vite: {
    plugins: [
      tsconfigPaths(), // 🔄 Récupère et injecte automatiquement les paths définis en tsconfig.json
      tailwindcss(), // 💅 Intègre Tailwind CSS v4 via Vite, sans config Astro dédiée
    ],
    // ────────────────────────────────────
    // ❌ Plus besoin de `resolve.alias` manuel !
    //    Tous tes alias sont désormais lus depuis tsconfig.json
  },

  adapter: cloudflare(),
})
