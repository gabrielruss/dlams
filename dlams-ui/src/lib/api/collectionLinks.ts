import { apiRequest } from "./client"
import { queryOptions } from "@tanstack/react-query"
import type { CollectionLink } from "@/types/collections"

export const MAX_LINKS_PER_COLLECTION = 5

export const linkKeys = {
  all: ["collection-links"] as const,
  list: (collectionId: number) => [...linkKeys.all, collectionId] as const,
}

export const linksApi = {
  list: (collectionId: number) =>
    apiRequest<{ links: CollectionLink[] }>(
      `/collections/${collectionId}/links`
    ),
  create: (collectionId: number, name: string | null) =>
    apiRequest<CollectionLink>(`/collections/${collectionId}/links`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  delete: (collectionId: number, linkId: number) =>
    apiRequest<void>(`/collections/${collectionId}/links/${linkId}`, {
      method: "DELETE",
    }),
}

export const linkListQueryOptions = (collectionId: number) =>
  queryOptions({
    queryKey: linkKeys.list(collectionId),
    queryFn: () => linksApi.list(collectionId),
  })

export const shareLinkUrl = (token: string) =>
  `${window.location.origin}/s/${token}`
