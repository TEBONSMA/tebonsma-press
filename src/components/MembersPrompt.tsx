import { useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { edition } from '../edition'

// For visitors: the members-only articles are left out until they log in
export default function MembersPrompt() {
  const { user, isLoading, login } = useAuth()
  const { pathname } = useLocation()
  // The editors' pages ask for a login themselves
  if (isLoading || user || pathname.startsWith('/redaksjon')) return null
  return (
    <div className={`mx-auto w-full px-4 pt-4 ${edition.id === 'tidsskrift' ? 'max-w-[1012px]' : 'max-w-6xl'}`}>
      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded border border-line bg-soft px-4 py-2.5 text-center font-ui text-[14px]">
        <span className="text-muted">Noen saker er bare for medlemmer.</span>
        <button type="button" onClick={() => void login()} className="font-semibold underline underline-offset-4 hover:no-underline">
          Logg inn for å vise medlemssaker
        </button>
      </p>
    </div>
  )
}
