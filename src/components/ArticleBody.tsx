import { useEffect } from 'react'
import { apiUrl } from '../lib/api'
import { resizeDatawrapper } from '../lib/embeds'

// The article's text. The API has already cleaned it down to plain formatting; its pictures are
// the paper's own, kept as /press/images/<id>, and are fetched from the API. Graphs and videos from
// other sites are sandboxed frames, and Datawrapper's get their height from the graph.
export default function ArticleBody({ html }: { html: string }) {
  useEffect(resizeDatawrapper, [])
  const withPictures = html.replace(/src="\/press\/images\//g, `src="${apiUrl('/press/images/')}`)
  return <div className="article-body" dangerouslySetInnerHTML={{ __html: withPictures }} />
}
