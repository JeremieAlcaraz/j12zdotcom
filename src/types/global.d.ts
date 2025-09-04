declare module '*.svg' {
  import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
  const content: AstroComponentFactory;
  export default content;
}