import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import useSearchMode from "@/components/search/useSearchMode"
import CollectionStats from "./CollectionStats"
import CreateCollectionDrawer from "./CreateCollectionDrawer"
import useCollections from "./useCollections"

function CollectionNavigation() {
  const {
    collections,
    selectedCollectionId,
    setSelectedCollectionId,
    collectionsQuery,
  } = useCollections()
  const { isOpen: isSearching } = useSearchMode()

  return (
    <nav
      aria-label="Collections"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="flex shrink-0 items-center justify-between py-2 pl-3 pr-3">
        <h2 className="text-sm font-semibold">Collections</h2>
        <CreateCollectionDrawer
          renderTrigger={(open) => (
            <Button
              variant="outline"
              size="icon"
              type="button"
              aria-label="New collection"
              title="New collection"
              onClick={open}
            >
              <Plus aria-hidden="true" />
            </Button>
          )}
        />
      </div>

      {collectionsQuery.isError && (
        <p role="alert" className="px-3 pb-2 text-xs text-destructive">
          {collectionsQuery.error.message}
        </p>
      )}

      {collectionsQuery.isPending ? (
        <p className="px-3 py-2 text-sm text-muted-foreground">
          Loading collections...
        </p>
      ) : collections.length === 0 ? (
        <p className="px-3 py-2 text-sm text-muted-foreground">
          No collections yet.
        </p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto pl-3">
          {collections.map((collection) => {
            const selected =
              !isSearching && collection.id === selectedCollectionId
            return (
              <li key={collection.id} className="border-b last:border-b-0">
                <Button
                  type="button"
                  variant="ghost"
                  aria-pressed={selected}
                  aria-current={selected ? "true" : undefined}
                  onClick={() => setSelectedCollectionId(collection.id)}
                  className={`h-auto w-full flex-col items-stretch justify-start gap-2 rounded-none border-r-4 py-3 pr-3 pl-0 text-left text-base font-normal whitespace-normal transition-colors hover:bg-transparent ${
                    selected
                      ? "border-red text-sidebar-primary hover:text-sidebar-primary"
                      : "border-transparent text-sidebar-foreground hover:text-sidebar-primary"
                  }`}
                >
                  <span className="flex min-w-0 items-center justify-between gap-2">
                    <span className="truncate font-medium">
                      {collection.name}
                    </span>
                    <span className="shrink-0 rounded-full bg-foreground px-2 py-0.5 text-xs text-background">
                      {collection.access}
                    </span>
                  </span>
                  <CollectionStats collection={collection} />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </nav>
  )
}

export default CollectionNavigation
