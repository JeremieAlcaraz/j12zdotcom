/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: [
      'src/**/*.{test,spec}.{js,ts}', // Tests unitaires co-localisés
      'tests/**/*.{test,spec}.{js,ts}', // Tests d'intégration centralisés
    ],
    setupFiles: ['src/test/setup.ts'],
    // Garde tes options commentées pour plus tard si besoin
    // reporters: ['dot'],
    // silent: true,
    // noStackTrace: true,
  },
});
