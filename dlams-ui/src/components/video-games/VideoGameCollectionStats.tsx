import type { VideoGameCollectionStats as VideoGameCollectionStatsData } from "@/types/videoGames"

interface VideoGameCollectionStatsProps {
  stats: VideoGameCollectionStatsData | undefined
  isLoading: boolean
}

function VideoGameCollectionStats({
  stats,
  isLoading,
}: VideoGameCollectionStatsProps) {
  if (!stats) {
    return (
      <span className="text-xs text-muted-foreground">
        {isLoading ? "Loading stats..." : "Stats unavailable"}
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
