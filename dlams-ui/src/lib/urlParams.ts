import type { ItemType } from "@/types/items"

export const COLLECTION_PARAM = "collection"
export const SEARCH_PARAM = "q"
export const ITEM_PARAM = "item"

const itemPrefix = (type: ItemType) => `${type}-`

export const itemParamValue = (type: ItemType, id: number) =>
  `${itemPrefix(type)}${id}`

export function parseItemParam(
  value: string | null,
  type: ItemType
): number | undefined {
  const prefix = itemPrefix(type)
  if (!value?.startsWith(prefix)) return undefined
  const id = Number(value.slice(prefix.length))
  return Number.isInteger(id) && id > 0 ? id : undefined
}
