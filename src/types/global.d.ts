declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.astro' {
  const Component: any
  export default Component
}
