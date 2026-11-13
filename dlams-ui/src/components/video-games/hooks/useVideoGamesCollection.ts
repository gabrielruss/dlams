import { useQuery } from "@tanstack/react-query"

import { consoleListQueryOptions } from "@/components/video-games/api/consoles"
import { gameListQueryOptions } from "@/components/video-games/api/games"

function useVideoGamesCollection(collectionId: number) {
  const consolesQuery = useQuery(consoleListQueryOptions(collectionId))
  const gamesQuery = useQuery(gameListQueryOptions(collectionId))

  return {
    consoles: consolesQuery.data?.consoles ?? [],
    games: gamesQuery.data?.games ?? [],
    isPending: consolesQuery.isPending || gamesQuery.isPending,
    isError: consolesQuery.isError || gamesQuery.isError,
    error: consolesQuery.error ?? gamesQuery.error,
  }
}

export default useVideoGamesCollection
