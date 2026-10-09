import type { ComponentType } from "react"

import type { Collection, CollectionType } from "@/types/collections"
import VideoGameCollectionStats from "@/components/video-games/VideoGameCollectionStats"

interface CollectionStatsProps {
  collection: Collection
}

type CollectionStatsComponent = ComponentType<CollectionStatsProps>

const collectionStatsComponents: Record<
  CollectionType,
  CollectionStatsComponent
> = {
  video_game: VideoGameCollectionStats,
}

function CollectionStats({ collection }: CollectionStatsProps) {
  const StatsComponent = collectionStatsComponents[collection.type]

  if (!StatsComponent) {
    return (
      <span className="text-xs text-muted-foreground">
        Stats unavailable
      </span>
    )
  }

  return <StatsComponent collection={collection} />
}

export default CollectionStats
