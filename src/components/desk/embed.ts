import { Node, ReactNodeViewRenderer } from '@tiptap/react'
import type { Embed as EmbedAttributes } from '../../lib/embeds'
import EmbedView from './EmbedView'

const number = (value: string | null) => (value && /^\d+$/.test(value) ? Number(value) : null)

// What goes into the text for embed code: its frames, then a paragraph to go on with the text
export const embedContent = (embeds: EmbedAttributes[]) => [...embeds.map(attrs => ({ type: 'embed', attrs })), { type: 'paragraph' }]

// A graph, video or map from another site, saved as its <iframe>; the API adds the sandbox
export const Embed = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: '' },
      width: { default: null, parseHTML: element => number(element.getAttribute('width')) },
      height: { default: null, parseHTML: element => number(element.getAttribute('height')) },
    }
  },

  parseHTML() {
    return [{ tag: 'iframe[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', HTMLAttributes]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedView)
  },
})
