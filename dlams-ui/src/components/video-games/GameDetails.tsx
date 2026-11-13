import ItemDetailRows from "@/components/ItemDetailRows"
import type { GameRecord } from "@/components/video-games/types"
import { isoDateToMonthDayYear } from "@/lib/dates"

interface GameDetailsProps {
  game: GameRecord
}

function GameDetails({ game }: GameDetailsProps) {
  return (
    <ItemDetailRows
      rows={[
        { label: "Console", value: game.console_label },
        { label: "Condition", value: game.condition },
        {
          label: "Last played",
          value: game.last_played
            ? isoDateToMonthDayYear(game.last_played)
            : null,
        },
        { label: "Completed", value: game.completed ? "Yes" : "No" },
      ]}
    />
  )
}

export default GameDetails
