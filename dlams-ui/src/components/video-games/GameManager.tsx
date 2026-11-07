import { useRef } from "react"

import useItemDrawer from "@/components/collections/useItemDrawer"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import type { GameRecord } from "@/types/videoGames"
import GameDrawerContent from "./GameDrawerContent"
import GameList from "./GameList"
import useConsoleLabels from "./useConsoleLabels"

interface GameManagerProps {
  collectionId: number
  games: GameRecord[]
  canWrite: boolean
}

function GameManager({ collectionId, games, canWrite }: GameManagerProps) {
  const {
    openedItem: openedGame,
    isDrawerOpen,
    open: openGame,
    startAdding,
    close,
  } = useItemDrawer({ type: "game", items: games })
  const consoleLabelOptions = useConsoleLabels(canWrite)
  const gameNameInputRef = useRef<HTMLInputElement>(null)

  return (
    <section className="flex flex-col gap-4 rounded-lg border p-4">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Games</h2>
        {canWrite && (
          <Button type="button" onClick={startAdding}>
            Add game
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
          <DrawerContent initialFocus={gameNameInputRef}>
            <GameDrawerContent
              collectionId={collectionId}
              openedGame={openedGame}
              consoleLabelOptions={consoleLabelOptions}
              nameInputRef={gameNameInputRef}
              onClose={close}
            />
          </DrawerContent>
        </Drawer>
      )}
      <GameList games={games} onSelect={canWrite ? openGame : undefined} />
    </section>
  )
}

export default GameManager
