import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import { gamesApi } from "@/components/video-games/api/games"
import { gameFormSchema, type GameFormValues } from "@/schemas/games"
import type { GameCreate, GameRecord } from "@/components/video-games/types"
import { invalidateVideoGameCollection } from "../invalidateVideoGameCollection"

interface UseGameDrawerContentOptions {
  collectionId: number
  openedGame: GameRecord | undefined
  onClose: () => void
}

const emptyGameFormValues: GameFormValues = {
  name: "",
  condition: "Loose",
  consoleLabel: "",
  lastPlayed: "",
  completed: false,
}

const gameFormValues = (game: GameRecord): GameFormValues => ({
  name: game.name,
  condition: game.condition,
  consoleLabel: game.console_label,
  lastPlayed: game.last_played ?? "",
  completed: game.completed,
})

function useGameDrawerContent({
  collectionId,
  openedGame,
  onClose,
}: UseGameDrawerContentOptions) {
  const queryClient = useQueryClient()
  const [shownGame, setShownGame] = useState(openedGame)
  if (openedGame && openedGame !== shownGame) setShownGame(openedGame)

  const [isEditing, setIsEditing] = useState(false)
  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: emptyGameFormValues,
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

  const clearErrors = () => {
    saveMutation.reset()
    deleteMutation.reset()
  }

  const startEditing = () => {
    if (shownGame === undefined) return
    form.reset(gameFormValues(shownGame))
    clearErrors()
    setIsEditing(true)
  }

  const leaveForm = () => {
    if (shownGame === undefined) {
      onClose()
      return
    }
    clearErrors()
    setIsEditing(false)
  }

  const saveGame = (values: GameFormValues) => {
    const data: GameCreate = {
      name: values.name,
      condition: values.condition,
      console_label: values.consoleLabel,
      last_played: values.lastPlayed || null,
      completed: values.completed,
    }
    saveMutation.mutate(
      { id: shownGame?.id ?? null, data },
      { onSuccess: leaveForm },
    )
  }

  const deleteGame = (game: GameRecord) => {
    if (!window.confirm(`Delete "${game.name}"? This cannot be undone.`)) return
    deleteMutation.reset()
    deleteMutation.mutate(game.id, { onSuccess: onClose })
  }

  return {
    form,
    shownGame,
    isEditing,
    formError: saveMutation.error?.message ?? null,
    deleteError: deleteMutation.error?.message ?? null,
    isDeleting: deleteMutation.isPending,
    isSaving: saveMutation.isPending,
    startEditing,
    leaveForm,
    saveGame,
    deleteGame,
  }
}

export default useGameDrawerContent
