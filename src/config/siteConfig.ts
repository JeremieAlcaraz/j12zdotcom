// src/config/siteConfig.ts
export interface Site {
  title: string
  baseUrl: string
  basePath: string
  trailingSlash: boolean
  favicon: string
}

export interface Settings {
  search: boolean
  stickyHeader: boolean
  themeSwitcher: boolean
  defaultTheme: 'light' | 'dark' | 'system'
  pagination: number
  summaryLength: number
  blogFolder: string
}

export interface Params {
  contactFormAction: string
  contactSuccessUrl: string
}

export interface NavigationButton {
  enable: boolean
  label: string
  link: string
}

export interface GoogleTagManager {
  enable: boolean
  gtmId: string
}

export interface Disqus {
  enable: boolean
  shortname: string
  settings: Record<string, unknown>
}

export interface Metadata {
  author: string
  image: string
  description: string
}

export interface SiteConfig {
  site: Site
  settings: Settings
  params: Params
  navigationButton: NavigationButton
  googleTagManager: GoogleTagManager
  disqus: Disqus
  metadata: Metadata
}

export const siteConfig: SiteConfig = {
  site: {
    title: 'j12zdotcom - Portfolio Jeremie Alcaraz',
    baseUrl: 'https://jeremiealcaraz.com',
    basePath: '/',
    trailingSlash: false,
    favicon: '/favicon-192x192.png',
  },
  settings: {
    search: true,
    stickyHeader: true,
    themeSwitcher: true,
    defaultTheme: 'system',
    pagination: 3,
    summaryLength: 200,
    blogFolder: 'blog',
  },
  params: {
    contactFormAction:
      'https://n8n.jeremiealcaraz.com/webhook/5f0abd46-180d-4a51-9f27-93ef7c7b8224',
    contactSuccessUrl: '/contact-success',
  },
  navigationButton: {
    enable: true,
    label: 'Get Started',
    link: 'https://github.com/zeon-studio/astroplate',
  },
  googleTagManager: {
    enable: false,
    gtmId: 'GTM-XXXXXX',
  },
  disqus: {
    enable: true,
    shortname: 'themefisher-template',
    settings: {},
  },
  metadata: {
    author: 'Jeremie Alcaraz',
    image: '/og-image.png',
    description:
      'Portfolio et blog de Jeremie Alcaraz - Formations et services en développement web avec Astro, React et Svelte',
  },
} as const // « as const » fige les valeurs littérales

export default siteConfig
