import { useParams } from 'react-router-dom'
import ArticleList from '../components/ArticleList'
import { kicker } from '../components/styles'
import { edition } from '../edition'
import { useTitle } from '../state/useTitle'

export default function SectionPage() {
  const { section = '' } = useParams()
  useTitle(section)
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className={`${kicker} text-muted`}>{edition.sectionLabel}</p>
      <h1 className="mt-1 text-[36px] font-bold leading-tight">{section}</h1>
      <div className="mt-6 border-t border-ink">
        <ArticleList query={{ section }} empty={`Ingen saker under ${section} ennå.`} />
      </div>
    </div>
  )
}
