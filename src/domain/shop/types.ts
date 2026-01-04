export type ShopFilterOption = {
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
  quickFilters: ShopFilterOption[]
  defaultQuickFilterId?: string
  offerTypes: ShopFilterOption[]
  defaultOfferTypeId?: string
  productTypes: ShopFilterOption[]
  serviceTypes: ShopFilterOption[]
  categories: ShopFilterOption[]
  defaultCategoryId?: string
  price?: ShopPriceFilter
}
