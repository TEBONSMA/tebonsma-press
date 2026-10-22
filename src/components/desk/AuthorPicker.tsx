import { ArrowUp, X } from 'lucide-react'
import type { Member } from '../../lib/press'
import Avatar from '../Avatar'
import { input } from '../styles'

// The byline: members in order, added from the list of all members
export default function AuthorPicker({ members, value, onChange }: { members: Member[]; value: string[]; onChange: (ids: string[]) => void }) {
  const chosen = value.map(id => members.find(m => m.id === id)).filter((m): m is Member => !!m)
  const others = members.filter(m => !value.includes(m.id))
  const move = (i: number) => onChange(value.map((id, j) => (j === i - 1 ? value[i] : j === i ? value[i - 1] : id)))

  return (
    <div className="space-y-2">
      {chosen.length > 0 && (
        <ul className="space-y-1.5">
          {chosen.map((member, i) => (
            <li key={member.id} className="flex items-center gap-2 rounded-md border border-line px-2 py-1.5 font-ui text-[14px]">
              <Avatar member={member} className="h-7 w-7 text-[11px]" />
              <span className="flex-1">{member.name}</span>
              {i > 0 && (
                <button type="button" onClick={() => move(i)} aria-label={`Flytt ${member.name} opp`} className="rounded p-1 hover:bg-soft">
                  <ArrowUp size={15} aria-hidden="true" />
                </button>
              )}
              <button type="button" onClick={() => onChange(value.filter(id => id !== member.id))} aria-label={`Fjern ${member.name}`} className="rounded p-1 hover:bg-soft">
                <X size={15} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {others.length > 0 && (
        <select
          value=""
          onChange={event => event.target.value && onChange([...value, event.target.value])}
          className={input}
          aria-label="Legg til forfatter"
        >
          <option value="">Legg til forfatter …</option>
          {others.map(member => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
