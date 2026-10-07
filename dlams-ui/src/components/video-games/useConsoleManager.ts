import { useState } from "react"
import { useForm } from "react-hook-form"

import { consolesApi } from "@/lib/api/consoles"
import type { ConsoleCreate, ConsoleRecord, VideoGameCondition } from "@/types/videoGames"

interface ConsoleFormValues {
  label: string
  edition: string
  condition: VideoGameCondition
}

interface UseConsoleManagerOptions {
  collectionId: number
  onChanged: () => Promise<void>
}

function useConsoleManager({
  collectionId,
  onChanged,
}: UseConsoleManagerOptions) {
  const form = useForm<ConsoleFormValues>({
    defaultValues: { label: "", edition: "", condition: "Loose" },
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const resetForm = () => {
    form.reset()
    setEditingId(null)
    setIsDrawerOpen(false)
    setFormError(null)
  }

  const saveConsole = async (values: ConsoleFormValues) => {
    setFormError(null)
    try {
      const data: ConsoleCreate = {
        label: values.label.trim(),
        edition: values.edition.trim() || null,
        condition: values.condition,
      }
      if (editingId === null) {
        await consolesApi.create(collectionId, data)
      } else {
        await consolesApi.update(collectionId, editingId, data)
      }
      resetForm()
      await onChanged()
    } catch (saveError) {
      setFormError(
        saveError instanceof Error ? saveError.message : "Could not save console"
      )
    }
  }

  const editConsole = (consoleRecord: ConsoleRecord) => {
    setEditingId(consoleRecord.id)
    form.reset({
      label: consoleRecord.label,
      edition: consoleRecord.edition ?? "",
      condition: consoleRecord.condition,
    })
    setFormError(null)
    setIsDrawerOpen(true)
  }

  const startNewConsole = () => {
    form.reset()
    setEditingId(null)
    setFormError(null)
    setIsDrawerOpen(true)
  }

  const deleteConsole = async (consoleRecord: ConsoleRecord) => {
    const description = consoleRecord.edition
      ? `${consoleRecord.label} (${consoleRecord.edition})`
      : consoleRecord.label
    if (!window.confirm(`Delete ${description}?`)) return

    setListError(null)
    try {
      await consolesApi.delete(collectionId, consoleRecord.id)
      await onChanged()
    } catch (deleteError) {
      setListError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete console"
      )
    }
  }

  return {
    form,
    editingId,
    formError,
    listError,
    isDrawerOpen,
    resetForm,
    saveConsole,
    editConsole,
    startNewConsole,
    deleteConsole,
  }
}

export default useConsoleManager
