import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import type {
  ConsoleRecord,
} from "@/types/videoGames"
import { videoGameConditions } from "@/types/videoGames"
import { isVideoGameCondition } from "./videoGameOptions"
import useConsoleManager from "./useConsoleManager"

interface ConsoleManagerProps {
  collectionId: number
  consoles: ConsoleRecord[]
  canWrite: boolean
  onChanged: () => Promise<void>
}

function ConsoleManager({
  collectionId,
  consoles,
  canWrite,
  onChanged,
}: ConsoleManagerProps) {
  const {
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
  } = useConsoleManager({ collectionId, onChanged })
  const label = form.watch("label")

  return (
    <section className="flex flex-col gap-4 rounded-lg border p-4">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Consoles</h2>
        {canWrite && (
          <button
            className="h-9 rounded-md bg-primary px-4 text-primary-foreground"
            type="button"
            onClick={startNewConsole}
          >
            Add console
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
                {editingId === null ? "Add console" : "Edit console"}
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
                onSubmit={form.handleSubmit(saveConsole)}
                className="flex flex-col gap-4"
              >
            <label className="flex flex-col gap-1 text-sm">
              Console label
              <input
                className="h-9 rounded-md border bg-background px-3"
                {...form.register("label", {
                  required: "Console label is required",
                  maxLength: {
                    value: 100,
                    message: "Console label must be 100 characters or fewer",
                  },
                })}
                autoFocus
              />
            </label>
            {form.formState.errors.label && (
              <p role="alert" className="text-sm text-destructive">
                {form.formState.errors.label.message}
              </p>
            )}
            <label className="flex flex-col gap-1 text-sm">
              Edition / details
              <input
                className="h-9 rounded-md border bg-background px-3"
                {...form.register("edition", {
                  maxLength: {
                    value: 100,
                    message: "Edition must be 100 characters or fewer",
                  },
                })}
                placeholder="Optional"
              />
            </label>
            {form.formState.errors.edition && (
              <p role="alert" className="text-sm text-destructive">
                {form.formState.errors.edition.message}
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
            {formError && (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                className="h-9 rounded-md bg-primary px-4 text-primary-foreground disabled:opacity-50"
                disabled={
                  form.formState.isSubmitting || !label?.trim()
                }
              >
                {form.formState.isSubmitting ? "Saving..." : "Save console"}
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
      {consoles.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No consoles in this collection yet.
        </p>
      ) : (
        <ul className="divide-y">
          {consoles.map((consoleRecord) => (
            <li
              key={consoleRecord.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <div>
                <p className="font-medium">
                  {consoleRecord.label}
                  {consoleRecord.edition ? ` — ${consoleRecord.edition}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {consoleRecord.condition} · {consoleRecord.game_count} games
                </p>
              </div>
              {canWrite && (
                <div className="flex gap-2">
                  <button
                    className="rounded-md border px-3 py-1 text-sm"
                    type="button"
                    onClick={() => editConsole(consoleRecord)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-md border px-3 py-1 text-sm"
                    type="button"
                    onClick={() => deleteConsole(consoleRecord)}
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

export default ConsoleManager
