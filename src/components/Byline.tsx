import { names, when } from '../lib/format'
import type { Article } from '../lib/press'
import Avatar from './Avatar'

// Who wrote it and when, with their photos
export default function Byline({ article, photos = true }: { article: Article; photos?: boolean }) {
  return (
    <div className="flex items-center gap-3 font-ui text-[14px]">
      {photos && article.authors.length > 0 && (
        <div className="flex -space-x-2">
          {article.authors.map(author => (
            <Avatar key={author.id} member={author} className="h-9 w-9 text-[12px] ring-2 ring-paper" />
          ))}
        </div>
      )}
      <div className="leading-snug">
        {article.authors.length > 0 && <div className="font-semibold">{names(article.authors.map(a => a.name))}</div>}
        {article.publishedAt && <div className="text-muted">{when(article.publishedAt)}</div>}
      </div>
    </div>
  )
}
