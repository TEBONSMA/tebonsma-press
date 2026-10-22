import { useEffect, useState } from 'react'
import { errorMessage } from '../lib/api'

// Loads something when its key changes (for instance the address and the login), and keeps
// track of the error
export function useLoad<T>(load: () => Promise<T>, key: string) {
  const [state, setState] = useState<{ key: string; data?: T; error?: string } | null>(null)
  useEffect(() => {
    let active = true
    load()
      .then(data => {
        if (active) setState({ key, data })
      })
      .catch(err => {
        if (active) setState({ key, error: errorMessage(err) })
      })
    return () => {
      active = false
    }
    // The key says when to load again
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  const current = state?.key === key ? state : null
  return { data: current?.data, error: current?.error, loading: !current }
}
