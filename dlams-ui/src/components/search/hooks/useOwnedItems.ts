import { useQuery } from "@tanstack/react-query"

import { ownedItemsQueryOptions } from "@/lib/api/items"

function useOwnedItems() {
  const { data, isPending, isError, error } = useQuery(ownedItemsQueryOptions())

  return { ownedItems: data?.items ?? [], isPending, isError, error }
}

export default useOwnedItems
