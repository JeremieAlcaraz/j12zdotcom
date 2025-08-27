import type { CollectionEntry, CollectionKey } from 'astro:content'

import { getSinglePage } from '@/utils/contentParser'
import { slugify } from '@/utils/textConverter'

// get taxonomy from frontmatter
export const getTaxonomy = async <C extends CollectionKey>(
  collection: C,
  name: keyof CollectionEntry<C>['data'],
) => {
  const singlePages: CollectionEntry<C>[] = await getSinglePage(collection)
  const taxonomyPages: string[][] = singlePages.map(page => {
    const pageData = (page as unknown as { data: Record<string, unknown> }).data
    const value = pageData[name as string]
    return Array.isArray(value) ? value.map(item => String(item)) : []
  })
  const taxonomies: string[] = []
  for (const categoryArray of taxonomyPages) {
    for (const category of categoryArray) {
      taxonomies.push(slugify(category))
    }
  }
  const taxonomy = [...new Set(taxonomies)]
  return taxonomy
}

// get all taxonomies from frontmatter
export const getAllTaxonomy = async <C extends CollectionKey>(
  collection: C,
  name: keyof CollectionEntry<C>['data'],
) => {
  const singlePages: CollectionEntry<C>[] = await getSinglePage(collection)
  const taxonomyPages: string[][] = singlePages.map(page => {
    const pageData = (page as unknown as { data: Record<string, unknown> }).data
    const value = pageData[name as string]
    return Array.isArray(value) ? value.map(item => String(item)) : []
  })
  const taxonomies: string[] = []
  for (const categoryArray of taxonomyPages) {
    for (const category of categoryArray) {
      taxonomies.push(slugify(category))
    }
  }
  return taxonomies
}
