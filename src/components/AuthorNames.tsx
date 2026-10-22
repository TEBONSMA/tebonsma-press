import { Fragment } from 'react'
import { memberHref } from '../lib/members'
import { authorName, type Author } from '../lib/press'

// The authors by the names they go by in the article, each a link to their member page (authors
// without an account just by name)
export default function AuthorNames({ authors, className = '' }: { authors: Author[]; className?: string }) {
  return (
    <>
      {authors.map((author, i) => (
        <Fragment key={author.id ?? `${author.name}-${i}`}>
          {i > 0 && (i === authors.length - 1 ? ' og ' : ', ')}
          {author.id ? (
            <a href={memberHref(author.id)} className={`underline-offset-4 hover:underline ${className}`}>
              {authorName(author)}
            </a>
          ) : (
            <span className={className}>{authorName(author)}</span>
          )}
        </Fragment>
      ))}
    </>
  )
}
