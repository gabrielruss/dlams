import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { MAX_LINKS_PER_COLLECTION } from "@/lib/api/collectionLinks"
import {
  linkNameSchema,
  type LinkNameFormValues,
} from "@/schemas/collectionLinks"
import type useCollectionLinks from "./useCollectionLinks"

interface CreateLinkFormProps {
  createMutation: ReturnType<typeof useCollectionLinks>["createMutation"]
  atLimit: boolean
  disabled: boolean
}

function CreateLinkForm({
  createMutation,
  atLimit,
  disabled,
}: CreateLinkFormProps) {
  const [isNaming, setIsNaming] = useState(false)
  const form = useForm<LinkNameFormValues>({
    resolver: zodResolver(linkNameSchema),
    defaultValues: { name: "" },
  })

  const startNaming = () => {
    createMutation.reset()
    form.reset()
    setIsNaming(true)
  }

  const createLink = ({ name }: LinkNameFormValues) => {
    createMutation.mutate(name || null, {
      onSuccess: () => setIsNaming(false),
    })
  }

  if (!isNaming && atLimit) {
    return (
      <p className="text-sm text-muted-foreground">
        A collection can have {MAX_LINKS_PER_COLLECTION} links. Delete one to
        make another.
      </p>
    )
  }

  if (!isNaming) {
    return (
      <Button type="button" disabled={disabled} onClick={startNaming}>
        Create read-only link
      </Button>
    )
  }

  return (
    <form
      onSubmit={form.handleSubmit(createLink)}
      className="flex flex-col gap-2"
    >
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="link-name">Link name (optional)</FieldLabel>
            <Input
              placeholder="For example, Ashley"
              autoComplete="off"
              autoFocus
              {...field}
              id="link-name"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating link..." : "Create link"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsNaming(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default CreateLinkForm
