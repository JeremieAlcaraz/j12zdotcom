import { visit } from 'unist-util-visit'

export default function remarkHighlight() {
  return (tree) => {
    visit(tree, (node) => {
      const isTextDirective = node.type === 'textDirective' && node.name === 'hl'
      const isLeafDirective = node.type === 'leafDirective' && node.name === 'hl'

      if (!isTextDirective && !isLeafDirective) return

      const data = (node.data ||= {})
      const attributes = node.attributes || {}
      const variant = String(attributes.variant || 'block')
      const color = attributes.color ? String(attributes.color) : null

      data.hName = 'span'
      data.hProperties = {
        className: variant === 'underline' ? 'hl-underline' : 'hl',
        style: color ? `--hl:${color}` : undefined,
      }
    })
  }
}
