// The TEBONSMA API. Local development can point at the mock (VITE_API_URL); builds always use
// api.tebonsma.no.
const API_URL = ((import.meta.env.DEV && import.meta.env.VITE_API_URL) || 'https://api.tebonsma.no').replace(/\/$/, '')

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// For files the API serves itself: pictures in articles and members' photos
export const apiUrl = (path: string) => `${API_URL}${path}`

// Without a token the request is made as a visitor
export async function apiFetch<T>(path: string, token: string | null | undefined, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(apiUrl(path), {
      ...init,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(typeof init.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError('Fikk ikke kontakt med serveren', 0)
  }
  const body = (await res.json().catch(() => null)) as { error?: string } | null
  if (!res.ok) throw new ApiError(body?.error ?? `Feil fra serveren (${res.status})`, res.status)
  return body as T
}

export const json = (method: string, body?: unknown): RequestInit => ({
  method,
  ...(body !== undefined && { body: JSON.stringify(body) }),
})

export const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err))
