import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type VideoGameCondition,
  videoGameConditions,
} from "@/features/video-games/types"

interface ConditionSelectProps {
  id: string
  name: string
  value: VideoGameCondition
  onChange: (condition: VideoGameCondition) => void
  invalid?: boolean
}

const conditionItems = videoGameConditions.map((condition) => ({
  label: condition,
  value: condition,
}))

function ConditionSelect({
  id,
  name,
  value,
  onChange,
  invalid,
}: ConditionSelectProps) {
  return (
    <Select
      items={conditionItems}
      name={name}
      value={value}
      onValueChange={(next: VideoGameCondition | null) => {
        if (next) onChange(next)
      }}
    >
      <SelectTrigger
        id={id}
        className="w-full text-base md:text-sm"
        aria-invalid={invalid}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {conditionItems.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default ConditionSelect
