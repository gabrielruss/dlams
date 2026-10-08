import type { ReactNode } from "react"

import type { Collection, CollectionType } from "@/types/collections"
import type { VideoGameCollectionStats } from "@/types/videoGames"
import VideoGameCollectionStatsSummary from "@/components/video-games/VideoGameCollectionStats"

interface CollectionStatsRendererOptions {
  videoGameStats: Map<number, VideoGameCollectionStats>
  isVideoGameStatsLoading: boolean
}

type CollectionStatsRenderer = (
  collection: Collection,
  options: CollectionStatsRendererOptions
) => ReactNode

const collectionStatsRenderers: Record<
  CollectionType,
  CollectionStatsRenderer
> = {
  video_game: (collection, options) => (
    <VideoGameCollectionStatsSummary
      stats={options.videoGameStats.get(collection.id)}
      isLoading={options.isVideoGameStatsLoading}
    />
  ),
}

export function renderCollectionStats(
  collection: Collection,
  options: CollectionStatsRendererOptions
): ReactNode {
  return collectionStatsRenderers[collection.type](collection, options)
}
