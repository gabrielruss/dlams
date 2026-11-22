interface VideoGameCountsProps {
  games: number
  consoles: number
}

function VideoGameCounts({ games, consoles }: VideoGameCountsProps) {
  return (
    <span className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
      <span>
        {games} {games === 1 ? "game" : "games"}
      </span>
      <span>
        {consoles} {consoles === 1 ? "console" : "consoles"}
      </span>
    </span>
  )
}

export default VideoGameCounts
