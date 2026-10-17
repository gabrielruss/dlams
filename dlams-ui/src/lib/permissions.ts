import type { CollectionAccess } from "@/types/collections"
import type { User } from "@/types/user"

export function isAdmin(user: Pick<User, "role"> | null | undefined): boolean {
  return user?.role === "admin"
}

export function isDemo(user: Pick<User, "role"> | null | undefined): boolean {
  return user?.role === "demo"
}

export function canWriteCollection(
  access: CollectionAccess,
  user: Pick<User, "role"> | null | undefined,
): boolean {
  if (isDemo(user)) return false
  return access === "owner"
}
