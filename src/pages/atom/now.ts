import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import { generateAtomFeed, createAtomResponse, type AtomEntry } from '@/utils/atomFeed'

export const GET: APIRoute = async ({ site }) => {
  // Récupérer toutes les pages "now"
  const nowPages = await getCollection('now')

  // Trier par date de mise à jour (du plus récent au plus ancien)
  const sortedPages = nowPages.sort(
    (a, b) => new Date(b.data.lastUpdate).getTime() - new Date(a.data.lastUpdate).getTime()
  )

  const siteUrl = site?.href || 'https://jeremiealcaraz.com/'

  // Convertir les pages now en entrées Atom
  const entries: AtomEntry[] = sortedPages.map(page => {
    // Générer le slug à partir du fichier (ex: "current" ou "archive/2024-06")
    const slug = page.id.replace(/\.(md|mdx)$/, '')
    const isArchive = slug.startsWith('archive/')

    return {
      id: `${siteUrl}now/${slug}/`,
      title: isArchive
        ? `Now - ${page.data.focus.title} (${slug.replace('archive/', '')})`
        : `Now - ${page.data.focus.title}`,
      link: `${siteUrl}now${isArchive ? `/${slug}` : ''}/`,
      published: page.data.lastUpdate,
      updated: page.data.lastUpdate,
      author: 'Jérémie Alcaraz',
      summary: page.data.focus.description,
      categories: ['now', page.data.status],
    }
  })

  // Générer le flux Atom
  const feedXml = generateAtomFeed(
    {
      title: 'Now - Jérémie Alcaraz',
      subtitle: 'Ce sur quoi je travaille actuellement',
      siteUrl: siteUrl.replace(/\/$/, ''),
      feedPath: '/atom/now',
      author: {
        name: 'Jérémie Alcaraz',
        uri: siteUrl.replace(/\/$/, ''),
      },
    },
    entries
  )

  return createAtomResponse(feedXml)
}
