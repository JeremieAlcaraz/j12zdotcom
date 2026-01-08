import type { APIRoute } from 'astro'
import { siteConfig } from '@/config/siteConfig'

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.href || siteConfig.site.baseUrl
  const location = new URL('/atom/index.xml', baseUrl).toString()
  return new Response(null, {
    status: 301,
    headers: {
      Location: location,
    },
  })
}
