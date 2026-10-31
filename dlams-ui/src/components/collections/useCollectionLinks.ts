import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  linkKeys,
  linkListQueryOptions,
  linksApi,
} from "@/lib/api/collectionLinks"

function useCollectionLinks(collectionId: number) {
  const queryClient = useQueryClient()
  const linksQuery = useQuery(linkListQueryOptions(collectionId))
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: linkKeys.list(collectionId) })

  const createMutation = useMutation({
    mutationFn: (name: string | null) => linksApi.create(collectionId, name),
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({
    mutationFn: (linkId: number) => linksApi.delete(collectionId, linkId),
    onSuccess: invalidate,
  })

  return {
    links: linksQuery.data?.links ?? [],
    isPending: linksQuery.isPending,
    error: linksQuery.error,
    createMutation,
    deleteMutation,
  }
}

export default useCollectionLinks
