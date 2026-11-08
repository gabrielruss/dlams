import { useMutation, useQueryClient } from "@tanstack/react-query"

import { collectionKeys, collectionsApi } from "@/lib/api/collections"
import { consoleLabelKeys } from "@/lib/api/consoleLabels"
import { itemKeys } from "@/lib/api/items"
import { videoGameStatsKeys } from "@/lib/api/videoGameStats"

function useManageCollection(collectionId: number) {
  const queryClient = useQueryClient()

  const renameMutation = useMutation({
    mutationFn: (name: string) =>
      collectionsApi.update(collectionId, { name: name.trim() }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: collectionKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: itemKeys.all }),
      ]),
  })

  const deleteMutation = useMutation({
    mutationFn: () => collectionsApi.delete(collectionId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: collectionKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: videoGameStatsKeys.all }),
        queryClient.invalidateQueries({ queryKey: itemKeys.all }),
        queryClient.invalidateQueries({ queryKey: consoleLabelKeys.all }),
      ]),
  })

  return { renameMutation, deleteMutation }
}

export default useManageCollection
