import type { User } from "@/types"
import { apiRequest } from "./client"

export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<{ user: User }>("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  verify: () => apiRequest<{ user: User }>("/verify"),
}
