import { resolveCollectionWorkspace } from "./collectionWorkspaceResolver"
import useCollections from "./useCollections"

function CollectionWorkspace() {
  const { selectedCollection, collectionsQuery } = useCollections()
  const collection = selectedCollection
  const SelectedWorkspace = collection
    ? resolveCollectionWorkspace(collection.type)
    : undefined

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold md:text-3xl">
        {collection?.name ?? "Your collections"}
      </h1>
      {collectionsQuery.isError && (
        <p
          role="alert"
          className="rounded-md border border-destructive p-3 text-sm"
        >
          {collectionsQuery.error.message}
        </p>
      )}
      {collectionsQuery.isPending ? (
        <p>Loading collections...</p>
      ) : collection && SelectedWorkspace ? (
        <SelectedWorkspace collection={collection} />
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
