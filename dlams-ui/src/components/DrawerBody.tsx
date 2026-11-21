import type { ReactNode } from "react"

interface DrawerBodyProps {
  children: ReactNode
}

function DrawerBody({ children }: DrawerBodyProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
      {children}
    </div>
  )
}

export default DrawerBody
