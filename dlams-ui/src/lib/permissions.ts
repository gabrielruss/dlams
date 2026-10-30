import type { CollectionAccess } from "@/types/collections"
import type { User } from "@/types/user"

export function isAdmin(user: Pick<User, "role"> | null | undefined): boolean {
  return user?.role === "admin"
}

export function isTemplate(user: Pick<User, "role"> | null | undefined): boolean {
  return user?.role === "template"
}

export function isSandbox(user: Pick<User, "role"> | null | undefined): boolean {
  return user?.role === "sandbox"
}

export function canWriteCollection(access: CollectionAccess): boolean {
  return access === "owner"
}
