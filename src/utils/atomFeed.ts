/**
 * Utilities for generating Atom feeds
 * Based on Simon Willison's approach: https://simonwillison.net/atom/everything/
 */

export interface AtomEntry {
  id: string
  title: string
  link: string
  published: Date
  updated: Date
  author: string
  summary?: string
  categories?: string[]
  content?: string
}

export interface AtomFeedConfig {
  title: string
  subtitle: string
  siteUrl: string
  feedPath: string
  author: {
    name: string
    uri: string
  }
}

/**
 * Escape XML special characters
 */
export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Generate an Atom feed XML string
 */
export function generateAtomFeed(config: AtomFeedConfig, entries: AtomEntry[]): string {
  const { title, subtitle, siteUrl, feedPath, author } = config

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(title)}</title>
  <subtitle>${escapeXml(subtitle)}</subtitle>
  <link href="${siteUrl}${feedPath}" rel="self" type="application/atom+xml"/>
  <link href="${siteUrl}" rel="alternate" type="text/html"/>
  <id>${siteUrl}${feedPath}</id>
  <updated>${entries[0]?.updated.toISOString() || new Date().toISOString()}</updated>
  <author>
    <name>${escapeXml(author.name)}</name>
    <uri>${author.uri}</uri>
  </author>
  <rights>Copyright (c) ${new Date().getFullYear()} ${escapeXml(author.name)}</rights>
  <generator uri="https://astro.build/" version="5.7.8">Astro</generator>
${entries
  .map(
    entry => `  <entry>
    <title>${escapeXml(entry.title)}</title>
    <link href="${entry.link}" rel="alternate" type="text/html"/>
    <id>${entry.link}</id>
    <published>${entry.published.toISOString()}</published>
    <updated>${entry.updated.toISOString()}</updated>
    <author>
      <name>${escapeXml(entry.author)}</name>
    </author>${
      entry.summary
        ? `
    <summary type="html">${escapeXml(entry.summary)}</summary>`
        : ''
    }${
      entry.content
        ? `
    <content type="html">${escapeXml(entry.content)}</content>`
        : ''
    }${
      entry.categories && entry.categories.length > 0
        ? entry.categories.map(cat => `
    <category term="${escapeXml(cat)}"/>`).join('')
        : ''
    }
  </entry>`
  )
  .join('\n')}
</feed>`
}

/**
 * Create an Atom feed Response object
 */
export function createAtomResponse(feedXml: string): Response {
  return new Response(feedXml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
