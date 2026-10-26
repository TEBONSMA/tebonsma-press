// Graphs, videos and maps from other sites (Datawrapper, YouTube, …) in an article's text

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
