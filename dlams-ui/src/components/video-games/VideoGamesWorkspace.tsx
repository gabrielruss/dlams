import type { Collection } from "@/types/collections"
import { useCurrentUser } from "@/components/auth/useAuthQueries"
import { canWriteCollection, isSandbox } from "@/lib/permissions"
import ConsoleManager from "./ConsoleManager"
import GameManager from "./GameManager"
import useVideoGamesCollection from "./useVideoGamesCollection"

interface VideoGamesWorkspaceProps {
  collection: Collection
}

function VideoGamesWorkspace({ collection }: VideoGamesWorkspaceProps) {
  const { consoles, games, isPending, error } = useVideoGamesCollection(
    collection.id,
  )
  const { data: user } = useCurrentUser()
  const canWrite = canWriteCollection(collection.access)

  if (isPending) return <p>Loading collection items...</p>

  return (
    <div className="flex flex-col gap-5">
      {isSandbox(user) && (
        <p className="rounded-md border p-3 text-sm">
          You are currently in a demo session. All data you add will be reset in
          30 minutes. Enjoy :)
        </p>
      )}
      {!canWrite && (
        <p className="rounded-md border p-3 text-sm">
          This collection is read-only.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive p-3 text-sm"
        >
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
          games={games}
          canWrite={canWrite}
        />
      </div>
    </div>
  )
}

export default VideoGamesWorkspace
