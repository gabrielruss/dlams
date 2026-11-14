import { useState } from "react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

interface ConsoleLabelComboboxProps {
  id: string
  options: string[]
  value: string
  onChange: (value: string) => void
  invalid?: boolean
}

function ConsoleLabelCombobox({
  id,
  options,
  value,
  onChange,
  invalid,
}: ConsoleLabelComboboxProps) {
  const [query, setQuery] = useState(value)
  const typed = query.trim()
  const hasExactMatch = options.some(
    (option) => option.toLowerCase() === typed.toLowerCase(),
  )
  const items = typed && !hasExactMatch ? [...options, typed] : options

  return (
    <Combobox
      items={items}
      value={value || null}
      onValueChange={(next: string | null) => onChange(next ?? "")}
      inputValue={query}
      onInputValueChange={setQuery}
      autoHighlight
    >
      <ComboboxInput
        id={id}
        placeholder="Select or add a console"
        maxLength={100}
        aria-invalid={invalid}
      />
      <ComboboxContent>
        <ComboboxEmpty>Type to add a console</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {options.includes(item) ? item : `Add "${item}"`}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export default ConsoleLabelCombobox
