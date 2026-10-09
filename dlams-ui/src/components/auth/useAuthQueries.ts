import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  authApi,
  authKeys,
  currentUserQueryOptions,
} from "@/lib/api/auth"

export function useCurrentUser() {
  return useQuery(currentUserQueryOptions())
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string
      password: string
    }) => authApi.login(username, password),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.currentUser, user)
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
  })
}

export function useCreateRegistrationInvitation() {
  return useMutation({
    mutationFn: authApi.createRegistrationInvitation,
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      await queryClient.cancelQueries()
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== "auth",
      })
      queryClient.setQueryData(authKeys.currentUser, null)
    },
  })
}
