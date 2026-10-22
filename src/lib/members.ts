// A member's page, on TebBet
export const memberHref = (id: string) => `${import.meta.env.DEV ? 'http://localhost:5174' : 'https://bet.tebonsma.no'}/medlem/${encodeURIComponent(id)}`
