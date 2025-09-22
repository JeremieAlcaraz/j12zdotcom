import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ICONS_DIR = 'src/assets/icons'
const CONTENT_DIRS = ['src/content', 'src/pages', 'src/domain'] // adapte si besoin

const svgNames = new Set(
  readdirSync(ICONS_DIR)
    .filter(f => f.endsWith('.svg'))
    .map(f => f.replace(/\.svg$/, ''))
)

const iconRegex = /<Icon\s+[^>]*name="([a-zA-Z0-9_-]+)"/g
let missing = new Set()

for (const dir of CONTENT_DIRS) {
  // lecture naïve récursive (simplifiée) : adapter avec globby si besoin
  const walk = (d) => {
    try {
      for (const f of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, f.name)
        if (f.isDirectory()) walk(p)
        else if (/\.(mdx?|astro)$/.test(f.name)) {
          const txt = readFileSync(p, 'utf8')
          let m
          while ((m = iconRegex.exec(txt))) {
            const name = m[1]
            if (!svgNames.has(name)) missing.add(name)
          }
        }
      }
    } catch (err) {
      // Ignore si le dossier n'existe pas
      if (err.code !== 'ENOENT') throw err
    }
  }
  walk(dir)
}

if (missing.size) {
  console.error('[verify-icons] Missing SVG for names:', Array.from(missing).join(', '))
  process.exit(1)
} else {
  console.log('[verify-icons] OK — all used icons exist.')
}
