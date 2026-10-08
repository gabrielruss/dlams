import type { Collection } from "@/types/collections"
import { resolveCollectionWorkspace } from "./collectionWorkspaceResolver"

interface CollectionWorkspaceProps {
  collection: Collection | undefined
  isLoading: boolean
  loadError: string | null
  onStatsChanged: () => Promise<void>
}

function CollectionWorkspace({
  collection,
  isLoading,
  loadError,
  onStatsChanged,
}: CollectionWorkspaceProps) {
  const SelectedWorkspace = collection
    ? resolveCollectionWorkspace(collection.type)
    : undefined

  return (
    <section className="flex flex-col gap-5">
      {loadError && (
        <p
          role="alert"
          className="rounded-md border border-destructive p-3 text-sm"
        >
          {loadError}
        </p>
      )}
      {isLoading ? (
        <p>Loading collections...</p>
      ) : collection && SelectedWorkspace ? (
        <SelectedWorkspace
          collection={collection}
          onStatsChanged={onStatsChanged}
        />
      ) : collection ? (
        <p role="status">
          This collection type is not supported in the current UI yet.
        </p>
      ) : (
        <p>Create a collection to start tracking consoles and games.</p>
      )}
    </section>
  )
}

export default CollectionWorkspace
