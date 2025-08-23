// astro.config.ts
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import AutoImport from 'astro-auto-import' // ⟵ NEW
// import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  // 1) Intégrations
  integrations: [
    react(),
    svelte(),
    sitemap(),
    AutoImport({
      // export default requis (ou map explicite, cf. ci-dessous)
      imports: [
        '@/components/toclassify/Button',
        '@/components/toclassify/Accordion',
        '@/components/toclassify/Notice',
        '@/components/toclassify/Video',
        '@/components/toclassify/Youtube',
        '@/components/toclassify/Tabs',
        '@/components/toclassify/Tab',
      ],
    }),
    mdx(),
  ],

  // 2) Vite
  vite: {
    plugins: [tsconfigPaths(), tailwindcss()],
  },

  // 3) Sortie : statique (recommandé)
  //    Si tu veux une page en SSR, mets `export const prerender = false` dans cette page.
  output: 'static',

  // 4) Adapter Cloudflare + images compilées (Sharp au build)
  // Cloudflare ne supporte pas Sharp au runtime → on pré-optimise au build.
  // adapter: cloudflare({
  //   imageService: 'compile',
  // }),

  // 5) Service d’images : Sharp
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      // config: { ... } // (optionnel) réglages Sharp si besoin
    },
  },
})
