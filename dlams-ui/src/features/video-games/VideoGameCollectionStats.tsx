import type { Collection } from "@/types/collections"
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
    <span className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
      <span>
        {collectionStats.game_count}{" "}
        {collectionStats.game_count === 1 ? "game" : "games"}
      </span>
      <span>
        {collectionStats.console_count}{" "}
        {collectionStats.console_count === 1 ? "console" : "consoles"}
      </span>
    </span>
  )
}

export default VideoGameCollectionStats
