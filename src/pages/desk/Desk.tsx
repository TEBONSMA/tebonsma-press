import { useState } from 'react'
import { Link } from 'react-router-dom'
import DeskGuard from '../../components/desk/DeskGuard'
import { Loading, Problem } from '../../components/Status'
import { button, kicker } from '../../components/styles'
import { articleHref, edition } from '../../edition'
import { names, when } from '../../lib/format'
import { listDesk } from '../../lib/press'
import { useLoad } from '../../state/useLoad'
import { useTitle } from '../../state/useTitle'

// The editors' list: drafts first, then what is published
function DeskList({ token }: { token: string }) {
  const { data, error, loading } = useLoad(() => listDesk(token), `desk:${token}`)
  const [tab, setTab] = useState<'draft' | 'published'>('draft')
  if (loading) return <Loading />
  if (error || !data) return <Problem message={error ?? 'Noe gikk galt'} />
  const shown = data.filter(article => article.status === tab)
  const count = (status: 'draft' | 'published') => data.filter(article => article.status === status).length

  return (
    <div>
      <div className="flex gap-1 border-b border-line font-ui text-[14px]" role="tablist">
        {(['draft', 'published'] as const).map(status => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={tab === status}
            onClick={() => setTab(status)}
            className={`-mb-px border-b-2 px-4 py-2.5 font-semibold ${tab === status ? 'border-ink' : 'border-transparent text-muted hover:text-ink'}`}
          >
            {status === 'draft' ? 'Utkast' : 'Publisert'} ({count(status)})
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="py-10 font-ui text-muted">{tab === 'draft' ? 'Ingen utkast. Skriv en ny sak.' : 'Ingenting publisert ennå.'}</p>
      ) : (
        <ul className="divide-y divide-line">
          {shown.map(article => (
            <li key={article.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
              <div className="min-w-0 flex-1 basis-72">
                <div className="flex flex-wrap items-baseline gap-x-3 font-ui text-[12px] text-muted">
                  {article.section && <span className={kicker}>{article.section}</span>}
                  <span>{article.visibility === 'public' ? 'Åpen for alle' : 'Kun medlemmer'}</span>
                  {article.frontPosition !== null && <span className="font-semibold text-ink">På forsiden, plass {article.frontPosition + 1}</span>}
                </div>
                <Link to={`/redaksjon/sak/${article.id}`} className="mt-1 block text-[19px] font-bold leading-snug hover:underline">
                  {article.title}
                </Link>
                <p className="font-ui text-[13px] text-muted">
                  {article.authors.length > 0 && `${names(article.authors.map(a => a.name))} · `}
                  {article.status === 'published' && article.publishedAt ? `Publisert ${when(article.publishedAt).toLowerCase()}` : `Endret ${when(article.updatedAt).toLowerCase()}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Link to={articleHref(article.slug)} className={`${button.secondary} h-9 px-3 text-[14px]`}>
                  {article.status === 'draft' ? 'Forhåndsvis' : 'Vis'}
                </Link>
                <Link to={`/redaksjon/sak/${article.id}`} className={`${button.secondary} h-9 px-3 text-[14px]`}>
                  Rediger
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Desk() {
  useTitle('Redaksjonen')
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className={`${kicker} text-muted`}>{edition.name}</p>
      <h1 className="mt-1 text-[36px] font-bold leading-tight">Redaksjonen</h1>
      <DeskGuard>
        {token => (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/redaksjon/ny" className={button.primary}>
                Ny sak
              </Link>
              <Link to="/redaksjon/forside" className={button.secondary}>
                Ordne forsiden
              </Link>
              <Link to="/redaksjon/meny" className={button.secondary}>
                Meny
              </Link>
            </div>
            <div className="mt-8">
              <DeskList token={token} />
            </div>
          </>
        )}
      </DeskGuard>
    </div>
  )
}
