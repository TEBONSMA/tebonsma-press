import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getMe } from '../lib/press'
import { MeContext } from './MeContext'

export function MeProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const token = user?.access_token ?? null
  // The answer for one token; a new login asks again
  const [checked, setChecked] = useState<{ token: string; editor: boolean } | null>(null)

  useEffect(() => {
    if (!token) return
    let active = true
    getMe(token)
      .then(me => {
        if (active) setChecked({ token, editor: me.editor })
      })
      .catch(() => {
        if (active) setChecked({ token, editor: false })
      })
    return () => {
      active = false
    }
  }, [token])

  const editor = isLoading ? null : !token ? false : checked?.token === token ? checked.editor : null
  return <MeContext.Provider value={{ token, editor }}>{children}</MeContext.Provider>
}
