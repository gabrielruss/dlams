export type CollectionAccess = "owner" | "edit" | "view-only" | "demo"

export interface Collection {
  id: number
  owner_id: number
  name: string
  access: CollectionAccess
}
