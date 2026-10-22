import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { button } from '../components/styles'
import { useTitle } from '../state/useTitle'

// Also what a visitor gets for a members-only article, so it says nothing about whether there is one
export default function NotFound() {
  useTitle('Finnes ikke')
  const { user, isLoading, login } = useAuth()
  const visitor = !isLoading && !user
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-[34px] font-bold">Saken finnes ikke</h1>
      <p className="mt-3 text-[18px] text-muted">
        {visitor
          ? 'Kanskje den aldri ble skrevet, eller så er den bare for medlemmer. Logg inn for å se om du har tilgang.'
          : 'Kanskje den aldri ble skrevet, eller så er den trukket tilbake.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {visitor && (
          <button type="button" onClick={() => void login()} className={button.primary}>
            Logg inn
          </button>
        )}
        <Link to="/" className={visitor ? button.secondary : button.primary}>
          Til forsiden
        </Link>
      </div>
    </div>
  )
}
