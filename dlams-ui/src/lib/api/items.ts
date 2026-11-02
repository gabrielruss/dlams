import { apiRequest } from "./client"
import { queryOptions } from "@tanstack/react-query"
import type { OwnedItem } from "@/types/items"

export const itemKeys = {
  all: ["items"] as const,
  owned: () => [...itemKeys.all, "owned"] as const,
}

export const itemsApi = {
  listOwned: () => apiRequest<{ items: OwnedItem[] }>("/items"),
}

export const ownedItemsQueryOptions = () =>
  queryOptions({
    queryKey: itemKeys.owned(),
    queryFn: itemsApi.listOwned,
  })
