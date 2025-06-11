/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'happy-dom', // DOM simulé rapide ✔️
    globals: true, // expect(), describe(), it() disponibles partout ✔️
    include: ['src/**/*.test.ts'], // tests co-localisés ✔️
    setupFiles: ['src/test/setup.ts'], // ← NOUVEAU : fichier setup
    // reporters: ['dot'],          // option : sortie ultra-compacte
    // silent: true,                // option : masque les PASS
    // noStackTrace: true,          // option : tronque les traces géantes
  },
});
