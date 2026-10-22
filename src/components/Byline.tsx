import { when } from '../lib/format'
import { memberHref } from '../lib/members'
import type { Article } from '../lib/press'
import AuthorNames from './AuthorNames'
import Avatar from './Avatar'

// Who wrote it and when, with their photos, each leading to their member page
export default function Byline({ article, photos = true }: { article: Article; photos?: boolean }) {
  return (
    <div className="flex items-center gap-3 font-ui text-[14px]">
      {photos && article.authors.length > 0 && (
        <div className="flex -space-x-2">
          {article.authors.map(author => (
            <a key={author.id} href={memberHref(author.id)} aria-hidden="true" tabIndex={-1}>
              <Avatar member={author} className="h-9 w-9 text-[12px] ring-2 ring-paper" />
            </a>
          ))}
        </div>
      )}
      <div className="leading-snug">
        {article.authors.length > 0 && (
          <div className="font-semibold">
            <AuthorNames authors={article.authors} />
          </div>
        )}
        {article.publishedAt && <div className="text-muted">{when(article.publishedAt)}</div>}
      </div>
    </div>
  )
}
