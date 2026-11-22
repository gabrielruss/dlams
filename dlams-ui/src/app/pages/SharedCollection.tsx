import { useState } from "react"
import { useParams } from "react-router-dom"

import PageShell from "@/app/PageShell"
import SidebarFrame from "@/app/SidebarFrame"
import PageHeading from "@/components/PageHeading"
import { Alert, AlertDescription } from "@/components/ui/alert"
import useSharedCollection from "@/features/collections/hooks/useSharedCollection"
import SearchField from "@/features/search/SearchField"
import useListSearch from "@/features/search/hooks/useListSearch"
import ConsoleList from "@/features/video-games/ConsoleList"
import GameList from "@/features/video-games/GameList"
import VideoGameCounts from "@/features/video-games/VideoGameCounts"
import {
  consoleSearchable,
  gameSearchable,
} from "@/features/video-games/videoGameOptions"
import { collectionTypeNames } from "@/types/collections"
import type { ConsoleRecord, GameRecord } from "@/features/video-games/types"

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
    <>
      <meta name="robots" content="noindex" />
      <meta name="referrer" content="no-referrer" />
      <PageShell
        sidebar={
          <SidebarFrame label="Shared collection">
            {sharedCollection && (
              <div className="flex flex-col gap-1 p-4">
                <p className="font-medium">{sharedCollection.name}</p>
                <p className="text-xs text-muted-foreground">
                  {collectionTypeNames[sharedCollection.type]}
                </p>
                <VideoGameCounts
                  consoles={sharedCollection.consoles.length}
                  games={sharedCollection.games.length}
                />
              </div>
            )}
          </SidebarFrame>
        }
      >
        {isPending ? (
          <p>Loading collection...</p>
        ) : !sharedCollection ? (
          <>
            <PageHeading>Nothing to see here</PageHeading>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <PageHeading>{sharedCollection.name}</PageHeading>
              <div className="md:hidden">
                <VideoGameCounts
                  consoles={sharedCollection.consoles.length}
                  games={sharedCollection.games.length}
                />
              </div>
            </div>
            <Alert role="note">
              <AlertDescription>
                You're looking at someone's stuff. This view is read-only.
              </AlertDescription>
            </Alert>
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
      </PageShell>
    </>
  )
}

export default SharedCollection
