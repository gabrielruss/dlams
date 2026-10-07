import { useState } from "react"
import { useForm } from "react-hook-form"

import { gamesApi } from "@/lib/api/games"
import type {
  ConsoleRecord,
  GameCreate,
  GameRecord,
  VideoGameCondition,
} from "@/types/videoGames"
import { isVideoGameCondition } from "./videoGameOptions"

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
  onChanged: () => Promise<void>
}

function useGameManager({
  collectionId,
  consoles,
  onChanged,
}: UseGameManagerOptions) {
  const consoleLabels = Array.from(
    new Map(
      consoles.map((consoleRecord) => [
        consoleRecord.console_label_id,
        { id: consoleRecord.console_label_id, name: consoleRecord.label },
      ]),
    ).values(),
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
  const [formError, setFormError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const resetForm = () => {
    form.reset()
    setEditingId(null)
    setIsDrawerOpen(false)
    setFormError(null)
  }

  const saveGame = async (values: GameFormValues) => {
    setFormError(null)
    try {
      const data: GameCreate = {
        name: values.name.trim(),
        condition: values.condition,
        console_label_id: Number(values.consoleLabelId),
        last_played: values.lastPlayed || null,
        completed: values.completed,
      }
      if (editingId === null) {
        await gamesApi.create(collectionId, data)
      } else {
        await gamesApi.update(collectionId, editingId, data)
      }
      resetForm()
      await onChanged()
    } catch (saveError) {
      setFormError(
        saveError instanceof Error ? saveError.message : "Could not save game",
      )
    }
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
    setFormError(null)
    setIsDrawerOpen(true)
  }

  const startNewGame = () => {
    resetForm()
    setIsDrawerOpen(true)
  }

  const deleteGame = async (game: GameRecord) => {
    if (!window.confirm(`Delete "${game.name}"? This cannot be undone.`)) return

    setListError(null)
    try {
      await gamesApi.delete(collectionId, game.id)
      await onChanged()
    } catch (deleteError) {
      setListError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete game",
      )
    }
  }

  return {
    consoleLabels,
    form,
    editingId,
    formError,
    listError,
    isDrawerOpen,
    resetForm,
    saveGame,
    editGame,
    startNewGame,
    deleteGame,
    isVideoGameCondition,
  }
}

export default useGameManager
