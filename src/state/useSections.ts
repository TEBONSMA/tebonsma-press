import { useEffect, useState } from 'react'
import { edition } from '../edition'
import { getMenu } from '../lib/press'

// The sections in the menu, as the editors set them (or the ones in use until they do). The
// paper's own list shows until the answer comes, or if there are no articles yet.
export function useSections() {
  const [sections, setSections] = useState<string[]>(edition.sections.slice(0, 6))
  useEffect(() => {
    let active = true
    getMenu()
      .then(menu => {
        if (active && (menu.custom || menu.sections.length > 0)) setSections(menu.sections)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])
  return sections
}
