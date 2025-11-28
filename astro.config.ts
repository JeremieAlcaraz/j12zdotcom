// astro.config.ts
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import AutoImport from 'astro-auto-import'
import remarkCollapse from 'remark-collapse'
import remarkToc from 'remark-toc'
import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import astroIcon from 'astro-icon'
import remarkDirective from 'remark-directive'
import remarkHighlight from './src/remark/remarkHighlight.js'

export default defineConfig({
  // Configuration Astro - Site statique
  site: 'https://jeremiealcaraz.com',

  integrations: [
    react(),
    svelte(),
    sitemap(),
    astroIcon(),
    AutoImport({
      // export default requis (ou map explicite, cf. ci-dessous)
      imports: [
        {
          '@/shortcodes/generic/Accordion.shortcode.astro': [['default', 'Accordion']],
          '@/shortcodes/generic/Button.shortcode.astro': [['default', 'Button']],
          '@/shortcodes/generic/DotLottiePlayer.shortcode.astro': [['default', 'DotLottiePlayer']],
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
    server: {
      allowedHosts: ['jeremiealcaraz.com', 'www.jeremiealcaraz.com'],
      // Désactiver le HMR pour les fichiers CSS (évite les reloads intempestifs)
      hmr: {
        overlay: true,
      },
    },
    // Configuration CSS pour éviter les problèmes avec Tailwind v4 et View Transitions
    css: {
      devSourcemap: true,
    },
    // Optimisation : ne pas pré-bundler Tailwind en dev
    optimizeDeps: {
      exclude: ['@tailwindcss/vite'],
    },
    plugins: [
      // Tailwind en premier pour éviter les conflits de traitement CSS
      tailwindcss(),
      tsconfigPaths(),
      Icons({
        compiler: 'astro',
        autoInstall: true,
        customCollections: {
          custom: FileSystemIconLoader('src/assets/icons', svg =>
            svg.replaceAll('stroke="none"', '').replaceAll('fill="none"', 'fill="currentColor"')
          ),
        },
      }),
    ],
  },

  // Sortie statique uniquement (SSG)
  output: 'static',

  // Service d'images : Sharp (optimisation au build)
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      // config: { ... } // (optionnel) réglages Sharp si besoin
    },
  },
  // Markdown (TOC + sections repliables)
  markdown: {
    remarkPlugins: [
      remarkDirective,
      remarkHighlight,
      remarkToc,
      [remarkCollapse, { test: 'Table of contents' }],
    ],
  },
})
