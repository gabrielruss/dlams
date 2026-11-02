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
import type { ConsoleRecord } from "@/types/videoGames"
import { videoGameConditions } from "@/types/videoGames"
import { isVideoGameCondition } from "./videoGameOptions"
import ConsoleLabelCombobox from "./ConsoleLabelCombobox"
import ConsoleList from "./ConsoleList"
import useConsoleLabels from "./useConsoleLabels"
import useConsoleManager from "./useConsoleManager"

interface ConsoleManagerProps {
  collectionId: number
  consoles: ConsoleRecord[]
  canWrite: boolean
}

function ConsoleManager({
  collectionId,
  consoles,
  canWrite,
}: ConsoleManagerProps) {
  const {
    form,
    editingId,
    editingConsole,
    formError,
    deleteError,
    isDeleting,
    isDrawerOpen,
    isSaving,
    resetForm,
    saveConsole,
    editConsole,
    startNewConsole,
    deleteConsole,
  } = useConsoleManager({ collectionId, consoles })
  const consoleLabelOptions = useConsoleLabels(canWrite)
  const drawerRef = useRef<HTMLDivElement>(null)
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
          <DrawerContent ref={drawerRef}>
            <DrawerHeader className="flex-row items-center justify-between border-b">
              <DrawerTitle className="text-xl">
                {editingId === null ? "Add console" : "Edit console"}
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
              onSubmit={form.handleSubmit(saveConsole)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
                {editingConsole && (
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      className="text-destructive"
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Delete console"
                      title="Delete console"
                      disabled={isDeleting}
                      onClick={() => deleteConsole(editingConsole)}
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
                <div className="flex flex-col gap-1 text-sm">
                  <label htmlFor="console-label">Console label</label>
                  <Controller
                    control={form.control}
                    name="label"
                    rules={{
                      required: "Console label is required",
                      maxLength: {
                        value: 100,
                        message:
                          "Console label must be 100 characters or fewer",
                      },
                    }}
                    render={({ field }) => (
                      <ConsoleLabelCombobox
                        id="console-label"
                        options={consoleLabelOptions}
                        container={drawerRef}
                        value={field.value}
                        onChange={field.onChange}
                        invalid={!!form.formState.errors.label}
                      />
                    )}
                  />
                </div>
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
              </div>
              <DrawerFooter className="border-t">
                <Button type="submit" disabled={isSaving || !label?.trim()}>
                  {isSaving ? "Saving..." : "Save console"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      )}

      <ConsoleList
        consoles={consoles}
        onSelect={canWrite ? editConsole : undefined}
      />
    </section>
  )
}

export default ConsoleManager
