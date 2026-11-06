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
} from "@/types/videoGames"

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
        className="w-full rounded-md pl-3 text-base data-[size=default]:h-9 md:text-sm"
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
