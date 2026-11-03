import ItemDetailRows from "@/components/collections/ItemDetailRows"
import type { ConsoleRecord } from "@/types/videoGames"

interface ConsoleDetailsProps {
  consoleRecord: ConsoleRecord
}

function ConsoleDetails({ consoleRecord }: ConsoleDetailsProps) {
  return (
    <ItemDetailRows
      rows={[
        { label: "Edition", value: consoleRecord.edition },
        { label: "Condition", value: consoleRecord.condition },
      ]}
    />
  )
}

export default ConsoleDetails
