export function Loading() {
  return <p className="py-16 text-center font-ui text-muted">Laster …</p>
}

export function Problem({ message }: { message: string }) {
  return <p className="py-16 text-center font-ui text-[#b3261e]">{message}</p>
}
