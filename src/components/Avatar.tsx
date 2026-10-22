import { apiUrl } from '../lib/api'
import type { Member } from '../lib/press'

// A member's photo, or their initials
export default function Avatar({ member, className = 'h-8 w-8 text-[12px]' }: { member: Member; className?: string }) {
  if (member.avatar) return <img src={apiUrl(member.avatar)} alt="" className={`${className} shrink-0 rounded-full object-cover`} />
  const initials = member.name
    .split(/\s+/)
    .map(part => part[0])
    .slice(0, 2)
    .join('')
  return (
    <span aria-hidden="true" className={`${className} flex shrink-0 items-center justify-center rounded-full bg-soft font-ui font-semibold text-muted`}>
      {initials}
    </span>
  )
}
