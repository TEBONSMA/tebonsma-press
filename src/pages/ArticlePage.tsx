import { Link, useParams } from 'react-router-dom'
import ArticleBody from '../components/ArticleBody'
import LockedNotice from '../components/LockedNotice'
import { Loading, Problem } from '../components/Status'
import { button } from '../components/styles'
import { paper } from '../editions/paper'
import { ahead } from '../lib/format'
import { getArticle } from '../lib/press'
import { useMe } from '../state/MeContext'
import { useLoad } from '../state/useLoad'
import { useTitle } from '../state/useTitle'
import NotFound from './NotFound'

export default function ArticlePage() {
  const { slug = '' } = useParams()
  const { token, editor } = useMe()
  const { data: article, error, loading } = useLoad(() => getArticle(token, slug), `article:${slug}:${token}`)
  useTitle(article?.title ?? null)

  if (loading) return <Loading />
  if (error === 'Saken finnes ikke') return <NotFound />
  if (error || !article) return <Problem message={error ?? 'Noe gikk galt'} />

  return (
    <article className="pb-6">
      {editor && (
        <div className={`border-b border-line ${article.status === 'draft' || article.scheduled ? 'bg-[#fff6d6]' : 'bg-soft'}`}>
          <div className="mx-auto flex max-w-[760px] items-center justify-between gap-3 px-4 py-2 font-ui text-[13px]">
            <span>
              {article.status === 'draft'
                ? 'Utkast: bare redaksjonen ser denne saken.'
                : article.scheduled
                  ? `Planlagt: publiseres ${ahead(article.publishedAt!)}. Til da ser bare redaksjonen saken.`
                  : 'Du er i redaksjonen.'}
            </span>
            <Link to={`/redaksjon/sak/${article.id}`} className={`${button.secondary} h-8 px-3 text-[13px]`}>
              Rediger
            </Link>
          </div>
        </div>
      )}
      <paper.ArticleHeader article={article} />
      <div className="mx-auto mt-8 max-w-[720px] px-4">{article.locked ? <LockedNotice /> : article.body && <ArticleBody html={article.body} />}</div>
      {!article.locked && <paper.ArticleFooter article={article} />}
    </article>
  )
}
