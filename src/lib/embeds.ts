// Graphs, videos and maps from other sites (Datawrapper, YouTube, …), pasted in as their embed code.
// Only the code's <iframe> is kept, as the API does; the scripts that come with it never run here.
export interface Embed {
  src: string
  title: string
  width: number | null
  height: number | null
}

// The same sandbox the API gives them: the page can't be taken elsewhere
export const EMBED_SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation'
export const EMBED_ALLOW = 'fullscreen; encrypted-media; picture-in-picture; clipboard-write'

const size = (value: string | null) => {
  const number = Number(value)
  return value && Number.isInteger(number) && number >= 50 && number <= 4000 ? number : null
}

export function embedsIn(code: string): Embed[] {
  // Parsed, never run
  const doc = new DOMParser().parseFromString(code, 'text/html')
  return [...doc.querySelectorAll('iframe')].flatMap(frame => {
    const src = frame.getAttribute('src') ?? ''
    if (!src.startsWith('https://')) return []
    return [{ src, title: frame.getAttribute('title') ?? '', width: size(frame.getAttribute('width')), height: size(frame.getAttribute('height')) }]
  })
}

// Datawrapper's graphs tell the page how tall they are. This does what the script in their embed
// code would: the frame that sent the message gets that height.
let listening = false

export function resizeDatawrapper() {
  if (listening) return
  listening = true
  window.addEventListener('message', event => {
    const heights = (event.data as Record<string, unknown> | null)?.['datawrapper-height']
    if (!heights || typeof heights !== 'object') return
    for (const frame of document.querySelectorAll('iframe')) {
      if (frame.contentWindow !== event.source) continue
      for (const height of Object.values(heights)) {
        if (typeof height === 'number' && height > 0 && height < 10000) frame.style.height = `${Math.ceil(height)}px`
      }
    }
  })
}
