import type { RefObject } from "react"
import { Controller, type UseFormReturn } from "react-hook-form"

import DrawerBody from "@/components/DrawerBody"
import DrawerFooterBar from "@/components/DrawerFooterBar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { GameFormValues } from "@/features/video-games/schemas"
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
      <DrawerBody>
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
      </DrawerBody>
      <DrawerFooterBar>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save game"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </DrawerFooterBar>
    </form>
  )
}

export default GameForm
