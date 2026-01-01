export type ShopSortOption = {
  id: string
  label: string
}

export type ShopCategoryOption = {
  id: string
  label: string
  count?: number
  checked?: boolean
}

export type ShopPriceFilter = {
  min: number
  max: number
  value?: number
  step?: number
  unit?: string
}

export type ShopFiltersView = {
  sortOptions: ShopSortOption[]
  defaultSortId?: string
  categories: ShopCategoryOption[]
  price: ShopPriceFilter
}
