import type { ShopFiltersView } from '@/domain/shop/types'

export const SHOP_FILTERS: ShopFiltersView = {
  sortOptions: [
    { id: 'popular', label: 'Populaires' },
    { id: 'price-asc', label: 'Prix croissant' },
    { id: 'new', label: 'Nouveautés' },
  ],
  defaultSortId: 'popular',
  categories: [
    { id: 'deco', label: 'Déco', checked: true },
    { id: 'cuisine', label: 'Cuisine', checked: true },
    { id: 'chambre', label: 'Chambre' },
    { id: 'lumiere', label: 'Lumière' },
    { id: 'papeterie', label: 'Papeterie' },
    { id: 'bien-etre', label: 'Bien-être' },
    { id: 'digital', label: 'Digital' },
  ],
  price: {
    min: 10,
    max: 150,
    value: 100,
    step: 5,
    unit: '€',
  },
}
