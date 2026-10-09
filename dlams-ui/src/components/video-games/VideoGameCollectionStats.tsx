import type { Collection } from "@/types/collections"
import useVideoGameCollectionStats from "./useVideoGameCollectionStats"

interface VideoGameCollectionStatsProps {
  collection: Collection
}

function VideoGameCollectionStats({
  collection,
}: VideoGameCollectionStatsProps) {
  const { data: stats, isPending, isError, error } =
    useVideoGameCollectionStats(collection.id)

  if (!stats) {
    return (
      <span
        className={
          isError
            ? "text-xs text-destructive"
            : "text-xs text-muted-foreground"
        }
        role={isError ? "alert" : undefined}
      >
        {isPending
          ? "Loading stats..."
          : isError
            ? `Stats unavailable: ${error.message}`
            : "Stats unavailable"}
      </span>
    )
  }

  return (
    <span className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
      <span>
        {stats.game_count} {stats.game_count === 1 ? "game" : "games"}
      </span>
      <span>
        {stats.console_count}{" "}
        {stats.console_count === 1 ? "console" : "consoles"}
      </span>
    </span>
  )
}

export default VideoGameCollectionStats
