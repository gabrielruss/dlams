import { apiRequest } from "./client"
import { queryOptions } from "@tanstack/react-query"
import type { Collection, CollectionCreate } from "@/types/collections"

export const collectionKeys = {
  all: ["collections"] as const,
  lists: () => [...collectionKeys.all, "list"] as const,
}

export const collectionsApi = {
  list: () => apiRequest<{ collections: Collection[] }>("/collections"),
  create: (data: CollectionCreate) =>
    apiRequest<Collection>("/collections", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

export const collectionListQueryOptions = () =>
  queryOptions({
    queryKey: collectionKeys.lists(),
    queryFn: collectionsApi.list,
  })
