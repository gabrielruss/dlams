export type CollectionAccess = "owner" | "view-only"
export const collectionTypes = ["video_game"] as const
export type CollectionType = (typeof collectionTypes)[number]
export const defaultCollectionType = collectionTypes[0]
export const collectionTypeNames: Record<CollectionType, string> = {
  video_game: "Video games",
}

export interface CollectionCreate {
  name: string
  type: CollectionType
}

export interface CollectionLink {
  id: number
  name: string | null
  token: string
  created_at: string
}

export interface Collection {
  id: number
  owner_id: number
  name: string
  type: CollectionType
  access: CollectionAccess
}
