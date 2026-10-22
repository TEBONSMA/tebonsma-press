import { Link } from 'react-router-dom'
import { button } from '../components/styles'
import { useTitle } from '../state/useTitle'

export default function NotFound() {
  useTitle('Finnes ikke')
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-[34px] font-bold">Saken finnes ikke</h1>
      <p className="mt-3 text-[18px] text-muted">Kanskje den aldri ble skrevet, eller så er den trukket tilbake.</p>
      <Link to="/" className={`${button.primary} mt-6`}>
        Til forsiden
      </Link>
    </div>
  )
}
