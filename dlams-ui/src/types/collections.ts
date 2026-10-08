export type CollectionAccess = "owner" | "edit" | "view-only" | "demo"
export const collectionTypes = ["video_game"] as const
export type CollectionType = (typeof collectionTypes)[number]
export const defaultCollectionType = collectionTypes[0]

export interface CollectionCreate {
  name: string
  type: CollectionType
}

export interface Collection {
  id: number
  owner_id: number
  name: string
  type: CollectionType
  access: CollectionAccess
}
