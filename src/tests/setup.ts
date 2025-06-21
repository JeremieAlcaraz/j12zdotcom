import { vi } from 'vitest';

// 1. Mock global : remplace l'icône astro.svg pour éviter les accès disque
vi.mock('@assets/astro.svg', () => ({ default: '/logo.svg' }));

// 3. Option : muter les console.log pendant les tests
vi.spyOn(console, 'log').mockImplementation(() => {});
