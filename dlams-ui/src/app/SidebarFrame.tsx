import type { ReactNode } from "react"

import HomeLink from "@/components/HomeLink"

interface SidebarFrameProps {
  label: string
  headerStart?: ReactNode
  children: ReactNode
}

function SidebarFrame({ label, headerStart, children }: SidebarFrameProps) {
  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-sidebar px-2 text-sidebar-foreground md:hidden">
        {headerStart}
        <HomeLink
          className="relative block h-9 w-40"
          wordmarkClassName="absolute inset-0"
        />
      </header>
      <aside
        aria-label={label}
        className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground sm:w-64 md:flex"
      >
        <HomeLink
          className="relative block h-[4.75rem] shrink-0 border-b"
          wordmarkClassName="absolute inset-x-4 inset-y-0"
        />
        {children}
      </aside>
    </>
  )
}

export default SidebarFrame
