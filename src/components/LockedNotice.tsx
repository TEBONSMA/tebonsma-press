import { useAuth } from '../auth/AuthContext'
import { button } from './styles'

// A members-only article for a visitor
export default function LockedNotice() {
  const { login } = useAuth()
  return (
    <div className="my-8 rounded-lg border border-line bg-soft px-6 py-8 text-center">
      <p className="font-ui text-[13px] font-bold uppercase tracking-[0.08em] text-muted">Kun for medlemmer</p>
      <p className="mx-auto mt-2 max-w-md text-[18px] leading-snug">Resten av saken er bare for medlemmene av TEBONSMA.</p>
      <button type="button" onClick={() => void login()} className={`${button.primary} mt-5`}>
        Logg inn for å lese
      </button>
    </div>
  )
}
