import { Plugin } from '@tiptap/pm/state'
import { Node, ReactNodeViewRenderer } from '@tiptap/react'
import { embedsIn, type Embed as EmbedAttributes } from '../../lib/embeds'
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

  // Embed code pasted into the text becomes the graph or video, not the code as text
  addProseMirrorPlugins() {
    const editor = this.editor
    return [
      new Plugin({
        props: {
          handlePaste: (_view, event) => {
            const text = event.clipboardData?.getData('text/plain').trim() ?? ''
            if (!text.startsWith('<') || !/<iframe[\s>]/i.test(text)) return false
            const embeds = embedsIn(text)
            if (!embeds.length) return false
            editor.chain().focus().insertContent(embedContent(embeds)).run()
            return true
          },
        },
      }),
    ]
  },
})
