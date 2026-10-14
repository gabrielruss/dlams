import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  adminUserKeys,
  adminUserListQueryOptions,
  adminUsersApi,
} from "@/lib/api/adminUsers"

function useAdminUsers() {
  const queryClient = useQueryClient()
  const { data, isPending, isError, error } = useQuery(
    adminUserListQueryOptions()
  )
  const setActiveMutation = useMutation({
    mutationFn: ({ userId, active }: { userId: number; active: boolean }) =>
      active ? adminUsersApi.activate(userId) : adminUsersApi.deactivate(userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() }),
  })

  return {
    users: data?.users ?? [],
    isPending,
    isError,
    error,
    setUserActive: setActiveMutation.mutate,
    pendingUserId: setActiveMutation.isPending
      ? setActiveMutation.variables.userId
      : undefined,
    changeError: setActiveMutation.error,
    changedUser: setActiveMutation.isSuccess ? setActiveMutation.data : undefined,
  }
}

export default useAdminUsers
