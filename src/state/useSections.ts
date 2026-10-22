import { useEffect, useState } from 'react'
import { getMenu } from '../lib/press'

// The sections in the menu, as the editors set them: none until they do
export function useSections() {
  const [sections, setSections] = useState<string[]>([])
  useEffect(() => {
    let active = true
    getMenu()
      .then(menu => {
        if (active) setSections(menu.sections)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])
  return sections
}
