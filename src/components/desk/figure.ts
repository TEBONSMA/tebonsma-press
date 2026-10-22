import { Node } from '@tiptap/react'

// A picture in the text, with a caption under it and a size: small (beside the text on a wide
// screen), medium or full. Saved as <figure data-size><img><figcaption>, which the API lets
// through and the article page styles (index.css).
export const FIGURE_SIZES = ['small', 'medium', 'full'] as const
export type FigureSize = (typeof FIGURE_SIZES)[number]

export const Figure = Node.create({
  name: 'figure',
  group: 'block',
  // The caption
  content: 'inline*',
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: { default: null, parseHTML: element => element.querySelector('img')?.getAttribute('src'), renderHTML: () => ({}) },
      alt: { default: '', parseHTML: element => element.querySelector('img')?.getAttribute('alt') ?? '', renderHTML: () => ({}) },
      size: {
        default: 'full',
        parseHTML: element => {
          const size = element.getAttribute('data-size')
          return FIGURE_SIZES.includes(size as FigureSize) ? size : 'full'
        },
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'figure', contentElement: 'figcaption' }]
  },

  renderHTML({ node }) {
    return ['figure', { 'data-size': node.attrs.size }, ['img', { src: node.attrs.src, alt: node.attrs.alt, draggable: 'false' }], ['figcaption', 0]]
  },
})
