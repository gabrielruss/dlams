import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(createLink)}
        className="flex flex-col gap-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link name (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="For example, Dana"
                  autoComplete="off"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
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
    </Form>
  )
}

export default CreateLinkForm
