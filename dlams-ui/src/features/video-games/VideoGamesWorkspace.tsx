import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Collection } from "@/types/collections"
import { useCurrentUser } from "@/hooks/useAuthQueries"
import { canWriteCollection, isSandbox } from "@/lib/permissions"
import ConsoleManager from "./ConsoleManager"
import GameManager from "./GameManager"
import useVideoGamesCollection from "./hooks/useVideoGamesCollection"

interface VideoGamesWorkspaceProps {
  collection: Collection
}

function VideoGamesWorkspace({ collection }: VideoGamesWorkspaceProps) {
  const { consoles, games, isPending, error } = useVideoGamesCollection(
    collection.id,
  )
  const { currentUser } = useCurrentUser()
  const canWrite = canWriteCollection(collection.access)

  if (isPending) return <p>Loading collection items...</p>

  return (
    <div className="flex flex-col gap-5">
      {isSandbox(currentUser) && (
        <Alert role="note">
          <AlertDescription>
            You are in a demo session. It ends after 30 minutes; anything you
            share stays viewable by link for 7 days, then it is deleted.
          </AlertDescription>
        </Alert>
      )}
      {!canWrite && (
        <Alert role="note">
          <AlertDescription>This collection is read-only.</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <div className="grid items-start gap-5 lg:grid-cols-2">
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
