/**
 * Service Notion pour la page Now
 * Récupère et transforme les données de la database Notion
 */

import { createNotionClient, handleNotionRequest } from './client'
import { mapNotionPageToNowData, findCurrentPage } from './mappers'
import { NotionError } from './types'
import type { NotionConfig, NotionNowData, NotionNowPage } from './types'

/**
 * Service principal pour interagir avec Notion
 */
export class NotionNowService {
  private client
  private databaseId: string

  constructor(config: NotionConfig) {
    this.client = createNotionClient(config.apiKey)
    this.databaseId = config.databaseId
  }

  /**
   * Récupère les données "Now" actuelles depuis Notion
   * @returns Les données formatées ou undefined si erreur/vide
   */
  async getCurrentNow(): Promise<NotionNowData | undefined> {
    try {
      // Requête à la database Notion (v5 utilise dataSources.query)
      const response = await handleNotionRequest(
        () =>
          this.client.dataSources.query({
            data_source_id: this.databaseId,
            // Trier par date de création (le plus récent en premier)
            sorts: [
              {
                property: 'created_time',
                direction: 'descending',
              },
            ],
            // Limiter à 10 résultats (on ne prend que le premier de toute façon)
            page_size: 10,
          }),
        'récupération de la database Now'
      )

      // Vérifier qu'on a des résultats
      if (!response.results || response.results.length === 0) {
        console.warn('⚠️ Aucune entrée trouvée dans la database Notion Now')
        return undefined
      }

      // Filtrer les pages (type guard)
      const pages = response.results.filter(
        (result): result is NotionNowPage => 'properties' in result
      )

      if (pages.length === 0) {
        console.warn('⚠️ Aucune page valide trouvée dans la database')
        return undefined
      }

      // Trouver la page "current"
      const currentPage = findCurrentPage(pages)

      if (!currentPage) {
        console.warn('⚠️ Aucune page "current" trouvée')
        return undefined
      }

      // Transformer en données utilisables
      const data = mapNotionPageToNowData(currentPage)

      console.log('✅ Données Notion récupérées:', data.nom)

      return data
    } catch (error) {
      // Log l'erreur mais ne crash pas le build
      if (error instanceof NotionError) {
        console.error(`❌ Erreur Notion [${error.code}]:`, error.message)
      } else {
        console.error('❌ Erreur inattendue lors de la récupération Notion:', error)
      }

      // Retourner undefined pour permettre le fallback
      return undefined
    }
  }
}

/**
 * Factory pour créer une instance du service
 * Utilise les variables d'environnement par défaut
 */
export function createNotionNowService(): NotionNowService | undefined {
  const apiKey = import.meta.env.NOTION_API_KEY
  const databaseId = import.meta.env.NOTION_NOW_DATABASE_ID

  if (!apiKey || !databaseId) {
    console.warn('⚠️ Variables Notion manquantes. Utilisation du fallback MDX.')
    return undefined
  }

  try {
    return new NotionNowService({ apiKey, databaseId })
  } catch (error) {
    console.error('❌ Impossible de créer le service Notion:', error)
    return undefined
  }
}
