import { apiUrl } from '../lib/api'

// A picture from the paper's own store (/press/images/…)
export default function Picture({ src, alt = '', className = '' }: { src: string; alt?: string; className?: string }) {
  return <img src={apiUrl(src)} alt={alt} loading="lazy" className={`block w-full object-cover ${className}`} />
}
