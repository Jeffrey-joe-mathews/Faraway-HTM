export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface AuthResponse {
  user: AuthUser
  access_token: string
}

export function getBackendBaseUrl(): string {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim()
  if (backendUrl) return backendUrl
  return 'http://localhost:5000'
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: Record<string, unknown>
    token?: string | null
  } = {},
): Promise<T> {
  const baseUrl = getBackendBaseUrl()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.message || 'Authentication request failed')
  }

  return payload as T
}

export async function authRequest<T>(path: string, body: Record<string, unknown>): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', body })
}
