declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro'
  const Component: AstroComponentFactory
  export default Component
}
