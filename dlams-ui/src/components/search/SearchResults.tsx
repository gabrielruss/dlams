import { useMemo } from "react"

import ListRow from "@/components/collections/ListRow"
import { Button } from "@/components/ui/button"
import type { OwnedItem } from "@/types/items"
import { buildSearchEntries, searchEntries } from "./searchEntries"
import useOwnedItems from "./hooks/useOwnedItems"
import useSearchMode from "./hooks/useSearchMode"

const MAX_RESULTS = 50

function resultSummary(total: number, query: string) {
  const typed = query.trim()
  if (total === 0) {
    return typed ? `Nothing matches "${typed}".` : "You have no items yet."
  }
  if (total > MAX_RESULTS) {
    return typed
      ? `Showing ${MAX_RESULTS} of ${total} results`
      : `Showing ${MAX_RESULTS} of ${total}, type to narrow`
  }
  return total === 1 ? "1 result" : `${total} results`
}

function detailLine(item: OwnedItem) {
  return [...item.keywords, ...item.details, item.collection_name].join(" · ")
}

function SearchResults() {
  const { query, close, openItem } = useSearchMode()
  const { ownedItems, isPending, isError, error } = useOwnedItems()
  const entries = useMemo(
    () => buildSearchEntries(ownedItems, (item) => item),
    [ownedItems],
  )
  const results = useMemo(() => searchEntries(entries, query), [entries, query])

  return (
    <section className="flex flex-col gap-5 duration-200 animate-in fade-in slide-in-from-top-2 motion-reduce:animate-none">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold md:text-3xl">
            Results in all collections
          </h1>
          <p role="status" className="text-sm text-muted-foreground">
            {isPending
              ? "Loading items..."
              : isError
                ? ""
                : resultSummary(results.length, query)}
          </p>
        </div>
        <Button variant="outline" type="button" onClick={close}>
          Close search
        </Button>
      </header>
      {isError && (
        <p
          role="alert"
          className="rounded-md border border-destructive p-3 text-sm"
        >
          {error?.message}
        </p>
      )}
      {results.length > 0 && (
        <ul aria-label="Search results" className="divide-y">
          {results.slice(0, MAX_RESULTS).map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <ListRow title={item.title} onSelect={() => openItem(item)}>
                {detailLine(item)}
              </ListRow>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default SearchResults
