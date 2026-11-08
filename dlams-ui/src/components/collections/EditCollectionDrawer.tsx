import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  collectionNameSchema,
  type CollectionNameFormValues,
} from "@/schemas/collections"
import type { Collection } from "@/types/collections"
import DeleteCollectionConfirm from "./DeleteCollectionConfirm"
import useManageCollection from "./hooks/useManageCollection"

interface EditCollectionDrawerProps {
  collection: Collection
}

function EditCollectionDrawer({ collection }: EditCollectionDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const { renameMutation, deleteMutation } = useManageCollection(collection.id)
  const form = useForm<CollectionNameFormValues>({
    resolver: zodResolver(collectionNameSchema),
    defaultValues: { name: collection.name },
  })

  const open = () => {
    form.reset({ name: collection.name })
    renameMutation.reset()
    deleteMutation.reset()
    setIsConfirmingDelete(false)
    setIsOpen(true)
  }

  const rename = ({ name }: CollectionNameFormValues) => {
    renameMutation.mutate(name, { onSuccess: () => setIsOpen(false) })
  }

  return (
    <Drawer open={isOpen} swipeDirection="right" onOpenChange={setIsOpen}>
      <Button type="button" variant="outline" onClick={open}>
        <Pencil aria-hidden="true" />
        Edit
      </Button>
      <DrawerContent>
        <DrawerHeader className="flex-row items-center justify-between border-b pb-4">
          <DrawerTitle className="text-xl">Edit collection</DrawerTitle>
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
        <form
          onSubmit={form.handleSubmit(rename)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
            {isConfirmingDelete ? (
              <DeleteCollectionConfirm
                collection={collection}
                isDeleting={deleteMutation.isPending}
                error={deleteMutation.error}
                onDelete={() => deleteMutation.mutate()}
                onKeep={() => setIsConfirmingDelete(false)}
              />
            ) : (
              <>
                <div className="flex justify-end">
                  <Button
                    className="text-destructive"
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Delete collection"
                    title="Delete collection"
                    onClick={() => setIsConfirmingDelete(true)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="collection-name">
                        Collection name
                      </FieldLabel>
                      <Input
                        autoComplete="off"
                        {...field}
                        id="collection-name"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                {renameMutation.error && (
                  <p role="alert" className="text-sm text-destructive">
                    {renameMutation.error.message}
                  </p>
                )}
              </>
            )}
          </div>
          {!isConfirmingDelete && (
            <DrawerFooter className="border-t pt-4">
              <Button type="submit" disabled={renameMutation.isPending}>
                {renameMutation.isPending ? "Saving..." : "Save collection"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
            </DrawerFooter>
          )}
        </form>
      </DrawerContent>
    </Drawer>
  )
}

export default EditCollectionDrawer
