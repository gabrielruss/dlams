import { useMemo } from "react"

import {
  buildSearchEntries,
  searchEntries,
  type Searchable,
} from "./searchEntries"

function useListSearch<T>(
  items: T[],
  toSearchable: (item: T) => Searchable,
  query: string,
) {
  const entries = useMemo(
    () => buildSearchEntries(items, toSearchable),
    [items, toSearchable],
  )

  return useMemo(
    () => (query.trim() ? searchEntries(entries, query) : items),
    [entries, items, query],
  )
}

export default useListSearch
