import type { Collection } from "@/types/collections"
import { useCurrentUser } from "@/components/auth/useAuthQueries"
import { canWriteCollection } from "@/lib/permissions"
import ConsoleManager from "./ConsoleManager"
import GameManager from "./GameManager"
import useVideoGamesCollection from "./useVideoGamesCollection"

interface VideoGamesWorkspaceProps {
  collection: Collection
}

function VideoGamesWorkspace({ collection }: VideoGamesWorkspaceProps) {
  const { consoles, games, isPending, error } =
    useVideoGamesCollection(collection.id)
  const { data: user } = useCurrentUser()
  const canWrite = canWriteCollection(collection.access, user)

  if (isPending) return <p>Loading collection items...</p>

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
          {error.message}
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <ConsoleManager
          collectionId={collection.id}
          consoles={consoles}
          canWrite={canWrite}
        />
        <GameManager
          collectionId={collection.id}
          consoles={consoles}
          games={games}
          canWrite={canWrite}
        />
      </div>
    </div>
  )
}

export default VideoGamesWorkspace
