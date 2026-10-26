import { useEffect } from 'react'
import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import { EMBED_ALLOW, EMBED_SANDBOX, resizeDatawrapper, type Embed } from '../../lib/embeds'

// In the editor: the graph or video itself, under a bar that says where it is from
export default function EmbedView({ node, selected, deleteNode }: ReactNodeViewProps) {
  const { src, title, width, height } = node.attrs as Embed
  useEffect(resizeDatawrapper, [])
  let host = src
  try {
    host = new URL(src).hostname
  } catch {
    // Shown as it is
  }
  return (
    <NodeViewWrapper className={`embed-block${selected ? ' is-selected' : ''}`} data-drag-handle="">
      <div contentEditable={false} className="flex items-center justify-between gap-2 border-b border-line bg-soft px-3 py-1 font-ui text-[13px]">
        <span className="truncate text-muted">Innbygget fra {host}</span>
        <button type="button" onClick={deleteNode} className="rounded px-2 py-0.5 font-semibold text-[#b3261e] hover:bg-[#fbe9e7]">
          Fjern
        </button>
      </div>
      <iframe
        src={src}
        title={title || undefined}
        width={width ?? undefined}
        height={height ?? undefined}
        style={width && height ? { aspectRatio: `${width} / ${height}` } : undefined}
        sandbox={EMBED_SANDBOX}
        allow={EMBED_ALLOW}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </NodeViewWrapper>
  )
}
