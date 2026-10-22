import { apiUrl } from '../lib/api'

// The article's text. The API has already cleaned it down to plain formatting; its pictures are
// the paper's own, kept as /press/images/<id>, and are fetched from the API.
export default function ArticleBody({ html }: { html: string }) {
  const withPictures = html.replace(/src="\/press\/images\//g, `src="${apiUrl('/press/images/')}`)
  return <div className="article-body" dangerouslySetInnerHTML={{ __html: withPictures }} />
}
