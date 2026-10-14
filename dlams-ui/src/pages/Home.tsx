import CollectionWorkspace from "@/components/collections/CollectionWorkspace"
import AppSidebar from "@/components/AppSidebar"
import CollectionNavigation from "@/components/collections/CollectionNavigation"

function Home() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar>
        <CollectionNavigation />
      </AppSidebar>
      <main className="min-w-0 flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
          <header>
            <h1 className="text-3xl font-semibold">
              Your collections
            </h1>
          </header>
          <CollectionWorkspace />
        </div>
      </main>
    </div>
  )
}

export default Home
