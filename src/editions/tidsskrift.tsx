import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'
import ArticleBody from '../components/ArticleBody'
import Avatar from '../components/Avatar'
import LockedNotice from '../components/LockedNotice'
import Picture from '../components/Picture'
import { articleHref, edition, sectionHref } from '../edition'
import { ahead, longDate, names, shortDate } from '../lib/format'
import type { Article } from '../lib/press'
import { citationOf } from '../lib/citation'
import { useMobileMenu } from '../state/useMobileMenu'
import { useSections } from '../state/useSections'
import { FamilyLinks, MenuButton, UserLinks } from './shared'

// Tebonsma Tidsskrift: a scientific journal, made to look like the Norwegian medical journal.
// Georgia on white in a narrow page, small grey capitals, blue links, thin rules and a thick
// black one under the menu. Research has narrow sans headlines, the rest a newspaper serif.

const wrap = 'mx-auto w-full max-w-[1012px] px-4'
// Small capitals with air between the letters: an article's type, the menu, the contents
const caps = 'font-ui text-[12px] uppercase tracking-[0.1em]'

const RESEARCH = new Set(['Originalartikkel', 'Kort rapport', 'Kasuistikk', 'Oversiktsartikkel'])
const headline = (article: Article) => (RESEARCH.has(article.section) ? 'font-narrow font-semibold tracking-[-0.015em]' : 'font-headline font-medium')

// The abstract: words in capitals before a colon (BAKGRUNN:, MATERIALE OG METODE:) start a part
const LABEL = /\b([A-ZÆØÅ][A-ZÆØÅ ]*[A-ZÆØÅ]):\s*/g
const sentence = (capitals: string) => capitals.charAt(0) + capitals.slice(1).toLowerCase()
// The abstract as one run of text, for the front page and lists
const plain = (lead: string) => lead.replace(LABEL, '').replace(/\s+/g, ' ').trim()

// The journal's mark, a T in a black circle, as big as the text around it. Drawn, so the T sits in
// the middle whatever the font does (also in public/tidsskrift/favicon.svg and icon.svg).
const Mark = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 100" aria-hidden="true" className={`inline-block h-[0.56em] w-[0.56em] shrink-0 ${className}`}>
    <circle cx="50" cy="50" r="50" fill="#000" />
    <path fill="#fff" d="M27 25H73V40H70C69.5 34 67 32 62 32H57.5V68C57.5 70 59 71 62 71.5L65 72V75H35V72L38 71.5C41 71 42.5 70 42.5 68V32H38C33 32 30.5 34 30 40H27Z" />
  </svg>
)

function Wordmark({ large }: { large?: boolean }) {
  return (
    <span
      className={`inline-flex items-start gap-[0.12em] whitespace-nowrap font-headline font-extrabold leading-none tracking-[-0.03em] text-black ${large ? 'text-[34px] sm:text-[58px]' : 'text-[26px] sm:text-[36px]'}`}
    >
      Tebonsma Tidsskrift
      <Mark className="mt-[0.06em]" />
    </span>
  )
}

const navItem = ({ isActive }: { isActive: boolean }) =>
  `${caps} flex items-center gap-1.5 whitespace-nowrap px-2 py-4 ${isActive ? 'text-black' : 'text-muted hover:text-black'}`
// On a phone, a list under the name, opened with the menu button
const mobileItem = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 px-4 py-[13px] font-ui text-[14px] uppercase tracking-[0.1em] text-black ${isActive ? 'underline underline-offset-[5px]' : ''}`

export function Header() {
  const sections = useSections()
  const menu = useMobileMenu()
  const front = useLocation().pathname === '/'
  const top = useRef<HTMLDivElement>(null)
  // Once the name has scrolled away, its mark goes into the menu, which stays at the top
  const [past, setPast] = useState(false)
  useEffect(() => {
    const element = top.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setPast(!entry.isIntersecting))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <header>
      <div className={`${wrap} flex items-center justify-between pb-2 pt-2 md:justify-end md:pb-3 md:pt-3`}>
        <MenuButton open={menu.open} onClick={menu.toggle} />
        <UserLinks />
      </div>
      <div ref={top} className={wrap}>
        <div className="border-t border-line">
          <div className={`${caps} hidden justify-between pt-2.5 font-semibold text-muted md:flex`}>
            <span>Tidsskrift for Brorskapet TEBONSMA</span>
            <span>{longDate()}</span>
          </div>
          <div className={`flex md:justify-center ${front ? 'pb-1 pt-4 md:pb-2 md:pt-5' : 'pb-1 pt-3 md:pb-1 md:pt-3'}`}>
            <Link to="/" aria-label={`${edition.name}, forsiden`}>
              <Wordmark large={front} />
            </Link>
          </div>
        </div>
      </div>
      <nav aria-label={edition.sectionsLabel} className="bg-paper md:sticky md:top-0 md:z-20">
        <div className={wrap}>
          <div className={`border-b-[3px] border-b-black md:flex md:items-center md:border-t md:border-t-line ${menu.open ? 'border-t border-t-line' : ''}`}>
            {past && (
              <Link to="/" aria-label="Forsiden" className="mr-2 hidden shrink-0 text-[34px] md:flex">
                <Mark />
              </Link>
            )}
            <ul className="hidden flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] md:flex lg:justify-between">
              {sections.map(section => (
                <li key={section}>
                  <NavLink to={sectionHref(section)} className={navItem}>
                    {section}
                  </NavLink>
                </li>
              ))}
              <li className={sections.length > 0 ? 'ml-auto lg:ml-0' : 'ml-auto'}>
                <NavLink to="/arkiv" className={navItem}>
                  Søk <Search size={14} aria-hidden="true" />
                </NavLink>
              </li>
            </ul>
            {menu.open && (
              <ul id="mobilmeny" className="py-1 md:hidden">
                {sections.map(section => (
                  <li key={section}>
                    <NavLink to={sectionHref(section)} onClick={menu.close} className={mobileItem}>
                      {section}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <NavLink to="/arkiv" onClick={menu.close} className={mobileItem}>
                    Søk <Search size={15} aria-hidden="true" />
                  </NavLink>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="mt-20">
      <div className={wrap}>
        <div className="border-t-[3px] border-black pb-14 pt-8 text-center text-[16px] leading-[22px]">
          <Link to="/" aria-label={`${edition.name}, forsiden`}>
            <Wordmark />
          </Link>
          <p className="mx-auto mt-5 max-w-[640px]">
            Tebonsma Tidsskrift er Brorskapet TEBONSMAs vitenskapelige tidsskrift. Fagfellevurdert, av og til. Synspunktene er forfatternes egne, og ofte bare deres.
          </p>
          <p className="mt-2">ISSN 6767-0021 (nett)</p>
          <FamilyLinks className="mt-6 justify-center uppercase tracking-[0.1em] text-accent" />
        </div>
      </div>
    </footer>
  )
}

// The type of article over its title, and whether it is shut to visitors
function Kicker({ article }: { article: Article }) {
  return (
    <div className={`${caps} text-[#747476]`}>
      {article.section && (
        <Link to={sectionHref(article.section)} className="hover:text-black">
          {article.section}
        </Link>
      )}
      {article.locked && <span className="text-muted">{article.section && ' · '}For medlemmer</span>}
    </div>
  )
}

const byline = (article: Article) => article.authors.map(a => a.name).join(', ')

function Title({ article, as: Tag = 'h2', className }: { article: Article; as?: 'h2' | 'h3'; className: string }) {
  return (
    <Tag className={`${headline(article)} text-black ${className}`}>
      <Link to={articleHref(article.slug)} className="hover:text-accent">
        {article.title}
      </Link>
    </Tag>
  )
}

// The top of the front page: a picture on the left, the article on the right
function Lead({ article }: { article: Article }) {
  return (
    <article className="grid gap-5 border-b border-line py-6 md:grid-cols-2 md:gap-6">
      {article.coverImage && (
        <Link to={articleHref(article.slug)} tabIndex={-1}>
          <Picture src={article.coverImage} className="aspect-[3/2]" />
        </Link>
      )}
      <div className={article.coverImage ? '' : 'md:col-span-2 md:max-w-[700px]'}>
        <Kicker article={article} />
        <Title article={article} className="mt-1 text-[32px] leading-[1.1] sm:text-[44px]" />
        {article.lead && <p className="mt-4 line-clamp-5 text-[16px] leading-[22px]">{plain(article.lead)}</p>}
      </div>
    </article>
  )
}

// Four side by side, with a picture over each title
function Column({ article }: { article: Article }) {
  return (
    <article className="py-5 md:px-4 md:first:pl-0 md:last:pr-0">
      <Kicker article={article} />
      {article.coverImage && (
        <Link to={articleHref(article.slug)} tabIndex={-1} className="mt-2 block">
          <Picture src={article.coverImage} className="aspect-[4/3]" />
        </Link>
      )}
      <Title article={article} as="h3" className="mt-3 text-[22px] leading-[1.15]" />
      {!article.coverImage && article.lead && <p className="mt-2 line-clamp-5 text-[15px] leading-[21px]">{plain(article.lead)}</p>}
    </article>
  )
}

// A row: a small article in a narrow column, a large one beside it
function Row({ small, large }: { small: Article; large?: Article }) {
  const wide = large ?? small
  const narrow = large ? small : null
  return (
    <div className="grid divide-y divide-line border-b border-line md:grid-cols-[1fr_2fr] md:divide-x md:divide-y-0">
      {narrow && (
        <article className="py-6 md:pr-5">
          <Kicker article={narrow} />
          <Title article={narrow} as="h3" className="mt-1 text-[22px] leading-[1.15]" />
          {narrow.lead && <p className="mt-3 line-clamp-6 text-[15px] leading-[21px]">{plain(narrow.lead)}</p>}
        </article>
      )}
      <article className={`grid gap-5 py-6 ${narrow ? 'md:pl-5' : 'md:col-span-2'} ${wide.coverImage ? 'sm:grid-cols-2' : ''}`}>
        <div>
          <Kicker article={wide} />
          <Title article={wide} className="mt-1 text-[30px] leading-[1.1] sm:text-[40px]" />
          {wide.lead && <p className="mt-4 line-clamp-5 text-[16px] leading-[22px]">{plain(wide.lead)}</p>}
        </div>
        {wide.coverImage && (
          <Link to={articleHref(wide.slug)} tabIndex={-1}>
            <Picture src={wide.coverImage} className="aspect-[4/3]" />
          </Link>
        )}
      </article>
    </div>
  )
}

export function Front({ front, latest }: { front: Article[]; latest: Article[] }) {
  const [top, ...rest] = [...front, ...latest]
  if (!top) return <p className="py-24 text-center text-muted">Ingen artikler ennå. Fagfellene leser fortsatt.</p>
  const columns = rest.slice(0, 4)
  const rows: [Article, Article | undefined][] = []
  for (let i = 4; i < rest.length; i += 2) rows.push([rest[i], rest[i + 1]])
  return (
    <div className={wrap}>
      <Lead article={top} />
      {columns.length > 0 && (
        <div className="grid divide-y divide-line border-b border-line md:grid-cols-4 md:divide-x md:divide-y-0">
          {columns.map(article => (
            <Column key={article.id} article={article} />
          ))}
        </div>
      )}
      {rows.map(([small, large]) => (
        <Row key={small.id} small={small} large={large} />
      ))}
    </div>
  )
}

export function ListItem({ article }: { article: Article }) {
  return (
    <article className="grid gap-4 border-b border-line py-5 sm:grid-cols-[1fr_180px] sm:gap-6">
      <div>
        <Kicker article={article} />
        <Title article={article} as="h3" className="mt-1 text-[24px] leading-[1.1]" />
        {article.authors.length > 0 && <p className="mt-2 text-[15px] italic text-muted">{byline(article)}</p>}
        {article.lead && <p className="mt-2 line-clamp-3 text-[16px] leading-[22px]">{plain(article.lead)}</p>}
        {article.publishedAt && <p className={`${caps} mt-2 text-muted`}>{shortDate(article.publishedAt)}</p>}
      </div>
      {article.coverImage && (
        <Link to={articleHref(article.slug)} tabIndex={-1} className="order-first sm:order-none">
          <Picture src={article.coverImage} className="aspect-[4/3]" />
        </Link>
      )}
    </article>
  )
}

// --- The article

function Abstract({ text }: { text: string }) {
  const labels = [...text.matchAll(LABEL)]
  if (labels.length === 0) return <p>{text}</p>
  const before = text.slice(0, labels[0].index).trim()
  return (
    <div className="space-y-4">
      {before && <p>{before}</p>}
      {labels.map((label, i) => (
        <div key={label.index}>
          <h3 className="pt-1 font-bold">{sentence(label[1])}</h3>
          <p>{text.slice(label.index + label[0].length, labels[i + 1]?.index ?? text.length).trim()}</p>
        </div>
      ))}
    </div>
  )
}

// The text with an anchor on each heading, for the table of contents
function withAnchors(html: string | null) {
  if (!html) return { html: '', headings: [] }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const headings = [...doc.querySelectorAll('h2')].map((heading, i) => {
    heading.id = `del-${i + 1}`
    return { id: heading.id, text: heading.textContent ?? '' }
  })
  return { html: doc.body.innerHTML, headings }
}

function Authors({ article }: { article: Article }) {
  const [open, setOpen] = useState(false)
  if (article.authors.length === 0) return null
  return (
    <div className="italic text-muted">
      {byline(article)}{' '}
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="italic text-accent hover:underline">
        Om forfatterne
      </button>
      {open && (
        <ul className="mt-3 space-y-2 not-italic text-ink">
          {article.authors.map(author => (
            <li key={author.id} className="flex items-center gap-3">
              <Avatar member={author} className="h-9 w-9 text-[12px]" />
              <span>
                {author.name}
                <span className="block text-[14px] text-muted">Brorskapet TEBONSMA</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Cite({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }
  return (
    <section id="siter" className="mt-10 border-t-[3px] border-black pt-2.5">
      <h2 className="font-bold">Sitér artikkelen</h2>
      <p className="mt-2 text-[15px] leading-[21px]">{text}</p>
      <button type="button" onClick={copy} className={`${caps} mt-2 text-accent hover:underline`}>
        {copied ? 'Kopiert' : 'Kopier'}
      </button>
    </section>
  )
}

// Contents, article and facts side by side, as in the journal's own pages
export function ArticleView({ article }: { article: Article }) {
  const citation = citationOf(article)
  const { html, headings } = useMemo(() => withAnchors(article.body), [article.body])
  const cite = `${byline(article) || 'Redaksjonen'}. ${article.title}. ${citation.short}. doi: ${citation.doi}`
  const contents = [
    article.lead && { id: 'sammendrag', text: edition.leadLabel, sub: [] },
    !article.locked && html && { id: 'artikkel', text: 'Artikkel', sub: headings },
    !article.locked && article.tags.length > 0 && { id: 'nokkelord', text: edition.tagsLabel, sub: [] },
    !article.locked && { id: 'siter', text: 'Sitér artikkelen', sub: [] },
  ].filter(item => !!item)
  const published = !article.publishedAt
    ? 'Ikke publisert'
    : article.scheduled
      ? `Publiseres ${ahead(article.publishedAt)}`
      : `Publisert: ${shortDate(article.publishedAt)}`

  return (
    <div className={`${wrap} pt-6`}>
      <header className="lg:ml-[155px] lg:max-w-[595px]">
        <Kicker article={article} />
        <h1 className={`${headline(article)} mt-1.5 text-[32px] leading-none text-black sm:text-[42px]`}>{article.title}</h1>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[135px_minmax(0,595px)_210px] lg:gap-x-5">
        <nav aria-label="Innhold" className="hidden lg:block">
          <ul className="sticky top-20 space-y-4 border-t-[3px] border-black pt-3">
            {contents.map(item => (
              <li key={item.id}>
                <a href={`#${item.id}`} className={`${caps} block leading-[1.35] text-accent hover:underline`}>
                  {item.text}
                </a>
                {item.sub.length > 0 && (
                  <ul className="mt-4 space-y-4 pl-3">
                    {item.sub.map(sub => (
                      <li key={sub.id}>
                        <a href={`#${sub.id}`} className={`${caps} block leading-[1.35] text-accent hover:underline`}>
                          {sub.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 border-t-[3px] border-black pt-3 text-[16px] leading-[22px]">
          <Authors article={article} />
          {article.lead && (
            <section id="sammendrag" className="mt-5">
              <h2 className="sr-only">{edition.leadLabel}</h2>
              <Abstract text={article.lead} />
            </section>
          )}
          {article.coverImage && (
            <figure className="mt-8">
              <Picture src={article.coverImage} />
              {article.coverCaption && <figcaption className="mt-2 text-[14px] italic text-muted">{article.coverCaption}</figcaption>}
            </figure>
          )}
          {article.locked ? (
            <LockedNotice />
          ) : (
            <>
              {html && (
                <section id="artikkel" className="mt-10">
                  <ArticleBody html={html} />
                </section>
              )}
              {article.tags.length > 0 && (
                <section id="nokkelord" className="mt-10">
                  <h2 className="border-t border-line pt-[13px] font-headline text-[22px] font-medium leading-none text-black">{edition.tagsLabel}</h2>
                  <p className="mt-3">
                    {article.tags.map((tag, i) => (
                      <Fragment key={tag}>
                        {i > 0 && ', '}
                        <Link to={`/arkiv?tag=${encodeURIComponent(tag)}`} className="text-accent hover:underline">
                          {tag}
                        </Link>
                      </Fragment>
                    ))}
                  </p>
                </section>
              )}
              <Cite text={cite} />
            </>
          )}
        </div>

        <aside className="self-start border-t-[3px] border-black bg-soft text-[14px] leading-[18px] text-black">
          <div className="space-y-3 px-3 py-3">
            <p>
              {published}
              <br />
              Utgave {citation.issue}, {citation.year}
            </p>
            <p>
              Tidsskr Teb {citation.year} Vol. {citation.volume}.
            </p>
            <p>doi: {citation.doi}</p>
            <p>
              {article.visibility === 'public' ? 'Åpen tilgang' : 'Kun for medlemmer'}
              <br />
              Opphavsrett: {names(article.authors.map(a => a.name)) || 'Redaksjonen'}
            </p>
          </div>
          <ul className="border-t border-line">
            <li>
              <button type="button" onClick={() => window.print()} className={`${caps} block w-full px-3 py-3 text-left text-accent hover:underline`}>
                Skriv ut
              </button>
            </li>
            {!article.locked && (
              <li className="border-t border-line">
                <a href="#siter" className={`${caps} block px-3 py-3 text-accent hover:underline`}>
                  Sitér artikkelen
                </a>
              </li>
            )}
          </ul>
        </aside>
      </div>
    </div>
  )
}
