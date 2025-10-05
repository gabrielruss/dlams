import type { User } from "@/types"

const API_URL = import.meta.env.VITE_API_URL

async function baseApiCall<T>(
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
    const error = await response.json().catch(() => ({
      detail: "Whoopsy poopsy the request make a oopsy",
    }))
    throw new Error(error.detail || `Error status: ${response.status}`)
  }

  return response.json()
}

export const authApi = {
  login: (username: string, password: string) =>
    baseApiCall<{ user: User }>("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  verify: () => baseApiCall<{ user: User }>("/verify"),
}
