import { useEffect, useRef, useState } from "react"
import type { FieldValues, UseFormReturn } from "react-hook-form"

import type { ItemType } from "@/types/items"
import useOpenItem from "./useOpenItem"

interface UseItemEditorOptions<
  Item extends { id: number },
  Values extends FieldValues,
> {
  type: ItemType
  items: Item[]
  form: UseFormReturn<Values>
  toFormValues: (item: Item) => Values
  onReset: () => void
}

function useItemEditor<
  Item extends { id: number },
  Values extends FieldValues,
>({
  type,
  items,
  form,
  toFormValues,
  onReset,
}: UseItemEditorOptions<Item, Values>) {
  const { openItemId, openItem, closeItem } = useOpenItem(type)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const openedItem = isAdding
    ? undefined
    : items.find((item) => item.id === openItemId)
  const loadedItemId = useRef<number | null>(null)

  // if an item id is found in the url params, load it into the form
  useEffect(() => {
    if (openedItem === undefined) {
      loadedItemId.current = null
      setIsEditing(false)
      return
    }
    if (loadedItemId.current === openedItem.id) return // unless it is already loaded
    loadedItemId.current = openedItem.id
    setIsEditing(false)
    form.reset(toFormValues(openedItem))
    onReset()
  }, [openedItem, form, toFormValues, onReset])

  const close = () => {
    form.reset()
    setIsAdding(false)
    onReset()
    if (openItemId !== undefined) closeItem()
  }

  const startNew = () => {
    form.reset()
    onReset()
    setIsAdding(true)
  }

  const open = (item: Item) => openItem(item.id)

  const startEditing = () => {
    if (openedItem === undefined) return
    form.reset(toFormValues(openedItem))
    onReset()
    setIsEditing(true)
  }

  const stopEditing = () => {
    onReset()
    setIsEditing(false)
  }

  return {
    openedItem,
    openedItemId: openedItem?.id ?? null,
    isEditorOpen: isAdding || openedItem !== undefined,
    isViewing: openedItem !== undefined && !isEditing,
    open,
    startNew,
    startEditing,
    stopEditing,
    close,
  }
}

export default useItemEditor
