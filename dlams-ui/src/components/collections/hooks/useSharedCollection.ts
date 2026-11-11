import { useQuery } from "@tanstack/react-query"

import { sharedCollectionQueryOptions } from "@/lib/api/sharedCollections"

function useSharedCollection(token: string) {
  const { data, isPending, isError, error } = useQuery(
    sharedCollectionQueryOptions(token),
  )

  return { sharedCollection: data, isPending, isError, error }
}

export default useSharedCollection
