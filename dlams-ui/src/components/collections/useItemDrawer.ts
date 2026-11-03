import { useState } from "react"

import type { ItemType } from "@/types/items"
import useOpenItem from "./useOpenItem"

interface UseItemDrawerOptions<Item extends { id: number }> {
  type: ItemType
  items: Item[]
}

function useItemDrawer<Item extends { id: number }>({
  type,
  items,
}: UseItemDrawerOptions<Item>) {
  const { openItemId, openItem, closeItem } = useOpenItem(type)
  const [isAdding, setIsAdding] = useState(false)
  const openedItem = isAdding
    ? undefined
    : items.find((item) => item.id === openItemId)

  return {
    openedItem,
    isDrawerOpen: isAdding || openedItem !== undefined,
    open: (item: Item) => openItem(item.id),
    startAdding: () => setIsAdding(true),
    close: () => {
      setIsAdding(false)
      if (openItemId !== undefined) closeItem()
    },
  }
}

export default useItemDrawer
