import { createContext, useContext } from 'react'

// Who is reading: the access token (null for a visitor) and whether they are in the paper's
// editorial group (null while that is being checked)
export interface Me {
  token: string | null
  editor: boolean | null
}

export const MeContext = createContext<Me>({ token: null, editor: false })
export const useMe = () => useContext(MeContext)
