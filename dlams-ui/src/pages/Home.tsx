import CollectionWorkspace from "@/components/collections/CollectionWorkspace"
import AppSidebar from "@/components/AppSidebar"
import CollectionNavigation from "@/components/collections/CollectionNavigation"
import useCollections from "@/components/collections/useCollections"
import useVideoGameCollectionStats from "@/components/video-games/useVideoGameCollectionStats"
import { renderCollectionStats } from "@/components/collections/collectionStatsRenderer"

function Home() {
  const collectionsState = useCollections()
  const collectionStatsState = useVideoGameCollectionStats()

  return (
    <div className="flex min-h-screen">
      <AppSidebar>
        <CollectionNavigation
          collections={collectionsState.collections}
          renderStats={(collection) =>
            renderCollectionStats(collection, {
              videoGameStats: collectionStatsState.stats,
              isVideoGameStatsLoading: collectionStatsState.isLoading,
            })
          }
          selectedCollectionId={collectionsState.selectedCollectionId}
          setSelectedCollectionId={collectionsState.setSelectedCollectionId}
          isLoading={collectionsState.isLoading}
          statsError={collectionStatsState.error}
          isCreating={collectionsState.isCreating}
          createError={collectionsState.createError}
          clearCreateError={collectionsState.clearCreateError}
          createCollection={collectionsState.createCollection}
          onCollectionCreated={collectionStatsState.refreshStats}
        />
      </AppSidebar>
      <main className="min-w-0 flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
          <header>
            <h1 className="text-3xl font-semibold">
              {collectionsState.selectedCollection?.name ?? "Your collections"}
            </h1>
          </header>
          <CollectionWorkspace
            collection={collectionsState.selectedCollection}
            isLoading={collectionsState.isLoading}
            loadError={collectionsState.loadError}
            onStatsChanged={collectionStatsState.refreshStats}
          />
        </div>
      </main>
    </div>
  )
}

export default Home
