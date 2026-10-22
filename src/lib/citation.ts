import type { Article } from './press'

// Volume from the year (the first full year of TEBONSMA as a foundation is volume 1), issue
// from the month, and a DOI-looking number that stays the same for an article
export function citationOf(article: Article) {
  const date = new Date(article.publishedAt ?? article.createdAt)
  const year = date.getFullYear()
  const volume = year - 2024
  const issue = date.getMonth() + 1
  const number = String(parseInt(article.id.replace(/-/g, '').slice(0, 8), 16) % 10000).padStart(4, '0')
  const doi = `10.6767/teb.${year}.${number}`
  return { year, volume, issue, doi, short: `Tidsskr Teb ${year}; ${volume}: ${issue}` }
}
