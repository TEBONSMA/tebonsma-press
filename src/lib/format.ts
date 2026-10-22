// Dates the Norwegian way

const long = new Intl.DateTimeFormat('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const day = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
const time = new Intl.DateTimeFormat('nb-NO', { hour: '2-digit', minute: '2-digit' })

const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

// The weekday and the whole date, with a capital first letter
export const longDate = (iso: string | Date = new Date()) => capital(long.format(new Date(iso)))

// The day, the month and the year
export const shortDate = (iso: string) => day.format(new Date(iso))

// Today or yesterday with the time, otherwise the date
export function when(iso: string) {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return `I dag kl. ${time.format(date)}`
  if (date.toDateString() === yesterday.toDateString()) return `I går kl. ${time.format(date)}`
  return shortDate(iso)
}

const weekday = new Intl.DateTimeFormat('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })

// A time ahead: today or tomorrow with the time, otherwise the weekday and date with the time
export function ahead(iso: string) {
  const date = new Date(iso)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const day =
    date.toDateString() === new Date().toDateString() ? 'i dag' : date.toDateString() === tomorrow.toDateString() ? 'i morgen' : weekday.format(date)
  return `${day} kl. ${time.format(date)}`
}

// For <input type="datetime-local">: 2026-10-23T07:00 in local time
export function localInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Names with commas between them, and the Norwegian word for and before the last
export const names = (list: string[]) => (list.length < 2 ? list.join('') : `${list.slice(0, -1).join(', ')} og ${list.at(-1)}`)
