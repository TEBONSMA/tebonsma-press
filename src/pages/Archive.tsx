import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import ArticleList from '../components/ArticleList'
import { button, input, kicker } from '../components/styles'
import { edition } from '../edition'
import { useTitle } from '../state/useTitle'

// Everything published, newest first; ?q= searches, ?tag= shows one tag
export default function Archive() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const tag = params.get('tag') ?? ''
  const [text, setText] = useState(q)
  useTitle(tag ? `${edition.tagsLabel}: ${tag}` : q ? `Søk: ${q}` : 'Arkiv')

  const search = (event: FormEvent) => {
    event.preventDefault()
    setParams(text.trim() ? { q: text.trim() } : {})
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className={`${kicker} text-muted`}>{tag ? edition.tagsLabel : 'Arkiv'}</p>
      <h1 className="mt-1 text-[36px] font-bold leading-tight">{tag ? tag : q ? `Søk etter «${q}»` : 'Alle saker'}</h1>
      <form onSubmit={search} className="mt-6 flex gap-2" role="search">
        <input
          type="search"
          value={text}
          onChange={event => setText(event.target.value)}
          placeholder="Søk i titler, ingresser og tekst"
          aria-label="Søk"
          className={input}
        />
        <button type="submit" className={button.primary}>
          Søk
        </button>
      </form>
      <div className="mt-6 border-t border-ink">
        <ArticleList query={{ q: q || undefined, tag: tag || undefined }} empty={q || tag ? 'Fant ingen saker.' : 'Ingen saker ennå.'} />
      </div>
    </div>
  )
}
