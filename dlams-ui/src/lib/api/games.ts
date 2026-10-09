import { apiRequest } from "./client"
import { queryOptions } from "@tanstack/react-query"
import type { GameCreate, GameRecord } from "@/types/videoGames"

export const gameKeys = {
  all: ["games"] as const,
  lists: () => [...gameKeys.all, "list"] as const,
  list: (collectionId: number) =>
    [...gameKeys.lists(), { collectionId }] as const,
}

export const gamesApi = {
  list: (collectionId: number) =>
    apiRequest<{ games: GameRecord[] }>(
      `/collections/${collectionId}/games`
    ),
  create: (collectionId: number, data: GameCreate) =>
    apiRequest<GameRecord>(`/collections/${collectionId}/games`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (collectionId: number, gameId: number, data: GameCreate) =>
    apiRequest<GameRecord>(
      `/collections/${collectionId}/games/${gameId}`,
      { method: "PUT", body: JSON.stringify(data) }
    ),
  delete: (collectionId: number, gameId: number) =>
    apiRequest<void>(`/collections/${collectionId}/games/${gameId}`, {
      method: "DELETE",
    }),
}

export const gameListQueryOptions = (collectionId: number) =>
    queryOptions({
      queryKey: gameKeys.list(collectionId),
      queryFn: () => gamesApi.list(collectionId),
    })
