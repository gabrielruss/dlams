import { useQuery } from "@tanstack/react-query"

import { videoGameCollectionStatsQueryOptions } from "@/components/video-games/api/videoGameStats"

function useVideoGameCollectionStats(collectionId: number) {
  const { data, isPending, isError, error } = useQuery({
    ...videoGameCollectionStatsQueryOptions(),
    select: ({ stats }) => {
      return stats.find(
        (collectionStats) => collectionStats.collection_id === collectionId,
      )
    },
  })

  return { collectionStats: data, isPending, isError, error }
}

export default useVideoGameCollectionStats
