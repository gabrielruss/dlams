import CollectionWorkspace from "@/features/collections/CollectionWorkspace"
import AppSidebar from "@/app/AppSidebar"
import PageShell from "@/app/PageShell"
import CollectionNavigation from "@/features/collections/CollectionNavigation"
import SearchBar from "@/features/search/SearchBar"
import SearchResults from "@/features/search/SearchResults"
import useSearchMode from "@/hooks/useSearchMode"

function Home() {
  const { isOpen: isSearching } = useSearchMode()

  return (
    <PageShell
      sidebar={
        <AppSidebar>
          <CollectionNavigation />
        </AppSidebar>
      }
      beforeContent={<SearchBar />}
    >
      {isSearching ? <SearchResults /> : <CollectionWorkspace />}
    </PageShell>
  )
}

export default Home
