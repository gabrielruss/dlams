import { Controller, type UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { DrawerFooter } from "@/components/ui/drawer"
import { videoGameConditions } from "@/types/videoGames"
import ConsoleLabelCombobox from "./ConsoleLabelCombobox"
import type { GameFormValues } from "./useGameDrawerContent"
import { todayAsIsoDate } from "@/lib/dates"
import { isVideoGameCondition } from "./videoGameOptions"

interface GameFormProps {
  form: UseFormReturn<GameFormValues>
  consoleLabelOptions: string[]
  isSaving: boolean
  formError: string | null
  onSave: (values: GameFormValues) => void
  onCancel: () => void
}

function GameForm({
  form,
  consoleLabelOptions,
  isSaving,
  formError,
  onSave,
  onCancel,
}: GameFormProps) {
  const name = form.watch("name")
  const consoleLabel = form.watch("consoleLabel")
  const today = todayAsIsoDate()

  return (
    <form
      noValidate
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
            max={today}
            {...form.register("lastPlayed", {
              validate: (value) =>
                !value ||
                value <= today ||
                "Last played can't be in the future",
            })}
          />
        </label>
        {form.formState.errors.lastPlayed && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.lastPlayed.message}
          </p>
        )}
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
      <DrawerFooter className="border-t pt-4">
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
