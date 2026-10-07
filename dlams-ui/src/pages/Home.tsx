import useAuth from "@/stores/auth"
import CollectionWorkspace from "@/components/collections/CollectionWorkspace"

function Home() {
  const { user } = useAuth()

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-3xl font-semibold">Video game collection</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user?.username}
        </p>
      </header>
      <CollectionWorkspace />
    </main>
  )
}

export default Home
