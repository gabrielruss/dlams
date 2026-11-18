import {
  fieldIssuesFromValidationErrors,
  type FieldIssue,
  type ValidationIssue,
} from "./fieldIssues"

const API_URL = import.meta.env.VITE_API_URL

export const rejectedValuesMessage =
  "Some values weren't accepted. Check the form and try again."

export class ApiError extends Error {
  readonly status: number
  readonly fieldIssues: FieldIssue[]

  constructor(message: string, status: number, fieldIssues: FieldIssue[] = []) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fieldIssues = fieldIssues
  }
}

type ErrorResponseBody = { detail?: string | ValidationIssue[] }

function apiErrorFromResponseBody(body: ErrorResponseBody, status: number) {
  if (typeof body.detail === "string") return new ApiError(body.detail, status)
  if (Array.isArray(body.detail)) {
    return new ApiError(
      rejectedValuesMessage,
      status,
      fieldIssuesFromValidationErrors(body.detail),
    )
  }
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
    let error = new ApiError(
      `Request failed (${response.status})`,
      response.status,
    )
    try {
      const body: ErrorResponseBody = await response.json()
      error = apiErrorFromResponseBody(body, response.status) ?? error
    } catch {
      // Keep the HTTP status message if the response is not JSON.
    }
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}
