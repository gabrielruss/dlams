import type { KeyboardEvent } from "react"

import { Input } from "@/components/ui/input"

interface SearchFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  onEscape: () => void
}

function SearchField({ label, value, onChange, onEscape }: SearchFieldProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") return
    event.preventDefault()
    onEscape()
  }

  return (
    <Input
      type="search"
      aria-label={label}
      placeholder={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={handleKeyDown}
    />
  )
}

export default SearchField
