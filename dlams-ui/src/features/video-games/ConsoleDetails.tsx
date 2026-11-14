import ItemDetailRows from "@/components/ItemDetailRows"
import type { ConsoleRecord } from "@/features/video-games/types"

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
