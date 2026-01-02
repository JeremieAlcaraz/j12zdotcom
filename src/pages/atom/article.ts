import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import { generateAtomFeed, createAtomResponse, type AtomEntry } from '@/utils/atomFeed'

export const GET: APIRoute = async ({ site }) => {
  // Récupérer tous les articles de blog
  const posts = await getCollection('blog', ({ data }) => {
    return !data.draft
  })

  // Trier par date (du plus récent au plus ancien)
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  )

  const siteUrl = site?.href || 'https://jeremiealcaraz.com/'

  // Convertir les posts en entrées Atom
  const entries: AtomEntry[] = sortedPosts.map(post => ({
    id: `${siteUrl}blog/${post.id.replace(/\.(md|mdx)$/, '')}/`,
    title: post.data.title,
    link: `${siteUrl}blog/${post.id.replace(/\.(md|mdx)$/, '')}/`,
    published: post.data.date,
    updated: post.data.date,
    author: post.data.author,
    summary: post.data.description,
    categories: post.data.categories,
  }))

  // Générer le flux Atom
  const feedXml = generateAtomFeed(
    {
      title: 'Articles - Jérémie Alcaraz',
      subtitle: 'Articles de blog sur le développement web, JavaScript et la productivité',
      siteUrl: siteUrl.replace(/\/$/, ''),
      feedPath: '/atom/article',
      author: {
        name: 'Jérémie Alcaraz',
        uri: siteUrl.replace(/\/$/, ''),
      },
    },
    entries
  )

  return createAtomResponse(feedXml)
}
