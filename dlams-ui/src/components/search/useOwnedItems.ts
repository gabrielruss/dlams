import { useQuery } from "@tanstack/react-query"

import { ownedItemsQueryOptions } from "@/lib/api/items"
import type { OwnedItem } from "@/types/items"
import { buildSearchIndex } from "./searchIndex"

const indexOwnedItems = (data: { items: OwnedItem[] }) =>
  buildSearchIndex(data.items, (item) => item)

function useOwnedItems() {
  const { data, isPending, isError, error } = useQuery({
    ...ownedItemsQueryOptions(),
    select: indexOwnedItems,
  })

  return { index: data ?? [], isPending, isError, error }
}

export default useOwnedItems
