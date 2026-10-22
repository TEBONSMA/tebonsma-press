import type { ReactNode } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { edition } from '../../edition'
import { useMe } from '../../state/MeContext'
import { Loading } from '../Status'
import { button } from '../styles'

// The editors' side, for the paper's editorial group only. The API checks it too.
export default function DeskGuard({ children }: { children: (token: string) => ReactNode }) {
  const { token, editor } = useMe()
  const { login } = useAuth()
  if (editor === null) return <Loading />
  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-[28px] font-bold">Redaksjonen</h1>
        <p className="mt-2 font-ui text-muted">Logg inn for å skrive i {edition.name}.</p>
        <button type="button" className={`${button.primary} mt-5`} onClick={() => void login()}>
          Logg inn
        </button>
      </div>
    )
  }
  if (!editor) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-[28px] font-bold">Bare for redaksjonen</h1>
        <p className="mt-2 font-ui text-muted">Du er ikke med i redaksjonen til {edition.name}.</p>
      </div>
    )
  }
  return <>{children(token)}</>
}
