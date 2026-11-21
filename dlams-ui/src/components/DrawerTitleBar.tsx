import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { DrawerClose, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"

interface DrawerTitleBarProps {
  title: ReactNode
}

function DrawerTitleBar({ title }: DrawerTitleBarProps) {
  return (
    <DrawerHeader className="flex-row items-center justify-between border-b pb-4">
      <DrawerTitle className="text-xl">{title}</DrawerTitle>
      <DrawerClose
        render={
          <Button type="button" variant="outline" aria-label="Close drawer" />
        }
      >
        Close
      </DrawerClose>
    </DrawerHeader>
  )
}

export default DrawerTitleBar
