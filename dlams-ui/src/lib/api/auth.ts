import type { User } from "@/types"
import { queryOptions } from "@tanstack/react-query"
import { ApiError, apiRequest } from "./client"

export const authKeys = {
  currentUser: ["auth", "current-user"] as const,
}

async function getCurrentUser(): Promise<User | null> {
  try {
    const { user } = await authApi.verify()
    return user
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<{ user: User }>("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  verify: () => apiRequest<{ user: User }>("/verify"),

  logout: () =>
    apiRequest<void>("/logout", {
      method: "POST",
    }),
}

export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.currentUser,
    queryFn: getCurrentUser,
  })
