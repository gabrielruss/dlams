import { useState } from "react"
import { useParams } from "react-router-dom"

import HomeLink from "@/components/HomeLink"
import useSharedCollection from "@/components/collections/hooks/useSharedCollection"
import SearchField from "@/components/search/SearchField"
import useListSearch from "@/components/search/hooks/useListSearch"
import ConsoleList from "@/components/video-games/ConsoleList"
import GameList from "@/components/video-games/GameList"
import {
  consoleSearchable,
  gameSearchable,
} from "@/components/video-games/videoGameOptions"
import { collectionTypeNames } from "@/types/collections"
import type { ConsoleRecord, GameRecord } from "@/components/video-games/types"

const noConsoles: ConsoleRecord[] = []
const noGames: GameRecord[] = []

function matchSummary(query: string, shown: number, total: number) {
  const typed = query.trim()
  if (!typed) return ""
  if (shown === 0) return `Nothing matches "${typed}".`
  return `${shown} of ${total} ${total === 1 ? "item" : "items"} match`
}

function SharedCollection() {
  const { token = "" } = useParams()
  const { sharedCollection, isPending, error } = useSharedCollection(token)
  const [query, setQuery] = useState("")
  const allConsoles = sharedCollection?.consoles ?? noConsoles
  const allGames = sharedCollection?.games ?? noGames
  const consoles = useListSearch(allConsoles, consoleSearchable, query)
  const games = useListSearch(allGames, gameSearchable, query)
  const searching = query.trim() !== ""

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <meta name="robots" content="noindex" />
      <meta name="referrer" content="no-referrer" />
      <header className="flex h-14 shrink-0 items-center border-b bg-sidebar px-4 md:hidden">
        <HomeLink
          className="relative block h-9 w-40"
          wordmarkClassName="absolute inset-0"
        />
      </header>
      <aside
        aria-label="Shared collection"
        className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground sm:w-64 md:flex"
      >
        <HomeLink
          className="relative block h-[4.75rem] shrink-0 border-b"
          wordmarkClassName="absolute inset-x-4 inset-y-0"
        />
        {sharedCollection && (
          <div className="flex flex-col gap-1 p-4">
            <p className="font-medium">{sharedCollection.name}</p>
            <p className="text-xs text-muted-foreground">
              {collectionTypeNames[sharedCollection.type]}
            </p>
            <ItemCounts
              consoles={sharedCollection.consoles.length}
              games={sharedCollection.games.length}
            />
          </div>
        )}
      </aside>
      <main className="min-w-0 flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
          {isPending ? (
            <p>Loading collection...</p>
          ) : !sharedCollection ? (
            <div role="alert" className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold">Nothing to see here</h1>
              <p>{error && error.message}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold md:text-3xl">
                  {sharedCollection.name}
                </h1>
                <div className="md:hidden">
                  <ItemCounts
                    consoles={sharedCollection.consoles.length}
                    games={sharedCollection.games.length}
                  />
                </div>
              </div>
              <p className="rounded-md border p-3 text-sm">
                You're looking at someone's stuff. This view is read-only.
              </p>
              <div role="search" className="flex flex-col gap-2">
                <SearchField
                  label="Search this collection"
                  value={query}
                  onChange={setQuery}
                  onEscape={() => setQuery("")}
                />
                <p role="status" className="text-sm text-muted-foreground">
                  {matchSummary(
                    query,
                    consoles.length + games.length,
                    allConsoles.length + allGames.length,
                  )}
                </p>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <section className="flex flex-col gap-4 rounded-lg border p-4">
                  <h2 className="text-xl font-semibold">Consoles</h2>
                  <ConsoleList
                    consoles={consoles}
                    emptyMessage={searching ? "No consoles match." : undefined}
                  />
                </section>
                <section className="flex flex-col gap-4 rounded-lg border p-4">
                  <h2 className="text-xl font-semibold">Games</h2>
                  <GameList
                    games={games}
                    emptyMessage={searching ? "No games match." : undefined}
                  />
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
