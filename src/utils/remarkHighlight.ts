import { visit } from 'unist-util-visit'
import type { Node, Parent } from 'unist'

const MARK_PATTERN = /==([\s\S]+?)==/g

interface DirectiveNode extends Node {
  type: 'textDirective' | 'leafDirective'
  name: string
  attributes?: {
    variant?: string
    color?: string
  }
  data?: {
    hName?: string
    hProperties?: {
      className?: string
      style?: string
    }
  }
}

interface TextNode extends Node {
  type: 'text'
  value: string
}

interface MarkNode extends Node {
  type: 'mark'
  data: {
    hName: string
    hProperties: {
      className: string
    }
  }
  children: TextNode[]
}

export default function remarkHighlight() {
  return (tree: Node) => {
    visit(tree, (node: Node) => {
      const directiveNode = node as DirectiveNode
      const isTextDirective = directiveNode.type === 'textDirective' && directiveNode.name === 'hl'
      const isLeafDirective = directiveNode.type === 'leafDirective' && directiveNode.name === 'hl'

      if (!isTextDirective && !isLeafDirective) return

      const data = (directiveNode.data ||= {})
      const attributes = directiveNode.attributes || {}
      const variant = String(attributes.variant || 'block')
      const color = attributes.color ? String(attributes.color) : null

      data.hName = 'span'
      data.hProperties = {
        className: variant === 'underline' ? 'hl-underline' : 'hl',
        style: color ? `--hl:${color}` : undefined,
      }
    })

    visit(tree, 'text', (node: Node, index: number | undefined, parent: Parent | undefined) => {
      if (!parent || typeof index !== 'number') return

      const textNode = node as TextNode
      const value = textNode.value
      if (!value || !value.includes('==')) return

      const newChildren: (TextNode | MarkNode)[] = []
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
