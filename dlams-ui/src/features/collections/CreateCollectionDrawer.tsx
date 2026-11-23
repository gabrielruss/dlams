import { type ReactNode, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import DrawerBody from "@/components/DrawerBody"
import DrawerTitleBar from "@/components/DrawerTitleBar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  collectionNameSchema,
  type CollectionNameFormValues,
} from "@/features/collections/schemas"
import { setFieldErrorsFromApi } from "@/lib/formErrors"
import useCollections from "./hooks/useCollections"

interface CreateCollectionDrawerProps {
  renderTrigger: (open: () => void) => ReactNode
}

function CreateCollectionDrawer({
  renderTrigger,
}: CreateCollectionDrawerProps) {
  const { createCollectionMutation } = useCollections()
  const [isOpen, setIsOpen] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
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
      onError: (error) => setFieldErrorsFromApi(form, error),
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
        <DrawerContent initialFocus={nameInputRef}>
          <DrawerTitleBar title="Create collection" />
          <DrawerBody>
            <form
              onSubmit={form.handleSubmit(createCollection)}
              className="flex flex-col gap-4"
            >
              <Controller
                control={form.control}
                name="name"
                render={({ field: { ref, ...field }, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-collection-name">
                      Collection name
                    </FieldLabel>
                    <Input
                      autoComplete="off"
                      {...field}
                      ref={(element) => {
                        ref(element)
                        nameInputRef.current = element
                      }}
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
                <Alert variant="destructive">
                  <AlertDescription>
                    {createCollectionMutation.error.message}
                  </AlertDescription>
                </Alert>
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
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default CreateCollectionDrawer
