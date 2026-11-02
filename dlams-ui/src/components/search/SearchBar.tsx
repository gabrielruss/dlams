import type { KeyboardEvent } from "react"

import { Input } from "@/components/ui/input"
import useSearchMode from "./useSearchMode"

function SearchBar() {
  const { query, open, setQuery, close } = useSearchMode()

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") return
    event.preventDefault()
    if (query) {
      setQuery("")
    } else {
      close()
    }
  }

  return (
    <div role="search" className="border-b">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 md:px-6">
        <Input
          type="search"
          aria-label="Search all collections"
          placeholder="Search all collections"
          value={query}
          onFocus={open}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  )
}

export default SearchBar
