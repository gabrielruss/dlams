import type { QueryClient } from "@tanstack/react-query"

import { consoleKeys } from "@/lib/api/consoles"
import { gameKeys } from "@/lib/api/games"
import { videoGameStatsKeys } from "@/lib/api/videoGameStats"

export async function invalidateVideoGameCollection(
  queryClient: QueryClient,
  collectionId: number
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
  ])
}
