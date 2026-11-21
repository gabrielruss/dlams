import { Controller, type UseFormReturn } from "react-hook-form"

import DrawerBody from "@/components/DrawerBody"
import DrawerFooterBar from "@/components/DrawerFooterBar"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { ConsoleFormValues } from "@/features/video-games/schemas"
import ConditionSelect from "./ConditionSelect"
import ConsoleLabelCombobox from "./ConsoleLabelCombobox"

interface ConsoleFormProps {
  form: UseFormReturn<ConsoleFormValues>
  consoleLabelOptions: string[]
  isSaving: boolean
  formError: string | null
  onSave: (values: ConsoleFormValues) => void
  onCancel: () => void
}

function ConsoleForm({
  form,
  consoleLabelOptions,
  isSaving,
  formError,
  onSave,
  onCancel,
}: ConsoleFormProps) {
  return (
    <form
      onSubmit={form.handleSubmit(onSave)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <DrawerBody>
        <Controller
          control={form.control}
          name="label"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="console-label">Console label</FieldLabel>
              <ConsoleLabelCombobox
                id="console-label"
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
          name="edition"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="console-edition">
                Edition / details
              </FieldLabel>
              <Input
                autoComplete="off"
                placeholder="Optional"
                {...field}
                id="console-edition"
                aria-invalid={fieldState.invalid}
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
              <FieldLabel htmlFor="console-condition">Condition</FieldLabel>
              <ConditionSelect
                id="console-condition"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
          {isSaving ? "Saving..." : "Save console"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </DrawerFooterBar>
    </form>
  )
}

export default ConsoleForm
