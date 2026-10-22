import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, Pencil, X } from 'lucide-react'
import DeskGuard from '../../components/desk/DeskGuard'
import { Loading, Problem } from '../../components/Status'
import { button, input, kicker } from '../../components/styles'
import { edition } from '../../edition'
import { errorMessage } from '../../lib/api'
import { getMenu, getSections, renameSection, setMenu } from '../../lib/press'
import { useLoad } from '../../state/useLoad'
import { useTitle } from '../../state/useTitle'

// The sections in the paper's menu: which, in what order, and their names
function Menu({ token, initial, inUse }: { token: string; initial: string[]; inUse: { section: string; count: number }[] }) {
  const [sections, setSections] = useState(initial)
  const [counts, setCounts] = useState(new Map(inUse.map(row => [row.section, row.count])))
  const [adding, setAdding] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const update = (next: string[]) => {
    setSections(next)
    setNotice(null)
  }
  const move = (from: number, to: number) => {
    if (to < 0 || to >= sections.length) return
    const next = [...sections]
    const [section] = next.splice(from, 1)
    next.splice(to, 0, section)
    update(next)
  }
  const add = (event: FormEvent) => {
    event.preventDefault()
    const name = adding.trim()
    if (name && !sections.includes(name)) update([...sections, name])
    setAdding('')
  }
  const run = async (work: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await work()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }
  const save = () =>
    run(async () => {
      update((await setMenu(token, sections)).sections)
      setNotice('Menyen er lagret.')
    })
  // A new name goes on every article in the section at once
  const rename = (from: string) => {
    const to = window.prompt(`Nytt navn på «${from}». Alle saker i seksjonen får det nye navnet.`, from)?.trim()
    if (!to || to === from) return
    void run(async () => {
      await renameSection(token, from, to)
      setSections(current => [...new Set(current.map(section => (section === from ? to : section)))])
      setCounts(current => new Map([...current].map(([section, count]) => [section === from ? to : section, count])))
      setNotice(`«${from}» heter nå «${to}».`)
    })
  }
  const suggestions = [...new Set([...counts.keys(), ...edition.sections])].filter(section => !sections.includes(section))

  return (
    <div className="max-w-2xl">
      <p className="font-ui text-[14px] text-muted">
        Seksjonene vises i menyen øverst, i denne rekkefølgen. {edition.alwaysInMenu} En sak kan ha en seksjon som ikke står i menyen.
      </p>
      <ol className="mt-5 space-y-2">
        {sections.map((section, i) => (
          <li key={section} className="flex items-center gap-3 rounded-md border border-line px-3 py-2.5">
            <span className="w-5 shrink-0 font-ui text-[13px] font-bold text-muted">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-[17px] font-semibold">{section}</span>
            <span className="font-ui text-[12px] text-muted">{counts.get(section) ?? 0} saker</span>
            <button type="button" onClick={() => rename(section)} aria-label={`Gi ${section} nytt navn`} className="rounded p-1 hover:bg-soft" disabled={busy}>
              <Pencil size={15} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Flytt opp" className="rounded p-1 hover:bg-soft disabled:opacity-30">
              <ArrowUp size={15} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => move(i, i + 1)} disabled={i === sections.length - 1} aria-label="Flytt ned" className="rounded p-1 hover:bg-soft disabled:opacity-30">
              <ArrowDown size={15} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => update(sections.filter(other => other !== section))} aria-label={`Ta ${section} ut av menyen`} className="rounded p-1 hover:bg-soft">
              <X size={15} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
      <form onSubmit={add} className="mt-4 flex gap-2">
        <input
          value={adding}
          onChange={event => setAdding(event.target.value)}
          list="section-suggestions"
          placeholder="Legg til en seksjon"
          aria-label="Ny seksjon i menyen"
          maxLength={40}
          className={input}
        />
        <datalist id="section-suggestions">
          {suggestions.map(section => (
            <option key={section} value={section} />
          ))}
        </datalist>
        <button type="submit" className={button.secondary} disabled={!adding.trim() || sections.length >= 12}>
          Legg til
        </button>
      </form>
      <div className="mt-6 flex items-center gap-3">
        <button type="button" className={button.primary} disabled={busy} onClick={() => void save()}>
          {busy ? 'Lagrer …' : 'Lagre menyen'}
        </button>
        {notice && <span className="font-ui text-[13px] text-[#1e6b3a]">{notice}</span>}
        {error && <span className="font-ui text-[13px] text-[#b3261e]">{error}</span>}
      </div>
    </div>
  )
}

function Loaded({ token }: { token: string }) {
  const { data, error, loading } = useLoad(() => Promise.all([getMenu(), getSections(token)]), `menu:${token}`)
  if (loading) return <Loading />
  if (error || !data) return <Problem message={error ?? 'Noe gikk galt'} />
  return <Menu token={token} initial={data[0].sections} inUse={data[1]} />
}

export default function EditMenu() {
  useTitle('Menyen')
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/redaksjon" className="font-ui text-[13px] font-semibold underline-offset-4 hover:underline">
        Redaksjonen
      </Link>
      <p className={`${kicker} mt-1 text-muted`}>{edition.name}</p>
      <h1 className="mb-6 mt-1 text-[36px] font-bold leading-tight">{edition.sectionsLabel} i menyen</h1>
      <DeskGuard>{token => <Loaded token={token} />}</DeskGuard>
    </div>
  )
}
