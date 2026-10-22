import { apiFetch, json } from './api'
import { edition } from '../edition'

// The paper's articles, from /press/<times|tidsskrift> in the API

export interface Member {
  id: string
  name: string
  // /members/<id>/avatar?v=…, or null without a picture
  avatar: string | null
}

// An author of an article: the member, and the name they go by in it (null for their own)
export interface Author extends Member {
  alias: string | null
}

// The name an author goes by in the article
export const authorName = (author: Author) => author.alias ?? author.name

export interface Article {
  id: string
  slug: string
  status: 'draft' | 'published'
  visibility: 'public' | 'members'
  section: string
  title: string
  lead: string
  // null in lists
  body: string | null
  tags: string[]
  authors: Author[]
  coverImage: string | null
  coverCaption: string
  frontPosition: number | null
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  // Published, but not out until publishedAt; only the editors see it until then
  scheduled: boolean
}

export interface ArticleInput {
  title: string
  section: string
  lead: string
  body: string
  tags: string[]
  // In byline order: the member's id, and the name they go by in this article ('' for their own)
  authors: { id: string; alias: string }[]
  visibility: 'public' | 'members'
  coverImage: string | null
  coverCaption: string
}

const base = `/press/${edition.id}`

export const getFront = (token: string | null) => apiFetch<{ front: Article[]; latest: Article[] }>(`${base}/front`, token)
// Members-only articles count only for those logged in
export const getSections = (token: string | null) => apiFetch<{ section: string; count: number }[]>(`${base}/sections`, token)
// The sections in the menu: the editors' list (custom), or the ones in use until they make one
export const getMenu = () => apiFetch<{ sections: string[]; custom: boolean }>(`${base}/menu`, null)
export const getArticle = (token: string | null, slug: string) => apiFetch<Article>(`${base}/articles/${encodeURIComponent(slug)}`, token)
export const getMe = (token: string | null) => apiFetch<{ loggedIn: boolean; editor: boolean }>(`${base}/me`, token)

export function listArticles(token: string | null, query: { section?: string; tag?: string; q?: string; before?: string }) {
  const params = new URLSearchParams(Object.entries(query).filter((entry): entry is [string, string] => !!entry[1]))
  return apiFetch<{ articles: Article[]; next: string | null }>(`${base}/articles?${params}`, token)
}

// --- The editors' side

export const listDesk = (token: string) => apiFetch<Article[]>(`${base}/desk`, token)
export const getForEditing = (token: string, id: string) => apiFetch<Article>(`${base}/desk/${id}`, token)
export const listMembers = (token: string) => apiFetch<Member[]>(`${base}/desk/members`, token)
export const createArticle = (token: string, input: ArticleInput) => apiFetch<Article>(`${base}/desk`, token, json('POST', input))
export const updateArticle = (token: string, id: string, input: ArticleInput) => apiFetch<Article>(`${base}/desk/${id}`, token, json('PUT', input))
// Now, or at a later time (an ISO time)
export const publishArticle = (token: string, id: string, at?: string) => apiFetch<Article>(`${base}/desk/${id}/publish`, token, json('POST', at ? { at } : undefined))
export const unpublishArticle = (token: string, id: string) => apiFetch<Article>(`${base}/desk/${id}/unpublish`, token, json('POST'))
export const deleteArticle = (token: string, id: string) => apiFetch<{ ok: true }>(`${base}/desk/${id}`, token, json('DELETE'))
export const setFront = (token: string, ids: string[]) => apiFetch<{ front: Article[]; latest: Article[] }>(`${base}/front`, token, json('PUT', { ids }))
export const setMenu = (token: string, sections: string[]) => apiFetch<{ sections: string[]; custom: boolean }>(`${base}/menu`, token, json('PUT', { sections }))
export const renameSection = (token: string, from: string, to: string) =>
  apiFetch<{ sections: string[]; custom: boolean }>(`${base}/sections/rename`, token, json('POST', { from, to }))
// A JPEG in base64; comes back as /press/images/<id>
export const uploadImage = (token: string, image: string) => apiFetch<{ id: string; url: string }>(`${base}/images`, token, json('POST', { image }))
