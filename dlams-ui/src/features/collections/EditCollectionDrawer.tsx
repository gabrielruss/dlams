import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Pencil, Trash2 } from "lucide-react"

import DrawerBody from "@/components/DrawerBody"
import DrawerFooterBar from "@/components/DrawerFooterBar"
import DrawerTitleBar from "@/components/DrawerTitleBar"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  collectionNameSchema,
  type CollectionNameFormValues,
} from "@/features/collections/schemas"
import { setFieldErrorsFromApi } from "@/lib/formErrors"
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
    renameMutation.mutate(name, {
      onSuccess: () => setIsOpen(false),
      onError: (error) => setFieldErrorsFromApi(form, error),
    })
  }

  return (
    <Drawer open={isOpen} swipeDirection="right" onOpenChange={setIsOpen}>
      <Button type="button" variant="outline" onClick={open}>
        <Pencil aria-hidden="true" />
        Edit
      </Button>
      <DrawerContent>
        <DrawerTitleBar title="Edit collection" />
        <form
          onSubmit={form.handleSubmit(rename)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DrawerBody>
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
          </DrawerBody>
          {!isConfirmingDelete && (
            <DrawerFooterBar>
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
            </DrawerFooterBar>
          )}
        </form>
      </DrawerContent>
    </Drawer>
  )
}

export default EditCollectionDrawer
