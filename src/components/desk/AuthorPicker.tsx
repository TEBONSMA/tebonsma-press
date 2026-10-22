import { ArrowUp, X } from 'lucide-react'
import type { ArticleInput, Member } from '../../lib/press'
import Avatar from '../Avatar'
import { button, input } from '../styles'

type Choice = ArticleInput['authors'][number]

// The byline in order: members from the list of all members, each with the name they go by in this
// article if not their own, and authors without an account, by name
export default function AuthorPicker({ members, value, onChange }: { members: Member[]; value: Choice[]; onChange: (authors: Choice[]) => void }) {
  const others = members.filter(m => !value.some(choice => choice.id === m.id))
  const move = (i: number) => onChange(value.map((choice, j) => (j === i - 1 ? value[i] : j === i ? value[i - 1] : choice)))
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i))
  const update = (i: number, patch: Partial<Choice>) => onChange(value.map((choice, j) => (j === i ? { ...choice, ...patch } : choice)))

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((choice, i) => {
            const member = choice.id ? members.find(m => m.id === choice.id) : null
            if (choice.id && !member) return null
            const name = member?.name ?? (choice.name || 'Forfatter uten konto')
            return (
              <li key={choice.id ?? `guest-${i}`} className="rounded-md border border-line px-2 py-1.5 font-ui text-[14px]">
                <div className="flex items-center gap-2">
                  <Avatar member={{ name, avatar: member?.avatar ?? null }} className="h-7 w-7 text-[11px]" />
                  <span className="flex-1">{member ? member.name : <span className="text-muted">Uten konto</span>}</span>
                  {i > 0 && (
                    <button type="button" onClick={() => move(i)} aria-label={`Flytt ${name} opp`} className="rounded p-1 hover:bg-soft">
                      <ArrowUp size={15} aria-hidden="true" />
                    </button>
                  )}
                  <button type="button" onClick={() => remove(i)} aria-label={`Fjern ${name}`} className="rounded p-1 hover:bg-soft">
                    <X size={15} aria-hidden="true" />
                  </button>
                </div>
                {member ? (
                  <input
                    value={choice.alias}
                    onChange={event => update(i, { alias: event.target.value })}
                    placeholder="Navn i denne saken (valgfritt)"
                    aria-label={`Navn på ${member.name} i denne saken`}
                    maxLength={80}
                    className={`${input} mt-1.5 py-1.5 text-[13px]`}
                  />
                ) : (
                  <input
                    value={choice.name}
                    onChange={event => update(i, { name: event.target.value })}
                    placeholder="Navnet på forfatteren"
                    aria-label="Navnet på forfatteren uten konto"
                    maxLength={80}
                    className={`${input} mt-1.5 py-1.5 text-[13px]`}
                  />
                )}
              </li>
            )
          })}
        </ul>
      )}
      {others.length > 0 && (
        <select
          value=""
          onChange={event => event.target.value && onChange([...value, { id: event.target.value, alias: '', name: '' }])}
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
      <button type="button" onClick={() => onChange([...value, { id: null, alias: '', name: '' }])} className={`${button.secondary} h-8 px-3 text-[13px]`}>
        Legg til forfatter uten konto
      </button>
    </div>
  )
}
