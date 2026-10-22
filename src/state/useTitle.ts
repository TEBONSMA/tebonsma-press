import { useEffect } from 'react'
import { edition } from '../edition'

// The browser tab: the page, then the paper
export function useTitle(title: string | null) {
  useEffect(() => {
    document.title = title ? `${title} – ${edition.name}` : edition.name
  }, [title])
}
