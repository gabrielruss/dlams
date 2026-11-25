import useItemDrawer from "@/hooks/useItemDrawer"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import type { ConsoleRecord } from "@/features/video-games/types"
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
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={2} className="text-xl">
          Consoles
        </CardTitle>
        {canWrite && (
          <CardAction>
            <Button type="button" onClick={startAdding}>
              Add console
            </Button>
          </CardAction>
        )}
      </CardHeader>
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

      <CardContent>
        <ConsoleList
          consoles={consoles}
          onSelect={canWrite ? openConsole : undefined}
        />
      </CardContent>
    </Card>
  )
}

export default ConsoleManager
