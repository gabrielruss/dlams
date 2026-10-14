import type { CollectionAccess } from "@/types/collections"
import type { User } from "@/types/user"

export function isAdmin(user: Pick<User, "role"> | null | undefined): boolean {
  return user?.role === "admin"
}

export function canWriteCollection(access: CollectionAccess): boolean {
  return access === "owner" || access === "edit"
}
