import { apiRequest } from "./client"
import { queryOptions } from "@tanstack/react-query"
import type {
  Collection,
  CollectionCreate,
  CollectionUpdate,
} from "@/types/collections"

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
  update: (collectionId: number, data: CollectionUpdate) =>
    apiRequest<Collection>(`/collections/${collectionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (collectionId: number) =>
    apiRequest<void>(`/collections/${collectionId}`, { method: "DELETE" }),
}

export const collectionListQueryOptions = () =>
  queryOptions({
    queryKey: collectionKeys.lists(),
    queryFn: collectionsApi.list,
  })
