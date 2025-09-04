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
        {
          '@/shortcodes/generic/Accordion.shortcode.astro': [['default', 'Accordion']],
          '@/shortcodes/generic/Button.shortcode.astro': [['default', 'Button']],
          '@/shortcodes/generic/Icon.shortcode.astro': [['default', 'Icon']],
          '@/shortcodes/generic/LottiePlayer.shortcode.astro': [['default', 'LottiePlayer']],
          '@/shortcodes/generic/Notice.shortcode.astro': [['default', 'Notice']],
          '@/shortcodes/generic/Video.shortcode.astro': [['default', 'Video']],
          '@/shortcodes/generic/Youtube.shortcode.astro': [['default', 'Youtube']],
        },
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
