// src/components/navbar/index.ts

// 1) Le composant principal
export { default as Header } from '@components/common/Header/Header.astro';
export { default as Footer } from '@components/common/Footer/Footer.astro';

// 2) Le type des props (optionnel mais souvent utile)
export type { NavbarProps } from './Header/Header.types';
