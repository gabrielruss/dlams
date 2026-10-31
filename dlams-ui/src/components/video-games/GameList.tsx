import type { GameRecord } from "@/types/videoGames"
import ListRow from "@/components/collections/ListRow"

interface GameListProps {
  games: GameRecord[]
  onSelect?: (game: GameRecord) => void
}

function GameList({ games, onSelect }: GameListProps) {
  if (games.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No games in this collection yet.
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
            {game.last_played ? ` · Last played ${game.last_played}` : ""}
          </ListRow>
        </li>
      ))}
    </ul>
  )
}

export default GameList
