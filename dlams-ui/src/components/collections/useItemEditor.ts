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
  const editingItem = isAdding
    ? undefined
    : items.find((item) => item.id === openItemId)
  const loadedItemId = useRef<number | null>(null)

  // if an item id is found in the url params, load it into the form
  useEffect(() => {
    if (editingItem === undefined) {
      loadedItemId.current = null
      return
    }
    if (loadedItemId.current === editingItem.id) return // unless it is already loaded
    loadedItemId.current = editingItem.id
    form.reset(toFormValues(editingItem))
    onReset()
  }, [editingItem, form, toFormValues, onReset])

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

  const edit = (item: Item) => openItem(item.id)

  return {
    editingItem,
    editingId: editingItem?.id ?? null,
    isEditorOpen: isAdding || editingItem !== undefined,
    edit,
    startNew,
    close,
  }
}

export default useItemEditor
