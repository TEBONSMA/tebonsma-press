import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

// The same TEBONSMA accounts as tebonsma.no and TebBet. In local development this can point at
// the mock login in the tebonsma-api repo (npm run dev:mock); builds always use the real login
// server, so a stray setting can't send members anywhere else.
export const AUTHORITY = ((import.meta.env.DEV && import.meta.env.VITE_AUTH_AUTHORITY) || 'https://auth.tebonsma.no').replace(/\/$/, '')

export const userManager = new UserManager({
  authority: AUTHORITY,
  // tebonsma.no's client; times. and tidsskrift.tebonsma.no/auth/callback are among its redirect URIs
  client_id: 'tebonsma-web',
  redirect_uri: `${window.location.origin}/auth/callback`,
  // A silent login comes back to the same page, inside a hidden frame (see main.tsx)
  silent_redirect_uri: `${window.location.origin}/auth/callback`,
  response_type: 'code',
  scope: 'openid profile email groups',
  // Authelia leaves name, email and groups out of the ID token; they come from userinfo
  loadUserInfo: true,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
})
