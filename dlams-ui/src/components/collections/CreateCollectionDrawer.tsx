import { type ReactNode, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  collectionNameSchema,
  type CollectionNameFormValues,
} from "@/schemas/collections"
import useCollections from "./useCollections"

interface CreateCollectionDrawerProps {
  renderTrigger: (open: () => void) => ReactNode
}

function CreateCollectionDrawer({
  renderTrigger,
}: CreateCollectionDrawerProps) {
  const { createCollectionMutation } = useCollections()
  const [isOpen, setIsOpen] = useState(false)
  const form = useForm<CollectionNameFormValues>({
    resolver: zodResolver(collectionNameSchema),
    defaultValues: { name: "" },
  })

  const open = () => {
    createCollectionMutation.reset()
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    form.reset()
    createCollectionMutation.reset()
  }

  const createCollection = ({ name }: CollectionNameFormValues) => {
    createCollectionMutation.mutate(name, {
      onSuccess: () => {
        form.reset()
        setIsOpen(false)
      },
    })
  }

  return (
    <>
      {renderTrigger(open)}
      <Drawer
        open={isOpen}
        swipeDirection="right"
        onOpenChange={(nextOpen: boolean) => {
          if (!nextOpen) close()
        }}
      >
        <DrawerContent>
          <DrawerHeader className="flex-row items-center justify-between border-b pb-4">
            <DrawerTitle className="text-xl">Create collection</DrawerTitle>
            <DrawerClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Close drawer"
                />
              }
            >
              Close
            </DrawerClose>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <form
              onSubmit={form.handleSubmit(createCollection)}
              className="flex flex-col gap-4"
            >
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-collection-name">
                      Collection name
                    </FieldLabel>
                    <Input
                      autoComplete="off"
                      autoFocus
                      {...field}
                      id="create-collection-name"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {createCollectionMutation.error && (
                <p role="alert" className="text-sm text-destructive">
                  {createCollectionMutation.error.message}
                </p>
              )}
              <Button
                type="submit"
                disabled={createCollectionMutation.isPending}
              >
                {createCollectionMutation.isPending
                  ? "Creating..."
                  : "Create collection"}
              </Button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default CreateCollectionDrawer
