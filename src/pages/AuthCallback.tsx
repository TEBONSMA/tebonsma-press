import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { User } from 'oidc-client-ts'
import { userManager } from '../auth/userManager'

// A login code can only be exchanged once, and StrictMode runs effects twice in dev
let pending: Promise<User> | null = null

const safeReturnTo = (state: unknown) => {
  const returnTo = (state as { returnTo?: unknown } | undefined)?.returnTo
  return typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/'
}

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    pending ??= userManager.signinRedirectCallback()
    pending
      .then(user => navigate(safeReturnTo(user.state), { replace: true }))
      .catch(err => {
        console.error('Login callback failed:', err)
        setError(err instanceof Error ? err.message : String(err))
      })
  }, [navigate])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      {error ? (
        <>
          <p className="text-lg">Innloggingen feilet.</p>
          <p className="max-w-sm break-words text-[13px] text-muted">{error}</p>
          <Link to="/" className="rounded-md bg-ink px-5 py-3 font-semibold text-paper">
            Prøv igjen
          </Link>
        </>
      ) : (
        <p className="text-muted">Logger inn…</p>
      )}
    </main>
  )
}
