import type { ShopFiltersView } from '@/domain/shop/types'

export const SHOP_FILTERS: ShopFiltersView = {
  sortOptions: [
    { id: 'free', label: 'Gratuits' },
    { id: 'new', label: 'Nouveautés' },
    { id: 'popular', label: 'Populaires' },
  ],
  defaultSortId: 'free',
  categories: [
    { id: 'productivite-douce', label: 'Productivité douce', checked: true },
    { id: 'organisation-douce', label: 'Organisation douce', checked: true },
    { id: 'sante-notion', label: 'Santé & Notion' },
    { id: 'automatisations', label: 'Automatisations' },
    { id: 'apprendre', label: 'Apprendre' },
    { id: 'ressources', label: 'Ressources' },
  ],
  price: {
    min: 10,
    max: 150,
    value: 100,
    step: 5,
    unit: '€',
  },
}
