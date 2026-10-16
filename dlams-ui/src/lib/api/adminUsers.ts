import { queryOptions } from "@tanstack/react-query"

import type { AdminUser } from "@/types/adminUsers"
import type { AssignableRole } from "@/types/user"
import { apiRequest } from "./client"

export const adminUserKeys = {
  all: ["admin-users"] as const,
  lists: () => [...adminUserKeys.all, "list"] as const,
}

export const adminUsersApi = {
  list: () => apiRequest<{ users: AdminUser[] }>("/admin/users"),
  deactivate: (userId: number) =>
    apiRequest<AdminUser>(`/admin/users/${userId}/deactivate`, {
      method: "POST",
    }),
  setRole: (userId: number, role: AssignableRole) =>
    apiRequest<AdminUser>(`/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),
  activate: (userId: number) =>
    apiRequest<AdminUser>(`/admin/users/${userId}/activate`, {
      method: "POST",
    }),
}

export const adminUserListQueryOptions = () =>
  queryOptions({
    queryKey: adminUserKeys.lists(),
    queryFn: adminUsersApi.list,
  })
