import { useState } from "react"
import { useForm } from "react-hook-form"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import VideoGamesWorkspace from "@/components/video-games/VideoGamesWorkspace"
import useCollections from "./useCollections"

function CollectionWorkspace() {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)
  const form = useForm<{ name: string }>({ defaultValues: { name: "" } })
  const newCollectionName = form.watch("name")
  const {
    collections,
    selectedCollection,
    selectedCollectionId,
    setSelectedCollectionId,
    isLoading,
    loadError,
    isCreating,
    createError,
    clearCreateError,
    createCollection,
  } = useCollections()

  const closeCreateDrawer = () => {
    setIsCreateDrawerOpen(false)
    form.reset()
    clearCreateError()
  }

  const handleCreateCollection = async ({ name }: { name: string }) => {
    const trimmedName = name.trim()
    if (!trimmedName) return

    if (await createCollection(trimmedName)) {
      form.reset()
      setIsCreateDrawerOpen(false)
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
        <label className="flex min-w-56 flex-1 flex-col gap-1 text-sm">
          Collection
          <select
            className="h-9 rounded-md border bg-background px-3"
            value={selectedCollectionId ?? ""}
            onChange={(event) =>
              setSelectedCollectionId(
                event.target.value ? Number(event.target.value) : undefined
              )
            }
            disabled={isLoading || collections.length === 0}
          >
            {collections.length === 0 && (
              <option value="">No collections yet</option>
            )}
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name} ({collection.access})
              </option>
            ))}
          </select>
        </label>
        <button
          className="h-9 rounded-md bg-primary px-4 text-primary-foreground"
          type="button"
          onClick={() => {
            clearCreateError()
            setIsCreateDrawerOpen(true)
          }}
        >
          New collection
        </button>
      </div>

      {loadError && (
        <p role="alert" className="rounded-md border border-destructive p-3 text-sm">
          {loadError}
        </p>
      )}

      {isLoading ? (
        <p>Loading collections...</p>
      ) : selectedCollection ? (
        <VideoGamesWorkspace collection={selectedCollection} />
      ) : (
        <p>Create a collection to start tracking consoles and games.</p>
      )}
      <Drawer
        open={isCreateDrawerOpen}
        direction="right"
        onOpenChange={(open: boolean) => {
          if (!open) closeCreateDrawer()
        }}
      >
        <DrawerContent>
          <DrawerHeader className="flex-row items-center justify-between border-b">
            <DrawerTitle className="text-xl">Create collection</DrawerTitle>
            <DrawerClose asChild>
              <button
                className="rounded-md border px-3 py-1 text-sm"
                type="button"
                aria-label="Close drawer"
              >
                Close
              </button>
            </DrawerClose>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <form
              onSubmit={form.handleSubmit(handleCreateCollection)}
              className="flex flex-col gap-4"
            >
              <label className="flex flex-col gap-1 text-sm">
                Collection name
                <input
                  className="h-9 rounded-md border bg-background px-3"
                  {...form.register("name", {
                    required: "Collection name is required",
                    maxLength: {
                      value: 100,
                      message: "Collection name must be 100 characters or fewer",
                    },
                  })}
                  autoFocus
                />
              </label>
              {form.formState.errors.name && (
                <p role="alert" className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
              {createError && (
                <p role="alert" className="text-sm text-destructive">
                  {createError}
                </p>
              )}
              <button
                className="h-9 rounded-md bg-primary px-4 text-primary-foreground disabled:opacity-50"
                type="submit"
                disabled={isCreating || !newCollectionName.trim()}
              >
                {isCreating ? "Creating..." : "Create collection"}
              </button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </section>
  )
}

export default CollectionWorkspace
