export type Feature = {
  button: Button
  image: string
  bulletpoints: string[]
  content: string
  title: string
}

export type Button = {
  enable: boolean
  label: string
  link: string
}

// Types renforcés pour composants Astro
export interface AstroComponentProps {
  class?: string
  style?: string
  id?: string
  data?: Record<string, any>
}

export interface ImageProps extends AstroComponentProps {
  src: string
  alt: string
  width: number
  height: number
  loading?: 'eager' | 'lazy'
  decoding?: 'async' | 'auto' | 'sync'
  format?: 'auto' | 'avif' | 'jpeg' | 'png' | 'svg' | 'webp'
  preferSrc?: ('avif' | 'webp' | 'png')[]
  allowPngFallback?: boolean
}

export interface ButtonProps extends AstroComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  href?: string
  label: string
  icon?: string
  onClick?: () => void
}

// Types pour navigation
export interface NavItem {
  title: string
  href: string
  icon?: string
  children?: NavItem[]
}

// Types pour contenu blog
export interface PostFrontmatter {
  title: string
  description: string
  date: string
  image?: string
  tags: string[]
  draft?: boolean
}

// Types pour site config (référence pour validation)
export interface SiteMetadata {
  title: string
  description: string
  author: string
  image: string
  keywords?: string[]
}
