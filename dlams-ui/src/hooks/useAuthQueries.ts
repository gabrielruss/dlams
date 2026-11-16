import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { authApi, authKeys, currentUserQueryOptions } from "@/lib/api/auth"

export function useCurrentUser() {
  const { data, isPending, isError, error, refetch } = useQuery(
    currentUserQueryOptions(),
  )

  return { currentUser: data ?? null, isPending, isError, error, refetch }
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

export function useStartDemoSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.startDemoSession,
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
