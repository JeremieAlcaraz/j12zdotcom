/**
 * Types pour l'intégration Notion
 * Database: Now (ID: 637dae9a6de04fec9f80d6d7de867ad2)
 */

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

/**
 * Structure de la database Notion "Now"
 * Colonnes: nom, created_time, creating, date, focus, learning, listening, living, location, statut
 */
type NotionNowPageProperties = {
  nom: { type: 'title'; title: Array<{ plain_text: string }> }
  created_time: { type: 'created_time'; created_time: string }
  creating: { type: 'rich_text'; rich_text: Array<{ plain_text: string }> }
  date: { type: 'date'; date: { start: string } | null }
  focus: { type: 'rich_text'; rich_text: Array<{ plain_text: string }> }
  learning: { type: 'rich_text'; rich_text: Array<{ plain_text: string }> }
  listening: { type: 'rich_text'; rich_text: Array<{ plain_text: string }> }
  living: { type: 'rich_text'; rich_text: Array<{ plain_text: string }> }
  location: { type: 'rich_text'; rich_text: Array<{ plain_text: string }> }
  statut: { type: 'select'; select: { name: string } | null }
}

export type NotionNowPage = Omit<PageObjectResponse, 'properties'> & {
  properties: NotionNowPageProperties
}

/**
 * Données extraites et formatées depuis Notion
 * Pour l'instant, on ne récupère que learning
 */
export interface NotionNowData {
  nom?: string
  learning?: string[] // Liste des apprentissages (séparés par des virgules dans Notion)
  // Future: focus, listening, etc.
}

/**
 * Configuration du service Notion
 */
export interface NotionConfig {
  apiKey: string
  databaseId: string
}

/**
 * Type pour les erreurs Notion
 */
export class NotionError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'NotionError'
  }
}
