import ItemDetailRows from "@/components/collections/ItemDetailRows"
import type { GameRecord } from "@/types/videoGames"

interface GameDetailsProps {
  game: GameRecord
}

function GameDetails({ game }: GameDetailsProps) {
  return (
    <ItemDetailRows
      rows={[
        { label: "Console", value: game.console_label },
        { label: "Condition", value: game.condition },
        { label: "Last played", value: game.last_played },
        { label: "Completed", value: game.completed ? "Yes" : "No" },
      ]}
    />
  )
}

export default GameDetails
