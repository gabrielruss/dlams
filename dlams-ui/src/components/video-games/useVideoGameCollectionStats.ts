import { useCallback, useEffect, useState } from "react"

import { videoGameStatsApi } from "@/lib/api/videoGameStats"
import type { VideoGameCollectionStats } from "@/types/videoGames"

function useVideoGameCollectionStats() {
  const [stats, setStats] = useState<
    Map<number, VideoGameCollectionStats>
  >(() => new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshStats = useCallback(async () => {
    setError(null)
    try {
      const { stats: loadedStats } = await videoGameStatsApi.list()
      setStats(
        new Map(
          loadedStats.map((collectionStats) => [
            collectionStats.collection_id,
            collectionStats,
          ])
        )
      )
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load collection stats"
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  return { stats, isLoading, error, refreshStats }
}

export default useVideoGameCollectionStats
