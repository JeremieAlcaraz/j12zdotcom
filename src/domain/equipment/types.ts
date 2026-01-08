export type EquipmentFilterOption = {
  id: string
  label: string
  count?: number
  checked?: boolean
}

export type EquipmentPriceFilter = {
  min: number
  max: number
  value?: number
  step?: number
  unit?: string
}

export type EquipmentFiltersView = {
  quickFilters: EquipmentFilterOption[]
  defaultQuickFilterId?: string
  offerTypes: EquipmentFilterOption[]
  defaultOfferTypeId?: string
  productTypes: EquipmentFilterOption[]
  serviceTypes: EquipmentFilterOption[]
  categories: EquipmentFilterOption[]
  defaultCategoryId?: string
  price?: EquipmentPriceFilter
}
