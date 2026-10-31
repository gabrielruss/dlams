import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

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
}

function useConsoleManager({ collectionId }: UseConsoleManagerOptions) {
  const queryClient = useQueryClient()
  const form = useForm<ConsoleFormValues>({
    defaultValues: { label: "", edition: "", condition: "Loose" },
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const saveMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | null
      data: ConsoleCreate
    }) =>
      id === null
        ? consolesApi.create(collectionId, data)
        : consolesApi.update(collectionId, id, data),
    onSuccess: () =>
      invalidateVideoGameCollection(queryClient, collectionId),
  })
  const deleteMutation = useMutation({
    mutationFn: (consoleId: number) =>
      consolesApi.delete(collectionId, consoleId),
    onSuccess: () =>
      invalidateVideoGameCollection(queryClient, collectionId),
  })

  const resetForm = () => {
    form.reset()
    setEditingId(null)
    setIsDrawerOpen(false)
    saveMutation.reset()
    deleteMutation.reset()
  }

  const saveConsole = (values: ConsoleFormValues) => {
    const data: ConsoleCreate = {
      label: values.label.trim(),
      edition: values.edition.trim() || null,
      condition: values.condition,
    }
    saveMutation.mutate(
      { id: editingId, data },
      { onSuccess: resetForm }
    )
  }

  const editConsole = (consoleRecord: ConsoleRecord) => {
    setEditingId(consoleRecord.id)
    form.reset({
      label: consoleRecord.label,
      edition: consoleRecord.edition ?? "",
      condition: consoleRecord.condition,
    })
    saveMutation.reset()
    setIsDrawerOpen(true)
  }

  const startNewConsole = () => {
    form.reset()
    setEditingId(null)
    saveMutation.reset()
    setIsDrawerOpen(true)
  }

  const deleteConsole = (consoleRecord: ConsoleRecord) => {
    const description = consoleRecord.edition
      ? `${consoleRecord.label} (${consoleRecord.edition})`
      : consoleRecord.label
    if (!window.confirm(`Delete ${description}?`)) return
    deleteMutation.reset()
    deleteMutation.mutate(consoleRecord.id, { onSuccess: resetForm })
  }

  return {
    form,
    editingId,
    formError: saveMutation.error?.message ?? null,
    deleteError: deleteMutation.error?.message ?? null,
    isDeleting: deleteMutation.isPending,
    isDrawerOpen,
    isSaving: saveMutation.isPending,
    resetForm,
    saveConsole,
    editConsole,
    startNewConsole,
    deleteConsole,
  }
}

export default useConsoleManager
