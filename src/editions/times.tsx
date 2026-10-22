import { Link, NavLink } from 'react-router-dom'
import Byline from '../components/Byline'
import Picture from '../components/Picture'
import { kicker } from '../components/styles'
import { articleHref, edition, sectionHref } from '../edition'
import { longDate, when } from '../lib/format'
import type { Article } from '../lib/press'
import { useSections } from '../state/useSections'
import { FamilyLinks, Tags, UserLinks } from './shared'

// The Tebonsma Times: a newspaper. Black on white, the fraktur masthead, a top story and a grid.

const navItem = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap px-3 py-2.5 font-ui text-[12px] font-bold uppercase tracking-[0.08em] ${isActive ? 'underline underline-offset-[6px]' : 'hover:underline hover:underline-offset-[6px]'}`

export function Header() {
  const sections = useSections()
  const volume = new Date().getFullYear() - 2020
  return (
    <header className="mx-auto w-full max-w-6xl px-4">
      <div className="flex items-center justify-between gap-4 py-3 font-ui text-[12px]">
        <span className="text-muted">
          {longDate()} <span className="hidden sm:inline">· Årgang {volume}</span>
        </span>
        <UserLinks />
      </div>
      <Link to="/" className="block py-3 sm:py-5" aria-label={`${edition.name}, forsiden`}>
        <img src="/times/masthead.svg" alt={edition.name} className="mx-auto h-9 w-auto sm:h-14 lg:h-[68px]" />
      </Link>
      <nav aria-label="Seksjoner" className="border-y-4 border-double border-ink">
        <ul className="flex justify-start overflow-x-auto overflow-y-hidden sm:justify-center">
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
    <footer className="mt-20 border-t border-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <img src="/times/masthead.svg" alt={edition.name} className="h-8 w-auto" />
          <p className="mt-3 font-ui text-[13px] text-muted">{edition.tagline}</p>
          <p className="mt-1 font-ui text-[13px] text-muted">Ansvarlig redaktør: Petter «Abraham» Lona</p>
        </div>
        <FamilyLinks />
      </div>
    </footer>
  )
}

const MembersOnly = ({ article }: { article: Article }) =>
  article.visibility === 'members' ? <span className={`${kicker} text-muted`}>For medlemmer</span> : null

function Kicker({ article }: { article: Article }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3">
      {article.section && (
        <Link to={sectionHref(article.section)} className={`${kicker} hover:underline`}>
          {article.section}
        </Link>
      )}
      <MembersOnly article={article} />
    </div>
  )
}

function TopStory({ article }: { article: Article }) {
  return (
    <article className="lg:col-span-8 lg:border-r lg:border-line lg:pr-8">
      <Link to={articleHref(article.slug)} className="group block">
        {article.coverImage && <Picture src={article.coverImage} className="aspect-[3/2]" />}
        <div className="mt-4">
          <Kicker article={article} />
          <h2 className="mt-2 text-[30px] font-bold leading-[1.1] tracking-tight group-hover:underline sm:text-[40px]">{article.title}</h2>
          {article.lead && <p className="mt-3 text-[19px] leading-snug text-muted">{article.lead}</p>}
        </div>
      </Link>
      <div className="mt-4">
        <Byline article={article} />
      </div>
    </article>
  )
}

function SideStory({ article }: { article: Article }) {
  return (
    <article className="border-b border-line pb-5 last:border-0">
      <Link to={articleHref(article.slug)} className="group block">
        {article.coverImage && <Picture src={article.coverImage} className="mb-3 aspect-[16/9]" />}
        <Kicker article={article} />
        <h3 className="mt-1 text-[21px] font-bold leading-tight group-hover:underline">{article.title}</h3>
        {article.lead && <p className="mt-1.5 line-clamp-3 text-[15px] leading-snug text-muted">{article.lead}</p>}
      </Link>
    </article>
  )
}

function Card({ article }: { article: Article }) {
  return (
    <article>
      <Link to={articleHref(article.slug)} className="group block">
        {article.coverImage && <Picture src={article.coverImage} className="mb-3 aspect-[3/2]" />}
        <Kicker article={article} />
        <h3 className="mt-1 text-[22px] font-bold leading-tight group-hover:underline">{article.title}</h3>
        {article.lead && <p className="mt-1.5 line-clamp-3 text-[16px] leading-snug text-muted">{article.lead}</p>}
      </Link>
    </article>
  )
}

// One line in a list: the latest news, a section, the archive
export function ListItem({ article }: { article: Article }) {
  return (
    <article className="border-b border-line py-5">
      <Link to={articleHref(article.slug)} className="group flex gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3">
            {article.section && <span className={kicker}>{article.section}</span>}
            {article.publishedAt && <span className="font-ui text-[12px] text-muted">{when(article.publishedAt)}</span>}
            <MembersOnly article={article} />
          </div>
          <h3 className="mt-1 text-[21px] font-bold leading-tight group-hover:underline">{article.title}</h3>
          {article.lead && <p className="mt-1 line-clamp-2 text-[16px] leading-snug text-muted">{article.lead}</p>}
        </div>
        {article.coverImage && <Picture src={article.coverImage} className="aspect-square w-24 shrink-0 sm:w-32" />}
      </Link>
    </article>
  )
}

export function Front({ front, latest }: { front: Article[]; latest: Article[] }) {
  // Before the editors have placed anything, the newest lead the page
  const placed = front.length > 0 ? front : latest.slice(0, 4)
  const rest = front.length > 0 ? latest : latest.slice(4)
  const [top, ...others] = placed
  if (!top) return <p className="py-24 text-center font-ui text-muted">Ingen saker ennå. Redaksjonen jobber med saken.</p>
  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="grid gap-8 py-8 lg:grid-cols-12">
        <TopStory article={top} />
        {others.length > 0 && (
          <div className="space-y-5 lg:col-span-4">
            {others.slice(0, 3).map(article => (
              <SideStory key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
      {others.length > 3 && (
        <div className="grid gap-8 border-t border-ink pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {others.slice(3).map(article => (
            <Card key={article.id} article={article} />
          ))}
        </div>
      )}
      {rest.length > 0 && (
        <section className="mt-12 border-t-4 border-double border-ink pt-6">
          <h2 className={`${kicker} text-[13px]`}>Siste nytt</h2>
          <div className="grid gap-x-10 lg:grid-cols-2">
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
  return (
    <header>
      <div className="mx-auto max-w-[720px] px-4 pt-10">
        <Kicker article={article} />
        <h1 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-tight sm:text-[46px]">{article.title}</h1>
        {article.lead && <p className="mt-4 text-[21px] leading-snug text-muted">{article.lead}</p>}
        <div className="mt-6 border-y border-line py-4">
          <Byline article={article} />
        </div>
      </div>
      {article.coverImage && (
        <figure className="mx-auto mt-8 max-w-4xl px-4">
          <Picture src={article.coverImage} className="max-h-[70vh]" />
          {article.coverCaption && <figcaption className="mt-2 font-ui text-[13px] text-muted">{article.coverCaption}</figcaption>}
        </figure>
      )}
    </header>
  )
}

// After the text: the tags, each leading to the other articles with it
export function ArticleFooter({ article }: { article: Article }) {
  if (article.tags.length === 0) return null
  return (
    <section className="mx-auto mt-10 max-w-[720px] px-4">
      <Tags article={article} />
    </section>
  )
}
