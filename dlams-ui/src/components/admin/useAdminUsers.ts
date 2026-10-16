import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  adminUserKeys,
  adminUserListQueryOptions,
  adminUsersApi,
} from "@/lib/api/adminUsers"
import type { AssignableRole } from "@/types/user"

export type UserAction =
  | { kind: "status"; userId: number; active: boolean }
  | { kind: "role"; userId: number; role: AssignableRole }

function runAction(action: UserAction) {
  if (action.kind === "role") {
    return adminUsersApi.setRole(action.userId, action.role)
  }
  return action.active
    ? adminUsersApi.activate(action.userId)
    : adminUsersApi.deactivate(action.userId)
}

function useAdminUsers() {
  const queryClient = useQueryClient()
  const { data, isPending, isError, error } = useQuery(
    adminUserListQueryOptions()
  )
  const actionMutation = useMutation({
    mutationFn: runAction,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() }),
  })

  return {
    users: data?.users ?? [],
    isPending,
    isError,
    error,
    applyAction: actionMutation.mutate,
    pendingUserId: actionMutation.isPending
      ? actionMutation.variables.userId
      : undefined,
    pendingKind: actionMutation.isPending
      ? actionMutation.variables.kind
      : undefined,
    actionError: actionMutation.error,
    completedAction: actionMutation.isSuccess
      ? { user: actionMutation.data, kind: actionMutation.variables.kind }
      : undefined,
  }
}

export default useAdminUsers
