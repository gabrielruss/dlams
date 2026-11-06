import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Plus } from "lucide-react"

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
import useSearchMode from "@/components/search/useSearchMode"
import {
  collectionNameSchema,
  type CollectionNameFormValues,
} from "@/schemas/collections"
import CollectionStats from "./CollectionStats"
import useCollections from "./useCollections"

function CollectionNavigation() {
  const {
    collections,
    selectedCollectionId,
    setSelectedCollectionId,
    collectionsQuery,
    createCollectionMutation,
  } = useCollections()
  const { isOpen: isSearching } = useSearchMode()
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)
  const form = useForm<CollectionNameFormValues>({
    resolver: zodResolver(collectionNameSchema),
    defaultValues: { name: "" },
  })

  const closeCreateDrawer = () => {
    setIsCreateDrawerOpen(false)
    form.reset()
    createCollectionMutation.reset()
  }

  const openCreateDrawer = () => {
    createCollectionMutation.reset()
    setIsCreateDrawerOpen(true)
  }

  const handleCreateCollection = ({ name }: CollectionNameFormValues) => {
    createCollectionMutation.mutate(name, {
      onSuccess: () => {
        form.reset()
        setIsCreateDrawerOpen(false)
      },
    })
  }

  return (
    <nav
      aria-label="Collections"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="flex shrink-0 items-center justify-between py-2 pl-3 pr-3">
        <h2 className="text-sm font-semibold">Collections</h2>
        <Button
          variant="outline"
          size="icon"
          type="button"
          aria-label="New collection"
          title="New collection"
          onClick={openCreateDrawer}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>

      {collectionsQuery.isError && (
        <p role="alert" className="px-3 pb-2 text-xs text-destructive">
          {collectionsQuery.error.message}
        </p>
      )}

      {collectionsQuery.isPending ? (
        <p className="px-3 py-2 text-sm text-muted-foreground">
          Loading collections...
        </p>
      ) : collections.length === 0 ? (
        <div className="flex flex-col gap-3 px-3 py-2">
          <p className="text-sm text-muted-foreground">No collections yet.</p>
          <Button variant="outline" type="button" onClick={openCreateDrawer}>
            Create your first collection
          </Button>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto pl-3">
          {collections.map((collection) => {
            const selected =
              !isSearching && collection.id === selectedCollectionId
            return (
              <li key={collection.id} className="border-b last:border-b-0">
                <Button
                  type="button"
                  variant="ghost"
                  aria-pressed={selected}
                  aria-current={selected ? "true" : undefined}
                  onClick={() => setSelectedCollectionId(collection.id)}
                  className={`h-auto w-full flex-col items-stretch justify-start gap-2 rounded-none border-r-4 py-3 pr-3 pl-0 text-left text-base font-normal whitespace-normal transition-colors hover:bg-transparent ${
                    selected
                      ? "border-red text-sidebar-primary hover:text-sidebar-primary"
                      : "border-transparent text-sidebar-foreground hover:text-sidebar-primary"
                  }`}
                >
                  <span className="flex min-w-0 items-center justify-between gap-2">
                    <span className="truncate font-medium">
                      {collection.name}
                    </span>
                    <span className="shrink-0 rounded-full bg-foreground px-2 py-0.5 text-xs text-background">
                      {collection.access}
                    </span>
                  </span>
                  <CollectionStats collection={collection} />
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      <Drawer
        open={isCreateDrawerOpen}
        swipeDirection="right"
        onOpenChange={(open: boolean) => {
          if (!open) closeCreateDrawer()
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
                  size="sm"
                  aria-label="Close drawer"
                />
              }
            >
              Close
            </DrawerClose>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <form
              onSubmit={form.handleSubmit(handleCreateCollection)}
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
    </nav>
  )
}

export default CollectionNavigation
