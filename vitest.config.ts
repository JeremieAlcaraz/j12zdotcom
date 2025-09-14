/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: [
      'src/**/*.{test,spec}.{js,ts}', // Tests unitaires co-localisés
      'tests/**/*.{test,spec}.{js,ts}', // Tests d'intégration centralisés
    ],
    setupFiles: ['src/test/setup.ts'],
    // reporters: ['dot'],
    // silent: true,
    // noStackTrace: true,
  },
})
