import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import type { AstroComponentFactory } from 'astro/runtime/server/index.js'
import { expect, describe, it } from 'vitest'

import Navbar from '@/components/layout/SiteHeader.astro'

const NavbarComponent = Navbar as unknown as AstroComponentFactory

const links = [
  { href: '/foo', label: 'Foo' },
  { href: '/bar', label: 'Bar' },
]

describe('<Navbar />', () => {
  it('rend le logo et tous les liens', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(NavbarComponent, {
      props: { links }, // on passe des props custom si on veut
    })

    // 1) Le logo doit exister
    expect(html).toMatch(/<img[^>]*alt="Logo"/i)

    // 2) On doit retrouver chaque lien
    links.forEach(({ href, label }) => {
      expect(html).toContain(`href="${href}"`)
      expect(html).toContain(label)
    })
  })

  it('utilise les valeurs par défaut si aucune prop n’est fournie', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(NavbarComponent)

    // Les liens par défaut sont dans navigation.ts
    expect(html).toContain('Accueil')
    expect(html).toContain('À propos')
  })
})
