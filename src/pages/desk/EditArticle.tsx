import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AuthorPicker from '../../components/desk/AuthorPicker'
import DeskGuard from '../../components/desk/DeskGuard'
import RichEditor from '../../components/desk/RichEditor'
import Picture from '../../components/Picture'
import { Loading, Problem } from '../../components/Status'
import { button, input, kicker, label } from '../../components/styles'
import { articleHref, edition } from '../../edition'
import { errorMessage } from '../../lib/api'
import { ahead, localInput } from '../../lib/format'
import { toJpeg } from '../../lib/image'
import {
  createArticle,
  deleteArticle,
  getForEditing,
  listMembers,
  publishArticle,
  unpublishArticle,
  updateArticle,
  uploadImage,
  type Article,
  type ArticleInput,
  type Member,
} from '../../lib/press'
import { useLoad } from '../../state/useLoad'
import { useTitle } from '../../state/useTitle'

const EMPTY: ArticleInput = { title: '', section: '', lead: '', body: '', tags: [], authors: [], visibility: 'members', coverImage: null, coverCaption: '', issue: '' }

const inputOf = (article: Article): ArticleInput => ({
  title: article.title,
  section: article.section,
  lead: article.lead,
  body: article.body ?? '',
  tags: article.tags,
  authors: article.authors.map(a => (a.id ? { id: a.id, alias: a.alias ?? '', name: '' } : { id: null, alias: '', name: a.name })),
  visibility: article.visibility,
  coverImage: article.coverImage,
  coverCaption: article.coverCaption,
  issue: article.issue,
})

function Form({ token, article, members }: { token: string; article: Article | null; members: Member[] }) {
  const navigate = useNavigate()
  const [saved, setSaved] = useState<Article | null>(article)
  const [draft, setDraft] = useState<ArticleInput>(article ? inputOf(article) : EMPTY)
  const [tagText, setTagText] = useState((article?.tags ?? []).join(', '))
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  // The time to publish at, while choosing one
  const [planning, setPlanning] = useState<string | null>(null)

  const change = (patch: Partial<ArticleInput>) => {
    setDraft(current => ({ ...current, ...patch }))
    setDirty(true)
    setNotice(null)
  }

  const run = async (what: string, work: () => Promise<void>) => {
    setBusy(what)
    setError(null)
    setNotice(null)
    try {
      await work()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  const tags = () =>
    tagText
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean)

  // Saves what is in the form; a new article gets its own address
  const save = async () => {
    // An author without an account and without a name is left out
    const input = { ...draft, tags: tags(), authors: draft.authors.filter(a => a.id || a.name.trim()) }
    const result = saved ? await updateArticle(token, saved.id, input) : await createArticle(token, input)
    setSaved(result)
    setDirty(false)
    if (!saved) navigate(`/redaksjon/sak/${result.id}`, { replace: true })
    return result
  }

  const publish = () =>
    run('publish', async () => {
      const current = await save()
      setSaved(await publishArticle(token, current.id))
      setPlanning(null)
      setNotice('Publisert.')
    })
  const schedule = (at: string) =>
    run('schedule', async () => {
      const current = await save()
      const result = await publishArticle(token, current.id, new Date(at).toISOString())
      setSaved(result)
      setPlanning(null)
      setNotice(result.scheduled ? `Publiseres ${ahead(result.publishedAt!)}.` : 'Publisert.')
    })
  const unpublish = () =>
    run('unpublish', async () => {
      const wasScheduled = saved!.scheduled
      setSaved(await unpublishArticle(token, saved!.id))
      setNotice(wasScheduled ? 'Planleggingen er avbrutt. Saken er et utkast igjen.' : 'Trukket tilbake. Saken er et utkast igjen.')
    })
  // Next full hour, at least half an hour ahead
  const suggestedTime = () => {
    const date = new Date(Date.now() + 90 * 60_000)
    date.setMinutes(0, 0, 0)
    return localInput(date)
  }
  const remove = () => {
    if (!saved || !window.confirm(`Slette «${saved.title}» for godt?`)) return
    void run('delete', async () => {
      await deleteArticle(token, saved.id)
      navigate('/redaksjon')
    })
  }
  const addCover = (file: File) =>
    run('cover', async () => {
      const { url } = await uploadImage(token, await toJpeg(file, 2000))
      change({ coverImage: url })
    })

  const scheduled = !!saved?.scheduled
  const published = saved?.status === 'published' && !scheduled

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
      <div className="space-y-5">
        <div>
          <label htmlFor="title" className={label}>
            Tittel
          </label>
          <textarea
            id="title"
            rows={2}
            value={draft.title}
            onChange={event => change({ title: event.target.value.replace(/\n/g, ' ') })}
            placeholder="Tittelen på saken"
            className="w-full resize-none border-0 border-b border-line bg-transparent pb-2 text-[30px] font-bold leading-tight outline-none placeholder:text-muted/50 focus:border-ink"
          />
        </div>
        <div>
          <label htmlFor="lead" className={label}>
            {edition.leadLabel}
          </label>
          <textarea
            id="lead"
            rows={edition.id === 'tidsskrift' ? 5 : 3}
            value={draft.lead}
            onChange={event => change({ lead: event.target.value })}
            placeholder={edition.id === 'tidsskrift' ? 'BAKGRUNN: … METODE: … RESULTATER: … FORTOLKNING: …' : 'Kort om hva saken handler om'}
            className={`${input} text-[17px] leading-snug`}
          />
          {edition.id === 'tidsskrift' && <p className="mt-1 font-ui text-[12px] text-muted">Ord i store bokstaver før kolon blir egne overskrifter i sammendraget.</p>}
        </div>
        <div>
          <span className={label}>Brødtekst</span>
          <RichEditor token={token} initialHtml={draft.body} onChange={body => change({ body })} />
        </div>
      </div>

      <aside className="space-y-6">
        <div className="space-y-2 rounded-md border border-line p-4">
          <p className="font-ui text-[13px]">
            <span className="font-semibold">{published ? 'Publisert' : scheduled ? 'Planlagt' : saved ? 'Utkast' : 'Ny sak'}</span>
            {dirty && <span className="text-muted"> · endringer ikke lagret</span>}
          </p>
          {scheduled && <p className="font-ui text-[13px]">Publiseres {ahead(saved.publishedAt!)}. Til da ser bare redaksjonen saken.</p>}
          <div className="flex flex-wrap gap-2">
            {published || scheduled ? (
              <>
                <button type="button" className={dirty ? button.primary : button.secondary} disabled={!!busy || !dirty || !draft.title.trim()} onClick={() => void run('save', async () => void (await save(), setNotice('Oppdatert.')))}>
                  {busy === 'save' ? 'Lagrer …' : 'Oppdater'}
                </button>
                {scheduled && (
                  <button type="button" className={button.secondary} disabled={!!busy || !draft.title.trim()} onClick={() => void publish()}>
                    {busy === 'publish' ? 'Publiserer …' : 'Publiser nå'}
                  </button>
                )}
                <button type="button" className={button.secondary} disabled={!!busy} onClick={() => void unpublish()}>
                  {scheduled ? 'Avbryt planlegging' : 'Trekk tilbake'}
                </button>
              </>
            ) : (
              <>
                <button type="button" className={button.secondary} disabled={!!busy || !draft.title.trim()} onClick={() => void run('save', async () => void (await save(), setNotice('Lagret.')))}>
                  {busy === 'save' ? 'Lagrer …' : 'Lagre'}
                </button>
                <button type="button" className={button.primary} disabled={!!busy || !draft.title.trim()} onClick={() => void publish()}>
                  {busy === 'publish' ? 'Publiserer …' : 'Publiser'}
                </button>
              </>
            )}
          </div>
          {!published &&
            (planning === null ? (
              <button
                type="button"
                className="block font-ui text-[13px] font-semibold underline-offset-4 hover:underline disabled:opacity-40"
                disabled={!!busy || !draft.title.trim()}
                onClick={() => setPlanning(scheduled ? localInput(new Date(saved.publishedAt!)) : suggestedTime())}
              >
                {scheduled ? 'Endre tidspunkt' : 'Planlegg publisering'}
              </button>
            ) : (
              <form
                className="space-y-2 rounded border border-line bg-soft p-3"
                onSubmit={event => {
                  event.preventDefault()
                  void schedule(planning)
                }}
              >
                <label htmlFor="publish-at" className={label}>
                  Publiseres
                </label>
                <input
                  id="publish-at"
                  type="datetime-local"
                  required
                  min={localInput(new Date())}
                  value={planning}
                  onChange={event => setPlanning(event.target.value)}
                  className={input}
                />
                <div className="flex flex-wrap gap-2">
                  <button type="submit" className={button.primary} disabled={!!busy || !planning}>
                    {busy === 'schedule' ? 'Planlegger …' : scheduled ? 'Endre' : 'Planlegg'}
                  </button>
                  <button type="button" className={button.secondary} onClick={() => setPlanning(null)}>
                    Avbryt
                  </button>
                </div>
              </form>
            ))}
          {saved && (
            <Link to={articleHref(saved.slug)} className="inline-block font-ui text-[13px] font-semibold underline-offset-4 hover:underline">
              {published ? 'Vis saken' : 'Forhåndsvis'}
            </Link>
          )}
          {notice && <p className="font-ui text-[13px] text-[#1e6b3a]">{notice}</p>}
          {error && <p className="font-ui text-[13px] text-[#b3261e]">{error}</p>}
        </div>

        <div>
          <span className={label}>Hvem kan lese</span>
          <div className="space-y-1 font-ui text-[14px]">
            {(['members', 'public'] as const).map(visibility => (
              <label key={visibility} className="flex items-center gap-2">
                <input type="radio" name="visibility" checked={draft.visibility === visibility} onChange={() => change({ visibility })} />
                {visibility === 'members' ? 'Kun medlemmer' : 'Åpen for alle'}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="section" className={label}>
            {edition.sectionLabel}
          </label>
          <input id="section" list="sections" value={draft.section} onChange={event => change({ section: event.target.value })} className={input} />
          <datalist id="sections">
            {edition.sections.map(section => (
              <option key={section} value={section} />
            ))}
          </datalist>
        </div>

        {edition.id === 'tidsskrift' && (
          <div>
            <label htmlFor="issue" className={label}>
              Utgave
            </label>
            <input id="issue" value={draft.issue} onChange={event => change({ issue: event.target.value })} placeholder="F.eks. 1/2025" maxLength={20} className={input} />
            <p className="mt-1 font-ui text-[12px] text-muted">Som trykket. Tom: måneden saken kom ut.</p>
          </div>
        )}

        <div>
          <span className={label}>Forfattere</span>
          <AuthorPicker members={members} value={draft.authors} onChange={authors => change({ authors })} />
        </div>

        <div>
          <label htmlFor="tags" className={label}>
            {edition.tagsLabel} (skilt med komma)
          </label>
          <input
            id="tags"
            value={tagText}
            onChange={event => {
              setTagText(event.target.value)
              setDirty(true)
            }}
            className={input}
          />
        </div>

        <div>
          <span className={label}>Toppbilde</span>
          {draft.coverImage ? (
            <div className="space-y-2">
              <Picture src={draft.coverImage} className="aspect-[3/2] rounded" />
              <input
                value={draft.coverCaption}
                onChange={event => change({ coverCaption: event.target.value })}
                placeholder="Bildetekst og fotograf"
                aria-label="Bildetekst"
                className={input}
              />
              <button type="button" className={`${button.danger} h-8`} onClick={() => change({ coverImage: null, coverCaption: '' })}>
                Fjern bildet
              </button>
            </div>
          ) : (
            <button type="button" className={button.secondary} disabled={busy === 'cover'} onClick={() => coverRef.current?.click()}>
              {busy === 'cover' ? 'Laster opp …' : 'Last opp bilde'}
            </button>
          )}
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={event => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) void addCover(file)
            }}
          />
        </div>

        {saved && (
          <div className="border-t border-line pt-4">
            <button type="button" className={button.danger} disabled={!!busy} onClick={remove}>
              Slett saken
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

function Loaded({ token, id }: { token: string; id: string | undefined }) {
  const { data, error, loading } = useLoad(
    () => Promise.all([id ? getForEditing(token, id) : Promise.resolve(null), listMembers(token)]),
    `edit:${id ?? 'new'}:${token}`,
  )
  if (loading) return <Loading />
  if (error || !data) return <Problem message={error ?? 'Noe gikk galt'} />
  const [article, members] = data
  // A new form for each article, so the editor starts with its text
  return <Form key={article?.id ?? 'new'} token={token} article={article} members={members} />
}

export default function EditArticle() {
  const { id } = useParams()
  useTitle(id ? 'Rediger sak' : 'Ny sak')
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <DeskGuard>
        {token => (
          <>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <Link to="/redaksjon" className="font-ui text-[13px] font-semibold underline-offset-4 hover:underline">
                  Redaksjonen
                </Link>
                <h1 className={`${kicker} mt-1 text-muted`}>{id ? 'Rediger sak' : 'Ny sak'}</h1>
              </div>
            </div>
            <Loaded token={token} id={id} />
          </>
        )}
      </DeskGuard>
    </div>
  )
}
