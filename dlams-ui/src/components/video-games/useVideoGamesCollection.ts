import { useCallback, useEffect, useState } from "react"

import { consolesApi } from "@/lib/api/consoles"
import { gamesApi } from "@/lib/api/games"
import type { Collection } from "@/types/collections"
import type { ConsoleRecord, GameRecord } from "@/types/videoGames"

function useVideoGamesCollection(collection: Collection) {
  const [consoles, setConsoles] = useState<ConsoleRecord[]>([])
  const [games, setGames] = useState<GameRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadItems = useCallback(async () => {
    setError(null)
    try {
      const [consoleResponse, gameResponse] = await Promise.all([
        consolesApi.list(collection.id),
        gamesApi.list(collection.id),
      ])
      setConsoles(consoleResponse.consoles)
      setGames(gameResponse.games)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load collection items",
      )
    } finally {
      setIsLoading(false)
    }
  }, [collection.id])

  useEffect(() => {
    setIsLoading(true)
    loadItems()
  }, [loadItems])

  return { consoles, games, isLoading, error, loadItems }
}

export default useVideoGamesCollection
