import type { RefObject } from "react"
import { Controller, type UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DrawerFooter } from "@/components/ui/drawer"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { GameFormValues } from "@/schemas/games"
import ConditionSelect from "./ConditionSelect"
import ConsoleLabelCombobox from "./ConsoleLabelCombobox"
import LastPlayedPicker from "./LastPlayedPicker"

interface GameFormProps {
  form: UseFormReturn<GameFormValues>
  consoleLabelOptions: string[]
  isSaving: boolean
  focusNameOnMount: boolean
  nameInputRef: RefObject<HTMLInputElement | null>
  formError: string | null
  onSave: (values: GameFormValues) => void
  onCancel: () => void
}

function GameForm({
  form,
  consoleLabelOptions,
  isSaving,
  focusNameOnMount,
  nameInputRef,
  formError,
  onSave,
  onCancel,
}: GameFormProps) {
  return (
    <form
      onSubmit={form.handleSubmit(onSave)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <Controller
          control={form.control}
          name="name"
          render={({ field: { ref, ...field }, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="game-name">Game name</FieldLabel>
              <Input
                autoComplete="off"
                autoFocus={focusNameOnMount}
                {...field}
                ref={(element) => {
                  ref(element)
                  nameInputRef.current = element
                }}
                id="game-name"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="consoleLabel"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="game-console">Console</FieldLabel>
              <ConsoleLabelCombobox
                id="game-console"
                options={consoleLabelOptions}
                value={field.value}
                onChange={field.onChange}
                invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="condition"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="game-condition">Condition</FieldLabel>
              <ConditionSelect
                id="game-condition"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="lastPlayed"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel id="game-last-played-label">Last played</FieldLabel>
              <LastPlayedPicker
                id="game-last-played"
                labelId="game-last-played-label"
                value={field.value}
                onChange={field.onChange}
                invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="completed"
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <Checkbox
                id="game-completed"
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <FieldLabel htmlFor="game-completed" className="font-normal">
                Completed
              </FieldLabel>
            </Field>
          )}
        />
        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}
      </div>
      <DrawerFooter className="border-t pt-4">
        <Button type="submit" disabled={isSaving}>
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
