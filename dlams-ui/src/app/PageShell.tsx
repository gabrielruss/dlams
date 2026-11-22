import type { ReactNode } from "react"

interface PageShellProps {
  sidebar: ReactNode
  beforeContent?: ReactNode
  children: ReactNode
}

function PageShell({ sidebar, beforeContent, children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {sidebar}
      <main className="min-w-0 flex-1">
        {beforeContent}
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default PageShell
