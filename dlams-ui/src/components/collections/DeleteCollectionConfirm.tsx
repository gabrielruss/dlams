import useVideoGameCollectionStats from "@/components/video-games/hooks/useVideoGameCollectionStats"
import { Button } from "@/components/ui/button"
import type { Collection } from "@/types/collections"
import { itemTypeNames, type CountNames } from "@/types/items"
import { describeContents } from "./describeContents"
import useCollectionLinks from "./hooks/useCollectionLinks"

const shareLinkNames: CountNames = { one: "share link", many: "share links" }

interface DeleteCollectionConfirmProps {
  collection: Collection
  isDeleting: boolean
  error: Error | null
  onDelete: () => void
  onKeep: () => void
}

function contentsMessage(
  isCounting: boolean,
  countsLoaded: boolean,
  contents: string,
) {
  if (isCounting) return "Counting what goes with it..."
  if (!countsLoaded) {
    return "We couldn't count what goes with it, but all of its items and share links are deleted too."
  }
  return contents ? `This also deletes ${contents}.` : "It's empty."
}

function DeleteCollectionConfirm({
  collection,
  isDeleting,
  error,
  onDelete,
  onKeep,
}: DeleteCollectionConfirmProps) {
  const { collectionStats, isPending: statsPending } =
    useVideoGameCollectionStats(collection.id)
  const {
    links,
    isPending: linksPending,
    isError: linksFailed,
  } = useCollectionLinks(collection.id)
  const isCounting = statsPending || linksPending
  const countsLoaded = collectionStats !== undefined && !linksFailed

  const contents = describeContents([
    {
      count: collectionStats?.console_count ?? 0,
      names: itemTypeNames.console,
    },
    { count: collectionStats?.game_count ?? 0, names: itemTypeNames.game },
    { count: links.length, names: shareLinkNames },
  ])

  return (
    <div className="flex flex-col gap-3 rounded-md border p-3">
      <p className="text-sm">
        Delete {collection.name}?{" "}
        {contentsMessage(isCounting, countsLoaded, contents)} This can't be
        undone.
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <Button
          className="border-destructive text-destructive"
          type="button"
          variant="outline"
          disabled={isDeleting || isCounting}
          onClick={onDelete}
        >
          {isDeleting ? "Deleting..." : "Delete collection"}
        </Button>
        <Button type="button" variant="outline" onClick={onKeep}>
          Keep collection
        </Button>
      </div>
    </div>
  )
}

export default DeleteCollectionConfirm
