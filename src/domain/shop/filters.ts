import type { ShopFiltersView } from '@/domain/shop/types'

export const SHOP_FILTERS: ShopFiltersView = {
  quickFilters: [
    { id: 'all', label: 'All', checked: true },
    { id: 'free', label: 'Gratuit' },
    { id: 'new', label: 'Nouveautés' },
  ],
  offerTypes: [
    { id: 'all', label: 'All', checked: true },
    { id: 'products', label: 'Produits' },
    { id: 'services', label: 'Services' },
  ],
  productTypes: [
    { id: 'templates-notion', label: 'Templates Notion' },
    { id: 'musiques', label: 'Musiques' },
    { id: 'prompts', label: 'Prompts' },
    { id: 'divers', label: 'Divers' },
  ],
  serviceTypes: [
    { id: 'formation', label: 'Formation' },
    { id: 'coaching', label: 'Coaching' },
    { id: 'ateliers', label: 'Ateliers' },
  ],
  categories: [
    { id: 'all', label: 'All', checked: true },
    { id: 'notion', label: 'Notion' },
    { id: 'automatisation', label: 'Automatisation' },
    { id: 'ai', label: 'AI' },
    { id: 'sante', label: 'Santé' },
    { id: 'prendre-soin', label: 'Prendre soin' },
  ],
}
