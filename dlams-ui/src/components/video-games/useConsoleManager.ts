import { useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import useItemEditor from "@/components/collections/useItemEditor"
import { consolesApi } from "@/lib/api/consoles"
import type {
  ConsoleCreate,
  ConsoleRecord,
  VideoGameCondition,
} from "@/types/videoGames"
import { invalidateVideoGameCollection } from "./invalidateVideoGameCollection"

interface ConsoleFormValues {
  label: string
  edition: string
  condition: VideoGameCondition
}

interface UseConsoleManagerOptions {
  collectionId: number
  consoles: ConsoleRecord[]
}

const consoleFormValues = (
  consoleRecord: ConsoleRecord,
): ConsoleFormValues => ({
  label: consoleRecord.label,
  edition: consoleRecord.edition ?? "",
  condition: consoleRecord.condition,
})

function useConsoleManager({
  collectionId,
  consoles,
}: UseConsoleManagerOptions) {
  const queryClient = useQueryClient()
  const form = useForm<ConsoleFormValues>({
    defaultValues: { label: "", edition: "", condition: "Loose" },
  })

  const saveMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | null; data: ConsoleCreate }) =>
      id === null
        ? consolesApi.create(collectionId, data)
        : consolesApi.update(collectionId, id, data),
    onSuccess: () => invalidateVideoGameCollection(queryClient, collectionId),
  })
  const deleteMutation = useMutation({
    mutationFn: (consoleId: number) =>
      consolesApi.delete(collectionId, consoleId),
    onSuccess: () => invalidateVideoGameCollection(queryClient, collectionId),
  })

  const { reset: resetSave } = saveMutation
  const { reset: resetDelete } = deleteMutation
  const clearErrors = useCallback(() => {
    resetSave()
    resetDelete()
  }, [resetSave, resetDelete])

  const { openedItem, openedItemId, isEditorOpen, open, startNew, close } =
    useItemEditor({
      type: "console",
      items: consoles,
      form,
      toFormValues: consoleFormValues,
      onReset: clearErrors,
    })

  const saveConsole = (values: ConsoleFormValues) => {
    const data: ConsoleCreate = {
      label: values.label.trim(),
      edition: values.edition.trim() || null,
      condition: values.condition,
    }
    saveMutation.mutate({ id: openedItemId, data }, { onSuccess: close })
  }

  const deleteConsole = (consoleRecord: ConsoleRecord) => {
    const description = consoleRecord.edition
      ? `${consoleRecord.label} (${consoleRecord.edition})`
      : consoleRecord.label
    if (!window.confirm(`Delete ${description}?`)) return
    deleteMutation.reset()
    deleteMutation.mutate(consoleRecord.id, { onSuccess: close })
  }

  return {
    form,
    openedItemId,
    openedConsole: openedItem,
    formError: saveMutation.error?.message ?? null,
    deleteError: deleteMutation.error?.message ?? null,
    isDeleting: deleteMutation.isPending,
    isDrawerOpen: isEditorOpen,
    isSaving: saveMutation.isPending,
    resetForm: close,
    saveConsole,
    openConsole: open,
    startNewConsole: startNew,
    deleteConsole,
  }
}

export default useConsoleManager
