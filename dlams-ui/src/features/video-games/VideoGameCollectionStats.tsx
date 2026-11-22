import type { Collection } from "@/types/collections"
import VideoGameCounts from "./VideoGameCounts"
import useVideoGameCollectionStats from "./hooks/useVideoGameCollectionStats"

interface VideoGameCollectionStatsProps {
  collection: Collection
}

function VideoGameCollectionStats({
  collection,
}: VideoGameCollectionStatsProps) {
  const { collectionStats, isPending, isError, error } =
    useVideoGameCollectionStats(collection.id)

  if (!collectionStats) {
    return (
      <span
        className={
          isError ? "text-xs text-destructive" : "text-xs text-muted-foreground"
        }
        role={isError ? "alert" : undefined}
      >
        {isPending
          ? "Loading stats..."
          : error
            ? `Stats unavailable: ${error.message}`
            : "Stats unavailable"}
      </span>
    )
  }

  return (
    <VideoGameCounts
      games={collectionStats.game_count}
      consoles={collectionStats.console_count}
    />
  )
}

export default VideoGameCollectionStats
