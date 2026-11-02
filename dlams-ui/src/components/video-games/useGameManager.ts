import { useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import useItemEditor from "@/components/collections/useItemEditor"
import { gamesApi } from "@/lib/api/games"
import type {
  GameCreate,
  GameRecord,
  VideoGameCondition,
} from "@/types/videoGames"
import { isVideoGameCondition } from "./videoGameOptions"
import { invalidateVideoGameCollection } from "./invalidateVideoGameCollection"

interface GameFormValues {
  name: string
  condition: VideoGameCondition
  consoleLabel: string
  lastPlayed: string
  completed: boolean
}

interface UseGameManagerOptions {
  collectionId: number
  games: GameRecord[]
}

const gameFormValues = (game: GameRecord): GameFormValues => ({
  name: game.name,
  condition: game.condition,
  consoleLabel: game.console_label,
  lastPlayed: game.last_played ?? "",
  completed: game.completed,
})

function useGameManager({ collectionId, games }: UseGameManagerOptions) {
  const queryClient = useQueryClient()
  const form = useForm<GameFormValues>({
    defaultValues: {
      name: "",
      condition: "Loose",
      consoleLabel: "",
      lastPlayed: "",
      completed: false,
    },
  })

  const saveMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | null; data: GameCreate }) =>
      id === null
        ? gamesApi.create(collectionId, data)
        : gamesApi.update(collectionId, id, data),
    onSuccess: () => invalidateVideoGameCollection(queryClient, collectionId),
  })
  const deleteMutation = useMutation({
    mutationFn: (gameId: number) => gamesApi.delete(collectionId, gameId),
    onSuccess: () => invalidateVideoGameCollection(queryClient, collectionId),
  })

  const { reset: resetSave } = saveMutation
  const { reset: resetDelete } = deleteMutation
  const clearErrors = useCallback(() => {
    resetSave()
    resetDelete()
  }, [resetSave, resetDelete])

  const { editingItem, editingId, isEditorOpen, edit, startNew, close } =
    useItemEditor({
      type: "game",
      items: games,
      form,
      toFormValues: gameFormValues,
      onReset: clearErrors,
    })

  const saveGame = (values: GameFormValues) => {
    const data: GameCreate = {
      name: values.name.trim(),
      condition: values.condition,
      console_label: values.consoleLabel.trim(),
      last_played: values.lastPlayed || null,
      completed: values.completed,
    }
    saveMutation.mutate({ id: editingId, data }, { onSuccess: close })
  }

  const deleteGame = (game: GameRecord) => {
    if (!window.confirm(`Delete "${game.name}"? This cannot be undone.`)) return
    deleteMutation.reset()
    deleteMutation.mutate(game.id, { onSuccess: close })
  }

  return {
    form,
    editingId,
    editingGame: editingItem,
    formError: saveMutation.error?.message ?? null,
    deleteError: deleteMutation.error?.message ?? null,
    isDeleting: deleteMutation.isPending,
    isDrawerOpen: isEditorOpen,
    isSaving: saveMutation.isPending,
    resetForm: close,
    saveGame,
    editGame: edit,
    startNewGame: startNew,
    deleteGame,
    isVideoGameCondition,
  }
}

export default useGameManager
