import { useEffect, useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"

import {
  collectionKeys,
  collectionListQueryOptions,
  collectionsApi,
} from "@/lib/api/collections"
import { videoGameStatsKeys } from "@/lib/api/videoGameStats"
import { defaultCollectionType } from "@/types/collections"

const SELECTED_COLLECTION_PARAM = "collection"

function useCollections() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const collectionsQuery = useQuery(collectionListQueryOptions())
  const selectedCollectionId = useMemo(() => {
    const value = searchParams.get(SELECTED_COLLECTION_PARAM)
    if (!value) return undefined
    const id = Number(value)
    return Number.isInteger(id) && id > 0 ? id : undefined
  }, [searchParams])
  const collections = useMemo(
    () => collectionsQuery.data?.collections ?? [],
    [collectionsQuery.data?.collections]
  )
  const selectedCollection = collections.find(
    (collection) => collection.id === selectedCollectionId
  )

  useEffect(() => {
    if (!collectionsQuery.isSuccess) return
    if (
      selectedCollectionId !== undefined &&
      collections.some((collection) => collection.id === selectedCollectionId)
    ) {
      return
    }

    const firstCollectionId = collections[0]?.id
    const currentCollectionParam = searchParams.get(SELECTED_COLLECTION_PARAM)
    const nextCollectionParam =
      firstCollectionId === undefined ? null : String(firstCollectionId)
    if (currentCollectionParam === nextCollectionParam) return

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (firstCollectionId === undefined) {
          next.delete(SELECTED_COLLECTION_PARAM)
        } else {
          next.set(SELECTED_COLLECTION_PARAM, String(firstCollectionId))
        }
        return next
      },
      { replace: true }
    )
  }, [
    collections,
    collectionsQuery.isSuccess,
    searchParams,
    selectedCollectionId,
    setSearchParams,
  ])

  const setSelectedCollectionId = (id: number | undefined) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (id === undefined) {
        next.delete(SELECTED_COLLECTION_PARAM)
      } else {
        next.set(SELECTED_COLLECTION_PARAM, String(id))
      }
      return next
    })
  }

  const createCollectionMutation = useMutation({
    mutationFn: (name: string) =>
      collectionsApi.create({ name, type: defaultCollectionType }),
    onSuccess: async (collection) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: collectionKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: videoGameStatsKeys.all }),
      ])
      setSelectedCollectionId(collection.id)
    },
  })

  return {
    collections,
    selectedCollection,
    selectedCollectionId,
    setSelectedCollectionId,
    collectionsQuery,
    createCollectionMutation,
  }
}

export default useCollections
