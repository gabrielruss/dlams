import { useQuery } from "@tanstack/react-query"

import { videoGameCollectionStatsQueryOptions } from "@/lib/api/videoGameStats"

function useVideoGameCollectionStats(collectionId: number) {
  return useQuery({
    ...videoGameCollectionStatsQueryOptions(),
    select: ({ stats }) => {
      return stats.find(
        (collectionStats) => collectionStats.collection_id === collectionId
      )
    },
  })
}

export default useVideoGameCollectionStats
