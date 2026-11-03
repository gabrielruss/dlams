import type { RefObject } from "react"
import { Controller, type UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { DrawerFooter } from "@/components/ui/drawer"
import { videoGameConditions } from "@/types/videoGames"
import ConsoleLabelCombobox from "./ConsoleLabelCombobox"
import type { GameFormValues } from "./useGameDrawerContent"
import { isVideoGameCondition } from "./videoGameOptions"

interface GameFormProps {
  form: UseFormReturn<GameFormValues>
  consoleLabelOptions: string[]
  popupContainer: RefObject<HTMLElement | null>
  isSaving: boolean
  formError: string | null
  onSave: (values: GameFormValues) => void
  onCancel: () => void
}

function GameForm({
  form,
  consoleLabelOptions,
  popupContainer,
  isSaving,
  formError,
  onSave,
  onCancel,
}: GameFormProps) {
  const name = form.watch("name")
  const consoleLabel = form.watch("consoleLabel")

  return (
    <form
      onSubmit={form.handleSubmit(onSave)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
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
                container={popupContainer}
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </DrawerFooter>
    </form>
  )
}

export default GameForm
