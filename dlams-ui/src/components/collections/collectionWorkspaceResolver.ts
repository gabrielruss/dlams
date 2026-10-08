import type { ComponentType } from "react"

import type { Collection, CollectionType } from "@/types/collections"
import VideoGamesWorkspace from "@/components/video-games/VideoGamesWorkspace"
import { collectionTypes } from "@/types/collections"

interface CollectionWorkspaceProps {
  collection: Collection
  onStatsChanged: () => Promise<void>
}

type CollectionWorkspaceComponent = ComponentType<CollectionWorkspaceProps>

const collectionWorkspaces: Record<
  CollectionType,
  CollectionWorkspaceComponent
> = {
  video_game: VideoGamesWorkspace,
}

function isCollectionType(type: string): type is CollectionType {
  return collectionTypes.some((collectionType) => collectionType === type)
}

export function resolveCollectionWorkspace(
  selectedCollectionType: string
): CollectionWorkspaceComponent | undefined {
  if (!isCollectionType(selectedCollectionType)) return undefined
  return collectionWorkspaces[selectedCollectionType]
}
