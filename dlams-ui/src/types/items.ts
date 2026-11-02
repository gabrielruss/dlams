export type ItemType = "console" | "game"

export interface OwnedItem {
  type: ItemType
  id: number
  collection_id: number
  collection_name: string
  title: string
  keywords: string[]
  details: string[]
}
