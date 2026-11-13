import { apiRequest } from "@/lib/api/client"
import { queryOptions } from "@tanstack/react-query"
import type { VideoGameCollectionStats } from "@/components/video-games/types"

export const videoGameStatsKeys = {
  all: ["video-game-collection-stats"] as const,
}

export const videoGameStatsApi = {
  list: () =>
    apiRequest<{ stats: VideoGameCollectionStats[] }>(
      "/collections/video-game-stats",
    ),
}

export const videoGameCollectionStatsQueryOptions = () =>
  queryOptions({
    queryKey: videoGameStatsKeys.all,
    queryFn: videoGameStatsApi.list,
  })
