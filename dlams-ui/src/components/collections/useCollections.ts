import { useEffect, useState } from "react"

import { collectionsApi } from "@/lib/api/collections"
import {
  defaultCollectionType,
  type Collection,
} from "@/types/collections"

function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollectionId, setSelectedCollectionId] = useState<number>()
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const selectedCollection = collections.find(
    (collection) => collection.id === selectedCollectionId
  )

  useEffect(() => {
    let active = true

    collectionsApi
      .list()
      .then(({ collections: loadedCollections }) => {
        if (!active) return
        setCollections(loadedCollections)
        setSelectedCollectionId(loadedCollections[0]?.id)
      })
      .catch((loadError: unknown) => {
        if (active) {
          setLoadError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load collections"
          )
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const createCollection = async (name: string): Promise<boolean> => {
    setCreateError(null)
    setIsCreating(true)
    try {
      const collection = await collectionsApi.create({
        name,
        type: defaultCollectionType,
      })
      setCollections((current) => [...current, collection])
      setSelectedCollectionId(collection.id)
      return true
    } catch (createError) {
      setCreateError(
        createError instanceof Error
          ? createError.message
          : "Could not create collection"
      )
      return false
    } finally {
      setIsCreating(false)
    }
  }

  return {
    collections,
    selectedCollection,
    selectedCollectionId,
    setSelectedCollectionId,
    isLoading,
    loadError,
    isCreating,
    createError,
    clearCreateError: () => setCreateError(null),
    createCollection,
  }
}

export default useCollections
