// The two papers share everything but their name, wording and look. The build says which one
// this is (VITE_PUBLICATION, see .env.times and .env.tidsskrift).

export type EditionId = 'times' | 'tidsskrift'

export interface Edition {
  id: EditionId
  name: string
  tagline: string
  // In addresses: /sak/<slug>, /seksjon/<navn>
  articlePath: string
  sectionPath: string
  // The section of an article, as the paper calls it
  sectionLabel: string
  sectionsLabel: string
  leadLabel: string
  tagsLabel: string
  // Suggested when writing; any other may be used
  sections: string[]
}

const EDITIONS: Record<EditionId, Edition> = {
  times: {
    id: 'times',
    name: 'The Tebonsma Times',
    tagline: 'Gjengens avis. Usaklig siden 2021.',
    articlePath: 'sak',
    sectionPath: 'seksjon',
    sectionLabel: 'Seksjon',
    sectionsLabel: 'Seksjoner',
    leadLabel: 'Ingress',
    tagsLabel: 'Stikkord',
    sections: ['Innenriks', 'Pulebord', 'Kultur', 'Reise', 'Meninger', 'Rett og vrang', 'Distrikt', 'Sport'],
  },
  tidsskrift: {
    id: 'tidsskrift',
    name: 'Tebonsma Tidsskrift',
    tagline: 'Tidsskrift for Brorskapet TEBONSMA. Fagfellevurdert, av og til.',
    articlePath: 'artikkel',
    sectionPath: 'type',
    sectionLabel: 'Artikkeltype',
    sectionsLabel: 'Artikkeltyper',
    leadLabel: 'Sammendrag',
    tagsLabel: 'Nøkkelord',
    sections: ['Originalartikkel', 'Kasuistikk', 'Oversiktsartikkel', 'Leder', 'Kronikk', 'Brev til redaktøren'],
  },
}

export const edition: Edition = EDITIONS[import.meta.env.VITE_PUBLICATION === 'tidsskrift' ? 'tidsskrift' : 'times']

export const articleHref = (slug: string) => `/${edition.articlePath}/${slug}`
export const sectionHref = (section: string) => `/${edition.sectionPath}/${encodeURIComponent(section)}`
