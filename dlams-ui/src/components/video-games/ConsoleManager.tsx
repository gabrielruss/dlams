import useItemDrawer from "@/hooks/useItemDrawer"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import type { ConsoleRecord } from "@/components/video-games/types"
import ConsoleDrawerContent from "./ConsoleDrawerContent"
import ConsoleList from "./ConsoleList"
import useConsoleLabels from "./hooks/useConsoleLabels"

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
  const { consoleLabels } = useConsoleLabels(canWrite)

  return (
    <section className="flex flex-col gap-4 rounded-lg border p-4">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Consoles</h2>
        {canWrite && (
          <Button type="button" onClick={startAdding}>
            Add console
          </Button>
        )}
      </header>
      {canWrite && (
        <Drawer
          open={isDrawerOpen}
          swipeDirection="right"
          onOpenChange={(open: boolean) => {
            if (!open) close()
          }}
        >
          <DrawerContent>
            <ConsoleDrawerContent
              collectionId={collectionId}
              openedConsole={openedConsole}
              consoleLabelOptions={consoleLabels}
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
