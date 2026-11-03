export const itemTypes = ["console", "game"] as const

export type ItemType = (typeof itemTypes)[number]

export interface OwnedItem {
  type: ItemType
  id: number
  collection_id: number
  collection_name: string
  title: string
  keywords: string[]
  details: string[]
}

export interface CountNames {
  one: string
  many: string
}

export const itemTypeNames: Record<ItemType, CountNames> = {
  console: { one: "console", many: "consoles" },
  game: { one: "game", many: "games" },
}
