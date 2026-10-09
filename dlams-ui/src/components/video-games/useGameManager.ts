import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import { gamesApi } from "@/lib/api/games"
import type {
  ConsoleRecord,
  GameCreate,
  GameRecord,
  VideoGameCondition,
} from "@/types/videoGames"
import { isVideoGameCondition } from "./videoGameOptions"
import { invalidateVideoGameCollection } from "./invalidateVideoGameCollection"

interface GameFormValues {
  name: string
  condition: VideoGameCondition
  consoleLabelId: string
  lastPlayed: string
  completed: boolean
}

interface UseGameManagerOptions {
  collectionId: number
  consoles: ConsoleRecord[]
}

function useGameManager({
  collectionId,
  consoles,
}: UseGameManagerOptions) {
  const queryClient = useQueryClient()
  const consoleLabels = Array.from(
    new Map(
      consoles.map((consoleRecord) => [
        consoleRecord.console_label_id,
        { id: consoleRecord.console_label_id, name: consoleRecord.label },
      ])
    ).values()
  )
  const form = useForm<GameFormValues>({
    defaultValues: {
      name: "",
      condition: "Loose",
      consoleLabelId: "",
      lastPlayed: "",
      completed: false,
    },
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const saveMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | null
      data: GameCreate
    }) =>
      id === null
        ? gamesApi.create(collectionId, data)
        : gamesApi.update(collectionId, id, data),
    onSuccess: () =>
      invalidateVideoGameCollection(queryClient, collectionId),
  })
  const deleteMutation = useMutation({
    mutationFn: (gameId: number) => gamesApi.delete(collectionId, gameId),
    onSuccess: () =>
      invalidateVideoGameCollection(queryClient, collectionId),
  })

  const resetForm = () => {
    form.reset()
    setEditingId(null)
    setIsDrawerOpen(false)
    saveMutation.reset()
  }

  const saveGame = (values: GameFormValues) => {
    const data: GameCreate = {
      name: values.name.trim(),
      condition: values.condition,
      console_label_id: Number(values.consoleLabelId),
      last_played: values.lastPlayed || null,
      completed: values.completed,
    }
    saveMutation.mutate(
      { id: editingId, data },
      { onSuccess: resetForm }
    )
  }

  const editGame = (game: GameRecord) => {
    setEditingId(game.id)
    form.reset({
      name: game.name,
      condition: game.condition,
      consoleLabelId: String(game.console_label_id),
      lastPlayed: game.last_played ?? "",
      completed: game.completed,
    })
    saveMutation.reset()
    setIsDrawerOpen(true)
  }

  const startNewGame = () => {
    resetForm()
    setIsDrawerOpen(true)
  }

  const deleteGame = (game: GameRecord) => {
    if (!window.confirm(`Delete "${game.name}"? This cannot be undone.`)) return
    deleteMutation.reset()
    deleteMutation.mutate(game.id)
  }

  return {
    consoleLabels,
    form,
    editingId,
    formError: saveMutation.error?.message ?? null,
    listError: deleteMutation.error?.message ?? null,
    isDrawerOpen,
    isSaving: saveMutation.isPending,
    resetForm,
    saveGame,
    editGame,
    startNewGame,
    deleteGame,
    isVideoGameCondition,
  }
}

export default useGameManager
