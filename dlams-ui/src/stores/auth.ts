import { create } from "zustand"

import { authApi } from "@/lib/api"
import type { User } from "@/types"
import { AUTH_USER } from "@/lib/localStorage"

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  checkAuth: () => void
}

const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  login: async (username: string, password: string) => {
    set({ isLoading: true })

    try {
      const data = await authApi.login(username, password)

      localStorage.setItem(AUTH_USER, JSON.stringify(data.user))

      set({ user: data.user, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  checkAuth: async () => {
    const storedUser = localStorage.getItem(AUTH_USER)

    console.log({ storedUser })

    if (storedUser) {
      try {
        const data = await authApi.verify()
        console.log({ data })
        set({ user: data.user })
      } catch {
        localStorage.removeItem(AUTH_USER)
        set({ user: null })
      }
    } else {
      set({ user: null })
    }
  },
}))

export default useAuth
