import { useState } from 'react'
import { useLocation } from 'react-router-dom'

// The menu on a phone: open until it is closed again or a link in it is followed
export function useMobileMenu() {
  const { pathname } = useLocation()
  // The page it was opened on; on another page it is closed
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  return { open, toggle: () => setOpenOn(open ? null : pathname), close: () => setOpenOn(null) }
}
