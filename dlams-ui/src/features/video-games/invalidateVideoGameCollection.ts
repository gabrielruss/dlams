import type { QueryClient } from "@tanstack/react-query"

import { consoleKeys } from "@/features/video-games/api/consoles"
import { consoleLabelKeys } from "@/features/video-games/api/consoleLabels"
import { gameKeys } from "@/features/video-games/api/games"
import { itemKeys } from "@/lib/api/items"
import { videoGameStatsKeys } from "@/features/video-games/api/videoGameStats"

export async function invalidateVideoGameCollection(
  queryClient: QueryClient,
  collectionId: number,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: consoleKeys.list(collectionId),
    }),
    queryClient.invalidateQueries({
      queryKey: gameKeys.list(collectionId),
    }),
    queryClient.invalidateQueries({
      queryKey: videoGameStatsKeys.all,
    }),
    queryClient.invalidateQueries({
      queryKey: consoleLabelKeys.all,
    }),
    queryClient.invalidateQueries({
      queryKey: itemKeys.all,
    }),
  ])
}
