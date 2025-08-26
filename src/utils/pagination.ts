export const getPageList = (total: number): number[] =>
  Array.from({ length: total }, (_, i) => i + 1)

export const getPageHref = (section: string | undefined, page: number): string =>
  page === 1 ? (section ? `/${section}` : '/') : `${section ? '/' + section : ''}/page/${page}`

export const getPrevHref = (section: string | undefined, page: number): string | undefined => {
  if (page <= 1) return undefined
  if (page === 2) return section ? `/${section}` : '/'
  return `${section ? '/' + section : ''}/page/${page - 1}`
}

export const getNextHref = (
  section: string | undefined,
  page: number,
  total: number
): string | undefined => {
  if (page >= total) return undefined
  return `${section ? '/' + section : ''}/page/${page + 1}`
}
