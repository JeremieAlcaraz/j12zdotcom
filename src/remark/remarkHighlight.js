import { visit } from 'unist-util-visit'

const MARK_PATTERN = /==([\s\S]+?)==/g

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

    visit(tree, 'text', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return

      const value = node.value
      if (!value || !value.includes('==')) return

      const newChildren = []
      let lastIndex = 0

      value.replace(MARK_PATTERN, (match, inner, offset) => {
        if (offset > lastIndex) {
          newChildren.push({ type: 'text', value: value.slice(lastIndex, offset) })
        }

        newChildren.push({
          type: 'mark',
          data: { hName: 'mark', hProperties: { className: 'hl' } },
          children: [{ type: 'text', value: inner }],
        })

        lastIndex = offset + match.length
        return match
      })

      if (newChildren.length === 0) return

      if (lastIndex < value.length) {
        newChildren.push({ type: 'text', value: value.slice(lastIndex) })
      }

      parent.children.splice(index, 1, ...newChildren)
      return index + newChildren.length
    })
  }
}
