import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { edition } from '../edition'
import type { Article } from '../lib/press'
import { useMe } from '../state/MeContext'

// Log in or out, and the way to the editors' desk for the editors
export function UserLinks({ className = '' }: { className?: string }) {
  const { user, isLoading, login, logout } = useAuth()
  const { editor } = useMe()
  if (isLoading) return <div className={className} />
  const name = (user?.profile.name as string | undefined) ?? (user?.profile.preferred_username as string | undefined)
  return (
    <div className={`flex items-center gap-4 font-ui text-[13px] ${className}`}>
      {editor && (
        <Link to="/redaksjon" className="font-semibold underline-offset-4 hover:underline">
          Redaksjon
        </Link>
      )}
      {user ? (
        <>
          <span className="hidden text-muted sm:inline">{name}</span>
          <button type="button" onClick={() => void logout()} className="font-semibold underline-offset-4 hover:underline">
            Logg ut
          </button>
        </>
      ) : (
        <button type="button" onClick={() => void login()} className="font-semibold underline-offset-4 hover:underline">
          Logg inn
        </button>
      )}
    </div>
  )
}

// The menu button on a phone (not on wider screens): three lines, a cross while the menu is open
export function MenuButton({ open, onClick, className = '' }: { open: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls="mobilmeny"
      aria-label={open ? 'Lukk menyen' : 'Meny'}
      className={`-ml-2 p-2 text-black md:hidden ${className}`}
    >
      {open ? <X size={26} strokeWidth={1.75} aria-hidden="true" /> : <Menu size={26} strokeWidth={1.75} aria-hidden="true" />}
    </button>
  )
}

// The rest of TEBONSMA
export function FamilyLinks({ className = '' }: { className?: string }) {
  const sites = [
    { name: 'tebonsma.no', href: 'https://tebonsma.no' },
    { name: 'TebBet', href: 'https://bet.tebonsma.no' },
    { name: 'The Tebonsma Times', href: 'https://times.tebonsma.no' },
    { name: 'Tebonsma Tidsskrift', href: 'https://tidsskrift.tebonsma.no' },
  ].filter(site => site.name !== edition.name)
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-1 font-ui text-[13px] ${className}`}>
      {sites.map(site => (
        <li key={site.href}>
          <a href={site.href} className="hover:underline">
            {site.name}
          </a>
        </li>
      ))}
    </ul>
  )
}

// The article's tags (the journal's keywords), each leading to the archive of the tag
export function Tags({ article }: { article: Article }) {
  return (
    <div className="flex flex-wrap items-center gap-2 font-ui text-[13px]">
      <span className="font-semibold text-muted">{edition.tagsLabel}:</span>
      {article.tags.map(tag => (
        <Link key={tag} to={`/arkiv?tag=${encodeURIComponent(tag)}`} className="rounded-full border border-line px-3 py-1 hover:border-ink">
          {tag}
        </Link>
      ))}
    </div>
  )
}
