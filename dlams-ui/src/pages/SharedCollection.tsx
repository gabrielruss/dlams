import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"

import Wordmark from "@/components/Wordmark"
import ConsoleList from "@/components/video-games/ConsoleList"
import GameList from "@/components/video-games/GameList"
import { sharedCollectionQueryOptions } from "@/lib/api/sharedCollections"
import { collectionTypeNames } from "@/types/collections"

function SharedCollection() {
  const { token = "" } = useParams()
  const { data, isPending, error } = useQuery(
    sharedCollectionQueryOptions(token)
  )

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <meta name="robots" content="noindex" />
      <meta name="referrer" content="no-referrer" />
      <header className="flex h-14 shrink-0 items-center border-b bg-sidebar px-4 md:hidden">
        <Link className="relative block h-9 w-40" to="/" aria-label="DLAMS home">
          <Wordmark className="absolute inset-0" />
        </Link>
      </header>
      <aside
        aria-label="Shared collection"
        className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground sm:w-64 md:flex"
      >
        <Link
          className="relative block h-[4.75rem] shrink-0 border-b"
          to="/"
          aria-label="DLAMS home"
        >
          <Wordmark className="absolute inset-x-4 inset-y-0" />
        </Link>
        {data && (
          <div className="flex flex-col gap-1 p-4">
            <p className="font-medium">{data.name}</p>
            <p className="text-xs text-muted-foreground">
              {collectionTypeNames[data.type]}
            </p>
            <ItemCounts consoles={data.consoles.length} games={data.games.length} />
          </div>
        )}
      </aside>
      <main className="min-w-0 flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
          {isPending ? (
            <p>Loading collection...</p>
          ) : error ? (
            <div role="alert" className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold">Nothing to see here</h1>
              <p>{error.message}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold md:text-3xl">
                  {data.name}
                </h1>
                <div className="md:hidden">
                  <ItemCounts
                    consoles={data.consoles.length}
                    games={data.games.length}
                  />
                </div>
              </div>
              <p className="rounded-md border p-3 text-sm">
                You're looking at someone's stuff. This view is read-only.
              </p>
              <div className="grid gap-5 lg:grid-cols-2">
                <section className="flex flex-col gap-4 rounded-lg border p-4">
                  <h2 className="text-xl font-semibold">Consoles</h2>
                  <ConsoleList consoles={data.consoles} />
                </section>
                <section className="flex flex-col gap-4 rounded-lg border p-4">
                  <h2 className="text-xl font-semibold">Games</h2>
                  <GameList games={data.games} />
                </section>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

interface ItemCountsProps {
  consoles: number
  games: number
}

function ItemCounts({ consoles, games }: ItemCountsProps) {
  return (
    <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
      <span>
        {games} {games === 1 ? "game" : "games"}
      </span>
      <span>
        {consoles} {consoles === 1 ? "console" : "consoles"}
      </span>
    </p>
  )
}

export default SharedCollection
