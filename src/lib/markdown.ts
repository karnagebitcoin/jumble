import { visit } from 'unist-util-visit'
import { nip19 } from 'nostr-tools'
import type { Root, Text, Link } from 'mdast'

// Nostr URI regex patterns
const NOSTR_URI_REGEX = /nostr:(npub1|nprofile1|note1|nevent1|naddr1|nsec1)[a-z0-9]+/gi
const NOSTR_MENTION_REGEX = /(npub1|nprofile1|note1|nevent1|naddr1)[a-z0-9]+/gi

/**
 * Remark plugin to convert Nostr URIs and mentions into clickable links
 */
export function remarkNostrLinks() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === null) return

      const text = node.value
      const parts: Array<Text | Link> = []
      let lastIndex = 0

      // Combined regex to match both nostr: URIs and bare mentions
      const combinedRegex = new RegExp(
        `(${NOSTR_URI_REGEX.source}|${NOSTR_MENTION_REGEX.source})`,
        'gi'
      )

      let match
      while ((match = combinedRegex.exec(text)) !== null) {
        const matchedText = match[0]
        const matchIndex = match.index

        // Add text before the match
        if (matchIndex > lastIndex) {
          parts.push({
            type: 'text',
            value: text.slice(lastIndex, matchIndex)
          })
        }

        // Extract the identifier (remove nostr: prefix if present)
        const identifier = matchedText.replace(/^nostr:/, '')
        
        // Create a link node
        const link: Link = {
          type: 'link',
          url: getNostrUrl(identifier),
          children: [
            {
              type: 'text',
              value: formatNostrMention(identifier)
            }
          ]
        }
        parts.push(link)

        lastIndex = matchIndex + matchedText.length
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push({
          type: 'text',
          value: text.slice(lastIndex)
        })
      }

      // Replace the text node with the parts if we found any matches
      if (parts.length > 0) {
        parent.children.splice(index, 1, ...parts)
      }
    })
  }
}

/**
 * Get the appropriate URL for a Nostr identifier
 */
function getNostrUrl(identifier: string): string {
  try {
    const prefix = identifier.slice(0, identifier.indexOf('1') + 1)
    
    switch (prefix) {
      case 'npub1':
      case 'nprofile1':
        return `#/profile/${identifier}`
      case 'note1':
      case 'nevent1':
        return `#/note/${identifier}`
      case 'naddr1':
        // Check if it's an article (kind 30023)
        try {
          const decoded = nip19.decode(identifier)
          if (decoded.type === 'naddr' && decoded.data.kind === 30023) {
            return `#/article/${identifier}`
          }
        } catch (e) {
          // Fall through to default
        }
        return `#/note/${identifier}`
      default:
        return `nostr:${identifier}`
    }
  } catch (e) {
    return `nostr:${identifier}`
  }
}

/**
 * Format Nostr mention for display
 */
function formatNostrMention(identifier: string): string {
  try {
    const decoded = nip19.decode(identifier)
    
    switch (decoded.type) {
      case 'npub':
        return `@${identifier.slice(0, 12)}...`
      case 'nprofile':
        return `@${identifier.slice(0, 12)}...`
      case 'note':
        return `note:${identifier.slice(5, 12)}...`
      case 'nevent':
        return `note:${identifier.slice(7, 14)}...`
      case 'naddr':
        // Try to get the identifier from the decoded data
        if ('identifier' in decoded.data && decoded.data.identifier) {
          return decoded.data.identifier
        }
        return `${identifier.slice(0, 12)}...`
      default:
        return identifier
    }
  } catch (e) {
    return identifier
  }
}

/**
 * Custom sanitize schema that allows Nostr-specific attributes
 */
export const nostrSanitizeSchema = {
  attributes: {
    '*': ['className', 'id'],
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    code: ['className'],
    pre: ['className'],
    div: ['className'],
    span: ['className']
  },
  tagNames: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'strong', 'em', 'u', 's', 'del', 'ins',
    'a', 'img',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span',
    'sup', 'sub'
  ],
  protocols: {
    href: ['http', 'https', 'mailto', 'nostr'],
    src: ['http', 'https', 'data']
  }
}
