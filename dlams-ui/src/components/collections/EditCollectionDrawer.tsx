import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  collectionNameSchema,
  type CollectionNameFormValues,
} from "@/schemas/collections"
import type { Collection } from "@/types/collections"
import DeleteCollectionConfirm from "./DeleteCollectionConfirm"
import useManageCollection from "./useManageCollection"

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
    <Drawer open={isOpen} direction="right" onOpenChange={setIsOpen}>
      <Button type="button" variant="outline" onClick={open}>
        <Pencil aria-hidden="true" />
        Edit
      </Button>
      <DrawerContent>
        <DrawerHeader className="flex-row items-center justify-between border-b">
          <DrawerTitle className="text-xl">Edit collection</DrawerTitle>
          <DrawerClose asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Close drawer"
            >
              Close
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <Form {...form}>
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
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection name</FormLabel>
                        <FormControl>
                          <Input autoComplete="off" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
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
              <DrawerFooter className="border-t">
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
        </Form>
      </DrawerContent>
    </Drawer>
  )
}

export default EditCollectionDrawer
