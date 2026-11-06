import ItemActions from "@/components/collections/ItemActions"
import { Button } from "@/components/ui/button"
import { DrawerClose, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import type { GameRecord } from "@/types/videoGames"
import GameDetails from "./GameDetails"
import GameForm from "./GameForm"
import useGameDrawerContent from "./useGameDrawerContent"

interface GameDrawerContentProps {
  collectionId: number
  openedGame: GameRecord | undefined
  consoleLabelOptions: string[]
  onClose: () => void
}

function GameDrawerContent({
  collectionId,
  openedGame,
  consoleLabelOptions,
  onClose,
}: GameDrawerContentProps) {
  const {
    form,
    shownGame,
    isEditing,
    formError,
    deleteError,
    isDeleting,
    isSaving,
    startEditing,
    leaveForm,
    saveGame,
    deleteGame,
  } = useGameDrawerContent({ collectionId, openedGame, onClose })
  const viewedGame = isEditing ? undefined : shownGame

  return (
    <>
      <DrawerHeader className="flex-row items-center justify-between border-b pb-4">
        <DrawerTitle className="text-xl">
          {viewedGame?.name ?? (shownGame ? "Edit game" : "Add game")}
        </DrawerTitle>
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
      {viewedGame ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
          <ItemActions
            typeName="game"
            isDeleting={isDeleting}
            deleteError={deleteError}
            onEdit={startEditing}
            onDelete={() => deleteGame(viewedGame)}
          />
          <GameDetails game={viewedGame} />
        </div>
      ) : (
        <GameForm
          form={form}
          consoleLabelOptions={consoleLabelOptions}
          isSaving={isSaving}
          formError={formError}
          onSave={saveGame}
          onCancel={leaveForm}
        />
      )}
    </>
  )
}

export default GameDrawerContent
