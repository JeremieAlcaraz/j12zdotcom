import { slug } from 'github-slugger'
import { marked } from 'marked'

// slugify
export const slugify = (content: string) => {
  return slug(content)
}

// markdownify
export const markdownify = (content: string, div?: boolean) => {
  return div ? marked.parse(content) : marked.parseInline(content)
}

// humanize
export const humanize = (content: string) => {
  return content
    .replace(/^[\s_]+|[\s_]+$/g, '')
    .replace(/[_\s]+/g, ' ')
    .replace(/[-\s]+/g, ' ')
    .replace(/^[a-z]/, function (m) {
      return m.toUpperCase()
    })
}

// titleify
export const titleify = (content: string) => {
  const humanized = humanize(content)
  return humanized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// plainify
export const plainify = (content: string) => {
  const parseMarkdown = marked.parse(content) as string
  const filterBrackets = parseMarkdown.replace(/<\/?[^>]+(>|$)/gm, '')
  const filterSpaces = filterBrackets.replace(/[\r\n]\s*[\r\n]/gm, '')
  const stripHTML = htmlEntityDecoder(filterSpaces)
  return stripHTML
}

// smartTruncate - Tronque intelligemment le texte sur le dernier mot complet
export const smartTruncate = (content: string, limit: number): string => {
  if (!content) return ''

  const cleanText = plainify(content)
  if (cleanText.length <= limit) return cleanText

  // Tronquer à la limite et chercher le dernier espace
  const truncated = cleanText.slice(0, limit)
  const lastSpaceIndex = truncated.lastIndexOf(' ')

  // Si on trouve un espace et qu'il n'est pas trop proche du début
  if (lastSpaceIndex > limit * 0.8) {
    return truncated.slice(0, lastSpaceIndex) + '...'
  }

  // Sinon, tronquer directement avec ...
  return truncated + '...'
}

// strip entities for plainify
const htmlEntityDecoder = (htmlWithEntities: string) => {
  const entityList: { [key: string]: string } = {
    '&nbsp;': ' ',
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
  }
  const htmlWithoutEntities: string = htmlWithEntities.replace(
    /(&amp;|&lt;|&gt;|&quot;|&#39;)/g,
    (entity: string): string => {
      return entityList[entity]
    }
  )
  return htmlWithoutEntities
}
