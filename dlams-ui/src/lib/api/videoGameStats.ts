import { apiRequest } from "./client"
import type { VideoGameCollectionStats } from "@/types/videoGames"

export const videoGameStatsApi = {
  list: () =>
    apiRequest<{ stats: VideoGameCollectionStats[] }>(
      "/collections/video-game-stats"
    ),
}
