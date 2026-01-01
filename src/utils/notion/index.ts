/**
 * Point d'entrée du module Notion
 * Export centralisé pour faciliter les imports
 */

// Service principal
export { NotionNowService, createNotionNowService } from './service'

// Types
export type { NotionNowData, NotionConfig, NotionNowPage } from './types'
export { NotionError } from './types'

// Utilitaires (si besoin plus tard)
export { createNotionClient } from './client'
export { mapNotionPageToNowData, findCurrentPage } from './mappers'
