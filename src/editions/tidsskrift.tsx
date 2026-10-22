import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Avatar from '../components/Avatar'
import Picture from '../components/Picture'
import { kicker } from '../components/styles'
import { articleHref, edition, sectionHref } from '../edition'
import { names, shortDate } from '../lib/format'
import type { Article } from '../lib/press'
import { citationOf } from '../lib/citation'
import { useSections } from '../state/useSections'
import { FamilyLinks, Tags, UserLinks } from './shared'

// Tebonsma Tidsskrift: a scientific journal. White and calm, a petrol accent, the article's
// type over its title, an abstract and a way to cite it.

// The abstract: words in capitals before a colon (BAKGRUNN:, MATERIALE OG METODE:) start a part
const LABEL = /\b([A-ZÆØÅ][A-ZÆØÅ ]*[A-ZÆØÅ]):\s*/g

function Abstract({ text }: { text: string }) {
  const labels = [...text.matchAll(LABEL)]
  if (labels.length === 0) return <p className="text-[17px] leading-relaxed">{text}</p>
  const before = text.slice(0, labels[0].index).trim()
  return (
    <div className="space-y-2">
      {before && <p className="text-[17px] leading-relaxed">{before}</p>}
      {labels.map((label, i) => (
        <p key={label.index} className="text-[17px] leading-relaxed">
          <strong className="font-ui text-[13px] font-bold uppercase tracking-[0.06em] text-accent">{label[1].toLowerCase()}</strong>{' '}
          {text.slice(label.index + label[0].length, labels[i + 1]?.index ?? text.length).trim()}
        </p>
      ))}
    </div>
  )
}

const navItem = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap border-b-2 px-3 py-3 font-ui text-[14px] font-semibold ${isActive ? 'border-accent text-accent' : 'border-transparent hover:text-accent'}`

export function Header() {
  const sections = useSections()
  return (
    <header className="border-b border-line">
      <div className="h-1.5 bg-accent" />
      <div className="mx-auto flex max-w-6xl items-start justify-between gap-4 px-4 pt-5">
        <Link to="/" className="group" aria-label={`${edition.name}, forsiden`}>
          <div className="font-ui text-[12px] font-bold uppercase tracking-[0.32em] text-accent">Tebonsma</div>
          <div className="text-[34px] font-semibold leading-none tracking-tight sm:text-[42px]">Tidsskrift</div>
        </Link>
        <UserLinks className="pt-1" />
      </div>
      <p className="mx-auto max-w-6xl px-4 pt-2 font-ui text-[13px] text-muted">
        {edition.tagline} <span className="hidden sm:inline">· ISSN 6767-0021</span>
      </p>
      <nav aria-label={edition.sectionsLabel} className="mx-auto mt-3 max-w-6xl px-1">
        <ul className="-mb-px flex overflow-x-auto overflow-y-hidden">
          <li>
            <NavLink to="/" end className={navItem}>
              Forsiden
            </NavLink>
          </li>
          {sections.map(section => (
            <li key={section}>
              <NavLink to={sectionHref(section)} className={navItem}>
                {section}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/arkiv" className={navItem}>
              Arkiv
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="mt-20 bg-accent text-accent-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-ui text-[11px] font-bold uppercase tracking-[0.32em] opacity-80">Tebonsma</div>
          <div className="text-[26px] font-semibold leading-none">Tidsskrift</div>
          <p className="mt-3 font-ui text-[13px] opacity-80">Utgitt av Brorskapet TEBONSMA. Synspunktene er forfatternes egne, og ofte bare deres.</p>
        </div>
        <FamilyLinks className="opacity-90" />
      </div>
    </footer>
  )
}

function TypeLine({ article }: { article: Article }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3">
      {article.section && (
        <Link to={sectionHref(article.section)} className={`${kicker} text-accent hover:underline`}>
          {article.section}
        </Link>
      )}
      {article.visibility === 'members' && <span className={`${kicker} text-muted`}>For medlemmer</span>}
    </div>
  )
}

const Authors = ({ article }: { article: Article }) =>
  article.authors.length > 0 ? <p className="font-ui text-[14px] text-ink">{names(article.authors.map(a => a.name))}</p> : null

function Featured({ article, large }: { article: Article; large?: boolean }) {
  const citation = citationOf(article)
  return (
    <article className={large ? 'lg:col-span-2' : ''}>
      <Link to={articleHref(article.slug)} className={`group grid gap-5 ${large && article.coverImage ? 'sm:grid-cols-[1fr_16rem]' : ''}`}>
        <div>
          <TypeLine article={article} />
          <h2 className={`mt-2 font-semibold leading-tight group-hover:text-accent ${large ? 'text-[30px]' : 'text-[22px]'}`}>{article.title}</h2>
          <div className="mt-2">
            <Authors article={article} />
            <p className="font-ui text-[13px] text-muted">
              {citation.short} · doi:{citation.doi}
            </p>
          </div>
          {article.lead && <p className={`mt-3 text-[16px] leading-relaxed text-muted ${large ? 'line-clamp-5' : 'line-clamp-3'}`}>{article.lead}</p>}
        </div>
        {large && article.coverImage && <Picture src={article.coverImage} className="aspect-[4/3] rounded" />}
      </Link>
    </article>
  )
}

export function ListItem({ article }: { article: Article }) {
  return (
    <article className="grid gap-1 border-b border-line py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
      <div className="font-ui text-[13px] text-muted">{article.publishedAt && shortDate(article.publishedAt)}</div>
      <Link to={articleHref(article.slug)} className="group block">
        <TypeLine article={article} />
        <h3 className="mt-1 text-[19px] font-semibold leading-snug group-hover:text-accent">{article.title}</h3>
        <Authors article={article} />
      </Link>
    </article>
  )
}

export function Front({ front, latest }: { front: Article[]; latest: Article[] }) {
  const featured = front.length > 0 ? front : latest.slice(0, 3)
  const rest = front.length > 0 ? latest : latest.slice(3)
  if (featured.length === 0) return <p className="py-24 text-center font-ui text-muted">Ingen artikler ennå. Fagfellene leser fortsatt.</p>
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-10">
        <h2 className={`${kicker} text-muted`}>Utvalgte artikler</h2>
        <div className="mt-5 grid gap-x-10 gap-y-10 border-t border-line pt-6 lg:grid-cols-2">
          {featured.map((article, i) => (
            <Featured key={article.id} article={article} large={i === 0} />
          ))}
        </div>
      </section>
      {rest.length > 0 && (
        <section className="border-t-2 border-accent pt-6">
          <h2 className={`${kicker} text-muted`}>Siste artikler</h2>
          <div className="mt-2">
            {rest.map(article => (
              <ListItem key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export function ArticleHeader({ article }: { article: Article }) {
  const citation = citationOf(article)
  return (
    <header className="mx-auto max-w-[760px] px-4 pt-10">
      <TypeLine article={article} />
      <h1 className="mt-3 text-[32px] font-semibold leading-[1.15] tracking-tight sm:text-[40px]">{article.title}</h1>
      {article.authors.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          {article.authors.map(author => (
            <li key={author.id} className="flex items-center gap-2 font-ui text-[15px]">
              <Avatar member={author} className="h-7 w-7 text-[11px]" />
              {author.name}
            </li>
          ))}
        </ul>
      )}
      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 border-y border-line py-3 font-ui text-[13px] sm:grid-cols-4">
        <div>
          <dt className="text-muted">Publisert</dt>
          <dd>{article.publishedAt ? shortDate(article.publishedAt) : 'Ikke publisert'}</dd>
        </div>
        <div>
          <dt className="text-muted">Årgang og nummer</dt>
          <dd>
            {citation.volume} ({citation.issue})
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted">DOI</dt>
          <dd>{citation.doi}</dd>
        </div>
      </dl>
      {article.lead && (
        <section className="mt-6 border-l-4 border-accent bg-soft px-5 py-4">
          <h2 className={`${kicker} mb-2 text-accent`}>{edition.leadLabel}</h2>
          <Abstract text={article.lead} />
        </section>
      )}
      {article.coverImage && (
        <figure className="mt-8">
          <Picture src={article.coverImage} className="max-h-[60vh] rounded" />
          {article.coverCaption && <figcaption className="mt-2 font-ui text-[13px] text-muted">{article.coverCaption}</figcaption>}
        </figure>
      )}
    </header>
  )
}

// After the text: the keywords and how to cite the article
export function ArticleFooter({ article }: { article: Article }) {
  const citation = citationOf(article)
  const text = `${names(article.authors.map(a => a.name)) || 'Redaksjonen'}. ${article.title}. ${citation.short}. doi: ${citation.doi}`
  const [copied, setCopied] = useState(false)
  const copy = () => {
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }
  return (
    <section className="mx-auto mt-10 max-w-[760px] space-y-6 px-4">
      {article.tags.length > 0 && <Tags article={article} />}
      <div className="rounded border border-line px-5 py-4">
        <h2 className={`${kicker} text-muted`}>Sitér artikkelen</h2>
        <p className="mt-2 font-ui text-[14px] leading-relaxed">{text}</p>
        <button type="button" onClick={copy} className="mt-2 font-ui text-[13px] font-semibold text-accent hover:underline">
          {copied ? 'Kopiert' : 'Kopier'}
        </button>
      </div>
    </section>
  )
}
