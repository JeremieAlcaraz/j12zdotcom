// astro.config.mjs
// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import path from 'path'; // ← on importe node:path

export default defineConfig({
  // 1️⃣ Integrations Astro
  integrations: [react(), svelte(), mdx(), sitemap()],

  // 2️⃣ Configuration Vite (alias correctement en disk-path)
  vite: {
    resolve: {
      alias: {
        // path.resolve résout bien './src/components' vers un chemin absolu
        '@assets': path.resolve('.', 'src/assets'),
        '@components': path.resolve('.', 'src/components'),
        '@composables': path.resolve('.', 'src/composables'),
        '@layouts': path.resolve('.', 'src/layouts'),
        '@styles': path.resolve('.', 'src/styles'),
      },
    },
    plugins: [tailwindcss()],
  },
});
