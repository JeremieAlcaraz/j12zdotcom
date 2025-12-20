/**
 * Mappers pour transformer les données Notion en format utilisable
 */

import type { NotionNowPage, NotionNowData } from './types'

/**
 * Extrait le texte brut d'une propriété rich_text Notion
 */
function extractRichText(richText: Array<{ plain_text: string }>): string {
  return richText.map((text) => text.plain_text).join('')
}

/**
 * Parse une chaîne de texte séparée par des virgules en tableau
 * Exemple: "Nix, Rive, Comment faire des lacets" → ["Nix", "Rive", "Comment faire des lacets"]
 */
function parseCommaSeparatedList(text: string): string[] {
  if (!text || text.trim() === '') {
    return []
  }

  return text
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

/**
 * Transforme une page Notion en données structurées
 * Pour l'instant, on extrait uniquement le champ `learning`
 *
 * @param page - Page Notion brute
 * @returns Données formatées
 */
export function mapNotionPageToNowData(page: NotionNowPage): NotionNowData {
  const properties = page.properties

  // Extraire le nom de la page
  const nom = properties.nom?.title?.[0]?.plain_text || ''

  // Extraire le champ learning
  const learningText = extractRichText(properties.learning?.rich_text || [])
  const learning = parseCommaSeparatedList(learningText)

  return {
    nom,
    learning: learning.length > 0 ? learning : undefined,
  }
}

/**
 * Filtre et trouve la page "current" (statut = current ou la plus récente)
 *
 * @param pages - Liste des pages Notion
 * @returns La page actuelle ou undefined
 */
export function findCurrentPage(pages: NotionNowPage[]): NotionNowPage | undefined {
  if (pages.length === 0) {
    return undefined
  }

  // Chercher une page avec statut = "current"
  const currentPage = pages.find(
    (page) => page.properties.statut?.select?.name?.toLowerCase() === 'current'
  )

  if (currentPage) {
    return currentPage
  }

  // Sinon, prendre la plus récente (première dans la liste si triée par date)
  return pages[0]
}
