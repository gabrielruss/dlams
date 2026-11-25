import { useRef } from "react"

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
import type { GameRecord } from "@/features/video-games/types"
import GameDrawerContent from "./GameDrawerContent"
import GameList from "./GameList"
import useConsoleLabels from "./hooks/useConsoleLabels"

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
  const { consoleLabels } = useConsoleLabels(canWrite)
  const gameNameInputRef = useRef<HTMLInputElement>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={2} className="text-xl">
          Games
        </CardTitle>
        {canWrite && (
          <CardAction>
            <Button type="button" onClick={startAdding}>
              Add game
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
          <DrawerContent initialFocus={gameNameInputRef}>
            <GameDrawerContent
              collectionId={collectionId}
              openedGame={openedGame}
              consoleLabelOptions={consoleLabels}
              nameInputRef={gameNameInputRef}
              onClose={close}
            />
          </DrawerContent>
        </Drawer>
      )}
      <CardContent>
        <GameList games={games} onSelect={canWrite ? openGame : undefined} />
      </CardContent>
    </Card>
  )
}

export default GameManager
