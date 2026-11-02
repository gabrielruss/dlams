import { canWriteCollection } from "@/lib/permissions"
import type { Collection } from "@/types/collections"
import { resolveCollectionWorkspace } from "./collectionWorkspaceResolver"
import ShareCollectionDrawer from "./ShareCollectionDrawer"
import useCollections from "./useCollections"

interface CollectionBodyProps {
  isPending: boolean
  collection: Collection | undefined
}

function CollectionBody({ isPending, collection }: CollectionBodyProps) {
  if (isPending) return <p>Loading collections...</p>
  if (!collection) {
    return <p>Create a collection to start tracking consoles and games.</p>
  }

  const SelectedWorkspace = resolveCollectionWorkspace(collection.type)
  if (!SelectedWorkspace) {
    return (
      <p role="status">
        This collection type is not supported in the current UI yet.
      </p>
    )
  }

  return <SelectedWorkspace collection={collection} />
}

function CollectionWorkspace() {
  const { selectedCollection, collectionsQuery } = useCollections()
  const collection = selectedCollection
  const canShare =
    collection !== undefined && canWriteCollection(collection.access)

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold md:text-3xl">
          {collection?.name ?? "Your collections"}
        </h1>
        {canShare && <ShareCollectionDrawer collection={collection} />}
      </header>
      {collectionsQuery.isError && (
        <p
          role="alert"
          className="rounded-md border border-destructive p-3 text-sm"
        >
          {collectionsQuery.error.message}
        </p>
      )}
      <CollectionBody
        isPending={collectionsQuery.isPending}
        collection={collection}
      />
    </section>
  )
}

export default CollectionWorkspace
