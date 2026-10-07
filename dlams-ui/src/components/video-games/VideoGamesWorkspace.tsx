import type { Collection } from "@/types/collections"
import { canWriteCollection } from "@/lib/permissions"
import ConsoleManager from "./ConsoleManager"
import GameManager from "./GameManager"
import useVideoGamesCollection from "./useVideoGamesCollection"

interface VideoGamesWorkspaceProps {
  collection: Collection
}

function VideoGamesWorkspace({ collection }: VideoGamesWorkspaceProps) {
  const { consoles, games, isLoading, error, loadItems } =
    useVideoGamesCollection(collection)
  const canWrite = canWriteCollection(collection.access)

  if (isLoading) return <p>Loading collection items...</p>

  return (
    <div className="flex flex-col gap-5">
      {!canWrite && (
        <p className="rounded-md border p-3 text-sm">
          This collection is read-only in the current UI. Browser-only demo
          editing is not implemented yet.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-md border border-destructive p-3 text-sm">
          {error}
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <ConsoleManager
          collectionId={collection.id}
          consoles={consoles}
          canWrite={canWrite}
          onChanged={loadItems}
        />
        <GameManager
          collectionId={collection.id}
          consoles={consoles}
          games={games}
          canWrite={canWrite}
          onChanged={loadItems}
        />
      </div>
    </div>
  )
}

export default VideoGamesWorkspace
