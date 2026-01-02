import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import { generateAtomFeed, createAtomResponse, type AtomEntry } from '@/utils/atomFeed'

export const GET: APIRoute = async ({ site }) => {
  // Note: Cette collection n'existe pas encore dans votre projet
  // Vous devrez la créer dans src/content/config.ts quand vous serez prêt
  // Pour l'instant, ce flux retournera une erreur ou un flux vide

  let tilPosts: any[] = []

  try {
    // Récupérer tous les posts TIL (Today I Learned)
    tilPosts = await getCollection('til', ({ data }: any) => {
      return !data.draft
    })
  } catch (error) {
    // La collection n'existe pas encore, retourner un flux vide
    console.warn('Collection "til" not found. Returning empty feed.')
  }

  // Trier par date (du plus récent au plus ancien)
  const sortedPosts = tilPosts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  )

  const siteUrl = site?.href || 'https://jeremiealcaraz.com/'

  // Convertir les posts en entrées Atom
  const entries: AtomEntry[] = sortedPosts.map(post => ({
    id: `${siteUrl}til/${post.id.replace(/\.(md|mdx)$/, '')}/`,
    title: post.data.title,
    link: `${siteUrl}til/${post.id.replace(/\.(md|mdx)$/, '')}/`,
    published: post.data.date,
    updated: post.data.date,
    author: post.data.author || 'Jérémie Alcaraz',
    summary: post.data.description,
    categories: post.data.tags || ['til'],
  }))

  // Générer le flux Atom
  const feedXml = generateAtomFeed(
    {
      title: 'TIL - Jérémie Alcaraz',
      subtitle: 'Today I Learned - Apprentissages quotidiens',
      siteUrl: siteUrl.replace(/\/$/, ''),
      feedPath: '/atom/til',
      author: {
        name: 'Jérémie Alcaraz',
        uri: siteUrl.replace(/\/$/, ''),
      },
    },
    entries
  )

  return createAtomResponse(feedXml)
}
