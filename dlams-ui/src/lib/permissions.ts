import type { CollectionAccess } from "@/types/collections"
import type { User } from "@/types/user"

export function isAdmin(user: Pick<User, "role"> | null | undefined): boolean {
  return user?.role === "admin"
}

// Demo accounts are read-only at the API, so the UI must not offer them
// controls that change server data.
export function isDemo(user: Pick<User, "role"> | null | undefined): boolean {
  return user?.role === "demo"
}

export function canWriteCollection(
  access: CollectionAccess,
  user: Pick<User, "role"> | null | undefined
): boolean {
  if (isDemo(user)) return false
  return access === "owner" || access === "edit"
}
