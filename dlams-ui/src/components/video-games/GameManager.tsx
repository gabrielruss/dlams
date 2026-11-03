import { useRef } from "react"
import { Controller } from "react-hook-form"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import type { GameRecord } from "@/types/videoGames"
import { videoGameConditions } from "@/types/videoGames"
import ConsoleLabelCombobox from "./ConsoleLabelCombobox"
import GameList from "./GameList"
import useConsoleLabels from "./useConsoleLabels"
import useGameManager from "./useGameManager"

interface GameManagerProps {
  collectionId: number
  games: GameRecord[]
  canWrite: boolean
}

function GameManager({ collectionId, games, canWrite }: GameManagerProps) {
  const {
    form,
    openedItemId,
    openedGame,
    formError,
    deleteError,
    isDeleting,
    isDrawerOpen,
    isSaving,
    resetForm,
    saveGame,
    openGame,
    startNewGame,
    deleteGame,
    isVideoGameCondition,
  } = useGameManager({ collectionId, games })
  const consoleLabelOptions = useConsoleLabels(canWrite)
  const drawerRef = useRef<HTMLDivElement>(null)
  const name = form.watch("name")
  const consoleLabel = form.watch("consoleLabel")

  return (
    <section className="flex flex-col gap-4 rounded-lg border p-4">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Games</h2>
        {canWrite && (
          <button
            className="h-9 rounded-md bg-primary px-4 text-primary-foreground"
            type="button"
            onClick={startNewGame}
          >
            Add game
          </button>
        )}
      </header>
      {canWrite && (
        <Drawer
          open={isDrawerOpen}
          direction="right"
          onOpenChange={(open: boolean) => {
            if (!open) resetForm()
          }}
        >
          <DrawerContent ref={drawerRef}>
            <DrawerHeader className="flex-row items-center justify-between border-b">
              <DrawerTitle className="text-xl">
                {openedItemId === null ? "Add game" : "Edit game"}
              </DrawerTitle>
              <DrawerClose asChild>
                <button
                  className="rounded-md border px-3 py-2 text-sm md:py-1"
                  type="button"
                  aria-label="Close drawer"
                >
                  Close
                </button>
              </DrawerClose>
            </DrawerHeader>
            <form
              onSubmit={form.handleSubmit(saveGame)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
                {openedGame && (
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      className="text-destructive"
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Delete game"
                      title="Delete game"
                      disabled={isDeleting}
                      onClick={() => deleteGame(openedGame)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                    {deleteError && (
                      <p
                        role="alert"
                        className="self-stretch text-sm text-destructive"
                      >
                        {deleteError}
                      </p>
                    )}
                  </div>
                )}
                <label className="flex flex-col gap-1 text-sm">
                  Game name
                  <input
                    className="h-9 rounded-md border bg-background px-3"
                    {...form.register("name", {
                      required: "Game name is required",
                      maxLength: {
                        value: 200,
                        message: "Game name must be 200 characters or fewer",
                      },
                    })}
                    autoFocus
                  />
                </label>
                {form.formState.errors.name && (
                  <p role="alert" className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
                <div className="flex flex-col gap-1 text-sm">
                  <label htmlFor="game-console">Console</label>
                  <Controller
                    control={form.control}
                    name="consoleLabel"
                    rules={{
                      required: "Console is required",
                      maxLength: {
                        value: 100,
                        message: "Console must be 100 characters or fewer",
                      },
                    }}
                    render={({ field }) => (
                      <ConsoleLabelCombobox
                        id="game-console"
                        options={consoleLabelOptions}
                        container={drawerRef}
                        value={field.value}
                        onChange={field.onChange}
                        invalid={!!form.formState.errors.consoleLabel}
                      />
                    )}
                  />
                </div>
                {form.formState.errors.consoleLabel && (
                  <p role="alert" className="text-sm text-destructive">
                    {form.formState.errors.consoleLabel.message}
                  </p>
                )}
                <label className="flex flex-col gap-1 text-sm">
                  Condition
                  <select
                    className="h-9 rounded-md border bg-background px-3"
                    {...form.register("condition", {
                      validate: isVideoGameCondition,
                    })}
                  >
                    {videoGameConditions.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Last played
                  <input
                    className="h-9 rounded-md border bg-background px-3"
                    type="date"
                    {...form.register("lastPlayed")}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...form.register("completed")} />
                  Completed
                </label>
                {formError && (
                  <p role="alert" className="text-sm text-destructive">
                    {formError}
                  </p>
                )}
              </div>
              <DrawerFooter className="border-t">
                <Button
                  type="submit"
                  disabled={isSaving || !name?.trim() || !consoleLabel?.trim()}
                >
                  {isSaving ? "Saving..." : "Save game"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      )}
      <GameList games={games} onSelect={canWrite ? openGame : undefined} />
    </section>
  )
}

export default GameManager
