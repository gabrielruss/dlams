import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import type { ConsoleRecord, GameRecord } from "@/types/videoGames"
import { videoGameConditions } from "@/types/videoGames"
import useGameManager from "./useGameManager"

interface GameManagerProps {
  collectionId: number
  consoles: ConsoleRecord[]
  games: GameRecord[]
  canWrite: boolean
}

function GameManager({
  collectionId,
  consoles,
  games,
  canWrite,
}: GameManagerProps) {
  const {
    consoleLabels,
    form,
    editingId,
    formError,
    listError,
    isDrawerOpen,
    isSaving,
    resetForm,
    saveGame,
    editGame,
    startNewGame,
    deleteGame,
    isVideoGameCondition,
  } = useGameManager({ collectionId, consoles })
  const name = form.watch("name")

  return (
    <section className="flex flex-col gap-4 rounded-lg border p-4">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Games</h2>
        {canWrite && (
          <button
            className="h-9 rounded-md bg-primary px-4 text-primary-foreground disabled:opacity-50"
            type="button"
            onClick={startNewGame}
            disabled={consoleLabels.length === 0}
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
          <DrawerContent>
            <DrawerHeader className="flex-row items-center justify-between border-b">
              <DrawerTitle className="text-xl">
                {editingId === null ? "Add game" : "Edit game"}
              </DrawerTitle>
              <DrawerClose asChild>
                <button
                  className="rounded-md border px-3 py-1 text-sm"
                  type="button"
                  aria-label="Close drawer"
                >
                  Close
                </button>
              </DrawerClose>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <form
                onSubmit={form.handleSubmit(saveGame)}
                className="flex flex-col gap-4"
              >
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
                <label className="flex flex-col gap-1 text-sm">
                  Console
                  <select
                    className="h-9 rounded-md border bg-background px-3"
                    {...form.register("consoleLabelId", {
                      required: "Select a console",
                    })}
                  >
                    <option value="">Select a console</option>
                    {consoleLabels.map((consoleLabel) => (
                      <option key={consoleLabel.id} value={consoleLabel.id}>
                        {consoleLabel.name}
                      </option>
                    ))}
                  </select>
                </label>
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
                <div className="flex gap-2">
                  <button
                    className="h-9 rounded-md bg-primary px-4 text-primary-foreground disabled:opacity-50"
                    disabled={
                      isSaving ||
                      !name?.trim() ||
                      consoleLabels.length === 0
                    }
                  >
                    {isSaving ? "Saving..." : "Save game"}
                  </button>
                  <button
                    className="h-9 rounded-md border px-4"
                    type="button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </DrawerContent>
        </Drawer>
      )}
      {listError && (
        <p role="alert" className="text-sm text-destructive">
          {listError}
        </p>
      )}
      {games.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No games in this collection yet.
        </p>
      ) : (
        <ul className="divide-y">
          {games.map((game) => (
            <li
              key={game.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <div>
                <p className="font-medium">{game.name}</p>
                <p className="text-sm text-muted-foreground">
                  {game.console_label} · {game.condition}
                  {game.completed ? " · Completed" : ""}
                  {game.last_played ? ` · Last played ${game.last_played}` : ""}
                </p>
              </div>
              {canWrite && (
                <div className="flex gap-2">
                  <button
                    className="rounded-md border px-3 py-1 text-sm"
                    type="button"
                    onClick={() => editGame(game)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-md border px-3 py-1 text-sm"
                    type="button"
                    onClick={() => deleteGame(game)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default GameManager
