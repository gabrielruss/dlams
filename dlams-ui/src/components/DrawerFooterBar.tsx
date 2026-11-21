import type { ReactNode } from "react"

import { DrawerFooter } from "@/components/ui/drawer"

interface DrawerFooterBarProps {
  children: ReactNode
}

function DrawerFooterBar({ children }: DrawerFooterBarProps) {
  return <DrawerFooter className="border-t pt-4">{children}</DrawerFooter>
}

export default DrawerFooterBar
