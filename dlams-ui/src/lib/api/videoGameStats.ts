import { apiRequest } from "./client"
import { queryOptions } from "@tanstack/react-query"
import type { VideoGameCollectionStats } from "@/types/videoGames"

export const videoGameStatsKeys = {
  all: ["video-game-collection-stats"] as const,
}

export const videoGameStatsApi = {
  list: () =>
    apiRequest<{ stats: VideoGameCollectionStats[] }>(
      "/collections/video-game-stats"
    ),
}

export const videoGameCollectionStatsQueryOptions = () =>
    queryOptions({
      queryKey: videoGameStatsKeys.all,
      queryFn: videoGameStatsApi.list,
    })
