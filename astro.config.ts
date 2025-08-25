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
import remarkCollapse from 'remark-collapse'
import remarkToc from 'remark-toc'

export default defineConfig({
  // 1) Intégrations
  // site: config.site.base_url ? config.site.base_url : 'http://examplesite.com',
  // base: config.site.base_path ? config.site.base_path : '/',
  // trailingSlash: config.site.trailing_slash ? 'always' : 'never',
  integrations: [
    react(),
    svelte(),
    sitemap(),
    AutoImport({
      // export default requis (ou map explicite, cf. ci-dessous)
      imports: [
        '@/components/shortcodes/Button.tsx',
        '@/components/shortcodes/Accordion.tsx',
        '@/components/shortcodes/Notice.tsx',
        '@/components/shortcodes/Video.tsx',
        '@/components/shortcodes/Youtube.tsx',
        '@/components/shortcodes/Tabs.tsx',
        '@/components/shortcodes/Tab.tsx',
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
  // Markdown (TOC + sections repliables)
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, { test: 'Table of contents' }]],
  },
})
