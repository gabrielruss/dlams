import type { GameRecord } from "@/features/video-games/types"
import ListRow from "@/components/ListRow"
import { isoDateToMonthDayYear } from "@/lib/dates"

interface GameListProps {
  games: GameRecord[]
  emptyMessage?: string
  onSelect?: (game: GameRecord) => void
}

function GameList({ games, emptyMessage, onSelect }: GameListProps) {
  if (games.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {emptyMessage ?? "No games in this collection yet."}
      </p>
    )
  }

  return (
    <ul className="divide-y">
      {games.map((game) => (
        <li key={game.id}>
          <ListRow
            title={game.name}
            onSelect={onSelect ? () => onSelect(game) : undefined}
          >
            {game.console_label} · {game.condition}
            {game.completed ? " · Completed" : ""}
            {game.last_played
              ? ` · Last played ${isoDateToMonthDayYear(game.last_played)}`
              : ""}
          </ListRow>
        </li>
      ))}
    </ul>
  )
}

export default GameList
