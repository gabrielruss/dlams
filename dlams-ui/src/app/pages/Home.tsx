import CollectionWorkspace from "@/features/collections/CollectionWorkspace"
import AppSidebar from "@/app/AppSidebar"
import CollectionNavigation from "@/features/collections/CollectionNavigation"
import SearchBar from "@/features/search/SearchBar"
import SearchResults from "@/features/search/SearchResults"
import useSearchMode from "@/hooks/useSearchMode"

function Home() {
  const { isOpen: isSearching } = useSearchMode()

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AppSidebar>
        <CollectionNavigation />
      </AppSidebar>
      <main className="min-w-0 flex-1">
        <SearchBar />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
          {isSearching ? <SearchResults /> : <CollectionWorkspace />}
        </div>
      </main>
    </div>
  )
}

export default Home
