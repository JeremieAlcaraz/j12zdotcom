/**
 * Client Notion avec gestion d'erreurs
 */

import { Client } from '@notionhq/client'
import { NotionError } from './types'

/**
 * Crée et configure un client Notion
 * @param apiKey - Clé API Notion (depuis les variables d'environnement)
 * @returns Instance du client Notion
 */
export function createNotionClient(apiKey: string): Client {
  if (!apiKey || apiKey === 'secret_temporaire') {
    throw new NotionError(
      'NOTION_API_KEY manquante ou temporaire. Configurez une vraie clé API Notion.',
      'MISSING_API_KEY'
    )
  }

  try {
    return new Client({
      auth: apiKey,
    })
  } catch (error) {
    throw new NotionError(
      'Impossible de créer le client Notion',
      'CLIENT_CREATION_ERROR',
      error
    )
  }
}

/**
 * Wrapper pour gérer les erreurs des appels à l'API Notion
 */
export async function handleNotionRequest<T>(
  requestFn: () => Promise<T>,
  errorContext: string
): Promise<T> {
  try {
    return await requestFn()
  } catch (error) {
    // Gérer les erreurs spécifiques de Notion
    if (error && typeof error === 'object' && 'code' in error) {
      const notionError = error as { code: string; message?: string }

      switch (notionError.code) {
        case 'unauthorized':
          throw new NotionError(
            'Clé API Notion invalide ou expirée',
            'UNAUTHORIZED',
            error
          )
        case 'object_not_found':
          throw new NotionError(
            'Database Notion introuvable. Vérifiez que l\'intégration a accès à la database.',
            'DATABASE_NOT_FOUND',
            error
          )
        case 'rate_limited':
          throw new NotionError(
            'Limite de requêtes Notion atteinte. Réessayez dans quelques secondes.',
            'RATE_LIMITED',
            error
          )
        default:
          throw new NotionError(
            `Erreur Notion ${errorContext}: ${notionError.message || 'Erreur inconnue'}`,
            notionError.code,
            error
          )
      }
    }

    // Erreur générique
    throw new NotionError(
      `Erreur lors de ${errorContext}`,
      'UNKNOWN_ERROR',
      error
    )
  }
}
