const API_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
  readonly status: number

  constructor(
    message: string,
    status: number
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const error: { detail?: string } = await response.json()
      message = error.detail || message
    } catch {
      // Keep the HTTP status message if the response is not JSON.
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}
