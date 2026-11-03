import { useRef } from "react"

import useItemDrawer from "@/components/collections/useItemDrawer"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import type { ConsoleRecord } from "@/types/videoGames"
import ConsoleDrawerContent from "./ConsoleDrawerContent"
import ConsoleList from "./ConsoleList"
import useConsoleLabels from "./useConsoleLabels"

interface ConsoleManagerProps {
  collectionId: number
  consoles: ConsoleRecord[]
  canWrite: boolean
}

function ConsoleManager({
  collectionId,
  consoles,
  canWrite,
}: ConsoleManagerProps) {
  const {
    openedItem: openedConsole,
    isDrawerOpen,
    open: openConsole,
    startAdding,
    close,
  } = useItemDrawer({ type: "console", items: consoles })
  const consoleLabelOptions = useConsoleLabels(canWrite)
  const drawerRef = useRef<HTMLDivElement>(null)

  return (
    <section className="flex flex-col gap-4 rounded-lg border p-4">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Consoles</h2>
        {canWrite && (
          <button
            className="h-9 rounded-md bg-primary px-4 text-primary-foreground"
            type="button"
            onClick={startAdding}
          >
            Add console
          </button>
        )}
      </header>
      {canWrite && (
        <Drawer
          open={isDrawerOpen}
          direction="right"
          onOpenChange={(open: boolean) => {
            if (!open) close()
          }}
        >
          <DrawerContent ref={drawerRef}>
            <ConsoleDrawerContent
              collectionId={collectionId}
              openedConsole={openedConsole}
              consoleLabelOptions={consoleLabelOptions}
              popupContainer={drawerRef}
              onClose={close}
            />
          </DrawerContent>
        </Drawer>
      )}

      <ConsoleList
        consoles={consoles}
        onSelect={canWrite ? openConsole : undefined}
      />
    </section>
  )
}

export default ConsoleManager
