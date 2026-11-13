import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import { consolesApi } from "@/components/video-games/api/consoles"
import { consoleFormSchema, type ConsoleFormValues } from "@/schemas/consoles"
import type {
  ConsoleCreate,
  ConsoleRecord,
} from "@/components/video-games/types"
import { invalidateVideoGameCollection } from "../invalidateVideoGameCollection"

interface UseConsoleDrawerContentOptions {
  collectionId: number
  openedConsole: ConsoleRecord | undefined
  onClose: () => void
}

const emptyConsoleFormValues: ConsoleFormValues = {
  label: "",
  edition: "",
  condition: "Loose",
}

const consoleFormValues = (
  consoleRecord: ConsoleRecord,
): ConsoleFormValues => ({
  label: consoleRecord.label,
  edition: consoleRecord.edition ?? "",
  condition: consoleRecord.condition,
})

function useConsoleDrawerContent({
  collectionId,
  openedConsole,
  onClose,
}: UseConsoleDrawerContentOptions) {
  const queryClient = useQueryClient()
  const [shownConsole, setShownConsole] = useState(openedConsole)
  if (openedConsole && openedConsole !== shownConsole)
    setShownConsole(openedConsole)

  const [isEditing, setIsEditing] = useState(false)
  const form = useForm<ConsoleFormValues>({
    resolver: zodResolver(consoleFormSchema),
    defaultValues: emptyConsoleFormValues,
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

  const clearErrors = () => {
    saveMutation.reset()
    deleteMutation.reset()
  }

  const startEditing = () => {
    if (shownConsole === undefined) return
    form.reset(consoleFormValues(shownConsole))
    clearErrors()
    setIsEditing(true)
  }

  const leaveForm = () => {
    if (shownConsole === undefined) {
      onClose()
      return
    }
    clearErrors()
    setIsEditing(false)
  }

  const saveConsole = (values: ConsoleFormValues) => {
    const data: ConsoleCreate = {
      label: values.label,
      edition: values.edition || null,
      condition: values.condition,
    }
    saveMutation.mutate(
      { id: shownConsole?.id ?? null, data },
      { onSuccess: leaveForm },
    )
  }

  const deleteConsole = (consoleRecord: ConsoleRecord) => {
    const description = consoleRecord.edition
      ? `${consoleRecord.label} (${consoleRecord.edition})`
      : consoleRecord.label
    if (!window.confirm(`Delete ${description}?`)) return
    deleteMutation.reset()
    deleteMutation.mutate(consoleRecord.id, { onSuccess: onClose })
  }

  return {
    form,
    shownConsole,
    isEditing,
    formError: saveMutation.error?.message ?? null,
    deleteError: deleteMutation.error?.message ?? null,
    isDeleting: deleteMutation.isPending,
    isSaving: saveMutation.isPending,
    startEditing,
    leaveForm,
    saveConsole,
    deleteConsole,
  }
}

export default useConsoleDrawerContent
