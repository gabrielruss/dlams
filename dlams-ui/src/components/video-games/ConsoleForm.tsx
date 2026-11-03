import type { RefObject } from "react"
import { Controller, type UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { DrawerFooter } from "@/components/ui/drawer"
import { videoGameConditions } from "@/types/videoGames"
import ConsoleLabelCombobox from "./ConsoleLabelCombobox"
import type { ConsoleFormValues } from "./useConsoleDrawerContent"
import { isVideoGameCondition } from "./videoGameOptions"

interface ConsoleFormProps {
  form: UseFormReturn<ConsoleFormValues>
  consoleLabelOptions: string[]
  popupContainer: RefObject<HTMLElement | null>
  isSaving: boolean
  formError: string | null
  onSave: (values: ConsoleFormValues) => void
  onCancel: () => void
}

function ConsoleForm({
  form,
  consoleLabelOptions,
  popupContainer,
  isSaving,
  formError,
  onSave,
  onCancel,
}: ConsoleFormProps) {
  const label = form.watch("label")

  return (
    <form
      onSubmit={form.handleSubmit(onSave)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <div className="flex flex-col gap-1 text-sm">
          <label htmlFor="console-label">Console label</label>
          <Controller
            control={form.control}
            name="label"
            rules={{
              required: "Console label is required",
              maxLength: {
                value: 100,
                message: "Console label must be 100 characters or fewer",
              },
            }}
            render={({ field }) => (
              <ConsoleLabelCombobox
                id="console-label"
                options={consoleLabelOptions}
                container={popupContainer}
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </DrawerFooter>
    </form>
  )
}

export default ConsoleForm
