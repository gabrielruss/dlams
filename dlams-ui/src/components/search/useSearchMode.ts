import { useSearchParams } from "react-router-dom"

import {
  COLLECTION_PARAM,
  ITEM_PARAM,
  SEARCH_PARAM,
  itemParamValue,
} from "@/lib/urlParams"
import type { OwnedItem } from "@/types/items"

function useSearchMode() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get(SEARCH_PARAM)

  const open = () => {
    if (query !== null) return
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set(SEARCH_PARAM, "")
      next.delete(ITEM_PARAM)
      return next
    })
  }

  const setQuery = (value: string) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.set(SEARCH_PARAM, value)
        next.delete(ITEM_PARAM)
        return next
      },
      { replace: query !== null },
    )
  }

  const close = () => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete(SEARCH_PARAM)
        return next
      },
      { replace: true },
    )
  }

  const openItem = (item: OwnedItem) => {
    setSearchParams({
      [COLLECTION_PARAM]: String(item.collection_id),
      [ITEM_PARAM]: itemParamValue(item.type, item.id),
    })
  }

  return {
    isOpen: query !== null,
    query: query ?? "",
    open,
    setQuery,
    close,
    openItem,
  }
}

export default useSearchMode
