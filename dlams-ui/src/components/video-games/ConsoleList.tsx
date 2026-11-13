import type { ConsoleRecord } from "@/components/video-games/types"
import ListRow from "@/components/ListRow"
import { consoleName } from "./videoGameOptions"

interface ConsoleListProps {
  consoles: ConsoleRecord[]
  emptyMessage?: string
  onSelect?: (consoleRecord: ConsoleRecord) => void
}

function ConsoleList({ consoles, emptyMessage, onSelect }: ConsoleListProps) {
  if (consoles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {emptyMessage ?? "No consoles in this collection yet."}
      </p>
    )
  }

  return (
    <ul className="divide-y">
      {consoles.map((consoleRecord) => (
        <li key={consoleRecord.id}>
          <ListRow
            title={consoleName(consoleRecord)}
            onSelect={onSelect ? () => onSelect(consoleRecord) : undefined}
          >
            {consoleRecord.condition}
          </ListRow>
        </li>
      ))}
    </ul>
  )
}

export default ConsoleList
