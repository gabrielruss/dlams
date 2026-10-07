import { apiRequest } from "./client"
import type { GameCreate, GameRecord } from "@/types/videoGames"

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
