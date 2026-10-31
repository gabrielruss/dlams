import { apiRequest } from "./client"
import { queryOptions } from "@tanstack/react-query"
import type { CollectionType } from "@/types/collections"
import type { ConsoleRecord, GameRecord } from "@/types/videoGames"

export interface SharedCollection {
  name: string
  type: CollectionType
  consoles: ConsoleRecord[]
  games: GameRecord[]
}

export const sharedCollectionQueryOptions = (token: string) =>
  queryOptions({
    queryKey: ["shared-collection", token],
    queryFn: () => apiRequest<SharedCollection>(`/shared/${token}`),
    retry: false,
  })
