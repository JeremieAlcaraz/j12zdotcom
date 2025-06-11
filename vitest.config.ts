/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'happy-dom', // DOM simulé
    globals: true, // expect(), describe() dispo partout
    include: ['src/**/*.test.ts'],
  },
});
