import { useEffect, useState, type ReactNode } from 'react'
import type { User } from 'oidc-client-ts'
import { AuthContext } from './AuthContext'
import { AUTHORITY, userManager } from './userManager'

const login = () => {
  const { pathname, search, hash } = window.location
  return userManager.signinRedirect({ state: { returnTo: pathname + search + hash } })
}

// Renews the login in a hidden frame while Authelia still knows the member, so an access token
// that ran out while the site was closed doesn't mean logging in again. Without a session there
// (or after logging out) the member is logged out here too. One renewal runs at a time.
let renewing: Promise<User | null> | null = null
const renew = () =>
  (renewing ??= userManager
    // Logins from before offline_access was dropped still hold a refresh token that has run out
    .signinSilent({ forceIframeAuth: true })
    .catch(async () => {
      await userManager.removeUser()
      return null
    })
    .finally(() => {
      renewing = null
    }))

// The papers are open to visitors too. Once per visit, a member who is already logged in
// elsewhere in TEBONSMA (tebonsma.no, TebBet) is logged in here without a click.
const SSO_TRIED = 'press:sso-tried'
async function quietLogin() {
  try {
    if (sessionStorage.getItem(SSO_TRIED)) return null
    sessionStorage.setItem(SSO_TRIED, '1')
  } catch {
    return null
  }
  return userManager.signinSilent({ forceIframeAuth: true }).catch(() => null)
}

const logout = async () => {
  try {
    sessionStorage.setItem(SSO_TRIED, '1')
  } catch {
    // Without storage the quiet login is tried again, which only finds the session gone
  }
  try {
    await userManager.revokeTokens()
  } catch {
    // Tokens may already be expired or revoked; clearing locally is what matters
  }
  await userManager.removeUser()
  // Authelia has no end_session_endpoint, so end the SSO session through its portal
  window.location.assign(`${AUTHORITY}/logout?rd=${encodeURIComponent(`${window.location.origin}/`)}`)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    userManager.getUser().then(async stored => {
      const current = stored ? (stored.expired ? await renew() : stored) : await quietLogin()
      if (!active) return
      setUser(current)
      setIsLoading(false)
    })

    const onLoaded = (loaded: User) => setUser(loaded)
    const onGone = () => setUser(null)
    // The renewal shortly before this normally keeps the token fresh; this catches a computer
    // that was asleep when it was due
    const onExpired = () => void renew()
    userManager.events.addUserLoaded(onLoaded)
    userManager.events.addUserUnloaded(onGone)
    userManager.events.addAccessTokenExpired(onExpired)

    return () => {
      active = false
      userManager.events.removeUserLoaded(onLoaded)
      userManager.events.removeUserUnloaded(onGone)
      userManager.events.removeAccessTokenExpired(onExpired)
    }
  }, [])

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}
