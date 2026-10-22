import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, GripVertical, X } from 'lucide-react'
import DeskGuard from '../../components/desk/DeskGuard'
import { Loading, Problem } from '../../components/Status'
import { button, kicker } from '../../components/styles'
import { edition } from '../../edition'
import { errorMessage } from '../../lib/api'
import { when } from '../../lib/format'
import { listDesk, setFront, type Article } from '../../lib/press'
import { useLoad } from '../../state/useLoad'
import { useTitle } from '../../state/useTitle'

// The front page from the top: drag the articles into order, or use the arrows. The first is the
// top story.
function Arrange({ token, published }: { token: string; published: Article[] }) {
  const [order, setOrder] = useState<string[]>(
    published
      .filter(a => a.frontPosition !== null)
      .sort((a, b) => a.frontPosition! - b.frontPosition!)
      .map(a => a.id),
  )
  const [dragging, setDragging] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const byId = new Map(published.map(a => [a.id, a]))
  const rest = published.filter(a => !order.includes(a.id))

  const update = (next: string[]) => {
    setOrder(next)
    setNotice(null)
  }
  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return
    const next = [...order]
    const [id] = next.splice(from, 1)
    next.splice(to, 0, id)
    update(next)
  }
  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      await setFront(token, order)
      setNotice('Forsiden er lagret.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[22px] font-bold">På forsiden</h2>
          <button type="button" className={button.primary} disabled={busy} onClick={() => void save()}>
            {busy ? 'Lagrer …' : 'Lagre forsiden'}
          </button>
        </div>
        {notice && <p className="mt-2 font-ui text-[13px] text-[#1e6b3a]">{notice}</p>}
        {error && <p className="mt-2 font-ui text-[13px] text-[#b3261e]">{error}</p>}
        {order.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-line px-4 py-8 text-center font-ui text-[14px] text-muted">
            Ingenting plassert. Da viser forsiden de nyeste sakene.
          </p>
        ) : (
          <ol className="mt-4 space-y-2">
            {order.map((id, i) => {
              const article = byId.get(id)!
              return (
                <li
                  key={id}
                  draggable
                  onDragStart={() => setDragging(i)}
                  onDragOver={event => {
                    event.preventDefault()
                    if (dragging !== null && dragging !== i) {
                      move(dragging, i)
                      setDragging(i)
                    }
                  }}
                  onDragEnd={() => setDragging(null)}
                  className={`flex items-center gap-3 rounded-md border bg-paper px-3 py-2.5 ${dragging === i ? 'border-ink opacity-60' : 'border-line'}`}
                >
                  <GripVertical size={16} className="shrink-0 cursor-grab text-muted" aria-hidden="true" />
                  <span className="w-6 shrink-0 font-ui text-[13px] font-bold">{i === 0 ? 'Topp' : i + 1}</span>
                  <div className="min-w-0 flex-1">
                    {article.section && <div className={`${kicker} text-muted`}>{article.section}</div>}
                    <div className="truncate text-[16px] font-semibold">{article.title}</div>
                  </div>
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Flytt opp" className="rounded p-1 hover:bg-soft disabled:opacity-30">
                    <ArrowUp size={15} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === order.length - 1} aria-label="Flytt ned" className="rounded p-1 hover:bg-soft disabled:opacity-30">
                    <ArrowDown size={15} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => update(order.filter(other => other !== id))} aria-label="Ta av forsiden" className="rounded p-1 hover:bg-soft">
                    <X size={15} aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ol>
        )}
      </section>
      <section>
        <h2 className="text-[22px] font-bold">Andre publiserte saker</h2>
        {rest.length === 0 ? (
          <p className="mt-4 font-ui text-[14px] text-muted">Alle publiserte saker er på forsiden.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {rest.map(article => (
              <li key={article.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[16px] font-semibold">{article.title}</div>
                  <div className="font-ui text-[12px] text-muted">{article.publishedAt && when(article.publishedAt)}</div>
                </div>
                <button type="button" className={`${button.secondary} h-8 px-3 text-[13px]`} onClick={() => update([...order, article.id])}>
                  Legg på forsiden
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Loaded({ token }: { token: string }) {
  const { data, error, loading } = useLoad(() => listDesk(token), `arrange:${token}`)
  if (loading) return <Loading />
  if (error || !data) return <Problem message={error ?? 'Noe gikk galt'} />
  return <Arrange token={token} published={data.filter(a => a.status === 'published')} />
}

export default function ArrangeFront() {
  useTitle('Forsiden')
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/redaksjon" className="font-ui text-[13px] font-semibold underline-offset-4 hover:underline">
        Redaksjonen
      </Link>
      <p className={`${kicker} mt-1 text-muted`}>{edition.name}</p>
      <h1 className="mb-8 mt-1 text-[36px] font-bold leading-tight">Ordne forsiden</h1>
      <DeskGuard>{token => <Loaded token={token} />}</DeskGuard>
    </div>
  )
}
