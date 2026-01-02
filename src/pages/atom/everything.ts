import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import { generateAtomFeed, createAtomResponse, type AtomEntry } from '@/utils/atomFeed'

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.href || 'https://jeremiealcaraz.com/'
  const allEntries: AtomEntry[] = []

  // 1. Récupérer les articles de blog
  const blogPosts = await getCollection('blog', ({ data }) => !data.draft)
  const blogEntries: AtomEntry[] = blogPosts.map(post => ({
    id: `${siteUrl}blog/${post.id.replace(/\.(md|mdx)$/, '')}/`,
    title: `[Article] ${post.data.title}`,
    link: `${siteUrl}blog/${post.id.replace(/\.(md|mdx)$/, '')}/`,
    published: post.data.date,
    updated: post.data.date,
    author: post.data.author,
    summary: post.data.description,
    categories: ['article', ...(post.data.categories || [])],
  }))
  allEntries.push(...blogEntries)

  // 2. Récupérer les pages "now"
  const nowPages = await getCollection('now')
  const nowEntries: AtomEntry[] = nowPages.map(page => {
    const slug = page.id.replace(/\.(md|mdx)$/, '')
    const isArchive = slug.startsWith('archive/')
    return {
      id: `${siteUrl}now/${slug}/`,
      title: isArchive
        ? `[Now] ${page.data.focus.title} (${slug.replace('archive/', '')})`
        : `[Now] ${page.data.focus.title}`,
      link: `${siteUrl}now${isArchive ? `/${slug}` : ''}/`,
      published: page.data.lastUpdate,
      updated: page.data.lastUpdate,
      author: 'Jérémie Alcaraz',
      summary: page.data.focus.description,
      categories: ['now', page.data.status],
    }
  })
  allEntries.push(...nowEntries)

  // 3. Récupérer les TIL (Today I Learned) - si la collection existe
  try {
    const tilPosts = await getCollection('til', ({ data }: any) => !data.draft)
    const tilEntries: AtomEntry[] = tilPosts.map((post: any) => ({
      id: `${siteUrl}til/${post.id.replace(/\.(md|mdx)$/, '')}/`,
      title: `[TIL] ${post.data.title}`,
      link: `${siteUrl}til/${post.id.replace(/\.(md|mdx)$/, '')}/`,
      published: post.data.date,
      updated: post.data.date,
      author: post.data.author || 'Jérémie Alcaraz',
      summary: post.data.description,
      categories: ['til', ...(post.data.tags || [])],
    }))
    allEntries.push(...tilEntries)
  } catch (error) {
    // La collection TIL n'existe pas encore
    console.warn('Collection "til" not found yet.')
  }

  // Trier toutes les entrées par date (du plus récent au plus ancien)
  const sortedEntries = allEntries.sort(
    (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
  )

  // Générer le flux Atom
  const feedXml = generateAtomFeed(
    {
      title: 'Tout le contenu - Jérémie Alcaraz',
      subtitle: 'Articles, mises à jour "now", TIL et plus encore',
      siteUrl: siteUrl.replace(/\/$/, ''),
      feedPath: '/atom/everything',
      author: {
        name: 'Jérémie Alcaraz',
        uri: siteUrl.replace(/\/$/, ''),
      },
    },
    sortedEntries
  )

  return createAtomResponse(feedXml)
}
