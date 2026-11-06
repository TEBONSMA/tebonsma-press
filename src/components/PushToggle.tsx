import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { edition } from '../edition'
import { errorMessage } from '../lib/api'
import { pushState, turnOffPush, turnOnPush, type PushState } from '../lib/push'

const TEXT: Record<Exclude<PushState, 'unsupported'>, string> = {
  off: `Få beskjed på denne enheten når det kommer ${edition.newArticles}.`,
  on: `Du får beskjed på denne enheten når det kommer ${edition.newArticles}.`,
  denied: `Varsler er blokkert for ${edition.shortName}. Slå dem på i nettleserens innstillinger for siden.`,
  install: `På iPhone og iPad får bare ${edition.shortName} på Hjem-skjermen varsler: trykk Del, velg «Legg til på Hjem-skjerm», og åpne ${edition.shortName} derfra.`,
}

// Push notifications on this device about new articles, for members who are logged in
export default function PushToggle({ className = '' }: { className?: string }) {
  const { user } = useAuth()
  const [state, setState] = useState<PushState | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    void pushState().then(next => {
      if (active) setState(next)
    })
    return () => {
      active = false
    }
  }, [user])

  if (!user || !state || state === 'unsupported') return null

  const toggle = () => {
    setBusy(true)
    setError(null)
    // Straight from the tap, or an iPhone won't ask for permission
    ;(state === 'on' ? turnOffPush(user.access_token) : turnOnPush(user.access_token))
      .catch(err => setError(errorMessage(err)))
      .then(pushState)
      .then(setState)
      .finally(() => setBusy(false))
  }

  return (
    <div className={`font-ui ${className}`}>
      <p className="text-muted">{TEXT[state]}</p>
      {error && <p className="mt-1 text-[#b3261e]">{error}</p>}
      {(state === 'off' || state === 'on') && (
        <button type="button" className="mt-1 font-semibold underline-offset-4 hover:underline disabled:opacity-50" disabled={busy} onClick={toggle}>
          {state === 'on' ? 'Slå av varsler' : 'Slå på varsler'}
        </button>
      )}
    </div>
  )
}
