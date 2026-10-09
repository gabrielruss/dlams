import { apiRequest } from "./client"
import { queryOptions } from "@tanstack/react-query"
import type { ConsoleCreate, ConsoleRecord } from "@/types/videoGames"

export const consoleKeys = {
  all: ["consoles"] as const,
  lists: () => [...consoleKeys.all, "list"] as const,
  list: (collectionId: number) =>
    [...consoleKeys.lists(), { collectionId }] as const,
}

export const consolesApi = {
  list: (collectionId: number) =>
    apiRequest<{ consoles: ConsoleRecord[] }>(
      `/collections/${collectionId}/consoles`
    ),
  create: (collectionId: number, data: ConsoleCreate) =>
    apiRequest<ConsoleRecord>(`/collections/${collectionId}/consoles`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    collectionId: number,
    consoleId: number,
    data: ConsoleCreate
  ) =>
    apiRequest<ConsoleRecord>(
      `/collections/${collectionId}/consoles/${consoleId}`,
      { method: "PUT", body: JSON.stringify(data) }
    ),
  delete: (collectionId: number, consoleId: number) =>
    apiRequest<void>(`/collections/${collectionId}/consoles/${consoleId}`, {
      method: "DELETE",
    }),
}

export const consoleListQueryOptions = (collectionId: number) =>
    queryOptions({
      queryKey: consoleKeys.list(collectionId),
      queryFn: () => consolesApi.list(collectionId),
    })
