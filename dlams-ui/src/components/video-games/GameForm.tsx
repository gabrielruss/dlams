import { Controller, type UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DrawerFooter } from "@/components/ui/drawer"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { GameFormValues } from "@/schemas/games"
import { videoGameConditions } from "@/types/videoGames"
import ConsoleLabelCombobox from "./ConsoleLabelCombobox"
import LastPlayedPicker from "./LastPlayedPicker"

interface GameFormProps {
  form: UseFormReturn<GameFormValues>
  consoleLabelOptions: string[]
  isSaving: boolean
  formError: string | null
  onSave: (values: GameFormValues) => void
  onCancel: () => void
}

const conditionItems = videoGameConditions.map((condition) => ({
  label: condition,
  value: condition,
}))

function GameForm({
  form,
  consoleLabelOptions,
  isSaving,
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
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="game-name">Game name</FieldLabel>
              <Input
                autoComplete="off"
                autoFocus
                {...field}
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
              <Select
                items={conditionItems}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="game-condition"
                  className="w-full rounded-md pl-3 text-base data-[size=default]:h-9 md:text-sm"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {conditionItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
