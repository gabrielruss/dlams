import type { CollectionAccess } from "@/types/collections"

export function canWriteCollection(access: CollectionAccess): boolean {
  return access === "owner" || access === "edit"
}
