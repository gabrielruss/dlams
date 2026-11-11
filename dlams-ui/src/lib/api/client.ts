const API_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

type ValidationIssue = { msg: string }

type ErrorResponseBody = { detail?: string | ValidationIssue[] }

function messageFromErrorDetail(detail: ErrorResponseBody["detail"]) {
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) return detail.map((issue) => issue.msg).join(" ")
  return undefined
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
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
      const error: ErrorResponseBody = await response.json()
      message = messageFromErrorDetail(error.detail) || message
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
