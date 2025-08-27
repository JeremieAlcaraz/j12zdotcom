export const getPageList = (total: number): number[] =>
  Array.from({ length: total }, (_, i) => i + 1)

export const getPageHref = (section: string | undefined, page: number): string =>
  page === 1
    ? section
      ? `/${section}`
      : '/'
    : `${section ? '/' + section : ''}/page/${String(page)}`

export const getPrevHref = (section: string | undefined, page: number): string | undefined => {
  if (page <= 1) return undefined
  if (page === 2) return section ? `/${section}` : '/'
  return `${section ? '/' + section : ''}/page/${String(page - 1)}`
}

export const getNextHref = (
  section: string | undefined,
  page: number,
  total: number
): string | undefined => {
  if (page >= total) return undefined
  return `${section ? '/' + section : ''}/page/${String(page + 1)}`
}

// Types pour Option A
export type PageLink = { n: number; href?: string; current?: boolean; label?: string }
export type NavLink = { href?: string; label?: string }
export type PaginationLinks = { pages: PageLink[]; prev?: NavLink; next?: NavLink }

/**
 * Construit les liens attendus par la molécule Pagination (Option A).
 * @param section Section de contenu (ex: 'blog')
 * @param current Page courante (1-indexée)
 * @param total Nombre total de pages
 * @param window Taille de la fenêtre de pages autour de la courante (0 = toutes)
 */
export const makePaginationLinks = (
  section: string | undefined,
  current: number,
  total: number,
  window = 0
): PaginationLinks => {
  const all = getPageList(total)
  const filtered =
    window > 0
      ? all.filter((n) => n === 1 || n === total || Math.abs(n - current) <= window)
      : all

  const pages: PageLink[] = filtered.map((n) => ({
    n,
    current: n === current,
    href: n === current ? undefined : getPageHref(section, n),
  }))

  const prevHref = getPrevHref(section, current)
  const nextHref = getNextHref(section, current, total)

  const prev = prevHref ? { href: prevHref, label: 'Page précédente' } : undefined
  const next = nextHref ? { href: nextHref, label: 'Page suivante' } : undefined

  return { pages, prev, next }
}
