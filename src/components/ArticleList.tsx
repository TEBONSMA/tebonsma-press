import { useState } from 'react'
import { paper } from '../editions/paper'
import { errorMessage } from '../lib/api'
import { listArticles, type Article } from '../lib/press'
import { useMe } from '../state/MeContext'
import { useLoad } from '../state/useLoad'
import { Loading, Problem } from './Status'
import { button } from './styles'

interface Query {
  section?: string
  tag?: string
  q?: string
}

// Published articles matching the query, the newest first, with more on request
export default function ArticleList({ query, empty }: { query: Query; empty: string }) {
  const { token } = useMe()
  const key = JSON.stringify(query)
  const { data, error, loading } = useLoad(() => listArticles(token, query), `list:${key}:${token}`)
  const [more, setMore] = useState<{ key: string; articles: Article[]; next: string | null } | null>(null)
  const [busy, setBusy] = useState(false)
  const [moreError, setMoreError] = useState<string | null>(null)

  if (loading) return <Loading />
  if (error || !data) return <Problem message={error ?? 'Noe gikk galt'} />

  const extra = more?.key === key ? more : null
  const articles = [...data.articles, ...(extra?.articles ?? [])]
  const next = extra ? extra.next : data.next

  const loadMore = async () => {
    if (!next) return
    setBusy(true)
    setMoreError(null)
    try {
      const page = await listArticles(token, { ...query, before: next })
      setMore({ key, articles: [...(extra?.articles ?? []), ...page.articles], next: page.next })
    } catch (err) {
      setMoreError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (articles.length === 0) return <p className="py-12 font-ui text-muted">{empty}</p>
  return (
    <div>
      {articles.map(article => (
        <paper.ListItem key={article.id} article={article} />
      ))}
      {next && (
        <div className="mt-8 text-center">
          <button type="button" className={button.secondary} disabled={busy} onClick={() => void loadMore()}>
            {busy ? 'Henter …' : 'Eldre saker'}
          </button>
          {moreError && <p className="mt-2 font-ui text-[14px] text-[#b3261e]">{moreError}</p>}
        </div>
      )}
    </div>
  )
}
