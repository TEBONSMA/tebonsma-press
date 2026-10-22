import { ArrowUp, X } from 'lucide-react'
import type { ArticleInput, Member } from '../../lib/press'
import Avatar from '../Avatar'
import { input } from '../styles'

type Choice = ArticleInput['authors'][number]

// The byline: members in order, added from the list of all members, each with the name they go by
// in this article if not their own
export default function AuthorPicker({ members, value, onChange }: { members: Member[]; value: Choice[]; onChange: (authors: Choice[]) => void }) {
  const chosen = value.flatMap(choice => {
    const member = members.find(m => m.id === choice.id)
    return member ? [{ member, alias: choice.alias }] : []
  })
  const others = members.filter(m => !value.some(choice => choice.id === m.id))
  const move = (i: number) => onChange(value.map((choice, j) => (j === i - 1 ? value[i] : j === i ? value[i - 1] : choice)))
  const rename = (id: string, alias: string) => onChange(value.map(choice => (choice.id === id ? { ...choice, alias } : choice)))

  return (
    <div className="space-y-2">
      {chosen.length > 0 && (
        <ul className="space-y-1.5">
          {chosen.map(({ member, alias }, i) => (
            <li key={member.id} className="rounded-md border border-line px-2 py-1.5 font-ui text-[14px]">
              <div className="flex items-center gap-2">
                <Avatar member={member} className="h-7 w-7 text-[11px]" />
                <span className="flex-1">{member.name}</span>
                {i > 0 && (
                  <button type="button" onClick={() => move(i)} aria-label={`Flytt ${member.name} opp`} className="rounded p-1 hover:bg-soft">
                    <ArrowUp size={15} aria-hidden="true" />
                  </button>
                )}
                <button type="button" onClick={() => onChange(value.filter(choice => choice.id !== member.id))} aria-label={`Fjern ${member.name}`} className="rounded p-1 hover:bg-soft">
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
              <input
                value={alias}
                onChange={event => rename(member.id, event.target.value)}
                placeholder="Navn i denne saken (valgfritt)"
                aria-label={`Navn på ${member.name} i denne saken`}
                maxLength={80}
                className={`${input} mt-1.5 py-1.5 text-[13px]`}
              />
            </li>
          ))}
        </ul>
      )}
      {others.length > 0 && (
        <select
          value=""
          onChange={event => event.target.value && onChange([...value, { id: event.target.value, alias: '' }])}
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
